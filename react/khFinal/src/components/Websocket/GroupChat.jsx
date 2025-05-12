import axios from "axios";
import { Modal } from "bootstrap";
import { useCallback, useEffect, useRef, useState } from "react";
import { FaArrowTurnUp, FaMagnifyingGlass, FaPlus } from "react-icons/fa6";
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
import { IoMdPhonePortrait } from "react-icons/io";

dayjs.extend(relativeTime); // 상대 시간 사용 가능하게 확장
dayjs.locale("ko");         // 한글로 설정


export default function GroupChat() {

    //recoil
    const memberNo = useRecoilValue(userNoState);

    //ref
    const chatBoxRef = useRef(null);
    //모달을 제어하기 위한 ref
    //기존 멤버 모달
    const modal = useRef();
    //연락처 목록 띄워서 초대하기 모달
    const modalInvite = useRef();
    const { roomNo } = useParams();

    //state
    const [roomTitle, setRoomTitle] = useState("");
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [client, setClient] = useState(null);
    const [members, setMembers] = useState([]);//채팅방에 속해 있는 멤버 목록

    //연락처 목록
    const [groupContacts, setGroupContacts] = useState({});//전체 연락처
    //연락처 검색
    const [searchContacts, setSearchContacts] = useState("");
    const [filterContacts, setFilterContacts] = useState({});//필터링된 연락처
    const [noResults, setNoResults] = useState(null); // 검색 결과가 없을 때의 상태
    //채팅에 초대할 선택된 멤버 추적
    const [selectMembers, setSelectMembers] = useState([]);
    const [noResultsType, setNoResultsType] = useState(null);

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

    //서버에 멤버 추가
    const handleInviteMembers = async () => {
        try {
            if (selectMembers.length === 0) {
                alert("초대할 대화상대를 선택하세요");
                return;
            }

            const token = localStorage.getItem("refreshToken") || sessionStorage.getItem("refreshToken");

            await axios.post(`/rooms/${roomNo}/invite`, {
                memberNos: selectMembers
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // 초대한 후 연락처 다시 불러오기 (초대된 사람 제외됨)
            await loadContacts();
            setSelectMembers([]); // 선택 초기화
            closeInviteModal();
        }
        catch (error) {
            console.error("초대 실패", error);
            alert("초대에 실패했습니다");
        }
    };

    //callback
    //연락처 검색
    const searchContact = useCallback((contacts = groupContacts) => {
        const filtered = {};
        let found = false;

        if (searchContacts) {
            const isDepartmentSearch = Object.keys(contacts).some(dept =>
                dept.includes(searchContacts)
            );

            Object.keys(contacts).forEach(dept => {
                const matches = isDepartmentSearch
                    ? dept.includes(searchContacts)
                        ? contacts[dept]
                        : []
                    : contacts[dept].filter(c =>
                        c.memberName.includes(searchContacts)
                    );

                if (matches.length > 0) {
                    filtered[dept] = matches;
                    found = true;
                }
            });

            setFilterContacts(filtered);
            setNoResultsType(found ? "" : "none");
        } else {
            setFilterContacts(contacts);
            setNoResultsType("");
        }

        setSearchContacts("");
    }, [searchContacts, groupContacts]);

    const loadRoomMembers = useCallback(async () => {
        try {
            const token = localStorage.getItem("refreshToken") || sessionStorage.getItem("refreshToken");
            const { data } = await axios.get(`/rooms/${roomNo}/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMembers(data);

            setTimeout(() => {
                searchContact(data);
            }, 0);
        }
        catch (error) {
            console.error("채팅방 멤버 목록 불러오기 실패", error);
        }
    }, [roomNo, searchContact]);

    //모달 열기
    const openModal = useCallback(() => {
        if (!modal.current) return;
        loadRoomMembers();
        const target = Modal.getOrCreateInstance(modal.current);
        target.show();
    }, [modal, loadRoomMembers]);

    //모달 닫기
    const closeModal = useCallback(() => {
        const target = Modal.getInstance(modal.current);
        if (target) target.hide();
    }, [modal]);

    //초대 모달 열기
    const openInviteModal = useCallback(() => {
        closeModal();

        //검색 상태 초기화
        setSearchContacts("");
        setNoResults(null);
        setNoResultsType(null);
        setFilterContacts(groupContacts);//원래 전체 연락처로 되돌림

        if (!modalInvite.current) return;
        const target = Modal.getOrCreateInstance(modalInvite.current);
        target.show();
    }, [modalInvite, closeModal, groupContacts]);

    //초대 모달 닫기
    const closeInviteModal = useCallback(() => {
        const target = Modal.getInstance(modalInvite.current);
        if (target) target.hide();
    }, [modalInvite]);

    //연락처 불러오기
    const loadContacts = useCallback(async () => {
        try {
            const token = localStorage.getItem("refreshToken") || sessionStorage.getItem("refreshToken");

            const response = await axios.get(`/member/contact/invitable/${roomNo}`, {
                headers: { Authorization: `Bearer ${token}` },
                params: searchContacts.trim()
                    ? { search: searchContacts }
                    : {} // 검색어 없으면 params 없이 전체 목록 요청
            });

            const data = response.data;
            setGroupContacts(data);
            setFilterContacts(data); // 검색 안했을 때 초기 목록도 표시

            let rawMatchCount = 0;
            Object.keys(groupContacts).forEach(dept => {
                const matches = groupContacts[dept].filter(c =>
                    c.memberName.includes(searchContacts) ||
                    dept.includes(searchContacts)
                );
                rawMatchCount += matches.length;
            });

            if (Object.keys(data).length === 0) {
                setNoResultsType(rawMatchCount > 0 ? "excluded" : "none");
            } else {
                setNoResultsType(""); // 정상 결과 있을 때는 메시지 숨김
            }
        } catch (error) {
            console.error("초대 가능한 연락처 불러오기 실패", error);
        }
    }, [roomNo, searchContacts, groupContacts]);


    //체크박스 선택/해제 객체 저장
    const memberSelection = useCallback((memberNo) => {
        setSelectMembers(prev => {
            const updated = [...prev];
            if (updated.includes(memberNo)) {
                return updated.filter(member => member !== memberNo);
            } else {
                updated.push(memberNo); // memberNo만 추가
            }
            return updated;
        });
    }, []);

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

                    axios.post(`/rooms/${roomNo}/read`, null, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
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
    useEffect(() => {
        const token = localStorage.getItem("refreshToken") || sessionStorage.getItem("refreshToken");
        //입장 시 읽음 처리
        axios.post(`/rooms/${roomNo}/read`, null, {
            headers: { Authorization: `Bearer ${token}` }
        });
        //나갈 때도 읽음 처리 (뒤로가기포함)
        return () => {
            axios.post(`/rooms/${roomNo}/read`, null, {
                headers: { Authorization: `Bearer ${token}` }
            });
        };
    }, [roomNo]);

    const handleKeyPress = (e) => {
        if (e.key === "Enter") handleSendMessage();
    };

    const handleSearchClick = () => {
        loadContacts();
        setSearchContacts(""); // 입력창 초기화
    };

    const handleSearchKeyPress = (e) => {
        if (e.key === "Enter") {
            searchContact();
            setSearchContacts("");
        }
    };

    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    }, [messages]);

    //연락처
    useEffect(() => {
        loadContacts();
    }, []);

    //시간 포맷 함수
    const formatTime = (time) => {
        return dayjs(time).format("A h:mm");
    };

    //날짜 포맷 함수
    const formatDate = (dateStr) => {
        return dayjs(dateStr).format("YYYY년 M월 D일 dddd");
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
                        <PiUserList className="fs-4" onClick={openModal} />
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

                    const currentDate = dayjs(msg.time).format("YYYY-MM-DD");
                    const prevDate = index > 0 ? dayjs(messages[index - 1].time).format("YYYY-MM-DD") : null;
                    const isNewDate = currentDate !== prevDate;

                    return (
                        <div key={index}>
                            {/* 날짜 구분선 */}
                            {isNewDate && (
                                <div className="d-flex align-items-center justify-content-center my-4">
                                    <hr className="flex-grow-1 me-3" />
                                    <span className="text-muted small">{formatDate(msg.time)}</span>
                                    <hr className="flex-grow-1 ms-3" />
                                </div>
                            )}

                            <div className={`d-flex flex-column ${isMine ? "align-items-end" : "align-items-start"} mb-2`}>
                                {!isMine && showSender && msg.senderName && (
                                    <div className="small fw-bold ps-1 mb-1">{msg.senderName}</div>
                                )}

                                <div className={`d-flex ${isMine ? "flex-row-reverse" : "flex-row"} align-items-end`}>
                                    <div className={isMine ? "message-bubble-me" : "message-bubble"}>
                                        {msg.content}
                                    </div>
                                    {showTime && (
                                        <div className={`message-time-corner ${isMine ? "me" : "other"}`}>
                                            {time}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}


            </div>

            <hr />

            <div className="mt-auto mb-3 m-3">
                <div className="d-flex align-items-center">
                    <button className="btn btn-secondary me-2 d-flex align-items-center justify-content-center px-2">
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

        {/* 채팅방 멤버 목록 모달 영역 */}
        <div className="modal fade" tabIndex="-1" ref={modal} data-bs-backdrop="static">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h4 className="modal-title">
                            대화상대
                            <span className="text-muted fs-6 ms-2">{members.length}</span>
                        </h4>
                        <button type="button" className="btn-close" aria-label="Close"
                            onClick={closeModal}>
                        </button>
                    </div>
                    <div className="modal-body">
                        <ul className="list-group">
                            {/* 멤버 초대하기 */}
                            <li className="list-group-item d-flex align-items-center text-primary fw-bold"
                                style={{ cursor: "pointer" }}
                                onClick={openInviteModal}>
                                <div className="rounded-circle bg-light border d-flex justify-content-center align-items-center me-3"
                                    style={{ width: "40px", height: "40px" }}>
                                    <FaPlus className="text-primary" />
                                </div>
                                <div className="fw-bold text-primary">초대하기</div>
                            </li>

                            {/* 채팅방에 속해 있는 멤버 목록 영역 */}
                            {members.map(member => (
                                <li key={member.memberNo} className="list-group-item d-flex align-items-center">
                                    <img
                                        src="/images/profile_basic.png"
                                        className="rounded-circle me-3"
                                        width="40"
                                        height="40"
                                        alt="profile"
                                    />
                                    <div>
                                        <div className="fw-bold">{member.memberName}</div>
                                        <div className="text-muted small">{member.memberDepartment}</div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={closeModal}>
                            취소
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* 연락처 목록 및 검색 기능 불러와서 초대 모달 영역 */}
        <div className="modal fade" tabIndex="-1" ref={modalInvite} data-bs-backdrop="static">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">초대하기</h5>
                        <button type="button" className="btn-close" onClick={closeInviteModal}></button>
                    </div>
                    <div className="modal-body">
                        {/* 제목, 검색 */}
                        <div className="row mb-3">
                            <label className="form-label ms-1 fw-bold">
                                대화상대
                            </label>
                            <div className="col d-flex">
                                <input type="text" className="form-control me-2"
                                    placeholder="이름 및 부서 입력"
                                    value={searchContacts}
                                    onChange={(e) => setSearchContacts(e.target.value)}
                                    onKeyDown={handleSearchKeyPress}
                                />
                                <button type="button" className="btn btn-secondary" onClick={handleSearchClick}>
                                    <FaMagnifyingGlass />
                                </button>
                            </div>
                        </div>

                        {/* 검색 결과가 없을 때 메시지 표시 */}
                        {noResultsType === "none" && (
                            <div className="row mt-3 text-center">
                                <div className="col">
                                    <small className="text-muted">
                                        "이미 대화 상대에 있거나 이름 또는 부서를 검색하세요."
                                    </small>
                                </div>
                            </div>
                        )}

                        {/* 선택된 멤버 미리보기 */}
                        {selectMembers.length > 0 && (
                            <div className="mb-3">
                                <div className="d-flex flex-wrap gap-2">
                                    {Object.values(groupContacts)
                                        .flat()
                                        .filter(member => selectMembers.includes(member.memberNo))
                                        .map(member => (
                                            <div key={member.memberNo} className="d-flex align-items-center border rounded-pill px-2 py-1 bg-light"
                                                style={{ fontSize: '0.875rem' }}
                                            >
                                                <img
                                                    src="/images/profile_basic.png"
                                                    className="rounded-circle me-2"
                                                    style={{ width: "30px", height: "30px", objectFit: "cover" }}
                                                />
                                                <span>{member.memberName}</span>
                                                <button
                                                    type="button"
                                                    className="btn-close btn-sm ms-2"
                                                    aria-label="Remove"
                                                    onClick={() => memberSelection(member.memberNo)}
                                                />
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}
                        {/* 연락처 리스트 */}
                        <div className="list-group" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            {Object.keys(filterContacts).map((department) => (
                                <div key={department}>
                                    {/* 부서명 표시 */}
                                    <div className="bg-light px-3 py-2 border-top fw-semibold text-secondary">
                                        {department}
                                    </div>

                                    {/* 해당 부서의 회원 리스트 */}
                                    {Array.isArray(filterContacts[department]) &&
                                        filterContacts[department].map((contact) => (
                                            <div className="list-group-item d-flex align-items-center"
                                                key={contact.memberNo}>
                                                <input
                                                    type="checkbox"
                                                    className="form-check-input me-3"
                                                    checked={selectMembers.includes(contact.memberNo)}
                                                    onChange={() => memberSelection(contact.memberNo)}
                                                />
                                                {/* 프로필 이미지 */}
                                                <img
                                                    src="/images/profile_basic.png"
                                                    className="rounded-circle me-2"
                                                    style={{ width: "40px", height: "40px", objectFit: "cover" }}
                                                />

                                                {/* 텍스트 정보 및 버튼을 기본적으로 가로로 배치 */}
                                                <div className="flex-grow-1 d-flex flex-column flex-sm-row justify-content-between">
                                                    <div>
                                                        <div className="d-flex align-items-center mb-1">
                                                            <h5 className="mb-0 me-2 text-nowrap">{contact.memberName}</h5>
                                                            <span className="border border-primary text-primary px-2 py-1 rounded-pill small text-nowrap">
                                                                {contact.memberRank}
                                                            </span>
                                                        </div>
                                                        <div className="d-flex flex-column">
                                                            <div className="d-flex align-items-center text-muted ms-1" style={{ fontSize: '0.875rem' }}>
                                                                <span>{contact.memberEmail}</span>
                                                            </div>
                                                            <div className="d-flex align-items-center">
                                                                <IoMdPhonePortrait className="text-primary" size={15} />
                                                                <span className="fw-semibold text-muted">
                                                                    {contact.memberContact}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-primary" onClick={handleInviteMembers}>
                            초대
                        </button>
                        <button type="button" className="btn btn-secondary" onClick={closeInviteModal}>
                            취소
                        </button>
                    </div>
                </div>
            </div>
        </div>

    </>
    );
}
