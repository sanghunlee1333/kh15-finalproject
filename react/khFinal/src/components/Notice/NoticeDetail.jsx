import typeMap from "./typeMap";
import './NoticeDetail.css'

import { Link, useNavigate, useParams } from "react-router";
import Jumbotron from "../template/Jumbotron";
import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";

import { FaRegCircleCheck } from "react-icons/fa6";
import { FaCloudDownloadAlt, FaEdit } from "react-icons/fa";
import moment from "moment";
import { Modal } from "bootstrap";
import { FaTrash } from "react-icons/fa";
import { FaListUl } from "react-icons/fa6";

export default function NoticeDetail() {
    //param
    const {noticeNo} = useParams();

    //ref
    const modal = useRef();

    //state
    const [notice, setNotice] = useState({});
    const [attachList, setAttachList] = useState([]);

    const meta = typeMap[notice.noticeType] || {};

    //navigate
    const navigate = useNavigate();

    //effect
    useEffect(()=>{
        loadNotice();
    }, []);

    useEffect(()=>{
        axios.get(`/notice/${noticeNo}/attach`)
            .then(resp=>setAttachList(resp.data));
    }, [noticeNo]);

    //callback
    const loadNotice = useCallback(async ()=>{
        const {data} = await axios.get(`notice/${noticeNo}`);
        setNotice(data);
    }, []);

    const deleteNotice = useCallback(async ()=>{
        await axios.delete(`/notice/${notice.noticeNo}`);
        closeModal();
        navigate("/notice/list");
    }, [notice, navigate]);

    const moveList = useCallback(()=>{
        navigate("/notice/list");
    }, [navigate]);

    const moveEdit = useCallback(()=>{
        navigate(`/notice/edit/${noticeNo}`);
    }, [navigate]);

    const openModal = useCallback(()=>{
        if (!modal.current) return;
        const target = Modal.getOrCreateInstance(modal.current);
        target.show();
    }, [modal]);
    const closeModal = useCallback(()=>{
        const target = Modal.getInstance(modal.current);
        if(target !== null) target.hide();
    }, [modal]);

    //view
    return(<>
        <Jumbotron subject="공지 게시판"/>
        
        <div className="row mt-4">
            <div className="col">
                <span className="d-flex align-items-center fw-semibold ms-1" style={{ color: meta.color }}>
                    <span className="icon-responsive">{meta.icon?.()}</span>
                    <span className="text-responsive">{notice.noticeType}</span>
                </span>
            </div>
        </div>

        <div className="row mt-1">
            <div className="col">
                <h1 className="text-responsive-title mb-0">{notice.noticeTitle}</h1>
                <div className="d-flex justify-content-between mt-1">
                    <span className="text-responsive text-end">{notice.noticeWriterName}</span>
                    <span className="text-responsive text-secondary text-end">{moment(notice.noticeWriteDate).format("YYYY-MM-DD HH:mm")}</span>
                </div>
            </div>
        </div>

        <hr/>

        <div className="row mt-4">
            <div className="col">
                <div className="text-responsive" dangerouslySetInnerHTML={{ __html: notice.noticeContent }}></div>
            </div>
        </div>

        <hr className="mt-4"/>

        <div className="row mt-4">
            <div className="col">
                <h6 className="text-responsive fw-bold">첨부파일</h6>
                {attachList.length > 0 ? (
                    <ul className="list-group">
                        {attachList.map(file=>(
                        <li key={file.attachmentNo} className="list-group-item d-flex justify-content-start align-items-center border-0 p-1">
                            <FaRegCircleCheck className="text-success"/>
                            <Link to={`http://localhost:8080/api/attachment/${file.attachmentNo}`} 
                                target="_blank" rel="noreferrer" className="text-responsive text-decoration-none ms-1">
                                {file.attachmentName}
                            </Link>
                            <Link className="btn btn-outline-info text-responsive d-inline-flex align-items-center ps-2 pe-2 pt-1 pb-1 ms-2"
                                to={`http://localhost:8080/api/attachment/${file.attachmentNo}`}>
                                <FaCloudDownloadAlt className="icon-responsive" />
                                <span className="ms-1">{(file.attachmentSize / 1024).toFixed(2)} KB</span>
                            </Link>
                        </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-responsive text-muted">첨부된 파일이 없습니다</div>
                )}
            </div>
        </div>

        <div className="row mt-4">
            <div className="col d-flex align-items-center justify-content-end">
                <button type="button" className="btn btn-success text-responsive d-flex align-items-center" onClick={moveEdit}>
                    <FaEdit className="icon-responsive me-1" />
                    <span className="text-responsive text-nowrap">수정</span>
                </button>
                <button type="button" className="btn btn-danger text-responsive d-flex align-items-center ms-2" onClick={openModal}>
                    <FaTrash className="icon-responsive me-1" />
                    <span className="text-responsive text-nowrap">삭제</span>
                </button>
                <button type="button" className="btn btn-secondary text-responsive d-flex align-items-center ms-2" onClick={moveList}>
                    <FaListUl className="icon-responsive me-1" />
                    <span className="text-responsive text-nowrap">목록</span>
                </button> 
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