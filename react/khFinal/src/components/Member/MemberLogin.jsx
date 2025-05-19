import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useRecoilState, useRecoilValue } from "recoil";
import { loginState, userDepartmentState, userNoState } from "../utils/stroage";
import { useNavigate } from "react-router";
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


    useEffect(()=>{
        console.log(userNo + " nono");
        console.log(userDepartment );
        console.log(login);
        console.log(axios.defaults.headers.common['Authorization']);
    },[axios.defaults.headers.common['Authorization']])
    

    //callback
    const changeMembers = useCallback((e)=>{
        setMembers(prev=>({
            ...prev,
            [e.target.name] : e.target.value
        }));
    },[])

    const gotoLogin = useCallback(async()=>{
        //console.log(members);
        const resp = await axios.post("/member/login", members);
        try{

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
          console.log("LoGINXXXX");
        }
    },[members]);

   

    const checked = useCallback((e)=>{
        setClick(e.target.checked);
    },[click])

    // const gotoLogout = useCallback(async ()=>{
    //   await axios.delete("/member/logout");
    //   window.localStorage.removeItem('refreshToken');
    //   window.sessionStorage.removeItem('refreshToken');
    //   setUserNo("");
    //   setUserDepartment("");
      
    // },[])

    // const refreshLog = useCallback(async ()=>{
    //   const rest = await axios.get("/member/refresh");
    //   console.log("new refreshtoken");
    //   console.log(rest.data.refreshToken);
    // },[])

   

    // style={{ minHeight: 'calc(70vh)' }}
    // view
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
    <span>userNo = {userNo}</span>
    <span>userDepartment = {userDepartment}</span>

      {/* 로그아웃 버튼
    <div className="row mt-3">
      <div className="col">
        <button className="btn btn-secandary" onClick={gotoLogout}>
          로그아웃
        </button>
      </div>
    </div>

      {/* 리프레쉬 
      <div className="row mt-3">
      <div className="col">
         <button className="btn btn-secandary" onClick={refreshLog}>
          리프레시
        </button>
        <span>userNo = {userNo}</span>
        <span>userDepartment = {userDepartment}</span> 
      </div>
    </div> */}

  </div>
</div>
        {/* </div> */}
    </>);
}