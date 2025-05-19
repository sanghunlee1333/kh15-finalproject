import React, { Component, useCallback, useEffect, useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import days from "./DateManage";
import interactionPlugin from "@fullcalendar/interaction";
import { Modal } from 'bootstrap';
import axios from 'axios';

export default function AdminCalendar({ param, onNotify, currentDate,sendDate }) {
    const addEvent = useRef()
    
    const [current, setCurrent] = useState({ year: "", month: "" });

    useEffect(() => {
    if (currentDate) {
        setCurrent({ year: currentDate.year, month: currentDate.month });
    }
    // console.log("currentDate")
    // console.log(currentDate);
    
    }, [currentDate]);

    useEffect(()=>{
    //    console.log("current");
        sendDate(current);
       // console.log( current)
      },[current])

    const [clickedDate, setClickedDate] = useState(""); 
    const [submitDate, setSubmitDate] = useState({
        title:"", date:"",
    });

    const openAddEventModal = useCallback((info) => {
         const date = new Date(info.date);
         //setClickedDate(`${info.date.getFullYear()}-${String(info.date.getMonth() + 1).padStart(2, '0')}-${String(info.date.getDate()).padStart(2, '0')} 00:00:00`);
         setClickedDate(`${info.date.getFullYear()}-${String(info.date.getMonth() + 1).padStart(2, '0')}-${String(info.date.getDate()).padStart(2, '0')} `);
        //  console.log(date);
        const target = Modal.getOrCreateInstance(addEvent.current);
        target.show();
        closeAddEventModal();
      },[clickedDate]);

      const closeAddEventModal = useCallback(()=>{
        const target = Modal.getInstance(addEvent.current);
        target.hide();
        setSubmitDate({title:"",date:"",});
      },[addEvent])

   

    const events = Array.isArray(param)
      ? param.map(par => ({
          title: par.title,
          date: par.date, // FullCalendar는 start 필드 필요
         
        }))
      : [];
    
     
    const addDate = useCallback(async ()=>{
        const add = {holidayName:submitDate.title, holidayDate:submitDate.date}
        const resp = await axios.post("/admin/date", add);
        //console.log(submitDate);
        closeAddEventModal();onNotify();
    },[submitDate]);

    const changeTitle = useCallback((e)=>{
        setSubmitDate(({
            title: e.target.value,  
            date:clickedDate,      
        }));

    },[clickedDate]);

   // useEffect(()=>{console.log(submitDate)},[submitDate]);


   const calendarRef = useRef();

  const prevbutton = () => {
    const calendarApi = calendarRef.current.getApi();
    calendarApi.prev(); // ✅ 기존 prev 동작 실행
    //alert('Custom button clicked!'); // ✅ 추가 콜백 실행
    const fcApi = calendarApi.getDate();
    const year = fcApi.getFullYear(); 
    const month = fcApi.getMonth() + 1; 
   setCurrent({year:year, month:month,});
  };
  const nextbutton = () => {
    const calendarApi = calendarRef.current.getApi();
    calendarApi.next(); // ✅ 기존 prev 동작 실행
    //alert('Custom button clicked!'); // ✅ 추가 콜백 실행
    const fcApi = calendarApi.getDate();
    const year = fcApi.getFullYear(); 
    const month = fcApi.getMonth() + 1; 
   setCurrent({year:year, month:month,});
  };

  
  
    return (
    <>
      <div className="App">
        <FullCalendar
          ref={calendarRef}
          initialView="dayGridMonth"
          plugins={[dayGridPlugin, interactionPlugin]}
          eventDisplay="block"
          displayEventTime={false}
          events={events}
          dateClick={openAddEventModal} 
          
          headerToolbar={{
            left:'',
            right: 'prev,next'
          }}
         customButtons={{
          prev: {
          //  text: '이전달',
            click: prevbutton
          },
          next: {
            click: nextbutton
          }
         }}
        />
      </div>

      <div className="modal fade" tabIndex="-1" role="dialog" ref={addEvent} data-bs-backdrop="static">
      <div className="modal-dialog modal-lg" role="document">
          <div className="modal-content">
              <div className="modal-header">
              <h2>{clickedDate} 일정 추가</h2>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"  >
              </button>
              </div>
              <div className="modal-body">
                <div className="row mt-2">
                    <label className="col-sm-3 col-form-label">제목 입력</label>
                    <div className="col-sm-9">
                        <input type="text" className="form-control mb-4" value={submitDate.title} name="title" onChange={changeTitle} placeholder="일정의 제목을 입력해주세요"></input>
                    </div>    
                </div>  
                <div className="row mt-2 mb-4">
                    <div className="col d-flex">
                        <button className='ms-auto btn btn-success' onClick={addDate}>일정 추가하기</button>
                    </div>
                </div>
               
              <div className="modal-footer">
              <div className="d-flex justify-content-between">
                  
                                  
                 
              </div>
              
              </div>
          </div>
          </div>
      </div> 
      </div>
      </>
    );
  }