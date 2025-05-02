import { IoChatbubbles } from "react-icons/io5";
import { RiContactsBook3Fill } from "react-icons/ri";
import { Link } from "react-router";

export default function Sidebar() {
    const rooms = [
        { id: 1, imgSrc: "/path/to/room1.jpg" },
        { id: 2, imgSrc: "/path/to/room2.jpg" },
        { id: 3, imgSrc: "/path/to/room3.jpg" },
        // 더 많은 채팅방들 추가 가능
    ];

    return (
        <div className="sidebar d-flex flex-column" style={{ height: "calc(100vh - 56px)" }}>

            <div className="sidebar-header d-flex flex-column align-items-center mb-2 mt-3">
                <div className="w-75">
                    <Link to="/chat/room" className="btn btn-primary d-flex justify-content-center align-items-center w-100"
                        style={{ height: '50px', padding: '0' }}>
                        <IoChatbubbles style={{ fontSize: '30px' }} />
                    </Link>
                </div>
            </div>

            <hr className="hr-stick m-2" />

                {/* 채팅방 목록 */}
                <div className="sidebar-list flex-grow-1">
                    {rooms.map((room) => (
                        <div key={room.id} className="sidebar-room">
                            <img src={room.imgSrc} alt={room.name} className="room-img" />
                            <div className="room-title">{room.name}</div>
                        </div>
                    ))}
                </div>

                <hr className="hr-stick m-2" />

                {/* 하단 버튼들 */}
                <div className="sidebar-footer d-flex flex-column align-items-center mb-3">
                    <div className="w-75 mt-2">
                        <Link to="/member/contact" className="btn btn-info d-flex justify-content-center align-items-center w-100"
                            style={{ height: '50px', padding: '0' }}>
                            <RiContactsBook3Fill style={{ fontSize: '30px' }} />
                        </Link>
                    </div>
                </div>
            </div>
            );
}
