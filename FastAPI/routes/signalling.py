from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict

router = APIRouter() #main.py에 연결
connections: Dict[str, WebSocket] = {} #연결 고객들 저장 딕셔너리

@router.websocket("/ws/{peer_id}") #webSocket 경로 지정 /ws/{사용자명}으로 연결
async def websocket_signaling(websocket: WebSocket, peer_id: str): #/ws/{peer_id}로 연결되면 호출되는 핸들러
    await websocket.accept() #서버가 websocket연결 수락
    connections[peer_id] = websocket #연결된 고객들 connections에 저장
    try:
        while True:
            data = await websocket.receive_text() #
            # 예시: "peerB:::json_data"
            to_peer, message = data.split(":::", 1)
            if to_peer in connections:
                await connections[to_peer].send_text(message)
    except WebSocketDisconnect:
        del connections[peer_id]