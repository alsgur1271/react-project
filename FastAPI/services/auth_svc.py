from fastapi import Request, status
from databases import Database
from fastapi.exceptions import HTTPException
from schemas.auth_schema import UserData, UserDataPASS
from schemas.blog_schema import BlogData
from sqlalchemy import text, Connection
from sqlalchemy.exc import SQLAlchemyError
from utils import util
from typing import List
from dotenv import load_dotenv
import os
import time
from datetime import datetime

#React용 및 DB연결에 맞게 SQLALchemy방식으로 변경함
async def get_user_by_id(conn, username: str):
    query = text("SELECT * FROM users WHERE username = :username")
    result = await conn.execute(query, {"username": username})
    row = result.mappings().first()  # dict처럼 접근 가능
    # return row
    if row is None:
        return None

    return UserDataPASS(**row)

# async def get_user_by_id(conn, username: str):
#     query = "SELECT * FROM users WHERE id = :username"
#     return await conn.fetch_one(query, {"username": username})


async def register_user(conn, name: str, email: str, hashed_password: str, role: str):
    query = """
    INSERT INTO users (username, email, password, role)
    VALUES (:username, :email, :password, :role)
    """
    stmt = text(query).bindparams(
        username=name,
        email=email,
        password=hashed_password,
        role=role
    )
    await conn.execute(stmt)
    await conn.commit()

# async def register_user(conn, username: str, hashed_password: str):
#     query = """
#     INSERT INTO users (id, hashed_password)
#     VALUES (:username, :hashed_password)
#     """
#     await conn.execute(query, {
#         "username": username,
#         "hashed_password": hashed_password
#     })




































async def get_user_by_email(conn: Connection, email: str) -> UserData:
    try:
        query = f"""
        SELECT id, username, email from users
        where email = :email
        """
        stmt = text(query)
        bind_stmt = stmt.bindparams(email=email)
        result = await conn.execute(bind_stmt)
        # 만약에 한건도 찾지 못하면 None을 던진다. 
        if result.rowcount == 0:
            return None

        row = result.fetchone()
        user = UserData(id=row[0], name=row[1], email=row[2])
        
        # result.close() #생략 가능. wait conn.execute니까

        return user
    
    except SQLAlchemyError as e:
        print(e)
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                            detail="요청하신 서비스가 잠시 내부적으로 문제가 발생하였습니다.")
    except Exception as e:
        print(e)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                            detail="알수없는 이유로 서비스 오류가 발생하였습니다")
    
async def get_userpass_by_email(conn: Connection, email: str) -> UserDataPASS:
    try:
        query = f"""
        SELECT id, name, email, hashed_password from users
        where email = :email
        """
        stmt = text(query)
        bind_stmt = stmt.bindparams(email=email)
        result = await conn.execute(bind_stmt)
        # 만약에 한건도 찾지 못하면 None을 던진다. 
        if result.rowcount == 0:
            return None

        row = result.fetchone()
        userpass = UserDataPASS(id=row[0], name=row[1], email=row[2]
                            , hashed_password=row[3])
        
        result.close()
        return userpass
    
    except SQLAlchemyError as e:
        print(e)
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                            detail="요청하신 서비스가 잠시 내부적으로 문제가 발생하였습니다.")
    except Exception as e:
        print(e)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                            detail="알수없는 이유로 서비스 오류가 발생하였습니다")


# async def register_user(conn: Connection, name: str, email:str, hashed_password: str):
#     try:
#         query = f"""
#         INSERT INTO users(name, email, hashed_password)
#         values ('{name}', '{email}', '{hashed_password}')        
#         """
#         print("query:", query)
#         await conn.execute(text(query))
#         await conn.commit()
        
#     except SQLAlchemyError as e:
#         print(e)
#         await conn.rollback()
#         raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
#                             detail="요청하신 서비스가 잠시 내부적으로 문제가 발생하였습니다.")
    
def get_session(request: Request):
    return request.session

def get_session_user_opt(request: Request):
    if "session_user" in request.session.keys():
        return request.session["session_user"]
    
def get_session_user_prt(request: Request):
    if "session_user" not in request.session.keys():
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="해당 서비스는 로그인이 필요합니다.")
    return request.session["session_user"]
   
def check_valid_auth(session_user: dict, blog_author_id: int, blog_email: str):
    if session_user is None:
        return False
    if ((session_user["id"] == blog_author_id) and (session_user["email"] == blog_email)):
        return True
    return False

async def create_session(conn: Connection, teacher_id: int, title: str, description: str, 
                        scheduled_start: datetime, scheduled_end: datetime):
    try:
        # 먼저 사용자가 교사인지 확인
        user_query = text("SELECT role FROM users WHERE id = :teacher_id")
        result = await conn.execute(user_query, {"teacher_id": teacher_id})
        user_role = result.scalar()
        
        if not user_role or user_role != 'teacher':
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="교사만 세션을 생성할 수 있습니다."
            )

        query = text("""
            INSERT INTO sessions (teacher_id, title, description, scheduled_start, scheduled_end, status)
            VALUES (:teacher_id, :title, :description, :scheduled_start, :scheduled_end, 'scheduled')
            RETURNING id
        """)
        result = await conn.execute(
            query,
            {
                "teacher_id": teacher_id,
                "title": title,
                "description": description,
                "scheduled_start": scheduled_start,
                "scheduled_end": scheduled_end
            }
        )
        session_id = result.scalar_one()
        await conn.commit()
        return session_id
    except SQLAlchemyError as e:
        print(e)
        await conn.rollback()
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="세션 생성 중 오류가 발생했습니다."
        )

async def join_session(conn: Connection, user_id: int, session_id: int):
    try:
        # 세션 존재 여부와 상태 확인
        check_query = text("""
            SELECT id FROM session_participants 
            WHERE user_id = :user_id AND session_id = :session_id AND left_at IS NULL
        """)
        result = await conn.execute(check_query, {"user_id": user_id, "session_id": session_id})
        
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="이미 세션에 참여중입니다."
            )

        query = text("""
            INSERT INTO session_participants (user_id, session_id, joined_at)
            VALUES (:user_id, :session_id, CURRENT_TIMESTAMP)
        """)
        await conn.execute(query, {"user_id": user_id, "session_id": session_id})
        await conn.commit()
    except SQLAlchemyError as e:
        print(e)
        await conn.rollback()
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="세션 참여 중 오류가 발생했습니다."
        )

async def leave_session(conn: Connection, user_id: int, session_id: int):
    try:
        query = text("""
            UPDATE session_participants 
            SET left_at = CURRENT_TIMESTAMP
            WHERE user_id = :user_id AND session_id = :session_id AND left_at IS NULL
        """)
        result = await conn.execute(query, {"user_id": user_id, "session_id": session_id})
        await conn.commit()
        
        if result.rowcount == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="활성화된 세션 참여 기록을 찾을 수 없습니다."
            )
    except SQLAlchemyError as e:
        print(e)
        await conn.rollback()
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="세션 나가기 중 오류가 발생했습니다."
        )

async def get_active_session(conn: Connection, user_id: int):
    try:
        query = text("""
            SELECT s.*, u.username as teacher_name
            FROM sessions s
            JOIN users u ON s.teacher_id = u.id
            JOIN session_participants sp ON s.id = sp.session_id
            WHERE sp.user_id = :user_id 
            AND sp.left_at IS NULL
            AND s.status = 'active'
        """)
        result = await conn.execute(query, {"user_id": user_id})
        session = result.mappings().first()
        return session
    except SQLAlchemyError as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="세션 정보 조회 중 오류가 발생했습니다."
        )

async def get_session_participants(conn: Connection, session_id: int):
    try:
        query = text("""
            SELECT u.id, u.username, u.email, u.role, sp.joined_at
            FROM session_participants sp
            JOIN users u ON sp.user_id = u.id
            WHERE sp.session_id = :session_id AND sp.left_at IS NULL
        """)
        result = await conn.execute(query, {"session_id": session_id})
        participants = result.mappings().all()
        return participants
    except SQLAlchemyError as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="참여자 정보 조회 중 오류가 발생했습니다."
        )
