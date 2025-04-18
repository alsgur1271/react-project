from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

#react에서 접근성 요구를 하는데 아직 이해X 이걸 왜 요청하는 거지지
router = APIRouter(prefix="/users")

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