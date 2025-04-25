import { Link } from "react-router";
import { CiLogin } from "react-icons/ci";
import { CiLogout } from "react-icons/ci";
import { FaUserCircle } from "react-icons/fa";
import { FaLightbulb } from "react-icons/fa6";

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

                        {/* 공지게시판 Link */}
                        <li className="nav-item">
                            <Link to="/notice/list" className="nav-link">
                                <i className="fa-solid fa-list-ul"></i>
                                공지게시판
                            </Link>
                        </li>

                        {/* 연락처 Link */}
                        <li className="nav-item">
                            <Link to="/member/contact" className="nav-link">
                                <i className="fa-solid fa-list-ul"></i>
                                연락처
                            </Link>
                        </li>

                        {/* 채팅 */}
                        <li className="nav-item">
                            <Link to="/chat/room" className="nav-link">
                                <i className="fa-solid fa-list-ul"></i>
                                채팅
                            </Link>
                        </li>


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
                        
                    </ul>

                    {/* 우측 메뉴 */}
                    <ul className="navbar-nav">

                        {/* 전체 알림 */}
                        <li className="nav-item me-4">
                            <Link to="#" className="nav-link">
                                <i className="fa-solid fa-list-ul"></i>
                                <FaLightbulb className="fs-5 text-warning"/>
                            </Link>
                        </li>
                
                        {/* 로그인, 로그아웃 Link */}
                        <li className="nav-item">
                            {/* 로그아웃 */}
                            <Link to="#" className="nav-link active">
                                <i className="fa-solid fa-right-to-bracket"></i>
                                <CiLogout className="fs-4"/>
                            </Link>
                        </li>

                        {/* 마이페이지 Link, 회원가입 Link */}
                        <li className="nav-item">
                            <Link to="#" className="nav-link active">
                                <i className="fa-solid fa-right-to-bracket"></i>
                                <FaUserCircle className="fs-4"/>
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>

    </>)
}