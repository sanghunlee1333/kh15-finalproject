import FullCalendar from '@fullcalendar/react';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import koLocale from '@fullcalendar/core/locales/ko';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Modal } from 'bootstrap';
import { toast } from "react-toastify";

import axios from 'axios';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);
dayjs.locale('ko');

import "react-datepicker/dist/react-datepicker.css";
import { FaCheck, FaLightbulb, FaList, FaRegCalendarCheck, FaRegCalendarPlus } from 'react-icons/fa';
import './TodoList.css';
import './PlanColor.css';
import { IoPersonSharp } from 'react-icons/io5';

const colorOptions = ['#dc3545', '#fd7e14', '#ffc107', '#28a745', '#20c997', '#0d6efd', '#6f42c1', '#d63384', '#6c757d'];

export default function TodoList({ allEvents = [], fetchAllEvents }) {

    //state
    const [calendarView, setCalendarView] = useState('listWeek'); // 초기값 주간

    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1); //다음 달
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

    const [viewType, setViewType] = useState("전체");
    const [title, setTitle] = useState(""); //일정 제목
    const [content, setContent] = useState(""); //일정 내용
    const [startTime, setStartTime] = useState(new Date()); //일정 시작일
    const [endTime, setEndTime] = useState(new Date(new Date().getTime() + 60 * 60 * 1000)); //일정 종료일

    const [groupContacts, setGroupContacts] = useState({}); //전체 연락처 정보를 부서별로 저장

    const [allDay, setAllDay] = useState(false);
    const [planColor, setPlanColor] = useState('#0d6efd');
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [clickedDate, setClickedDate] = useState(null);
    const [titleChoice, setTitleChoice] = useState(false);
    const [dateChoice, setDateChoice] = useState(false);
    const [endTimeManuallyChanged, setEndTimeManuallyChanged] = useState(false);

    const [selectedEvent, setSelectedEvent] = useState(null);

    //ref
    const calendar = useRef(); //FullCalendar 컴포넌트를 조작하기 위한 참조
    const makeModal = useRef();
    const detailModal = useRef();
    const deleteModal = useRef(); //상세 일정 -> 삭제 시 뜨는 모달 참조

    //memo
    //종료일이 시작일보다 앞선 경우 처리
    const isInvalidEndTime = useMemo(() => {
        if (!startTime || !endTime) return false; // 둘 다 존재할 때만 비교
        return endTime < startTime;
    }, [startTime, endTime]);
    
    // const todayEvents = useMemo(() => {
    //     const today = new Date();
    //     today.setHours(0, 0, 0, 0);

    //     return allEvents.filter(event => {
    //         const planType = event.extendedProps?.planType;
    //         const matchesType =
    //             viewType === "전체" ||
    //             (viewType === "개인" && planType === "개인") ||
    //             (viewType === "팀" && planType === "팀");
    //         return matchesType;
    //     }).map(event => {
    //         const isAllDay = event.allDay || event.extendedProps?.planIsAllDay === "Y";
          
    //         const start = new Date(event.start);
    //         const end = new Date(event.end);
          
    //         return {
    //             ...event,
    //             start: isAllDay ? dayjs(start).format("YYYY-MM-DD") : start,
    //             end: isAllDay ? dayjs(end).add(1, "day").format("YYYY-MM-DD") : end,
    //             allDay: isAllDay,
    //         };
    //     });
    // }, [allEvents, viewType]);

    const todayEvents = useMemo(() => {
        return allEvents
            .filter(event => {
                if (event.extendedProps?.isHoliday) return true;

                const planType = event.extendedProps?.planType;

                return (
                    viewType === "전체" ||
                    (viewType === "개인" && planType === "개인") ||
                    (viewType === "팀" && planType === "팀")
                );
            })
            .map(event => {
                const isAllDay = event.allDay || event.extendedProps?.planIsAllDay === "Y";
    
                return {
                    ...event,
                    start: isAllDay ? dayjs(event.start).format("YYYY-MM-DD") : event.start,
                    end: isAllDay ? dayjs(event.end).format("YYYY-MM-DD") : event.end,
                    allDay: isAllDay
                };
            });
    }, [allEvents, viewType]);

    //callback
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

    //effect
    useEffect(() => {
        fetchAllEvents(currentYear, currentMonth);
    }, [currentYear, currentMonth, fetchAllEvents]);


    //일정 등록
    const submitPlan = useCallback(async () => {
        if (!title || !startTime || !endTime || isInvalidEndTime) return;
    
        let adjustedStartTime = startTime;
        let adjustedEndTime = endTime;
        if (allDay) {
            adjustedStartTime = new Date(startTime);
            adjustedStartTime.setHours(0, 0, 0, 0);

            adjustedEndTime = new Date(endTime);
            adjustedEndTime.setDate(adjustedEndTime.getDate() + 1);
            adjustedEndTime.setHours(0, 0, 0, 0);
        }
    
        const body = {
            planType: "개인",
            planTitle: title,
            planContent: content,
            planStartTime: adjustedStartTime,
            planEndTime: adjustedEndTime,
            planIsAllDay: allDay ? "Y" : "N",
            planColor: planColor,
            receivers: [] // 개인일정이므로 수신자 없음
        };
    
        let token = localStorage.getItem("refreshToken") || sessionStorage.getItem("refreshToken");
    
        await axios.post("/plan/personal", body, {
            headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("일정이 등록되었습니다.");
    
        await fetchAllEvents(currentYear, currentMonth); // 전체 fetch
        closeMakeModal();
    }, [title, content, startTime, endTime, planColor, currentMonth, currentYear, fetchAllEvents]);

    //일정 삭제
    const deleteEvent = useCallback(async ()=>{
        if(!selectedEvent) return; //만약 삭제할 일정이 선택되지 않았다면
        selectedEvent.remove(); //FullCalendar의 EventApi 객체의 메서드로, 화면에서 해당 일정을 삭제
        closeDeleteModal();

        await axios.delete(`/plan/${selectedEvent.extendedProps.planNo}`);
        await fetchAllEvents(currentYear, currentMonth);
    }, [selectedEvent]); //selectedEvent가 변경될 때만 이 함수를 새로 만듦

    //Todo 등록 모달 열기/닫기
    const openMakeModal = useCallback((date = null) => {
        if (!makeModal.current) return;
        const target = Modal.getOrCreateInstance(makeModal.current);
        
        const now = new Date(); //현재 날짜
        const baseDate = date ? new Date(date) : new Date(); //baseDate = 이번 일정 등록의 기준 날짜. 날짜가 전달되면 그걸 기준으로, 없으면 현재 날짜로 사용
        
        setAllDay(false); //종일 체크 해제
        
        const start = new Date(baseDate); //이 시점에서는 날짜만 같고 시각은 기본값(00:00) 상태
        const end = new Date(baseDate); //이 시점에서는 날짜만 같고 시각은 기본값(00:00) 상태

        // 입력 초기화
        setTitle("");
        setContent("");
        setPlanColor('#0d6efd'); //일정 색상 초기화

        setTitleChoice(false); //제목 경고 초기화
        setDateChoice(false); //시작일, 종료일 경고 초기화
        setEndTimeManuallyChanged(false);

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

        target.show();
    }, [makeModal, clickedDate]);
    const closeMakeModal = useCallback(() => {
        const target = Modal.getInstance(makeModal.current);
        if (target !== null) target.hide();

        // 입력 초기화
        setTitle("");
        setContent("");
        setStartTime(null);
        setEndTime(null);
    }, [makeModal]);

    //상세 Todo 모달 열기/닫기
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

    return(<>
        <div className="row">
            <div className="col">
                <div className="d-flex align-items-center justify-content-end">
                    <button className="btn" onClick={()=>openMakeModal()}>
                        <FaRegCalendarPlus className="text-success fs-4" />
                    </button>
                </div>
            </div>
        </div>

        <div className="row mt-2">
            <div className="col">
                <div className="d-flex align-items-center justify-content-between">
                    {/* 전체 / 개인 / 팀 토글 */}
                    <div className="btn-group" role="group">
                        <input type="radio" className="btn-check" name="todoTypeToggle" id="todoAll" autoComplete="off"
                            checked={viewType === "전체"} onChange={() => setViewType("전체")}
                        />
                        <label className="btn btn-outline-primary text-responsive" htmlFor="todoAll">전체</label>
                        <input type="radio" className="btn-check" name="todoTypeToggle" id="todoTeam" autoComplete="off"
                            checked={viewType === "팀"} onChange={() => setViewType("팀")}
                        />
                        <label className="btn btn-outline-primary text-responsive" htmlFor="todoTeam">팀</label>
                        <input type="radio" className="btn-check" name="todoTypeToggle" id="todoPersonal" autoComplete="off"
                            checked={viewType === "개인"} onChange={() => setViewType("개인")}
                        />
                        <label className="btn btn-outline-primary text-responsive" htmlFor="todoPersonal">개인</label>
                    </div>

                    {/* 일간 / 주간 */}
                    <select className="form-select text-responsive w-auto" value={calendarView}
                        onChange={e => {
                            setCalendarView(e.target.value);
                            calendar.current.getApi().changeView(e.target.value);
                        }}
                        style={{
                            height: 'clamp(2rem, 4vw, 3rem)',
                            fontSize: 'clamp(0.875rem, 1.5vw, 1rem)',
                            padding: '0.25em 3em 0.25em 1em'
                        }}
                    >
                        <option value="listDay">일간</option>
                        <option value="listWeek">주간</option>
                    </select>
                </div>
            </div>
        </div>

        <FullCalendar
            ref={calendar}
            key={calendarView}
            plugins={[listPlugin, interactionPlugin]}
            initialView="listWeek"
            eventDisplay="list-item"
            locale={koLocale}
            views={{
                listDay: { buttonText: '일간' },
                listWeek: { buttonText: '주간' },
            }}
            headerToolbar={{
                start: '', //헤더에서 아무 버튼도 표시하지 않겠다는 의미 (start에 아무것도 없음)
                end: '',
            }}
            height="auto" //캘린더 높이를 자동 조정 
            events={todayEvents} //캘린더에 표시할 이벤트 목록. 일반적으로 useMemo로 필터링된 state를 전달
            noEventsContent="오늘 일정이 없습니다." //표시할 이벤트가 없을 경우 보여줄 문구
            eventClick={detailEvent} //달력에 등록된 일정(이벤트)를 클릭했을 때 실행되는 함수
            // datesSet={dateSet}
        />

        {/* Todo 등록 모달 */}
        <div className="modal fade" tabIndex="-1" ref={makeModal} data-bs-backdrop="static"> {/* 모달 바깥쪽 영역. tabinden -> tabIndex */}
            <div className="modal-dialog modal-lg"> {/* 모달 영역 */} 
                <div className="modal-content">
                    <div className="modal-header">
                        <h1 className="modal-title d-flex align-items-cenger text-responsive">
                            <FaRegCalendarPlus className="mt-1 me-2" />
                            <span>Todo 등록</span>
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
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary text-responsive" onClick={closeMakeModal}>취소</button>
                        <button type="button" className="btn btn-success text-responsive" onClick={submitPlan}>등록</button>
                    </div>
                </div>
            </div>
        </div>

        {/* Todo 상세 모달 */}
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
                                {selectedEvent.allDay ? (
                                    <span>종일</span>
                                ) : (
                                    <>
                                        <span>{moment(selectedEvent.start).format('YYYY-MM-DD HH:mm')}</span>
                                        <span className="ms-2">-</span>
                                        <span className="ms-2">{moment(selectedEvent.end).format('YYYY-MM-DD HH:mm')}</span>
                                    </>
                                )}
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

                        {/* 상세일정 - 수신자 */}
                        <div className="row mt-3">
                            <div className="col">
                                <div className="d-flex text-responsive">
                                    <IoPersonSharp className="mt-1 me-2" />
                                    <span className="fw-bold">수신자</span>
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