import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { IoMdPhonePortrait } from "react-icons/io";
import { RiContactsBook3Fill } from "react-icons/ri";

export default function MemberContact() {
    //state
    const [groupContacts, setGroupContacts] = useState({});

    //callback
    //연락처 불러오기
    const loadContacts = useCallback(async () => {
        const { data } = await axios.get("/member/contact");
        setGroupContacts(data);
    }, [groupContacts]);

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
                    placeholder="이름 및 전화번호 검색" />
                <button type="button" className="btn btn-secondary">
                    <FaMagnifyingGlass />
                </button>
            </div>
        </div>

        <hr className="hr-stick" />

        {/* 연락처 리스트 */}
        <div className="list-group">
            {Object.keys(groupContacts).map((department) => (
                <div key={department}>
                    {/* 부서명 표시 */}
                    <div className="bg-light px-3 py-2 border-top fw-semibold text-secondary">
                        {department}
                    </div>

                    {/* 해당 부서의 회원 리스트 */}
                    {groupContacts[department].map((contact) => (
                        <div className="list-group-item d-flex justify-content-between align-items-center"
                            key={contact.memberNo}>
                            {/* 프로필 이미지 */}
                            {/* 회원 프로필별로 이미지 나오게 구현해야함 */}
                            <img
                                src="https://ui-avatars.com/api/?name=이&background=random&rounded=true"
                                alt=""
                                className="rounded-circle me-3"
                                style={{ width: "48px", height: "48px", objectFit: "cover" }}
                            />

                            {/* 텍스트 정보 */}
                            <div className="flex-grow-1">
                                <div className="d-flex align-items-center mb-1">
                                    <h5 className="mb-0 me-2">{contact.memberName}</h5>
                                    <span className="border border-primary text-primary px-2 py-1 rounded-pill small">
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
                            <div className="d-flex align-items-center gap-2 text-nowrap">
                                <button className="btn btn-outline-primary btn-sm">채팅</button>
                            </div>
                        </div>
                    ))}
                </div>
            ))}
        </div>

    </>);
}