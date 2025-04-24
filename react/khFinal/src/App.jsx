import { Link, Route, Routes } from 'react-router'
import './App.css'

import Menu from './components/template/Menu'
import Mainpage from './components/Mainpage'
import Sidebar from './components/template/Sidebar'
import MemberLogin from './components/Member/MemberLogin'
import NoticeList from './components/Notice/NoticeList'
import NoticeDetail from './components/Notice/NoticeDetail'
import ChatContact from './components/Websocket/ChatContact'
import GroupChat from './components/Websocket/GroupChat'
import ChatRoom from './components/Websocket/ChatRoom'


function App() {
  
  return (
    <>
      {/* 메뉴 */}
      <Menu/>

      {/* 사이드바 */}
      <Sidebar/>
      
      <div>

        {/* Routes에 주소와 연결될 컴포넌트를 작성하여 상황에 맞는 화면 출력 */}
        <Routes>
          <Route path="/" element={<Mainpage/>}></Route>

          {/* Member */}
          <Route path="/member/login" element={<MemberLogin/>}></Route>
          <Route path="/member/join" element={<MemberLogin/>}></Route>

          {/* Notice */}
          <Route path="/notice/list" element={<NoticeList/>}></Route>
          <Route path="/notice/detail" element={<NoticeDetail/>}></Route>
          <Route path="/notice/write" element={<MemberLogin/>}></Route>
          
          {/* ChatContact */}
          <Route path="/chat/contact" element={<ChatContact/>}></Route>
          <Route path="/chat/room" element={<ChatRoom/>}></Route>
          <Route path="/chat/group" element={<GroupChat/>}></Route>
        </Routes>

      </div>
    </>
  )
}

export default App
