from pydantic import BaseModel

class UserData(BaseModel):
    id: int
    name: str
    email: str
    
class UserDataPASS(UserData):
    hashed_password: str

##React랑 연결하려고 만든 스키마마
class LoginInput(BaseModel):
    id: str
    pwd: str


