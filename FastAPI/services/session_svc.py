from datetime import datetime
from typing import List
from fastapi import HTTPException, status
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncConnection
from schemas.session_schema import SessionCreate, SessionResponse, SessionStatus, SessionParticipant

async def create_session(conn: AsyncConnection, session_data: SessionCreate, teacher_id: int) -> SessionResponse:
    """
    새로운 수업 세션을 생성하는 함수
    
    Args:
        conn: 데이터베이스 연결 객체
        session_data: 생성할 세션 정보 (제목, 설명, 시작/종료 시간, 학생 목록)
        teacher_id: 세션을 생성하는 선생님의 ID
    
    Returns:
        SessionResponse: 생성된 세션 정보
    """
    try:
        # 교사 권한 확인
        user_query = text("""
            SELECT username, role FROM users 
            WHERE id = :teacher_id AND role = 'teacher'
        """)
        result = await conn.execute(user_query, {"teacher_id": teacher_id})
        user = result.mappings().first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="교사만 세션을 생성할 수 있습니다."
            )

        # room_id 생성 (session_{timestamp} 형식)
        room_id = f"session_{int(datetime.now().timestamp())}"

        # 세션 생성
        session_query = text("""
            INSERT INTO sessions 
            (room_id, teacher_id, title, description, scheduled_start, scheduled_end, status, created_at)
            VALUES 
            (:room_id, :teacher_id, :title, :description, :scheduled_start, :scheduled_end, 'scheduled', CURRENT_TIMESTAMP)
            RETURNING id, created_at
        """)
        
        result = await conn.execute(
            session_query,
            {
                "room_id": room_id,
                "teacher_id": teacher_id,
                "title": session_data.title,
                "description": session_data.description,
                "scheduled_start": session_data.scheduled_start,
                "scheduled_end": session_data.scheduled_end
            }
        )
        session_info = result.mappings().first()

        # 학생들을 세션에 추가
        if session_data.student_ids:
            # 학생 역할 확인
            student_check_query = text("""
                SELECT id FROM users 
                WHERE id = ANY(:student_ids) AND role = 'student'
            """)
            result = await conn.execute(
                student_check_query,
                {"student_ids": session_data.student_ids}
            )
            valid_student_ids = [row[0] for row in result]

            # 유효한 학생들만 세션에 추가
            if valid_student_ids:
                participant_query = text("""
                    INSERT INTO session_participants (session_id, user_id, joined_at)
                    VALUES (:session_id, :user_id, CURRENT_TIMESTAMP)
                """)
                for student_id in valid_student_ids:
                    await conn.execute(
                        participant_query,
                        {"session_id": session_info['id'], "user_id": student_id}
                    )

        await conn.commit()

        return SessionResponse(
            id=session_info['id'],
            title=session_data.title,
            description=session_data.description,
            scheduled_start=session_data.scheduled_start,
            scheduled_end=session_data.scheduled_end,
            status='scheduled',
            created_at=session_info['created_at'],
            teacher_id=teacher_id,
            teacher_name=user['username']
        )

    except Exception as e:
        await conn.rollback()
        print(f"Error creating session: {str(e)}")
        print(f"Session data: {session_data.dict()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"세션 생성 중 오류가 발생했습니다: {str(e)}"
        )

async def join_session(conn: AsyncConnection, session_id: int, user_id: int) -> SessionStatus:
    """
    기존 세션에 참가하는 함수
    
    Args:
        conn: 데이터베이스 연결 객체
        session_id: 참가할 세션의 ID
        user_id: 참가하는 사용자의 ID
    
    Returns:
        SessionStatus: 업데이트된 세션 상태 정보
    """
    try:
        # 세션 상태 확인
        session_query = text("""
            SELECT s.*, u.username as teacher_name
            FROM sessions s
            JOIN users u ON s.teacher_id = u.id
            WHERE s.id = :session_id
        """)
        result = await conn.execute(session_query, {"session_id": session_id})
        session = result.mappings().first()
        
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="세션을 찾을 수 없습니다."
            )
        
        if session['status'] not in ['scheduled', 'active']:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="참여할 수 없는 세션입니다."
            )

        # 참가자의 역할 확인
        user_query = text("""
            SELECT role FROM users WHERE id = :user_id
        """)
        result = await conn.execute(user_query, {"user_id": user_id})
        user = result.mappings().first()

        if not user or user['role'] != 'student':
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="학생만 세션에 참여할 수 있습니다."
            )

        # 이미 참여 중인지 확인
        check_query = text("""
            SELECT 1 FROM session_participants 
            WHERE session_id = :session_id AND user_id = :user_id AND left_at IS NULL
        """)
        result = await conn.execute(check_query, {"session_id": session_id, "user_id": user_id})
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="이미 세션에 참여중입니다."
            )

        # 세션 참여
        join_query = text("""
            INSERT INTO session_participants (session_id, user_id, joined_at)
            VALUES (:session_id, :user_id, CURRENT_TIMESTAMP)
        """)
        await conn.execute(join_query, {"session_id": session_id, "user_id": user_id})

        # 첫 참가자가 참여하면 세션 상태를 'active'로 변경
        if session['status'] == 'scheduled':
            update_query = text("""
                UPDATE sessions SET status = 'active'
                WHERE id = :session_id AND status = 'scheduled'
            """)
            await conn.execute(update_query, {"session_id": session_id})

        await conn.commit()
        return await get_session_status(conn, session_id)

    except HTTPException:
        raise
    except Exception as e:
        await conn.rollback()
        print(f"Error joining session: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="세션 참여 중 오류가 발생했습니다."
        )

async def end_session(conn: AsyncConnection, session_id: int, teacher_id: int) -> SessionStatus:
    """
    세션을 종료하는 함수
    
    Args:
        conn: 데이터베이스 연결 객체
        session_id: 종료할 세션의 ID
        teacher_id: 세션을 종료하는 선생님의 ID
    
    Returns:
        SessionStatus: 업데이트된 세션 상태 정보
    """
    try:
        # 세션과 교사 권한 확인
        session_query = text("""
            SELECT s.*, u.username as teacher_name, u.role
            FROM sessions s
            JOIN users u ON s.teacher_id = u.id
            WHERE s.id = :session_id AND s.teacher_id = :teacher_id
        """)
        result = await conn.execute(
            session_query, 
            {"session_id": session_id, "teacher_id": teacher_id}
        )
        session = result.mappings().first()

        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="세션을 찾을 수 없거나 권한이 없습니다."
            )

        if session['role'] != 'teacher':
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="교사만 세션을 종료할 수 있습니다."
            )

        # 세션 종료
        update_query = text("""
            UPDATE sessions 
            SET status = 'completed', updated_at = CURRENT_TIMESTAMP
            WHERE id = :session_id AND status IN ('scheduled', 'active')
        """)
        await conn.execute(update_query, {"session_id": session_id})

        # 모든 참가자의 left_at 설정
        participant_query = text("""
            UPDATE session_participants
            SET left_at = CURRENT_TIMESTAMP
            WHERE session_id = :session_id AND left_at IS NULL
        """)
        await conn.execute(participant_query, {"session_id": session_id})
        
        await conn.commit()
        return await get_session_status(conn, session_id)

    except HTTPException:
        raise
    except Exception as e:
        await conn.rollback()
        print(f"Error ending session: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="세션 종료 중 오류가 발생했습니다."
        )

async def get_session_status(conn: AsyncConnection, session_id: int) -> SessionStatus:
    """
    세션의 현재 상태와 참가자 정보를 조회하는 함수
    
    Args:
        conn: 데이터베이스 연결 객체
        session_id: 조회할 세션의 ID
    
    Returns:
        SessionStatus: 세션 상태 정보
    """
    try:
        # 세션 정보 조회
        session_query = text("""
            SELECT s.*, u.username as teacher_name
            FROM sessions s
            JOIN users u ON s.teacher_id = u.id
            WHERE s.id = :session_id
        """)
        result = await conn.execute(session_query, {"session_id": session_id})
        session = result.mappings().first()

        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="세션을 찾을 수 없습니다."
            )

        # 현재 참가자 목록 조회
        participants_query = text("""
            SELECT 
                u.id as user_id, 
                u.username, 
                u.email, 
                u.role,
                sp.joined_at, 
                sp.left_at
            FROM session_participants sp
            JOIN users u ON sp.user_id = u.id
            WHERE sp.session_id = :session_id
            ORDER BY sp.joined_at
        """)
        result = await conn.execute(participants_query, {"session_id": session_id})
        participants = result.mappings().all()

        return SessionStatus(
            id=session['id'],
            status=session['status'],
            title=session['title'],
            description=session['description'],
            teacher_id=session['teacher_id'],
            teacher_name=session['teacher_name'],
            scheduled_start=session['scheduled_start'],
            scheduled_end=session['scheduled_end'],
            participants=[SessionParticipant(**p) for p in participants]
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting session status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="세션 상태 조회 중 오류가 발생했습니다."
        ) 