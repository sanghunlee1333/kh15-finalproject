import axios from "axios";
import { Modal } from "bootstrap";
import { useCallback, useEffect, useRef, useState } from "react";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { IoChatbubbles } from "react-icons/io5";
import { RiChatNewLine, RiContactsBook3Fill } from "react-icons/ri";
import { IoMdPhonePortrait } from "react-icons/io";
import { Link } from "react-router-dom";

export default function ChatRoom() {

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

    //callback
    //모달 열기
    const openModal = useCallback(() => {
        if (!modal.current) return;
        const target = Modal.getOrCreateInstance(modal.current);
        target.show();
    }, [modal]);

    //모달 닫기
    const closeModal = useCallback(() => {
        const target = Modal.getInstance(modal.current);
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
            let token = localStorage.getItem("refreshToken") || sessionStorage.getItem("refreshToken");

            //토큰이 없다면 로그인 페이지로 리다이렉트
            if(!token) {
                window.location.href = "/member/login"
                return;
            }

            const { data } = await axios.get("/rooms", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
    
            setRooms(data);//채팅방 목록을 상태에 저장
        }
        catch (error) {
            console.error("채팅방 목록 불러오기 실패", error);
        }
    }, []);
    
    const createRoom = useCallback(async () => {
        try {
            if (!roomTitle) {
                alert("채팅방 제목을 입력해주세요.");
                return;
            }
            if (selectMembers.length === 0) {
                alert("참여할 멤버를 선택해주세요");
                return;
            }

            // 토큰 가져오기
            let token = localStorage.getItem("refreshToken");
            if (token === null) {
                token = sessionStorage.getItem("refreshToken");
            }

            if (!token) {
                alert("로그인이 필요합니다.");
                // 로그인 페이지로 리다이렉트
                window.location.href = "/member/login";
                return;
            }

            //채팅방 생성 요청
            const response = await axios.post("/rooms", {
                roomTitle,
                memberNos: selectMembers
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            //서버에서 생성된 채팅방 데이터 확인
            console.log("채팅방 생성 성공 : ", response.data);

            //채팅방 목록 새로 불러오기
            await loadRooms();

            closeModal(); // 모달 닫기
            setRoomTitle(""); // 입력 초기화
            setSelectMembers([]); // 선택 초기화
        } catch (error) {
            console.error("채팅방 생성 실패", error);
            alert("채팅방 생성에 실패했습니다.");
        }
    }, [roomTitle, selectMembers, closeModal, loadRooms]);


    //키보드 enter 누르면 검색되게
    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            searchContact();
        }
    };

    //effect
    useEffect(() => {
        loadContacts();
    }, []);

    useEffect(() => {
        loadRooms();
    }, [loadRooms]);

    //view
    return (<>
        <div className="row mt-2">
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
            {rooms.map(rooms => (
                <div key={rooms.roomNo} className="p-2 rounded">
                    <Link to={`/chat/${rooms.roomNo}`} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                            <img src="프로필이미지" className="rounded-circle me-3" width="40" height="40" />
                            <div>
                                {/* 채팅방 제목 */}
                                <div className="fw-bold mb-1">{rooms.roomTitle}</div>
                                {/* 최근 받은 메세지 내용 */}
                                <div className="text-muted small">최근 받은 메세지 내용</div>
                            </div>
                        </div>
                        <div className="text-end">
                            {/* 최근 메세지 받은 시간 */}
                            <div className="small text-muted text-nowrap mb-1">3:40 PM</div>
                            {/* 읽지 않은 메세지 개수 */}
                            <span className="badge bg-danger rounded-pill small">2</span>
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
                        <h4 className="modal-title">새로운 채팅</h4>
                        <button type="button" className="btn-close" aria-label="Close"
                            onClick={closeModal}>
                        </button>
                    </div>
                    <div className="modal-body">
                        {/* 채팅방 이름 입력 */}
                        <div className="mb-3">
                            <label className="form-label ms-1 fw-bold">
                                채팅방 제목
                            </label>
                            <input type="text" className="form-control" id="roomTitle"
                                placeholder="방 제목 입력"
                                value={roomTitle}
                                onChange={(e) => setRoomTitle(e.target.value)}
                            />
                        </div>
                        {/* 제목, 검색 */}
                        <div className="row mt-2 mb-2">
                            <label className="form-label ms-1 fw-bold">
                                채팅 초대
                            </label>
                            <div className="col d-flex">
                                <input type="text" className="form-control me-2"
                                    placeholder="이름 및 부서 입력"
                                    value={searchContacts}
                                    onChange={(e) => setSearchContacts(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                />
                                <button type="button" className="btn btn-secondary" onClick={searchContact}>
                                    <FaMagnifyingGlass />
                                </button>
                            </div>
                        </div>

                        {/* <hr className="hr-stick" /> */}

                        {/* 검색 결과가 없을 때 메시지 표시 */}
                        {noResults && (
                            <div className="row mt-3">
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