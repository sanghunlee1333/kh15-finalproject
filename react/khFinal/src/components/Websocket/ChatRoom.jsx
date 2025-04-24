import { IoChatbubbleEllipses } from "react-icons/io5";
import { Link } from "react-router";

export default function ChatRoom() {

    return (<>
        <div className="row mt-2">
            <div className="col">
                <h2>
                    <IoChatbubbleEllipses className="text-primary me-1" />
                    <span className="align-middle">채팅</span>
                </h2>
            </div>
        </div>

        <hr className="hr-stick" />

        <div className="list-group">

            {/* 채팅방 */}
            <div className="p-2 rounded">
                <Link to="#" className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                        <img src="프로필이미지" className="rounded-circle me-3" width="40" height="40" />
                        <div>
                            <div className="fw-bold">디자인팀 회의방</div>
                            <div className="text-muted small">김상우: 내일 회의 가능할까요?</div>
                        </div>
                    </div>
                    <div className="text-end">
                        <div className="small text-muted text-nowrap">3:40 PM</div>
                        <span className="badge bg-danger rounded-pill small">2</span>
                    </div>
                </Link>
            </div>

        </div>

    </>);
}