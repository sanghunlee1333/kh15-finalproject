import { useRecoilValue } from "recoil"
import { userNoState } from "../utils/stroage"
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import axios from "axios";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Jumbotron from "../template/Jumbotron";
import userImg from '/public/images/profile_basic.png';
import { Modal } from "bootstrap";
import Postcode from "../template/Postcode";
import { FaMagnifyingGlassPlus } from "react-icons/fa6";

export default function EditProfile(){
    // const userNo = useRecoilValue(userNoState);
    const [member,setMember] = useState({
        memberNo:"", memberId:"", memberDepartment:"", memberName:"", memberContact:"", memberEmail:"",
        memberPost:"", memberAddress1:"", memberAddress2:"", memberRank:"", memberBank:"", memberBankNo:"", 
    })    
    

    const [memberImg, setMemberImg] = useState({attachmentNo:"", url:""})
    
    const [newAttach,setNewAttach] = useState("");
    const zoomModal = useRef();
    const inputImage = useRef();
    
    const [addressValid, setAddressValid] = useState(true);
    const [contactValid, setContactValid] = useState(true);
    const [emailValid, setEmailValid] = useState(true);

    const checkContact = useCallback(()=>{
        const regex = /^010[0-9]{8}$/;
        const isValid = regex.test(member.memberContact);
       
        setContactValid(isValid);
    },[member]);

    const checkEmail = useCallback(()=>{
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = regex.test(member.memberEmail);
        setEmailValid(isValid);
    },[member]);

    const checkAddress = useCallback(()=>{
    //  console.log(member.memberPost);
        const isValid = member.memberPost?.length > 0 &&
                     member.memberAddress1?.length > 0 &&
                     member.memberAddress2?.length > 0;
        setAddressValid(isValid);
    //     console.log("setAddressValid check = " + isValid);
    },[member])

    const changeMember = useCallback((e)=>{
      setMember(prev=>({
        ...prev,
        [e.target.name]: e.target.value,
      }))
    },[member]);

    const changeAddress = useCallback((post, address1)=>{
      setMember(prev=>({
        ...prev,
        memberPost:post,
        memberAddress1:address1
      }))
    },[member])

      {/* 이미지 띄우기 */}
    const [preview, setPreview] = useState({
      attachmentNo:"", url:"",
    });


    const postModal = useRef();
    const postAPI = useCallback(()=>{
      postModal.current.click();
    },[])

     {/* 이미지 띄우기 */}
    const loadOne = useCallback(async()=>{
        const resp = await axios.get("/mypage/");
        setMember(resp.data.memberDto);
        // console.log("resp");
        // console.log(resp.data.attachmentNo);
        if (resp.data.attachmentNo !== -1) {
            try {
              // 이미지 blob으로 가져오기
              const imageResp = await axios.get(`/mypage/attachment/${resp.data.attachmentNo}`, {
                responseType: "blob",
              });

              const imageBlob = imageResp.data;
              const imageUrl = URL.createObjectURL(imageBlob);

              setPreview({
                attachmentNo: resp.data.attachmentNo,
                url: imageUrl,
              });
              setMemberImg({
                  attachmentNo: resp.data.attachmentNo,
                url: imageUrl,
              })
            } catch (error) {
              console.error("이미지 가져오기 실패:", error);
            }
          } else {
            setPreview({attachmentNo:"",url:""});
            setMemberImg({attachmentNo:"",url:""});
          }
    },[]);
    
    useEffect(()=>{loadOne()},[]);
    
    const pwEdit = useRef();
    const infoEdit = useRef();

    const [memberInfo, setMemberInfo] = useState({
        memberContact:"", memberEmail:"", memberPost:"", memberAddress1:"", memberAddress2:"",
        memberBank:"", memberBankNo:"",
    })

    const openChangeInfo = useCallback(()=>{
        const target = Modal.getOrCreateInstance(infoEdit.current);
        target.show();
    },[]);
    const closeChangeInfo = useCallback(()=>{
        const target = Modal.getInstance(infoEdit.current);
        target.hide();
        // setMemberInfo("");
        loadOne();
    },[]);
   

    const openChangePw = useCallback(()=>{
        const target = Modal.getOrCreateInstance(pwEdit.current);
        target.show();
    },[]);
    const closeChangePw = useCallback(()=>{
        const target = Modal.getInstance(pwEdit.current);
        target.hide();
        setMemberPw("");
        setPwCheck("");
    },[])

    const [memberPw, setMemberPw] = useState("");
    const [pwCheck, setPwCheck] = useState("");
    const [memberPwValid, setMemberPwValid] = useState(false);
    const [pwCheckValid, setPwCheckValid] = useState(false);


    const changeNewPw = useCallback((e) => {
       
        setMemberPw(e.target.value);
    }, []);
    const changePwCheck = useCallback((e) => {
        setPwCheck(e.target.value);
    }, []);
    const checkMemberPw = useCallback(()=>{
         const isValid =  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,16}$/.test(memberPw);
         setMemberPwValid(isValid);
    },[memberPw])
    const checkPwCheck = useCallback(()=>{
        const isValid = memberPw === pwCheck;
        setPwCheckValid(isValid);
        if(memberPw === null){
            setPwCheckValid(false);
        }
    },[pwCheck, memberPw])

    const changePw = useCallback(async ()=>{
      
        const resp = await axios.post("/mypage/changePw", {memberPw});
     
        
        if(resp.data === true){
            closeChangePw();
        }
    },[memberPw, memberPwValid, pwCheckValid]);


    const blockPwButton = useMemo(()=>{
        return memberPwValid === true && pwCheckValid === true;
    },[memberPwValid, pwCheckValid])


    const changeInfo = useCallback(async () => {
      console.log(member);
    
      try {
        // 1. 이미지가 바뀐 경우 + newAttach가 있는 경우
        if (memberImg !== preview && newAttach !== null) {
          const formData = new FormData();
          formData.append("newAttach", inputImage.current.files[0]);
    
          // 프로필 이미지 변경 요청
          await axios.post("/mypage/profile", formData, {
            headers: { "Content-Type": "multipart/form-data" }
          });
    
          // 프로필 이미지 변경 이벤트 발생
          window.dispatchEvent(new Event("profileImageUpdated"));
        }
    
        // 2. 회원 정보 변경 요청
        const resp = await axios.patch("/mypage/edit", member);
    
        closeChangeInfo();
      } catch (error) {
        console.error("정보 변경 실패", error);
        alert("정보 변경 중 오류가 발생했습니다.");
      }
    }, [memberImg, preview, newAttach, member, emailValid, contactValid, addressValid]);    

    const blockButton = useMemo(()=>{
        return addressValid === true && contactValid === true && emailValid === true;
    },[emailValid, contactValid, addressValid]);

    // useEffect(()=>{console.log(memberPw)},[memberPw])
    // useEffect(()=>{console.log(pwCheck)},[pwCheck])


    const addOrUpdateProfile = useCallback(()=>{
        inputImage.current.click();

    },[]);

    
    const changeProfile = useCallback((e)=>{
      const file = e.target.files[0];
      if (!file) return;
      setNewAttach(file);
      const url = URL.createObjectURL(file);
      // console.log(file.name);
      // console.log(file.type);
      // console.log(file.size);
      setPreview({
        url:url
      })
    },[])


    const zoomProfile = useCallback(()=>{
      const target = Modal.getOrCreateInstance(zoomModal.current);
      target.show();
    },[])

    // useEffect(()=>{
    //   console.log("preview");
    //   console.log(preview.attachmentNo);
    //   console.log(preview.url);

    // },[preview])

    

    return (<>
          <Jumbotron subject={`${member.memberName} 님의 상세페이지`}></Jumbotron>
         
 
 <div className="d-flex gap-4 mt-4">

  {/* 📄 사원 정보 카드 */}
  <div className="card shadow-sm p-4 w-100" style={{ maxWidth: '1800px', flex: 1 }}>
    <div className="d-flex flex-wrap flex-row align-items-start gap-4">
      
      
      {preview.url ? (
          <img 
            src={memberImg.url}
            alt="사용자 사진"
            onClick={zoomProfile}
            className="rounded"
            style={{ width: '120px', height: '120px', objectFit: 'cover', cursor: 'pointer' }}
            />
          ):(
            <img 
            src={userImg}
            alt="사용자 사진"
            onClick={zoomProfile}
            className="rounded"
            style={{ width: '120px', height: '120px', objectFit: 'cover', cursor: 'pointer' }}
            />
          )}
      

      <div className="">
        <h4 className="mb-1">{member.memberName}</h4>
        <span className="text-muted mb-1">{member.memberDepartment} | {member.memberRank}</span> <br/>
        <span className="text-muted">사원번호: {member.memberNo}</span><br/>
      </div>
    </div>

    <hr className="my-4" />

    <div className="row">
      <div className="col-md-6">
        <span className="mt-2 d-block"><strong>아이디:</strong> {member.memberId}</span> <br/>
        <span className="mt-2 d-block "><strong>연락처:</strong> {member.memberContact}</span><br/>
        <span className="mt-2 d-block"><strong>이메일:</strong> {member.memberEmail}</span><br/>
        <span className="mt-2 d-block"><strong>우편 번호:</strong> {member.memberPost}</span><br/>
        <span className="mt-2 d-block"><strong>기본 주소:</strong> {member.memberAddress1}</span><br/>
        <span className="mt-2 d-block"><strong>상세 주소:</strong> {member.memberAddress2}</span><br/>
      </div>
      <div className="col-md-6">
        <span className="mt-2 d-block"><strong>은행명:</strong> {member.memberBank}</span><br/>
        <span className="mt-2 d-block"><strong>계좌번호:</strong> {member.memberBankNo}</span>
      </div>
    </div>
  </div>

  {/* 🎯 버튼 영역 */}
  <div className="d-flex flex-column gap-3">
    <button className="btn btn-outline-primary" onClick={openChangePw}>비밀번호 변경</button>
    <button className="btn btn-outline-secondary" onClick={openChangeInfo}>정보 수정</button>

  </div>

</div>

  <div className="modal fade" tabIndex="-1" role="dialog" ref={infoEdit} data-bs-backdrop="static">
                <div className="modal-dialog modal-lg" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                        <h2>{member.memberName} 의 개인정보 수정</h2>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"  >
                        </button>
                        </div>
                        <div className="modal-body">
                            <div className="row mt-2">
                                <div className="col text-center">
                                  {/* 이미지 띄우기 */}
                                  {preview.url ? (
                                    <img 
                                      src={preview.url}
                                      alt="사용자 사진"
                                      onClick={addOrUpdateProfile}
                                      className="rounded"
                                      style={{ width: '120px', height: '120px', objectFit: 'cover', cursor: 'pointer' }}
                                      />
                                    ):(
                                      <img 
                                      src={userImg}
                                      alt="사용자 사진"
                                      onClick={addOrUpdateProfile}
                                      className="rounded"
                                     style={{ width: '120px', height: '120px', objectFit: 'cover', cursor: 'pointer' }}
                                      />
                                    )}
                                </div>
                            </div>
                          
                          
                          <input type="file" className="form-control" ref={inputImage} accept=".png,.jpg,.jpeg "
                          onChange={changeProfile}  style={{ display: "none" }}/>


                          <div className="row mt-2">
                            <label className="col-sm-3 col-form-label">연락처</label>
                            <div className="col-sm-9">
                                <input type="text" className="form-control" name="memberContact" onChange={(e)=>changeMember(e)} onBlur={checkContact}
                                value={member.memberContact} inputMode="numeric" />
                            </div> 
                          </div>
                       
                          <div className="row mt-2">
                            <label className="col-sm-3 col-form-label">이메일</label>
                            <div className="col-sm-9">
                                <input type="text" className="form-control" name="memberEmail" onBlur={checkEmail} onChange={changeMember}
                                 value={member.memberEmail} />
                            </div> 
                          </div>
                       
                          <div className="row mt-2">
                            <label className="col-sm-3 col-form-label">우편번호</label>
                            <div className="col-sm-9 d-flex">
                                <input type="text" className="form-control" name="memberPost" readOnly onBlur={checkAddress}  
                                value={member.memberPost} inputMode="numeric" size={6} maxLength={6} />
                                 <Postcode className="btn btn-light ms-2" ref={postModal} onAddressSelected={changeAddress}>
                                  <span className="text-nowrap"><FaMagnifyingGlassPlus/> 주소 검색하기</span></Postcode>
                                           
                            </div> 
                          </div>
                       
                          <div className="row mt-2">
                            <label className="col-sm-3 col-form-label">기본주소</label>
                            <div className="col-sm-9">
                                <input type="text" className="form-control" name="memberAddress1" readOnly onBlur={checkAddress} 
                                value={member.memberAddress1} inputMode="numeric" />
                            </div> 
                          </div>
                       
                          <div className="row mt-2">
                            <label className="col-sm-3 col-form-label">상세주소</label>
                            <div className="col-sm-9">
                                <input type="text" className="form-control" name="memberAddress2" onBlur={checkAddress} onChange={changeMember}
                                value={member.memberAddress2} inputMode="numeric" />
                            </div> 
                          </div>
                       
                      
                       
                           
                        </div>
                        <div className="modal-footer">
                        <div className="d-flex justify-content-between">
                            
                            <button className="btn btn-secondary" onClick={changeInfo} //disabled={!blockButton}
                            >변경하기</button> 
                            <button className="btn btn-danger" >닫기</button>
                        </div>
                        
                        </div>
                    </div>
                    </div>
                    </div>
                
  <div className="modal fade" tabIndex="-1" role="dialog" ref={pwEdit} data-bs-backdrop="static">
                <div className="modal-dialog modal-lg" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                        <h2>{member.memberName} 의 개인정보 수정</h2>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"  >
                        </button>
                        </div>
                        <div className="modal-body">
                          <div className="row">
                            <label className="col-sm-3 col-form-label"> 바꿀 비밀번호</label>
                            <div className="col-sm-9">
                                <input type="text" className="form-control" onChange={changeNewPw} value={memberPw}
                                placeholder="영어 소문자, 대문자, 숫자, 특수기호 모두 1개이상씩 포함되어야 하고 8자~16자 사이여야합니다"
                                onBlur={checkMemberPw}/> 
                            </div>
                          </div>
                          <div className="row mt-2">
                            <label className="col-sm-3 col-form-label"> 비밀번호 확인</label>
                            <div className="col-sm-9">
                                <input type="text" className="form-control" onChange={changePwCheck} value={pwCheck}
                                placeholder="바꿀 비밀번호와 일치해야 합니다" onBlur={checkPwCheck}/> 
                            </div>
                          </div>
                       
                           
                        </div>
                        <div className="modal-footer">
                        <div className="d-flex justify-content-between">
                            
                            <button className="btn btn-secondary" onClick={changePw} disabled={!blockPwButton}>변경하기
                              </button> 
                            <button className="btn btn-danger" >닫기</button>
                        </div>
                        
                        </div>
                    </div>
                    </div>
                    </div>
                
    <div className="modal fade" tabIndex="-1" role="dialog" ref={zoomModal} data-bs-backdrop="static">
                <div className="modal-dialog modal-lg" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                        <h2>{member.memberName} 의 프로필</h2>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"  >
                        </button>
                        </div>
                        <div className="modal-body">
                          {preview.url ? (
                                    <img 
                                      src={preview.url}
                                      alt="사용자 사진"
                                     // onClick={addOrUpdateProfile}
                                      className="rounded w-100"
                                      style={{ width: '100%', maxWidth: '800px', height: 'auto' }}
                                     // style={{ width: '120px', height: '120px', objectFit: 'cover', cursor: 'pointer' }}
                                      />
                                    ):(
                                      <img 
                                      src={userImg}
                                      alt="사용자 사진"
                                      className="rounded"
                                     style={{ width: '100%', maxWidth: '800px', height: 'auto' }}
                                      />
                                    )}
                           
                        </div>
                        <div className="modal-footer">
                        
                        </div>
                    </div>
                    </div>
                    </div>



    </>)
}