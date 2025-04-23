import { IoChatbubbleEllipses } from "react-icons/io5";

export default function Sidebar() {
    return (<>
        {/* 고정된 사이드바 - 채팅 목록 */}
        <div className="sidebar p-3 col-sm">

            <h4 className="m-2">
            <IoChatbubbleEllipses className="fs-4 me-2 text-info"/>
                <span className="align-middle">채팅</span>
            </h4>
            <hr />
            <ul className="list-group m-2">
                <li className="list-group-item">
                    <h6>방 제목 (4)</h6>
                    <span>내용</span>
                </li>
            </ul>
            <ul className="list-group m-2">
                <li className="list-group-item">
                    <h6>방 제목 (2)</h6>
                    <span>내용</span>
                    
                </li>
            </ul>
            <ul className="list-group m-2">
                <li className="list-group-item">
                    <h6>방 제목 (7)</h6>
                    <span>내용</span>
                </li>
            </ul>
        </div>

    </>
    );
}