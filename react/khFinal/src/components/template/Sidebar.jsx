import { BsFillChatSquareTextFill, BsSpeedometer2, BsTable, BsGrid, BsPeople } from "react-icons/bs";

export default function Sidebar() {
    return (
        <div className="d-flex flex-column flex-shrink-0 bg-secondary" style={{ width: "4.5rem", height: "calc(100vh - 56px)", position: "fixed", top: "57px", left: 0, zIndex: 1000 }}>
            
            <ul className="nav nav-pills nav-flush flex-column mb-auto text-center">
                <li className="nav-item">
                    <a href="#" className="nav-link active py-3 border-bottom" title="Home">
                        <BsFillChatSquareTextFill size={24} />
                    </a>
                </li>
                <li>
                    <a href="#" className="nav-link py-3 border-bottom" title="Dashboard">
                        <BsSpeedometer2 size={24} />
                    </a>
                </li>
                <li>
                    <a href="#" className="nav-link py-3 border-bottom" title="Orders">
                        <BsTable size={24} />
                    </a>
                </li>
                <li>
                    <a href="#" className="nav-link py-3 border-bottom" title="Products">
                        <BsGrid size={24} />
                    </a>
                </li>
                <li>
                    <a href="#" className="nav-link py-3 border-bottom" title="Customers">
                        <BsPeople size={24} />
                    </a>
                </li>
            </ul>

            <div className="dropdown border-top mt-auto">
                <a
                    href="#"
                    className="d-flex align-items-center justify-content-center p-3 link-dark text-decoration-none dropdown-toggle"
                    id="dropdownUser"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                >
                    <img
                        src="https://github.com/mdo.png"
                        alt="user"
                        width="24"
                        height="24"
                        className="rounded-circle"
                    />
                </a>
                <ul className="dropdown-menu text-small shadow" aria-labelledby="dropdownUser">
                    <li><a className="dropdown-item" href="#">New project...</a></li>
                    <li><a className="dropdown-item" href="#">Settings</a></li>
                    <li><a className="dropdown-item" href="#">Profile</a></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li><a className="dropdown-item" href="#">Sign out</a></li>
                </ul>
            </div>
        </div>
    );
}
