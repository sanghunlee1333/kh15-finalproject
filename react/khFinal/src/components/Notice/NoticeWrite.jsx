import './NoticeWrite.css'

import { useNavigate } from "react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Modal } from "bootstrap";
import { toast } from "react-toastify";

import { FaCheck, FaPencil, FaRegCircleXmark } from "react-icons/fa6";
import { RiArrowGoBackFill } from "react-icons/ri";

import axios from "axios";
import $ from 'jquery';
import { userDepartmentState } from '../utils/stroage';
import { useRecoilValue } from 'recoil';
window.$ = $;
window.jQuery = $;

export default function NoticeWrite() {

    //recoil
    const userDepartment = useRecoilValue(userDepartmentState);

    //ref
    const editor = useRef(null);
    const modal = useRef();
    const titleInput = useRef();
    const attachInput = useRef();
    
    //navigate
    const navigate = useNavigate();

    //state
    const [notice, setNotice] = useState({
        noticeType: "",
        noticeTitle: "",
        noticeContent: ""
    });
    const [attach, setAttach] = useState([]); //일반 첨부파일 (input)

    const [editorFiles, setEditorFiles] = useState([]);

    const editorImageUpload = useCallback((files) => {
        const fileArray = Array.from(files);
        fileArray.forEach(file => {
            const localUrl = URL.createObjectURL(file); // 미리보기용 URL
            $(editor.current).summernote('insertImage', localUrl);
            setEditorFiles(prev => [...prev, file]); // 서버 업로드 안 함
        });
    }, []);

    //effect
    //글쓰기 페이지 진입 자체를 막기
    useEffect(() => {
        if (userDepartment !== "인사") {
            toast.error("인사팀만 작성이 가능합니다");
            navigate("/notice/list");
        }
    }, [userDepartment, navigate]);

    useEffect(()=>{
        if(editor.current) {
            $(editor.current).summernote({
                placeholder: "내용 입력 (1 ~ 1,000자 입력 가능)",
                height: 300,
                minHeight: 400, //최소높이(px)
                maxHeight: 600, //최대높이(px)
                toolbar: [
                    //['메뉴명', ['버튼명', '버튼명', ...]]
                    ["font", ["style", "fontname", "fontsize", "forecolor", "backcolor"]],
                    ["style", ["bold", "italic", "underline", "strikethrough"]],
                    ["attach", ["picture"]],
                    ["tool", ["ol", "ul", "table", "hr"]],
                ],
                callbacks: {
                    onImageUpload: editorImageUpload,
                    onChange: (contents) => {
                        setNotice(prev=>({
                            ...prev,
                            noticeContent: contents
                        }));
                    },
                }
            });
        }
        return ()=>{
            if(editor.current){
                $(editor.current).summernote("destroy");
            }
        };
    }, [editorImageUpload]);

    //callback
    const changeNoticeType = useCallback(e=>{
        setNotice(prev=>({
            ...prev,
            noticeType: e.target.value
        }));
    }, []);

    const changeNoticeTitle = useCallback(e=>{
        setNotice(prev=>({
            ...prev,
            noticeTitle: e.target.value
        }));
    }, []);

    //일반 파일첨부
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
            e.target.value = "";
            return unique;
        })
    }, []);

    //일반 파일첨부 삭제
    const deleteAttach = useCallback((index)=>{
        setAttach(prev=>prev.filter((_, i) => i !== index));
    }, []);

    //제출
    const submitNotice = useCallback(async () => {
        if (notice.noticeTitle.length < 10 || notice.noticeContent.length < 30) {
            openModal();
            return;
        }
    
        const formData = new FormData();
    
        //일반 첨부파일 추가
        attach.forEach(file => {
            formData.append("attach", file);
        });

        // Summernote 이미지 파일 업로드
        const uploadedUrls = [];
        const editorAttachmentNo = [];

        for (let i = 0; i < editorFiles.length; i++) {
            const file = editorFiles[i];

            // 1. 저장 (한 번만)
            const uploadForm = new FormData();
            uploadForm.append("attach", file);
            const resp = await axios.post("/attachment/upload", uploadForm);

            // 2. 업로드된 파일의 번호 저장
            const attachmentNo = resp.data.attachmentNo;
            uploadedUrls.push(`http://localhost:8080/api/attachment/${attachmentNo}`);
            editorAttachmentNo.push(attachmentNo); 
        }

        // Summernote 내용에서 local blob URL을 실제 URL로 바꾸기
        const parser = new DOMParser();
        const doc = parser.parseFromString(notice.noticeContent, "text/html");
        const imgs = doc.querySelectorAll("img");

        let idx = 0;
        imgs.forEach(img => {
            // blob: 주소만 바꾼다 → 서버에서 업로드된 것만
            if (img.src.startsWith("blob:")) {
                img.setAttribute("src", uploadedUrls[idx++]);
            }
        });

        const updatedContent = doc.body.innerHTML;
        
        // notice 정보 추가
        formData.append("noticeType", notice.noticeType);
        formData.append("noticeTitle", notice.noticeTitle);
        formData.append("noticeContent", updatedContent);
        
        //서머노트 첨부 attachmentNo들만 전송
        editorAttachmentNo.forEach(attachmentNo => {
            formData.append("editorImage", attachmentNo);
        });

        try {
            await axios.post("/notice/", formData);

            //성공 시 알림
            toast.success("게시글이 등록되었습니다");

            //비우기
            setNotice({ 
                noticeType: "", 
                noticeTitle: "", 
                noticeContent: "" 
            });
            setAttach([]);
            attachInput.current.value = "";
            setEditorFiles([]);

            //게시판 리스트로 이동
            navigate("/notice/list");
        } catch (e) {
            toast.error("작성 중 오류가 발생했습니다");
        }
    }, [notice, attach, editorFiles, navigate]);

    //작성 취소
    const cancelWrite = useCallback(()=>{
        navigate("/notice/list");
    }, [navigate]);

    //모달 열기/닫기
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
                <select className="form-select text-responsive mt-2" onChange={changeNoticeType} value={notice.noticeType}>
                    <option value="">말머리 선택</option>
                    <option>[안내]</option>
                    <option>[긴급]</option>
                    <option>[행사]</option>
                    <option>[점검]</option>
                    <option>[인사]</option>
                    <option>[채용]</option>
                    <option>[주의]</option>
                    <option>[필독]</option>
                    <option>[기타]</option>
                    <option>[FAQ]</option>
                </select>
                <input type="text" className="form-control text-responsive bg-outline-secondary text-dark mt-2 me-2" placeholder="제목 입력 (최소 10자, 최대 100자)" 
                    name="noticeTitle" value={notice.noticeTitle} onChange={changeNoticeTitle} ref={titleInput}/>
            </div>
        </div>    

        <hr className="hr-stick" />

        <div className="row mt-4">
            <div className="col editor-container">
                <textarea ref={editor}></textarea>
            </div>
        </div>

        <hr/>

        <div className="row mt-4">
            <div className="col">
                {/* input[type=file]은 보안 상 value 설정이 불가능 */}
                <input type="file" className="form-control text-responsive" accept=".png,.jpg,.jpeg,.txt,.pdf,.doc,.docx,.hwp,.ppt,.pptx,.xls,.xlsx,.zip,.7z"
                    onChange={addAttach} multiple ref={attachInput}/>
                <div className="text-secondary text-responsive mt-2">* 파일 용량은 최대 10MB까지 업로드 가능합니다.</div>
                <div className="text-secondary text-responsive">* 업로드 가능한 파일 확장자</div>
                <div className="text-secondary text-responsive">- 이미지 : .png, .jpg, .jpeg</div>
                <div className="text-secondary text-responsive">- 문서 : .txt, .pdf, .doc, .docx, .hwp, .ppt, .pptx, .xls, .xlsx</div>
                <div className="text-secondary text-responsive">- 압축파일 : .zip, .7z</div>
            </div>
        </div>

        <div className="row mt-2">
            <div className="col">
                {attach.map((file, i) => (
                <span key={i} className="d-flex align-items-center text-responsive mt-1">
                    <span className="btn btn-outline-success btn-sm text-start">{file.name}</span>
                    <FaRegCircleXmark className="text-danger ms-1" onClick={()=>deleteAttach(i)} role="button" style={{ cursor: "pointer" }}/>
                </span>
                ))}
            </div>
        </div>

        <div className="row mt-3">
            <div className="col d-flex align-items-center justify-content-end">
                <button type="submit" className="btn btn-success text-responsive d-flex align-items-center" onClick={submitNotice}>
                    <FaCheck />
                    <span className="ms-1">제출</span>
                </button>
                <button type="button" className="btn btn-danger text-responsive d-flex align-items-center ms-2" onClick={cancelWrite}>
                    <RiArrowGoBackFill />
                    <span className="ms-1">취소</span>
                </button>
            </div>
        </div>

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