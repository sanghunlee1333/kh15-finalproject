import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import koLocale from '@fullcalendar/core/locales/ko';

import { useEffect, useRef, useState, useCallback } from 'react';
import axios from 'axios';
import { fetchHolidays } from '../utils/holiday';

import './MainTeamPlan.css';

export default function MainTeamPlan() {

    const calendarRef = useRef();

    const [events, setEvents] = useState([]);
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());

    //이벤트 불러오기
    const fetchAllEvents = useCallback(async (year, month) => {
        try {
        const holidays = await fetchHolidays(year, month);

        const token = localStorage.getItem("refreshToken") || sessionStorage.getItem("refreshToken");

        const { data: teamPlans } = await axios.get("/plan/team", {
            headers: { Authorization: `Bearer ${token}` }
        });

        const holidayEvents = holidays.map(holiday => {
            const dateStr = `${holiday.locdate}`;
            const dateObj = new Date(
            `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`
            );
            return {
            id: `holiday-${holiday.locdate}`,
            title: holiday.dateName,
            start: dateObj,
            allDay: true,
            display: "background",
            backgroundColor: "#f79d9d",
            borderColor: "transparent",
            extendedProps: { isHoliday: true }
            };
        });

        const planEvents = teamPlans.map(plan => ({
            id: `team-${plan.planNo}`,
            title: plan.planTitle,
            start: plan.planStartTime,
            end: plan.planEndTime,
            allDay: plan.planIsAllDay === "Y",
            backgroundColor: plan.planColor,
            borderColor: plan.planColor,
            extendedProps: {
            ...plan,
            planType: plan.planType,
            isHoliday: false,
            }
        }));

        setEvents([...holidayEvents, ...planEvents]);
        } catch (err) {
        console.error("이벤트 로딩 실패", err);
        }
    }, []);

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

    // 초기 렌더 시 이벤트 불러오기
    useEffect(() => {
        const today = new Date();
        const initYear = today.getFullYear();
        const initMonth = today.getMonth() + 1;
        setYear(initYear);
        setMonth(initMonth);
        fetchAllEvents(initYear, initMonth);
    }, [fetchAllEvents]);

    return (
        <div className="calendar-wrapper">
            <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, interactionPlugin]}
                locale={koLocale}
                initialView="dayGridMonth"
                headerToolbar={{
                    left: '',
                    center: 'title',
                    right: '',
                }}
                events={events}
                eventDisplay="block"
                displayEventTime={false}
                height="auto"
                expandRows={true}
                fixedWeekCount={false}
                eventContent={renderEventContent}
                datesSet={() => {
                    const calendarApi = calendarRef.current?.getApi();
                    if (!calendarApi) return;

                    const current = calendarApi.getDate();
                    const newMonth = current.getMonth() + 1;
                    const newYear = current.getFullYear();

                    setMonth(newMonth);
                    setYear(newYear);
                    fetchAllEvents(newYear, newMonth);
                }}
            />
        </div>
    );
}
