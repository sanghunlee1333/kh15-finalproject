import { Link } from "react-router";
import { CiLogin } from "react-icons/ci";
import { CiLogout } from "react-icons/ci";

export default function Menu() {

    return (<>
        {/* 메뉴(Navbar) */}
        <nav className="navbar navbar-expand-lg bg-dark fixed-top" data-bs-theme="dark">
            <div className="container-fluid">

                {/* 좌측 로고 */}
                <Link to="/" className="navbar-brand">KHG</Link>

                {/* 메뉴 펼침 버튼(폭이 작을 때만 나옴) */}
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#main-menu" 
                    aria-controls="main-menu" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>

                {/* 메뉴 영역(폭에 따라 보이는 형태 다름) */}
                <div className="collapse navbar-collapse" id="main-menu">
                    
                    {/* 좌측 메뉴 */}
                    <ul className="navbar-nav me-auto">

                        {/* 일정관리 Link */}
                        <li className="nav-item dropdown">
                            <a className="nav-link dropdown-toggle" data-bs-toggle="dropdown" href="#" role="button"
                                aria-haspopup="true" aria-expanded="false">
                                <i className="fa-solid fa-database"></i>
                                일정
                            </a>
                            <div className="dropdown-menu">
                                <Link to="" className="dropdown-item">1</Link>
                                <Link to="" className="dropdown-item">2</Link>
                                <Link to="" className="dropdown-item">3</Link>
                            </div>
                        </li>

                        {/* 전자관리 Link */}
                        <li className="nav-item dropdown">
                            <a className="nav-link dropdown-toggle" data-bs-toggle="dropdown" href="#" role="button"
                                aria-haspopup="true" aria-expanded="false">
                                <i className="fa-solid fa-database"></i>
                                결재
                            </a>
                            <div className="dropdown-menu">
                                <Link to="" className="dropdown-item">1</Link>
                                <Link to="" className="dropdown-item">2</Link>
                                <Link to="" className="dropdown-item">3</Link>
                            </div>
                        </li>
                        
                        {/* 공지게시판 Link */}
                        <li className="nav-item">
                            <Link to="#" className="nav-link">
                                <i className="fa-solid fa-list-ul"></i>
                                공지게시판
                            </Link>
                        </li>
                    </ul>

                    {/* 우측 메뉴 */}
                    <ul className="navbar-nav">
                        <li className="nav-item">
                            <Link className="nav-link active">
                                <i className="fa-solid fa-right-to-bracket"></i>
                                <CiLogout />
                                Logout
                            </Link>
                            {/* <Link className="nav-link active">
                                <i className="fa-solid fa-right-to-bracket"></i>
                                <CiLogin />
                                Login
                            </Link> */}
                        </li>
                    </ul>
                </div>
            </div>
        </nav>

    </>)
}