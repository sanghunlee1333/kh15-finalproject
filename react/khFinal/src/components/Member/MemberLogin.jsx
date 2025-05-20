import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useRecoilState, useRecoilValue } from "recoil";
import { loginState, userDepartmentState, userNoState } from "../utils/stroage";
import { useNavigate } from "react-router";
import { Modal } from "bootstrap";
export default function MemberLogin(){
    const navigate = useNavigate();
    //recoil
    const [userNo, setUserNo] = useRecoilState(userNoState);
    const [userDepartment,setUserDepartment] = useRecoilState(userDepartmentState);
    const login = useRecoilValue(loginState);

    //state
    const [members, setMembers] = useState({
        memberId : "", memberPw : "",
    });

    const [click,setClick] = useState(false);
    const [status, setStatus] = useState({
      idStatus:false, pwStatus:false
    });

    // useEffect(()=>{
    //     console.log(userNo + " nono");
    //     console.log(userDepartment );
    //     console.log(login);
    //     console.log(axios.defaults.headers.common['Authorization']);
    // },[axios.defaults.headers.common['Authorization']])
    

    //callback
    const changeMembers = useCallback((e)=>{
        setMembers(prev=>({
            ...prev,
            [e.target.name] : e.target.value
        }));
      if(members.memberId){
         setStatus(prev => ({
      ...prev,
      idStatus: true
    }));
      }    
      if(members.memberPw){
          setStatus(prev => ({
      ...prev,
      pwStatus: true
    }));
      }    
    },[members])

    const checkStatus = useMemo(()=>{
      return status.idStatus && status.pwStatus
    },[status])
    

    const failLogin = useRef();
    const openFailLogin = useCallback(()=>{
      const target = Modal.getOrCreateInstance(failLogin.current);
      target.show();
    },[])

    const closeFailLogin = useCallback(()=>{
      const target = Modal.getInstance(failLogin.current);
      target.hide();
    },[])

    const gotoLogin = useCallback(async()=>{
        //console.log(members);
        if(!checkStatus) return;
        
        
        try{
          console.log("try");
          const resp = await axios.post("/member/login", members);

          setUserNo(resp.data.memberNo);
          setUserDepartment(resp.data.memberDepartment);
          
          axios.defaults.headers.common['Authorization'] = `Bearer ${resp.data.accessToken}`;
          
          
          if(click === true){
            window.sessionStorage.removeItem('refreshToken');
            window.localStorage.setItem('refreshToken', resp.data.refreshToken);
          }
          else{
            window.localStorage.removeItem('refreshToken');
            window.sessionStorage.setItem('refreshToken', resp.data.refreshToken);
          }
          navigate("/");
        }
        catch(err){
         // console.log("LoGINXXXX");
          openFailLogin();
        }
    },[members]);

   

    const checked = useCallback((e)=>{
        setClick(e.target.checked);
    },[click])

 
    return (<>
    {/* <div className="container"> */}
    <div className="d-flex justify-content-center align-items-center" >
  <div className=" p-4 rounded-3 w-100 shadow bg-white" >
    {/* 아이디 입력 */}
    <div className="row mb-3">
      <label className="col-sm-3 col-form-label">아이디</label>
      <div className="col-sm-9">
        <input 
          type="text" 
          name="memberId" 
          placeholder="아이디를 입력하세요" 
          value={members.memberId} 
          onChange={changeMembers} 
          className="form-control" 
        />
      </div>
    </div>

    {/* 비밀번호 입력 */}
    <div className="row mb-3">
      <label className="col-sm-3 col-form-label">비밀번호</label>
      <div className="col-sm-9">
        <input 
          type="password" 
          name="memberPw" 
          placeholder="비밀번호를 입력하세요" 
          value={members.memberPw} 
          onChange={changeMembers} 
          className="form-control" 
        />
      </div>
    </div>

    {/* 로그인 유지 체크박스 */}
    <div className="row mb-3">
      <div className="col d-flex justify-content-end">
        <input 
          type="checkbox" 
          className="form-check-input me-1" 
          onChange={checked} 
        />
        <span className=" text-muted">로그인 유지</span>
      </div>
    </div>

    {/* 로그인 버튼 */}
    <div className="row mb-3">
      <div className="col">
        <button 
          className="btn btn-success me-auto" 
          onClick={gotoLogin}
        >
          로그인
        </button>
      </div>
    </div>
  


  </div>
</div>
      

      <div className="modal fade" tabIndex="-1" role="dialog" ref={failLogin} data-bs-backdrop="static">
            <div className="modal-dialog " role="document">
                <div className="modal-content">
                    <div className="modal-header">
                    <h2> 로그인 실패</h2>
                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"  >
                    </button>
                    </div>
                    <div className="modal-body" >
                        
                      <div style={{minHeight:'250px'}}>

                       <span>로그인 정보가 일치하지 않습니다</span>
                      </div>
                     
                    <div className="modal-footer">
                    
                        <button onClick={closeFailLogin} className="btn btn-danger"> 닫기</button>
                                        
                       
                   
                    </div>
                </div>
                </div>
            </div> 
            </div>
            
        
        



    </>);
}