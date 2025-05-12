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

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import Jumbotron from '../template/Jumbotron';
import { fetchHolidays } from "../utils/holiday";
import "react-datepicker/dist/react-datepicker.css";
import './TeamPlan.css';

import { FaCheck, FaLightbulb, FaList, FaListUl, FaRegCalendarCheck, FaRegCalendarPlus } from 'react-icons/fa';
import { IoPersonSharp } from 'react-icons/io5';
import './PlanColor.css';
import TodoList from './TodoList';

const colorOptions = ['#dc3545', '#fd7e14', '#ffc107', '#28a745', '#20c997', '#0d6efd', '#6f42c1', '#d63384', '#6c757d'];

export default function CalendarComponent() {

    //state
    const [isPersonal, setIsPersonal] = useState(false); // 일정 유형
    const [tab, setTab] = useState('calendar');

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

    const [title, setTitle] = useState(""); //일정 제목
    const [content, setContent] = useState(""); //일정 내용
    const [startTime, setStartTime] = useState(null); //일정 시작일
    const [endTime, setEndTime] = useState(null); //일정 종료일

    const [groupContacts, setGroupContacts] = useState({}); //전체 연락처 정보를 부서별로 저장
    const [filterContacts, setFilterContacts] = useState({}); //검색 필터가 적용된 연락처 목록을 저장
    const [searchContacts, setSearchContacts] = useState(""); //연락처 검색 input에 입력한 텍스트를 상태로 저장
    const [noResults, setNoResults] = useState(false); //검색 결과가 없을 경우 true가 되며, 사용자에게 안내 메시지를 보여주기 위해 사용
    const [selectedMembers, setSelectedMembers] = useState([]); //일정에 참여할 수신자들의 번호 목록

    const [selectedDate, setSelectedDate] = useState([]); //클릭한 날짜에 해당하는 일정
    const [selectedEvent, setSelectedEvent] = useState(null); //클릭한 일정의 상세 정보

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

    //effect
    useEffect(() => {
        loadContacts(); //연락처(부서별 멤버) 목록
    }, []); //컴포넌트가 처음 렌더링된 직후 한 번만 실행

    const validEvents = allEvents.filter(event => !!event.start);

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

        const teamPlanEvents = teamPlans.map(plan => ({ //팀 일정
            id: `team-${plan.planNo}`,
            title: plan.planTitle,
            start: plan.planStartTime,
            end: plan.planEndTime,
            backgroundColor: plan.planColor,
            borderColor: plan.planColor,
            extendedProps: { //FullCalendar의 커스텀 속성 저장 공간 -> 내용, 참여자 정보도 저장할 수 있음
                planType: "팀",
                content: plan.planContent,
                planNo: plan.planNo,
                receivers: plan.receivers,
                planColor: plan.planColor
            }
        }));

        const personalPlanEvents = personalPlans.map(plan => ({ //개인-Todo
            id: `personal-${plan.planNo}`,
            title: plan.planTitle,
            start: plan.planStartTime,
            end: plan.planEndTime,
            backgroundColor: plan.planColor,
            borderColor: plan.planColor,
            extendedProps: {
                planType: '개인',
                content: plan.planContent,
                planNo: plan.planNo,
                planColor: plan.planColor
            }
        }));

        setHolidayEvents(holidayEvents);
        setPlanEvents([...teamPlanEvents, ...personalPlanEvents]);
        const combinedEvents = [...holidayEvents, ...teamPlanEvents, ...personalPlanEvents];
        setAllEvents(combinedEvents);
    }, []);

    useEffect(() => {
        fetchAllEvents(currentYear, currentMonth);
    }, [currentYear, currentMonth, fetchAllEvents]);

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
            const start = new Date(startTime);
            start.setHours(0, 0, 0, 0);
            setStartTime(start);

            const end = new Date(start);
            end.setDate(end.getDate() + 1); // 다음 날 00:00:00
            end.setHours(0, 0, 0, 0);
            // setEndTime(end);
        }
    }, [allDay, startTime, endTimeManuallyChanged]);

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
        const { data } = await axios.get("/member/contact"); //응답으로 받은 데이터를 data라는 이름으로 저장
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

        let adjustedEndTime = endTime;
        if (allDay && endTime) {
            adjustedEndTime = new Date(endTime);
            adjustedEndTime.setDate(adjustedEndTime.getDate() + 1); // +1일
            adjustedEndTime.setHours(0, 0, 0, 0); // 00:00:00
        }

        const body = { //서버에 보낼 body 객체
            planType: isPersonal ? "개인" : "팀",
            planTitle : title,
            planContent : content,
            planStartTime : startTime,
            planEndTime: adjustedEndTime,
            planColor: planColor,
            receivers: selectedMembers //체크된 참여자 목록 (번호 배열)
        };

        let token = localStorage.getItem("refreshToken") || sessionStorage.getItem("refreshToken");

        await axios.post("/plan/team", body, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        toast.success("일정이 등록되었습니다.");

        //(수정 필요)캘린더에 즉시 반영

        await fetchAllEvents(currentYear, currentMonth);
        closeMakeModal();
    }, [title, content, startTime, endTime, selectedMembers, currentMonth, currentYear, fetchAllEvents]);

    //상태 라벨만 추출하는 함수
    const getStatus = useCallback(event => {
        const now = dayjs();
        const start = dayjs(event.start);
        const end = dayjs(event.end);

        if(now.isBefore(start)){
            return {
                text: `(${start.fromNow()} 시작)`,
                className: "text-danger"
            }
        }
        else if(now.isAfter(end)){
            return {
                text: `(종료)`,
                className: "text-muted"
            }
        }
        else {
            return {
                text: `(진행중)`,
                className: "text-primary"
            }
        }
    }, []);

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

    //날짜 클릭 -> 해당 날짜의 일정들 보기
    const detailDate = useCallback(info => {
        const calendarApi = calendar.current?.getApi();
        const clicked = new Date(info.dateStr);

        clicked.setHours(0, 0, 0, 0);

        const events = calendarApi.getEvents().filter(event => {//달력에 등록된 모든 이벤트를 배열로 가져옴
            const start = new Date(event.start);
            const end = new Date(event.end ?? event.start); //end 없으면 start로 처리

            //날짜만 비교(시각 제거)
            start.setHours(0, 0, 0, 0);
            end.setHours(0, 0, 0, 0);
            const clickedDay = new Date(clicked);
            clickedDay.setHours(0, 0, 0, 0);

            return (
                (clickedDay >= start && clickedDay < end) || //일반적인 기간 이벤트
                (clickedDay.getTime() === start.getTime() && !event.end) //end 없는 단일 날짜 이벤트 (공휴일 등)
            );
        }); 

        setSelectedDate(events); //필터링한 결과를 state에 저장해서, 모달에서 이 날짜에 해당하는 일정들을 표시할 수 있도록 준비
        
        if(events.length === 0 ) { //일정이 없으면
            openMakeModal(clicked); 
        }
        else {
            setClickedDate(clicked);
            openListModal(); //일정이 있으면
        }
    }, []);

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
        selectedEvent.remove(); //FullCalendar의 EventApi 객체의 메서드로, 화면에서 해당 일정을 삭제
        closeDeleteModal();

        await axios.delete(`/plan/${selectedEvent.extendedProps.planNo}`);
    }, [selectedEvent]); //selectedEvent가 변경될 때만 이 함수를 새로 만듦

    //일정 등록 모달 열기/닫기
    const openMakeModal = useCallback((date = null) => {
        const targetList = Modal.getInstance(listModal.current);
        if (targetList !== null) targetList.hide();

        if (!makeModal.current) return;
        const target = Modal.getOrCreateInstance(makeModal.current);
        
        const baseDate = date ? new Date(date) : new Date(); //baseDate = 이번 일정 등록의 기준 날짜. 날짜가 전달되면 그걸 기준으로, 없으면 현재 날짜로 사용
        const now = new Date(); //현재 날짜

        const start = new Date(baseDate); //이 시점에서는 날짜만 같고 시각은 기본값(00:00) 상태
        const end = new Date(baseDate); //이 시점에서는 날짜만 같고 시각은 기본값(00:00) 상태
        
        setAllDay(false); //종일 체크 해제

        if (allDay) { //종일일 경우 -> 00:00 ~ 00:00 기준
            start.setHours(0, 0, 0, 0);
            end.setDate(end.getDate() + 1);
            end.setHours(0, 0, 0, 0);
        } 
        else { //일반 일정 -> 현재 시간 기준
            start.setHours(now.getHours(), now.getMinutes(), 0, 0);
            end.setHours(now.getHours() + 1, now.getMinutes(), 0, 0);
        }

        setStartTime(start); //시작일 업데이트
        setEndTime(end); //종료일 업데이트
        setClickedDate(baseDate); //클릭한 날짜 상태 저장

        // 입력 초기화
        setTitle("");
        setContent("");
        setSearchContacts(""); //검색어 초기화
        setSelectedMembers([]); //수신자 리스트 초기화
        setPlanColor('#0d6efd'); //일정 색상 초기화

        setTitleChoice(false); //제목 경고 초기화
        setReceiverChoice(false); //수신자 경고 초기화
        setDateChoice(false); //시작일, 종료일 경고 초기화

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
        <Jumbotron subject="일정" />

        <hr/>

        <div className="row">
            <div className="col">
                <div className="d-flex justify-content-start mb-3">
                    <button className={`btn ${tab === 'calendar' ? 'btn-primary' : 'btn-outline-primary'} text-responsive me-2`} onClick={() => setTab('calendar')}>
                        캘린더
                    </button>
                    <button className={`btn ${tab === 'todo' ? 'btn-primary' : 'btn-outline-primary'} text-responsive`} onClick={() => setTab('todo')}>
                        Todo 리스트
                    </button>
                </div>
            </div>
        </div>

        
        <div className="calendar-wrapper">
        {/* 개인-Todo */}
        {tab === 'todo' && (
            <TodoList allEvents={allEvents} fetchAllEvents={fetchAllEvents} />
        )}            

        {/* 캘린더 */}
        {tab === 'calendar' && (
            <FullCalendar
                ref={calendar} //이 FullCalendar 컴포넌트에 접근할 수 있는 참조를 연결. .current.getApi()로 달력의 메서드에 접근할 수 있음
                plugins={[dayGridPlugin, interactionPlugin]} //FullCalendar에서 사용할 플러그인 목록. dayGridPlugin: 월간(month) 보기 기능을 제공, interactionPlugin: 날짜 클릭 등의 사용자 인터랙션을 처리
                locale={koLocale}
                initialView="dayGridMonth" //기본으로 보여줄 달력 형태를 설정. dayGridMonth -> "월간 보기"
                dateClick={detailDate} //달력의 날짜를 클릭했을 때 실행할 함수
                eventClick={detailEvent} //달력에 등록된 일정(이벤트)를 클릭했을 때 실행되는 함수
                eventDisplay="block" //모든 일정이 bar형태로 표시
                displayEventTime={false} //일정 옆에 시간까지 출력할지 여부 설정. false로 하면 시간은 숨기고 제목만 표시
                dayMaxEventRows={3} //한 셀 안에서 줄바꿈 없이 보여줄 수 있는 최대 줄 수. 초과하면 자동으로 +n mored으로 보여줌
                fixedWeekCount={false} // 6주 고정 비활성화
                contentHeight="auto"
                expandRows={true} //세로줄 자동 확장
                aspectRatio={2.0}
                height="auto"
                events={events} //실제 달력에 표시할 이벤트 목록. useState로 관리 중인 events 배열이 들어가고, loadPlans()에서 서버에서 불러온 데이터를 여기로 채워 넣음
                eventOrder={(a, b) => {
                    const aIsHoliday = a.extendedProps?.isHoliday ? 1 : 0;
                    const bIsHoliday = b.extendedProps?.isHoliday ? 1 : 0;
                    return bIsHoliday - aIsHoliday; // 공휴일이면 우선순위 업
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
                    const calendarApi = calendar.current?.getApi();
                    const currentDate = calendarApi?.getDate(); // 정확한 기준 날짜 확보

                    if (!currentDate) return;

                    const newMonth = currentDate.getMonth() + 1;
                    const newYear = currentDate.getFullYear();

                    setCurrentMonth(newMonth);
                    setCurrentYear(newYear);

                    await fetchAllEvents(newYear, newMonth);
                }}
            />
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
                                    <span className="fw-bold">참여자</span>
                                </div>
                                <div className="d-flex text-responsive mt-1 mb-2">
                                    <input type="text" className="form-control text-responsive" placeholder="이름 또는 부서명 검색" 
                                        value={searchContacts} onChange={(e) => setSearchContacts(e.target.value)}
                                    />
                                </div>
                                <div className="form-check mb-2">
                                    <input type="checkbox" className="form-check-input" id="selectAllMembers"
                                        checked={selectedMembers.length > 0 && selectedMembers.length === Object.values(groupContacts).flat().length}
                                        onChange={e=>{
                                            if (e.target.checked) {
                                                const all = Object.values(groupContacts).flat().map(m => m.memberNo);
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
                                <ul className="list-group text-responsive" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                    {Object.keys(filterContacts).map(department => {
                                        const members = filterContacts[department];
                                        const selectAll = members.every(member=>selectedMembers.includes(member.memberNo));

                                        return (
                                        <li key={department} className="list-group-item p-0 border-0">
                                            <div className="bg-light px-3 py-2 border-top text-secondary">
                                                <input type="checkbox" className="form-check-input me-2" checked={selectAll} 
                                                    onChange={e=>{
                                                        if(e.target.checked) {
                                                            const newMembers= members.map(member=>member.memberNo).filter(no=>!selectedMembers.includes(no));
                                                            setSelectedMembers(prev=>[...prev, ...newMembers]);
                                                        } else {
                                                            const removeMemberNo = members.map(member=>member.memberNo);
                                                            setSelectedMembers(prev=>prev.filter(no=>!removeMemberNo));
                                                        }
                                                    }}
                                                    />
                                                {department}
                                            </div>

                                            <ul className="list-group list-group-flush">
                                            {members.map(contact => (
                                                <li className="list-group-item d-flex align-items-center" key={contact.memberNo}>
                                                <input
                                                    type="checkbox"
                                                    className="form-check-input me-2"
                                                    checked={selectedMembers.includes(contact.memberNo)}
                                                    onChange={() => toggleMember(contact.memberNo)}
                                                />
                                                <span>{contact.memberName}</span>
                                                </li>
                                            ))}
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
                    <div className="modal-body text-responsive">
                        {selectedDate.map(event => {
                            const status = getStatus(event);
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
                            return (
                                <div key={`${event.title}-${event.startStr}`} onClick={() => moveListToDetail(event)}
                                    className="border rounded p-3 mb-2 hover-shadow text-responsive" style={{ cursor: 'pointer' }}>
                                    <div className="d-flex align-items-center text-responsive">
                                        <div className="d-flex align-items-center gap-1">
                                            <small className={`${status.className} fw-bold`}>{status.text}</small>
                                            <span className="fw-bold">{event.title}</span>
                                        </div>
                                        <div className="color-box ms-1" style={{ backgroundColor: event.extendedProps?.planColor }}></div>
                                    </div>
                                    <div className="d-flex flex-wrap gap-2 mt-2">
                                    {Object.values(groupContacts).flat()
                                    .filter(member => event.extendedProps?.receivers?.includes(member.memberNo))
                                    .map(member => (
                                        <div key={member.memberNo} className="d-flex align-items-center small custom-badge">
                                            <span>{member.memberName}</span>
                                        </div>
                                    ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary text-responsive" onClick={closeListModal}>닫기</button>
                        <button type="button" className="btn btn-primary text-responsive" onClick={()=>openMakeModal(clickedDate)}>등록</button>
                    </div>
                </div>
            </div>
        </div>

        {/* 상세 일정 모달(일정 클릭) */}
        <div className="modal fade" tabIndex="-1" ref={detailModal} data-bs-backdrop="static"> {/* 모달 바깥쪽 영역. tabinden -> tabIndex */}
            <div className="modal-dialog modal-lg"> {/* 모달 영역 */}
                <div className="modal-content">
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

                        {/* 상세일정 - 참여자 */}
                        <div className="row mt-3">
                            <div className="col">
                                <div className="d-flex text-responsive">
                                    <IoPersonSharp className="mt-1 me-2" />
                                    <span className="fw-bold">참여자</span>
                                </div>
                            </div>
                        </div>
                        <div className="row mt-2">
                            <div className="col">
                                <div className="mb-2">
                                    <ul className="list-group text-responsive" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                        {Object.keys(groupContacts).map(department => {
                                            const members = groupContacts[department].filter(
                                                contact => selectedEvent?.extendedProps?.receivers?.includes(contact.memberNo)
                                            );

                                            if (members.length === 0) return null;

                                            // JSX 블록 전체를 괄호로 감싸고 return 앞에는 반드시 중괄호로 열어야 함
                                            return (
                                                <li key={department}>
                                                    <div className="bg-light px-3 py-2 border-top text-secondary">
                                                        {department}
                                                    </div>
                                                    <ul className="list-group list-group-flush">
                                                        {members.map(contact => (
                                                            <li className="list-group-item d-flex align-items-center" key={contact.memberNo}>
                                                                <span>{contact.memberName}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary text-responsive" onClick={closeDetailModal}>닫기</button>
                        <button type="button" className="btn btn-danger text-responsive" onClick={openDeleteModal}>삭제</button>
                    </div>
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