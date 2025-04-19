from fastapi import APIRouter, Request, Depends, Form, status
from fastapi.responses import RedirectResponse, JSONResponse
from fastapi.exceptions import HTTPException

from db.database import context_get_conn
from services import auth_svc
from schemas.api_schema import UserDataPASS, LoginInput
from sqlalchemy import Connection
from passlib.context import CryptContext

from pydantic import EmailStr
from fastapi import Body
from schemas.api_schema import UserRegisterRequest


# router 생성
router = APIRouter(prefix="/api", tags=["api"])
##jinja나중에 react랑 합치면 필요없음
# jinja2 Template 엔진 생성

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_hashed_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)

##추가 완완
@router.post("/register")
async def register_user(user: UserRegisterRequest,
                        conn = Depends(context_get_conn)):

    # 아이디 중복 체크
    existing_user = await auth_svc.get_user_by_id(conn=conn, user_id=user.id)
    if existing_user is not None:
        raise HTTPException(status_code=400, detail="이미 등록된 ID입니다.")

    # 비밀번호 해시
    hashed_password = get_hashed_password(user.password)

    # 사용자 등록
    await auth_svc.register_user(conn=conn,
                                 user_id=user.id,
                                 hashed_password=hashed_password)

    return {"message": "회원가입 성공!"}

# @router.post("/login")
# async def login(request: Request,
#                 data: LoginInput,
#                 conn = Depends(context_get_conn)):
#     user_id = data.id
#     password = data.password

#     # 아이디로 사용자 조회
#     userpass = await auth_svc.get_user_by_id(conn=conn, user_id=user_id)
#     if userpass is None:
#         raise HTTPException(status_code=401, detail="존재하지 않는 사용자입니다.")

#     # 비밀번호 확인
#     if not verify_password(password, userpass.hashed_password):
#         raise HTTPException(status_code=401, detail="비밀번호가 일치하지 않습니다.")

#     # 세션에 사용자 정보 저장
#     request.session["session_user"] = {
#         "id": userpass.id,
#         "name": userpass.name  # name이 없다면 그냥 id만 넣어도 됨
#     }

#     return JSONResponse(status_code=200, content={
#         "message": "로그인 성공",
#         "user": {
#             "id": userpass.id,
#             "name": userpass.name
#         }
#     })

@router.get("/logout")
async def logout(request: Request):
    request.session.clear()
    return JSONResponse(content={"message": "로그아웃 성공!"})

# @router.post("/login")
# async def login(request: Request,
#                 data: LoginInput,
#                 conn: Connection = Depends(context_get_conn)):
#     email = data.email
#     password = data.password

#     # 사용자 조회
#     userpass = await auth_svc.get_userpass_by_email(conn=conn, email=email)
#     if userpass is None:
#         raise HTTPException(status_code=401, detail="해당 이메일 사용자는 존재하지 않습니다.")

#     # 비밀번호 검증
#     is_correct_pw = verify_password(plain_password=password,
#                                     hashed_password=userpass.hashed_password)
#     if not is_correct_pw:
#         raise HTTPException(status_code=401, detail="비밀번호가 일치하지 않습니다.")

#     # 세션에 사용자 정보 저장 (쿠키 기반 로그인 유지)
#     request.session["session_user"] = {
#         "id": userpass.id,
#         "name": userpass.name,
#         "email": userpass.email
#     }

#     return JSONResponse(status_code=200, content={
#         "message": "로그인 성공",
#         "user": {
#             "id": userpass.id,
#             "name": userpass.name,
#             "email": userpass.email
#         }
#     })



# @router.post("/login")
# async def login(data: LoginInput, conn: Connection = Depends(context_get_conn)):
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




# @router.get("/logout")
# async def logout(request: Request):
#     request.session.clear()
#     return RedirectResponse("/blogs", status_code=status.HTTP_302_FOUND)

    

    
    
    
    

    
    





    
    
                            






