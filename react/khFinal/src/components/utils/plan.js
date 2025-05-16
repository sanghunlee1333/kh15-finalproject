import { atom } from "recoil";

//모든 참여자 일정 완료 여부 판단 함수
export function isPlanAllCompleted(event) {
    const { planType, planStatus, receivers } = event.extendedProps;

    if(planType === "개인") {
        return planStatus === "완료" || planStatus === "달성";
    }

    if(!receivers || receivers.length === 0) return false;

    //팀 일정 : 모든 참여자의 상태가 "달성"이면 true
    return receivers.every(r=>r.planReceiveStatus === "달성");
}

//FullCalendar의 일정 목록을 갱신하는 함수 상태 (TeamPlan에서 설정, 다른 컴포넌트에서 호출)
export const refreshPlanEventsState = atom({
    key: 'refreshPlanEventsState',
    default: () => {}
});