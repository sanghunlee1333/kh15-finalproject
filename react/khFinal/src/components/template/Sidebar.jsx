import axios from "axios";
import * as bootstrap from "bootstrap";
import SockJS from "sockjs-client";
import { useEffect, useState } from "react";
import { IoChatbubbles } from "react-icons/io5";
import { RiContactsBook3Fill } from "react-icons/ri";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { userNoState } from "../utils/stroage";
import { Client } from "@stomp/stompjs";
import { CiLogout, CiUser } from "react-icons/ci";

export default function Sidebar() {
    //navigate
    const navigate = useNavigate();
    const location = useLocation();
    //state
    const memberNo = useRecoilValue(userNoState);
    const [rooms, setRooms] = useState([]);
    const [profileImageNo, setProfileImageNo] = useState(null);
    const [memberName, setMemberName] = useState("");

    const handleRoomClick = async (roomNo) => {
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
        catch (error) {
            console.error("채팅방 클릭 시 읽음 처리 실패", error);
        }
    };

    //로그아웃
    const handleLogout = async () => {
        try {
            await axios.delete("/member/logout");
            window.localStorage.removeItem("refreshToken");
            window.sessionStorage.removeItem("refreshToken");
            window.location.href = "/member/login";
        } catch (error) {
            console.error("로그아웃 실패", error);
            alert("로그아웃 중 오류가 발생했습니다.");
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

    //effect
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
        const loadProfileImage = async () => {
            try {
                const { data } = await axios.get(`/mypage/profile/${memberNo}`);
                if (data !== -1) setProfileImageNo(data);
            } catch (err) {
                console.error("프로필 이미지 불러오기 실패", err);
            }
        };
        if (memberNo) loadProfileImage();
    }, [memberNo]);

    useEffect(() => {
        loadRooms();
    }, []);

    const getRoomImageSrc = (room) => {
        const isDirectChat = room.roomProfileNo === null && room.partnerProfileNo !== null;

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

    useEffect(() => {
        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        tooltipTriggerList.forEach(el => {
            if (!bootstrap.Tooltip.getInstance(el)) {
                new bootstrap.Tooltip(el);
            }
        });
    }, []);

    return (
        <div className="sidebar d-flex flex-column" style={{ height: "calc(100vh - 56px)" }}>
            {/* 상단 채팅방 목록 이동 아이콘 */}
            <div className="sidebar-header d-flex flex-column align-items-center mb-1 mt-3">
                <div className="w-75 d-flex justify-content-center">
                    <Link to="/chat/room"
                        data-bs-toggle="tooltip"
                        data-bs-placement="right"
                        title="채팅방"
                        style={{ textDecoration: 'none' }}>
                        <IoChatbubbles size={40} className="primary" />
                    </Link>
                </div>
            </div>

            <hr className="hr-side-stick m-2" />

            {/* 채팅방 목록 */}
            <div className="sidebar-list flex-grow-1 overflow-auto">
                {rooms.map((room) => {
                    const isActiveRoom = location.pathname === `/chat/group/${room.roomNo}`; // ✅ 현재 보고 있는 채팅방 여부

                    return (
                        <div
                            key={room.roomNo}
                            className="sidebar-room"
                            onClick={() => handleRoomClick(room.roomNo)}
                            data-bs-toggle="tooltip"
                            data-bs-placement="right"
                            title={room.roomTitle}
                        >
                            <img
                                src={getRoomImageSrc(room)}
                                alt="room"
                                className="room-img"
                            />

                            {/* 안읽은 메세지 뱃지 */}
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

            <hr className="hr-side-stick m-2" />

            {/* 하단 연락처 아이콘 */}
            <div className="sidebar-footer d-flex flex-column align-items-center mb-3">
                <div className="w-75 mt-1 d-flex justify-content-center">
                    <Link to="/member/contact"
                        data-bs-toggle="tooltip"
                        data-bs-placement="right"
                        title="연락처"
                        style={{ textDecoration: 'none' }}>
                        <RiContactsBook3Fill size={40} className="text-info" />
                    </Link>
                </div>

                {/* 프로필 드롭다운 */}
                <div className="dropdown mt-3 d-flex justify-content-center w-100">
                    <button
                        className="btn btn-outline-secondary dropdown-toggle d-flex align-items-center"
                        type="button"
                        id="profileDropdown"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                        style={{ width: "40px", height: "40px", borderRadius: "50%", padding: 0 }}
                    >
                        <img
                            src={
                                profileImageNo
                                    ? `http://localhost:8080/api/mypage/attachment/${profileImageNo}`
                                    : "/images/profile_basic.png"
                            }
                            alt="프로필"
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                borderRadius: "50%",
                            }}
                        />
                    </button>
                    
                    <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="profileDropdown">
                        <li>
                            <Link className="dropdown-item d-flex align-items-center gap-2" to="/mypage">
                                <CiUser />
                                <span>마이페이지</span>
                            </Link>
                        </li>
                        <li>
                            <button className="dropdown-item d-flex align-items-center gap-2" onClick={handleLogout}>
                                <CiLogout className="fw-bold" />
                                <span>로그아웃</span>
                            </button>
                        </li>
                    </ul>

                </div>

            </div>

        </div>
    );
}
