import { useParams } from "react-router";
import Jumbotron from "../template/Jumbotron";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import { FaMagnifyingGlass, FaPlus, FaTrash } from "react-icons/fa6";
import { Modal } from "bootstrap";
import { MdModeEdit } from "react-icons/md";

export default function AdminAttendanceDetail(){

    const {memberNo} = useParams();
    const [memberName, setMemberName] = useState("");
    const [selectYear, setSelectYear] = useState("");
    const [selectMonth, setSelectMonth] = useState("");
    const [selectDay, setSelectDay] = useState("");
     const [date, setDate] = useState({
        year:"", month:"", day:"",
    })
    const [attendanceLog, setAttendanceLog] = useState([]);
    const [selectedTime, setSelectedTime] = useState({start:"", end:""})
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [attendanceReason, setAttendanceReason] = useState({
      attendanceReasonState:"",
      attendanceReasonContent:"",
      attendanceReasonDate:"",   
      attendanceReasonStart:"",
      attendanceReasonEnd:"",
    })


    const [file, setFile] = useState("");
  
    const [result, setResult] = useState({});

    useEffect(()=>{
   //     const today = new Date;
        getMemberName();
   
    },[])

    const fileRef = useRef();
    const logModal = useRef();
    const openAttendanceLog = useCallback(()=>{
        const target = Modal.getOrCreateInstance(logModal.current);
        target.show();
    },[])
    const closeAttendanceLog = useCallback(()=>{
      const target = Modal.getInstance(logModal.current);
      
      setAddDate(null);
      setStartTime(null);
      setEndTime(null);
      setAttendanceReason({
        attendanceReasonState:"",
      attendanceReasonContent:"",
      attendanceReasonDate:"",   
      attendanceReasonStart:"",
      attendanceReasonEnd:"",
      });
      if (fileRef.current) fileRef.current.value = "";
      setFile(null);
      target.hide();
    },[logModal, attendanceLog])


   


    const getMemberName = useCallback(async()=>{
        const resp = await axios.get(`/attendance/${memberNo}`);
        setMemberName(resp.data);
    },[])

    

    const [selectDate, setSelectDate] = useState("");
    const setLoadLog = useCallback((target)=>{
        console.log("yes");
        
        setDate({
             year:target.getFullYear(), month:target.getMonth() + 1, day:target.getDate(),
        })
         setSelectDate(target);
       
    },[])
      const [viewReason, setViewReason] = useState("");
      const [viewDate, setViewDate] = useState({});

      const setView = useCallback((target)=>{
        setViewReason(target);
        const year = target.getFullYear().toString();
        const month = (target.getMonth() + 1).toString().padStart(2,'0');
        setViewDate(({
          year: year,
          month: month,
        }))
      },[]);
      
      useEffect(()=>{
        // console.log("viewDate");
        // console.log(viewDate);
      },[viewDate])


      const [reasonList, setReasonList] = useState([]);

      const requestReasonList = useCallback(async()=>{
        // console.log("viewivwievwiei");
        // console.log(viewDate);
        const resp = await axios.post(`/attendance/view/${memberNo}`, viewDate);
        
        // console.log("resp");
        setReasonList(resp.data);
      },[viewDate]);

      useEffect(()=>{
        console.log("reasonLISTLISTLISTLIST");
        console.log(reasonList)},[reasonList])

      // useEffect(()=>{
      //   console.log("viewviwevicwiv wiewie");
      //   console.log(viewResult);
      // },[viewResult])

      
      const [addDate, setAddDate] = useState("");
    const setAdd = useCallback((target)=>{
        setAddDate(target);
        const year = target.getFullYear();
        const month = target.getMonth().toString().padStart(2,'0');
        const date = target.getDate().toString().padStart(2,'0');
        const dateOnly = year + "-" + month + "-" + date;
          setAttendanceReason(prev => ({
          ...prev,
          attendanceReasonDate: dateOnly
        }));
    },[])
    // useEffect(()=>{},[])
    const setStart = useCallback((target)=>{
        setStartTime(target);
        
        const hours = target.getHours().toString().padStart(2,'0');
        const mins = target.getMinutes().toString().padStart(2,'0');
                
        const timeOnly = hours + ":" + mins + ":00";
        setAttendanceReason(prev => ({
          ...prev,
          attendanceReasonStart: timeOnly
        }));
    },[])
   
    const setEnd = useCallback((target)=>{
        setEndTime(target);
           
        const hours = target.getHours().toString().padStart(2,'0');
        const mins = target.getMinutes().toString().padStart(2,'0');
                
        const timeOnly = hours + ":" + mins + ":00";
        setAttendanceReason(prev => ({
          ...prev,
          attendanceReasonEnd: timeOnly
        }));
    },[])
    

    
    const saveAttach = useCallback((e)=>{
      //console.log(e.target.files[0]);
      setFile(e.target.files[0]);
    },[])
  

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    const changeReason = useCallback((e)=>{
      setAttendanceReason((prev)=>({
        ...prev,
        [e.target.name] : e.target.value
      }))
    },[])

    // useEffect(()=>{
    //   console.log(attendanceReason);
    // },[attendanceReason])
  

   

    const addReason = useCallback(async ()=>{
      // console.log("asyshnasyasn");
      // console.log(attendanceReason);
      const formData = new FormData;
      formData.append("file", file);
      formData.append("reason", new Blob([JSON.stringify(attendanceReason)], { type: "application/json" }));

      const resp = await axios.post(`/attendance/reason/${memberNo}` , formData );

      closeAttendanceLog();
      
    },[attendanceReason, file])


    const requestLog = useCallback(async ()=>{
        const resp = await axios.post(`/attendance/${memberNo}`, date)
        console.log(resp);
        setAttendanceLog(resp.data);

        const response = await axios.post(`/attendance/result/${memberNo}`, date);
        setResult(response.data);

    },[date]);

   

    // useEffect(()=>{
    //     console.log("L:OGLOGLOG");
    //     console.log(attendanceLog)},[attendanceLog])

      function formatTime(isoString) {
        const date = new Date(isoString);
        return (
          String(date.getHours()).padStart(2, '0') + ':' +
          String(date.getMinutes()).padStart(2, '0') + ':' +
            String(date.getSeconds()).padStart(2, '0')
        );
      }

      const sendStatus = useMemo(()=>{
        return attendanceReason.attendanceReasonContent &&
              attendanceReason.attendanceReasonState &&
              attendanceReason.attendanceReasonDate &&
              attendanceReason.attendanceReasonStart &&
              attendanceReason.attendanceReasonEnd &&
              file
      },[attendanceReason, file ])

      const sayDelete = useCallback(async(target)=>{
        console.log("delete");

        const resp = await axios.delete(`/attendance/reason/${target}`);
        console.log("resp");
        console.log(resp);


      },[])
      const sayEdit = useCallback(()=>{
        console.log("edit");
      },[])

    return (<>
        <Jumbotron subject={`${memberName} 님의 긑내기록 ${selectYear}년 ${selectMonth}` }/>
        
          
        <div className="row mt-4">
            <div className="col d-flex">

            <div className=" ms-auto">
                <div className="d-flex">
               
                 <DatePicker
                    className="form-control"
                    selected={selectDate} 
                    timeIntervals={30}
                    placeholderText={"날짜를 선택해주세요"} 
                    onChange={setLoadLog}
                    dateFormat={"yyyy-MM-dd"} 
                    popperPlacement="top-start"
                    />
                <button className="btn btn-light" onClick={requestLog}><FaMagnifyingGlass/></button>
                    </div>
            </div>
                     <button className="btn btn-primary" onClick={openAttendanceLog}><FaPlus/></button>
                    </div>
        </div>
        <div className="row mt-4">
            <div className="col">
               {result &&
                    (
    <div className="card mt-3 p-3">
    <div className="d-flex flex-wrap gap-3 align-items-center">
      <div> <strong>날짜:</strong> {result.attendanceResultDay}</div>

      {result.attendanceResultInTime && (
        <div> <strong>출근:</strong> {formatTime(result.attendanceResultInTime)}</div>
      )}

      {result.attendanceResultOutTime && (
        <div> <strong>퇴근:</strong> {formatTime(result.attendanceResultOutTime)}</div>
      )}

      {result.attendanceResultWorkTime > 0 && (
        <div> <strong>근무:</strong> {result.attendanceResultWorkTime}분</div>
      )}

      {result.attendanceResultLateMinute > 0 && (
        <div className=""> <strong>지각:</strong> {result.attendanceResultLateMinute}분</div>
      )}

      {result.attendanceResultEarlyLeave > 0 && (
        <div > <strong>조퇴:</strong> {result.attendanceResultEarlyLeave}분</div>
      )}

      {result.attendanceResultState && (
        <div> <strong>상태:</strong> {result.attendanceResultState}</div>
      )}
    </div>
  </div>
                    )}
            </div>
        </div>

        <div className="">
      <ul className="list-group mt-3">
  {attendanceLog.length > 0 ? (
    attendanceLog.map(function(log) {
      return (
        <li key={log.attendanceLogNo} className="list-group-item d-flex justify-content-between align-items-center">
          <div>
            {/* <strong>{formatDate(log.attendanceLogDay)}</strong><br /> */}
            {/* <strong>{log.attendanceLogDay}</strong><br /> */}
            {log.attendanceLogInTime && (
              <span>출근: {formatTime(log.attendanceLogInTime)}<br /></span>
            )}
            {log.attendanceLogOutTime && (
              <span>퇴근: {formatTime(log.attendanceLogOutTime)}</span>
            )}
            {!log.attendanceLogInTime && !log.attendanceLogOutTime && (
              <span>출근, 퇴근 기록이 없습니다.</span>
            )}
          </div>
          {/* <span className="badge bg-primary rounded-pill">일반</span> */}
        </li>
      );
    })
  ) : (
    <li className="list-group-item text-muted">근태 기록이 없습니다.</li>
  )}
</ul>
        </div>

      <hr className="mt-4 mb-4" />
      <div className="row">
        <div className="col text-end">
            <DatePicker
            selected={viewReason}
            onChange={setView}
          
            // onChange={date => setSelectedDate(date)}
            dateFormat="yyyy-MM"        // 출력 형식: 2025-05
            showMonthYearPicker         // 월/연도 선택 모드
            showFullMonthYearPicker     // (선택 사항) 전체 연도와 월 보기
            className="form-control"
            placeholderText="연도와 월을 선택하세요"
          />
        <button className="btn btn-light" onClick={requestReasonList}><FaMagnifyingGlass/></button>
        </div>
      </div>

      <div className="row mt-2">
        <div className="col">
          <table className="table table-striped table-hover table-bordered">
  <thead>
    <tr>
      <th>날짜</th>
      <th>시작 시간</th>
      <th>종료 시간</th>
      <th>사유</th>
      <th>상태</th>
      <th>관리</th>
    </tr>
  </thead>
  <tbody>
    {reasonList.map((item) => (
      <tr key={item.attendanceReasonNo}>
        <td>{item.attendanceReasonDate}</td>
        <td>{item.attendanceReasonStart}</td>
        <td>{item.attendanceReasonEnd}</td>
        <td>{item.attendanceReasonContent}</td>
        <td>{item.attendanceReasonState}</td>
        <td><FaTrash className="text-danger" style={{ cursor: "pointer" }} onClick={(e)=>sayDelete(item.attendanceReasonNo)}/>
        <MdModeEdit className="ms-1" style={{ cursor: "pointer" }} onClick={sayEdit}/></td>
      </tr>
    ))}
  </tbody>
</table>
        </div>
      </div>



     <div className="modal fade" tabIndex="-1" role="dialog" ref={logModal} data-bs-backdrop="static">
                    <div className="modal-dialog modal-lg" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                        <strong>{memberName} 근태 등록</strong>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" >
                        </button>
                        </div>
                        <div className="modal-body">
                            <div className="row">
                                <label className="col-sm-3 col-label-form" > 날짜 선택</label>
                                <div className="col-sm-9">
                                    <DatePicker
                                    className="form-control"
                                        selected={addDate} 
                                        timeIntervals={30}
                                        placeholderText={"날짜를 선택해주세요"} 
                                        onChange={setAdd}
                                        dateFormat={"yyyy-MM-dd"} 
                                        popperPlacement="top-start"
                                    />
                                </div>
                            </div>
                            <div className="row mt-2">
                                <label className="col-sm-3 col-label-form" >시간</label>
                                <div className="col-sm-9 d-flex">
                                     <DatePicker
                                        selected={startTime}
                                        className="form-control"
                                        onChange={setStart}
                                        showTimeSelect   // ⏰ 시간 선택 활성화
                                         showTimeSelectOnly  
                                          timeIntervals={10}   
                                          dateFormat="HH:mm"
                                        />

                                        <span>~</span>
                                     <DatePicker
                                        selected={endTime}
                                        className="form-control"
                                         onChange={setEnd}
                                        showTimeSelect   // ⏰ 시간 선택 활성화
                                        dateFormat="HH:mm"
                                         showTimeSelectOnly  
                                          timeIntervals={10}   
                                        />
                                </div>
                            </div>

                            <div className="row mt-2">
                                <label className="col-sm-3 col-label-form" >사유</label>
                                <div className="col-sm-9 d-flex">
                                    {/* <input type="textarea" className="form-control"></input> */}
                                    <textarea className="form-control" name="attendanceReasonContent" onChange={changeReason} value={attendanceReason.attendanceReasonContent}></textarea>
                                </div>
                            </div>

                            <div className="row mt-2">
                                <label className="col-sm-3 col-label-form" >결과</label>
                                <div className="col-sm-9 d-flex">
                                    <input type="text" className="form-control" name="attendanceReasonState"
                                     onChange={changeReason} value={attendanceReason.attendanceReasonState}></input>
                                </div>
                            </div>
                            <div className="row mt-4">
                            
                                <div className="col"> 
                                  
                                
                                    <input type="file" className="form-control" accept=".png,.jpg,.jpeg,.pdf" ref={fileRef}
                                    onChange={saveAttach} style={{display:"block"}}/>
                             
                                </div>
                                </div>
                          
                        </div>
                        <div className="modal-footer">
                        <div className="d-flex justify-content-between">
                            <button className="btn btn-success" onClick={addReason} disabled={!sendStatus}>저장하기</button>
                            {/* <button type="button" className="btn btn-danger me-auto" onClick={sendMemberNo}>예</button>
                            <button type="button" className="btn btn-light ms-auto" onClick={closeModal}>아니오</button> */}
                        </div>
                        
                        </div>
                    </div>
                    </div>
                </div> 
    </>)
}