import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Jumbotron from "../template/Jumbotron";
import axios from "axios";
import { FaImage, FaMagnifyingGlass, FaTrash } from "react-icons/fa6";
import {Modal} from "bootstrap";
import dayjs from 'dayjs';
import { Link } from "react-router";

export default function MemberList(){
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(2);
    const [search, setSearch] = useState({
        memberNo:"",
        memberId:"", memberName:"", memberDepartment:"", memberRank:"", memberContact:"", memberEmail:"",
        beginRow:1, endRow:2, order:"", column:null, keyword:null, memberDepartmentCk:"",
    });
    const [searching, setSearching] = useState({
        col:"", key:"",
    })
    const [members, setMembers] = useState([])
    const [blockSize, setBlockSize] = useState(5);
    const [count, setCount] = useState("");
   
    useEffect(()=>{loadList()},[])
    const loadList = useCallback(async()=>{
       const resp = await axios.post("/admin/member", search);
       setMembers(resp.data.list);
       setCount(resp.data.count);
    },[])

    const selectColumn = useCallback((e)=>{
        const value = e.target.value;
        setSearching((prev)=>({
            ...prev,
            col:value,
        }));
    },[]);

    const setKeyword = useCallback((e)=>{
        const value = e.target.value;
        setSearching((prev)=>({
            ...prev,
            key:value,
        }));
    },[])

    const sendSearch = useCallback(async ( ) => {
        const beginRow = (currentPage - 1) * pageSize + 1;
        const endRow = currentPage * pageSize;
       
        const newSearch = {
            ...search,
            column: searching.col,
            keyword: searching.key,
            beginRow: beginRow,
            endRow: endRow,
        };
    
        setSearch(newSearch);
        
        try {
            setCurrentPage(1);   
        } catch (err) {
            
        } finally{
            const resp = await axios.post("/admin/member", newSearch);
            setMembers(resp.data.list);
            setCount(resp.data.count);
           
        }
    }, [search, searching, currentPage, pageSize]);

    const changePage = useCallback(async (target) => {
        setCurrentPage(target);
        const beginRow = (target - 1) * pageSize + 1;
        const endRow = target * pageSize;
      
        const newSearch = {
            ...search,
            column: searching.col,
            keyword: searching.key,
            beginRow: beginRow,
            endRow: endRow,
        };
    
        setSearch(newSearch);
    
        try {
            const resp = await axios.post("/admin/member", newSearch);
            setMembers(resp.data.list);
            setCount(resp.data.count);
            
        } catch (err) {
            
        }
    }, [search, searching, currentPage, pageSize]);

    useEffect(()=>{

    },[currentPage])

    useEffect(()=>{
        const beginRow = (currentPage - 1) * pageSize +1;
        const endRow= currentPage * pageSize;

        setSearch((prev)=>({
            ...prev,
            beginRow:beginRow,
            endRow:endRow,
        }));
    },[currentPage, pageSize]);

    const getBeginBlock = (currentPage, blockSize) => {
        return Math.floor((currentPage - 1) / blockSize) * blockSize + 1;
    }
    
    const getFinishBlock = (currentPage, blockSize, count, pageSize) => {
        const number = Math.floor((currentPage - 1) / blockSize) * blockSize + blockSize;
        const totalPages = Math.ceil(count / pageSize);
        return Math.min(number, totalPages);
    };

    const [start, setStart] = useState("");
    const [end, setEnd] = useState("");
    const [numbers, setNumbers] = useState([]);
    useEffect(()=>{
        setStart(getBeginBlock(currentPage, blockSize));
        setEnd(getFinishBlock(currentPage, blockSize, count, pageSize));
    },[currentPage, blockSize, count, pageSize])

    useEffect(()=>{
        if(start !== null && end !== null){
            const newNumbers = Array.from({ length: end - start + 1 }, (_, index) => start + index);
            setNumbers(newNumbers);
        }
    },[start, end]);

    const orderClick = useCallback(async (orderColumn)=>{
        const beginRow = (currentPage - 1) * pageSize + 1;
        const endRow = currentPage * pageSize;
    
        const newSearch = {
            ...search,
            column: searching.col,
            keyword: searching.key,
            beginRow,
            endRow,
            order: orderColumn
        };
    
        setSearch(newSearch);
    
        try {
            const resp = await axios.post("/admin/member", newSearch);
            setMembers(resp.data.list);
            setCount(resp.data.count);
            setCurrentPage(1)
        } catch (err) {
           
        }
    }, [search, searching, currentPage, pageSize]);


    const prevButton = useCallback(()=>{
        if(start > 1){

            changePage(start-1);
        }else{changePage(1)};

        //changePage(end+1);
        //console.log(count +  "  " + currentPage);
    },[start, end, currentPage, pageSize]);
    const nextButton = useCallback(()=>{
        const totalPages = Math.ceil(count / pageSize);
       // console.log(totalPages);
        if(totalPages > end+1){

            changePage(end+1);
        }
        else{
            changePage(totalPages);
        }


    },[start, end, currentPage]);

    const [selectedMember, setSelectedMember] = useState("")
    const [selectedDeleteMember, setSelectedDeleteMember] = useState(0);
    const modal = useRef(); 
    const deleteModal = useRef();

    const openModal = useCallback((member)=>{
        setSelectedMember(member);
        const target = Modal.getOrCreateInstance(modal.current);
        target.show();
    },[modal, members])

    const closeModal = useCallback(()=>{
        const target = Modal.getInstance(modal.current);
        target.hide();
    },[modal])


    const memberDelete = useCallback( (member)=>{ // 쓰레기통(삭제버튼) 클릭
        setSelectedDeleteMember(member.memberNo);
        openDeleteModal();
    },[members])
   

    const openDeleteModal = useCallback(()=>{

        const target = Modal.getOrCreateInstance(deleteModal.current);
        target.show();

    },[deleteModal])
    const closeDeleteModal = useCallback(()=>{
        
            const target = Modal.getInstance(deleteModal.current);
            if (target) target.hide();
       
    },[deleteModal])

    const sendMemberNo = useCallback( async ()=>{ // 예 버튼
              
                 await axios.delete("/admin/member/"+selectedDeleteMember);
        closeDeleteModal();
       setCurrentPage(1);
       loadList();
    },[members, selectedDeleteMember])

   // useEffect(()=>{console.log(count)},[count])
   // useEffect(()=>{console.log(searching)},[searching])
    //useEffect(()=>{console.log(search.column + "  " + search.keyword)},[search])
    // 그냥 함수
    const transDate = (dateStr) => dayjs(dateStr).format('YYYY-MM-DD'); 
    const lastPage = numbers.length > 0 ? numbers[numbers.length - 1] : null;
    // view
    return(<>
        <Jumbotron subject="사원 리스트"/>
        
       
        <div className="row mt-4">
            <div className="col">
                <button className="btn btn-light" onClick={() => orderClick("memberName")}>이름순</button>
                <button className="btn btn-light" onClick={() => orderClick("memberJoin")}>가입순</button>
            </div>
        </div>

        

     
        <div className="row mt-4">
            <div className="col d-flex">
                <div className="ms-auto d-flex align-items-center">
                <select className="form-select w-auto" onChange={selectColumn} >
                    
                      <option value="">선택하세요</option>
                            <option value="memberId">아이디</option>
                            <option value="memberName">이름</option>
                            <option value="memberDepartment">부서</option>
                            <option value="memberRank">직급</option>
                            {/* <option value="memberContact">연락처</option>
                            <option value="memberEmail">이메일</option> */}
                </select>

                <input
                    type="text"
                    className="form-control w-auto"
                    maxLength={10}
                    placeholder="검색어를 입력해주세요"
                    onBlur={setKeyword}
                />
                <button className="btn btn-outline-secondary" onClick={sendSearch}>
                    <FaMagnifyingGlass />
                </button>
                </div>
            </div>
        </div>
        
        <div className="row">
            <div className="col">
               
            </div>
        </div>

        <div className="row mt-4">
            <div className="col">
            <table className="table table-hover">
                <thead>
                    <tr>
                        <th style={{ width: "10%" }}>아이디</th>
                        <th style={{ width: "10%" }}>이름</th>
                        <th style={{ width: "10%" }}>부서</th>
                        <th style={{ width: "10%" }}>직급</th>
                        {/* <th style={{ width: "15%" }}>연락처</th>
                        <th style={{ width: "20%" }}>이메일</th> */}
                        <th style={{ width: "15%" }}>가입일</th>
                        <th style={{ width: "10%" }}>관리</th>
                    </tr>
                </thead>
                <tbody>
                {(members && members.length > 0) ? (
                    members.map(member => (
                        <tr key={member.memberNo}>
                            <td>{member.memberId}</td>
                            <td><Link  style={{ textDecoration: 'none', color: 'inherit' }} to={`/admin/member/${member.memberNo}`}>{member.memberName}</Link></td>
                            <td>{member.memberDepartment}</td>
                            <td>{member.memberRank}</td>
                            {/* <td>{member.memberContact}</td>
                            <td>{member.memberEmail}</td> */}
                            <td>{transDate(member.memberJoin)}</td>
                            <td>
                            <FaTrash className="text-danger" onClick={e => memberDelete(member)} />
                                <FaImage className="ms-1 text-warning" onClick={e => openModal(member)} />
                           
                            </td>
                        </tr>
                    ))
                    ) : (
                        <tr>
                            <td colSpan="8" className="text-center">검색결과 없음!</td>
                        </tr>
                    )} 
                </tbody>
                
                </table>


                <div className="modal fade" tabIndex="-1" role="dialog" ref={modal} data-bs-backdrop="static">
                    <div className="modal-dialog modal-xl" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                        <h5 className="modal-title">{selectedMember.memberName}님의 첨부파일</h5>
                        
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" >
                        </button>
                        </div>
                        <div className="modal-body">
                           
                            <div className="row mt-1">
                                <div className="col">
                                    <h4>주민등록증 혹은 주민등록등본</h4>
                                </div>
                                <div className="d-flex">
                                    <button className="btn btn-success  ms-auto"><span>사진(들)을 선택</span></button>
                                </div>
                            </div>
                            <hr/>
                            <div className="row mt-1">
                                <div className="col">
                                    <h4>통장사본</h4>
                                </div>
                                <div className="d-flex">
                                    <button className="btn btn-success  ms-auto"><span>사진(들)을 선택</span></button>
                                </div>
                            </div>
                            <hr/>
                            <div className="row mt-1">
                                <div className="col">
                                    <h4>근로계약서</h4>
                                </div>
                                <div className="d-flex">
                                    <button className="btn btn-success  ms-auto"><span>사진(들)을 선택</span></button>
                                </div>
                            </div>
                            <hr/>
                            <div className="row mt-1">
                                <div className="col">
                                    <h4>이력서</h4>
                                </div>
                                <div className="d-flex">
                                    <button className="btn btn-success  ms-auto"><span>사진(들)을 선택</span></button>
                                </div>
                            </div>
                            <hr/>
                            <div className="row mt-1">
                                <div className="col">
                                    <h4>기타 서류</h4>
                                </div>
                                <div className="d-flex">
                                    <button className="btn btn-success  ms-auto"><span>사진(들)을 선택</span></button>
                                </div>
                            </div>
                       
                        
                        </div>
                        <div className="modal-footer">
                        < button className="btn btn-info" type="button">저장하기</button>
                        <button type="button" className="btn btn-secondary" onClick={closeModal}>닫기</button>
                        
                        </div>
                    </div>
                    </div>
                </div>
                
            </div>

                <div className="modal fade" tabIndex="-1" role="dialog" ref={deleteModal} data-bs-backdrop="static">
                    <div className="modal-dialog modal-sm" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                        
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" >
                        </button>
                        </div>
                        <div className="modal-body">
                            <span>정말 사원을 탈퇴 시키겠습니까? </span>
                          
                        </div>
                        <div className="modal-footer">
                        <div className="d-flex justify-content-between">

                            <button type="button" className="btn btn-danger me-auto" onClick={sendMemberNo}>예</button>
                            <button type="button" className="btn btn-light ms-auto" onClick={closeModal}>아니오</button>
                        </div>
                        
                        </div>
                    </div>
                    </div>
                </div> 
                <div className="row mt-2">
            <div className="col text-center">
                <button className="btn btn-light" onClick={prevButton}>이전</button>
                {numbers.map((page) => (
          <button className="btn btn-light" onClick={e=>changePage(page)} key={page}>{page}</button>
        ))}
       
           
            <button className="btn btn-light" onClick={nextButton}>다음</button>
            {/* <span>start lastPage end = {start}, {lastPage}, {end}</span> */}
            </div>
        </div>
        </div>
    </>)
}