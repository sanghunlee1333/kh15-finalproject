import { IoChatbubbleEllipses } from "react-icons/io5";
import { RiChatNewLine } from "react-icons/ri";
import { Link } from "react-router";

export default function ChatRoom() {

    return (<>
        <div className="row mt-2">
            <div className="col">
                <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex-align-items-center">
                        <h2>
                            <IoChatbubbleEllipses className="text-primary me-1" />
                            <span className="align-middle">채팅</span>
                        </h2>
                    </div>
                    {/* 모달로 채팅방 생성 */}
                    <button className="btn me-2">
                        <RiChatNewLine className="fs-4" />
                    </button>
                </div>
            </div>
        </div>

        <hr className="hr-stick" />

        <div className="list-group">

            {/* 채팅방 */}
            <div className="p-2 rounded">
                <Link to="/chat/group" className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                        <img src="프로필이미지" className="rounded-circle me-3" width="40" height="40" />
                        <div>
                            {/* 채팅방 제목 */}
                            <div className="fw-bold mb-1">디자인팀 회의방</div>
                            {/* 최근 받은 메세지 내용 */}
                            <div className="text-muted small">김상우: 내일 회의 가능할까요?</div>
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

        </div>

    </>);
}