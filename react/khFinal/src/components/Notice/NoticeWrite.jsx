import { useNavigate } from "react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import $ from 'jquery';
import axios from "axios";
window.$ = $;
window.jQuery = $;

export default function NoticeWrite() {
    //ref
    const editor = useRef(null);

    //navigate
    const navigate = useNavigate();

    //state
    const [noticeTitle, setNoticeTitle] = useState("");
    const [noticeContent, setNoticeContent] = useState("");

    //effect
    useEffect(()=>{
        if(editor.current) {
            $(editor.current).summernote({
                placeholder: "내용을 입력하세요 (한글 기준 최대 1,000자)",
                minHeight: 400, //최소높이(px)
                maxHeight: 600, //최대높이(px)
                toolbar: [
                    //['메뉴명', ['버튼명', '버튼명', ...]]
                    ["font", ["style", "fontname", "fontsize", "forecolor", "backcolor"]],
                    ["style", ["bold", "italic", "underline", "strikethrough"]],
                    ["attach", ["picture"]],
                    ["tool", ["ol", "ul", "table", "hr", "fullscreen"]],
                    //["action", ["undo", "redo"]],
                ],
                callbacks: {
                    onChange: (contents) => {
                        setNoticeContent(contents); //summernote 내용 변경 시, 업데이트
                    }
                }
            });
        }

        return ()=>{
            if(editor.current){
                $(editor.current).summernote("destroy");
            }
        };
    }, []);

    //callback
    const changeNoticeTitle = useCallback(e=>{
        setNoticeTitle(e.target.value);
    }, []);

    //제출
    const submitNotice = useCallback(()=>{
        axios.post("/notice/", {
            noticeTitle : noticeTitle,
            noticeContent : noticeContent
        })
        .then(resp=>{
            navigate(`/notice/list`);
        });
    }, [noticeTitle, noticeContent, navigate]);

    //작성 취소
    const cancelWrite = useCallback(()=>{
        navigate("/notice/list");
    }, [navigate]);

    //view
    return(<>
        <div className="row">
            <div className="col">
                <input type="text" className="form-control bg-outline-secondary text-dark" placeholder="제목을 입력하세요 (한글 기준 최대 100자)" 
                    name="noticeTitle" value={noticeTitle} onChange={changeNoticeTitle}/>
            </div>
        </div>

        <div className="row mt-4">
            <div className="col">
                <textarea ref={editor}></textarea>
            </div>
        </div>

        <div className="row mt-2">
            <div className="col text-end">
                <button type="submit" className="btn btn-success" onClick={submitNotice}>제출</button>
                <button type="button" className="btn btn-danger ms-2" onClick={cancelWrite}>취소</button>
            </div>
        </div>
    </>);
}