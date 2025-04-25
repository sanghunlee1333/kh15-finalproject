
export default function Sidebar() {
    const rooms = [
        { id: 1, imgSrc: "/path/to/room1.jpg" },
        { id: 2, imgSrc: "/path/to/room2.jpg" },
        { id: 3, imgSrc: "/path/to/room3.jpg" },
        // 더 많은 채팅방들 추가 가능
    ];

    return (

        <div className="sidebar">
            {/* 채팅방 목록 */}
            <div className="sidebar-list">
                {rooms.map((room) => (
                    <div key={room.id} className="sidebar-room">
                        <img src={room.imgSrc} alt={room.name} className="room-img" />
                        <div className="room-title">{room.name}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
