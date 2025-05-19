import './NoticeWrite.css'

import { useNavigate, useParams } from "react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Modal } from "bootstrap";
import { toast } from "react-toastify";

import { FaCheck, FaPencil, FaRegCircleXmark } from "react-icons/fa6";

import axios from "axios";
import $ from 'jquery';
import { RiArrowGoBackFill } from 'react-icons/ri';
window.$ = $;
window.jQuery = $;

export default function NoticeWrite() {

    //ref
    const editor = useRef(null);
    const modal = useRef();
    const titleInput = useRef();
    const attachInput = useRef();

    //param
    const { noticeNo } = useParams();
    
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
    const [deleteAttach, setDeleteAttach] = useState([]);
    const [deleteEditorImage, setDeleteEditorImage] = useState([]);

    const editorImageUpload = useCallback((files) => {
        const fileArray = Array.from(files);
        fileArray.forEach(file => {
            const localUrl = URL.createObjectURL(file); // 미리보기용 URL
            $(editor.current).summernote('insertImage', localUrl);
            setEditorFiles(prev => [...prev, file]); // 서버 업로드 안 함
        });
    }, []);

    //effect
    useEffect(()=>{
      axios.get(`/notice/${noticeNo}`).then(resp=>setNotice(resp.data));
      axios.get(`/notice/${noticeNo}/attach`).then(resp=>setAttach(resp.data));
    }, [noticeNo]);

    useEffect(()=>{
      if(notice.noticeContent && editor.current){
        $(editor.current).summernote("code", notice.noticeContent);
      }
    }, [notice.noticeContent]);

    useEffect(()=>{
        if(editor.current) {
            $(editor.current).summernote({
                placeholder: "내용 입력 (1 ~ 1,000자 입력 가능)",
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
                    onMediaDelete: function(target) {
                      const src = target[0].src;
                      const match = src.match(/\/api\/attachment\/(\d+)/);
                      if (match) {
                        const attachmentNo = parseInt(match[1]);
                        setDeleteEditorImage(prev => [...prev, attachmentNo]);
                      }
                    },
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
    const addAttachFile = useCallback(e=>{
      setAttach(
        prev => [
          ...prev, 
          ...Array.from(e.target.files)
        ]
      );
    }, []);

    //일반 파일첨부 삭제
    const deleteAttachFile = useCallback((index)=>{
        setDeleteAttach(prev=>[...prev, attach[index].attachmentNo]);
        setAttach(prev=>prev.filter((_, i) => i !== index));
    }, [attach]);

    //제출
    const editNotice = useCallback(async () => {
        if (notice.noticeTitle.length < 10 || notice.noticeContent.length < 30) {
            openModal();
            return;
        }
    
        const formData = new FormData();
    
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
            else {
              const match = img.src.match(/\/api\/attachment\/(\d+)/);
              if(match){
                const attachmentNo = parseInt(match[1]);
                editorAttachmentNo.push(attachmentNo);
              }
            }
        });

        const updatedContent = doc.body.innerHTML;
        
        // notice 정보 추가
        formData.append("noticeNo", noticeNo);
        formData.append("noticeType", notice.noticeType);
        formData.append("noticeTitle", notice.noticeTitle);
        formData.append("noticeContent", updatedContent);
        
        // 일반 첨부파일 추가 (추가된 것만 formData에)
        const newFiles = attach.filter(file => !file.attachmentNo);
        newFiles.forEach(file => {
          formData.append("attach", file);
        });

        // 삭제 요청 파일 번호 전송
        const uniqueDeleteAttach = [...new Set(deleteAttach)];
          uniqueDeleteAttach.forEach(attachmentNo => {
          formData.append("deleteAttach", attachmentNo);
        });

        // 중복 제거 후 전송
        const uniqueEditorNo = [...new Set(editorAttachmentNo)];
          uniqueEditorNo.forEach(attachmentNo => {
          formData.append("editorImage", attachmentNo);
        });

        deleteAttach.forEach(attachmentNo => {
          formData.append("deleteAttach", attachmentNo);
        });

        deleteEditorImage.forEach(attachmentNo => {
          formData.append("deleteEditorImage", attachmentNo);
        });

        try {
            await axios.post("/notice/edit", formData);

            //성공 시 알림
            toast.success("게시글이 수정되었습니다");

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
            navigate(`/notice/detail/${noticeNo}`);
        } catch (e) {
            toast.error("작성 중 오류가 발생했습니다");
        }
    }, [notice, attach, editorFiles, deleteAttach, deleteEditorImage, navigate]);

    //작성 취소
    const cancelWrite = useCallback(()=>{
        navigate(`/notice/detail/${noticeNo}`);
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
                <span className="align-middle fs-3 fw-bold text-nowrap">글 수정</span>
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
            <div className="col">
                <textarea ref={editor}></textarea>
            </div>
        </div>

        <hr/>

        <div className="row mt-4">
            <div className="col">
                {/* input[type=file]은 보안 상 value 설정이 불가능 */}
                <input type="file" className="form-control text-responsive" accept=".png,.jpg,.jpeg,.txt,.pdf,.doc,.docx,.hwp,.ppt,.pptx,.xls,.xlsx,.zip,.7z"
                    onChange={addAttachFile} multiple ref={attachInput}/>
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
                    <span className="btn btn-outline-success text-start btn-sm">{file.attachmentName || file.name}</span>
                    <FaRegCircleXmark className="text-danger ms-1" onClick={()=>deleteAttachFile(i)} role="button" style={{ cursor: "pointer" }}/>
                </span>
                ))}
            </div>
        </div>

        <div className="row mt-3">
            <div className="col d-flex align-items-center justify-content-end">
                <button type="submit" className="btn btn-success text-responsive d-flex align-items-center" onClick={editNotice}>
                  <FaCheck />
                  <span className="ms-1">수정</span>
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