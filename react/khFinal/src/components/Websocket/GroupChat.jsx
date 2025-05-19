import axios from "axios";
import { Modal } from "bootstrap";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FaArrowTurnUp, FaMagnifyingGlass, FaPlus } from "react-icons/fa6";
import { IoArrowBack } from "react-icons/io5";
import { PiUserList } from "react-icons/pi";
import { Link, useNavigate, useParams } from "react-router-dom";
import SockJS from 'sockjs-client';
import { Client } from "@stomp/stompjs";
import { userNoState } from "../utils/stroage";
import { useRecoilValue } from "recoil";
import dayjs from "dayjs";
import "dayjs/locale/ko"; // 한글 로케일 불러오기
import relativeTime from "dayjs/plugin/relativeTime";
import { IoMdPhonePortrait } from "react-icons/io";
import { FaDownload } from "react-icons/fa6";
import { FaTrashAlt } from "react-icons/fa";

dayjs.extend(relativeTime); // 상대 시간 사용 가능하게 확장
dayjs.locale("ko");         // 한글로 설정


export default function GroupChat() {
    //navigate
    const navigate = useNavigate();

    //recoil
    const memberNo = useRecoilValue(userNoState);

    //ref
    const wsConnected = useRef(false);
    const chatBoxRef = useRef(null);
    const stompClientRef = useRef(null);

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
    //프로필 이미지
    const [profileImages, setProfileImages] = useState({});
    //파일첨부
    const [selectedFiles, setSelectedFiles] = useState([]);
    const MAX_FILE_SIZE_MB = 10;
    const MAX_TOTAL_SIZE_MB = 30;
    //이미지 파일 삭제
    const [selectedImageInfo, setSelectedImageInfo] = useState(null);

    const token = localStorage.getItem("refreshToken") || sessionStorage.getItem("refreshToken");

    const handleSendMessage = async () => {
        if (!newMessage.trim() && selectedFiles.length === 0) return;

        try {
            // 텍스트 메시지 전송 (선택사항)
            if (newMessage.trim()) {
                const textForm = new FormData();
                textForm.append("roomChatOrigin", roomNo);
                textForm.append("roomChatContent", newMessage);
                textForm.append("roomChatType", "CHAT");

                await axios.post(`/chat/send`, textForm, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                });

                setNewMessage("");
            }

            // 첨부파일 각각 따로 메시지 전송
            for (const file of selectedFiles) {
                const fileForm = new FormData();
                fileForm.append("roomChatOrigin", roomNo);
                fileForm.append("roomChatContent", `[파일] ${file.name}`);
                fileForm.append("roomChatType", "CHAT");
                fileForm.append("attachments", file);

                await axios.post(`/chat/send`, fileForm, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                });
            }

            setSelectedFiles([]);
            // 파일 첨부 모달 닫기
            const modalEl = document.getElementById("fileUploadModal");
            if (modalEl) {
                const modalInstance = Modal.getInstance(modalEl) || Modal.getOrCreateInstance(modalEl);
                modalInstance.hide();
            }
        } catch (error) {
            console.error("메시지 전송 실패", error);
            alert("메시지 전송 중 오류가 발생했습니다");
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

            closeInviteModal();

            setSelectMembers([]);

            await axios.post(`/rooms/${roomNo}/invite`, {
                memberNos: selectMembers
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            loadContacts();     // 초대한 사람 제외된 연락처 다시 불러오기
            loadRoomMembers();  // 참여자 목록 업데이트
            await fetchRoomTitle();
        }
        catch (error) {
            console.error("초대 실패", error);
            alert("초대에 실패했습니다");
        }
    };


    //채팅방 나가기
    const handleExitRoom = async () => {
        const confirmed = window.confirm("채팅방에서 나가시겠습니까?");
        if (!confirmed) return;

        try {
            await axios.delete(`/rooms/${roomNo}/exit`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            closeModal();
            navigate("/chat/room");
        }
        catch (error) {
            console.error("채팅방 나가기 실패", error);
            alert("채팅방 나가기 중 오류가 발생했습니다");
        }
    };

    const handleFileChange = (e) => {
        const newFiles = Array.from(e.target.files);

        const updatedFiles = [...selectedFiles];

        // 중복 제거 (파일 이름 + 사이즈)
        newFiles.forEach(file => {
            const isDuplicate = updatedFiles.some(
                f => f.name === file.name && f.size === file.size
            );
            if (!isDuplicate) updatedFiles.push(file);
        });

        // 파일당 10MB 초과 확인
        const invalidFiles = updatedFiles.filter(file => file.size > MAX_FILE_SIZE_MB * 1024 * 1024);
        if (invalidFiles.length > 0) {
            alert("각 파일은 최대 10MB까지만 업로드할 수 있습니다.");
            return;
        }

        // 전체 30MB 초과 확인
        const totalSize = updatedFiles.reduce((acc, file) => acc + file.size, 0);
        if (totalSize > MAX_TOTAL_SIZE_MB * 1024 * 1024) {
            alert("총 파일 크기는 최대 30MB까지만 업로드할 수 있습니다.");
            return;
        }

        setSelectedFiles(updatedFiles);
        e.target.value = ""; // 같은 파일 다시 선택 가능하게 초기화
    };

    const handleRemoveFile = (index) => {
        setSelectedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    };

    const handleDeleteImage = async () => {
        if (!selectedImageInfo) return;

        const confirmed = window.confirm("정말 이미지를 삭제하시겠습니까?");
        if (!confirmed) return;

        try {
            //Delete 요청으로 첨부파일 삭제
            await axios.delete(`/attachment/${selectedImageInfo.attachmentNo}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            //모달 닫기
            const modalEl = document.getElementById("imagePreviewModal");
            if (modalEl) {
                const modalInstance = Modal.getInstance(modalEl);
                if (modalInstance) modalInstance.hide();
            }

            setMessages(prev =>
                prev.map(msg => {
                    if (!msg.attachments) return msg;

                    const newAttachments = msg.attachments.filter(
                        att => att.attachmentNo !== selectedImageInfo.attachmentNo
                    );

                    const isOnlyImage = newAttachments.length > 0 &&
                        newAttachments.every(att => att.attachmentType?.startsWith("image/"));

                    const isEmpty = newAttachments.length === 0;

                    // 텍스트는 그대로 유지하고, 렌더링에서 처리
                    return {
                        ...msg,
                        attachments: newAttachments,
                    };
                })
            );

            setSelectedImageInfo(null);
        }
        catch (error) {
            console.error("이미지 삭제 실패", error);
            alert("이미지 삭제 중 오류가 발생했습니다.");
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

            // 프로필 이미지 로딩 추가
            const groupMap = { 전체: data };
            await loadProfileImagesBatch(data.map(d => d.memberNo)); // 최적화된 다건 조회

            setTimeout(() => {
                searchContact(data);
            }, 0);
        }
        catch (error) {
            console.error("채팅방 멤버 목록 불러오기 실패", error);
        }
    }, [roomNo, searchContact]);

    const loadProfileImages = async (contacts) => {
        const map = {};

        const memberList = Array.isArray(contacts)
            ? contacts // 배열이면 그대로 사용
            : Object.values(contacts).flat(); // 객체이면 전체 배열로 펼치기

        for (const member of memberList) {
            const attachmentNo = await getProfileAttachmentNo(member.memberNo);
            if (attachmentNo !== null) {
                map[String(member.memberNo)] = attachmentNo;
            }
        }

        setProfileImages((prev) => ({
            ...prev,
            ...map,
        }));
    };

    const loadProfileImagesBatch = async (memberNos) => {
        try {
            const response = await axios.post(`/mypage/profile-batch`, memberNos, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = response.data; // { 1: 101, 2: -1, 3: 102 }

            const newMap = {};
            Object.entries(data).forEach(([memberNo, attachNo]) => {
                if (attachNo !== -1) {
                    newMap[memberNo] = attachNo;
                }
            });

            setProfileImages(prev => ({
                ...prev,
                ...newMap
            }));
        } catch (error) {
            console.error("프로필 이미지 일괄 로딩 실패", error);
        }
    };

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
            //프로필 이미지도 로딩
            const flatContacts = Object.values(data).flat();
            await loadProfileImagesBatch(flatContacts.map(c => c.memberNo));

            let rawMatchCount = 0;
            Object.keys(data).forEach(dept => {
                const matches = data[dept].filter(c =>
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
    }, [roomNo, searchContacts]);

    const getProfileAttachmentNo = async (memberNo) => {
        try {
            const { data } = await axios.get(`/mypage/profile/${memberNo}`);
            return data !== -1 ? data : null;
        } catch {
            return null;
        }
    };


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

        // 포커스를 모달 밖 적절한 요소로 옮기기
        document.querySelector(".chat-container input")?.focus();
    }, [modal]);

    //초대 모달 열기
    const openInviteModal = useCallback(() => {
        closeModal();

        //검색 상태 초기화
        setSearchContacts("");
        setNoResults(null);
        setNoResultsType(null);

        loadContacts();

        if (!modalInvite.current) return;
        const target = Modal.getOrCreateInstance(modalInvite.current);
        target.show();
    }, [modalInvite, closeModal, loadContacts]);

    //초대 모달 닫기
    const closeInviteModal = useCallback(() => {
        const target = Modal.getInstance(modalInvite.current);
        if (target) target.hide();

        // 포커스를 입력창으로 이동
        document.querySelector(".chat-container input")?.focus();
    }, [modalInvite]);

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
        //내가 보낸 메세지면 이름 안보임
        if (Number(current.senderNo) === Number(memberNo)) return false;
        //첫 메세지는 항상 보임
        if (index === 0) return true;

        const prev = messages[index - 1];
        const sameSender = current.senderNo === prev.senderNo;

        //시간 비교는 "YYYY-MM-DD HH:mm" 형식으로 정규화
        const currentTime = dayjs(current.time).format("YYYY-MM-DD HH:mm");
        const prevTime = dayjs(prev.time).format("YYYY-MM-DD HH:mm");
        const sameTime = currentTime === prevTime;

        //같은 사람이고 같은 분에 보냈으면 생략
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

    // 기존 connectWebSocket 함수 수정
    const connectWebSocket = useCallback(() => {
        if (wsConnected.current) return;
        wsConnected.current = true;

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

                    // 서버에 읽음 처리
                    axios.post(`/rooms/${roomNo}/read`, null, {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    // 클라이언트에게 뱃지 갱신하도록 알림
                    window.dispatchEvent(new Event("refreshRoomList"));
                });

                stompClient.subscribe(`/topic/room-users/${roomNo}`, () => {
                    loadContacts();
                    loadRoomMembers();
                    fetchRoomTitle();
                });
            },
        });

        stompClient.activate();
        setClient(stompClient);
        stompClientRef.current = stompClient; // 저장
    }, [roomNo]);


    const fetchRoomTitle = useCallback(async () => {
        try {
            const { data: users } = await axios.get(`/rooms/${roomNo}/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const { data: roomData } = await axios.get(`/rooms/${roomNo}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (users.length === 1) {
                // 혼자만 남았을 때
                setRoomTitle("빈 채팅방");
            }
            else if (users.length === 2 && !roomData.roomTitle) {
                // 개인 채팅일 때
                const opponent = users.find(user => user.memberNo !== memberNo);
                if (opponent) setRoomTitle(opponent.memberName);
            } else {
                // 그룹 채팅이거나 방제목이 있는 경우
                setRoomTitle(roomData.roomTitle);
            }
        } catch (error) {
            console.error("방 제목 갱신 실패", error);
        }
    }, [roomNo, memberNo, token]);

    const handleBackToRoomList = useCallback(async () => {
        try {
            await axios.post(`/rooms/${roomNo}/read`, null, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // ✅ read 완료 후에 이벤트를 전송하고 이동
            window.dispatchEvent(new Event("refreshRoomList"));
            navigate("/chat/room");
        }
        catch (error) {
            console.error("읽음 처리 후 뒤로가기 실패", error);
            navigate("/chat/room");
        }
    }, [roomNo, token, navigate]);

    //effect
    useEffect(() => {
        const fetchRoomInfo = async () => {
            try {
                // 1. 메시지 정보
                const { data: chatData } = await axios.get(`/chat/recent/${roomNo}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (Array.isArray(chatData?.messages)) {
                    setMessages(chatData.messages);
                }

                // 2. 참여자 목록
                const { data: users } = await axios.get(`/rooms/${roomNo}/users`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMembers(users);

                // 3. 제목 설정
                if (users.length === 2) {
                    const opponent = users.find(user => user.memberNo !== memberNo);
                    if (opponent) setRoomTitle(opponent.memberName);
                } else {
                    // 그룹 채팅인 경우
                    if (chatData?.roomTitle) setRoomTitle(chatData.roomTitle);
                }

                // 4. WebSocket 연결
                connectWebSocket();
            } catch (err) {
                console.error("채팅방 정보 불러오기 실패", err);
            }
        };

        fetchRoomInfo();
    }, [roomNo, memberNo, token, connectWebSocket]);


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

    // GroupChat.jsx 내부에 useEffect 추가
    useEffect(() => {
        const loadMissingProfileImages = async () => {
            const missingSenderNos = messages
                .map(msg => msg.senderNo)
                .filter(senderNo =>
                    senderNo && !profileImages.hasOwnProperty(String(senderNo))
                );

            const uniqueSenderNos = [...new Set(missingSenderNos)];

            if (uniqueSenderNos.length === 0) return;

            const newMap = {};
            for (const senderNo of uniqueSenderNos) {
                const attachmentNo = await getProfileAttachmentNo(senderNo);
                if (attachmentNo !== null) {
                    newMap[String(senderNo)] = attachmentNo;
                }
            }

            setProfileImages(prev => ({
                ...prev,
                ...newMap
            }));
        };

        if (messages.length > 0) {
            loadMissingProfileImages();
        }
    }, [messages]);

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

    useEffect(() => {
        return () => {
            //컴포넌트 언마운트 시 WebSocket 구독 해제
            if (stompClientRef.current) {
                stompClientRef.current.deactivate();
                stompClientRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        const modalEl = document.getElementById("fileUploadModal");

        if (!modalEl) return;

        const onModalHidden = () => {
            setSelectedFiles([]);
        };

        // Bootstrap 5의 모달 이벤트 감지
        modalEl.addEventListener("hidden.bs.modal", onModalHidden);

        // 컴포넌트 언마운트 시 이벤트 제거
        return () => {
            modalEl.removeEventListener("hidden.bs.modal", onModalHidden);
        };
    }, []);

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
                        <button className="btn p-0 me-2" onClick={handleBackToRoomList}>
                            <IoArrowBack className="fs-3" />
                        </button>
                        <h5 className="mb-0 text-nowrap text-truncate" style={{ maxWidth: "200px" }}>
                            {roomTitle}
                        </h5>
                    </div>
                    {/* 채팅 참여자 목록 */}
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
                    if (!msg) return null;

                    const isSystem = msg.type === "SYSTEM";
                    if (!msg || typeof msg.content !== "string" || !msg.content.trim()) return null;
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

                            {/* 시스템 메세지일 경우 */}
                            {isSystem ? (
                                <div className="d-flex justify-content-center my-2">
                                    <div className="text-muted small text-center px-2 py-1 system-message">
                                        {msg.content}
                                    </div>
                                </div>
                            ) : (
                                <div className={`d-flex flex-column ${isMine ? "align-items-end" : "align-items-start"} mb-2`}>
                                    {!isMine && showSender && msg.senderName && (
                                        <div className="d-flex align-items-center mb-1 ps-1">
                                            <img
                                                src={
                                                    profileImages[String(msg.senderNo)]
                                                        ? `http://localhost:8080/api/mypage/attachment/${profileImages[String(msg.senderNo)]}`
                                                        : "/images/profile_basic.png"
                                                }
                                                className="rounded-circle me-2"
                                                style={{ width: "30px", height: "30px", objectFit: "cover" }}
                                            />
                                            <span className="fw-bold">{msg.senderName}</span>
                                        </div>
                                    )}

                                    <div className={`d-flex ${isMine ? "flex-row-reverse" : "flex-row"} align-items-end`}>

                                        {/* 이미지만 있을 경우: 말풍선 없이 출력 */}
                                        {msg.attachments?.length > 0 &&
                                            msg.attachments.every(file => file.attachmentType?.startsWith("image/")) &&
                                            (!msg.content || msg.content.startsWith("[파일]")) ? (
                                            <div>
                                                {msg.attachments.map((file, i) => {
                                                    const isImage = file.attachmentType?.startsWith("image/");
                                                    const fileUrl = `http://localhost:8080/attachment/download/${file.attachmentNo}`;

                                                    if (!isImage) return null;

                                                    return (
                                                        <img
                                                            key={i}
                                                            src={fileUrl}
                                                            alt={file.attachmentName}
                                                            className="img-fluid rounded"
                                                            style={{
                                                                maxWidth: "200px",
                                                                maxHeight: "200px",
                                                                objectFit: "contain",
                                                                borderRadius: "10px",
                                                                cursor: "pointer"
                                                            }}
                                                            onClick={() => {
                                                                const image = document.getElementById("previewImage");
                                                                const link = document.getElementById("downloadImageLink");

                                                                if (image && link) {
                                                                    image.src = fileUrl;
                                                                    link.href = fileUrl;
                                                                    link.download = file.attachmentName;

                                                                    //이미지 정보 저장(삭제용)
                                                                    setSelectedImageInfo({
                                                                        attachmentNo: file.attachmentNo,
                                                                        fileName: file.attachmentName,
                                                                        fileUrl: fileUrl,
                                                                        senderNo: msg.senderNo
                                                                    });

                                                                    const modalElement = document.getElementById("imagePreviewModal");
                                                                    if (modalElement) {
                                                                        const bsModal = Modal.getOrCreateInstance(modalElement);
                                                                        bsModal.show();
                                                                    } else {
                                                                        console.error("모달 요소를 찾을 수 없음");
                                                                    }
                                                                }
                                                            }}
                                                        />
                                                    );
                                                })}

                                            </div>
                                        ) : (
                                            // 그 외에는 말풍선 유지
                                            <div className={isMine ? "message-bubble-me" : "message-bubble"}>
                                                {/* 텍스트가 있는 경우만 출력 */}
                                                <div>
                                                    {/* 이미지가 모두 삭제된 메시지에 대해 표시 */}
                                                    {msg.content?.startsWith("[파일]") &&
                                                        (!msg.attachments || msg.attachments.length === 0) ? (
                                                        <span className="text-muted">삭제된 이미지입니다.</span>
                                                    ) : (
                                                        // 기본 메시지 렌더링
                                                        msg.content &&
                                                        !(msg.attachments?.length > 0 &&
                                                            msg.attachments.every(file => !file.attachmentType?.startsWith("image/")) &&
                                                            msg.content.startsWith("[파일]")) && (
                                                            <div>{msg.content}</div>
                                                        )
                                                    )}
                                                </div>


                                                {/* 첨부파일이 있는 경우 */}
                                                {msg.attachments?.length > 0 && (
                                                    <div className="">
                                                        {msg.attachments.map((file, i) => {
                                                            const isImage = file.attachmentType?.startsWith("image/");
                                                            if (isImage) return null; // 이미지는 위에서 출력됨

                                                            const fileUrl = `http://localhost:8080/attachment/download/${file.attachmentNo}`;
                                                            const ext = file.attachmentName.split(".").pop().toLowerCase();

                                                            // 확장자별 아이콘 경로 설정
                                                            const iconMap = {
                                                                pdf: "/icons/pdf.png",
                                                                txt: "/icons/txt.png",
                                                                doc: "/icons/doc.png",
                                                                docx: "/icons/doc.png",
                                                                xls: "/icons/xls.png",
                                                                xlsx: "/icons/xls.png",
                                                                ppt: "/icons/ppt.png",
                                                                pptx: "/icons/ppt.png",
                                                                zip: "/icons/zip.png",
                                                                '7z': "/icons/zip.png",
                                                            };
                                                            const iconSrc = iconMap[ext] || iconMap.default;

                                                            return (
                                                                <div key={i}>
                                                                    <a
                                                                        href={fileUrl}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        download
                                                                        className={`d-flex align-items-center gap-2 ${isMine ? "text-light" : "text-primary"}`}
                                                                    >
                                                                        <img
                                                                            src={iconSrc}
                                                                            alt={ext}
                                                                            style={{
                                                                                width: "28px",
                                                                                height: "28px",
                                                                                objectFit: "contain"
                                                                            }}
                                                                        />
                                                                        <span className="ms-1">{file.attachmentName}</span>
                                                                    </a>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}

                                            </div>
                                        )}

                                        {/* 시간표시 */}
                                        {showTime && (
                                            <div className={`message-time-corner ${isMine ? "me" : "other"}`}>
                                                {time}
                                            </div>
                                        )}
                                    </div>

                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <hr />

            <div className="mt-auto mb-3 m-3">
                <div className="d-flex align-items-center">
                    <button
                        className="btn btn-secondary me-2 d-flex align-items-center justify-content-center px-2"
                        data-bs-toggle="modal"
                        data-bs-target="#fileUploadModal"
                    >
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
                            {/* 멤버 초대하기 (그룹 채팅방일 때만 노출) */}
                            {roomTitle !== "빈 채팅방" && members.length > 2 && (
                                <li className="list-group-item d-flex align-items-center text-primary fw-bold"
                                    style={{ cursor: "pointer" }}
                                    onClick={openInviteModal}>
                                    <div className="rounded-circle bg-light border d-flex justify-content-center align-items-center me-3"
                                        style={{ width: "40px", height: "40px" }}>
                                        <FaPlus className="text-primary" />
                                    </div>
                                    <div className="fw-bold text-primary">초대하기</div>
                                </li>
                            )}

                            {/* 채팅방에 속해 있는 멤버 목록 영역 */}
                            {members.map(member => (
                                <li key={member.memberNo} className="list-group-item d-flex align-items-center">
                                    <img
                                        src={
                                            profileImages[member.memberNo]
                                                ? `http://localhost:8080/api/mypage/attachment/${profileImages[member.memberNo]}`
                                                : "/images/profile_basic.png"
                                        }
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
                        <button type="button" className="btn btn-danger" onClick={handleExitRoom}>
                            채팅방 나가기
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
                                                    src={
                                                        profileImages[member.memberNo]
                                                            ? `http://localhost:8080/api/mypage/attachment/${profileImages[member.memberNo]}`
                                                            : "/images/profile_basic.png"
                                                    }
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
                                                    src={
                                                        profileImages[contact.memberNo]
                                                            ? `http://localhost:8080/api/mypage/attachment/${profileImages[contact.memberNo]}`
                                                            : "/images/profile_basic.png"
                                                    }
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

        {/* 파일 첨부 모달 */}
        <div className="modal fade" id="fileUploadModal" tabIndex="-1" aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">파일 첨부</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        {/* 이미지 미리보기 */}
                        <div className="border rounded p-3 mb-3" style={{ minHeight: "160px", backgroundColor: "#fafafa" }}>
                            <div className="fw-bold mb-2" style={{ fontSize: "0.9rem" }}>이미지 미리보기</div>
                            {selectedFiles.some(f => f.type.startsWith("image/")) ? (
                                <div style={{ overflowX: "auto", whiteSpace: "nowrap" }}>
                                    {selectedFiles
                                        .filter(f => f.type.startsWith("image/"))
                                        .map((file, idx) => (
                                            <div key={idx} className="d-inline-block border rounded p-2 text-center me-2 position-relative" style={{ width: "100px" }}>
                                                {/* 삭제 버튼 */}
                                                <button
                                                    type="button"
                                                    className="btn-close position-absolute top-0 end-0 m-1"
                                                    aria-label="Remove"
                                                    onClick={() => handleRemoveFile(selectedFiles.indexOf(file))}>
                                                </button>

                                                <img
                                                    src={URL.createObjectURL(file)}
                                                    alt={file.name}
                                                    className="img-fluid rounded mb-1"
                                                    style={{ height: "90px", objectFit: "cover" }}
                                                />
                                                <div className="small text-truncate">{file.name}</div>
                                            </div>
                                        ))}
                                </div>
                            ) : (
                                <div className="text-muted small">첨부된 이미지 파일이 없습니다.</div>
                            )}

                        </div>

                        {/* 일반 파일 미리보기 */}
                        <div className="border rounded p-3 mb-3" style={{ minHeight: "160px", backgroundColor: "#fafafa" }}>
                            <div className="fw-bold mb-2" style={{ fontSize: "0.9rem" }}>파일 미리보기</div>
                            {selectedFiles.some(f => !f.type.startsWith("image/")) ? (
                                <div style={{ overflowX: "auto", whiteSpace: "nowrap" }}>
                                    {selectedFiles
                                        .filter(f => !f.type.startsWith("image/"))
                                        .map((file, idx) => (
                                            <div
                                                key={idx}
                                                className="d-inline-block border rounded p-2 text-center me-2 position-relative"
                                                style={{ width: "100px" }}
                                            >
                                                <div
                                                    className="position-absolute top-0 end-0 m-1"
                                                    style={{ zIndex: 2 }}
                                                >
                                                    <button
                                                        type="button"
                                                        className="btn-close btn-sm"
                                                        aria-label="Remove"
                                                        onClick={() => handleRemoveFile(selectedFiles.indexOf(file))}
                                                        style={{ width: "0.75rem", height: "0.75rem", opacity: 0.6 }}
                                                    />
                                                </div>
                                                <div className="mb-1" style={{ fontSize: "2rem" }}>📄</div>
                                                <div className="small text-truncate">{file.name}</div>
                                            </div>
                                        ))}
                                </div>
                            ) : (
                                <div className="text-muted small">첨부된 문서 파일이 없습니다.</div>
                            )}
                        </div>

                        {/* 파일 선택 버튼 */}
                        <div className="mb-3">
                            <label className="btn btn-outline-dark w-100 mb-2">
                                파일 선택
                                <input
                                    type="file"
                                    className="d-none"
                                    accept=".png,.jpg,.jpeg,.txt,.pdf,.doc,.docx,.hwp,.ppt,.pptx,.xls,.xlsx,.zip,.7z"
                                    multiple
                                    onChange={handleFileChange}
                                />
                            </label>
                        </div>

                        {/* 안내 문구 */}
                        <div className="text-muted" style={{ fontSize: "0.8rem" }}>
                            <div>* 파일 용량은 최대 30MB(개별 10MB)까지 업로드 가능합니다.</div>
                            <div>* 업로드 가능한 파일 확장자</div>
                            <div>- 이미지 : .png, .jpg, .jpeg</div>
                            <div>- 문서 : .txt, .pdf, .doc, .docx, .hwp, .ppt, .pptx, .xls, .xlsx</div>
                            <div>- 압축파일 : .zip, .7z</div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-primary"
                            onClick={handleSendMessage}>
                            전송
                        </button>
                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">취소</button>
                    </div>
                </div>
            </div>
        </div>

        {/* 이미지 확대 모달 */}
        <div className="modal fade" id="imagePreviewModal" tabIndex="-1" aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">이미지 정보</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body text-center">
                        <img id="previewImage" src="" alt="preview" className="img-fluid" style={{ maxHeight: "80vh" }} />
                    </div>
                    <div className="modal-footer">
                        <a
                            id="downloadImageLink"
                            className="btn text-primary"
                            download
                        >
                            <FaDownload className="fs-5"/>
                        </a>
                        {selectedImageInfo?.senderNo === memberNo && (
                            <span type="button" className="btn text-danger" onClick={handleDeleteImage}>
                                <FaTrashAlt className="fs-5" />
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>

    </>
    );
}
