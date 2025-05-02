import { useParams } from "react-router";
import Jumbotron from "../template/Jumbotron";
import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import axios from "axios";
import userImg from '/public/images/profile_basic.png';
import { FaChevronLeft, FaChevronRight, FaImages } from "react-icons/fa6";
import { Modal } from "bootstrap";
import { FaInfoCircle } from "react-icons/fa";
import './MemberList.css'; 

export default function MemberManage(){
    const { number } = useParams(); 
    const [member, setMember] = useState({
        memberNo:"", memberId:"", memberDepartment:"", memberName:"", memberContact:"", memberEmail:"",
        memberPost:"", memberAddress1:"", memberAddress2:"", memberRank:"", memberBank:"", memberBankNo:"", 
        memberJoin:"", memberState:"",
    })
    const [backup, setBackup] = useState({
        memberNo:"", memberId:"", memberDepartment:"", memberName:"", memberContact:"", memberEmail:"",
        memberPost:"", memberAddress1:"", memberAddress2:"", memberRank:"", memberBank:"", memberBankNo:"", 
        memberJoin:"", memberState:"",
    })

    const [memberNameValid, setMemberNameValid] = useState(null);
    const [memberDepartmentValid, setMemberDepartmentValid] = useState(null);
    const [memberRankValid, setMemberRankValid] = useState(null);
    const [memberContactValid, setMemberContactValid] = useState(null);
    const [memberEmailValid, setMemberEmailValid] = useState(null);
    const [memberBankValid, setMemberBankValid] = useState(null);
    const [memberBankNoValid, setMemberBankNoValid] = useState(null);

    const checkMemberName = useCallback((e)=>{
        const regex = /^[가-힣]*$/;
        const isValid = regex.test(e.target.value);
       // console.log(isValid);
        setMemberNameValid(isValid);
    },[memberNameValid]);
    const checkMemberDepartment = useCallback((e)=>{
        const regex = /^[가-힣]*$/;
        const isValid = regex.test(e.target.value);
        setMemberDepartmentValid(isValid);
    },[memberDepartmentValid]);
    const checkMemberRank = useCallback((e)=>{
        const regex = /^[가-힣]*$/;
        const isValid = regex.test(e.target.value);
        setMemberRankValid(isValid);
    },[memberRankValid]);
    const checkMemberContact = useCallback((e)=>{
        const regex = /^[0-9]*$/;
        const isValid = regex.test(e.target.value);
        setMemberContactValid(isValid);
    },[memberContactValid]);
    const checkMemberEmail = useCallback((e)=>{
        const regex = /^[가-힣]*$/;
        const isValid = regex.test(e.target.value);
        setMemberEmailValid(isValid);
    },[memberEmailValid]);
    const checkMemberBank = useCallback((e)=>{
        const regex = /^[가-힣]*$/;
        const isValid = regex.test(e.target.value);
        setMemberBankValid(isValid);
    },[memberBankValid]);
    const checkMemberBankNo = useCallback((e)=>{
        const regex = /^[0-9]*$/;
        const isValid = regex.test(e.target.value);
        setMemberBankNoValid(isValid);
    },[memberBankNoValid]);

    const changeMemberBankNo = useCallback((e)=>{
    //    console.log(e.target.value); 
    //    console.log(member.memberBankNo);
        const regex = /^[0-9]*$/; 
    
        if (regex.test(e.target.value)) {
            setMember((prev) => ({
                ...prev,
                [e.target.name]: e.target.value,
            }));
        }
       
    },[member]);

    const changeMemberContact = useCallback((e)=>{
    //     console.log(e.target.value); 
    //    console.log(member.memberContact);
        const regex = /^[0-9]*$/; 
    
        if (regex.test(e.target.value)) {
            setMember((prev) => ({
                ...prev,
                [e.target.name]: e.target.value,
            }));
        }
    },[member])


    const memberNameClass = useMemo(()=>{
        if(memberNameValid === null) return "";
        return memberNameValid === true ? "is-valid" : "is-invalid";
    },[memberNameValid]);
    const memberDepartmentClass = useMemo(()=>{
        if(memberDepartmentValid === null) return "";
        return memberDepartmentValid === true ? "is-valid" : "is-invalid";
    },[memberDepartmentValid]);
    const memberRankClass = useMemo(()=>{
        if(memberRankValid === null) return "";
        return memberRankValid === true ? "is-valid" : "is-invalid";
    },[memberRankValid]);
    const memberContactClass = useMemo(()=>{
        if(memberContactValid === null) return "";
        return memberContactValid === true ? "is-valid" : "is-invalid";
    },[memberContactValid]);
    const memberEmailClass = useMemo(()=>{
        if(memberEmailValid === null) return "";
    return memberEmailValid === true ? "is-valid" : "is-invalid";
    },[memberEmailValid]);
    const memberBankClass = useMemo(()=>{
        if(memberBankValid === null) return "";
        return memberBankValid === true ? "is-valid" : "is-invalid";
    },[memberBankValid]);
    const memberBankNoClass = useMemo(()=>{
        if(memberBankNoValid === null) return "";
        return memberBankNoValid === true ? "is-valid" : "is-invalid";
    },[memberBankNoValid]);

    const loadOne = useCallback(async ()=>{
        const rest = await axios.get("/admin/member/"+number);
        setMember(rest.data.vo);
        setBackup(rest.data.vo);
    },[]);
    
    useEffect(()=>{
        loadOne();
    },[])



    const pwModal = useRef();
    const editModal = useRef();

    const openPwModal = useCallback(()=>{
         const target = Modal.getOrCreateInstance(pwModal.current);
                target.show();
    },[pwModal])
    const openEditModal = useCallback(()=>{
        setBackup(member);
        const target = Modal.getOrCreateInstance(editModal.current);
        target.show();
    },[editModal, member])
    const closePwModal = useCallback(()=>{
        const target = Modal.getInstance(pwModal.current);
        target.hide();
       

    },[pwModal, member])
    const closeEditModal = useCallback(()=>{
        const target = Modal.getInstance(editModal.current);
        target.hide();
        setMember(backup);
    },[editModal, member]);
    const changeMember = useCallback((e)=>{
        
        setMember(prev=>({
            ...prev, 
            [e.target.name] : e.target.value,
        }));
       
    },[member])

    const yesPw = useCallback(async()=>{
        //console.log("hello");
        const resp = await axios.post("/admin/member/resetPw/"+number);
        if(resp){
            console.log(resp.data);
        }
        //else console.log("erageradg");
        //console.log(axios.defaults.headers.common['Authorization']);
    },[]);

    const yesEdit = useCallback(async ()=>{
       
        const updatedInfo = member;
        // console.log(updatedInfo);
        // console.log(member);

        //const rest = await axios.patch("/admin/member/"+number, updatedInfo);
        const rest = await axios.patch("/admin/member/", updatedInfo);
        if(rest === true){
           console.log("sueeccceesss");
            loadOne();
        }
        else if(rest === false){
            console.log("failfailfailfail");
        }
        else{
            console.log("nunlnlunluknlu");
        }
        const target = Modal.getInstance(editModal.current);
        target.hide();
    },[member, editModal])

    
      
    
    return(<>
        <Jumbotron subject={`${member.memberName} 님의 상세페이지`}></Jumbotron>
   
        <div className="row mt-4">
  <div className="col d-flex align-items-start">
    <img
      src={userImg}
      alt="기본 사용자 이미지"
      className="rounded shadow w-100"
      style={{ maxWidth: 350 }}
    />

    <div className="row ms-4">
        <div className="col w-100">
            <h5 className="text-center ms-4 mb-3"><FaChevronLeft/>사원 정보<FaChevronRight /></h5>
            <ul className="list-group list-group-flush ms-4">
                <li className="list-group-item">
                <strong>사원번호 :</strong> {member.memberNo}
                </li>
                <li className="list-group-item">
                <strong>아이디 :</strong> {member.memberId}
                </li>
                <li className="list-group-item">
                <strong>이름 :</strong> {member.memberName}
                </li>
                <li className="list-group-item">
                <strong>부서 :</strong> {member.memberDepartment}
                </li>
                <li className="list-group-item">
                <strong>직급 :</strong> {member.memberRank}
                </li>
                <li className="list-group-item">
                <strong>연락처 :</strong> {member.memberContact}
                </li>
                <li className="list-group-item">
                <strong>이메일 :</strong> {member.memberEmail}
                </li>
                <li className="list-group-item">
                <strong>우편 번호 :</strong>  [{member.memberPost}] 
                </li>
                <li className="list-group-item">
                <strong>기본 주소 :</strong> {member.memberAddress1}                
                </li>
                <li className="list-group-item">
                <strong>상세 주소 :</strong>  {member.memberAddress2} 
                </li>
                <li className="list-group-item">
                <strong>은행명 :</strong> {member.memberBank}
                </li>
              
                <li className="list-group-item">
                <strong>계좌번호 :</strong>  {member.memberBankNo}
                </li>
            </ul>
                <div style={{minHeight:50}}></div>
      </div>
            <div className="mt-2 ms-4">
                <button className="btn w-100 btn-outline-dark" onClick={openPwModal}>새 비밀번호 발급</button>
            </div>
        <div className=" mt-2 ms-4">
                <button className="btn w-100 mt-1 btn-outline-dark" onClick={openEditModal}>수정하기</button>
        </div>
    </div>

     </div>
    <div style={{minHeight:130}}></div>
    <hr/>
    <div className="row mt-4">
        <div className="col">
            <h2>서류 <FaImages/></h2>
        </div>
    </div>
   
  
    <div className="row mt-1">
            <div className="col">
                <h4>주민등록증 혹은 주민등록등본</h4>
            </div>
            <div className="d-flex">
            {/* <input type="file" className="form-control" accept=".png,.jpg,.jpeg,.txt,.pdf,.doc,.docx,.hwp,.ppt,.pptx,.xls,.xlsx,.zip,.7z"
                     multiple/> */}
                     
                <button className="btn btn-success  ms-auto"><span>사진(들)을 보기</span></button>
            </div>
        </div>
        <hr className="mt-4"/>
        <div className="row mt-1">
            <div className="col">
                <h4>통장사본</h4>
            </div>
            <div className="d-flex">
                <button className="btn btn-success  ms-auto"><span>사진(들)을 보기</span></button>
            </div>
        </div>
        <hr className="mt-4"/>
        <div className="row mt-1">
            <div className="col">
                <h4>근로계약서</h4>
            </div>
            <div className="d-flex">
                <button className="btn btn-success  ms-auto"><span>사진(들)을 보기</span></button>
            </div>
        </div>
        <hr className="mt-4"/>
        <div className="row mt-1">
            <div className="col">
                <h4>이력서</h4>
            </div>
            <div className="d-flex">
                <button className="btn btn-success  ms-auto"><span>사진(들)을 보기</span></button>
            </div>
        </div>
        <hr className="mt-4"/>
        <div className="row mt-1">
            <div className="col">
                <h4>기타 서류</h4>
            </div>
            <div className="d-flex">
                <button className="btn btn-success  ms-auto"><span>사진(들)을 보기</span></button>
            </div>
        </div>

    </div>



    <div className="modal fade" tabIndex="-1" role="dialog" ref={pwModal} data-bs-backdrop="static">
                    <div className="modal-dialog modal-sm" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                        
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" >
                        </button>
                        </div>
                        <div className="modal-body text-cente" >
                          <h2>비밀번호 변경</h2>
                          <span>비밀번호를 새로 발급 하시겠습니까?발급하기를 누르면 기존의 비밀번호는 없어집니다</span>
                          <div style={{minHeight:120}}></div>
                          
                        </div>
                        <div className="modal-footer">
                        <div className="d-flex justify-content-between">

                            <button type="button" className="btn btn-light me-auto" onClick={yesPw}>발급하기</button>
                            <button type="button" className="btn btn-light ms-auto" onClick={closePwModal}>아니오</button>
                        </div>
                        
                        </div>
                    </div>
                    </div>
                </div>
                <div className="modal fade" tabIndex="-1" role="dialog" ref={editModal} data-bs-backdrop="static">
                    <div className="modal-dialog modal-lg" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                        
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" >
                        </button>
                        </div>
                        <div className="modal-body">
                        <h2>{member.memberName}님의 정보 수정</h2>
        
                        <div className="row mt-4">
                            <label className="col-sm-3 col-form-label">이름</label>
                            <div className="col-sm-9">
                                <input type="text" name="memberName" className={`form-control ${memberNameClass}`} onBlur={checkMemberName} onChange={changeMember} value={member.memberName} ></input>
                            </div>
                        </div>
                        <div className="row mt-4">
                            <label className="col-sm-3 col-form-label">부서</label>
                            <div className="col-sm-9">
                                <input type="text" name="memberDepartment" className={`form-control ${memberDepartmentClass}`} onChange={changeMember} onBlur={checkMemberDepartment} value={member.memberDepartment} ></input>
                            </div>
                        </div>
                        <div className="row mt-4">
                            <label className="col-sm-3 col-form-label">직급</label>
                            <div className="col-sm-9">
                                <input type="text" name="memberRank"  className={`form-control ${memberRankClass}`} onChange={changeMember} onBlur={checkMemberRank} value={member.memberRank} ></input>
                            </div>
                        </div>
                    
                        <div className="row mt-4">
                            <label className="col-sm-3 col-form-label">연락처</label>
                            <div className="col-sm-9">
                                <input type="text" name="memberContact" inputMode="numeric" className={`form-control ${memberContactClass}`} onBlur={checkMemberContact} onChange={changeMemberContact} value={member.memberContact} ></input>
                            </div>
                        </div>
                    
                        <div className="row mt-4">
                            <label className="col-sm-3 col-form-label">이메일</label>
                            <div className="col-sm-9">
                                <input type="text" name="memberEmail"  className={`form-control ${memberEmailClass}`} onBlur={checkMemberEmail} onChange={changeMember} value={member.memberEmail} ></input>
                            </div>
                        </div>
                    
                        <div className="row mt-4">
                            <label className="col-sm-3 col-form-label">은행명</label>
                            <div className="col-sm-9">
                                <input type="text" name="memberBank"   className={`form-control ${memberBankClass}`} onChange={changeMember} onBlur={checkMemberBank} value={member.memberBank} ></input>
                                <input type="text" name="memberBankNo" inputMode="numeric" onChange={changeMemberBankNo}   onBlur={checkMemberBankNo}
                                 placeholder="계좌번호를 입력해주세요"  className={`form-control ${memberBankNoClass}`} value={member.memberBankNo} ></input>
                            </div>
                        </div>
                    
                        
                    
                        </div>
                        <div className="modal-footer">
                        <div className="d-flex justify-content-between">

                            <button type="button" className="btn btn-danger me-auto" onClick={yesEdit}>예</button>
                            <button type="button" className="btn btn-light ms-auto" onClick={closeEditModal}>아니오</button>
                        </div>
                        
                        </div>
                    </div>
                    </div>
                </div>

                
    </>)
}