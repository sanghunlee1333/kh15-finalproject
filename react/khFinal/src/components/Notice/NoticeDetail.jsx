import typeMap from "./typeMap";
import './NoticeDetail.css'

import { Link, useNavigate, useParams } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";

import { FaRegCircleCheck } from "react-icons/fa6";
import { FaCloudDownloadAlt, FaEdit } from "react-icons/fa";
import moment from "moment";
import { Modal } from "bootstrap";
import { FaTrash } from "react-icons/fa";
import { FaListUl } from "react-icons/fa6";
import { userDepartmentState, userNoState } from "../utils/stroage";
import { useRecoilValue } from "recoil";

export default function NoticeDetail() {

    //recoil
    const loginUserNo = useRecoilValue(userNoState);
    const userDepartment = useRecoilValue(userDepartmentState);

    //param
    const { noticeNo } = useParams();

    //ref
    const modal = useRef();

    //state
    const [notice, setNotice] = useState({});
    const [attachList, setAttachList] = useState([]);

    const meta = typeMap[notice.noticeType] || {};

    //navigate
    const navigate = useNavigate();

    //effect
    useEffect(() => {
        loadNotice();
    }, []);

    useEffect(() => {
        axios.get(`/notice/${noticeNo}/attach`)
            .then(resp => setAttachList(resp.data));
    }, [noticeNo]);

    //callback
    const loadNotice = useCallback(async () => {
        const { data } = await axios.get(`notice/${noticeNo}`);
        setNotice(data);
    }, []);

    const deleteNotice = useCallback(async () => {
        await axios.delete(`/notice/${notice.noticeNo}`);
        closeModal();
        navigate("/notice/list");
    }, [notice, navigate]);

    const moveList = useCallback(() => {
        navigate("/notice/list");
    }, [navigate]);

    const moveEdit = useCallback(() => {
        navigate(`/notice/edit/${noticeNo}`);
    }, [navigate]);

    const openModal = useCallback(() => {
        if (!modal.current) return;
        const target = Modal.getOrCreateInstance(modal.current);
        target.show();
    }, [modal]);
    const closeModal = useCallback(() => {
        const target = Modal.getInstance(modal.current);
        if (target !== null) target.hide();
    }, [modal]);

    //view
    return (<>

        <div className="row mt-2">
            <div className="col">
                <span className="d-flex align-items-center fw-semibold ms-1" style={{ color: meta.color }}>
                    <span className="d-flex align-items-center icon-responsive">{meta.icon?.()}</span>
                    <span className="text-responsive ms-1">{notice.noticeType}</span>
                </span>
            </div>
        </div>


        <div className="row">
            <div className="col">
                <h1 className="text-responsive-title">{notice.noticeTitle}</h1>
                <div className="d-flex justify-content-between mt-3">
                    <span className="text-responsive text-end ms-1 fw-bold text-muted">{notice.noticeWriterName}</span>
                    <span className="text-responsive text-secondary text-end">{moment(notice.noticeWriteDate).format("YYYY-MM-DD HH:mm")}</span>
                </div>
            </div>
        </div>

        <hr className="hr-stick" />

        <div className="row mt-4 p-1">
            <div className="col">
                <div
                    className="text-responsive p-4 bg-light rounded border"
                    style={{
                        minHeight: "150px",
                        boxShadow: "0 0 8px rgba(0,0,0,0.05)",
                        whiteSpace: "pre-wrap",
                    }}
                    dangerouslySetInnerHTML={{ __html: notice.noticeContent }}
                ></div>
            </div>
        </div>

        <hr className="mt-4" />

        <div className="row mt-4">
            <div className="col">
                <h6 className="text-responsive fw-bold ms-2">첨부파일</h6>
                {attachList.length > 0 ? (
                    <ul className="list-group">
                        {attachList.map(file => (
                            <li key={file.attachmentNo} className="list-group-item d-flex justify-content-start align-items-center border-0 p-1">
                                <FaRegCircleCheck className="text-success" />
                                <Link to={`http://localhost:8080/api/attachment/${file.attachmentNo}`}
                                    target="_blank" rel="noreferrer" className="text-responsive text-decoration-none ms-1">
                                    {file.attachmentName}
                                </Link>
                                <Link className="btn btn-outline-success text-responsive d-inline-flex align-items-center ps-2 pe-2 pt-1 pb-1 ms-2"
                                    to={`http://localhost:8080/api/attachment/${file.attachmentNo}`}>
                                    <FaCloudDownloadAlt />
                                    <span className="ms-1">{(file.attachmentSize / 1024).toFixed(2)} KB</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-responsive text-muted ms-2">첨부된 파일이 없습니다.</div>
                )}
            </div>
        </div>

        <div className="row mt-4">
            <div className="col d-flex justify-content-between align-items-center flex-wrap">

                {/* 왼쪽 - 수정 & 삭제 */}
                <div className="d-flex align-items-center gap-2">
                    <button type="button" className="btn btn-outline-primary d-flex align-items-center" onClick={moveEdit}>
                        <FaEdit className="me-1" />
                        <span>수정</span>
                    </button>
                    <button type="button" className="btn btn-outline-danger d-flex align-items-center" onClick={openModal}>
                        <FaTrash className="me-1" />
                        <span>삭제</span>
                    </button>
                </div>

                {/* 오른쪽 - 목록 */}
                <div>
                    <button type="button" className="btn btn-outline-dark d-flex align-items-center" onClick={moveList}>
                        <FaListUl className="me-1" />
                        <span>목록</span>
                    </button>
                </div>
            </div>
        </div>


        {/* 태그 선택을 잘 안하는 리액트에서도 모달만큼은 ref로 연결(modal.current = document.querySelector("modal")) */}
        <div className="modal fade" tabIndex="-1" ref={modal} data-bs-backdrop="static"> {/* 모달 바깥쪽 영역. tabinden -> tabIndex */}
            <div className="modal-dialog"> {/* 모달 영역 */}
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">게시글 삭제</h5>
                        <button type="button" className="btn-close" aria-label="Close" onClick={closeModal}></button>
                    </div>
                    <div className="modal-body">
                        <div className="row">
                            <div className="col">삭제하시겠습니까?</div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-danger" onClick={deleteNotice}>삭제</button>
                        <button type="button" className="btn btn-secondary" onClick={closeModal}>취소</button>
                    </div>
                </div>
            </div>
        </div>

    </>);
}