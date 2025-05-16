import { atom } from "recoil";

const alarmListState = atom({
    key: "alarmListState",
    default: [
        // "alarmNo": 5,
        // "type": "PLAN_CREATED", // PLAN_CREATED, PLAN_ACCEPTED, PLAN_STARTED 등
        // "message": "홍길동님이 일정을 등록했습니다.",
        // "planTitle": "주간 회의",
        // "senderName": "홍길동",
        // "startTime": "2025-05-16T09:00:00",
        // "endTime": "2025-05-16T10:00:00",
        // "planNo": 12, // 수락/거절 처리 시 필요
        // "isActionRequired": true, // 수락/거절 등 액션이 필요한지
        // "isAccepted": null // null / true / false
    ], // { message, timestamp, type } 형태
});

const unReadAlarmCountState = atom({
    key: "unReadAlarmCountState",
    default: 0
});

export { alarmListState, unReadAlarmCountState };