import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import moment from "moment";
import typeMap from "./typeMap";

export default function MainNotice() {
    const [notices, setNotices] = useState([]);

    const loadNotices = useCallback(async () => {
        const params = {
            page: 1,
            size: 10
        };
        const resp = await axios.post("/notice/search", params);
        setNotices(resp.data.list);
    }, []);

    useEffect(() => {
        loadNotices();
    }, [loadNotices]);

    return (
        <div className="row">
            <div className="col">
                <ul className="list-group list-group-flush">
                    {/* ✅ 헤더 출력 */}
                    <li className="list-group-item d-flex text-center fw-bold text-nowrap notice-row">
                        <div className="notice-cell" style={{ width: '10%' }}>번호</div>
                        <div className="notice-cell" style={{ width: '55%' }}>제목</div>
                        <div className="notice-cell" style={{ width: '15%' }}>작성자</div>
                        <div className="notice-cell" style={{ width: '20%' }}>날짜</div>
                    </li>

                    {/* ✅ 공지 목록 */}
                    {notices.length > 0 ? (
                        notices.map(notice => (
                            <li className="list-group-item d-flex text-center notice-row" key={notice.noticeNo}>
                                <div className="notice-cell" style={{ width: '10%' }}>{notice.noticeNo}</div>
                                <div className="text-start d-flex align-items-center" style={{ width: '55%' }}>
                                    <Link className="text-decoration-none d-flex align-items-center w-100 text-truncate" to={`/notice/detail/${notice.noticeNo}`}>
                                        <span className="me-2 fw-semibold text-nowrap" style={{ color: typeMap[notice.noticeType]?.color }}>
                                            {notice.noticeType}
                                        </span>
                                        <span className="text-dark text-truncate">{notice.noticeTitle}</span>
                                        {moment(notice.noticeWriteDate).isAfter(moment().startOf('day')) && (
                                            <span className="badge bg-danger ms-2">N</span>
                                        )}
                                    </Link>
                                </div>
                                <div className="notice-cell" style={{ width: '15%' }}>{notice.noticeWriterName}</div>
                                <div className="notice-cell" style={{ width: '20%' }}>
                                    {moment(notice.noticeWriteDate).isBefore(moment().startOf('day'))
                                        ? moment(notice.noticeWriteDate).format('YYYY-MM-DD')
                                        : moment(notice.noticeWriteDate).format('HH:mm')}
                                </div>
                            </li>
                        ))
                    ) : (
                        <li className="list-group-item text-center text-muted">
                            공지사항이 없습니다
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
}
