# signaling/sio_server.py
import socketio

# Socket.IO 서버 인스턴스 생성
sio = socketio.AsyncServer(cors_allowed_origins="*", async_mode="asgi")

# 클라이언트 연결
@sio.event
async def connect(sid, environ):
    print(f"[접속됨] {sid}")

# 클라이언트 연결 종료
@sio.event
async def disconnect(sid):
    print(f"[연결 종료] {sid}")

# 인증 이벤트 처리 (옵션)
@sio.event
async def authenticate(sid, token):
    print(f"[인증 토큰 수신] {token}")
    # JWT 검증 로직 가능

# Offer 전송
@sio.event
async def offer(sid, data):
    print(f"[OFFER] {sid} → {data['target']}")
    await sio.emit("offer", {
        "from": sid,
        "payload": data["payload"]
    }, to=data["target"])

# Answer 전송
@sio.event
async def answer(sid, data):
    print(f"[ANSWER] {sid} → {data['target']}")
    await sio.emit("answer", {
        "from": sid,
        "payload": data["payload"]
    }, to=data["target"])

# ICE Candidate 전송
@sio.event
async def candidate(sid, data):
    print(f"[CANDIDATE] {sid} → {data['target']}")
    await sio.emit("candidate", {
        "from": sid,
        "payload": data["payload"]
    }, to=data["target"])