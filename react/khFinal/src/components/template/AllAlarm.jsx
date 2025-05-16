import axios from "axios";
import { toast } from "react-toastify";
import dayjs from 'dayjs';

import { useCallback, useState, useEffect } from "react";
import { FaLightbulb, FaTrash } from "react-icons/fa";
import { unReadAlarmCountState } from "../utils/alarm";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { refreshPlanEventsState } from "../utils/plan";

export default function AllAlarm() {
    //recoil
    const fetchAllEvents = useRecoilValue(refreshPlanEventsState);

    //state
    const [alarms, setAlarms] = useState([]);
    const setUnReadAlarmCount = useSetRecoilState(unReadAlarmCountState);

    useEffect(() => {
        console.log("알림 수신:", alarms);
      }, [alarms]);

    //callback
    //알림 불러오기
    const loadAlarm = useCallback(async ()=>{
        const token = localStorage.getItem("refreshToken") || sessionStorage.getItem("refreshToken");
        const resp = await axios.get("/alarm/", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        console.log("📥 최신 서버 응답:", resp.data);
        const withZeroPlan = resp.data.filter(alarm =>
          alarm.alarmPlanNo === 0 || alarm.alarmReceiverNo === 0 || alarm.alarmSenderNo === 0
        );
        if (withZeroPlan.length > 0) {
          console.warn("❗ 잘못된 알림이 포함됨:", withZeroPlan);
        }


        setAlarms(resp.data);
    }, []);

    //알림 삭제(1개)
    const deleteAlarm = useCallback(async (alarmNo)=>{
        await axios.delete(`/alarm/${alarmNo}`)
            .then(()=>{
                toast.success("알림을 삭제했습니다.");
            }
        );
        setAlarms(prev=>prev.filter(alarm => alarm.alarmNo !== alarmNo));
    }, []);

    //알림 삭제(전체)
    const deleteAllAlarms = useCallback(async ()=>{
        await axios.delete("/alarm/all")
            .then(()=>{
                toast.success("알림을 삭제했습니다.");
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
                toast.success(accepted ? "일정을 수락했습니다." : "일정을 거절했습니다.");
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
                                <div className="text-bold">{alarm.alarmMessage}</div>
                                {alarm.planTitle
                                    ? <div className="text-muted">{alarm.planTitle}</div>
                                    : <div className="text-muted text-danger">[삭제된 일정]</div>
                                }
                                <div className="text-muted">{dayjs(alarm.planStartTime).format("YYYY-MM-DD HH:mm")} ~ {dayjs(alarm.planEndTime).format("YYYY-MM-DD HH:mm")}</div>
                            </div>
                            <div className="d-flex">
                                {/* 수락/거절이 필요한 알림일 경우 */}
                                {(alarm.alarmType === "PLAN_CREATE") && (
                                    <>
                                        <button className="btn btn-outline-success" onClick={()=>responseAlarm(alarm.alarmPlanNo, alarm.alarmReceiverNo, alarm.alarmNo, true)}>
                                            수락
                                        </button>
                                        <button className="btn btn-outline-danger ms-2" onClick={()=>responseAlarm(alarm.alarmPlanNo, alarm.alarmReceiverNo, alarm.alarmNo, false)}>
                                            거절
                                        </button>
                                    </>
                                )}
                                <button className="btn ms-2">
                                    <FaTrash className="text-danger" onClick={()=>deleteAlarm(alarm.alarmNo)}/>
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