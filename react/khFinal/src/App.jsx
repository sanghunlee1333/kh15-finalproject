import { Link, Route, Routes } from 'react-router'
import './App.css'

import Menu from './components/template/Menu'
import Mainpage from './components/Mainpage'
import Sidebar from './components/template/Sidebar'
import MemberLogin from './components/Member/MemberLogin'
import NoticeList from './components/Notice/NoticeList'
import NoticeDetail from './components/Notice/NoticeDetail'
import GroupChat from './components/Websocket/GroupChat'
import ChatRoom from './components/Websocket/ChatRoom'
import MemberJoin from './components/Member/MemberJoin'
import MemberContact from './components/Member/MemberContact'
import Footer from './components/template/Footer'
import NoticeWrite from './components/Notice/NoticeWrite'
import { loginState, userDepartmentState, userLoadingState, userNoState } from './components/utils/stroage'
import { useRecoilState, useRecoilValue } from 'recoil'
import { useCallback, useEffect } from 'react'
import axios from 'axios'
import MemberList from './components/Admin/MemberList'
import MemberManage from './components/Admin/MemberManage'
import NoticeUpdate from './components/Notice/NoticeUpdate'

function App() {
const [userNo, setUserNo] = useRecoilState(userNoState);
const [userDepartment, setUserDepartment] = useRecoilState(userDepartmentState);
const [loading, setLoading] = useRecoilState(userLoadingState);
const login = useRecoilValue(loginState);

let stay = false;
const refreshLogin = useCallback(async ()=>{
  let refreshToken = window.sessionStorage.getItem("refreshToken");
  if(refreshToken === null) {
      refreshToken = window.localStorage.getItem("refreshToken");
    if(refreshToken === null) {
      setLoading(true); 
      return;
    }else{
      stay = true;
    }
  }
  try{
    axios.defaults.headers.common["Authorization"] = `Bearer ${refreshToken}`;
    const resp = await axios.post("/member/refresh");
    setUserNo(resp.data.userNo);
    setUserDepartment(resp.data.userDepartment);
    axios.defaults.headers.common["Authorization"] = `Bearer ${resp.data.accessToken}`;
    if(stay){
      window.sessionStorage.removeItem("refreshToken");
      window.localStorage.setItem("refreshToken", resp.data.refreshToken);
    }
    else{
        window.localStorage.removeItem("refreshToken");
        window.sessionStorage.setItem("refreshToken", resp.data.refreshToken);
    }
    setLoading(true);
  }
  catch(e){
    setLoading(true);
  }
},[])

useEffect(()=>{refreshLogin();},[])



  return (
    <>
      {/* 메뉴 */}
      <Menu/>

      {/* 사이드바 */}
      <Sidebar/>

      <div className="main-content">

        {/* Routes에 주소와 연결될 컴포넌트를 작성하여 상황에 맞는 화면 출력 */}
        <Routes>
          <Route path="/" element={<Mainpage/>}></Route>

          {/* Member */}
          <Route path="/member/login" element={<MemberLogin/>}></Route>
          <Route path="/member/join" element={<MemberJoin/>}></Route>

          {/* Admin */}
          <Route path="/admin/member/list" element={<MemberList/>}></Route>
          <Route path="/admin/member/:memberNo" element={<MemberManage/>}></Route>

          {/* Notice */}
          <Route path="/notice/list" element={<NoticeList/>}></Route>
          <Route path="/notice/write" element={<NoticeWrite/>}></Route>
          <Route path="/notice/detail/:noticeNo" element={<NoticeDetail/>}></Route>
          <Route path="/notice/update/:noticeNo" element={<NoticeUpdate/>}></Route>
          
          {/* Contact */}
          <Route path="/member/contact" element={<MemberContact/>}></Route>

          {/* Chat */}
          <Route path="/chat/room" element={<ChatRoom/>}></Route>
          <Route path="/chat/group" element={<GroupChat/>}></Route>
        </Routes>

        <Footer/>
      </div>
      
      
    </>
  )
}

export default App