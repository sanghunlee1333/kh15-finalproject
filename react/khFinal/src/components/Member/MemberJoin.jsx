import { FaAsterisk, FaUser } from "react-icons/fa6";
import Jumbotron from "../template/Jumbotron";
import { useCallback, useEffect, useMemo, useState } from "react";
import { HiUserGroup, HiUserAdd } from "react-icons/hi";
import { FaUserCircle } from "react-icons/fa";
import axios from "axios";

export default function MemberJoin(){
    // state

    const [member, setMember] = useState({
        memberId : "" , memberPw : "", memberName: "", memberResidentNo: "", memberContact: "", memberEmail:"",
        memberPost: "", memberAddress1:"", memberAddress2:"", memberDepartment:"", memberRank:"", memberBank:"",
        memberBankNo:"",
    });
    const [memberResidentNumber, setMemberResidentNumber] = useState({
        frontNo:"", rearNo:"",
    })

    const [memberNameValid, setMemberNameValid] = useState(null);
    const [memberIdValid, setMemberIdValid] = useState(null);
    const [memberPwValid, setMemberPwValid] = useState(null);
    const [memberContactValid, setMemberContactValid] = useState(null);
    const [memberEmailValid, setMemberEmailValid] = useState(null);
    const [memberDepartmentValid, setMemberDepartmentValid] = useState(null);



    //callback
    const changeMemberContact = useCallback(e=>{
        const value = e.target.value;
        const regex = /^[0-9]*$/; 
        if (regex.test(value)) {
          setMember((prev) => ({
            ...prev,
            memberContact: value,
          }));
        }
    }, [member])
    


    const changeMember = useCallback(e=>{
        setMember(prev=>({
            ...prev, [e.target.name] : e.target.value,
        }));

    },[member])
    const changeResidentNo = useCallback(e=>{
        memberResidentNumber(prev=>({
            ...prev, [e.target.name] : e.target.value,
        }));
    },[member])
    const checkMemberName = useCallback(()=>{
        const regex = /^[가-힣]+$/;
        const isValid = regex.test(member.memberName);
        setMemberNameValid(isValid);
    },[member])
    const checkMemberId = useCallback(()=>{
        const regex = /^[가-힣a-zA-Z0-9]+$/;
        const isValid = regex.test(member.memberId);
        setMemberIdValid(isValid);
    },[member])
    const checkMemberResidentNoFront = useCallback(()=>{
        const regex = /^[0-9]{6}$/;
        if(memberResidentNumber.frontNo.length > 6){
            
        }

    },[memberResidentNumber])
    const checkMemberResidentNoRear = useCallback(()=>{
        const regex = /^[0-9]{7}$/;
        const isValid = regex.test(memberResidentNumber.rearNo);
        console.log(isValid);

    },[memberResidentNumber])
    const checkMemberContact = useCallback(()=>{
        const regex = /^010[0-9]{8}$/;
        const isValid = regex.test(member.memberContact);
        console.log(isValid);
        setMemberContactValid(isValid);
    },[member])
    const checkMemberDepartment = useCallback(()=>{
        const regex = /^[가-힣]+$/;
        const isValid =regex.test(member.memberDepartment ?? '');
        setMemberDepartmentValid(isValid);
    },[member])
    const checkMemberEmail = useCallback(()=>{
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = regex.test(member.memberEmail);
        setMemberEmailValid(isValid);
    },[member])
    const changeResidentNoFrontNo = useCallback(e=>{
        const value = e.target.value;
        const regex = /^[0-9]*$/; 
    
        if (regex.test(value)) {
          setMemberResidentNumber((prev) => ({
            ...prev,
            frontNo: value,
          }));
        }
      
    },[])
    const changeResidentNoRearNo = useCallback(e=>{
        const value = e.target.value;
        const regex = /^[0-9]*$/; 
    
        if (regex.test(value)) {
          setMemberResidentNumber((prev) => ({
            ...prev,
            rearNo: value,
          }));
        }
      
    },[])


    const submitForm = useCallback(async ()=>{
        
        setMember((prev)=>({
            ...prev,
            memberResidentNo:memberResident,
        }));
        const isValid = await axios.post("/member/", member);
        console.log(isValid);
        console.log(member);
    },[memberResidentNumber])

    useEffect (()=>{
       
      
      //  console.log(member.memberResidentNo);
    },[member.memberResidentNo])




    // memo 
    const memberNameClass = useMemo(()=>{
        if(memberNameValid === null) return "";
      return memberNameValid === true ? "is-valid" : "is-invalid";
    },[memberNameValid])
    const memberIdClass = useMemo(()=>{
        if(memberIdValid === null) return "";
      return memberIdValid === true ? "is-valid" : "is-invalid";
    },[memberIdValid])
    const memberPwClass = useMemo(()=>{
        if(memberPwValid === null) return "";
      return memberPwValid === true ? "is-valid" : "is-invalid";
    },[memberPwValid])
    const memberContactClass = useMemo(()=>{
        if(memberContactValid === null) return "";
      return memberContactValid === true ? "is-valid" : "is-invalid";
    },[memberContactValid])
    const memberDepartmentClass = useMemo(()=>{
        if(memberDepartmentValid === null) return "";
      return memberDepartmentValid === true ? "is-valid" : "is-invalid";
    },[memberDepartmentValid])
    const memberEmailClass = useMemo(()=>{
        if(memberEmailValid === null) return "";
      return memberEmailValid === true ? "is-valid" : "is-invalid";
    },[memberEmailValid])
    
    // 주민번호값 계산

    const memberResident = useMemo(()=>{
        const front = memberResidentNumber?.frontNo ?? '';
        const rear = memberResidentNumber?.rearNo ?? '';
        return String(front) + String(rear);
    },[memberResidentNumber.frontNo, memberResidentNumber.rearNo])

    //view
    return (<>
        <Jumbotron subject="회원가입" ></Jumbotron>
       <div>
        <h1>주민번호 : {memberResident}</h1>
       </div>

        <div className="row mt-4">
            <label className="col-sm-3 col-form-label">아이디</label>
            <div className="col-sm-9">
                <input type="text" name="memberId" value={member.memberId} onChange={changeMember} onBlur={checkMemberId} className={`form-control ${memberIdClass}`} placeholder="회사명 입력"></input>
            </div>
        </div>

        <div className="row mt-4">
            <label className="col-sm-3 col-form-label">비밀번호 </label>
            <div className="col-sm-9">
                <input type="text" name="memberPw" value={member.memberPw} onChange={changeMember} className={`form-control`} placeholder="비밀번호 입력"></input>
            </div>
        </div>

        <div className="row mt-4">
            <label className="col-sm-3 col-form-label">비밀번호 확인</label>
            <div className="col-sm-9">
                <input type="text" name="memberPw" value={member.memberPw} onChange={changeMember} className={`form-control`} placeholder="비밀번호 입력"></input>
            </div>
        </div>
        <div className="row mt-4">
            <label className="col-sm-3 col-form-label">이름</label>
            <div className="col-sm-9">
                <input type="text" name="memberName" value={member.memberName} 
                onChange={changeMember} 
                className={`form-control ${memberNameClass}`}
                placeholder="이름 입력"
                onBlur={checkMemberName}></input>
            </div>
        </div>

        <div className="row mt-4">
            <label className="col-sm-3 col-form-label">주민등록번호</label>
            <div className="col-sm-9">
                <div className="input-group">
                <input type="text" inputMode="numeric" onBlur={checkMemberResidentNoFront} 
                name="frontNo" value={memberResidentNumber.frontNo} onChange={changeResidentNoFrontNo} 
                className={`form-control`} placeholder="주민번호 앞자리" maxLength={6}></input>
                <span className="me-2 ms-2">-</span>
                <input type="text" inputMode="numeric" onBlur={checkMemberResidentNoRear} 
                name="rearNo" value={memberResidentNumber.rearNo} onChange={changeResidentNoRearNo} maxLength={7}
                className={`form-control`} placeholder="뒷자리"  ></input>
                </div>
            </div>
        </div>
        <div className="row mt-4">
            <label className="col-sm-3 col-form-label">연락처</label>   
            <div className="col-sm-9">
                <input type="text" name="memberContact" value={member.memberContact} onChange={changeMemberContact} maxLength={11}
                onBlur={checkMemberContact} className={`form-control ${memberContactClass}`} placeholder="연락처 입력"></input>
                <input type="hidden" name="memberContact" value={member.memberContact} ></input>
            </div>
        </div>
        <div className="row mt-4">
            <label className="col-sm-3 col-form-label">이메일</label>
            <div className="col-sm-9">
                <input type="text" name="memberEmail" value={member.memberEmail} onChange={changeMember} onBlur={checkMemberEmail} className={`form-control ${memberEmailClass}`} placeholder="이메일 입력"></input>
            </div>
        </div>

        <div className="row mt-4">
            <label className="col-sm-3 col-form-label">주소</label>
            <div className="col-sm-9">
                <input type="text" name="" className={`form-control`}  placeholder="우편번호"></input>
                <input type="text" name="" className={`form-control`} placeholder="기본주소"></input>
                <input type="text" name="" className={`form-control`} placeholder="상세주소"></input>
            </div>
        </div>
        
        <div className="row mt-4">
            <label className="col-sm-3 col-form-label">부서</label>
            <div className="col-sm-9">
                <input type="text" name="memberDepartment" className={`form-control ${memberDepartmentClass}`}  onChange={changeMember}  onBlur={checkMemberDepartment} placeholder="부서 입력"></input>
            </div>
        </div>

        <div className="row mt-4">
            <label className="col-sm-3 col-form-label">직급</label>
            <div className="col-sm-9">
                <select className={`form-select`}>
                    <option value="">선택하세요</option>
                    <option>부장</option>
                    <option>차장</option>
                    <option>과장</option>
                    <option>대리</option>
                    <option>주임</option>
                    <option>사원</option>
                    <option>인턴</option>
                </select>
            </div>
        </div>
        <div className="row mt-4">
            <label className="col-sm-3 col-form-label">은행</label>
            <div className="col-sm-9">
            <select className="form-select">
                    <option value="">선택하세요</option>
                    <option>신한은행</option>
                    <option>농협은행</option>
                    <option>우리은행</option>
                    <option>하나은행</option>
                </select>
            <input type="text" inputMode="numeric" className="form-control" placeholder="계좌번호"></input>
            </div>
        </div>
        <div className="row mt-4">
            <div className="col d-flex">
                <button onClick={submitForm} className="btn btn-success ms-auto "><FaUserCircle className="align-middle me-1"/> 회원가입</button>
            </div>
        </div>
        <div style={{minHeight: 150}}></div>
    </>)
}