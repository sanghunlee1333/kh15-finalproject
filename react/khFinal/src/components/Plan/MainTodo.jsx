import FullCalendar from '@fullcalendar/react';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import koLocale from '@fullcalendar/core/locales/ko';

import { useEffect, useState } from 'react';
import axios from 'axios';

export default function MainTodo() {
    const [events, setEvents] = useState([]);

    useEffect(() => {
        const fetchEvents = async () => {
        let token = localStorage.getItem("refreshToken") || sessionStorage.getItem("refreshToken");

        const [team, personal] = await Promise.all([
            axios.get("/plan/team", { headers: { Authorization: `Bearer ${token}` } }),
            axios.get("/plan/personal", { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const formatEvent = (plan, type) => ({
            id: `${type}-${plan.planNo}`,
            title: plan.planTitle,
            start: plan.planStartTime,
            end: plan.planEndTime,
            allDay: plan.planIsAllDay === "Y",
            extendedProps: {
                planType: type,
                planStatus: plan.planStatus
            },
            backgroundColor: plan.planColor,
            borderColor: plan.planColor
        });

        const filtered = [
            ...team.data.map(p => formatEvent(p, "팀")),
            ...personal.data.map(p => formatEvent(p, "개인"))
        ].filter(e => {
            const start = new Date(e.start);
            const end = new Date(e.end ?? e.start);
            
            return start < tomorrow && end > today;
        });

        setEvents(filtered);
        };

        fetchEvents();
    }, []);

    return (
        <FullCalendar
            plugins={[listPlugin, interactionPlugin]}
            initialView="listDay"
            locale={koLocale}
            headerToolbar={false}
            events={events}
            noEventsContent="오늘 일정이 없습니다."
            height="auto"
        />
    );
}