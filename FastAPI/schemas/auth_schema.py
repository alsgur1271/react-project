from pydantic import BaseModel, EmailStr, Field

class UserData(BaseModel):
    id: int
    username: str
    email: str

    class Config:
        extra = "ignore"  # 👈 알 수 없는 필드는 무시

class UserDataPASS(UserData):
    password: str
    verified: int  # ✅ 추가
    role: str            # ✅ 추가

    class Config:
        extra = "ignore"

##React랑 연결하려고 만든 스키마마
class LoginInput(BaseModel):
    username: str
    password: str


class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=2, max_length=100)
    email: EmailStr = Field(..., description="사용자 이메일")
    password: str = Field(..., min_length=6, max_length=30)
    role: str = Field(..., description="student 또는 teacher 등")
