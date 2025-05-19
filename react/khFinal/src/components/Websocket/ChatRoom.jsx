import axios from "axios";
import { Modal } from "bootstrap";
import { useCallback, useEffect, useRef, useState } from "react";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { IoChatbubbles } from "react-icons/io5";
import { RiChatNewLine } from "react-icons/ri";
import { IoMdPhonePortrait } from "react-icons/io";
import { MdOutlineSubtitles } from "react-icons/md";
import { MdGroupAdd } from "react-icons/md";
import { FaRegImage } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/ko"; // 한글 로케일 불러오기
import localizedFormat from "dayjs/plugin/localizedFormat";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { useRecoilValue } from "recoil";
import { userNoState } from "../utils/stroage";

dayjs.extend(localizedFormat);
dayjs.locale("ko");         // 한글로 설정

export default function ChatRoom() {
    //navigate
    const navigate = useNavigate();

    //recoil
    const memberNo = useRecoilValue(userNoState);

    //모달을 제어하기 위한 ref
    const modal = useRef();
    //state
    const [roomTitle, setRoomTitle] = useState("");//생성할 채팅방 제목 입력
    //연락처 목록
    const [groupContacts, setGroupContacts] = useState({});//전체 연락처
    //연락처 검색
    const [searchContacts, setSearchContacts] = useState("");
    const [filterContacts, setFilterContacts] = useState({});//필터링된 연락처
    const [noResults, setNoResults] = useState(false); // 검색 결과가 없을 때의 상태
    //채팅에 초대할 선택된 멤버 추적
    const [selectMembers, setSelectMembers] = useState([]);
    //채팅방 목록 불러오기
    const [rooms, setRooms] = useState([]);
    //프로필 이미지
    const [profileImages, setProfileImages] = useState({});

    //그룹채팅 프로필 이미지
    const [roomProfileFile, setRoomProfileFile] = useState(null); // 실제 업로드할 파일
    const [roomProfilePreview, setRoomProfilePreview] = useState(null); // 미리보기 URL
    const [roomProfileNo, setRoomProfileNo] = useState(null); // 업로드 후 받은 attachment 번호

    //callback
    //모달 열기
    const openModal = useCallback(() => {
        if (!modal.current) return;
        const target = Modal.getOrCreateInstance(modal.current);
        target.show();
    }, [modal]);

    //모달 닫기
    const closeModal = useCallback(() => {
        if (!modal.current) return;
        const target = Modal.getInstance(modal.current);

        // 포커스 해제
        document.activeElement?.blur();
        if (target) target.hide();
    }, [modal]);

    //연락처 불러오기
    const loadContacts = useCallback(async () => {

        const token = axios.defaults.headers.common['Authorization']
        const { data } = await axios.get("/member/contact", {
            headers: {
                Authorization: token,
            }
        });

        setGroupContacts(data);
        setFilterContacts(data);//검색하지 않았을 경우에도 목록을 불러와야하니까
        //await loadProfileImages(data);
    }, [groupContacts, filterContacts]);

    //연락처 검색
    const searchContact = useCallback(() => {
        //검색어가 있을 때만 데이터를 업데이트
        if (searchContacts) {
            const filterContacts = {};
            let found = false; //검색 결과가 있는지 확인하는 변수

            const isDepartmentSearch = Object.keys(groupContacts).some(department =>
                department && department.includes(searchContacts)
            );

            if (isDepartmentSearch) {
                //부서명 검색
                Object.keys(groupContacts).forEach((department) => {
                    if (department && department.includes(searchContacts)) {
                        filterContacts[department] = groupContacts[department];
                        found = true;
                    }
                });
            }
            else {
                //이름 검색
                Object.keys(groupContacts).forEach((department) => {
                    const filterList = groupContacts[department].filter((contact) => {
                        const memberName = contact.memberName || ' ';
                        return memberName.includes(searchContacts)
                    });
                    if (filterList.length > 0) {
                        filterContacts[department] = filterList;
                        found = true;//검색된 항목이 있으면 true
                    }
                });
            }
            setFilterContacts(filterContacts);
            setNoResults(!found);//검색어가 없을 때는 결과 없음 메세지 숨김 처리
        }
        else {
            setFilterContacts(groupContacts);//검색어가 없으면 전체 목록으로 되돌림
            setNoResults(false);
        }

        setSearchContacts("");//검색 후 입력창 초기화
    }, [searchContacts, groupContacts]);

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

    const loadRooms = useCallback(async () => {
        try {
            const token = axios.defaults.headers.common['Authorization'];
            //토큰이 없다면 로그인 페이지로 리다이렉트
            if (!token) {
                window.location.href = "/member/login"
                return;
            }
            const { data } = await axios.get("/rooms", {
                headers: {
                    Authorization: token
                }
            });

            const sortedRooms = [...data].sort((a, b) => {
                const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
                const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
                return timeB - timeA;
            });
    
            setRooms(sortedRooms);
        }
        catch (error) {
            console.error("채팅방 목록 불러오기 실패", error);
        }
    }, []);

    const getProfileAttachmentNo = async (memberNo) => {
        if (profileImages[memberNo]) return profileImages[memberNo]; // 이미 있으면 요청 안 함

        try {
            const { data } = await axios.get(`/mypage/profile/${memberNo}`);
            return data !== -1 ? data : null;
        } catch {
            return null;
        }
    };

    const getRoomImageSrc = (room) => {
        const isDirectChat = room.roomProfileNo === null && room.partnerProfileNo !== null;

        if (isDirectChat) {
            return `http://localhost:8080/api/mypage/attachment/${room.partnerProfileNo}`;
        } else {
            return room.roomProfileNo
                ? `http://localhost:8080/api/mypage/attachment/${room.roomProfileNo}`
                : "/images/profile_basic.png";
        }
    };


    const createRoom = useCallback(async () => {
        try {
            if (!roomTitle) {
                alert("채팅방 제목을 입력해주세요.");
                return;
            }
            if (selectMembers.length === 0) {
                alert("참여할 멤버를 선택해주세요.");
                return;
            }
            if (!roomProfileFile) {
                alert("대표 이미지를 업로드 해주세요.");
                return;
            }

            const token = axios.defaults.headers.common['Authorization'];

            //대표 이미지 먼저 업로드
            const uploadProfileNo = await uploadRoomProfile();
            if (!uploadProfileNo) {
                alert("대표 이미지 업로드에 실패했습니다.");
                return;
            }

            //채팅방 생성 요청
            const response = await axios.post("/rooms", {
                roomTitle,
                memberNos: selectMembers,
                roomProfileNo: uploadProfileNo,
            }, {
                headers: {
                    Authorization: token,
                }
            });

            const roomNo = response.data;
            console.log("채팅방 생성 성공 : ", roomNo);

            closeModal(); // 모달 닫기
            setRoomTitle(""); // 입력 초기화
            setSelectMembers([]); // 선택 초기화
            setRoomProfileFile(null);//이미지 초기화
            setRoomProfilePreview(null);//미리보기 초기화
            setRoomProfileNo(null);//상태 초기화

            //생성된 방으로 이동
            navigate(`/chat/group/${roomNo}`);

        } catch (error) {
            console.error("채팅방 생성 실패", error);
        }
    }, [roomTitle, selectMembers, roomProfileFile, closeModal, navigate]);

    const handleRoomProfileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setRoomProfileFile(file);
        setRoomProfilePreview(URL.createObjectURL(file)); // 브라우저 미리보기용
    };

    //키보드 enter 누르면 검색되게
    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            searchContact();
        }
    };

    const uploadRoomProfile = async () => {
        if (!roomProfileFile) return null;

        const formData = new FormData();
        formData.append("attach", roomProfileFile);

        try {
            const token = axios.defaults.headers.common['Authorization'];
            const { data } = await axios.post("/mypage/upload", formData, {
                headers: {
                    Authorization: token,
                    "Content-Type": "multipart/form-data",
                },
            });
            return data.attachmentNo; // 서버에서 반환한 attachment 번호
        } catch (error) {
            console.error("프로필 이미지 업로드 실패", error);
            return null;
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
            },
            debug: (str) => { },
        });
        client.activate();

        return () => {
            client.deactivate();
        };
    }, [memberNo, loadRooms]);

    useEffect(() => {
        const handleRefresh = () => {
            loadRooms();
        };

        window.addEventListener("refreshRoomList", handleRefresh);
        return () => window.removeEventListener("refreshRoomList", handleRefresh);
    }, [loadRooms]);

    useEffect(() => {
        loadContacts();
    }, []);

    useEffect(() => {
        loadRooms();
    }, [loadRooms]);

    const formatRoomTime = (time) => {
        const now = dayjs();
        const msgTime = dayjs(time);

        if (msgTime.isSame(now, 'day')) {
            return msgTime.format("A h:mm");
        }
        else if (msgTime.isSame(now.subtract(1, 'day'), 'day')) {
            return "어제";
        }
        else if (msgTime.year() === now.year()) {
            return msgTime.format("M월 D일")
        }
        else {
            return msgTime.format("YYYY.MM.DD");
        }
    };

    //view
    return (<>
        <div className="row">
            <div className="col">
                <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex-align-items-center">
                        <h2>
                            <IoChatbubbles className="text-primary me-1" />
                            <span className="align-middle">채팅</span>
                        </h2>
                    </div>
                    {/* 채팅방 생성 버튼 (모달) */}
                    <button className="btn me-2" onClick={openModal}>
                        <RiChatNewLine className="fs-4" />
                    </button>
                </div>
            </div>
        </div>

        <hr className="hr-stick" />

        <div className="list-group">

            {/* 채팅방 */}
            {rooms.map(room => (
                <div key={room.roomNo} className="p-2 rounded">
                    <Link to={`/chat/group/${room.roomNo}`} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                            <img
                                src={getRoomImageSrc(room)}
                                className="rounded-circle me-3"
                                width="40"
                                height="40"
                            />

                            <div>
                                {/* 채팅방 제목 */}
                                <div className="fw-bold mb-1">{room.roomTitle}</div>
                                {/* 최근 받은 메세지 내용 */}
                                <div className="text-muted small message-preview">{room.lastMessage}</div>
                            </div>
                        </div>
                        <div className="text-end">
                            {/* 최근 메세지 받은 시간 */}
                            <div className="small text-muted text-nowrap mb-1">
                                {room.lastMessageTime && formatRoomTime(room.lastMessageTime)}
                            </div>
                            {/* 읽지 않은 메세지 개수 */}
                            {room.unreadCount > 0 && (
                                <span className="badge bg-danger rounded-pill small">{room.unreadCount}</span>
                            )}
                        </div>
                    </Link>
                </div>
            ))}

        </div>

        {/* 채팅방 생성 모달 영역 */}
        <div className="modal fade" tabIndex="-1" ref={modal} data-bs-backdrop="static">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h4 className="modal-title">
                            그룹채팅
                        </h4>
                        <button type="button" className="btn-close" aria-label="Close"
                            onClick={closeModal}>
                        </button>
                    </div>
                    <div className="modal-body">
                        {/* 채팅방 이름 입력 */}
                        <div className="mb-3">
                            <label className="form-label ms-1 fw-bold">
                                <MdOutlineSubtitles className="me-2 align-middle"/>
                                    채팅방 제목
                            </label>
                            <input type="text" className="form-control" id="roomTitle"
                                placeholder="방 제목 입력"
                                value={roomTitle}
                                onChange={(e) => setRoomTitle(e.target.value)}
                            />
                        </div>
                        {/* 대표 이미지 업로드 */}
                        <div className="mb-3">
                            <label className="form-label ms-1 fw-bold">
                                <FaRegImage className="me-2 align-middle text-muted"/>
                                채팅방 이미지
                            </label>
                            <input
                                type="file"
                                className="form-control"
                                accept="image/*"
                                onChange={handleRoomProfileChange}
                                style={{ display: "block" }}
                            />
                            {roomProfilePreview && (
                                <div className="mt-3">
                                    <label className="form-label ms-1 fw-bold">이미지 미리보기</label>
                                    <div className="mt-2 text-center">
                                        <img
                                            src={roomProfilePreview}
                                            alt="미리보기"
                                            className="rounded"
                                            style={{ width: "100px", height: "100px", objectFit: "cover" }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 제목, 검색 */}
                        <div className="row mb-3">
                            <div className="col-sm-12">
                                <label className="form-label ms-1 fw-bold">
                                    <MdGroupAdd className="me-2 align-middle text-muted"/>
                                    채팅 초대
                                </label>
                                <div className="input-group">
                                    <input
                                        type="text"
                                        className="form-control border"
                                        placeholder="이름 및 부서 검색"
                                        value={searchContacts}
                                        onChange={(e) => setSearchContacts(e.target.value)}
                                        onKeyDown={handleKeyPress}
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={searchContact}
                                    >
                                        <FaMagnifyingGlass />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* 검색 결과가 없을 때 메시지 표시 */}
                        {noResults && (
                            <div className="row mt-3 ms-2">
                                <div className="col">
                                    <small className="text-muted">"검색 결과가 없습니다, 이름 또는 부서를 검색하세요."</small>
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
                                                    onLoad={async () => {
                                                        if (!profileImages[member.memberNo]) {
                                                            const attachmentNo = await getProfileAttachmentNo(member.memberNo);
                                                            if (attachmentNo !== null) {
                                                                setProfileImages(prev => ({
                                                                    ...prev,
                                                                    [member.memberNo]: attachmentNo
                                                                }));
                                                            }
                                                        }
                                                    }}
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
                                                    onLoad={async () => {
                                                        if (!profileImages[contact.memberNo]) {
                                                            const attachmentNo = await getProfileAttachmentNo(contact.memberNo);
                                                            if (attachmentNo !== null) {
                                                                setProfileImages(prev => ({
                                                                    ...prev,
                                                                    [contact.memberNo]: attachmentNo
                                                                }));
                                                            }
                                                        }
                                                    }}
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
                        <button type="button" className="btn btn-secondary" onClick={closeModal}>
                            취소
                        </button>
                        <button type="button" className="btn btn-primary" onClick={createRoom}>
                            생성
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </>);
}