# utils/exception_handlers.py
from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from jose import JWTError

# ✅ 일반 HTTP 예외
async def custom_http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "status_code": exc.status_code,
            "title_message": "문제가 발생했습니다.",
            "detail": exc.detail
        }
    )

# ✅ 입력값 검증 오류
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "status_code": status.HTTP_422_UNPROCESSABLE_ENTITY,
            "title_message": "입력값이 올바르지 않습니다.",
            "detail": exc.errors()
        }
    )

# ✅ JWT 인증 오류 처리 (선택)
async def jwt_exception_handler(request: Request, exc: JWTError):
    return JSONResponse(
        status_code=status.HTTP_401_UNAUTHORIZED,
        content={
            "status_code": status.HTTP_401_UNAUTHORIZED,
            "title_message": "인증 오류",
            "detail": "토큰이 유효하지 않거나 만료되었습니다."
        }
    )

# ✅ 사용자 정의 예외 예시
class CustomPermissionDenied(Exception):
    def __init__(self, message="권한이 없습니다."):
        self.message = message

async def custom_permission_handler(request: Request, exc: CustomPermissionDenied):
    return JSONResponse(
        status_code=status.HTTP_403_FORBIDDEN,
        content={
            "status_code": status.HTTP_403_FORBIDDEN,
            "title_message": "접근 거부",
            "detail": exc.message
        }
    )



# from fastapi import Request, status
# from starlette.exceptions import HTTPException as StarletteHTTPException
# from fastapi.templating import Jinja2Templates
# from fastapi.exceptions import RequestValidationError

# from fastapi.responses import JSONResponse

# templates = Jinja2Templates(directory="templates")

# async def custom_http_exception_handler(request: Request, exc: StarletteHTTPException):
#     return JSONResponse(
#         status_code=exc.status_code,
#         content={
#             "status_code": exc.status_code,
#             "title_message": "불편을 드려 죄송합니다.",
#             "detail": exc.detail
#         }
#     )

# async def validation_exception_handler(request: Request, exc: RequestValidationError):
#     return JSONResponse(
#         status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
#         content={
#             "status_code": status.HTTP_422_UNPROCESSABLE_ENTITY,
#             "title_message": "잘못된 값을 입력하였습니다.",
#             "detail": exc.errors()
#         }
#     )

# # async def custom_http_exception_handler(request: Request, exc: StarletteHTTPException):
# #     return templates.TemplateResponse(
# #         request = request,
# #         name="http_error.html",
# #         context={
# #             "status_code": exc.status_code,
# #             "title_message": "불편을 드려 죄송합니다.",
# #             "detail": exc.detail
# #         },
# #         status_code=exc.status_code
# #     )

# # async def validation_exception_handler(request: Request, exc: RequestValidationError):
# #     return templates.TemplateResponse(
# #         request=request, 
# #         name="validation_error.html",
# #         context = {
# #             "status_code": status.HTTP_422_UNPROCESSABLE_ENTITY,
# #             "title_message": "잘못된 값을 입력하였습니다. 제목은 최소 2자 이상, 200자 미만. 내용은 최소 2자 이상, 4000자 미만입니다.",
# #             "detail": exc.errors()
# #         },
# #         status_code=status.HTTP_422_UNPROCESSABLE_ENTITY
# #     )
