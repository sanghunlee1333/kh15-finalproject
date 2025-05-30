import { Link, useNavigate } from "react-router";

import { FaBell } from "react-icons/fa";
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
                <Link to="/" className="navbar-brand">
                    <img src="/images/LINKO.png" className="logo-small"/>
                </Link>

                {/* 모바일 화면용 햄버거 + 전구 (같이 묶음) */}
                <div className="d-flex align-items-center d-lg-none">
                    <Link to="/alarm" className="position-relative me-3">
                        <FaBell className="fs-1 text-warning" />
                        {unReadAlarmCount > 0 && (
                        <span className="badge bg-danger rounded-pill position-absolute"
                                style={{ top: 0, right: 0, transform: "translate(20%, -20%)", fontSize: "0.65rem", padding: "4px 6px" }}>
                            {unReadAlarmCount}
                        </span>
                        )}
                    </Link>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#main-menu"
                        aria-controls="main-menu" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                </div>

                {/* 메뉴 영역(폭에 따라 보이는 형태 다름) */}
                <div className="collapse navbar-collapse" id="main-menu">
                    
                    {/* 좌측 메뉴 */}
                    <ul className="navbar-nav me-auto">

                        {/* 공지게시판 Link */}
                        <li className="nav-item">
                            <Link to="/notice/list" className="nav-link">
                                <i className="fa-solid fa-list-ul"></i>
                                공지사항
                            </Link>
                        </li>

                        {/* 일정관리 Link */}
                        <li className="nav-item">
                            <Link to="/plan/team" className="nav-link">
                                <i className="fa-solid fa-list-ul"></i>
                                일정
                            </Link>
                        </li>

                        {/* 연락처 Link */}
                        <li className="nav-item">
                            <Link to="/member/contact" className="nav-link">
                                <i className="fa-solid fa-list-ul"></i>
                                연락처
                            </Link>
                        </li>

                        {/* 관리자 */}
                        {userDepartment === "인사" && (
                        <li className="nav-item">
                            <Link to="/admin/home" className="nav-link">
                                <i className="fa-solid fa-list-ul"></i>
                                관리자
                            </Link>
                        </li>
                        )}

                    </ul>

                    {/* 우측 메뉴: PC에서 전구 + 로그아웃 + 유저 아이콘 순서로 배치 */}
                    <ul className="navbar-nav align-items-center">

                        {/* 전구 아이콘 (PC 전용) */}
                        <li className="nav-item d-none d-lg-block me-3">
                            <Link to="/alarm" className="nav-link position-relative">
                                <FaBell className="fs-4 text-warning" />
                                {unReadAlarmCount > 0 && (
                                <span className="badge bg-danger rounded-pill position-absolute"
                                        style={{ top: 0, right: 0, transform: "translate(30%, 0%)", fontSize: "0.65rem", padding: "4px 6px" }}>
                                    {unReadAlarmCount}
                                </span>
                                )}
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