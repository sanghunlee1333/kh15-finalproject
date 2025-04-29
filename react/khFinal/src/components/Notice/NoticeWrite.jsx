import './NoticeWrite.css'

import { useNavigate } from "react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Modal } from "bootstrap";
import { toast } from "react-toastify";

import { FaPencil } from "react-icons/fa6";

import axios from "axios";
import $ from 'jquery';
window.$ = $;
window.jQuery = $;

export default function NoticeWrite() {
    //ref
    const editor = useRef(null);
    const modal = useRef();
    const fileTag = useRef();

    //navigate
    const navigate = useNavigate();

    //state
    const [notice, setNotice] = useState({
        noticeTitle: "",
        noticeContent: ""
    });
    //const [attach, setAttach] = useState(undefined); //파일 한 개인 경우
    const [attach, setAttach] = useState([]); //파일 여러 개인 경우

    const handleImageUpload = useCallback(async (files)=>{
        console.log("handleImageUpload 호출됨", files);
        for(let i = 0; i < files.length; i++){
            const formData = new FormData();
            formData.append("attach", files[i]);

            try {
                const resp = await axios.post("/attachment/upload", formData, {
                    headers: { "Content-Type" : "multipart/form-data" }
                });
                
                const imageUrl = "http://localhost:8080/api" + resp.data.url; //서버가 보내주는 이미지 URL
                $(editor.current).summernote('insertImage', imageUrl);
            }
            catch (error) {
                toast.error("이미지 업로드에 실패했습니다");
            }
        }
    }, []);

    //effect
    useEffect(()=>{
        if(editor.current) {
            $(editor.current).summernote({
                placeholder: "내용을 입력하세요 (최소 30자, 최대 1,000자)",
                minHeight: 400, //최소높이(px)
                maxHeight: 600, //최대높이(px)
                toolbar: [
                    //['메뉴명', ['버튼명', '버튼명', ...]]
                    ["font", ["style", "fontname", "fontsize", "forecolor", "backcolor"]],
                    ["style", ["bold", "italic", "underline", "strikethrough"]],
                    ["attach", ["picture"]],
                    ["tool", ["ol", "ul", "table", "hr"]],
                    //["action", ["undo", "redo"]],
                ],
                callbacks: {
                    onImageUpload: function(files) { //Summernote는 에디터에 이미지를 끌어다 놓거나 버튼으로 업로드할 때, onImageUpload(files) 이벤트를 호출
                        // for(let i=0; i< files.length; i++){ //files는 업로드된 이미지 파일 객체 배열
                            // handleImageUpload(files[i]); 
                        // }
                        handleImageUpload(files);
                    },
                    onChange: (contents) => {
                        setNotice(prev=>({
                            ...prev,
                            noticeContent: contents
                        })); //summernote 내용 변경 시, 업데이트
                    }
                }
            });
        }

        return ()=>{
            if(editor.current){
                $(editor.current).summernote("destroy");
            }
        };
    }, [handleImageUpload]);

    //callback
    const changeNoticeTitle = useCallback(e=>{
        setNotice(prev=>({
            ...prev,
            noticeTitle: e.target.value
        }));
    }, []);

    const addAttach = useCallback(e=>{
        const newFiles = Array.from(e.target.files);
        setAttach(prev=>{
            const combined = [...prev, ...newFiles];
            // 중복 제거(이름 + 크기로)
            const unique = combined.filter(
                (file, index, self) => 
                    index === self.findIndex(f=>
                        f.name === file.name && f.size === file.size
                    )
            );
            return unique;
        })
    }, []);

    //제출
    const submitNotice = useCallback(async ()=>{
        if(notice.noticeTitle.length < 10 || notice.noticeContent.length < 30){
            openModal();
            return;
        }

        const formData = new FormData();

        if (attach && attach.length > 0) {
            attach.forEach(file => {
               formData.append("attach", file); //같은 이름으로 여러 개 추가
            });
        }

        Object.entries(notice).forEach(([key, value])=>{
            formData.append(key, value);
        });

        try{
            await axios.post("/notice/", formData, {
                headers: {
                    "Content-Type" : "multipart/form-data"
                }
            })
            toast.success("파일이 등록되었습니다");

            setNotice({
                noticeTitle: "",
                noticeContent: ""
            });
            setAttach([]);
            fileTag.current.value = "";
            navigate(`/notice/list`);
        }
        catch(e){
            toast.error("글 작성에서 오류가 발생했습니다");
        }
    }, [notice.noticeTitle, notice.noticeContent, navigate, attach]);

    //작성 취소
    const cancelWrite = useCallback(()=>{
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
        <div className="row">
            <div className="col">
                <FaPencil className="text-info fs-3 fw-bold me-2"/>
                <span className="align-middle fs-3 fw-bold text-nowrap">글 쓰기</span>
                <input type="text" className="form-control bg-outline-secondary text-dark mt-2 me-2" placeholder="제목을 입력하세요 (최소 10자, 최대 100자)" 
                    name="noticeTitle" value={notice.noticeTitle} onChange={changeNoticeTitle}/>
            </div>
        </div>    

        <hr className="hr-stick" />

        <div className="row mt-4">
            <div className="col">
                <textarea ref={editor}></textarea>
            </div>
        </div>

        <hr/>

        <div className="row mt-4">
            <div className="col">
                {/* input[type=file]은 보안 상 value 설정이 불가능 */}
                <input type="file" className="form-control" accept=".png, jpg, jpeg" onChange={addAttach} multiple ref={fileTag}/>
            </div>
        </div>

        <div className="row mt-2">
            <div className="col">
                {Array.isArray(attach) && attach.map((file, i) => (
                <span key={i} className="badge bg-info me-2">{file.name}</span>
                ))}
            </div>
        </div>

        <div className="row mt-3">
            <div className="col text-end">
                <button type="submit" className="btn btn-success" onClick={submitNotice}>제출</button>
                <button type="button" className="btn btn-danger ms-2" onClick={cancelWrite}>취소</button>
            </div>
        </div>

        {/* 태그 선택을 잘 안하는 리액트에서도 모달만큼은 ref로 연결(modal.current = document.querySelector("modal")) */}
        <div className="modal fade" tabIndex="-1" ref={modal} data-bs-backdrop="static"> {/* 모달 바깥쪽 영역. tabinden -> tabIndex */}
            <div className="modal-dialog"> {/* 모달 영역 */} 
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">알림</h5>
                        <button type="button" className="btn-close" aria-label="Close" onClick={closeModal}></button>
                    </div>
                    <div className="modal-body">
                        <div className="row">
                            <div className="col">제목은 최소 10자, 내용은 30자 이상 작성하셔야 합니다</div>
                        </div>
                    </div>  
                    <div className="modal-footer">
                        <button type="button" className="btn btn-success" onClick={closeModal}>확인</button>
                    </div>
                </div>
            </div>
        </div>

    </>);
}