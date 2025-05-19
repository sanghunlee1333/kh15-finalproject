import { Link, useParams } from "react-router";
import Jumbotron from "../template/Jumbotron";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import { FaFile, FaMagnifyingGlass, FaPlug, FaPlus, FaTrash } from "react-icons/fa6";
import { Modal } from "bootstrap";
import * as pdfjsLib from 'pdfjs-dist';
import { GlobalWorkerOptions } from 'pdfjs-dist/build/pdf';
import workerSrc from 'pdfjs-dist/build/pdf.worker?url';
import { FaTrashAlt } from "react-icons/fa";

GlobalWorkerOptions.workerSrc = workerSrc;

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
    const [previewUrl, setPreviewUrl] = useState("")
    const [attachment, setAttachment] = useState({})

    const [file, setFile] = useState("");
  
    const [result, setResult] = useState({});
     const [reasonList, setReasonList] = useState([]);
      const [totalWork, setTotalWork] = useState("");
      const [resultList, setResultList] = useState([]);
       const [startOuting, setStartOuting] = useState("");
    const [endOuting, setEndOuting] = useState("");
    const [outing, setOuting] = useState({
      outingReason:"", outingStart:"", outingEnd:"", outingDay:""
    })
     const [outingDay, setOutingDay] = useState("");
    const [outingList, setOutingList] = useState([]);
const [viewReason, setViewReason] = useState("");
      const [viewDate, setViewDate] = useState({});


    useEffect(()=>{
   //     const today = new Date;
        getMemberName();
        const now = new Date();

        setDate({
          year: now.getFullYear().toString(),
          month: (now.getMonth() + 1).toString().padStart(2, "0"),
          day: now.getDate().toString().padStart(2, "0"),
        });
        setViewDate({
           year: now.getFullYear().toString(),
          month: (now.getMonth() + 1).toString().padStart(2, "0")
        })

        
    },[])

    useEffect(() => {
      if (date.year && date.month && date.day) {
        requestLog();
      }
    }, [date]); 
    useEffect(() => {
      if (viewDate.year && viewDate.month ) {
        requestReasonList();
        requestStatus();
      }
    }, [viewDate]); 

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

    const [status, setStatus] = useState({
      absentCount : "",
      earlyCount : "",
      lateCount : "", 
      outingDays : "",
      realWorkDays : "",
      reasonDays : "",
    })

    const requestStatus = useCallback(async()=>{
      const resp = await axios.post(`/attendance/status/${memberNo}`, viewDate);

      setStatus(resp.data);

    },[viewDate])
   


    const getMemberName = useCallback(async()=>{
        const resp = await axios.get(`/attendance/${memberNo}`);
        setMemberName(resp.data);
    },[])

    

    const [selectDate, setSelectDate] = useState("");
    const setLoadLog = useCallback((target)=>{
        //console.log("yes");
        
        setDate({
             year:target.getFullYear(), month:target.getMonth() + 1, day:target.getDate(),
        })
         setSelectDate(target);
       
    },[])
      

      const setView = useCallback((target)=>{
        setViewReason(target);
        const year = target.getFullYear().toString();
        const month = (target.getMonth() + 1).toString().padStart(2,'0');
        setViewDate(({
          year: year,
          month: month,
        }))
      },[]);
      
       const requestResultList = useCallback(async()=>{
        const requestResp = await axios.post(`/attendance/resultlist/${memberNo}`, viewDate);
        //console.log(viewDate);
        //console.log(requestResp);
        setResultList(requestResp.data.attendanceResultList);
      },[viewDate]);

  

     
      const requestReasonList = useCallback(async()=>{
      

          const response = await axios.post("/admin/date2", viewDate);
         
          setTotalWork(response.data.totalWorkingDays);
       // console.log(viewDate.month);
        const resp = await axios.post(`/attendance/view/${memberNo}`, viewDate);
        
         requestResultList();
        setReasonList(resp.data);
        
        requestOutingList();

      },[viewDate]);
      // useEffect(()=>{
      //   console.log("reasonlist");
      //   console.log(reasonList);
      // },[reasonList]) 
    

      
      const [addDate, setAddDate] = useState("");
    const setAdd = useCallback((target)=>{
        setAddDate(target);
        const year = target.getFullYear();
        const month = (target.getMonth() + 1).toString().padStart(2,'0');
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
      requestReasonList();
    },[attendanceReason, file])


    const requestLog = useCallback(async ()=>{
        const resp = await axios.post(`/attendance/${memberNo}`, date)
       // console.log(resp);
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
   //     console.log("delete");

        const resp = await axios.delete(`/attendance/reason/${target}`);
        // console.log("resp");
        // console.log(resp);
        requestReasonList();

      },[])

      const pdfImageUrl = async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1.5 });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        // canvas.style.width = "80px";
        // canvas.style.height = "80px";

        await page.render({ canvasContext: context, viewport }).promise;

        return canvas.toDataURL(); // base64로 
      };

      const loadAttach = useCallback(async (target) => {
        try {
          const imageResp = await axios.get(`/attendance/attachment/${target}`, {
            responseType: "blob",
          });

          const imageBlob = imageResp.data;
          let imageUrl = "";

          if (imageBlob.type === "application/pdf") {
            imageUrl = await pdfImageUrl(imageBlob); // PDF → Canvas → base64
          } else if (imageBlob.type.startsWith("image/")) {
            imageUrl = URL.createObjectURL(imageBlob); // 이미지 파일 → blob URL
          } else {
            console.warn("알 수 없는 파일 타입:", imageBlob.type);
          }

          setPreviewUrl(imageUrl);

          
          const attachResp = await axios.get(`/attendance/attachmentNo/${target}`);
          setAttachment(attachResp.data);
        } catch (error) {
          console.error("파일 로드 실패", error);
        }
      }, []);

      // useEffect(()=>{
      //   console.log("attachment");
      //   console.log(attachment);
      // },[attachment])
 

      const zoomImg = useRef();
      const openZoom = useCallback((target)=>{
     //   console.log("edit");
       loadAttach(target);
        const mod = Modal.getOrCreateInstance(zoomImg.current);
        mod.show();
      },[zoomImg])
      const closeZoom = useCallback(()=>{
        const mod = Modal.getInstance(zoomImg.current);
        mod.hide();
      },[zoomImg])

      const outingModal = useRef();
      const openOutingModal = useCallback(async ()=>{
        const target = Modal.getOrCreateInstance(outingModal.current)
        target.show();
      },[outingModal])
      const closeOutingModal = useCallback(()=>{
        const target = Modal.getInstance(outingModal.current);
        target.hide();
         setOuting({
            outingReason:"", outingStart:"", outingEnd:"", outingDay:""
          })
          setStartOuting(null);
          setEndOuting(null);
          setOutingDay(null);
      },[outingModal])

   
    const saveStartOuting = useCallback((target)=>{
      setStartOuting(target);
             const hours = target.getHours().toString().padStart(2,'0');
        const mins = target.getMinutes().toString().padStart(2,'0');
        const timeOnly = hours + ":" + mins + ":00";
      setOuting(prev=>({
          ...prev,
          outingStart:timeOnly
        }));
    },[])
    const saveEndOuting = useCallback((target)=>{
      setEndOuting(target);
       const hours = target.getHours().toString().padStart(2,'0');
        const mins = target.getMinutes().toString().padStart(2,'0');
        const timeOnly = hours + ":" + mins + ":00";
      setOuting(prev=>({
          ...prev,
          outingEnd:timeOnly
        }));
    },[])


    const saveOutingDay = useCallback((target)=>{
      setOutingDay(target);
      const year = target.getFullYear();
      const month = (target.getMonth() + 1).toString().padStart(2,'0');
       const date = target.getDate().toString().padStart(2,'0');
        const dateOnly = year + "-" + month + "-" + date;
        setOuting(prev=>({
          ...prev,
          outingDay:dateOnly
        }));
    },[])

    const changeOuting = useCallback((e)=>{
       setOuting(prev=>({
          ...prev,
          [e.target.name] : e.target.value
        }));
    },[])

    // useEffect(()=>{
    //   console.log("outing");
    //   console.log(outing);
    // },[outing])
   
   const saveOuting = useCallback(async()=>{
    const resp = await axios.post(`/outing/add/${memberNo}`,outing);
    closeOutingModal(); 
     requestReasonList();
   },[outing])




//  useEffect(()=>{
//       console.log("outingList");
//       console.log(outingList);
//     },[outingList])



   const requestOutingList = useCallback (async()=>{
    const resp = await axios.post(`/outing/list/${memberNo}`, viewDate);
    //console.log(resp);
    setOutingList(resp.data);
   },[viewDate])

   const deleteOuting = useCallback(async(target)=>{
   // console.log(target);
    const resp = await axios.delete(`/outing/${target}`)
    
    // if(resp === true){
    // }
    requestReasonList();
   },[])

   useEffect(()=>{console.log(status)},[status])

    const attendanceRate = useMemo(() => {
    if (totalWork === 0) return 0; 
    const rate = ((status.realWorkDays - status.absentCount) / totalWork) * 100;
    return parseFloat(rate.toFixed(2)); 
  }, [totalWork, status]);

    return (<>
        <Jumbotron subject={`${memberName} 님의 출결` }/>
        
       

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
        {/* <button className="btn btn-light" onClick={requestReasonList}><FaMagnifyingGlass/></button> */}
        </div>
      </div>




       <div className="row mt-4">
        <div className="col">
      <h3>{viewDate.year} 년 {viewDate.month}월 출석률{attendanceRate}%
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

          </h3>
        </div>
      </div>
      






    <div className="row mt-2">
      <div className="col">
        <h3> {viewDate.month}월 결과 기록</h3>
        <table className="table table-striped table-hover table-bordered">
  <thead>
    <tr>
      <th>날짜</th>
      <th>출근 시간</th>
      <th>퇴근 시간</th>
      <th>지각 시간(분)</th>
      <th>조퇴 여부</th>
      <th>정상 근무 시간(분)</th>
      <th>연장 근무(분)</th>
      <th>상태</th>
    </tr>
  </thead>
  <tbody>
    {resultList.map((item) => (
      <tr key={item.attendanceResultNo}>
        <td>{item.attendanceResultDay}</td>
        <td>{formatTime(item.attendanceResultInTime)}</td>
        <td>{formatTime(item.attendanceResultOutTime)}</td>
        <td>{item.attendanceResultLateMinute > 0 ? item.attendanceResultLateMinute + "분" : "X"}</td>
       <td>{item.attendanceResultEarlyLeave > 0 ? item.attendanceResultEarlyLeave + "분" : "X"}</td>
        <td>{item.attendanceResultWorkTime}분</td>
        <td>{item.attendanceResultOverTime}분</td>
        <td>{item.attendanceResultState}</td>
      </tr>
    ))}
  </tbody>
</table>
      </div>
    </div>

      <div className="row mt-2">
        <div className="col d-flex">
          <h3>지각, 조퇴, 결근 사유 기록</h3>
          <button className="btn btn-primary ms-auto" onClick={openAttendanceLog}><FaPlus/></button>
        </div>
      </div>

      <div className="row mt-2">
        <div className="col">
          <table className="table table-striped table-hover table-bordered">
  <thead>
    <tr>
      <th>날짜</th>
      <th>사유 시작 시간</th>
      <th>사유 종료 시간</th>
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
        <FaFile className="ms-1 text-success" style={{ cursor: "pointer" }} onClick={(e)=>openZoom(item.attendanceReasonNo)}/></td>
      </tr>
    ))}
  </tbody>
</table>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col d-flex">
          <h3>외출 기록</h3>
          <div className="ms-auto">

          <button className="btn btn-success">
            <FaPlus onClick={openOutingModal}/>
          </button>
          </div>
        </div>
        
      </div>

      <div className="row mt-4">
        <div className="col">
           <table className="table table-striped table-hover table-bordered">
            <thead>
              <tr>
                <th>날짜</th>
                <th>외출 시작 시간</th>
                <th>외출 종료 시간</th>
                <th>사유</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {outingList.map((item, index) => (
                <tr key={index}>
                  <td>{item.outingDay}</td>
                  <td>{item.outingStart}</td>
                  <td>{item.outingEnd}</td>
                  <td>{item.outingReason}</td>
                  <td><FaTrashAlt style={{ cursor: "pointer" }} onClick={(e)=>deleteOuting(item.outingNo)} className="text-danger"/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <hr/>

       <div className="row mt-4">
            <div className="col d-flex">

          <h3>근태 기록</h3>
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
                {/* <button className="btn btn-light" onClick={requestLog}><FaMagnifyingGlass/></button> */}
                    </div>
            </div>
                     {/* <button className="btn btn-primary" onClick={openAttendanceLog}><FaPlus/></button> */}
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
      <div className="modal fade" tabIndex="-1" role="dialog" ref={outingModal} data-bs-backdrop="static">
                    <div className="modal-dialog modal-lg" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                        <strong>외출 사유</strong>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" >
                        </button>
                        </div>
                        <div className="modal-body">
                          <div className="row">
                                <label className="col-sm-3 col-label-form" > 날짜 선택</label>
                                <div className="col-sm-9">
                                    <DatePicker
                                    className="form-control"
                                        selected={outingDay} 
                                        timeIntervals={30}
                                        placeholderText={"날짜를 선택해주세요"} 
                                        onChange={saveOutingDay}
                                        dateFormat={"yyyy-MM-dd"} 
                                        popperPlacement="top-start"
                                    />
                                </div>
                            </div>
                            <div className="row mt-2">
                                <label className="col-sm-3 col-label-form" >시간</label>
                                <div className="col-sm-9 d-flex">
                                     <DatePicker
                                        selected={startOuting}
                                        className="form-control"
                                        onChange={saveStartOuting}
                                        showTimeSelect   // ⏰ 시간 선택 활성화
                                         showTimeSelectOnly  
                                          timeIntervals={10}   
                                          dateFormat="HH:mm"
                                        />

                                        <span>~</span>
                                     <DatePicker
                                        selected={endOuting}
                                        className="form-control"
                                         onChange={saveEndOuting}
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
                                    <textarea className="form-control" name="outingReason" onChange={changeOuting} value={outing.outingReason}></textarea>
                                </div>
                            </div>



                        <div className="modal-footer">
                       
                          <button className="btn btn-success" onClick={saveOuting}>추가하기</button>
                        </div>
                    </div>
                    </div>
                </div> 
                </div> 
     
       <div className="modal fade" tabIndex="-1" role="dialog" ref={zoomImg} data-bs-backdrop="static">
                    <div className="modal-dialog modal-lg" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                        <strong>증빙 서류</strong>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" >
                        </button>
                        </div>
                        <div className="modal-body">
                          <div className="row mt-4">
                            <div className="col">

                              <img src={previewUrl} style={{maxWidth:"500px"}} className="w-100"></img>
                            </div>
                          </div>
                          <div className="row mt-4">
                            <div className="col">
                             
                            {attachment ? (
                            <Link to={`http://localhost:8080/api/attachment/${attachment?.attachmentNo}`}
                            className="text-decoration-none text-dark"> {attachment?.attachmentName}</Link>
                          ):(
                            <h3>등록된 첨부파일이 없습니다</h3>
                          )}
                            </div>
                          </div>
                         
                        </div>
                        <div className="modal-footer">
                        <div className="d-flex justify-content-between">
                            {/* <button className="btn btn-success" onClick={addReason} disabled={!sendStatus}>저장하기</button> */}
                         
                        </div>
                        
                        </div>
                    </div>
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
                                    {/* <input type="text" className="form-control" name="attendanceReasonState"
                                     onChange={changeReason} value={attendanceReason.attendanceReasonState}></input> */}
                                     <select
                                      className="form-control"
                                      name="attendanceReasonState"
                                      onChange={changeReason}
                                      value={attendanceReason.attendanceReasonState}
                                    >
                                      <option value="">상태 선택</option>
                                      <option value="지각">지각</option>
                                      <option value="조퇴">조퇴</option>
                                      <option value="결근">결근</option>
                                    </select>
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