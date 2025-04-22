from fastapi import APIRouter, HTTPException, status, Depends, Request
from services.session_svc import create_session, join_session, end_session, get_session_status
from schemas.session_schema import SessionCreate, SessionResponse, SessionStatus
from db.database import context_get_conn
from sqlalchemy.ext.asyncio import AsyncConnection
from utils.auth_utils import get_current_user
from sqlalchemy import text
from datetime import datetime
from typing import List

# 세션 관련 API 라우터 생성
router = APIRouter(
    prefix="/sessions",  # 모든 엔드포인트는 /session로 시작
    tags=["sessions"]   # API 문서에서 sessions 그룹으로 표시
)

@router.post("/", response_model=SessionResponse)
async def create_session_endpoint(
    request: Request,
    session_data: SessionCreate,
    conn: AsyncConnection = Depends(context_get_conn)
):
    """
    새로운 수업 세션을 생성하는 엔드포인트
    
    Args:
        session_data: 세션 생성에 필요한 데이터
            - title: 수업 제목
            - description: 수업 설명 (선택)
            - scheduled_start: 시작 예정 시간
            - scheduled_end: 종료 예정 시간
            - student_ids: 참가할 학생 ID 목록
    """
    current_user = await get_current_user(request)
    return await create_session(conn, session_data, current_user['id'])

@router.post("/{session_id}/join", response_model=SessionStatus)
async def join_session_endpoint(
    request: Request,
    session_id: int,
    conn: AsyncConnection = Depends(context_get_conn)
):
    """
    기존 세션에 참가하는 엔드포인트
    
    Args:
        session_id: 참가할 세션 ID
    """
    current_user = await get_current_user(request)
    return await join_session(conn, session_id, current_user['id'])

@router.post("/{session_id}/end", response_model=SessionStatus)
async def end_session_endpoint(
    request: Request,
    session_id: int,
    conn: AsyncConnection = Depends(context_get_conn)
):
    """
    세션을 종료하는 엔드포인트
    
    Args:
        session_id: 종료할 세션 ID
    """
    current_user = await get_current_user(request)
    return await end_session(conn, session_id, current_user['id'])

@router.get("/{session_id}/status", response_model=SessionStatus)
async def get_session_status_endpoint(
    request: Request,
    session_id: int,
    conn: AsyncConnection = Depends(context_get_conn)
):
    """
    세션의 현재 상태를 조회하는 엔드포인트
    
    Args:
        session_id: 조회할 세션 ID
    """
    current_user = await get_current_user(request)
    return await get_session_status(conn, session_id)

@router.get("/upcoming", response_model=List[SessionResponse])
async def get_upcoming_sessions(
    current_user = Depends(get_current_user),
    conn: AsyncConnection = Depends(context_get_conn)
):
    """
    예정된 세션 목록을 가져오는 엔드포인트
    """
    try:
        query = text("""
            SELECT s.*, u.username as teacher_name
            FROM sessions s
            JOIN users u ON s.teacher_id = u.id
            WHERE s.status = 'scheduled'
            AND s.scheduled_start > CURRENT_TIMESTAMP
            AND (
                s.teacher_id = :user_id
                OR EXISTS (
                    SELECT 1 FROM session_participants sp
                    WHERE sp.session_id = s.id
                    AND sp.user_id = :user_id
                )
            )
            ORDER BY s.scheduled_start
        """)
        
        result = await conn.execute(query, {"user_id": current_user.id})
        sessions = result.mappings().all()
        
        return [dict(session) for session in sessions]
        
    except Exception as e:
        print(f"예정된 세션 조회 오류: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="예정된 세션 목록을 가져오는 중 오류가 발생했습니다."
        )

@router.get("/active", response_model=List[SessionResponse])
async def get_active_sessions(
    current_user = Depends(get_current_user),
    conn: AsyncConnection = Depends(context_get_conn)
):
    """
    현재 진행 중인 세션 목록을 가져오는 엔드포인트
    """
    try:
        query = text("""
            SELECT s.*, u.username as teacher_name
            FROM sessions s
            JOIN users u ON s.teacher_id = u.id
            WHERE s.status = 'active'
            AND (
                s.teacher_id = :user_id
                OR EXISTS (
                    SELECT 1 FROM session_participants sp
                    WHERE sp.session_id = s.id
                    AND sp.user_id = :user_id
                )
            )
            ORDER BY s.scheduled_start
        """)
        
        result = await conn.execute(query, {"user_id": current_user.id})
        sessions = result.mappings().all()
        
        return [dict(session) for session in sessions]
        
    except Exception as e:
        print(f"진행 중인 세션 조회 오류: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="진행 중인 세션 목록을 가져오는 중 오류가 발생했습니다."
        )

@router.get("/teacher")
async def get_teacher_sessions(
    current_user = Depends(get_current_user),
    conn: AsyncConnection = Depends(context_get_conn)
):
    """
    현재 로그인한 교사의 모든 세션을 가져옵니다.
    """
    if current_user['role'] != 'teacher':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="선생님만 접근할 수 있습니다."
        )
    
    try:
        query = text("""
            SELECT 
                s.*,
                u.username as teacher_name,
                (
                    SELECT COUNT(*)
                    FROM session_participants sp
                    WHERE sp.session_id = s.id
                ) as student_count
            FROM sessions s
            JOIN users u ON s.teacher_id = u.id
            WHERE s.teacher_id = :teacher_id
            ORDER BY 
                CASE s.status
                    WHEN 'active' THEN 1
                    WHEN 'scheduled' THEN 2
                    ELSE 3
                END,
                s.scheduled_start DESC
        """)
        
        result = await conn.execute(query, {"teacher_id": current_user['id']})
        sessions = result.mappings().all()
        
        return [dict(session) for session in sessions]
        
    except Exception as e:
        print(f"교사 세션 목록 조회 오류: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="세션 목록을 가져오는 중 오류가 발생했습니다."
        ) 