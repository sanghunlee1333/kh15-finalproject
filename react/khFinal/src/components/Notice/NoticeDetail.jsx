import { useNavigate, useParams } from "react-router";
import Jumbotron from "../template/Jumbotron";
import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";

import { MdNotificationImportant } from "react-icons/md";
import moment from "moment";
import { Modal } from "bootstrap";

export default function NoticeDetail() {
    //param
    const {noticeNo} = useParams();

    //ref
    const modal = useRef();

    //state
    const [notice, setNotice] = useState({});

    //navigate
    const navigate = useNavigate();

    //effect
    useEffect(()=>{
        loadNotice();
    }, []);

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
                {/* <span className="text-secondary">번호 : {notice.noticeNo}번</span> */}
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

        <hr className="mt-4"/>

        <div className="row mt-4">
            <div className="col text-end">
                <button type="button" className="btn btn-danger" onClick={openModal}>삭제</button>
                <button type="button" className="btn btn-info ms-2" onClick={moveList}>목록</button> 
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