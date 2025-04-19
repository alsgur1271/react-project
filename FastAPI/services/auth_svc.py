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
