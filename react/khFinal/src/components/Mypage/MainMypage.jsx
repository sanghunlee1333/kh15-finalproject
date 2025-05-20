import { useRecoilValue } from "recoil"
import { userNoState } from "../utils/stroage"
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import axios from "axios";
import { FaChevronLeft, FaChevronRight, FaUser } from "react-icons/fa";
import Jumbotron from "../template/Jumbotron";
import userImg from '/public/images/profile_basic.png';
import { Modal } from "bootstrap";
import Postcode from "../template/Postcode";
import { FaMagnifyingGlassPlus } from "react-icons/fa6";
import DatePicker from "react-datepicker";

export default function MainMypage() {
    // const userNo = useRecoilValue(userNoState);
    const [member, setMember] = useState({
        memberNo: "", memberId: "", memberDepartment: "", memberName: "", memberContact: "", memberEmail: "",
        memberPost: "", memberAddress1: "", memberAddress2: "", memberRank: "", memberBank: "", memberBankNo: "",
    })


    const [memberImg, setMemberImg] = useState({ attachmentNo: "", url: "" })

    const [newAttach, setNewAttach] = useState("");
    const zoomModal = useRef();
    const inputImage = useRef();

    const [addressValid, setAddressValid] = useState(true);
    const [contactValid, setContactValid] = useState(true);
    const [emailValid, setEmailValid] = useState(true);
    const [totalWork, setTotalWork] = useState("");
    const [viewDate, setViewDate] = useState("");
    const [resultList, setResultList] = useState([]);
    const [reasonList, setReasonList] = useState([]);
    const [status, setStatus] = useState({
        absentCount: "",
        earlyCount: "",
        lateCount: "",
        outingDays: "",
        realWorkDays: "",
        reasonDays: "",
    })

    const [outingList, setOutingList] = useState([]);
    const [viewReason, setViewReason] = useState("");
    useEffect(() => {
        const now = new Date();

        setViewDate({
            year: now.getFullYear().toString(),
            month: (now.getMonth() + 1).toString().padStart(2, "0")
        })
    }, [member])

    useEffect(() => { loadOne() }, []);
    useEffect(() => {
        console.log(viewDate);
        if (viewDate.year && viewDate.month) {
            requestReasonList();
            requestStatus();


        }


    }, [viewDate]);

    const requestStatus = useCallback(async () => {
        const memberNo = member.memberNo;

        const resp = await axios.post(`/attendance/status/${member.memberNo}`, viewDate);
        // console.log("requestStatus");
        setStatus(resp.data);

    }, [viewDate, member])


    const requestResultList = useCallback(async () => {
        // console.log("requestResul,tList");

        const requestResp = await axios.post(`/attendance/resultlist/${member.memberNo}`, viewDate);

        setResultList(requestResp.data.attendanceResultList);
    }, [viewDate, member]);

    const requestReasonList = useCallback(async () => {
        //  console.log("requestReasonList");

        const response = await axios.post("/admin/date2", viewDate);

        setTotalWork(response.data.totalWorkingDays);
        // console.log(viewDate.month);
        requestResultList();
        const resp = await axios.post(`/attendance/view/${member.memberNo}`, viewDate);

        setReasonList(resp.data);

        requestOutingList();

    }, [viewDate, member]);


    const setView = useCallback((target) => {
        setViewReason(target);
        const year = target.getFullYear().toString();
        const month = (target.getMonth() + 1).toString().padStart(2, '0');
        setViewDate(({
            year: year,
            month: month,
        }))
    }, []);

    const requestOutingList = useCallback(async () => {
        const resp = await axios.post(`/outing/list/${member.memberNo}`, viewDate);
        //console.log(resp);
        setOutingList(resp.data);
    }, [viewDate])

    const deleteOuting = useCallback(async (target) => {
        // console.log(target);
        const resp = await axios.delete(`/outing/${target}`)

        // if(resp === true){
        // }
        requestReasonList();
    }, [])

    const inTimeModal = useRef();
    const outTimeModal = useRef();
    const inTime = useCallback(async () => {
        const resp = await axios.post("/attendance/inTime");
        console.log(resp);
        openInTimeModal();
    }, [])
    const outTime = useCallback(async () => {
        const resp = await axios.post("/attendance/outTime");
        console.log(resp);
        openOutTimeModal();
    }, [])

    const openInTimeModal = useCallback(() => {
        const target = Modal.getOrCreateInstance(inTimeModal.current);
        target.show();
    }, [])

    const openOutTimeModal = useCallback(() => {
        const target = Modal.getOrCreateInstance(outTimeModal.current);
        target.show();
    }, [])

    const closeInTimeModal = useCallback(() => {
        const target = Modal.getInstance(inTimeModal.current);
        target.hide();
    }, [])
    const closeOutTimeModal = useCallback(() => {
        const target = Modal.getInstance(outTimeModal.current);
        target.hide();
    }, [outTimeModal])



    const attendanceRate = useMemo(() => {
        if (totalWork === 0) return 0;
        const rate = ((status.realWorkDays - status.absentCount) / totalWork) * 100;
        return parseFloat(rate.toFixed(2));
    }, [totalWork, status]);

    function formatTime(isoString) {
        const date = new Date(isoString);
        return (
            String(date.getHours()).padStart(2, '0') + ':' +
            String(date.getMinutes()).padStart(2, '0') + ':' +
            String(date.getSeconds()).padStart(2, '0')
        );
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////

    const checkContact = useCallback(() => {
        const regex = /^010[0-9]{8}$/;
        const isValid = regex.test(member.memberContact);

        setContactValid(isValid);
    }, [member]);

    const checkEmail = useCallback(() => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = regex.test(member.memberEmail);
        setEmailValid(isValid);
    }, [member]);

    const checkAddress = useCallback(() => {
        //  console.log(member.memberPost);
        const isValid = member.memberPost?.length > 0 &&
            member.memberAddress1?.length > 0 &&
            member.memberAddress2?.length > 0;
        setAddressValid(isValid);
        //     console.log("setAddressValid check = " + isValid);
    }, [member])

    const changeMember = useCallback((e) => {
        setMember(prev => ({
            ...prev,
            [e.target.name]: e.target.value,
        }))
    }, [member]);

    const changeAddress = useCallback((post, address1) => {
        setMember(prev => ({
            ...prev,
            memberPost: post,
            memberAddress1: address1
        }))
    }, [member])

    {/* 이미지 띄우기 */ }
    const [preview, setPreview] = useState({
        attachmentNo: "", url: "",
    });


    const postModal = useRef();
    const postAPI = useCallback(() => {
        postModal.current.click();
    }, [])

    {/* 이미지 띄우기 */ }
    const loadOne = useCallback(async () => {
        const resp = await axios.get("/mypage/");
        setMember(resp.data.memberDto);
        // console.log("resp");
        // console.log(resp.data.attachmentNo);
        if (resp.data.attachmentNo !== -1) {
            try {
                // 이미지 blob으로 가져오기
                const imageResp = await axios.get(`/mypage/attachment/${resp.data.attachmentNo}`, {
                    responseType: "blob",
                });

                const imageBlob = imageResp.data;
                const imageUrl = URL.createObjectURL(imageBlob);

                setPreview({
                    attachmentNo: resp.data.attachmentNo,
                    url: imageUrl,
                });
                setMemberImg({
                    attachmentNo: resp.data.attachmentNo,
                    url: imageUrl,
                })
            } catch (error) {
                console.error("이미지 가져오기 실패:", error);
            }
        } else {
            setPreview({ attachmentNo: "", url: "" });
            setMemberImg({ attachmentNo: "", url: "" });
        }
    }, []);

    const pwEdit = useRef();
    const infoEdit = useRef();

    const [memberInfo, setMemberInfo] = useState({
        memberContact: "", memberEmail: "", memberPost: "", memberAddress1: "", memberAddress2: "",
        memberBank: "", memberBankNo: "",
    })

    const openChangeInfo = useCallback(() => {
        const target = Modal.getOrCreateInstance(infoEdit.current);
        target.show();
    }, []);
    const closeChangeInfo = useCallback(() => {
        const target = Modal.getInstance(infoEdit.current);
        target.hide();
        // setMemberInfo("");
        loadOne();
    }, []);

    const openChangePw = useCallback(() => {
        const target = Modal.getOrCreateInstance(pwEdit.current);
        target.show();
    }, []);
    const closeChangePw = useCallback(() => {
        const target = Modal.getInstance(pwEdit.current);
        target.hide();
        setMemberPw("");
        setPwCheck("");
    }, [])

    const [memberPw, setMemberPw] = useState("");
    const [pwCheck, setPwCheck] = useState("");
    const [memberPwValid, setMemberPwValid] = useState(false);
    const [pwCheckValid, setPwCheckValid] = useState(false);

    const changeNewPw = useCallback((e) => {
        setMemberPw(e.target.value);
    }, []);
    const changePwCheck = useCallback((e) => {
        setPwCheck(e.target.value);
    }, []);
    const checkMemberPw = useCallback(() => {
        const isValid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,16}$/.test(memberPw);
        setMemberPwValid(isValid);
    }, [memberPw])
    const checkPwCheck = useCallback(() => {
        const isValid = memberPw === pwCheck;
        setPwCheckValid(isValid);
        if (memberPw === null) {
            setPwCheckValid(false);
        }
    }, [pwCheck, memberPw])

    const changePw = useCallback(async () => {
        const resp = await axios.post("/mypage/changePw", { memberPw });
        if (resp.data === true) {
            closeChangePw();
        }
    }, [memberPw, memberPwValid, pwCheckValid]);

    const [checkNewAttach, setCheckNewAttach] = useState(false);

    const blockPwButton = useMemo(() => {
        return memberPwValid === true && pwCheckValid === true;
    }, [memberPwValid, pwCheckValid])

    const changeProfile = useCallback((e) => {
        const file = e.target.files[0];
        if (!file) return;
        setNewAttach(file);
        const url = URL.createObjectURL(file);
        // console.log(file.name);
        // console.log(file.type);
        // console.log(file.size);
        setPreview({
            url: url
        })
        setCheckNewAttach(true);
    }, [])

    const changeInfo = useCallback(async () => {
        console.log(member);

        try {
            console.log("try");
            // 1. 이미지가 바뀐 경우 + newAttach가 있는 경우
            if (checkNewAttach === true) {
                console.log("ifif")
                const formData = new FormData();
                formData.append("newAttach", inputImage.current.files[0]);

                // 프로필 이미지 변경 요청
                await axios.post("/mypage/profile", formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });

                // 프로필 이미지 변경 이벤트 발생
                window.dispatchEvent(new Event("profileImageUpdated"));
            }
            console.log("afterTry");
            // 2. 회원 정보 변경 요청

            const resp = await axios.patch("/mypage/edit", member);

            closeChangeInfo();

        } catch (error) {
            console.error("정보 변경 실패", error);
            alert("정보 변경 중 오류가 발생했습니다.");
        }
    }, [memberImg, preview, newAttach, member, emailValid, contactValid, addressValid]);

    const blockButton = useMemo(() => {
        return addressValid === true && contactValid === true && emailValid === true;
    }, [emailValid, contactValid, addressValid]);

    // useEffect(()=>{console.log(memberPw)},[memberPw])
    // useEffect(()=>{console.log(pwCheck)},[pwCheck])

    const addOrUpdateProfile = useCallback(() => {
        inputImage.current.click();

    }, []);

    const zoomProfile = useCallback(() => {
        const target = Modal.getOrCreateInstance(zoomModal.current);
        target.show();
    }, [])

    // useEffect(()=>{
    //   console.log("preview");
    //   console.log(preview.attachmentNo);
    //   console.log(preview.url);

    // },[preview])

    return (<>
        <div className="d-flex gap-4 mt-4">

            {/* 사원 정보 카드 */}
            <div className="card shadow-sm p-4 w-100" style={{ maxWidth: '1800px', minHeight: '375px' }}>
                <div className="d-flex justify-content-between align-items-start flex-wrap gap-4">
                    {/* 좌측: 프로필 + 전체 정보 */}
                    <div className="d-flex gap-4 flex-wrap">
                        <img
                            src={preview.url ? memberImg.url : userImg}
                            alt="사용자 사진"
                            onClick={zoomProfile}
                            className="rounded"
                            style={{ width: '120px', height: '120px', objectFit: 'cover', cursor: 'pointer' }}
                        />

                        <div>
                            <h5 className="mb-1">
                                {member.memberName}
                                <small className="text-muted ms-2" style={{ fontSize: "0.9rem" }}>
                                    {member.memberRank}
                                </small>
                            </h5>

                            <ul className="list-unstyled mb-0 small text-muted">
                                <li><strong className="text-dark me-3">사번</strong>{member.memberNo}</li>
                                <li><strong className="text-dark me-3">부서</strong>{member.memberDepartment}</li>
                                <li><strong className="text-dark me-3">아이디</strong>{member.memberId}</li>
                                <li><strong className="text-dark me-3">이메일</strong>{member.memberEmail}</li>
                                <li><strong className="text-dark me-3">연락처</strong>{member.memberContact}</li>
                                <li><strong className="text-dark me-3">주소</strong>{member.memberPost} {member.memberAddress1} {member.memberAddress2}</li>
                                <li><strong className="text-dark me-3">계좌</strong>{member.memberBank} / {member.memberBankNo}</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

        </div >

        {/* 월 선택 + 출석률 카드 */}
        <div className="row mt-4">
            <div className="col-md-6 d-flex align-items-center">
                <h5 className="fw-bold">
                    {viewDate.year}년 {viewDate.month}월 출석 현황
                </h5>
                <span className="fs-6 ms-3">출석률 : {attendanceRate}%</span>
            </div>
            <div className="col-md-6 text-end">

            </div>
        </div>

        {/* 출석 통계 요약 카드 */}
        <div className="card shadow-sm mt-3">
            <div className="card-body">
                <div className="row text-center text-responsive fw-semibold">
                    <div className="col">근무일<br /><span className="text-primary">{totalWork}일</span></div>
                    <div className="col">실 근무일<br /><span className="text-success">{status.realWorkDays}일</span></div>
                    <div className="col">결석<br /><span className="text-danger">{totalWork - status.realWorkDays}회</span></div>
                    <div className="col">지각<br /><span className="text-warning">{status.lateCount}회</span></div>
                    <div className="col">조퇴<br /><span className="text-warning">{status.earlyCount}회</span></div>
                    <div className="col">외출<br /><span className="text-info">{status.outingDays}회</span></div>
                    <div className="col">사유<br /><span className="text-secondary">{status.reasonDays}건</span></div>
                </div>
            </div>
        </div>

        <div className="d-flex ms-auto mt-4">
            <button className="btn btn-success" onClick={inTime}>출근</button>
            <button className="btn btn-danger ms-2" onClick={outTime}>퇴근</button>

        </div>

        <div className="modal fade" tabIndex="-1" role="dialog" ref={inTimeModal} data-bs-backdrop="static">
            <div className="modal-dialog " role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <h2>알림</h2>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"  >
                        </button>
                    </div>
                    <div className="modal-body text-center" >
                        <h2 className="mb-2">출근 완료</h2>
                    </div>
                    <div className="modal-footer">
                        <button onClick={closeInTimeModal} className="btn btn-success"> 닫기</button>
                    </div>
                </div>
            </div>
        </div>

        <div className="modal fade" tabIndex="-1" role="dialog" ref={outTimeModal} data-bs-backdrop="static">
            <div className="modal-dialog " role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <h2>알림</h2>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"  >
                        </button>
                    </div>
                    <div className="modal-body text-center">
                        <h2 className="mb-2">퇴근 완료</h2>
                    </div>
                    <div className="modal-footer">
                        <button onClick={closeOutTimeModal} className="btn btn-primary"> 닫기</button>
                    </div>
                </div>
            </div>
        </div>

    </>)
}