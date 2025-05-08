import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { FaArrowTurnUp, FaPlus } from "react-icons/fa6";
import { IoArrowBack } from "react-icons/io5";
import { PiUserList } from "react-icons/pi";
import { Link, useParams } from "react-router-dom";
import SockJS from 'sockjs-client';
import { Client } from "@stomp/stompjs";
import { userNoState } from "../utils/stroage";
import { useRecoilValue } from "recoil";
import dayjs from "dayjs";
import "dayjs/locale/ko"; // 한글 로케일 불러오기
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime); // 상대 시간 사용 가능하게 확장
dayjs.locale("ko");         // 한글로 설정


export default function GroupChat() {

    //recoil
    const memberNo = useRecoilValue(userNoState);

    //ref
    const chatBoxRef = useRef(null);

    const { roomNo } = useParams();
    //state
    const [roomTitle, setRoomTitle] = useState("");
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [client, setClient] = useState(null);

    const token = localStorage.getItem("refreshToken") || sessionStorage.getItem("refreshToken");

    const handleSendMessage = () => {
        if (newMessage.trim()) {
            const message = {
                roomChatOrigin: roomNo,
                content: newMessage,
            };

            if (client?.connected) {
                client.publish({
                    destination: `/app/chat/${roomNo}`,
                    body: JSON.stringify(message),
                    headers: {
                        accessToken: token,
                    },
                });
                setNewMessage("");
            }
        }
    };

    //callback
    const isSenderVisible = useCallback((messages, index, memberNo) => {
        const current = messages[index];
        if (Number(current.senderNo) === Number(memberNo)) return false;
        if (index === 0) return true;

        const prev = messages[index - 1];
        const sameSender = current.senderNo === prev.senderNo;
        const sameTime =
            new Date(current.time).toLocaleString().slice(0, 16) ===
            new Date(prev.time).toLocaleString().slice(0, 16);

        return !(sameSender && sameTime);
    }, []);

    const isLastMessage = useCallback((messages, index) => {
        if (index === messages.length - 1) return true;

        const current = messages[index];
        const next = messages[index + 1];

        const sameSender = current.senderNo === next.senderNo;
        const sameTime =
            dayjs(current.time).format("YYYY-MM-DD HH:mm") ===
            dayjs(next.time).format("YYYY-MM-DD HH:mm");

        return !(sameSender && sameTime);
    }, []);

    //effect
    useEffect(() => {
        const socket = new SockJS("http://localhost:8080/ws");
        const stompClient = new Client({
            webSocketFactory: () => socket,
            connectHeaders: {
                accessToken: token,
            },
            onConnect: () => {
                stompClient.subscribe(`/public/chat/${roomNo}`, message => {
                    const chat = JSON.parse(message.body);
                    setMessages(prev => [...prev, chat]);
                }, {
                    accessToken: token
                });
            },
        });

        setClient(stompClient);
        stompClient.activate();

        return () => stompClient.deactivate();
    }, [roomNo]);

    useEffect(() => {
        axios.get(`/chat/recent/${roomNo}`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(response => {
            if (response.data?.roomTitle) setRoomTitle(response.data.roomTitle);
            if (Array.isArray(response.data?.messages)) setMessages(response.data.messages);
        }).catch(err => {
            console.error("채팅방 정보를 불러오지 못했습니다", err);
        });
    }, [roomNo]);

    //메세지 읽음 처리(입장, 퇴장)
    useEffect(()=>{
        const token = localStorage.getItem("refreshToken") || sessionStorage.getItem("refreshToken");
        //입장 시 읽음 처리
        axios.post(`/rooms/${roomNo}/read`, null, {
            headers: {Authorization: `Bearer ${token}`}
        });
        //나갈 때도 읽음 처리 (뒤로가기포함)
        return ()=>{
            axios.post(`/rooms/${roomNo}/read`, null, {
                headers: {Authorization: `Bearer ${token}`}
            });
        };
    }, [roomNo]);

    const handleKeyPress = (e) => {
        if (e.key === "Enter") handleSendMessage();
    };

    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    }, [messages]);

    //시간 포맷 함수
    const formatTime = (time) => {
        return dayjs(time).format("A h:mm");
    };

    //view
    return (<>
        <div className="row mt-2">
            <div className="col">
                <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                        <Link to="/chat/room" className="btn p-0 me-2">
                            <IoArrowBack className="fs-3" />
                        </Link>
                        <h5 className="mb-0 text-nowrap">{roomTitle}</h5>
                    </div>
                    <button className="btn btn-sm me-2">
                        <PiUserList className="fs-4" />
                    </button>
                </div>
            </div>
        </div>

        <hr className="hr-stick" />

        <div className="chat-container">
            <div className="chat-messages" ref={chatBoxRef}>
                {messages.map((msg, index) => {
                    if (!msg || !msg.content?.trim()) return null;

                    const isMine = String(msg.senderNo) === String(memberNo);
                    const showSender = isSenderVisible(messages, index, memberNo);
                    const showTime = isLastMessage(messages, index);
                    const time = formatTime(msg.time);

                    return (
                        <div
                            key={index}
                            className={`d-flex flex-column ${isMine ? "align-items-end" : "align-items-start"} mb-2`}
                        >
                            {!isMine && showSender && msg.senderName && (
                                <div className="small fw-bold ps-1 mb-1">{msg.senderName}</div>
                            )}

                            <div className={`d-flex ${isMine ? "flex-row-reverse" : "flex-row"} align-items-end`}>
                                {/* 말풍선 */}
                                <div className={isMine ? "message-bubble-me" : "message-bubble"}>
                                    {msg.content}
                                </div>

                                {/* 시간 */}
                                {showTime && (
                                    <div className={`message-time-corner ${isMine ? "me" : "other"}`}>
                                        {time}
                                    </div>
                                )}
                            </div>
                        </div>

                    );
                })}

            </div>

            <hr/>

            <div className="mt-auto mb-3 m-3">
                <div className="d-flex align-items-center">
                    <button className="btn btn-dark me-2 d-flex align-items-center justify-content-center px-2">
                        <FaPlus />
                    </button>

                    <input
                        type="text"
                        className="form-control"
                        placeholder="채팅 입력"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={handleKeyPress}
                    />

                    <button className="btn btn-primary ms-2 text-nowrap" onClick={handleSendMessage}>
                        <FaArrowTurnUp />
                    </button>
                </div>
            </div>
        </div>

    </>
    );
}
