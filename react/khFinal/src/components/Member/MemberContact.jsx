import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { IoMdPhonePortrait } from "react-icons/io";
import { RiContactsBook3Fill } from "react-icons/ri";

export default function MemberContact() {
    //state
    //목록
    const [groupContacts, setGroupContacts] = useState({});
    //검색
    const [searchContacts, setSearchContacts] = useState("");
    const [filterContacts, setFilterContacts] = useState({});
    const [noResults, setNoResults] = useState(false); // 검색 결과가 없을 때의 상태

    //callback
    //연락처 불러오기
    const loadContacts = useCallback(async () => {
        const { data } = await axios.get("/member/contact");
        setGroupContacts(data);
        setFilterContacts(data);//검색하지 않았을 경우에도 목록을 불러와야하니까
    }, []);

    //연락처 검색
    const searchContact = useCallback(() => {
        //검색어가 있을 때만 데이터를 업데이트
        if (searchContacts) {
            const filterContacts = {};
            let found = false; //검색 결과가 있는지 확인하는 변수

            const isDepartmentSearch = Object.keys(groupContacts).some(department =>
                department.includes(searchContacts)
            );

            if (isDepartmentSearch) {
                //부서명 검색
                Object.keys(groupContacts).forEach((department) => {
                    if (department.includes(searchContacts)) {
                        filterContacts[department] = groupContacts[department];
                        found = true;
                    }
                });
            }
            else {
                //이름 검색
                Object.keys(groupContacts).forEach((department) => {
                    const filterList = groupContacts[department].filter((contact) =>
                        contact.memberName.includes(searchContacts)
                    );
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

    //키보드 enter 누르면 검색되게
    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            searchContact();
        }
    };

    //effect
    useEffect(() => {
        loadContacts();
    }, [loadContacts]);

    //view
    return (<>
        {/* 제목, 검색 */}
        <div className="row mt-2">
            <div className="col-sm-3 text-nowrap">
                <h2>
                    <RiContactsBook3Fill className="text-info me-1" />
                    <span className="align-middle">연락처</span>
                </h2>
            </div>
            <div className="col-sm-9 d-flex justify-content-end">
                <input type="text" className="form-control me-2"
                    placeholder="이름 및 부서 검색"
                    value={searchContacts}
                    onChange={(e) => setSearchContacts(e.target.value)}
                    onKeyDown={handleKeyPress}
                />
                <button type="button" className="btn btn-secondary" onClick={searchContact}>
                    <FaMagnifyingGlass />
                </button>
            </div>
        </div>

        <hr className="hr-stick" />

        {/* 검색 결과가 없을 때 메시지 표시 */}
        {noResults && (
            <div className="row mt-5">
                <div className="col">
                    <h4 className="text-muted">"검색 결과가 없습니다, 이름 또는 부서를 검색하세요."</h4>
                </div>
            </div>
        )}

        {/* 연락처 리스트 */}
        <div className="list-group">
            {Object.keys(filterContacts).map((department) => (
                <div key={department}>
                    {/* 부서명 표시 */}
                    <div className="bg-light px-3 py-2 border-top fw-semibold text-secondary">
                        {department}
                    </div>

                    {/* 해당 부서의 회원 리스트 */}
                    {filterContacts[department].map((contact) => (
                        <div className="list-group-item d-flex align-items-center"
                            key={contact.memberNo}>
                            {/* 프로필 이미지 */}
                            <img
                                src="/images/profile_basic.png"
                                alt="Default Profile"
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

                                {/* 개인 채팅하기 버튼 */}
                                <div className="d-flex align-items-center gap-2 mt-2 mt-sm-0 justify-content-end">
                                    <button className="btn btn-outline-primary btn-sm ms-auto">채팅</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ))}
        </div>

    </>);
}