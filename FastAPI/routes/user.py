from fastapi import APIRouter, Request, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncConnection
from sqlalchemy import text
from db.database import context_get_conn
from utils.auth_utils import get_current_user
from typing import List
from pydantic import BaseModel

#react에서 접근성 요구를 하는데 아직 이해X 이걸 왜 요청하는 거지지
router = APIRouter(prefix="/users")

class StudentIds(BaseModel):
    student_ids: List[int]

@router.get("/accessibility")
async def get_accessibility_settings():
    # 나중에는 사용자별 설정을 DB에서 불러올 수도 있음
    return JSONResponse(content={
        "fontSize": "medium",
        "highContrast": False,
        "reducedMotion": False
    })

@router.get("/profile")
async def get_profile(request: Request):
    session_user = request.session.get("session_user")
    if not session_user:
        return JSONResponse(status_code=401, content={"message": "로그인 필요"})

    return JSONResponse(content={"user": session_user})

@router.get("/teacher/students")
async def get_teacher_students(
    current_user = Depends(get_current_user),
    conn: AsyncConnection = Depends(context_get_conn)
):
    """
    현재 로그인한 선생님에게 할당된 학생 목록을 가져옵니다.
    """
    if current_user['role'] != 'teacher':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="선생님만 접근할 수 있습니다."
        )
    
    try:
        query = text("""
            SELECT u.id, u.username, u.email
            FROM users u
            JOIN teacher_students ts ON u.id = ts.student_id
            WHERE ts.teacher_id = :teacher_id
            AND u.role = 'student'
            ORDER BY u.username
        """)
        
        result = await conn.execute(query, {"teacher_id": current_user['id']})
        students = result.mappings().all()
        
        return [dict(student) for student in students]
        
    except Exception as e:
        print(f"학생 목록 조회 오류: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="학생 목록을 가져오는 중 오류가 발생했습니다."
        )

@router.get("/available-students")
async def get_available_students(
    current_user = Depends(get_current_user),
    conn: AsyncConnection = Depends(context_get_conn)
):
    """
    아직 현재 선생님에게 할당되지 않은 학생 목록을 가져옵니다.
    """
    if current_user['role'] != 'teacher':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="선생님만 접근할 수 있습니다."
        )
    
    try:
        query = text("""
            SELECT u.id, u.username, u.email
            FROM users u
            WHERE u.role = 'student'
            AND NOT EXISTS (
                SELECT 1 FROM teacher_students ts
                WHERE ts.student_id = u.id
                AND ts.teacher_id = :teacher_id
            )
            ORDER BY u.username
        """)
        
        result = await conn.execute(query, {"teacher_id": current_user['id']})
        students = result.mappings().all()
        
        return [dict(student) for student in students]
        
    except Exception as e:
        print(f"가용 학생 목록 조회 오류: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="가용 학생 목록을 가져오는 중 오류가 발생했습니다."
        )

@router.post("/teacher/students")
async def add_teacher_students(
    student_ids: StudentIds,
    current_user = Depends(get_current_user),
    conn: AsyncConnection = Depends(context_get_conn)
):
    """
    선생님에게 여러 학생을 할당합니다.
    """
    if current_user['role'] != 'teacher':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="선생님만 접근할 수 있습니다."
        )
    
    try:
        # 학생 역할 확인
        check_query = text("""
            SELECT id FROM users 
            WHERE id = ANY(:student_ids) 
            AND role = 'student'
        """)
        result = await conn.execute(check_query, {"student_ids": student_ids.student_ids})
        valid_student_ids = [row[0] for row in result]

        if not valid_student_ids:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="유효한 학생이 없습니다."
            )

        # 이미 할당된 학생 제외
        existing_query = text("""
            SELECT student_id FROM teacher_students
            WHERE teacher_id = :teacher_id
            AND student_id = ANY(:student_ids)
        """)
        result = await conn.execute(
            existing_query,
            {
                "teacher_id": current_user['id'],
                "student_ids": valid_student_ids
            }
        )
        existing_ids = [row[0] for row in result]
        new_student_ids = [id for id in valid_student_ids if id not in existing_ids]

        if new_student_ids:
            # 새로운 학생들 할당
            insert_query = text("""
                INSERT INTO teacher_students (teacher_id, student_id, created_at)
                VALUES (:teacher_id, :student_id, CURRENT_TIMESTAMP)
            """)
            for student_id in new_student_ids:
                await conn.execute(
                    insert_query,
                    {"teacher_id": current_user['id'], "student_id": student_id}
                )

        await conn.commit()
        return {"message": f"{len(new_student_ids)}명의 학생이 추가되었습니다."}

    except HTTPException:
        await conn.rollback()
        raise
    except Exception as e:
        await conn.rollback()
        print(f"학생 할당 오류: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="학생 할당 중 오류가 발생했습니다."
        )

@router.delete("/teacher/students/{student_id}")
async def remove_teacher_student(
    student_id: int,
    current_user = Depends(get_current_user),
    conn: AsyncConnection = Depends(context_get_conn)
):
    """
    선생님에게서 학생을 제거합니다.
    """
    if current_user['role'] != 'teacher':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="선생님만 접근할 수 있습니다."
        )
    
    try:
        query = text("""
            DELETE FROM teacher_students
            WHERE teacher_id = :teacher_id
            AND student_id = :student_id
        """)
        
        result = await conn.execute(
            query,
            {
                "teacher_id": current_user['id'],
                "student_id": student_id
            }
        )
        
        if result.rowcount == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="해당 학생을 찾을 수 없습니다."
            )
        
        await conn.commit()
        return {"message": "학생이 제거되었습니다."}
        
    except HTTPException:
        await conn.rollback()
        raise
    except Exception as e:
        await conn.rollback()
        print(f"학생 제거 오류: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="학생 제거 중 오류가 발생했습니다."
        )