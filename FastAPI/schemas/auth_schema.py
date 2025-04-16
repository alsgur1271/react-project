from pydantic import BaseModel, EmailStr

class UserData(BaseModel):
    id: int
    name: str
    email: str
    
class UserDataPASS(UserData):
    hashed_password: str



