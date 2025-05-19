import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import koLocale from '@fullcalendar/core/locales/ko';

import axios from 'axios';
import { Modal } from 'bootstrap';
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import moment from 'moment';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);
dayjs.locale('ko');

import { useNavigate } from "react-router-dom";
import { useLocation } from 'react-router-dom';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { fetchHolidays } from "../utils/holiday";
import { isPlanAllCompleted, refreshPlanEventsState } from '../utils/plan';
import { parseJwt } from '../utils/jwt';
import "react-datepicker/dist/react-datepicker.css";
import './TeamPlan.css';

import { FaCalendarAlt, FaCheck, FaCrown, FaLightbulb, FaList, FaListUl, FaRegCalendarCheck, FaRegCalendarPlus } from 'react-icons/fa';
import { IoPerson, IoPersonSharp } from 'react-icons/io5';
import './PlanColor.css';
import TodoList from './TodoList';
import { useSetRecoilState } from 'recoil';

const colorOptions = ['#dc3545', '#fd7e14', '#ffc107', '#28a745', '#20c997', '#0d6efd', '#6f42c1', '#d63384', '#6c757d'];

export default function TeamPlan() {

    //location
    const location = useLocation();
    const initialTab = location.pathname.includes("todo") ? "todo" : "calendar";
    const [tab, setTab] = useState(initialTab);

    //navigate
    const navigate = useNavigate();

    //recoil
    const setRefreshPlanEvents = useSetRecoilState(refreshPlanEventsState);

    //state
    const [isPersonal, setIsPersonal] = useState(false); // 일정 유형
    // const [tab, setTab] = useState('calendar');

    const [allEvents, setAllEvents] = useState([]);
    const [holidayEvents, setHolidayEvents] = useState([]);
    const [planEvents, setPlanEvents] = useState([]);
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1); //다음 달
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [allDay, setAllDay] = useState(false); //종일 일정 여부
    const [clickedDate, setClickedDate] = useState(null); //사용자가 마지막으로 클릭한 날짜
    const [titleChoice, setTitleChoice] = useState(false); //제목 입력 여부
    const [receiverChoice, setReceiverChoice] = useState(false); //참석자 선택 여부
    const [dateChoice, setDateChoice] = useState(false); //시작일, 종료일 선택 여부
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [planColor, setPlanColor] = useState('#0d6efd');

    const [endTimeManuallyChanged, setEndTimeManuallyChanged] = useState(false); //종료일 수동 조정 여부

    const [viewType, setViewType] = useState("전체");
    const [statusFilter, setStatusFilter] = useState("전체"); //일정 완료 여부 - 전체, 달성, 미달성
    const [title, setTitle] = useState(""); //일정 제목
    const [content, setContent] = useState(""); //일정 내용
    const [startTime, setStartTime] = useState(null); //일정 시작일
    const [endTime, setEndTime] = useState(null); //일정 종료일

    const [groupContacts, setGroupContacts] = useState({}); //전체 연락처 정보를 부서별로 저장
    const [filterContacts, setFilterContacts] = useState({}); //검색 필터가 적용된 연락처 목록을 저장
    const [searchContacts, setSearchContacts] = useState(""); //연락처 검색 input에 입력한 텍스트를 상태로 저장
    const [noResults, setNoResults] = useState(false); //검색 결과가 없을 경우 true가 되며, 사용자에게 안내 메시지를 보여주기 위해 사용
    const [selectedMembers, setSelectedMembers] = useState([]); //일정에 참여할 수신자들의 번호 목록

    const [eventRefreshKey, setEventRefreshKey] = useState(0); //selectedEvent 강제 리렌더를 위한 트리거
    const [selectedDate, setSelectedDate] = useState([]); //클릭한 날짜에 해당하는 일정
    const [selectedEvent, setSelectedEvent] = useState(null); //클릭한 일정의 상세 정보

    const [currentStatus, setCurrentStatus] = useState({});

    //ref
    const calendar = useRef(); //FullCalendar 컴포넌트를 조작하기 위한 참조
    const makeModal = useRef(); //일정 등록 모달 참조
    const detailModal = useRef(); //특정 일정 클릭 시 상세 모달 참조
    const deleteModal = useRef(); //상세 일정 -> 삭제 시 뜨는 모달 참조
    const listModal = useRef(); //특정 날짜 클릭 시 뜨는 일정 리스트 모달 참조

    const events = [...holidayEvents, ...planEvents]; 

    //memo
    //종료일이 시작일보다 앞선 경우 처리
    const isInvalidEndTime = useMemo(() => {
        if (!startTime || !endTime) return false; // 둘 다 존재할 때만 비교
        return endTime < startTime;
    }, [startTime, endTime]);

    //
    const loginUserNo = useMemo(() => {
        const token = localStorage.getItem("refreshToken") || sessionStorage.getItem("refreshToken");
        const payload = parseJwt(token);
        return payload?.memberNo;
    }, []);

    //등록 버튼 클릭 시, 전체 입력값 검사
    const validAllFields = useCallback(() => {
        setTitleChoice(true);
        setDateChoice(true);
        setReceiverChoice(true);
      
        return (
          !title ||
          !startTime ||
          !endTime ||
          isInvalidEndTime ||
          !selectedMembers.length
        );
    }, [title, startTime, endTime, isInvalidEndTime, selectedMembers]);

    //
    const filteredEvents = useMemo(() => {
        return events.filter(event => {
            const planType = event.extendedProps?.planType;
            const isHoliday = event.extendedProps?.isHoliday;
    
            if (isHoliday) return true;
    
            const planStatus = event.extendedProps?.planStatus;
    
            // 1. 일정 유형 필터
            const matchViewType =
                viewType === "전체" ||
                (viewType === "개인" && planType === "개인") ||
                (viewType === "팀" && (planType === "팀" || planType === "전체"));
    
            // 2. 상태 필터
            const isCompleted = planStatus === "완료";
            const matchStatus =
                statusFilter === "전체" ||
                (statusFilter === "달성" && isCompleted) ||
                (statusFilter === "미달성" && !isCompleted);
    
            return matchViewType && matchStatus;
        });
    }, [events, viewType, statusFilter]);

    //effect
    //
    useEffect(() => {
        if (location.pathname.includes("todo")) setTab("todo");
        else setTab("calendar");
    }, [location.pathname]);

    //연락처 목록 가져오기
    useEffect(() => {
        loadContacts(); //연락처(부서별 멤버) 목록
    }, []); //컴포넌트가 처음 렌더링된 직후 한 번만 실행

    //모든 이벤트 새로 가져오는 함수
    const fetchAllEvents = useCallback(async (year, month) => {
        const holidays = await fetchHolidays(year, month);
        let token = localStorage.getItem("refreshToken") || sessionStorage.getItem("refreshToken");
        const { data: teamPlans } = await axios.get("/plan/team", //팀 일정 가져오기
            {
                headers: { Authorization: `Bearer ${token}` } 
            }
        );
        const { data: personalPlans } = await axios.get("/plan/personal", 
            { 
                headers: { Authorization: `Bearer ${token}` } 
            }
        );

        const holidayEvents = holidays.flatMap(holiday => { //공휴일 
            const dateStr = `${holiday.locdate}`; // 'YYYYMMDD'
            const dateObj = new Date(
                `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`
            );
            return {
                id: `holiday-${holiday.locdate}-${holiday.dateName}`,
                title: holiday.dateName,
                start: dateObj,
                allDay: true,
                display: "background",
                backgroundColor: "#f79d9d",
                borderColor: "transparent",
                extendedProps: { isHoliday: true },
                className: ["holiday-event"]
            };
        });

        const teamPlanEvents = teamPlans.map(plan => ({//팀 일정
            id: `team-${plan.planNo}`, //고유 ID. 충돌 방지를 위해 prefix("team-") 붙임
            title: plan.planTitle,
            start: plan.planStartTime,
            end: plan.planEndTime,
            allDay: plan.planIsAllDay === "Y", //plan.planIsAllDay가 문자열 "Y"일 때만 종일 일정으로 처리하겠다는 뜻
            display: "block",
            backgroundColor: plan.planColor, //일정 바 색상
            borderColor: plan.planColor, //일정 바 테두리
            extendedProps: { //FullCalendar의 커스텀 속성 저장 공간 -> 내용, 참여자 정보도 저장할 수 있음
                planType: plan.planType,
                content: plan.planContent,
                planNo: plan.planNo,
                receivers: plan.receivers,  
                planColor: plan.planColor,
                planSenderNo: plan.planSenderNo, 
                planStatus: plan.planStatus,
                planSenderName: plan.planSenderName,
                planSenderDepartment: plan.planSenderDepartment
            }
        }));

        console.log("📌 teamPlans:", teamPlans);

        const personalPlanEvents = personalPlans.map(plan => ({ //개인-Todo
            id: `personal-${plan.planNo}`,
            title: plan.planTitle,
            start: plan.planStartTime,
            end: plan.planEndTime,
            allDay: plan.planIsAllDay === "Y", //plan.planIsAllDay가 문자열 "Y"일 때만 종일 일정으로 처리하겠다는 뜻
            display: "block",
            backgroundColor: plan.planColor,
            borderColor: plan.planColor,
            extendedProps: {
                planType: '개인',
                content: plan.planContent,
                planNo: plan.planNo,
                planColor: plan.planColor,
                planSenderNo: plan.planSenderNo,
                planStatus: plan.planStatus,
                planSenderName: plan.planSenderName
            }
        }));

        setHolidayEvents(holidayEvents);
        setPlanEvents([...teamPlanEvents, ...personalPlanEvents]);
        const combinedEvents = [...holidayEvents, ...teamPlanEvents, ...personalPlanEvents];
        setAllEvents(combinedEvents);
    }, []);

    //
    useEffect(() => {
        setRefreshPlanEvents(() => fetchAllEvents); // 함수 자체를 저장
    }, [fetchAllEvents]);

    //
    useEffect(() => {
        fetchAllEvents(currentYear, currentMonth);
    }, [currentYear, currentMonth, fetchAllEvents]);

    //
    useEffect(()=>{
        if(!searchContacts){ //검색창에 아무것도 입력하지 않았을 때
            setFilterContacts(groupContacts); //원래 전체 연락처 데이터를 그대로 filterContacts에 넣는다
            setNoResults(false); //검색 결과 없음(false) 로 초기화. 검색어가 없으니 검색 실패 상태일 이유도 없음
            return;
        }

        const filter = {}; //검색 결과를 저장할 임시 객체
        let found = false; //검색 결과 존재 여부 추적용 변수

        //부서명이든, 사람 이름이든 검색어가 포함돼 있으면
        Object.keys(groupContacts).forEach(dept => {
            const filteredMembers = groupContacts[dept].filter(member =>
              dept.includes(searchContacts) || member.memberName.includes(searchContacts)
            );
            if (filteredMembers.length > 0) {
              filter[dept] = filteredMembers;
              found = true;
            }
        });
        setFilterContacts(filter); //최종적으로 필터링된 결과를 상태에 저장
        setNoResults(!found); //검색 결과가 하나도 없으면 found === false이므로 noResults를 true로 설정
    }, [searchContacts, groupContacts]);

    //종일 일정이면 자동으로 종료일 설정 (단, 사용자가 종료일을 직접 조정하지 않았을 때만)
    useEffect(()=>{
        if (allDay && startTime && !endTimeManuallyChanged) {
            //종일 체크 시, 00:00 ~ 다음 날 00:00
            const start = new Date(startTime);
            start.setHours(0, 0, 0, 0);
            
            if (start.getTime() !== new Date(startTime).getTime()) {
                setStartTime(start);
            }

            const end = new Date(start);
            end.setDate(end.getDate() + 1); // 다음 날 00:00:00
            end.setHours(0, 0, 0, 0);
            setEndTime(end);
        }

        if(!allDay && startTime && endTime) {
            //종일 체크 해제 시, 현재 시각 기준으로 복원
            const now = new Date();

            if(new Date(startTime).getHours() === 0 && new Date(startTime).getMinutes() === 0) {
                const updatedStart = new Date(startTime);
                updatedStart.setHours(now.getHours(), now.getMinutes(), 0, 0);
                setStartTime(updatedStart);
            }
            if(new Date(endTime).getHours() === 0 && new Date(endTime).getMinutes() === 0) {
                const updatedEnd = new Date(endTime);
                updatedEnd.setHours(now.getHours() + 1, now.getMinutes(), 0, 0);
                setEndTime(updatedEnd);
            }

        }
    }, [allDay, startTime, endTime, endTimeManuallyChanged]);

    //
    useEffect(() => {
        const calendarApi = calendar.current?.getApi();
        if (!calendarApi) return;
      
        const currentDate = calendarApi.getDate(); // 현재 보이는 달력 날짜
        const today = new Date();
      
        const isSameMonth =
            currentDate.getFullYear() === today.getFullYear() &&
            currentDate.getMonth() === today.getMonth();
      
        const todayBtn = document.querySelector('.fc-today-button');
        if (todayBtn) {
            if (isSameMonth) {
                todayBtn.classList.add('fc-today-active');
            } else {
                todayBtn.classList.remove('fc-today-active');
            }
        }
    }, [currentMonth, currentYear]);

    //callback
    //연락처 데이터를 불러오기
    const loadContacts = useCallback(async ()=>{
        const { data } = await axios.get("/member/contactIncludeMe"); //응답으로 받은 데이터를 data라는 이름으로 저장
        setGroupContacts(data); //부서별 연락처 목록 전체 저장
        setFilterContacts(data); //처음에는 전체 목록 그대로 보여주기 위해 filterContacts에도 저장
    }, []);

    //includes = 자바스크립트 배열 함수. 
    //ex) selectedMembers.includes(3) -> 배열 안에 3이 들어있는지 확인해서 true/false 리턴
    const toggleMember = useCallback(memberNo => {
        setReceiverChoice(true); //수신자 선택 여부
        setSelectedMembers(prev => //지금 선택된 참여자 목록(selectedMembers)을 바탕으로 새 배열을 만든다는 의미. prev는 이전 상태값을 뜻
          prev.includes(memberNo) ? prev.filter(no => no !== memberNo) : [...prev, memberNo]
        ); //만약 prev 배열에 memberNo가 이미 있다면 -> 이미 체크된 사람이라는 뜻. 그럴 경우 해당 번호를 제외하고 배열을 다시 만듦 -> 체크 해제 효과
    }, []); //아니라면 -> 이전 배열에 memberNo를 추가한 새 배열을 만들어-> 체크 효과

    //일정 등록
    const submitPlan = useCallback(async ()=>{
        if (validAllFields()) return;

        let adjustedStartTime = startTime;
        let adjustedEndTime = endTime;
        if (allDay) {
            adjustedStartTime = new Date(startTime);
            adjustedStartTime.setHours(0, 0, 0, 0);

            adjustedEndTime = new Date(endTime);
            adjustedEndTime.setDate(adjustedEndTime.getDate() + 1); // +1일
            adjustedEndTime.setHours(0, 0, 0, 0); // 00:00:00
        }

        const body = { //서버에 보낼 body 객체
            planType: isPersonal ? "개인" : "팀",
            planTitle : title,
            planContent : content,
            planStartTime : adjustedStartTime,
            planEndTime: adjustedEndTime,
            planColor: planColor,
            planIsAllDay: allDay ? "Y" : "N",
            receivers: selectedMembers //체크된 참여자 목록 (번호 배열)
        };

        let token = localStorage.getItem("refreshToken") || sessionStorage.getItem("refreshToken");

        const url = isPersonal ? "/plan/personal" : "/plan/team";

        await axios.post(url, body, 
            { 
                headers: { Authorization: `Bearer ${token}` } 
            }
        );
        toast.success("일정이 등록되었습니다.");

        //(수정 필요)캘린더에 즉시 반영

        await fetchAllEvents(currentYear, currentMonth);
        closeMakeModal();
    }, [title, content, startTime, endTime, selectedMembers, currentMonth, currentYear, fetchAllEvents]);

    //종일 일정 -> 날짜만 설정 가능 (시작일/종료일)
    const startTimeChange = useCallback(date => {
        const start = new Date(date);
        if (allDay) start.setHours(0, 0, 0, 0);
        setStartTime(start);
        setEndTimeManuallyChanged(false); // 리셋
    }, [allDay]);
    const endTimeChange = useCallback(date => {
        const end = new Date(date);
        if (allDay) end.setHours(0, 0, 0, 0);
        setEndTime(end);
        setEndTimeManuallyChanged(true);
    }, [allDay]);

    //개인의 일정 상태를 가져오는 함수
    const getPlanStatus = useCallback((planNo) => {
        const target = allEvents.find(e => e.extendedProps.planNo === planNo);
        const planType = target?.extendedProps?.planType;
        const statusFromReceiver = target?.extendedProps?.receivers?.find(r => r.planReceiveReceiverNo === loginUserNo)?.planReceiveStatus;

        if (planType === '개인') {
            //개인일정이면 planStatus 기준으로 '완료' → '달성', '미완료' -> '미달성' 변환
            return target?.extendedProps?.planStatus === '완료' ? '달성' : '미달성';
        }

        return statusFromReceiver || '미달성';
        }, [allEvents, loginUserNo]);


    //날짜 클릭 -> 해당 날짜의 일정들 보기
    const detailDate = useCallback(info => {
        const calendarApi = calendar.current?.getApi();
        const clickedDay = new Date(info.dateStr);
        clickedDay.setHours(0, 0, 0, 0);
    
        const nextDay = new Date(clickedDay);
        nextDay.setDate(clickedDay.getDate() + 1);
    
        const events = calendarApi.getEvents().filter(event => {
            const start = new Date(event.start);
            const end = new Date(event.end ?? event.start);
    
            // 클릭한 날짜와 비교
            return (
                (start < nextDay && end > clickedDay) || // 일반 일정 포함 (범위가 겹치면 포함)
                (start.getTime() === clickedDay.getTime() && !event.end) // 단일 이벤트 (공휴일 등)
            );
        });

        const sorted = [...events].sort((a, b) => {
            const aIsHoliday = a.extendedProps?.isHoliday ? 1 : 0;
            const bIsHoliday = b.extendedProps?.isHoliday ? 1 : 0;
          
            // 공휴일이면 우선순위 높게
            if (aIsHoliday !== bIsHoliday) {
              return bIsHoliday - aIsHoliday;
            }
          
            // 같은 유형이면 시작 시간 기준 정렬
            return new Date(a.start).getTime() - new Date(b.start).getTime();
        });
        setSelectedDate(sorted);
        setClickedDate(clickedDay);

        const newStatus = {};
        sorted.forEach(event => {
            const planNo = event.extendedProps.planNo;
            newStatus[planNo] = getPlanStatus(planNo);
        });
        setCurrentStatus(newStatus);
    
        if (sorted.length === 0) {
            openMakeModal(clickedDay);
        } else {
            setClickedDate(clickedDay);
            openListModal();
        }
    }, [getPlanStatus, events]);

    //일정 클릭 -> 특정 일정 상세 정보 보기
    //달력에서 이벤트(일정)를 클릭하면 detailEvent 실행됨 -> 해당 일정의 정보를 꺼내서 selectedEvent에 저장 -> 이 상태는 모달에서 쓰이고, 모달은 곧바로 열림
    const detailEvent = useCallback(info => { 
        //info.event는 FullCalendar에서 넘겨주는 이벤트 정보 전체를 담고 있어. title, start, end, extendedProps 같은 정보를 꺼낼 수 있음
        const event = info.event
        
        //공휴일 이벤트는 무시
        if (event.extendedProps?.isHoliday) {
            return;
        }

        setSelectedEvent(event); //fullcalendar 이벤트 객체 그대로 저장
        openDetailModal();
    }, []);

    //일정 삭제
    const deleteEvent = useCallback(async ()=>{
        if(!selectedEvent) return; //만약 삭제할 일정이 선택되지 않았다면
        
        await axios.delete(`/plan/${selectedEvent.extendedProps.planNo}`);
        selectedEvent.remove(); //FullCalendar의 EventApi 객체의 메서드로, 화면에서 해당 일정을 삭제
        closeDeleteModal();

        await axios.delete(`/plan/${selectedEvent.extendedProps.planNo}`);
      
        await fetchAllEvents(currentYear, currentMonth);
    }, [selectedEvent]); //selectedEvent가 변경될 때만 이 함수를 새로 만듦

    //일정 상태 변경
    const changeStatusToggle = useCallback(async (planNo, newStatus) => { //planNo 일정 번호, newStatus는 '달성' 또는 '미달성' 상태로 전달
        let token = localStorage.getItem("refreshToken") || sessionStorage.getItem("refreshToken"); // JWT 토큰을 localStorage나 sessionStorage에서 가져옴. 서버에 인증된 요청을 보내기 위해 사용
        
        const calendarApi = calendar.current?.getApi(); //FullCalendar의 인스턴스를 가져오고
        const eventObj = calendarApi?.getEvents().find(e => e.extendedProps.planNo === planNo); //해당 일정(planNo)에 해당하는 이벤트 객체를 찾음

        const isTeam = eventObj?.extendedProps?.planType === "팀"; //해당 일정이 팀 일정인지 여부를 판별

        //팀 일정이면 plan_receive에 저장 → '달성' / '미달성'
        //개인 일정이면 plan 테이블에 저장 → '완료' / '미완료'
        const statusForServer = isTeam ? (newStatus === '달성' ? '달성' : '미달성') : (newStatus === '달성' ? '완료' : '미완료');

        //1. 서버에 상태 PATCH 요청
        await axios.patch(`/plan/${planNo}/status`, { // 팀 일정 상태 변경 → plan_receive 테이블 대상
            planStatus: statusForServer
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }).then(()=>{
            toast.success("상태가 변경되었습니다.");
        })

        //2. FullCalendar 내부 이벤트도 업데이트
        if (eventObj) { 
            eventObj.setExtendedProp("planStatus", newStatus); //클라이언트 상의 FullCalendar 이벤트 객체의 상태를 직접 업데이트
            eventObj.setProp("title", eventObj.title.endsWith(" ") ? eventObj.title.trim() : eventObj.title + " ");
            if (isTeam) { //팀 일정인 경우에만 receivers 배열 내부의 내 수신자 상태를 바꿈
                const updatedReceivers = eventObj.extendedProps.receivers.map(r =>
                    r.planReceiveReceiverNo === loginUserNo
                        ? { ...r, planReceiveStatus: newStatus }
                        : r
                    );
                eventObj.setExtendedProp("receivers", updatedReceivers); //setExtendedProp으로 FullCalendar 내부 상태까지 동기화
            } 
        }

        //이 값은 상태 토글 버튼 하이라이트 등 UI 조건 판단에 사용됨
        setCurrentStatus(prev => ({ //currentStatus 상태도 동기화
            ...prev,
            [planNo]: newStatus
        }));

        //3. selectedDate도 업데이트
        selectedDate.forEach(event => {
            if (event.extendedProps.planNo !== planNo) return;
          
            event.setExtendedProp("planStatus", statusForServer);
          
            if (isTeam) {
              const updatedReceivers = event.extendedProps.receivers.map(r =>
                r.planReceiveReceiverNo === loginUserNo
                  ? { ...r, planReceiveStatus: newStatus }
                  : r
              );
              event.setExtendedProp("receivers", updatedReceivers);
            }
          });

        //3. 전체 이벤트도 동기화 (리스트 밖에서도 쓰일 수 있으므로)
        //전체 이벤트 배열에서도 동일한 방식으로 상태를 반영하여 allEvents 갱신
        const updatedAllEvents = allEvents.map(event =>
            event.extendedProps.planNo === planNo
              ? {
                    ...event,
                    extendedProps: {
                        ...event.extendedProps,
                        planStatus: statusForServer,
                        receivers: isTeam //팀일 경우에만 receivers 내부도 함께 갱신
                            ? event.extendedProps.receivers?.map(r =>
                                r.planReceiveReceiverNo === loginUserNo
                                    ? { ...r, planReceiveStatus: newStatus }
                                    : r
                        )
                        : event.extendedProps.receivers
                    }
                }
              : event
        );
        setAllEvents(updatedAllEvents);

        if (selectedEvent?.extendedProps.planNo === planNo) { //현재 모달에서 보고 있던 일정이라면 모달 내부에서도 반영
            selectedEvent.setExtendedProp("planStatus", statusForServer);
        
            if (isTeam) { //모달에서도 team이면 receivers 상태까지 반영
                const updatedReceivers = selectedEvent.extendedProps.receivers.map(r =>
                    r.planReceiveReceiverNo === loginUserNo
                        ? { ...r, planReceiveStatus: newStatus }
                        : r
                );
                selectedEvent.setExtendedProp("receivers", updatedReceivers);
            }
            //강제 리렌더링 트리거 작동
        }
        setEventRefreshKey(prev => prev + 1);
    }, [selectedDate, allEvents]);

    //일정 완료되면, 캘린더 바에 완료 표시
    const renderEventContent = (eventInfo) => {
        const isHoliday = eventInfo.event.extendedProps?.isHoliday;
        const planType = eventInfo.event.extendedProps?.planType;
        const isCompleted = eventInfo.event.extendedProps.planStatus === "완료";

        //공휴일이면 제목만 출력
        if (isHoliday) {
            return null;
        }

        // 공지 일정인 경우
        if (planType === "전체") {
            return (
                <div className="fc-event-title-container">
                    <b className="me-1">[공지]</b>
                    <span>{eventInfo.event.title}</span>
                </div>
            );
        }

        //일반 일정은 완료/미완료 표시
        return (
            <div className="fc-event-title-container">
                {isCompleted 
                    ? <b className="me-1">[완료]</b>
                    : <b className="me-1">[미완료]</b>
                }
                <span>{eventInfo.event.title}</span>
            </div>
        );
    };

    //일정 등록 모달 열기/닫기
    const openMakeModal = useCallback((date = null) => {
        const targetList = Modal.getInstance(listModal.current);
        if (targetList !== null) targetList.hide();

        if (!makeModal.current) return;
        const target = Modal.getOrCreateInstance(makeModal.current);
        
        const now = new Date(); //현재 날짜
        const baseDate = date ? new Date(date) : new Date(); //baseDate = 이번 일정 등록의 기준 날짜. 날짜가 전달되면 그걸 기준으로, 없으면 현재 날짜로 사용
        
        setAllDay(false); //종일 체크 해제

        // 입력 초기화
        setTitle("");
        setContent("");
        setSearchContacts(""); //검색어 초기화
        setSelectedMembers([]); //수신자 리스트 초기화

        if (!date && !title) {
            setPlanColor('#0d6efd'); // 새 등록일 때만 초기화
        }

        setTitleChoice(false); //제목 경고 초기화
        setReceiverChoice(false); //수신자 경고 초기화
        setDateChoice(false); //시작일, 종료일 경고 초기화
        setEndTimeManuallyChanged(false);

        const start = new Date(baseDate); //이 시점에서는 날짜만 같고 시각은 기본값(00:00) 상태
        start.setHours(now.getHours(), now.getMinutes(), 0, 0);
        
        const end = new Date(baseDate); //이 시점에서는 날짜만 같고 시각은 기본값(00:00) 상태
        end.setHours(now.getHours() + 1, now.getMinutes(), 0, 0);

        setStartTime(start); //시작일 업데이트
        setEndTime(end); //종료일 업데이트
        setClickedDate(baseDate); //클릭한 날짜 상태 저장

        target.show();
    }, [listModal, makeModal, clickedDate]);
    const closeMakeModal = useCallback(() => {
        const target = Modal.getInstance(makeModal.current);
        if (target !== null) target.hide();

        // 입력 초기화
        setTitle("");
        setContent("");
        setStartTime(null);
        setEndTime(null);
        setSearchContacts(""); //검색어 초기화
        setSelectedMembers([]); //수신자 리스트 초기화
        setPlanColor('#0d6efd');
    }, [makeModal]);

    //일정 리스트(날짜 클릭) 모달 열기/닫기
    const openListModal = useCallback(()=>{
        if (!listModal.current) return;
        const target = Modal.getOrCreateInstance(listModal.current);
        target.show();
    }, [listModal]);
    const closeListModal = useCallback(() => {
        const target = Modal.getInstance(listModal.current);
        if (target !== null) target.hide();
    }, [listModal]);

    //일정 리스트 -> 상세 일정 모달 이동 함수
    const moveListToDetail = useCallback(event=>{
        //모달이 완전히 닫힌 이후에 상세 모달을 열도록 설정
        const listInstance = Modal.getInstance(listModal.current);
        if (!listInstance) return;

        // Bootstrap 모달의 이벤트 감지
        const handleHidden = () => {
            setSelectedEvent(event); //상태 업데이트
            openDetailModal(); //상세 모달 열기
            listModal.current.removeEventListener('hidden.bs.modal', handleHidden);
        };

        listModal.current.addEventListener('hidden.bs.modal', handleHidden);
        closeListModal();
    }, []);

    //상세 일정(일정 클릭) 모달 열기/닫기
    const openDetailModal = useCallback(() => {
        if (!detailModal.current) return;
        const target = Modal.getOrCreateInstance(detailModal.current);
        target.show();
    }, [detailModal]);
    const closeDetailModal = useCallback(() => {
        const target = Modal.getInstance(detailModal.current);
        if (target !== null) target.hide();
    }, [detailModal]);

    //일정 삭제 모달 열기/닫기
    const openDeleteModal = useCallback(() => {
        const targetDetail = Modal.getInstance(detailModal.current);
        if (targetDetail !== null) targetDetail.hide();

        if (!deleteModal.current) return;
        const target = Modal.getOrCreateInstance(deleteModal.current);
        target.show();
    }, [detailModal, deleteModal]);
    const closeDeleteModal = useCallback(() => {
        const target = Modal.getInstance(deleteModal.current);
        if (target !== null) target.hide();
    }, [deleteModal]);

    return (<>
        <div className="row mt-2">
            <div className="col">
                <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                        <h2>
                            <FaCalendarAlt className="text-danger me-2" />
                            <span className="align-middle">일정</span>
                        </h2>
                    </div>
                    <div className="d-flex align-items-center">
                        <button className={`btn ${location.pathname.includes('calendar') ? 'btn-primary' : 'btn-outline-primary'} text-responsive me-2`}
                            onClick={() => navigate('/plan/team')}
                        >
                            Calendar
                        </button>
                        <button className={`btn ${location.pathname.includes('todo') ? 'btn-primary' : 'btn-outline-primary'} text-responsive`}
                            onClick={() => navigate('/plan/todo')}
                        >
                            Todo
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <hr className="hr-stick" />

        <div className="calendar-wrapper">
        {/* 개인-Todo */}
        {tab === 'todo' && (
            <TodoList allEvents={allEvents} fetchAllEvents={fetchAllEvents} groupContacts={groupContacts}/>
        )}            

        {/* 캘린더 */}
        {tab === 'calendar' && (
        <>
            <div className="row align-items-center mb-3">
                <div className="col">
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="btn-group btn-group-sm toggle-button-group" role="group" style={{ flexWrap: 'nowrap' }}>
                            <input type="radio" className="btn-check" name="planTypeFilter" id="allPlans" autoComplete="off"
                                checked={viewType === "전체"} onChange={() => setViewType("전체")} />
                            <label className="btn btn-outline-dark toggle-text-responsive" htmlFor="allPlans">전체</label>
                            <input type="radio" className="btn-check" name="planTypeFilter" id="teamPlans" autoComplete="off"
                                checked={viewType === "팀"} onChange={() => setViewType("팀")} />
                            <label className="btn btn-outline-dark toggle-text-responsive" htmlFor="teamPlans">공유</label>
                            <input type="radio" className="btn-check" name="planTypeFilter" id="personalPlans" autoComplete="off"
                                checked={viewType === "개인"} onChange={() => setViewType("개인")} />
                            <label className="btn btn-outline-dark toggle-text-responsive" htmlFor="personalPlans">개인</label>
                        </div>
                        <select className="form-select w-auto text-responsive" value={statusFilter}
                            onChange={e=>setStatusFilter(e.target.value)}
                        >
                            <option value="전체">전체</option>
                            <option value="달성">완료</option>
                            <option value="미달성">미완료</option>
                        </select>
                    </div>
                </div>
            </div>
            <FullCalendar
                ref={calendar} //이 FullCalendar 컴포넌트에 접근할 수 있는 참조를 연결. .current.getApi()로 달력의 메서드에 접근할 수 있음
                plugins={[dayGridPlugin, interactionPlugin]} //FullCalendar에서 사용할 플러그인 목록. dayGridPlugin: 월간(month) 보기 기능을 제공, interactionPlugin: 날짜 클릭 등의 사용자 인터랙션을 처리
                locale={koLocale}
                initialView="dayGridMonth" //기본으로 보여줄 달력 형태를 설정. dayGridMonth -> "월간 보기"
                dateClick={detailDate} //달력의 날짜를 클릭했을 때 실행할 함수
                eventClick={detailEvent} //달력에 등록된 일정(이벤트)를 클릭했을 때 실행되는 함수
                eventDisplay="block" //모든 일정이 bar형태로 표시
                displayEventTime={false} //일정 옆에 시간까지 출력할지 여부 설정. false로 하면 시간은 숨기고 제목만 표시
                dayMaxEventRows={5} //한 셀 안에서 줄바꿈 없이 보여줄 수 있는 최대 줄 수. 초과하면 자동으로 +n mored으로 보여줌
                fixedWeekCount={false} // 6주 고정 비활성화
                contentHeight="auto"
                expandRows={true} //세로줄 자동 확장
                aspectRatio={2.0}
                height="auto"
                events={filteredEvents} //실제 달력에 표시할 이벤트 목록. useState로 관리 중인 events 배열이 들어가고, loadPlans()에서 서버에서 불러온 데이터를 여기로 채워 넣음
                eventContent={renderEventContent} //이벤트 바에 표시할 내용
                eventOrder={(a, b) => {
                    const aIsHoliday = a.extendedProps?.isHoliday ? 1 : 0;
                    const bIsHoliday = b.extendedProps?.isHoliday ? 1 : 0;
                    if(aIsHoliday !== bIsHoliday) {
                        return bIsHoliday - aIsHoliday; // 공휴일이면 우선순위 업
                    }

                    //같은 유형이면 시작
                    const startA = new Date(a.start).getTime();
                    const startB = new Date(b.start).getTime();
                    return startA - startB;
                }}
                dayCellClassNames={(arg) => {
                    const toLocalDateStr = (date) => {
                        const year = date.getFullYear();
                        const month = (date.getMonth() + 1).toString().padStart(2, '0');
                        const day = date.getDate().toString().padStart(2, '0');
                        return `${year}-${month}-${day}`;
                    };

                    const dateStr = toLocalDateStr(arg.date);
                    const isHoliday = holidayEvents.some(ev =>
                        toLocalDateStr(new Date(ev.start)) === dateStr
                    );
                    return isHoliday ? ['fc-holiday'] : [];
                }}
                datesSet={async () => {
                    // 기존 코드 유지
                    const calendarApi = calendar.current?.getApi();
                    if (!calendarApi) return;

                    const currentDate = calendarApi.getDate();
                    const newMonth = currentDate.getMonth() + 1;
                    const newYear = currentDate.getFullYear();

                    setCurrentMonth(newMonth);
                    setCurrentYear(newYear);
                    fetchAllEvents(newYear, newMonth);
                }}
            />
        </>
        )}
        </div>

        {/* 일정 등록 모달 */}
        <div className="modal fade" tabIndex="-1" ref={makeModal} data-bs-backdrop="static"> {/* 모달 바깥쪽 영역. tabinden -> tabIndex */}
            <div className="modal-dialog modal-lg"> {/* 모달 영역 */} 
                <div className="modal-content">
                    <div className="modal-header">
                        <h1 className="modal-title d-flex align-items-cenger text-responsive">
                            <FaRegCalendarPlus className="mt-1 me-2" />
                            <span>일정 등록</span>
                        </h1>
                        <button type="button" className="btn-close" aria-label="Close" onClick={closeMakeModal}></button>
                    </div>
                    <div className="modal-body text-responsive">
                        <div className="row">
                            <div className="col">
                                <div className="d-flex text-responsive">
                                    <FaCheck className="mt-1 me-2"/>
                                    <span className="fw-bold">제목</span> 
                                </div>
                                <input type="text" value={title}
                                    className={`form-control text-responsive mt-1
                                        ${titleChoice ? ( title ? 'is-valid' : 'is-invalid') : ''}`}  
                                    onChange={e=>setTitle(e.target.value)}
                                    onBlur={()=>setTitleChoice(true)} //제목 입력 여부
                                />
                            </div>
                            {titleChoice && !title && (
                                <div className="invalid-feedback d-block">
                                    제목을 입력해주세요.
                                </div>
                            )}
                        </div>
                        <div className="row mt-3">
                            <div className="col">
                                <div className="d-flex text-responsive">
                                    <FaRegCalendarCheck className="mt-1 me-2"/>
                                    <span className="fw-bold">일정</span> 
                                    <div className="color-picker-container d-flex align-items-center ms-1">
                                        <div className="color-picker-button" style={{ backgroundColor: planColor }} onClick={() => setShowColorPicker(!showColorPicker)}></div>
                                        {showColorPicker && (
                                            <div className="color-picker-popup">
                                            {colorOptions.map(color => (
                                                <div key={color} className={`color-picker-option ${planColor === color ? 'selected' : ''}`} 
                                                    style={{ backgroundColor: color }}
                                                    onClick={() => { 
                                                        setPlanColor(color);
                                                        setShowColorPicker(false);
                                                    }}
                                                >
                                                </div>
                                            ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="d-flex align-items-center gap-2 mt-1">
                                    <DatePicker 
                                        className={`form-control text-responsive 
                                            ${dateChoice ? (isInvalidEndTime ? 'is-invalid' : 'is-valid') : ''}`}
                                        selected={startTime} 
                                        minDate={new Date()} //오늘 이후만 선택 가능
                                        showTimeSelect={!allDay} //종일이면 시간 선택 안 보임
                                        timeIntervals={30} //selected={startTime} -> 현재 선택된 시간 상태 반영
                                        onChange={startTimeChange} 
                                        onCalendarClose={() => setDateChoice(true)}
                                        dateFormat={allDay ? "yyyy-MM-dd" : "yyyy-MM-dd HH:mm"} 
                                        placeholderText="시작일"
                                        popperPlacement="bottom-start"
                                        
                                    />
                                    <span> - </span>
                                    <DatePicker
                                        className={`form-control text-responsive 
                                            ${dateChoice ? (isInvalidEndTime ? 'is-invalid' : 'is-valid') : ''}`}
                                        selected={endTime} 
                                        minDate={startTime || new Date()} //시작일 이후만 선택 가능
                                        showTimeSelect={!allDay}
                                        timeIntervals={30}
                                        onChange={endTimeChange}
                                        onCalendarClose={() => setDateChoice(true)}
                                        dateFormat={allDay ? "yyyy-MM-dd" : "yyyy-MM-dd HH:mm"} 
                                        placeholderText="종료일"
                                        popperPlacement="top-start"
                                    />
                                </div>
                                
                            </div>
                        </div>
                        <div className="row mt-1">
                            <div className="col">
                                <div className="d-flex align-items-center">
                                    <div className="form-check">
                                        <input type="checkbox" className="form-check-input" id="allDayCheck"
                                            checked={allDay} onChange={e=>{setAllDay(e.target.checked)}}/>
                                        <label className="form-check-label" htmlFor="allDayCheck">종일</label>
                                        {dateChoice && isInvalidEndTime && (
                                        <span className="text-danger small ms-2">
                                            종료일은 시작일보다 이후여야 합니다.
                                        </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="row mt-2">
                            <div className="col">
                                <div className="d-flex text-responsive">
                                    <FaList className="mt-1 me-2" />
                                    <span className="fw-bold">내용</span>
                                </div>
                                <textarea className="form-control text-responsive mt-1" value={content} onChange={e=>setContent(e.target.value)} rows="2" />
                            </div>
                        </div>
                        <div className="row mt-3">
                            <div className="col">
                                <div className="d-flex text-responsive">
                                    <IoPersonSharp className="mt-1 me-2" />
                                    <span className="fw-bold">수신자</span>
                                </div>
                                <div className="d-flex text-responsive mt-1 mb-2">
                                    <input type="text" className="form-control text-responsive" placeholder="이름 또는 부서명 검색" 
                                        value={searchContacts} onChange={(e) => setSearchContacts(e.target.value)}
                                    />
                                </div>
                                <div className="form-check mb-2">
                                    <input type="checkbox" className="form-check-input" id="selectAllMembers"
                                        checked={selectedMembers.length > 0 && selectedMembers.length === Object.values(groupContacts)
                                                    .flat()
                                                    .filter(m => m.memberNo !== loginUserNo).length}
                                        onChange={e=>{
                                            if (e.target.checked) {
                                                const all = Object.values(groupContacts).flat()
                                                    .filter(m => m.memberNo !== loginUserNo)
                                                    .map(m => m.memberNo);
                                                setSelectedMembers(all);
                                            } else {
                                                setSelectedMembers([]);
                                            }
                                        }}
                                    />
                                    <label className="form-check-label" htmlFor="selectAllMembers">
                                        전체 인원 선택
                                    </label>
                                </div>
                                
                                {/* 부서별 연락처 리스트 */}
                                <div className={`rounded p-2 ${receiverChoice ? (selectedMembers.length > 0 ? 'is-valid' : 'is-invalid') : ''}`}>
                                <ul className="list-group text-responsive" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                    {Object.keys(filterContacts).map(department => {
                                        const members = filterContacts[department];
                                        const selectAll = members
                                            .filter(m => m.memberNo !== loginUserNo)
                                            .every(m => selectedMembers.includes(m.memberNo));

                                        return (
                                        <li key={department} className="list-group-item p-0 border-0">
                                            <div className="bg-light px-3 py-2 border-top text-secondary">
                                                <input type="checkbox" className="form-check-input me-2" checked={selectAll} 
                                                    onChange={e=>{
                                                        const memberNos = members
                                                            .filter(m => m.memberNo !== loginUserNo)
                                                            .map(m => m.memberNo);

                                                        if (e.target.checked) {
                                                            const newMembers = memberNos.filter(no => !selectedMembers.includes(no));
                                                            setSelectedMembers(prev => [...prev, ...newMembers]);
                                                        } else {
                                                            setSelectedMembers(prev => prev.filter(no => !memberNos.includes(no)));
                                                        }
                                                    }}
                                                    />
                                                {department}
                                            </div>

                                            <ul className="list-group list-group-flush">
                                            {members.map(contact => {
                                                const isMe = contact.memberNo === loginUserNo;

                                                return (
                                                    <li className="list-group-item d-flex align-items-center" key={contact.memberNo}>
                                                        {!isMe && (
                                                            <input
                                                                type="checkbox"
                                                                className="form-check-input me-2"
                                                                checked={selectedMembers.includes(contact.memberNo)}
                                                                onChange={() => toggleMember(contact.memberNo)}
                                                            />
                                                        )}
                                                        <span className={isMe ? "fw-bold" : ""}>
                                                            {contact.memberName}
                                                            {isMe && <span className="ms-1">(나)</span>}
                                                        </span>
                                                    </li>
                                                );
                                            })}
                                            </ul>
                                        </li>
                                    );
                                    })}
                                </ul>
                            </div>
                            </div>
                            {receiverChoice && selectedMembers.length === 0 && (
                                <div className="text-danger small mt-1">
                                    수신자를 한 명 이상 선택해주세요.
                                </div>
                            )}
                            {/* 검색 결과 없음 */}
                            {noResults && (
                                <small className="text-muted mt-2">검색 결과가 없습니다.</small> //<small> 태그는 작은 회색 텍스트로 메시지를 출력함
                            )}
                            {/* 선택된 멤버 표시 */}
                            {selectedMembers.length > 0 && (
                                <div className="text-responsive d-flex flex-wrap gap-2 mt-2">
                                    {Object.values(groupContacts).flat()
                                    .filter(member => selectedMembers.includes(member.memberNo))
                                    .map(member => (
                                        <div key={member.memberNo} className="d-flex align-items-center custom-badge">
                                            <span className="text-responsive">{member.memberName}</span>
                                            <button
                                                type="button"
                                                className="btn btn-close btn-sm ms-1"
                                                onClick={() => toggleMember(member.memberNo)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary text-responsive" onClick={closeMakeModal}>취소</button>
                        <button type="button" className="btn btn-success text-responsive" onClick={submitPlan}>등록</button>
                    </div>
                </div>
            </div>
        </div>

        {/* 일정 리스트 모달(날짜 클릭) */}
        <div className="modal fade" tabIndex="-1" ref={listModal} data-bs-backdrop="static"> {/* 모달 바깥쪽 영역. tabinden -> tabIndex */}
            <div className="modal-dialog modal-lg"> {/* 모달 영역 */}
                <div className="modal-content">
                    <div className="modal-header">
                        <h1 className="modal-title d-flex align-items-cenger text-responsive">
                            <FaListUl className="mt-1 me-2" />
                            <span>일정 리스트</span>
                        </h1>
                        <button type="button" className="btn-close" aria-label="Close" onClick={closeListModal}></button>
                    </div>
                    <div className="modal-body text-responsive" style={{ maxHeight: '40vh', overflowY: 'auto' }}>
                        {selectedDate.map(event => {
                            const status = getPlanStatus(event.extendedProps.planNo);
                            const isHoliday = event.extendedProps?.isHoliday;

                            //공휴일 또는 일요일일 경우
                            if(isHoliday) {
                                return (
                                <div key={`${event.startStr}-${event.title}-${event.id}`} 
                                    className="border rounded p-3 mb-2 hover-shadow text-responsive">
                                    <h6 className="text-danger text-responsive">{event.title}</h6>
                                </div>
                                );
                            }
                        
                            //일반 요일일 경우
                            const receivers = event.extendedProps?.receivers || [];
                            const accepted = receivers.filter(r => r.planReceiveIsAccept === 'Y').length;
                            const doneCount = receivers.filter(r => r.planReceiveStatus === '달성').length;
                            const total = receivers.length;
                            const percent = total > 0 ? Math.round((doneCount / total) * 100) : 0;

                            return (
                                <div key={`event-${event.extendedProps.planNo}`} onClick={()=>moveListToDetail(event)}
                                    className={`border rounded p-3 mb-2 hover-shadow text-responsive ${isPlanAllCompleted(event) ? 'border-success' : ''}`}
                                    style={{ cursor: 'pointer' }}>
                                    <div className="d-flex align-items-center text-responsive">
                                        <div className="color-box ms-1" style={{ backgroundColor: event.extendedProps?.planColor }}></div>
                                        <div className="d-flex align-items-center gap-1">
                                            <small className={`${status.className} fw-bold`}>{status.text}</small>
                                            <span className="fw-bold">
                                                {event.title}
                                                {isPlanAllCompleted(event) ? (
                                                    <span className="text-success ms-1">(완료)</span>
                                                ) : (
                                                    <span className="text-secondary ms-1">(미완료)</span>
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                    <div className={`d-flex align-items-center ${event.extendedProps.planType === "팀" ? "justify-content-between" : "justify-content-end"}`}>
                                        {event.extendedProps.planType === "팀" && (
                                            <div className="d-flex flex-column text-responsive mt-1">
                                                <div>
                                                    <span>참여: {total}명 | </span>
                                                    <span>수락: {accepted} / {total}명</span>
                                                </div>
                                                <span>진행 : {percent}%</span>
                                            </div>
                                        )}
                                        <div className="btn-group btn-group-sm" role="group" aria-label="상태 토글">
                                            <button type="button"  className={`btn ${getPlanStatus(event.extendedProps.planNo) === '미달성' ? 'btn-secondary' : 'btn-outline-secondary'}`}
                                                onClick={e=>{
                                                    e.stopPropagation(); // 부모 div 클릭 방지
                                                    changeStatusToggle(event.extendedProps.planNo, '미달성');
                                                }}>
                                                미달성
                                            </button>
                                            <button type="button" className={`btn ${getPlanStatus(event.extendedProps.planNo) === '달성' ? 'btn-success' : 'btn-outline-success'}`}
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    changeStatusToggle(event.extendedProps.planNo, '달성');
                                                }}>
                                                달성
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary text-responsive" onClick={closeListModal}>닫기</button>
                        <button type="button" className="btn btn-success text-responsive" onClick={()=>openMakeModal(clickedDate)}>등록</button>
                    </div>
                </div>
            </div>
        </div>

        {/* 상세 일정 모달(일정 클릭) */}
        <div className="modal fade" tabIndex="-1" ref={detailModal} data-bs-backdrop="static"> {/* 모달 바깥쪽 영역. tabinden -> tabIndex */}
            <div className="modal-dialog modal-lg"> {/* 모달 영역 */}
                <div className="modal-content">
                {selectedEvent && (
                <div key={eventRefreshKey}>
                    {/* 상세일정 - 제목(헤더) */}
                    <div className="modal-header">
                        <h1 className="modal-title text-responsive">
                            <FaCheck className="me-2" />
                            {selectedEvent?.title}
                        </h1>
                        <button type="button" className="btn-close" aria-label="Close" onClick={closeDetailModal}></button>
                    </div>
                    <div className="modal-body">
                        {/* 상세일정 - 일정 */}
                        <div className="row">
                            <div className="col">
                                <div className="d-flex text-responsive">
                                    <FaRegCalendarCheck className="mt-1 me-2"/>
                                    <span className="fw-bold">일정</span> 
                                    <div className="color-picker-container d-flex align-items-center ms-1">
                                        <div className="color-box" style={{ backgroundColor: selectedEvent?.extendedProps?.planColor }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {selectedEvent?.start && selectedEvent?.end && (
                        <div className="row mt-1">
                            <div className="col text-responsive">
                                <span>{moment(selectedEvent.start).format('YYYY-MM-DD HH:mm')}</span>
                                <span className="ms-2">-</span>
                                <span className="ms-2">{moment(selectedEvent.end).format('YYYY-MM-DD HH:mm')}</span>
                            </div>
                        </div>
                        )}

                        {/* 상세일정 - 내용 */}
                        <div className="row mt-3">
                            <div className="col">
                                <div className="d-flex text-responsive">
                                    <FaList className="mt-1 me-2" />
                                    <span className="fw-bold">내용</span>
                                </div>
                            </div>
                        </div>
                        <div className="row mt-1">
                            <div className="col text-responsive">
                                <span>{selectedEvent?.extendedProps?.content}</span>
                            </div>
                        </div>

                        {/* 상세일정 - 주최자 */}
                        {Array.isArray(selectedEvent?.extendedProps?.receivers) && selectedEvent.extendedProps.receivers.length > 0 && ( //개인 일정에는 표시 X
                        <>
                            <div className="row mt-3">
                                <div className="col">
                                    <div className="d-flex text-responsive">
                                        <FaCrown className="mt-1 me-2" />
                                        <span className="fw-bold">주최</span>
                                    </div>
                                </div>
                            </div>
                            <div className="row mt-2">
                                <div className="col">
                                    <div className="d-flex text-responsive">
                                        <span>{selectedEvent?.extendedProps?.planSenderName}</span>
                                        {selectedEvent?.extendedProps?.planSenderDepartment === "인사" && (
                                            <span className="badge bg-danger ms-2">{selectedEvent?.extendedProps?.planSenderDepartment}</span>
                                        )}
                                        {selectedEvent?.extendedProps?.planSenderDepartment === "디자인" && (
                                            <span className="badge bg-warning ms-2">{selectedEvent?.extendedProps?.planSenderDepartment}</span>
                                        )}
                                        {selectedEvent?.extendedProps?.planSenderDepartment === "영업" && (
                                            <span className="badge bg-dark ms-2">{selectedEvent?.extendedProps?.planSenderDepartment}</span>
                                        )}
                                        {selectedEvent?.extendedProps?.planSenderDepartment === "개발" && (
                                            <span className="badge bg-primary ms-2">{selectedEvent?.extendedProps?.planSenderDepartment}</span>
                                        )}
                                        {selectedEvent?.extendedProps?.planSenderDepartment === "기획" && (
                                            <span className="badge bg-info ms-2">{selectedEvent?.extendedProps?.planSenderDepartment}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            </>
                        )}

                        {/* 상세일정 - 참여자 */}
                        {Array.isArray(selectedEvent?.extendedProps?.receivers) && selectedEvent.extendedProps.receivers.length > 0 && ( //개인 일정에는 표시 X
                        <>
                            <div className="row mt-3">
                                <div className="col">
                                    <div className="d-flex text-responsive">
                                        <IoPersonSharp className="mt-1 me-2" />
                                        <span className="fw-bold">참여</span>
                                    </div>
                                </div>
                            </div>
                            <div className="row mt-2">
                                <div className="col">
                                    <div className="mb-2">
                                        <ul className="list-group text-responsive" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                            {Object.keys(groupContacts).map(department => {
                                                const members = groupContacts[department].filter(
                                                    contact => selectedEvent?.extendedProps?.receivers?.some(
                                                        r => r.planReceiveReceiverNo === contact.memberNo
                                                    )
                                                );

                                                if (members.length === 0) return null;

                                                // JSX 블록 전체를 괄호로 감싸고 return 앞에는 반드시 중괄호로 열어야 함
                                                return (
                                                    <li key={department}>
                                                        <div className="bg-light fw-bold px-3 py-2 border-top text-secondary">{department}</div>
                                                        <ul className="list-group list-group-flush">
                                                        {members.map(contact => {
                                                            const isMe = contact.memberNo === loginUserNo;
                                                            const matchedReceiver = selectedEvent?.extendedProps?.receivers?.find(
                                                                r => r.planReceiveReceiverNo === contact.memberNo
                                                            );

                                                            const status = matchedReceiver?.planReceiveStatus || '미달성';
                                                            const isAccepted = matchedReceiver?.planReceiveIsAccept;
                                                        
                                                        return (    
                                                            <li className="list-group-item d-flex justify-content-between align-items-center" key={contact.memberNo}>
                                                                <>
                                                                    {isMe ? ( 
                                                                        <span className="d-flex align-items-center">
                                                                            <IoPerson className="me-1" />
                                                                            <span className="fw-bold">{contact.memberName}</span>
                                                                            <span className="text-success fw-bold ms-2">수락</span>
                                                                        </span>
                                                                    ) : (
                                                                        <span>{contact.memberName}
                                                                            <span className="fw-bold ms-2">
                                                                            {isAccepted === 'Y' && (
                                                                                <span className="text-success">수락</span>
                                                                            )}
                                                                            {isAccepted === 'N' && (
                                                                                <span className="text-danger">거절</span>
                                                                            )}
                                                                            {!isAccepted && (
                                                                                <span className="text-muted">수락 전</span>
                                                                            )}
                                                                            </span>
                                                                        </span>
                                                                    )}
                                                                </>
                                                                    <span className={`badge ${status === '달성' ? 'bg-success' : 'bg-secondary'}`}>
                                                                        {status}
                                                                    </span>
                                                            </li>
                                                            );
                                                        })}
                                                        </ul>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </>
                        )}
                    </div>
                    <div className="modal-footer d-flex justify-content-between align-items-center">
                        {/* 상태 토글 (왼쪽 정렬) */}
                        <div className="btn-group btn-group" role="group" aria-label="상태 토글">
                            <button type="button" className={`btn ${getPlanStatus(selectedEvent?.extendedProps.planNo) === '미달성' 
                                ? 'btn-secondary' : 'btn-outline-secondary'} text-responsive`}
                                onClick={() => changeStatusToggle(selectedEvent?.extendedProps.planNo, '미달성')}
                            >
                                미달성
                            </button>
                            <button type="button" className={`btn ${getPlanStatus(selectedEvent?.extendedProps.planNo) === '달성' 
                                ? 'btn-success' : 'btn-outline-success'} text-responsive`}
                                onClick={() => changeStatusToggle(selectedEvent?.extendedProps.planNo, '달성')}
                            >
                                달성
                            </button>
                        </div>
                        {/* 닫기 / 삭제 버튼 (오른쪽 정렬) */}
                        <div>
                            <button type="button" className="btn btn-secondary text-responsive" onClick={closeDetailModal}>닫기</button>
                            {selectedEvent?.extendedProps?.planSenderNo === loginUserNo && (
                            <button type="button" className="btn btn-danger text-responsive ms-2" onClick={openDeleteModal}>삭제</button>
                        )}
                        </div>
                    </div>
                </div>
                )}
                </div>
            </div>
        </div>

        {/* 일정 삭제 모달 */}
        <div className="modal fade" tabIndex="-1" ref={deleteModal} data-bs-backdrop="static">
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <div className="d-flex align-items-center">
                            <FaLightbulb className="text-warning me-2" />
                            <h1 className="modal-title text-responsive">알림</h1>
                        </div>
                        <button type="button" className="btn-close" aria-label="Close" onClick={closeDeleteModal}></button>
                    </div>
                    <div className="modal-body">
                        <div className="row">
                            <div className="col">
                                <div className="d-flex align-items-center text-responsive">
                                    <span className="fw-bold text-danger">일정을 삭제하시겠습니까?</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary text-responsive" onClick={closeDeleteModal}>닫기</button>
                        <button type="button" className="btn btn-danger text-responsive" onClick={deleteEvent}>삭제</button>
                    </div>
                </div>
            </div>
        </div>

  </>);
}