import { Link, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import Jumbotron from "../template/Jumbotron";

import { FaPlus } from "react-icons/fa";

export default function NoticeList() {
    //recoil

    //state
    const [notices, setNotices] = useState([]);
    const [selectedNotices, setSelectedNotices] = useState([]);

    //effect
    useEffect(() => {
        loadNotices();
    }, []);

    //callback
    const loadNotices = useCallback(async () => {
        const { data } = await axios.get("/notice/");
        console.log(data);
        setNotices(data);
        // axios({
        //     url:"/notice/",
        //     method:"get",
        // }).then(resp=>{
        //     setNotices(resp.data);
        // });
    }, []);

    const changeNoticeChoice = useCallback((e, target) => {
        setNotices(notices.map(notice => {
            //target과 notice를 비교해서 일치하는 경우 choice를 변경
            if (notice.noticeNo === target.noticeNo) { //원하는 대상이라면
                return {
                    ...notice,
                    choice: e.target.checked
                }
            }
            return notice; //아니면 통과
        }));
    }, [notices]);

    //view
    return (<>

        <Jumbotron subject="공지 게시판" />

        <div className="row mt-4">
            <div className="col text-end">
                <Link to="/notice/write" className="btn btn-success">
                    <FaPlus className="me-2" />게시글 작성
                </Link>
            </div>
        </div>

        <div className="row mt-4">
            <div className="col">
                <table className="table table-hover">
                    <thead>
                        <tr>
                            <th>
                                <input type="checkbox" />
                            </th>
                            <th>번호</th>
                            <th>제목</th>
                            <th>날짜</th>
                        </tr>
                    </thead>
                    <tbody>
                        {notices.map(notice => (
                            <tr key={notice.noticeNo}>
                                <td>
                                    <input type="checkbox" checked={notice.choice === true} onChange={e => changeNoticeChoice(e, notice)} />
                                </td>
                                <td>{notice.noticeNo}</td>
                                <td>
                                    <Link className="text-decoration-none d-inline-flex align-items-center" to={`/notice/detail/${notice.noticeNo}`}>
                                        {notice.noticeTitle}
                                    </Link>
                                </td>
                                <td>{notice.noticeWriteDate}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

    </>);
}