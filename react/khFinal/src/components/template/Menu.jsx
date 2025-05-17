import { Link, useNavigate } from "react-router";
import { CiLogin } from "react-icons/ci";
import { CiLogout } from "react-icons/ci";
import { FaUserCircle } from "react-icons/fa";
import { FaLightbulb } from "react-icons/fa6";
import { useCallback, useRef } from "react";
import { Modal } from "bootstrap";
import axios from "axios";
import { useRecoilState, useRecoilValue, useResetRecoilState } from "recoil";
import { loginState, userDepartmentState, userNoState } from "../utils/stroage";
import { unReadAlarmCountState } from '../utils/alarm';

export default function Menu() {
    const navigate = useNavigate();
    const [userNo, setUserNo] = useRecoilState(userNoState);
    const [userDepartment,setUserDepartment] = useRecoilState(userDepartmentState);
    const login = useRecoilValue(loginState);
    const unReadAlarmCount = useRecoilValue(unReadAlarmCountState);
    const resetAlarmCount = useResetRecoilState(unReadAlarmCountState);

    const logoutModal = useRef();
    const gotoLogout = useCallback( ()=>{
        console.log("say")
        const target = Modal.getOrCreateInstance(logoutModal.current);
        target.show();
    },[])

    const sayYes = useCallback(async()=>{
        await axios.delete("/member/logout");
        window.localStorage.removeItem('refreshToken');
        window.sessionStorage.removeItem('refreshToken');
        setUserNo("");
        setUserDepartment("");
        resetAlarmCount(); //알림 개수 초기화

        const target = Modal.getInstance(logoutModal.current);
        target.hide();
        navigate('member/login'); 
    },[])
    const sayNo = useCallback(()=>{
        const target = Modal.getInstance(logoutModal.current);
        target.hide();
    },[])

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

                        {/* 일정관리 Link */}
                        <li className="nav-item">
                            <Link to="/plan/team" className="nav-link">
                                <i className="fa-solid fa-list-ul"></i>
                                일정
                            </Link>
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
                        <li className="nav-item dropdownme-4">
                            <Link to="/alarm" className="nav-link">
                                <i className="fa-solid fa-list-ul"></i>
                                <FaLightbulb className="fs-5 text-warning"/>
                                {unReadAlarmCount > 0 && (
                                    <span className="badge rounded-pill bg-danger">{unReadAlarmCount}</span>
                                )}
                            </Link>
                        </li>
                
                        {/* 로그인, 로그아웃 Link */}
                        <li className="nav-item">
                            {/* 로그아웃 */}
                             <Link onClick={gotoLogout} className="nav-link active">
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
        <div className="modal fade" tabIndex="-1" role="dialog" ref={logoutModal} data-bs-backdrop="static">
            <div className="modal-dialog modal-sm" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <h2>로그아웃</h2>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
                    </div>
                    <div className="modal-body">
                        <span>정말 로그아웃 하시겠습니까?</span>
                    </div>
                    <div className="modal-footer">
                        <div className="d-flex justify-content-between">
                            <button className="btn btn-success" onClick={sayYes}>예</button>
                            <button className="btn btn-secondary" onClick={sayNo}> 아니요</button>
                        </div>
                    </div>
                </div>
            </div> 
        </div>

    </>)
}