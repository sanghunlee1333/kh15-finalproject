import { Link, Route, Routes } from 'react-router-dom'
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
import { alarmListState } from './components/utils/alarm';
import { unReadAlarmCountState } from './components/utils/alarm'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import { useCallback, useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { Modal } from 'bootstrap';
import MemberList from './components/Admin/MemberList'
import MemberManage from './components/Admin/MemberManage'
import { Bounce, ToastContainer } from 'react-toastify'
import NoticeEdit from './components/Notice/NoticeEdit'
import TeamPlan from './components/Plan/TeamPlan'
import DateMange from './components/Admin/DateManage'
import SockJS from 'sockjs-client'
import { Client } from '@stomp/stompjs';
import TodoList from './components/Plan/TodoList'
import Member from './components/utils/member';
import Admin from './components/utils/admin';
import EditProfile from './components/Mypage/EditProfile'
import AdminAttendancePolicy from './components/Admin/AdminAttendancePolicy'
import AdminAttendanceDetail from './components/Admin/AdminAttendanceDetail'

import AllAlarm from './components/template/AllAlarm';
import AlarmInitializer from './AlarmInitializer'
import MainTeamPlan from './components/Plan/MainTeamPlan'
import MainNotice from './components/Notice/MainNotice'
 
function App() {
  const [userNo, setUserNo] = useRecoilState(userNoState);
  const [userDepartment, setUserDepartment] = useRecoilState(userDepartmentState);
  const [loading, setLoading] = useRecoilState(userLoadingState);
  const login = useRecoilValue(loginState);
  const setAlarmList = useSetRecoilState(alarmListState);
  const [unReadAlarmCount, setUnReadAlarmCount] = useRecoilState(unReadAlarmCountState);

  //일정 상세 모달을 가져오기 전에 초기화!
  const [groupContacts, setGroupContacts] = useState({});
  const [selectedEvent, setSelectedEvent] = useState(null);
  const detailModal = useRef();
  const openDetailModal = useCallback(() => {
    if (!detailModal.current) return;
    const target = Modal.getOrCreateInstance(detailModal.current);
    target.show();
  }, []);
  const closeDetailModal = useCallback(() => {
    const target = Modal.getInstance(detailModal.current);
    if (target) target.hide();
  }, []);
  
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
      
      setUserNo(resp.data.memberNo);
      setUserDepartment(resp.data.memberDepartment);

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
  },[]);
  
  useEffect(() => {
    refreshLogin();
  }, []);

  // WebSocket 구독 설정
  useEffect(() => {
    if (!userNo) return;
    
    const socket = new SockJS("http://localhost:8080/ws");
    const client = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: axios.defaults.headers.common["Authorization"]
      },
      onConnect: () => {
        const topic = `/topic/room-list/${userNo}`;
        client.subscribe(topic, () => {
          window.dispatchEvent(new CustomEvent("refreshRoomList"));
        });

        //알림 채널 구독
        const alarm = `/alarm/${userNo}`;
        client.subscribe(alarm, (message)=>{
          const payload = JSON.parse(message.body); 

          if (window.location.pathname === "/alarm") {
            setUnReadAlarmCount(0);
          } else {
            setUnReadAlarmCount(prev => prev + 1);
          }
          setAlarmList(prev=>[payload, ...prev]); //최신 알림을 앞으로 추가

          //강제로 알림 목록 다시 불러오게 AllAlarm 컴포넌트에 이벤트 전달
          window.dispatchEvent(new CustomEvent("refreshAlarmList"));
        });
      },
      debug: () => {}
    });
    
    client.activate();
    return () => client.deactivate();
  }, [userNo]);

  //연락처 정보 미리 초기화
  useEffect(() => {
    const token = sessionStorage.getItem("refreshToken") || localStorage.getItem("refreshToken");
    axios.get("/member/contactIncludeMe", {
      headers: { Authorization: `Bearer ${token}` }
    }).then(resp => {
      setGroupContacts(resp.data);
    });
  }, []);

  if (!loading) return <div>로딩 중...</div>;
  
  return (
    <>
      {/* 로그인 시, 알림 갯수 초기화 */}
      {userNo && loading && <AlarmInitializer />}

      {/* 메뉴 */}
      <Menu unReadAlarmCount={unReadAlarmCount}/>

      {/* 사이드바 */}
      <Sidebar/>

      <div className="main-content">

        {/* Routes에 주소와 연결될 컴포넌트를 작성하여 상황에 맞는 화면 출력 */}
        <Routes>
          <Route path="/" element={<Member><Mainpage/></Member>}></Route>

          {/* Alarm */}
          <Route path="/alarm" element={
            <AllAlarm
              groupContacts={groupContacts}
              loginUserNo={userNo}
              detailModal={detailModal}
              selectedEvent={selectedEvent}
              setSelectedEvent={setSelectedEvent}
              openDetailModal={openDetailModal}
              closeDetailModal={closeDetailModal}
              showDeleteButton={false} // 여기서 넣어야 함!
            />
          }/>

          {/* Member */}
          <Route path="/member/login" element={<MemberLogin/>}></Route>
          <Route path="/member/join" element={<MemberJoin/>}></Route>

          {/* MyPage */}
          <Route path="/mypage" element={<EditProfile/>}></Route>

          {/* Admin */}
          <Route path="/admin/member/list" element={<Admin><MemberList/></Admin>}></Route>
          <Route path="/admin/member/:number" element={<Admin><MemberManage/></Admin>}></Route>
          <Route path="/admin/date" element={<Admin><DateMange/></Admin>}></Route>
          <Route path="/admin/attendance" element={<Admin><AdminAttendancePolicy/></Admin>}></Route>
          <Route path="/admin/attendance/detail/:memberNo" element={<Admin><AdminAttendanceDetail/></Admin>}></Route>

          {/* Notice */}
          <Route path="/notice/list" element={<NoticeList/>}></Route>
          <Route path="/notice/write" element={<NoticeWrite/>}></Route>
          <Route path="/notice/detail/:noticeNo" element={<NoticeDetail/>}></Route>
          <Route path="/notice/edit/:noticeNo" element={<NoticeEdit/>}></Route>
          <Route path="/notice/mainNotice" element={<MainNotice/>}></Route>
          
          {/* Plan */}
          <Route path="/plan/team" element={<TeamPlan/>}></Route>
          <Route path="/plan/todo" element={<TeamPlan />}></Route>
          <Route path="/plan/mainTeamPlan" element={<MainTeamPlan />}></Route>

          {/* Contact */}
          <Route path="/member/contact" element={<MemberContact/>}></Route>

          {/* Chat */}
          <Route path="/chat/room/" element={<ChatRoom/>}></Route>
          <Route path="/chat/group/:roomNo" element={<GroupChat/>}></Route>
          <Route path="/chat/room/:roomNo" element={<GroupChat />}></Route>
        </Routes>

        <Footer/>

        {/* 토스트 메세지 컨테이너 */}
        <ToastContainer
          position="bottom-right"
          autoClose={5000}
          hideProgressBar
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
          transition={Bounce}
        />
      </div>
      
      
    </>
  )
}

export default App