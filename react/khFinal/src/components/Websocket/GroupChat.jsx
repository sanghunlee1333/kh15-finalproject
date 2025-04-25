import { FaArrowTurnUp, FaPlus } from "react-icons/fa6";
import { IoArrowBack } from "react-icons/io5";
import { PiUserList } from "react-icons/pi";
import { Link } from "react-router";

export default function GroupChat() {

    return (<>

        {/* 채팅룸 이동 헤더 */}
        <div className="row mt-2">
            <div className="col">
                <div className="d-flex align-items-center justify-content-between">
                    {/* 뒤로가기 버튼 */}
                    <div className="d-flex align-items-center">
                        <Link to="/chat/room" className="btn p-0 me-2">
                            <IoArrowBack className="fs-3" />
                        </Link>
                        {/* 채팅방 제목 */}
                        <h5 className="mb-0 text-nowrap">디자인팀 회의방</h5>
                    </div>

                    {/* 오른쪽: 참가자 목록 버튼 */}
                    {/* 모달로 목록 띄우기 */}
                    <button className="btn btn-sm me-2">
                        <PiUserList className="fs-4" />
                    </button>
                </div>
            </div>
        </div>

        <hr className="hr-stick" />

        <div className="d-flex flex-column" style={{ height: '75vh' }}>
            {/* 채팅창 */}
            <div className="flex-grow-1 overflow-auto p-3 border rounded bg-light mb-2" style={{ minHeight: '0' }}>
                {/* 채팅 메시지는 여기 렌더링 */}
            </div>

            {/* 채팅 입력창 */}
            <div className="mt-auto">
                <div className="d-flex align-items-center">
                    {/* + 첨부 버튼 */}
                    <button className="btn btn-dark me-2 d-flex align-items-center justify-content-center px-2">
                        <FaPlus/>
                    </button>

                    {/* 입력창 */}
                    <input
                        type="text"
                        className="form-control"
                        placeholder="채팅 입력"
                    />

                    {/* 전송 버튼 */}
                    <button className="btn btn-primary ms-2 text-nowrap">
                        <FaArrowTurnUp />
                    </button>
                </div>
            </div>
        </div>

    </>);
}