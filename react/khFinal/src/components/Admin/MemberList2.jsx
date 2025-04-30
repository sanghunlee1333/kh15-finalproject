import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Jumbotron from "../template/Jumbotron";
import axios from "axios";
import { FaImage, FaMagnifyingGlass, FaTrash } from "react-icons/fa6";
import {Modal} from "bootstrap";
import dayjs from 'dayjs';

export default function MemberList(){
    // state
    const [members, setMembers] = useState([])
    const [selectedDeleteMember, setSelectedDeleteMember] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [search, setSearch] = useState({
        memberId:"", memberName:"", memberDepartment:"", memberRank:"", memberContact:"", memberEmail:"",
        beginRow:1, endRow:10, order:"", column:null, keyword:null, memberDepartmentCk:"",
    })
    const [keyword,setKeyword] = useState("")
    const [column, setColumn] = useState("")
  
    const [lastPage, setLastPage] = useState("");
    const [blockSize, setBlockSize] = useState(5);
    const [count, setCount] = useState("");
   
    
   
    
    const getBeginBlock = (currentPage, blockSize) => {
        return Math.floor((currentPage - 1) / blockSize) * blockSize + 1;
    }
    
    const getFinishBlock = (currentPage, blockSize, count, pageSize) => {
        const number = Math.floor((currentPage - 1) / blockSize) * blockSize + blockSize;
        const totalPages = Math.ceil(count / pageSize);
        return Math.min(number, totalPages);
    };
    
    const [start, setStart] = useState(getBeginBlock(currentPage, blockSize));
    const [end, setEnd] = useState(0);
    const [numbers, setNumbers] = useState([]);
  
    useEffect(() => {
        setEnd(getFinishBlock(currentPage, blockSize, count, pageSize));
        setStart(getBeginBlock(currentPage, blockSize));
        // console.log(count);
        // console.log(currentPage  + "  curcurcur");
    }, [count, currentPage]); 
  

    // callback
  

    const loadList = useCallback(async ()=>{
       
        const resp = await axios.post("/admin/member", search);
        
        setMembers(resp.data.list);
        setCount(resp.data.count);
       
    },[search])
 
 
  
    useEffect(()=>{
        
        setSearch((prev)=>({
            ...prev,
            beginRow:(currentPage - 1) * pageSize +1,
            endRow:currentPage * pageSize
        }));

      //  console.log(getBeginBlock(currentPage, blockSize));

      //  console.log(getFinishBlock(currentPage, blockSize, count, pageSize));
        console.log("begin " + search.beginRow);
        console.log("endend " + search.endRow);
    },[currentPage]);

    useEffect(()=>{
       // console.log("end is " + end);
    //    console.log("count is " + count);
       if(end > 0){
        renewPagination();
       }
    },[end]);

    const renewPagination = useCallback(()=>{
        const newNumbers = Array.from({ length: end - start + 1 }, (_, index) => start + index);
        setNumbers(newNumbers);
       
    },[end]);


    useEffect(()=>{
        loadList();
    },[search.endRow])

    const [selectedMember, setSelectedMember] = useState("")
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
       
    },[members, selectedDeleteMember])

    // 그냥 함수
    const transDate = (dateStr) => dayjs(dateStr).format('YYYY-MM-DD'); 
    //dayjs()


    const submitSearch = useCallback(async()=>{ //  여기서 페이징 처리도 되게끔 해야함
        const params = {column:column, keyword:keyword};
        setSearch((prev)=>({
            ...prev,
            beginRow:(currentPage - 1) * pageSize +1,
            endRow:currentPage * pageSize,
            column:column, keyword:keyword,
        }));

            const resp = await axios.post("/admin/member", search);
            setMembers(resp.data.list);
            setCount(resp.data.count);
            

            renewPagination();
           
    },[column, keyword, currentPage]);

    const changeKeyword = useCallback((e)=>{setKeyword(e.target.value)},[keyword])
    const changeColumn = useCallback((e)=>{setColumn(e.target.value)},[column])

    const changePage = useCallback( (target)=>{
        setCurrentPage(target);
        setSearch((prev)=>({
            ...prev,
            beginRow:(currentPage - 1) * pageSize +1,
            endRow:currentPage * pageSize
        }));
       
    },[currentPage, search]);

    const prevButton = useCallback(()=>{
        const newPage = start;
        changePage(newPage);
    },[currentPage]);
    const nextButton = useCallback(()=>{
        // const isValid
        // setCurrentPage(6);
        const newPage = start + blockSize;
       // setCurrentPage(newPage);
//        console.log(currentPage + " curcrucrucru");
        changePage(newPage);
       // console.log(newPage + " newpage");
    },[currentPage]);

    const clickOrder = useCallback(async (e)=>{
        console.log(e.target.value);
        console.log("searchasearcgh");
        console.log(members);
        const updated = { ...search, order: e.target.value };
        setSearch(updated);
        const resp = await axios.post("/admin/member", updated);
       
        setMembers(resp.data.list);
        setCount(resp.data.count);
    },[search, members])
   
    // view
    return(<>
        <Jumbotron subject="사원 리스트"/>
        
        <div className="row mt-2">
            <div className="col text-center">
                <button className="btn btn-light" onClick={prevButton}>이전</button>
                {numbers.map((page) => (
          <button className="btn btn-light" onClick={e=>changePage(page)} key={page}>{page}</button>
        ))}
            <button className="btn btn-light" onClick={nextButton}>다음</button>
            </div>
        </div>

     
        <div className="row mt-4">
            <div className="col d-flex">
                <div className="ms-auto d-flex align-items-center">
                <select className="form-select w-auto" name="column" onChange={changeColumn}>
                    
                      <option value="">선택하세요</option>
                            <option value="memberId">아이디</option>
                            <option value="memberName">이름</option>
                            <option value="memberDepartment">부서</option>
                            <option value="memberRank">직급</option>
                            <option value="memberContact">연락처</option>
                            <option value="memberEmail">이메일</option>
                </select>

                <input
                    type="text"
                    className="form-control w-auto"
                    maxLength={10}
                    placeholder="검색어를 입력해주세요"
                    value={keyword}
                    onChange={changeKeyword}
                />
                <button className="btn btn-outline-secondary" onClick={submitSearch}>
                    <FaMagnifyingGlass />
                </button>
                </div>
            </div>
        </div>
        
        <div className="row">
            <div className="col">
                <button className="btn btn-light" value="memberName" onClick={clickOrder}>이름순</button>
                <button className="btn btn-light" value="memberJoin" onClick={clickOrder}>가입일순 </button>
            </div>
        </div>

        <div className="row mt-4">
            <div className="col">
            <table className="table table-hover">
                <thead>
                    <tr>
                   
                    <th>아이디</th>
                    <th>이름</th>
                    <th>부서</th>
                    <th>직급</th>
                    <th>연락처</th>
                    <th>이메일</th>
                    <th>가입일</th>
                    <th>관리</th>
                    </tr>
                </thead>
                <tbody>
                {(members && members.length > 0) ? (
                    members.map(member => (
                        <tr key={member.memberId}>
                            <td>{member.memberId}</td>
                            <td>{member.memberName}</td>
                            <td>{member.memberDepartment}</td>
                            <td>{member.memberRank}</td>
                            <td>{member.memberContact}</td>
                            <td>{member.memberEmail}</td>
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
          
        </div>
    </>)
}