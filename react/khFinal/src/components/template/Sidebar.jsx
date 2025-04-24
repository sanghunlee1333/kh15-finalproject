import { FaFacebookMessenger } from "react-icons/fa6";

export default function Sidebar() {
    return (<>
        {/* 고정된 사이드바 - 채팅 목록 */}
        <div className="sidebar p-3 col-sm">

            <h4 className="m-2">
                <FaFacebookMessenger className="fs-4 text-primary"/>
            </h4>

            <hr className="hr-stick mt-4"/>

            <ul className="list-group mb-1">
                <li className="list-group-item">
                    <h6>
                        Title
                        <span className="text-muted ms-2">4</span>
                    </h6>
                    <span>content</span>
                </li>
            </ul>
            <ul className="list-group mb-1">
                <li className="list-group-item">
                    <h6>
                        Title
                        <span className="text-muted ms-2">3</span>
                    </h6>
                    <span>content</span>
                </li>
            </ul>
            <ul className="list-group mb-1">
                <li className="list-group-item">
                    <h6>
                        Title
                        <span className="text-muted ms-2">7</span>
                    </h6>
                    <span>content</span>
                </li>
            </ul>
            <ul className="list-group mb-1">
                <li className="list-group-item">
                    <h6>
                        Title
                        <span className="text-muted ms-2">6</span>
                    </h6>
                    <span>content</span>
                </li>
            </ul>
            <ul className="list-group mb-1">
                <li className="list-group-item">
                    <h6>
                        Title
                        <span className="text-muted ms-2">5</span>
                    </h6>
                    <span>content</span>
                </li>
            </ul>
            <ul className="list-group mb-1">
                <li className="list-group-item">
                    <h6>
                        Title
                        <span className="text-muted ms-2">5</span>
                    </h6>
                    <span>content</span>
                </li>
            </ul>
            <ul className="list-group mb-1">
                <li className="list-group-item">
                    <h6>
                        Title
                        <span className="text-muted ms-2">8</span>
                    </h6>
                    <span>content</span>
                </li>
            </ul>
            <ul className="list-group mb-1">
                <li className="list-group-item">
                    <h6>
                        Title
                        <span className="text-muted ms-2">3</span>
                    </h6>
                    <span>content</span>
                </li>
            </ul>
            <ul className="list-group mb-1">
                <li className="list-group-item">
                    <h6>
                        Title
                        <span className="text-muted ms-2">2</span>
                    </h6>
                    <span>content</span>
                </li>
            </ul>
            <ul className="list-group mb-1">
                <li className="list-group-item">
                    <h6>
                        Title
                        <span className="text-muted ms-2">4</span>
                    </h6>
                    <span>content</span>
                </li>
            </ul>
            <ul className="list-group mb-1">
                <li className="list-group-item">
                    <h6>
                        Title
                        <span className="text-muted ms-2">3</span>
                    </h6>
                    <span>content</span>
                </li>
            </ul>
            <ul className="list-group mb-1">
                <li className="list-group-item">
                    <h6>
                        Title
                        <span className="text-muted ms-2">7</span>
                    </h6>
                    <span>content</span>
                </li>
            </ul>
            
        </div>

    </>
    );
}