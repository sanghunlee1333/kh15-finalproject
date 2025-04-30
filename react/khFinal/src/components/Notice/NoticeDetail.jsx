import { useNavigate, useParams } from "react-router";
import Jumbotron from "../template/Jumbotron";
import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";

import { FaRegCircleCheck } from "react-icons/fa6";
import { MdNotificationImportant } from "react-icons/md";
import { FaCloudDownloadAlt } from "react-icons/fa";
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
        <Jumbotron subject="게시글 상세"/>
        
        <div className="row mt-4">
            <div className="col">
                <MdNotificationImportant className="text-danger align-middle"/>
                <span className="ms-1 align-middle">공지 게시판</span>
            </div>
        </div>

        <div className="row mt-2">
            <div className="col">
                <h1 className="inline-block" style={{ marginBottom: 0 }}>{notice.noticeTitle}</h1>
                <span className="text-secondary">{moment(notice.noticeWriteDate).format("YYYY-MM-DD HH:mm")}</span>
            </div>
        </div>

        <hr/>

        <div className="row mt-4">
            <div className="col">
                <div dangerouslySetInnerHTML={{ __html: notice.noticeContent }}></div>
            </div>
        </div>

        <hr className="mt-2"/>

        <div className="row mt-4">
            <div className="col">
                <h6 className="fw-bold">첨부파일</h6>
                {attachList.length > 0 ? (
                    <ul className="list-group">
                        {attachList.map(file=>(
                        <li key={file.attachmentNo} className="list-group-item d-flex justify-content-start align-items-center border-0 p-1">
                            <FaRegCircleCheck className="text-success"/>
                            <a href={`http://localhost:8080/api/attachment/${file.attachmentNo}`} 
                                target="_blank" rel="noreferrer" className="text-decoration-none ms-1">
                                {file.attachmentName}
                            </a>
                            <span className="badge bg-secondary ms-2 p-2 fw-semibold d-inline-flex align-items-center">
                                <FaCloudDownloadAlt className="me-1" />
                                {(file.attachmentSize / 1024).toFixed(1)} KB
                            </span>
                        </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-muted">첨부된 파일이 없습니다</div>
                )}
            </div>
        </div>

        <div className="row mt-4">
            <div className="col text-end">
                <button type="button" className="btn btn-danger align-items-center" onClick={openModal}>
                    <FaTrash className="align-middle me-1" />
                    <span className="align-middle text-nowrap">삭제</span>
                </button>
                <button type="button" className="btn btn-secondary align-items-center ms-2" onClick={moveList}>
                    <FaListUl className="align-middle me-1" />
                    <span className="align-middle text-nowrap">목록</span>
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