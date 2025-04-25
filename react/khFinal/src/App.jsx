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


function App() {

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

          {/* Notice */}
          <Route path="/notice/list" element={<NoticeList/>}></Route>
          <Route path="/notice/detail" element={<NoticeDetail/>}></Route>
          <Route path="/notice/write" element={<MemberLogin/>}></Route>
          
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