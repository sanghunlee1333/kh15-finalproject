import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useCallback } from "react";
import { FaCalendarAlt, FaClipboardList, FaRegCalendarCheck } from "react-icons/fa";
import MainTodo from "./Plan/MainTodo";
import MainTeamPlan from "./Plan/MainTeamPlan";
import MainNotice from "./Notice/MainNotice";
import MainMypage from "./Mypage/MainMypage";
import { FaUser } from "react-icons/fa6";
import { MdSpaceDashboard } from "react-icons/md";
// import MypageEdit from "./Mypage/EditProfile"
export default function Mainpage() {
    
    //navigate
    const navigate = useNavigate();

    return (<>

        <h2 className="mb-4 mt-2">
            <MdSpaceDashboard className="text-primary me-2" />
            <span className="align-middle">대시보드</span>
        </h2>

        {/* 카드 4개 그리드 */}
        <div className="row g-4">
            {/* 마이페이지 */}
            <div className="col-md-6">
                <div className="position-relative border rounded shadow-sm p-2"
                    style={{ overflow: "hidden", cursor: "pointer" }}
                >
                    <div className="preview-overlay" />
                    <div className="card p-3" style={{ overflow: 'visible', minHeight: '650px' }}>
                        <h3 className="fw-bold d-flex align-items-center justify-content-center">
                            {/* <FaClipboardList className="text-danger me-1" /> */}
                            <FaUser className="me-2" />마이페이지
                        </h3>
                        {/* <MainNotice /> */}
                        <MainMypage />
                    </div>
                </div>
            </div>

            {/* 공지 게시판 */}
            <div className="col-md-6">
                <div className="position-relative border rounded shadow-sm p-2" onClick={() => navigate("/notice/list")}
                    style={{ overflow: "hidden", cursor: "pointer" }}
                >
                    <div className="preview-overlay" />
                    <div className="card p-3" style={{ overflow: 'visible', minHeight: '650px' }}>
                        <h3 className="fw-bold d-flex align-items-center justify-content-center">
                            <FaClipboardList className="text-danger me-2" />
                            공지사항
                        </h3>
                        <MainNotice />
                    </div>
                </div>
            </div>

            {/* 캘린더 */}
            <div className="col-md-6">
                <div className="position-relative border rounded shadow-sm p-2" onClick={() => navigate("/plan/team")}
                    style={{ overflow: "hidden", cursor: "pointer" }}
                >
                    <div className="preview-overlay" />
                    <div className="card p-3" style={{ overflow: 'visible', minHeight: '650px' }}>
                        <MainTeamPlan />
                    </div>
                </div>
            </div>

            {/* Todo */}
            <div className="col-md-6">
                <div className="position-relative border rounded shadow-sm p-2" onClick={() => navigate("/plan/todo")}
                    style={{ overflow: "hidden", cursor: "pointer" }}
                >
                    <div className="preview-overlay" />
                    <div className="card p-3" style={{ overflow: 'visible', height: '650px' }}>
                        <h3 className="fw-bold d-flex align-items-center justify-content-center">
                            <FaRegCalendarCheck className="text-success me-2" />
                            TodoList
                        </h3>
                        <MainTodo />
                    </div>
                </div>
            </div>

        </div>

    </>)
}