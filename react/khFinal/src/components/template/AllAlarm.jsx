import axios from "axios";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

import './AllAlarm.css';

import { useCallback, useState, useEffect, useRef } from "react";
import { FaBell, FaCheck, FaCrown, FaLightbulb, FaList, FaRegCalendarCheck, FaTrash } from "react-icons/fa";
import { unReadAlarmCountState } from "../utils/alarm";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { refreshPlanEventsState } from "../utils/plan";
import { FaMagnifyingGlass, FaTrashCan, FaXmark } from "react-icons/fa6";
import { throttle } from "lodash";
import { IoPersonSharp } from "react-icons/io5";
import moment from "moment";

export default function AllAlarm({ groupContacts, loginUserNo, detailModal, selectedEvent, setSelectedEvent, openDetailModal, closeDetailModal, showDeleteButton = true }) {
    //recoil
    const fetchAllEvents = useRecoilValue(refreshPlanEventsState);
    const setUnReadAlarmCount = useSetRecoilState(unReadAlarmCountState); //안 읽은 알림 개수

    //state 
    const [alarms, setAlarms] = useState([]); //알림
    const [now, setNow] = useState(dayjs()); //현재 시간
    const [page, setPage] = useState(1); //페이지
    const [size] = useState(10); //한번에 불러올 알림 갯수
    const [hasMore, setHasMore] = useState(true); //더보기 유무
    
    const loading = useRef(false);

    //callback
    //알림 삭제(1개)
    const deleteAlarm = useCallback(async (alarm)=>{
        const token = localStorage.getItem("refreshToken") || sessionStorage.getItem("refreshToken");
        
        //PLAN_CREATE 알림이면 거절 처리도 같이 진행
        if (alarm.alarmType === "PLAN_CREATE") {
            await axios.patch(`/plan/receive/planNo/${alarm.alarmPlanNo}/receiverNo/${alarm.alarmReceiverNo}/response`, {
                planStatus: "N"
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            //알림 거절
            await axios.delete(`/alarm/${alarm.alarmNo}`)
                .then(()=>{
                    toast.error("알림을 거절했습니다.");
                }
            );
        }
        else { //알림 삭제
            await axios.delete(`/alarm/${alarm.alarmNo}`)
                .then(()=>{
                    toast.error("알림을 삭제했습니다.");
                }
            );
        }
        setAlarms(prev => prev.filter(a => a.alarmNo !== alarm.alarmNo));
    }, []);

    //알림 삭제(전체)
    const deleteAllAlarms = useCallback(async ()=>{
        await axios.delete("/alarm/all")
            .then(()=>{
                toast.error("알림을 삭제했습니다.");
            }
        );
        setAlarms([]);
    }, []);

    //알림 수락/거절
    const responseAlarm = useCallback(async (planNo, receiverNo, alarmNo, accepted) => {
        const token = localStorage.getItem("refreshToken") || sessionStorage.getItem("refreshToken");
        //1. 응답 API 호출
        await axios.patch(`/plan/receive/planNo/${planNo}/receiverNo/${receiverNo}/response` , {
            planStatus: accepted ? "Y" : "N"
        } , {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }).then(()=>{
            accepted ? toast.success("일정을 수락했습니다.") : toast.error("일정을 거절했습니다.");
        });
        //2. 해당 알림 삭제 API 호출
        await axios.delete(`/alarm/${alarmNo}`);

        //3. UI에서 제거
        setAlarms(prev=>prev.filter(alarm=>alarm.alarmNo !== alarmNo));

        //4. 일정 수락 시에만 새로고침
        if(accepted && typeof fetchAllEvents === "function") {
            const now = new Date();
            fetchAllEvents(now.getFullYear(), now.getMonth() + 1);
        }
    }, [fetchAllEvents]);

    //알림 읽음 처리
    const allRead = useCallback(async () => {
        const token = localStorage.getItem("refreshToken") || sessionStorage.getItem("refreshToken");
        await axios.patch("/alarm/", null, { //읽음 처리 요청
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        setUnReadAlarmCount(0); // 읽음 처리
    }, []);

    //스크롤 함수
    const handleScroll = useCallback(throttle(() => {
        if (!hasMore || loading.current) return;

        const scrollTop = window.scrollY;
        const windowHeight = window.innerHeight;
        const docHeight = document.documentElement.scrollHeight;

        if (scrollTop + windowHeight >= docHeight - 100) {
            loading.current = true;
            setPage(prev => prev + 1);
        }
    }, 300), [hasMore]);

    //알림 불러오는 함수(스크롤 적용)
    const loadAlarms = useCallback(async (pageToLoad) => {
        const token = localStorage.getItem("refreshToken") || sessionStorage.getItem("refreshToken");
        const offset = (pageToLoad - 1) * size;
        const resp = await axios.get(`/alarm/scroll?offset=${offset}&size=${size}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (resp.data.length < size) setHasMore(false);
        if (pageToLoad === 1) setAlarms(resp.data);
        else setAlarms(prev => [...prev, ...resp.data]);
    }, [size]);

    //effect
    //알림 불러오기
    useEffect(() => {
        loadAlarms(page).then(() => loading.current = false);
    }, [page, loadAlarms]);

    //컴포넌트 처음 로딩될 때
    useEffect(() => {
        const init = async () => {
            setPage(1); //페이지 번호를 1로 설정
            setHasMore(true); //무한 스크롤 가능 상태 초기화
            const token = localStorage.getItem("refreshToken") || sessionStorage.getItem("refreshToken");
            await axios.patch("/alarm/", null, { //서버에 전체 알림 읽음 처리
                headers: { Authorization: `Bearer ${token}` }
            });
            setUnReadAlarmCount(0); //Recoil 상태에서 안 읽은 알림 개수 0으로
        };
        init();
    }, []);

    //컴포넌트 입장 시, 전체 알림 읽음 처리
    useEffect(()=>{
        allRead();
    }, []);

    //페이지를 아래로 스크롤할 때 handleScroll 함수가 호출
    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [handleScroll]);

    //1분 마다 알림 도착 시간 계산
    useEffect(() => {
        const timer = setInterval(()=>{
            setNow(dayjs());
        }, 60000); // 1분마다 갱신
    
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const handleRefreshAlarmList = () => {
            setPage(1);
            setHasMore(true);
            loadAlarms(1);
        };
      
        window.addEventListener("refreshAlarmList", handleRefreshAlarmList);
        return () => {
            window.removeEventListener("refreshAlarmList", handleRefreshAlarmList);
        };
    }, [loadAlarms]);

    const clickAlarm = useCallback(async (alarm) => {
        if (alarm.alarmPlanNo) {
            const token = localStorage.getItem("refreshToken") || sessionStorage.getItem("refreshToken");
            const resp = await axios.get(`/plan/${alarm.alarmPlanNo}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
    
            // FullCalendar 형식으로 가공
            const plan = resp.data;
            const eventObj = {
                id: `alarm-${plan.planNo}`,
                title: plan.planTitle,
                start: plan.planStartTime,
                end: plan.planEndTime,
                allDay: plan.planIsAllDay === 'Y',
                extendedProps: {
                    planNo: plan.planNo,
                    planType: plan.planType,
                    content: plan.planContent,
                    planColor: plan.planColor,
                    planSenderNo: plan.planSenderNo,
                    planSenderName: plan.planSenderName,
                    planSenderDepartment: plan.planSenderDepartment,
                    planStatus: plan.planStatus,
                    receivers: plan.receivers
                }
            };
    
            setSelectedEvent(eventObj);
            openDetailModal();
        }
    }, []);

    //view
    return (<>
        <div className="row mt-2">
            <div className="col">
                <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                        <h2>
                            <FaBell className="text-warning me-2" />
                            <span className="align-middle">알림</span>
                        </h2>
                    </div>
                    <button className="btn btn-outline-danger d-flex align-items-center text-responsive" onClick={deleteAllAlarms}>
                        <FaTrashCan />
                        <span className="ms-1">비우기</span>
                    </button>
                </div>
            </div>
        </div>

        <hr className="hr-stick" />

        <div className="row">
            <div className="col">
                <div>
                    {alarms.length === 0 ? (
                        <div className="border rounded p-5 hover-shadow text-center text-responsive">새로운 알림이 없습니다.</div>
                    ) : (
                        alarms.map(alarm => {
                        const timeAgo = dayjs(alarm.alarmCreateTime).from(now); //알림 생성 시점 기준으로 현재(now)와의 차이 계산
                            return (
                                <div key={alarm.alarmNo} className="border border-secondary d-flex align-items-center justify-content-between 
                                        rounded p-3 mb-2 hover-shadow text-responsive">
                                    <div>
                                        <div>
                                            {alarm.alarmType === "PLAN_CREATE" && <span className="fw-bold text-warning me-2">안내</span>}
                                            {alarm.alarmType === "PLAN_ACCEPT" && <span className="fw-bold text-success me-2">수락</span>}
                                            {alarm.alarmType === "PLAN_REJECT" && <span className="fw-bold text-danger me-2">거절</span>}
                                            {alarm.alarmType === "PLAN_COMPLETE" && <span className="fw-bold text-success me-2">완료</span>}
                                            {alarm.alarmType === "PLAN_DELETE" && <span className="fw-bold text-danger me-2">삭제</span>}
                                            {alarm.alarmType === "PLAN_SOON" && <span className="fw-bold text-primary me-2">30분 후 시작</span>}
                                            {alarm.alarmType === "PLAN_START" && <span className="fw-bold text-success me-2">시작</span>}
                                            {alarm.alarmType === "PLAN_END" && <span className="fw-bold text-danger me-2">종료</span>}
                                            <span>{alarm.alarmMessage}</span>
                                            {(alarm.alarmType === "PLAN_CREATE") && (
                                                <button className="btn btn-sm btn-secondary ms-2" onClick={() => clickAlarm(alarm)}>
                                                    <FaMagnifyingGlass />
                                                </button>
                                            )}
                                        </div>
                                    <div className="text-muted small mt-1">{timeAgo}</div> {/* n분 전 표시 */}
                                    </div>

                                    <div className="d-flex">
                                        {/* 수락/거절이 필요한 알림일 경우 */}
                                        {(alarm.alarmType === "PLAN_CREATE") && (
                                            <>
                                                <button className="btn p-2 d-flex align-items-center text-responsive ms-1" onClick={()=>responseAlarm(alarm.alarmPlanNo, alarm.alarmReceiverNo, alarm.alarmNo, true)}>
                                                    <FaCheck className="text-success" />
                                                </button>
                                                <button className="btn p-2 d-flex align-items-center ms-1" onClick={()=>responseAlarm(alarm.alarmPlanNo, alarm.alarmReceiverNo, alarm.alarmNo, false)}>
                                                    <FaXmark className="text-danger" />
                                                </button>
                                            </>
                                        )}
                                        
                                        <button className="btn p-2 ms-1">
                                            <FaTrash className="d-flex align-items-center text-danger" onClick={()=>deleteAlarm(alarm)}/>
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
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
                                                        <div className="bg-light px-3 py-2 border-top text-secondary">{department}</div>
                                                        <ul className="list-group list-group-flush">
                                                        {members.map(contact => {
                                                            const isMe = contact.memberNo === loginUserNo;
                                                            const status = selectedEvent?.extendedProps?.receivers?.find(
                                                                r => r.planReceiveReceiverNo === contact.memberNo)
                                                                ?.planReceiveStatus || '미달성';
                                                        
                                                        return (    
                                                            <li className="list-group-item d-flex justify-content-between align-items-center" key={contact.memberNo}>
                                                                {isMe ? ( 
                                                                <span className="fw-bold">{contact.memberName}
                                                                    <span className="ms-1">(나)</span>
                                                                </span>
                                                                ) : (
                                                                <span>{contact.memberName}</span>    
                                                                )}
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
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary text-responsive" onClick={closeDetailModal}>닫기</button>
                        {showDeleteButton && selectedEvent?.extendedProps?.planSenderNo === loginUserNo && (
                        <button type="button" className="btn btn-danger text-responsive" onClick={openDeleteModal}>삭제</button>
                        )}
                    </div>
                </div>
            </div>
        </div>

    </>);
}