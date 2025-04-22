from fastapi import APIRouter, Request, Depends, Form, status
from fastapi.responses import RedirectResponse, JSONResponse
from fastapi.exceptions import HTTPException
from fastapi.templating import Jinja2Templates
from db.database import context_get_conn
from services import auth_svc
from schemas.auth_schema import UserDataPASS
from sqlalchemy import Connection
from passlib.context import CryptContext
from pydantic import EmailStr

from schemas.auth_schema import LoginInput, RegisterRequest
from fastapi import Body
import logging

#JWT토큰 생성용 라이브러리
from jose import jwt
from datetime import datetime, timedelta, timezone

logger = logging.getLogger(__name__)

# router 생성
router = APIRouter(prefix="/auth", tags=["auth"])
# # jinja2 Template 엔진 생성
# templates = Jinja2Templates(directory="templates")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_hashed_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)

#JWT토큰 생성 코드
SECRET_KEY = "your_super_secret_key"
ALGORITHM = "HS256"

def create_token(data: dict, expires_delta: timedelta = timedelta(hours=1)):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


#React 로그인
@router.post("/login")
async def login(request: Request,
                login_input: LoginInput,
                conn: Connection = Depends(context_get_conn)):

    userpass = await auth_svc.get_user_by_id(conn=conn, username=login_input.username)
    if userpass is None:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"success": False, "message": "해당 ID 사용자는 존재하지 않습니다."}
        )

    is_correct_pw = verify_password(
        plain_password=login_input.password,
        hashed_password=userpass.password
    )
    if not is_correct_pw:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"success": False, "message": "비밀번호가 일치하지 않습니다."}
        )

    token = create_token({"sub": userpass.id, "username": userpass.username})

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "token": token,
            "user": {
                "id": userpass.id,
                "name": userpass.username,
                "email_verified": userpass.verified,
                "role": userpass.role
            }
        }
    )

# @router.post("/login")
# async def login(request: Request,
#                 login_input: LoginInput,
#                 conn: Connection = Depends(context_get_conn)):
    

#     userpass = await auth_svc.get_user_by_id(conn=conn, username=login_input.username)
#     if userpass is None:
#         return JSONResponse(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             content={"success": False, "message": "해당 ID 사용자는 존재하지 않습니다."}
#         )

#     is_correct_pw = verify_password(
#         plain_password=login_input.password,
#         hashed_password=userpass.password
#     )
#     if not is_correct_pw:
#         return JSONResponse(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             content={"success": False, "message": "비밀번호가 일치하지 않습니다."}
#         )
    
#     #JWT토큰생성
#     token = create_token({"sub": userpass.id, "username": userpass.username})
#     print("✅ 생성된 토큰:", token)

#     request.session["session_user"] = {
#         "id": userpass.id,
#         "name": userpass.username
#     }

#     return JSONResponse(
#         status_code=status.HTTP_200_OK,
#         content={"success": True, "message": "로그인 성공", "user": request.session["session_user"], "token": token }
#     )

#React용으로 수정완
@router.post("/register")
async def register_user_api(
    register_input: RegisterRequest,
    conn: Connection = Depends(context_get_conn)
):

    user = await auth_svc.get_user_by_email(conn=conn, email=register_input.email)
    if user:
        raise HTTPException(status_code=400, detail="이미 등록된 이메일입니다.")

    hashed_password = get_hashed_password(register_input.password)
    await auth_svc.register_user(
        conn=conn,
        name=register_input.username,
        email=register_input.email,
        hashed_password=hashed_password,
        role=register_input.role
    )
    

    return JSONResponse(status_code=200, content={"message": "회원가입 성공!"})






# @router.get("/register")
# async def register_user_ui(request: Request):
#     return templates.TemplateResponse(
#         request=request,
#         name="register_user.html",
#         context={}
#     )

# @router.post("/register")
# async def register_user(name: str = Form(min_length=2, max_length=100),
#                         email: EmailStr = Form(...),
#                         password: str = Form(min_length=2, max_length=30),
#                         conn: Connection = Depends(context_get_conn)):
    
#     user = await auth_svc.get_user_by_email(conn=conn, email=email)
#     if user is not None:
#         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
#                             detail="해당 Email은 이미 등록되어 있습니다. ")
    
#     hashed_password = get_hashed_password(password)
#     await auth_svc.register_user(conn=conn, name=name, email=email, 
#                            hashed_password=hashed_password)
    
#     return RedirectResponse("/blogs", status_code=status.HTTP_302_FOUND)
    
    # auth_svc.register_user_...(conn=conn, name=name, email=email, password=password)

# @router.get("/login")
# async def login_ui(request: Request):
#     return templates.TemplateResponse(
#         request=request,
#         name="login.html",
#         context={}
#     )

# @router.post("/login")
# async def login(request: Request,
#                 email: EmailStr = Form(...),
#                 password: str = Form(min_length=2, max_length=30),
#                 conn: Connection = Depends(context_get_conn)):
#     # 입력 email로 db에 사용자가 등록되어 있는지 확인. 
#     userpass = await auth_svc.get_userpass_by_email(conn=conn, email=email)
#     if userpass is None:
#         raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
#                             detail="해당 이메일 사용자는 존재하지 않습니다.")
    
#     is_correct_pw = verify_password(plain_password=password, 
#                                     hashed_password=userpass.hashed_password)
#     if not is_correct_pw:
#         raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
#                             detail="등록하신 이메일과 패스워드 정보가 입력 정보와 다릅니다.")
#     request.session["session_user"] = {"id": userpass.id, "name": userpass.name,
#                                        "email": userpass.email }
#     # print("request.session:", request.session)
#     return RedirectResponse("/blogs", status_code=status.HTTP_302_FOUND)

@router.get("/logout")
async def logout(request: Request):
    request.session.clear()
    return RedirectResponse("/blogs", status_code=status.HTTP_302_FOUND)

    

    
    
    
    

    
    





    
    
                            






