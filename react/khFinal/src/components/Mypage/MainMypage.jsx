import { useRecoilValue } from "recoil"
import { userNoState } from "../utils/stroage"
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import axios from "axios";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Jumbotron from "../template/Jumbotron";
import userImg from '/public/images/profile_basic.png';
import { Modal } from "bootstrap";
import Postcode from "../template/Postcode";
import { FaMagnifyingGlassPlus } from "react-icons/fa6";
import DatePicker from "react-datepicker";

export default function MainMypage(){
    // const userNo = useRecoilValue(userNoState);
    const [member,setMember] = useState({
        memberNo:"", memberId:"", memberDepartment:"", memberName:"", memberContact:"", memberEmail:"",
        memberPost:"", memberAddress1:"", memberAddress2:"", memberRank:"", memberBank:"", memberBankNo:"", 
    })    
    

    const [memberImg, setMemberImg] = useState({attachmentNo:"", url:""})
    
    const [totalWork, setTotalWork] = useState("");
    const [viewDate,setViewDate] = useState("");
    const [resultList, setResultList] = useState([]);
    const [reasonList, setReasonList] = useState([]);
    const [status, setStatus] = useState({
      absentCount : "",
      earlyCount : "",
      lateCount : "", 
      outingDays : "",
      realWorkDays : "",
      reasonDays : "",
    })
    
    useEffect(()=>{loadOne()},[]);
    useEffect(()=>{
        const now = new Date();
        console.log(member);
        setViewDate({
           year: now.getFullYear().toString(),
          month: (now.getMonth() + 1).toString().padStart(2, "0")
        })  
    },[member])

    useEffect(() => {
      console.log(viewDate);
      if (viewDate.year && viewDate.month ) {
        requestReasonList();
        requestStatus();
      }
    }, [viewDate]); 

     const requestStatus = useCallback(async()=>{
      const memberNo = member.memberNo;
    
      if(!memberNo) return;
      const resp = await axios.post(`/attendance/status/${member.memberNo}`, viewDate);
      setStatus(resp.data);

    },[viewDate, member])


      const requestResultList = useCallback(async()=>{
        const requestResp = await axios.post(`/attendance/resultlist/${member.memberNo}`, viewDate);
        setResultList(requestResp.data.attendanceResultList);
      },[viewDate, member]);

      const requestReasonList = useCallback(async()=>{
       //  console.log("requestReasonList");

          const response = await axios.post("/admin/date2", viewDate);
         
          setTotalWork(response.data.totalWorkingDays);
       // console.log(viewDate.month);
       requestResultList();
        const resp = await axios.post(`/attendance/view/${member.memberNo}`, viewDate);
        
        setReasonList(resp.data);

      },[viewDate, member]);

       

      
    const attendanceRate = useMemo(() => {
        console.log(totalWork);
    if (totalWork === 0) return 0; 
    const rate = ((status.realWorkDays - status.absentCount) / totalWork) * 100;
    return parseFloat(rate.toFixed(2)); 
     }, [totalWork, status]);

    
      {/* 이미지 띄우기 */}
    const [preview, setPreview] = useState({
      attachmentNo:"", url:"",
    });


     {/* 이미지 띄우기 */}
    const loadOne = useCallback(async()=>{
        const resp = await axios.get("/mypage/");
        setMember(resp.data.memberDto);
        if (resp.data.attachmentNo !== -1) {
            try {
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
            setPreview({attachmentNo:"",url:""});
            setMemberImg({attachmentNo:"",url:""});
          }
    },[]);

    
    //false 일때는 출근전 
    const [attendance, setAttendance] = useState(false);


        useEffect(()=>{
            console.log("attendance");
            console.log(attendance);
        },[attendance])


      const inTime = useCallback(async ()=>{
        const resp = await axios.post("/attendance/inTime");
        console.log(resp);
        setAttendance(false);
    },[])
    const outTime = useCallback(async ()=>{
        const resp = await axios.post("/attendance/outTime");
       // console.log(resp);
        setAttendance(true);
    },[])

    const attendanceBtn = useMemo(()=>{
        return attendance;
    },[attendance])

    return (<>

    {attendanceBtn ? (
        <button className="btn btn-success"  onClick={outTime}>퇴근</button>
    ):(
        <button className="btn btn-danger" onClick={inTime}>출근</button>
    )}



 <div className="d-flex gap-4 mt-4">

  {/* 📄 사원 정보 카드 */}
  <div className="card shadow-sm p-4 w-100" style={{ maxWidth: '1800px', flex: 1 }}>
    <div className="d-flex flex-wrap flex-row align-items-start gap-4">
      {preview.url ? (
          <img 
            src={memberImg.url}
            alt="사용자 사진"
            className="rounded"
            style={{ width: '120px', height: '120px', objectFit: 'cover', cursor: 'pointer' }}
            />
          ):(
            <img 
            src={userImg}
            alt="사용자 사진"
            className="rounded"
            style={{ width: '120px', height: '120px', objectFit: 'cover', cursor: 'pointer' }}
            />
          )}
      

      <div className="">
        <h4 className="mb-1">{member.memberName}</h4>
        <span className="text-muted mb-1">{member.memberDepartment} | {member.memberRank}</span> <br/>
        <span className="text-muted">사원번호: {member.memberNo}</span><br/>
      </div>
    </div>

    <hr className="my-4" />

    <div className="row">
      <div className="col-md-6">
        <span ><strong>아이디:</strong> {member.memberId}</span> <br/>
        <span ><strong>연락처:</strong> {member.memberContact}</span><br/>
        <span ><strong>이메일:</strong> {member.memberEmail}</span><br/>
        <hr></hr>
        <strong>{viewDate.year} 년 {viewDate.month}월 출석률{attendanceRate}%</strong>
        <table className="table table-striped table-hover table-bordered mt-4">

         <thead>
      <tr>
        <th>근무일</th>
        <th>실 근무일</th>
        <th>결석</th>
        <th>지각</th>
        <th>조퇴</th>
        <th>외출</th>
        <th>사유</th>
      </tr>

  </thead>
  <tbody>
    <tr>
      <th>{totalWork}일</th>
      <th>{status.realWorkDays}일</th>
      <th>{totalWork - status.realWorkDays}번</th>
      <th>{status.lateCount}번</th>
      <th>{status.earlyCount}번</th>
      <th>{status.outingDays}번</th>
      <th>{status.reasonDays}개</th>
    </tr>
  </tbody>

  </table>


  
    </div>
    </div>
    </div>
    </div>





  

    </>)
}