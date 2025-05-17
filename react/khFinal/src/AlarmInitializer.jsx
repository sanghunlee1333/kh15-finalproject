import { useEffect } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import axios from 'axios';
import { userLoadingState, userNoState } from './components/utils/stroage';
import { unReadAlarmCountState } from './components/utils/alarm';

export default function AlarmInitializer() {
    const setUnreadAlarmCount = useSetRecoilState(unReadAlarmCountState);
    const loading = useRecoilValue(userLoadingState);

    useEffect(() => {
        axios.get("/alarm/count")
        .then(res => {
            setUnreadAlarmCount(res.data);
        })
    }, [loading]);

    return null;
}