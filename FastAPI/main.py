from fastapi import FastAPI
from starlette.exceptions import HTTPException as StarletteHTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from routes import blog, auth, signalling
from utils.common import lifespan
from utils import exc_handler, middleware
from dotenv import load_dotenv
import os

app = FastAPI(lifespan=lifespan)

app.mount("/static", StaticFiles(directory="static"), name="static")

#미들웨어 추가함수
app.add_middleware(CORSMiddleware, 
                   allow_origins=["http://localhost:8080", "http://localhost:3000", 
                                  "http://127.0.0.1:8080", "http://127.0.0.1:3000",
                                  "http://192.168.0.7:8080"],
                   allow_methods=["*"],
                   allow_headers=["*"],
                   allow_credentials=True,
                   max_age=-1)
# SessionMiddleware에 적용할 sign용 SECRET KEY 가져옴. 
load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")
# signed cookie 적용. 
app.add_middleware(SessionMiddleware, secret_key=SECRET_KEY, max_age=3600)

app.add_middleware(middleware.MethodOverrideMiddlware)

app.include_router(blog.router)
app.include_router(auth.router)
app.include_router(signalling.router) #signalling 서버버

app.add_exception_handler(StarletteHTTPException, exc_handler.custom_http_exception_handler)
app.add_exception_handler(RequestValidationError, exc_handler.validation_exception_handler)