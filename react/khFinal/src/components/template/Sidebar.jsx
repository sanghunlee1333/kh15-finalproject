import { BsFillChatSquareTextFill } from "react-icons/bs";
import { Link } from "react-router";

export default function Sidebar() {
    return (<>
        {/* 고정된 사이드바 - 채팅 목록 */}
        <div className="sidebar p-3 col-sm">
            <h5>
                <Link to="/chat/room" className="me-2">
                    <BsFillChatSquareTextFill className="fs-4 text-primary" />
                </Link>
                <span className="align-middle text-nowrap">채팅</span>
            </h5>
           
            <hr className="hr-stick mt-3" />

            <ul className="list-group">
                {/* 채팅방 아이템 - 반복될 구조 */}
                <li
                    className="list-group-item d-flex align-items-center gap-2 chat-item"
                    title="채팅방 제목"
                >
                    <img
                        src="https://via.placeholder.com/40x40?text=+" // 기본 이미지 자리
                        className="rounded-circle flex-shrink-0"
                        style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                    />
                    <div className="chat-text flex-grow-1">
                        <div className="mb-1 fw-bold">
                            채팅방 제목
                        </div>
                        <small>미리보기 내용</small>
                    </div>
                </li>
                {/* 반복 구조 끝 */}
            </ul>
        </div>

    </>
    );
}