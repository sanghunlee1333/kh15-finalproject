import { FaMagnifyingGlass } from "react-icons/fa6";
import { IoIosPhonePortrait } from "react-icons/io";
import { RiContactsBook3Fill } from "react-icons/ri";

export default function ChatContact() {

    //view
    return (<>
    
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

        <div className="list-group">
            {/* 구분 바 */}
            <div className="bg-light px-3 py-2 border-top fw-semibold text-secondary">
                개발팀
            </div>

            <div className="list-group-item d-flex justify-content-between align-items-center">
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
                        <h5 className="mb-0 me-2">이대표</h5>
                        <span className="border border-primary text-primary px-2 py-1 rounded-pill small">
                            대표
                        </span>
                    </div>
                    <div className="text-muted">
                        <div className="align-middle">
                            <IoIosPhonePortrait className="text-primary me-1" />
                            <span>01012345678</span>
                        </div>
                        <small>개발팀 · kh@example.com</small>
                    </div>
                </div>

                {/* 버튼 */}
                <div className="d-flex align-items-center gap-2 text-nowrap">
                    <button className="btn btn-outline-primary btn-sm">채팅</button>
                </div>
            </div>

            
                
            {/* 구분 바 */}
            <div className="bg-light px-3 py-2 border-top fw-semibold text-secondary">
                디자인팀
            </div>

            {/* 디자인팀 */}
            <div className="list-group-item d-flex justify-content-between align-items-center">
                {/* 프로필 이미지 */}
                <img
                    src="https://ui-avatars.com/api/?name=홍&background=random&rounded=true"
                    alt=""
                    className="rounded-circle me-3"
                    style={{ width: "48px", height: "48px", objectFit: "cover" }}
                />

                {/* 텍스트 정보 */}
                <div className="flex-grow-1">
                    <div className="d-flex align-items-center mb-1">
                        <h5 className="mb-0 me-2">홍길동</h5>
                        <span className="border border-primary text-primary px-2 py-1 rounded-pill small">
                            대리
                        </span>
                    </div>
                    <div className="text-muted">
                        <div className="align-middle">
                            <IoIosPhonePortrait className="text-primary me-1" />
                            <span>01012345678</span>
                        </div>
                        <small>디자인팀 · kh@example.com</small>
                    </div>
                </div>

                {/* 버튼 */}
                <div className="d-flex align-items-center gap-2 text-nowrap">
                    <button className="btn btn-outline-primary btn-sm">채팅</button>
                </div>
            </div>

        </div>

    </>);
}