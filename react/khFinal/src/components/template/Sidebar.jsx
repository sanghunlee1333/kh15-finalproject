import axios from "axios";
import { useEffect, useState } from "react";
import { IoChatbubbles } from "react-icons/io5";
import { RiContactsBook3Fill } from "react-icons/ri";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { userNoState } from "../utils/stroage";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

export default function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation(); // ✅ 현재 경로 확인용
    const memberNo = useRecoilValue(userNoState);
    const [rooms, setRooms] = useState([]);

    const handleRoomClick = async(roomNo) => {
        try {
            //읽음 처리 요청
            await axios.post(`/rooms/${roomNo}/read`, null, {
                headers: {
                    Authorization: axios.defaults.headers.common["Authorization"]
                }
            });

            //사이드바와 채팅방 목록 새로고침
            window.dispatchEvent(new Event("refreshRoomList"));

            //해당 채팅방으로 이동
            navigate(`/chat/group/${roomNo}`);
        }
        catch(e) {
            console.error("채팅방 클릭 시 읽음 처리 실패", error);
        }
    };

    const loadRooms = async () => {
        try {
            const token = axios.defaults.headers.common["Authorization"];
            const { data } = await axios.get("/rooms", {
                headers: { Authorization: token },
            });
            setRooms(data);
        } catch (error) {
            console.error("채팅방 목록 로드 실패", error);
        }
    };

    useEffect(() => {
        if (!memberNo) return;
        const socket = new SockJS("http://localhost:8080/ws");
        const client = new Client({
            webSocketFactory: () => socket,
            onConnect: () => {
                const topic = `/topic/room-list/${memberNo}`;
                client.subscribe(topic, () => {
                    loadRooms();
                });
            }
        });
        client.activate();
        return () => client.deactivate();
    }, [memberNo]);

    useEffect(() => {
        loadRooms();
    }, []);

    const getRoomImageSrc = (room) => {
        const isDirectChat = room.partnerProfileNo !== null && room.partnerProfileNo !== undefined;
        return isDirectChat
            ? `http://localhost:8080/api/mypage/attachment/${room.partnerProfileNo}`
            : (room.roomProfileNo
                ? `http://localhost:8080/api/mypage/attachment/${room.roomProfileNo}`
                : "/images/profile_basic.png");
    };
    
    useEffect(() => {
        const handleRefresh = () => {
            loadRooms();
        };
    
        window.addEventListener("refreshRoomList", handleRefresh);
        return () => window.removeEventListener("refreshRoomList", handleRefresh);
    }, []);

    return (
        <div className="sidebar d-flex flex-column" style={{ height: "calc(100vh - 56px)" }}>
            {/* 상단 채팅방 목록 이동 버튼 */}
            <div className="sidebar-header d-flex flex-column align-items-center mb-2 mt-3">
                <div className="w-75">
                    <Link to="/chat/room" className="btn btn-primary d-flex align-items-center justify-content-center"
                        style={{ height: '50px' }}>
                        <div style={{ width: "36px", height: "36px" }}>
                            <IoChatbubbles size={36} style={{ width: "100%", height: "100%" }} />
                        </div>
                    </Link>
                </div>
            </div>

            <hr className="hr-stick m-1" />

            {/* 채팅방 목록 */}
            <div className="sidebar-list flex-grow-1 overflow-auto">
                {rooms.map((room) => {
                    const isActiveRoom = location.pathname === `/chat/group/${room.roomNo}`; // ✅ 현재 보고 있는 채팅방 여부

                    return (
                        <div
                            key={room.roomNo}
                            className="sidebar-room"
                            onClick={() => handleRoomClick(room.roomNo)}
                        >
                            <img
                                src={getRoomImageSrc(room)}
                                alt="room"
                                className="room-img"
                            />
                            {/* 현재 채팅방이 아니고 안읽은 메시지가 있을 때만 뱃지 표시 */}
                            {!isActiveRoom && room.unreadCount > 0 && (
                                <span className="badge bg-danger rounded-pill small position-absolute"
                                    style={{
                                        bottom: 0,
                                        right: 0,
                                        transform: "translate(35%, 35%)",
                                        zIndex: 10,
                                        padding: "5px 8px",
                                        fontSize: "0.8rem"
                                    }}>
                                    {room.unreadCount}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>

            <hr className="hr-stick m-2" />

            {/* 하단 연락처 버튼 */}
            <div className="sidebar-footer d-flex flex-column align-items-center mb-3">
                <div className="w-75 mt-2">
                    <Link to="/member/contact" className="btn btn-info w-100 d-flex justify-content-center align-items-center"
                        style={{ height: '50px' }}>
                        <RiContactsBook3Fill style={{ fontSize: '30px' }} />
                    </Link>
                </div>
            </div>
        </div>
    );
}
