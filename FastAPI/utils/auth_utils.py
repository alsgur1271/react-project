from fastapi import Depends, HTTPException, status, Request
from typing import Optional

async def get_current_user(request: Request) -> dict:
    """
    현재 인증된 사용자의 정보를 가져오는 함수
    세션과 토큰 기반 인증을 모두 지원합니다.
    
    Args:
        request: FastAPI의 Request 객체
    
    Returns:
        dict: 현재 인증된 사용자 정보 (id, username, email, role 등)
        
    Raises:
        HTTPException: 인증되지 않은 사용자인 경우 401 에러 발생
    """
    # 1. 세션에서 사용자 정보 확인
    session_user = request.session.get("session_user")
    if session_user:
        return session_user
        
    # 2. Authorization 헤더에서 토큰 확인
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        if token:
            # 세션에 토큰 사용자 정보 저장
            request.session["session_user"] = {"id": 1, "role": "teacher"}  # 임시로 교사 정보 반환
            return request.session["session_user"]
    
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="로그인이 필요한 서비스입니다.",
        headers={"WWW-Authenticate": "Bearer"},
    )

def get_optional_user(request: Request) -> Optional[dict]:
    """
    현재 사용자의 정보를 선택적으로 가져오는 함수
    로그인하지 않은 사용자도 접근 가능한 API에서 사용됩니다.
    
    Args:
        request: FastAPI의 Request 객체
    
    Returns:
        Optional[dict]: 로그인된 경우 사용자 정보, 아닌 경우 None
    """
    try:
        return get_current_user(request)
    except HTTPException:
        return None 