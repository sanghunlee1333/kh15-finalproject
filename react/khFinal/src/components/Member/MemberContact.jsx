import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { IoMdPhonePortrait } from "react-icons/io";
import { RiContactsBook3Fill } from "react-icons/ri";

export default function MemberContact() {
    //state
    const [contacts, setContacts] = useState([]);//연락처 목록
    
    //callback
    //연락처 불러오기
    const loadContacts = useCallback(async ()=>{
        // const token = localStorage.getItem("accessToken");
        // const {data} = await axios.get("/member/contact", {
        //     // headers: {
        //     //     Authorization: `Bearer ${token}`,
        //     // },
        // });
        const {data} = await axios.get("/member/contact");

         // 확인용 로그 추가
        console.log("불러온 연락처:", data);

        setContacts(data);
    }, [contacts]);
    
    //effect
    useEffect(()=>{
        loadContacts();
    }, []);

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
            {/* 구분 바 */}
            {/* <div className="bg-light px-3 py-2 border-top fw-semibold text-secondary">
                개발팀
            </div> */}
            {contacts.map((contact)=>(
                <div className="list-group-item d-flex justify-content-between align-items-center"
                    key={contact.memberNo}>
                    {/* 프로필 이미지 */}
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
                
                {/* 버튼 */}
                <div className="d-flex align-items-center gap-2 text-nowrap">
                    <button className="btn btn-outline-primary btn-sm">채팅</button>
                </div>
            </div>

            ))}
        </div>

    </>);
}