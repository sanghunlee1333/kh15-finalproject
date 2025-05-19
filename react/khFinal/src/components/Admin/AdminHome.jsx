import { FaBullhorn, FaCalendarCheck, FaCalendarDay, FaUser, FaUserPlus } from "react-icons/fa6";
import MainMypage from "../Mypage/MainMypage";
import { FaCogs, FaHome, FaUsersCog } from "react-icons/fa";

const cardItems = [
  { id: 1, title: "메인페이지", link: "/", icon: <FaHome className="text-info"/> },
  { id: 2, title: "회원 등록", link: "/member/join", icon: <FaUserPlus className="text-primary"/> },
  { id: 3, title: "회원 관리", link: "/admin/member/list", icon: <FaUsersCog className="text-secondary"/> },
  { id: 5, title: "출결 정책", link: "/admin/attendance", icon: <FaCalendarCheck className="text-warning"/> },
  { id: 6, title: "휴일 등록", link: "/admin/date", icon: <FaCalendarDay className="text-success"/> },
  { id: 7, title: "공지 등록", link: "/notice/write", icon: <FaBullhorn className="text-danger"/> },
];


export default function AdminHome(){


  return (<>
    <div style={{minHeight:'100px'}}>
         
    </div>
    <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 mt-4">
      {cardItems.map((item) => (
        <div className="col" key={item.id}>
          <div
            className="position-relative border rounded shadow-sm p-2 h-100"
            style={{
              overflow: "hidden",
              cursor: "pointer",
              transition: "all 0.3s ease",
              transform: "translateY(0)",
              backgroundColor: "#fff",
            }}
            onClick={() => {
              if (item.link) {
                window.location.href = item.link;
              }
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 1rem 2rem rgba(0, 0, 0, 0.15)";
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.backgroundColor = "#f8f9fa";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 .125rem .25rem rgba(0, 0, 0, 0.075)";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.backgroundColor = "#fff";
            }}
          >
            <div className="preview-overlay" />
            <div
              className="card p-3 h-100"
              style={{ overflow: "visible", minHeight: "200px", backgroundColor: "transparent" }}
            >
              <h3 className="fw-bold d-flex align-items-center justify-content-center h-100 m-0">
                 <span className="me-2">{item.icon}</span>
                <span>{item.title}</span>
              </h3>
            </div>
          </div>
        </div>
      ))}
    </div>
    </>
  );
}