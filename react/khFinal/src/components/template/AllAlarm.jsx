import axios from "axios";
import { toast } from "react-toastify";
import './AllAlarm.css';

import { useCallback, useState, useEffect } from "react";
import { FaCheck, FaLightbulb, FaTrash } from "react-icons/fa";
import { unReadAlarmCountState } from "../utils/alarm";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { refreshPlanEventsState } from "../utils/plan";
import { FaXmark } from "react-icons/fa6";

export default function AllAlarm() {
    //recoil
    const fetchAllEvents = useRecoilValue(refreshPlanEventsState);

    //state
    const [alarms, setAlarms] = useState([]);
    const setUnReadAlarmCount = useSetRecoilState(unReadAlarmCountState);

    //callback
    //알림 불러오기
    const loadAlarm = useCallback(async ()=>{
        const token = localStorage.getItem("refreshToken") || sessionStorage.getItem("refreshToken");
        
        // 서버에 전체 읽음 요청
        await axios.patch("/alarm/", null, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        
        //알림 목록 불러오기
        const resp = await axios.get("/alarm/", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        setAlarms(resp.data);

        //Recoil 알림 개수 상태도 0으로
        setUnReadAlarmCount(0);
    }, []);

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

    useEffect(()=>{
        loadAlarm();
        setUnReadAlarmCount(0); //읽음 처리
    }, []);

    useEffect(() => {
        const handle = () => {
          loadAlarm(); // 강제로 알림 다시 불러옴
        };
      
        // 🚨 이벤트 등록 시 콘솔 로그 추가해서 확인도 가능
        console.log("✅ 이벤트 등록됨");
        window.addEventListener("refreshAlarmList", handle);
      
        return () => {
          console.log("❌ 이벤트 해제됨");
          window.removeEventListener("refreshAlarmList", handle);
        };
    }, [loadAlarm]);

    //view
    return (<>
        <div className="row mt-2">
            <div className="col">
                <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                        <h2>
                            <FaLightbulb className="text-warning me-1" />
                            <span className="align-middle">알림</span>
                        </h2>
                    </div>
                    <button className="btn btn-outline-danger text-responsive" onClick={deleteAllAlarms}>전체 삭제</button>
                </div>
            </div>
        </div>

        <hr className="hr-stick" />

        <div className="row">
            <div className="col">
                <div className="border border-dark rounded p-3 mb-2 hover-shadow">
                    {alarms.length === 0 ? (
                        <div className="border rounded p-3 mb-2 hover-shadow text-responsive">새로운 알림이 없습니다.</div>
                    ) : (
                        alarms.map(alarm => (
                        <div key={alarm.alarmNo} className="border border-secondary d-flex align-items-center justify-content-between 
                                rounded p-3 mb-2 hover-shadow text-responsive">
                            <div>
                                <div>
                                    {alarm.alarmType === "PLAN_SOON" && <span className="text-primary">[30분 후 시작]</span>}
                                    {alarm.alarmType === "PLAN_START" && <span className="text-success">[시작]</span>}
                                    {alarm.alarmType === "PLAN_END" && <span className="text-muted">[종료]</span>}
                                    {alarm.alarmMessage}
                                    </div>
                                {alarm.planTitle
                                    ? <div className="text-muted">{alarm.planTitle}</div>
                                    : <div className="text-danger fw-bold">[삭제된 일정]</div>
                                }
                            </div>
                            
                            <div className="d-flex">
                                {/* 수락/거절이 필요한 알림일 경우 */}
                                {(alarm.alarmType === "PLAN_CREATE") && (
                                    <>
                                        <button className="btn p-2 d-flex align-items-center text-responsive" onClick={()=>responseAlarm(alarm.alarmPlanNo, alarm.alarmReceiverNo, alarm.alarmNo, true)}>
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
                        ))
                    )}
                </div>
            </div>
        </div>

    </>);
}