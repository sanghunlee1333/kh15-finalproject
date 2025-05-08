import { FaAsterisk, FaEye, FaEyeSlash, FaMagnifyingGlassPlus, FaUser } from "react-icons/fa6";
import Jumbotron from "../template/Jumbotron";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { HiUserGroup, HiUserAdd } from "react-icons/hi";
import { FaUserCircle } from "react-icons/fa";
import axios from "axios";
import './MemberJoin.css';  
import Postcode from "../template/Postcode";
import { useNavigate } from "react-router";
export default function MemberJoin(){
    const navigate = useNavigate();
    // state

    

    const [member, setMember] = useState({
        memberId : "" , memberPw : "", memberName: "", memberResidentNo: "", memberContact: "", memberEmail:"",
        memberPost: "", memberAddress1:"", memberAddress2:"", memberDepartment:"", memberRank:"", memberBank:"",
        memberBankNo:"",
    });
    const [memberResidentNumber, setMemberResidentNumber] = useState({
        frontNo:"", rearNo:"",
    })
    
    const [memberPwRe, setMemberPwRe] = useState("");
    const [memberNameValid, setMemberNameValid] = useState(null);
    const [memberIdValid, setMemberIdValid] = useState(null);
    const [memberContactValid, setMemberContactValid] = useState(null);
    const [memberEmailValid, setMemberEmailValid] = useState(null);
    const [memberDepartmentValid, setMemberDepartmentValid] = useState(null);
    const [memberPwReValid,setMemberPwReValid] = useState(null);
    const [frontNoValid, setFrontNoValid] = useState(null);
    const [rearNoValid, setRearNoValid] = useState(null);

    const [pwComponentsValid, setPwComponentsValid] = useState({
        uppercase: null, lowercase:null, number:null, special:null, count:null,
    });
    const [memberPwValid, setMemberPwValid] = useState(null);

    const [pwReEye, setPwReEye] = useState(true);
    const [pwEye, setPwEye] = useState(true);
    const [memberAddressValid, setMemberAddressValid] = useState(null);

    const [memberRankValid, setMemberRankValid] = useState(null);
    const [memberBankValid, setMemberBankValid] = useState(null);
    const [memberBankNoValid, setMemberBankNoValid] = useState(null);
 
    //callback
    const changeAddress = useCallback((post,address1)=>{
        setMember(prev=>({
            ...prev,
            memberPost:post,
            memberAddress1:address1,
        }))
    },[member])
    const changeMemberPw = useCallback((e)=>{
        setMember(prev=>({
            ...prev, [e.target.name] : e.target.value,
        }));
    },[member]);
    useEffect(()=>{
        setPwComponentsValid({
            lowercase: /(?=.*[a-z])/.test(member.memberPw),
            uppercase: /(?=.*[A-Z])/.test(member.memberPw),
            number: /(?=.*[0-9])/.test(member.memberPw),
            special: /(?=.*[!@#$])/.test(member.memberPw),
            count:/^.{8,16}$/.test(member.memberPw),
        });

        if(member.memberPw.length === 0){
            setPwComponentsValid({
                lowercase: null,
                uppercase: null,
                number: null,
                special: null,
                count:null,
            });
        }
    },[member.memberPw]);
    
    

    const checkMemberAddress = useCallback(()=>{
        const regex = /^[가-힣0-9]+$/;
        const validPost = member.memberPost.length === 0 && member.memberAddress1 === 0;
        const isValid = regex.test(member.memberAddress2);
        setMemberAddressValid(isValid);
        if(validPost && member.memberAddress2 === null){
            setMemberAddressValid(null);
        }
        

    },[member.memberAddress2])

    const memberAddressClass = useMemo(()=>{
        if(memberAddressValid === null) return "";
        return memberAddressValid === true ? "is-valid" : "is-invalid";
    },[memberAddressValid])

    const calculateTextClass = useCallback((value)=>{
        if(value === null) return "";
        return value === true ? "text-success" : "text-danger";
    },[])

    const pwComponentsClass = useMemo(()=>{
      return{
        lowercase:calculateTextClass(pwComponentsValid.lowercase),
        uppercase:calculateTextClass(pwComponentsValid.uppercase),
        number:calculateTextClass(pwComponentsValid.number),
        special:calculateTextClass(pwComponentsValid.special),
        count:calculateTextClass(pwComponentsValid.count),
      }
    },[pwComponentsValid])
    
    const memberPwClass = useMemo(()=>{
        if(memberPwValid === null) return "";
        return memberPwValid === true ? "is-valid" : "is-invalid";
    },[memberPwValid])

    // const checkPwComponents = useMemo(()=>{
    //     return pwComponentsValid.lowercase && pwComponentsValid.uppercase && pwComponentsValid.number && pwComponentsValid.special && pwComponentsValid.count;
    // },[pwComponentsValid]) 

    const checkMemberPw = useCallback(()=>{
        const isValid =  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,16}$/.test(member.memberPw); 
        // const isValid = checkPwComponents && /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,16}$/.test(member.memberPw); 
        setMemberPwValid(isValid);
        if(member.memberPw.length === 0){
            setMemberPwValid(null);
        }
    },[member.memberPw])
    const checkMemberPwRe = useCallback(()=>{
        const isValid = member.memberPw === memberPwRe;
        setMemberPwReValid(isValid);
        if(member.memberPw === "" && memberPwRe === ""){
            setMemberPwReValid(null);
        }
    },[memberPwRe])
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
    const checkMemberName = useCallback(()=>{
        const regex = /^[가-힣]{0,20}$/;
        const isValid = regex.test(member.memberName);
        setMemberNameValid(isValid);
        if(member.memberName.length === 0){
            setMemberNameValid(null);
        }
    },[member])
    const checkMemberId = useCallback(()=>{
        const regex = /^[a-zA-Z0-9]{0,30}$/;
        const isValid = regex.test(member.memberId);
        setMemberIdValid(isValid);
        if(member.memberId.length === 0){
            setMemberIdValid(null);
        }
    },[member])
    const checkMemberResidentNoFront = useCallback(()=>{
        const regex = /^[0-9]{6}$/;
        const isValid = regex.test(memberResidentNumber.frontNo);
        setFrontNoValid(isValid);
        if(memberResidentNumber.frontNo.length === 0){
            setFrontNoValid(null);
        }
    },[memberResidentNumber])
    const checkMemberResidentNoRear = useCallback(()=>{
        const regex = /^[1234]{1}[0-9]{6}$/;
        const isValid = regex.test(memberResidentNumber.rearNo);
        setRearNoValid(isValid);
        if(memberResidentNumber.rearNo.length === 0){
            setRearNoValid(null);
        }
    },[memberResidentNumber])
    const checkMemberContact = useCallback(()=>{
        const regex = /^010[0-9]{8}$/;
        const isValid = regex.test(member.memberContact);
        setMemberContactValid(isValid);
        if(member.memberContact.length === 0){
            setMemberContactValid(null);
        }
    },[member])
    const checkMemberDepartment = useCallback(()=>{
        const regex = /^[가-힣]{0,10}$/;
        const isValid =regex.test(member.memberDepartment ?? '');
        setMemberDepartmentValid(isValid);
        if(member.memberDepartment.length === 0){
            setMemberDepartmentValid(null);
        }
    },[member])
    const checkMemberEmail = useCallback(()=>{
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = regex.test(member.memberEmail);
        setMemberEmailValid(isValid);
        if(member.memberEmail.length === 0){
            setMemberEmailValid(null);
        }
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
      
    },[memberResidentNumber])
    const changeResidentNoRearNo = useCallback(e=>{
        const value = e.target.value;
        const regex = /^[0-9]*$/; 
    
        if (regex.test(value)) {
          setMemberResidentNumber((prev) => ({
            ...prev,
            rearNo: value,
          }));
        }
      
    },[memberResidentNumber])

    const changeMemberBankNo = useCallback((e) => {
        const regex = /^[0-9]*$/; 
    
        if (regex.test(e.target.value)) {
            setMember((prev) => ({
                ...prev,
                [e.target.name]: e.target.value,
            }));
        }
    }, [member.memberBankNo]);
 
    const checkMemberBankNo = useCallback(()=>{
        const regex = /^[0-9]+$/;
        const isValid = regex.test(member.memberBankNo);
        setMemberBankNoValid(isValid);
        if(member.memberBankNo.length === 0){
            setMemberBankNoValid(null);
        }
    },[member]);

    const submitForm = useCallback(async ()=>{

        // setMember((prev)=>({
        //     ...prev,
        //     memberResidentNo:memberResident,
        // })); 순서보장X

        const updatedMember = {
            ...member,
            memberResidentNo: memberResident,
          };
        const isValid = await axios.post("/member/", updatedMember);
       console.log(updatedMember);
       if(isValid)  {
    //    navigate('/home');
        }
        else{
            
        }
    },[memberResidentNumber, member])

  

    // memo 
    const memberNameClass = useMemo(()=>{
        if(memberNameValid === null) return "";
      return memberNameValid === true ? "is-valid" : "is-invalid";
    },[memberNameValid])
    const memberIdClass = useMemo(()=>{
        if(memberIdValid === null) return "";
      return memberIdValid === true ? "is-valid" : "is-invalid";
    },[memberIdValid])
    
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
    const memberPwReClass = useMemo(()=>{
    
        if(memberPwReValid === null) return "";
        return memberPwReValid === true ? "is-valid" : "is-invalid";
    },[memberPwReValid])

    const frontNoClass = useMemo(()=>{
        if(frontNoValid === null) return "";
        return frontNoValid === true ? "is-valid" : "is-invalid";
    },[frontNoValid])
    const rearNoClass = useMemo(()=>{
        if(rearNoValid === null) return "";
        return rearNoValid === true ? "is-valid" : "is-invalid";
    },[rearNoValid])

    const pwType = useCallback(()=>{
        const isValid = !pwEye;
        setPwEye(isValid);
    },[pwEye])

    const pwReType = useCallback(()=>{
        const isValid = !pwReEye;
        setPwReEye(isValid);
    },[pwReEye])

    const checkMemberRank = useCallback(()=>{
        const selected = member.memberRank.length > 0;
        setMemberRankValid(selected);
    },[member.memberRank]);
    const checkMemberBank = useCallback(()=>{
        const selected = member.memberBank.length > 0;
        setMemberBankValid(selected);
    },[member.memberBank]);

    // 주민번호값 계산
    const memberResident = useMemo(()=>{
        const front = memberResidentNumber?.frontNo ?? '';
        const rear = memberResidentNumber?.rearNo ?? '';
        return String(front) + String(rear);
    },[memberResidentNumber.frontNo, memberResidentNumber.rearNo])

    const memberRankClass = useMemo(()=>{
        if(memberRankValid === null) return "";
        return memberRankValid === true ? "is-valid" : "is-invalid";
    },[memberRankValid])
    const memberBankClass = useMemo(()=>{
        if(memberBankValid === null) return "";
        return memberBankValid === true ? "is-valid" : "is-invalid";
    },[memberBankValid])

   

    const memberBankNoClass = useMemo(()=>{
        if(memberBankNoValid === null) return "";
        return memberBankNoValid === true ? "is-valid" : "is-invalid";
    },[memberBankNoValid])




    const submitButton = useMemo(() => {
        return (
          memberIdValid &&
          memberPwValid &&
          memberPwReValid &&
          memberNameValid &&
          memberEmailValid &&
          memberAddressValid &&
          memberDepartmentValid &&
          memberRankValid &&
          memberBankValid &&
          memberBankNoValid &&
          rearNoValid &&
          frontNoValid
        );
      }, [
        memberIdValid,
        memberPwValid,
        memberPwReValid,
        memberNameValid,
        memberEmailValid,
        memberAddressValid,
        memberDepartmentValid,
        memberRankValid,
        memberBankValid,
        memberBankNoValid,
        rearNoValid,
        frontNoValid,
      ]);

    //view
    return (<>
        <Jumbotron subject="회원가입" ></Jumbotron>

        <div className="row mt-4">
            <label className="col-sm-3 col-form-label">아이디</label>
            <div className="col-sm-9">
                <input type="text" name="memberId" value={member.memberId} onChange={changeMember} onBlur={checkMemberId} className={`form-control ${memberIdClass}`} placeholder="회사명 입력"></input>
            </div>
        </div>


     

       {/* <div className="row mt-4">
            <label className="col-sm-3 col-form-label">비밀번호 </label>
            <div className="col-sm-9">
                    <div className="badge">
                    <FaEye className="text-muted ms-1"/>
                    </div>

                <input type="password" name="memberPw" value={member.memberPw} onChange={e=>{changeMemberPw(e)}} 
                className={`form-control ${memberPwClass}`} placeholder="비밀번호 입력" onBlur={checkMemberPw} ></input>

                <div className="d-flex flex-column text-muted border mt-2">
                <span className={` extra-small ${pwComponentsClass.lowercase}`}>영어 소문자 최소 1개이상을 포함해야 합니다.</span>
                <span className={` extra-small ${pwComponentsClass.uppercase}`}>영어 대문자 최소 1개이상을 포함해야 합니다.</span>
                <span className={` extra-small ${pwComponentsClass.number}`}>숫자 최소 1개이상을 포함해야 합니다.</span>
                <span className={` extra-small ${pwComponentsClass.special}`}>특수기호 !@#$%^&* 중에 최소 1개이상을 포함해야 합니다.</span>
                <span className={` extra-small ${pwComponentsClass.count}`}>비밀번호 길이는 8자에서 16자여야만 합니다</span>
                </div>
            </div>
            
        </div>  */}

        <div className="row mt-4">
        <label className="col-sm-3 col-form-label">비밀번호</label>
        <div className="col-sm-9">
            <div className="input-group">
            <input 
                type={pwEye === true ? "password":"text"} 
                name="memberPw" 
                value={member.memberPw} 
                onChange={e => changeMemberPw(e)} 
                className={`form-control ${memberPwClass}`} 
                placeholder="비밀번호 입력" 
                onBlur={checkMemberPw} 
            />
            <span className="input-group-text" style={{backgroundColor:"white"}}>
                            {/* true 면 보이게해서 아이콘은 슬래시 */}
                            {pwEye === false ?(
                                <FaEyeSlash onClick={pwType}/>
                            ) : (
                                <FaEye onClick={pwType} />
                            )}

                        </span>
            </div>

            <div className="d-flex flex-column text-muted border mt-2">
            <span className={`extra-small ${pwComponentsClass.lowercase}`}>영어 소문자 최소 1개이상을 포함해야 합니다.</span>
            <span className={`extra-small ${pwComponentsClass.uppercase}`}>영어 대문자 최소 1개이상을 포함해야 합니다.</span>
            <span className={`extra-small ${pwComponentsClass.number}`}>숫자 최소 1개이상을 포함해야 합니다.</span>
            <span className={`extra-small ${pwComponentsClass.special}`}>특수기호 !@#$%^&* 중에 최소 1개이상을 포함해야 합니다.</span>
            <span className={`extra-small ${pwComponentsClass.count}`}>비밀번호 길이는 8자에서 16자여야만 합니다</span>
            </div>
        </div>
        </div>


         <div className="row mt-4">
            <label className="col-sm-3 col-form-label">비밀번호 확인</label>
            <div className="col-sm-9">
            <div className="input-group">

                <input type={pwReEye === true ? "password" : "text"} name="memberPwRe" value={memberPwRe} onChange={e=>setMemberPwRe(e.target.value)} 
                onBlur={checkMemberPwRe}
                className={`form-control ${memberPwReClass}`} placeholder="비밀번호 재입력"></input>
                <span className="input-group-text" style={{backgroundColor:"white"}}>
                    {/* true 면 보이게해서 아이콘은 슬래시 */}
                    {pwReEye === false ?(
                        <FaEyeSlash onClick={pwReType}/>
                    ) : (
                        <FaEye onClick={pwReType} />
                    )}


                    {/* <FaEyeSlash onClick={pwReType}/> */}

                    
                </span>
            </div>
            </div>
                <div className="valid-feedback">비밀번호가 일치합니다.</div>
                <div className="invalid-feedback">비밀번호가 일치하지 않습니다.</div>
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
                className={`form-control ${frontNoClass}`} placeholder="주민번호 앞자리" maxLength={6}></input>
                <span className="me-2 ms-2">-</span>
                <input type="text" inputMode="numeric" onBlur={checkMemberResidentNoRear} 
                name="rearNo" value={memberResidentNumber.rearNo} onChange={changeResidentNoRearNo} maxLength={7}
                className={`form-control ${rearNoClass}`} placeholder="뒷자리"  ></input>
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
                <div className="d-flex">

                <input type="text" name="memberPost" readOnly value={member.memberPost} 
                className={`form-control w-auto ${memberAddressClass}`} size={6} maxLength={6} onChange={changeAddress} placeholder="우편번호"></input>
            <Postcode className="btn btn-light btn-outline-dark ms-2"  onAddressSelected={changeAddress}><FaMagnifyingGlassPlus/>주소 검색하기</Postcode>
                </div>
                <input type="text" name="memberAddress1" readOnly value={member.memberAddress1} 
                className={`form-control mt-1 ${memberAddressClass}`} onChange={changeAddress} placeholder="기본주소"></input>
                <input type="text" name="memberAddress2" value={member.memberAddress2} className={`form-control mt-1 ${memberAddressClass}`} 
                onChange={changeMember} onBlur={checkMemberAddress} placeholder="상세주소"></input>
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
                <select className={`form-select ${memberRankClass}`} name="memberRank" value={member.memberRank} onChange={changeMember} onBlur={checkMemberRank}>
                    <option value="">선택하세요</option>
                    <option value="부장">부장</option>
                    <option value="차장">차장</option>
                    <option value="과장">과장</option>
                    <option value="대리">대리</option>
                    <option value="주임">주임</option>
                    <option value="사원">사원</option>
                    <option value="인턴">인턴</option>
                </select>
                <div className="invalid-feedback">한개 이상을 선택하셔야 합니다</div>
            </div>
        </div>
        <div className="row mt-4">
            <label className="col-sm-3 col-form-label">은행</label>
            <div className="col-sm-9">
            <select className={`form-select ${memberBankClass}`} name="memberBank" value={member.memberBank} onChange={changeMember} onBlur={checkMemberBank}>
                    <option value="">선택하세요</option>
                    <option value="신한은행">신한은행</option>
                    <option value="농협은행">농협은행</option>
                    <option value="우리은행">우리은행</option>
                    <option value="하나은행">하나은행</option>
                </select>
                <div className="invalid-feedback">한개 이상을 선택하셔야 합니다</div>
            <input type="text" name="memberBankNo" value={member.memberBankNo} inputMode="numeric" className={`form-control ${memberBankNoClass}`}
            onBlur={checkMemberBankNo} maxLength={15} onChange={changeMemberBankNo} placeholder="계좌번호"></input>
            </div>
        </div>
        <div className="row mt-4">
            <div className="col d-flex">
                <button onClick={submitForm} className="btn btn-success ms-auto " disabled={!submitButton}><FaUserCircle className="align-middle me-1"/> 회원가입</button>
            </div>
        </div>
        <div style={{minHeight: 150}}></div>
    </>)
}