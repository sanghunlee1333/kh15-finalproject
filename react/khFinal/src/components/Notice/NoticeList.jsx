import './NoticeList.css'

import { Link, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import Jumbotron from "../template/Jumbotron";
import moment from "moment";

import { FaSearch, FaTrash } from "react-icons/fa";
import { TbCircleLetterNFilled } from "react-icons/tb";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { Modal } from "bootstrap";
import { FaPencil } from 'react-icons/fa6';

export default function NoticeList() {
    //recoil - 관리자인지 

    //state
    const [notices, setNotices] = useState([]);
    const [column, setColumn] = useState("");
    const [keyword, setKeyword] = useState("");
    const [count, setCount] = useState(0);
    const [page, setPage] = useState(1); //현재 페이지
    const [size, setSize] = useState(10); //고정된 보여줄 게시글 수

    //some = 자바스크립트 배열에 내장된 메서드로, 배열 안에 하나라도 주어진 조건을 만족하는 요소가 있는지 체크해 주는 함수
    //조건을 만족하는 요소가 나오면, 즉시 true를 반환하고 더 이상 나머지 요소는 검사X
    const hasChecked = notices.some(notice => notice.choice);
    const hasCheckedAll = notices.length > 0 && notices.every(notice => notice.choice)
    const totalPage = Math.ceil(count / size); //ceil = 소수점 올림
    const startPage = Math.floor((page - 1) / 5) * 5 + 1; //소수점 버림
    const endPage = Math.min(startPage + 4, totalPage); //최솟값 찾기

    //ref
    const modal = useRef();

    //effect
    //처음 컴포넌트가 로드될때 가져온 게시글을 뿌려주는 함수
    useEffect(() => {
        loadNotices();
    }, [page]);

    //callback
    //게시글 가져오기 함수(+검색 포함)
    const loadNotices = useCallback(async () => {
        //사용자가 선택한 column, 입력한 keyword를 자바스크립트 객체(JSON객체 형태)로 전달
        const params = {
            column: column || null,
            keyword,
            page,
            size
        };

        const resp = await axios.post("/notice/search", params); //서버에 데이터와 함께 요청하고 응답을 받을 때까지 기다림
        // console.log(resp.data);
        setNotices(resp.data.list); //게시글 목록
        setCount(resp.data.count);
    }, [column, keyword, page, size]);

    const searchNotice = useCallback(() => {
        setPage(1); // 먼저 1페이지로 설정하고
        // 비동기 반영을 기다리지 않고 바로 실행
        setTimeout(() => {
            loadNotices(); // 검색 실행
        }, 0);

    }, [column, keyword, size, loadNotices]);

    //체크박스 개별 체크 함수
    const changeNoticeChoice = useCallback((e, target) => { //target은 파라미터 이름일 뿐
        setNotices(notices.map(notice => {

            //target과 notice를 비교해서 일치하는 경우 choice를 변경
            if (notice.noticeNo === target.noticeNo) { //원하는 대상이라면
                return {
                    ...notice, //원래 있던 notice 객체의 모든 속성(key–value 쌍)을 "새 객체" 안에 똑같이 복사
                    choice: e.target.checked //리액트는 객체의 속성만 변하고 객체 자체가 변하지 않으면 렌더링을 하지 않음
                    //(만약) ...notice를 안 쓴다면, 해당 행은 새 객체 { choice: true/false }만 반환하게 되고
                    //원래 notice에 들어 있던 noticeNo, noticeTitle, noticeContent 같은 다른 속성은 모두 사라짐
                    //나중에 notice.noticeNo 같은 필드를 읽으려고 하면 undefined 가 나옴
                }
            }
            return notice; //아니면 통과
        }));
    }, [notices]);

    //체크박스 전체 체크 함수
    const changeNoticeAll = useCallback(e => {
        const isChecked = e.target.checked;
        setNotices(notices =>
            notices.map(
                notice => ({
                    ...notice,
                    choice: isChecked
                })
            )
        );
    }, []);

    /*
    [1] 초기 - choice가 아직 없었다면 이 시점엔 undefined
    {
        noticeNo: 3,
        noticeTitle: "공지",
        noticeContent: "...",
        
    }
    [2] 스프레드 한 뒤 새 객체 - 아직 choice는 없음
    {
        noticeNo: 3,
        noticeTitle: "공지",
        noticeContent: "...",
    }
    [3] choice: e.target.checked 를 추가 후
    {
        noticeNo: 3,
        noticeTitle: "공지",
        noticeContent: "...",
        choice: true (또는 false)
    }
    */

    //게시글 삭제 함수
    const deleteNotice = useCallback(async () => {
        //notices 배열을 순회하며 notice.choice === true 인 공지 객체들만 따로 모아 checkedList라는 새로운 배열을 만듦 
        const checkedList = notices.filter(notice => notice.choice);

        //Promise.all -> 여러 개의 Promise를 하나의 큰 Promise로 묶어 주는 빌트인 함수
        //- 작동 방식 : 배열 안 모든 Promise가 성공해야 Promise.all이 성공으로 끝나고
        //- 만약 하나라도 실패 하면 즉시 실패 상태가 되어 catch 블록(없으면 에러)으로 넘어감
        //(비유) 친구 5명에게 우편을 보내고(요청), 5명 모두 답장 편지를 받을 때까지 기다리기(응답)
        //- 한 명이라도 답장을 안 보내면 실패(에러) 처리
        //- 모두 답장해야 다음 단계로 넘어갈 수 있음
        await Promise.all( //await Promise.all -> Promise가 완료될 때까지 잠시 멈춰서 기다린다는 의미
            //checkedList의 각 공지 객체마다 "삭제 요청"을 보내는 Promise를 반환하는 함수를 실행
            //그래서 map의 결과는 Promise 객체들의 배열이 나옴 -> [ Promise, Promise, ... ]
            checkedList.map(notice => axios.delete(`/notice/${notice.noticeNo}`)) //요청
        );
        closeModal(); //모달 닫기
        loadNotices(); //목록 갱신
    }, [notices]);

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

        <Jumbotron subject="공지 게시판" />

        <div className="row mt-4">
            <div className="col">
                <div className="d-flex justify-content-end">
                    <div className="d-flex align-items-center">
                        <select name="keyword" className="form-select flex-shrink-1 w-30" value={column}
                            onChange={e => setColumn(e.target.value)}>
                            <option value="">선택</option>
                            <option value="notice_title">제목</option>
                            <option value="notice_content">내용</option>
                        </select>
                        <input type="text" className="form-control flex-shrink-1 w-50 ms-2" placeholder="검색어"
                            value={keyword} onChange={e => setKeyword(e.target.value)}
                        />
                        <button type="button" onClick={searchNotice}
                            className="btn btn-secondary ms-2 d-flex flex-shrink-1 w-20 
                                align-items-center justify-content-center text-nowrap">
                            <FaSearch />
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div className="row mt-4">
            <div className="col">
                <ul className="list-group list-group-flush">
                    <li className="list-group-item d-flex align-items-center align-middle text-center fw-bold text-nowrap" style={{ width: '100%' }}>
                        <div style={{ width: '5%' }}>
                            <input type="checkbox" checked={hasCheckedAll} onChange={changeNoticeAll} className="align-middle" />
                        </div>
                        <div className="ms-1 align-middle" style={{ width: '15%' }}>번호</div>
                        <div className="align-middle" style={{ width: '60%' }}>제목</div>
                        <div className="align-middle" style={{ width: '20%' }}>날짜</div>
                    </li>
                    {notices.map(notice => (
                        <li className="list-group-item d-flex align-items-center text-center" key={notice.noticeNo} style={{ width: '100%' }}>
                            <div checked={notice.choice === true} onChange={e => changeNoticeChoice(e, notice)} style={{ width: '5%' }}>
                                <input type="checkbox" checked={notice.choice === true ? true : false}
                                    onChange={(e) => changeNoticeChoice(e, notice)} className="align-middle" />
                            </div>
                            <div className="ms-1" style={{ width: '15%' }}>
                                <span className="align-middle">{notice.noticeNo}</span>
                            </div>
                            <div className="text-start" style={{ width: '60%' }}>
                                <Link className="text-decoration-none d-inline-flex align-items-center align-middle" to={`/notice/detail/${notice.noticeNo}`} style={{ width: '85%' }}>
                                    <span className="align-middle text-truncate" style={{ maxWidth: 'calc(100% - 1.5rem)' }}>{notice.noticeTitle}</span>
                                    {moment(notice.noticeWriteDate).isAfter(moment().startOf('day')) && (
                                        <TbCircleLetterNFilled className="ms-1 text-danger" />
                                    )
                                    }
                                </Link>
                            </div>
                            <div className="align-middle" style={{ width: '20%' }}>
                                {moment(notice.noticeWriteDate).isBefore(moment().startOf('day'))
                                    ? (
                                        <span>{moment(notice.noticeWriteDate).format('YYYY-MM-DD')}</span>
                                    )
                                    : (
                                        <span>{moment(notice.noticeWriteDate).format("HH:mm")}</span>
                                    )
                                }
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>

        <div className="row mt-4">
            <div className="col text-start">
                <Link to="/notice/write" className="btn btn-success">
                    <FaPencil className="align-middle me-1" />
                    <span className="align-middle text-nowrap">작성</span>
                </Link>
                {hasChecked && (
                    <button className="btn btn-danger ms-2" onClick={openModal}>
                        <FaTrash className="align-middle me-1" />
                        <span className="align-middle text-nowrap">삭제</span>
                    </button>
                )}
            </div>
        </div>

        <div className="row mt-4">
            <div className="col">
                <div className="d-flex justify-content-center">
                    {startPage > 1 && (
                        <button onClick={() => setPage(startPage - 1)} className="btn fw-bold pagination-button">
                            <IoIosArrowBack />
                        </button>
                    )}
                    {Array.from({
                        length: endPage - startPage + 1
                    }, (_, i) => startPage + i).map(p => (
                        <button key={p} onClick={() => setPage(p)} className={`btn pagination-button ${p === page ? "btn-primary fw-bold" : ""}`}>{p}</button>
                    ))}
                    {endPage < totalPage && (
                        <button onClick={() => setPage(endPage + 1)} className="btn fw-bold pagination-button">
                            <IoIosArrowForward />
                        </button>
                    )}
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