import axios from "axios";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Jumbotron from "../template/Jumbotron";
import AdminCalendar from "./AdminCalendar";
import { Modal } from "bootstrap";
import { FaTrash } from "react-icons/fa6";
import { useRecoilState, useResetRecoilState } from "recoil";
import { userLoadingState, userNoState } from "../utils/stroage";

export default function DateMange(){
  const [totalDays, setTotalDays] = useState("");
  const [holidays, setHolidays] = useState([]);
  
  // const dateLoading = useRecoilState(userLoadingState);
  const [dateLoading, setDateLoading] = useState(false);
  const [params, setParams] = useState({title:"", date:"", no:"", admin:""});
  const deleteEvent = useRef();
  const [checkDate, setCheckDate] = useState({year:"", month:"",})

  const [userNo, setUserNo] = useRecoilState(userNoState);

  // const [currentDate, setCurrentDate] = useState({
  //   year:year,
  //   month:month});
 

  
  const loadList = useCallback(async () => {
 
  if (!checkDate?.year || !checkDate?.month) return;
  
    setDateLoading(true);
  try {
   const resp = await axios.post("/admin/date2", checkDate);
    setTotalDays(resp.data.totalWorkingDays);
    setHolidays(resp.data.holidayList);
  } catch (err) {
    console.error("API 에러 발생:", err);
  } finally {
  
    setDateLoading(false);
   // console.log("finaly");
  }
}, [checkDate]);

useEffect(() => {
  if (checkDate?.year && checkDate?.month) {
   // console.log("checkDate가 업데이트됨:", checkDate);  
    //setLoading(true);
   // setLoading(false);
    loadList();  
  }
}, [checkDate]); 

useEffect(() => {
  const now = new Date();
 
  setCheckDate({
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  });
}, []);
//useEffect(()=>{console.log("effect" );console.log(dateLoading)},[dateLoading])


  

  const openDeleteEvent = useCallback(()=>{
    const target = Modal.getOrCreateInstance(deleteEvent.current);
    target.show();
  },[])

  const closeDeleteEvent = useCallback(()=>{
    const target = Modal.getInstance(deleteEvent.current);
    target.hide();
  },[])

  const deleteOne = useCallback(async(target)=>{
    //console.log(target);
    const resp = await axios.delete("/admin/date/"+target);
    if(resp){
      loadList();
    }
  },[])
 // useEffect(()=>{console.log(currentDate)},[currentDate])
   
  const getValue = (current) =>{
    setCheckDate({
      year:current.year, month:current.month,
    })
  };

  const formatDate = (target) => {
      const form = new Date(target);
      const year = form.getFullYear();
      const month = (form.getMonth() + 1).toString().padStart(2,'0');
      const date = form.getDate().toString().padStart(2,'0');
      const dateOnly = year + "-" + month + "-" + date;
  return dateOnly;
  };

  useEffect(() => {
    const paramList = holidays.map((holiday) => ({
      title: holiday.holidayName,
      date: holiday.holidayDate,
      no: holiday.holidayNo,
      admin: holiday.holidayAdmin,
    }));
    setParams(paramList); // 한 번에 저장
  }, [holidays]);
 // useEffect(()=>{console.log("loadlist")},[loadList])
  return (
    <>
      <Jumbotron subject="휴일 관리 "></Jumbotron>
      <div className="row">
        <div className="col">
          <hr/>
         {dateLoading === false && (
            <div className="d-flex">
              <h2>
                {checkDate.year}년 {checkDate.month}월 총 근무일: {totalDays}일
              </h2>
              <button className="btn btn-danger ms-auto" onClick={openDeleteEvent}>
                휴일 삭제하기
              </button>
            </div>
          )}
 
          <hr/>
        </div>
      </div>
          
      <AdminCalendar 
        param={params}
        onNotify={loadList}
       // currentDate = {currentDate}
        sendDate = {getValue}
      />
      
      <div className="modal fade" tabIndex="-1" role="dialog" ref={deleteEvent} data-bs-backdrop="static">
      <div className="modal-dialog modal-lg" role="document">
          <div className="modal-content">
              <div className="modal-header">
              <h2> 일정 삭제</h2>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"  >
              </button>
              </div>
              <div className="modal-body">

              
              <div className="row mt-2">
                <div className="col">
                  {holidays.filter((holiday) => holiday.holidayAdmin === "Y").length === 0 ? (
                    <span>이 달은 관리자가 등록한 휴일이 없습니다.</span>
                  ) : (
                    <ul className="list-group">
                      {holidays
                        .filter((holiday) => holiday.holidayAdmin === "Y")
                        .map((holiday) => (
                          <li
                            key={holiday.holidayNo}
                            className="list-group-item d-flex justify-content-between align-items-center"
                          >
                            <div>
                              <h6 className="mb-1">{holiday.holidayName}</h6>
                              <small className="text-muted">{formatDate(holiday.holidayDate)}</small>
                            </div>

                            <button
                              className="ms-auto btn btn-danger"
                              onClick={(e) => deleteOne(holiday.holidayNo)}
                            >
                              <FaTrash />
                            </button>
                          </li>
                        ))}
                    </ul>
                  )}
                </div>
              </div>

             




                <div className="row mt-2 mb-4">
                    <div className="col d-flex">
                        
                    </div>
                </div>
               
              <div className="modal-footer">
              <div className="d-flex justify-content-between">
                  <button onClick={closeDeleteEvent} className="btn btn-secondary"> 닫기</button>
                                  
                 
              </div>
              
              </div>
          </div>
          </div>
      </div> 
      </div>
      
    
    </>
  );

}