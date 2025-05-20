import { useCallback, useEffect, useRef, useState } from "react";
import Jumbotron from "../template/Jumbotron";
import { Modal } from "bootstrap";
import axios from "axios";

export default function AdminAttendancePolicy(){
    const policyModal = useRef();

    const [policy, setPolicy] = useState({
        policyInTime:"", policyArrange:"", policyGraceTime:"", policyLunchTime:"", policyDinnerTime:"", policyWorkTime:"",
    });
    const [newPolicy, setNewPolicy] = useState({
         policyInTime:"08:00", policyArrange:"", policyGraceTime:"", policyLunchTime:"", policyDinnerTime:"", policyWorkTime:"",
    })

    const loadPolicy = useCallback(async()=>{
        const resp = await axios.get("/attendance/");
        // console.log("resp");
        // console.log(resp);
       // setPolicy(resp);
        setPolicy({
            policyInTime:resp.data.policyInTime, policyArrange:resp.data.policyArrange, policyGraceTime:resp.data.policyGraceTime,
             policyLunchTime:resp.data.policyLunchTime, policyDinnerTime:resp.data.policyDinnerTime, policyWorkTime:resp.data.policyWorkTime
        });
    },[])
    // useEffect(()=>{
    //     console.log("POLICY");
    //     console.log(policy)},[policy])

    const changePolicy = useCallback((e)=>{
        setNewPolicy((prev)=>({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    },[])

    // useEffect(()=>{
    //     console.log(newPolicy);
    // },[newPolicy])

    useEffect(()=>{
        loadPolicy();
    },[])


    const openPolicyModal = useCallback(()=>{
        const target = Modal.getOrCreateInstance(policyModal.current);
        target.show();
    },[])

    const closePolicyModal = useCallback(()=>{
        const target = Modal.getInstance(policyModal.current);
        target.hide();
        setNewPolicy({
             policyInTime:"08:00", policyArrange:"", policyGraceTime:"", policyLunchTime:"", policyDinnerTime:"", policyWorkTime:""
        })
    },[]);

    const savePolicy = useCallback(async ()=>{
         const resp = await axios.post("attendance/", newPolicy);
        //  console.log("resp");
        //  console.log(resp);
        //console.log("save");
        
        closePolicyModal();
        loadPolicy();
        setNewPolicy({
             policyInTime:"08:00", policyArrange:"", policyGraceTime:"", policyLunchTime:"", policyDinnerTime:"", policyWorkTime:""
        });
    },[newPolicy])

    


    return (<>
        <Jumbotron subject="출결 관리"></Jumbotron>
        <span className="text-muted mt-2">*출근 시간 범위가 0 이면 고정 출근제이고 지각 허용시간이 0 이면 자율 출근제입니다</span>
        <div className="card shadow-sm p-4 mt-2">
        <h5 className="mb-4">출결 정책 상세</h5>

        <div className="row mb-3">
            <label className="col-sm-3 fw-bold">출근 기준 시각</label>
            <div className="col-sm-9 text-muted">{policy.policyInTime}</div>
        </div>

        <div className="row mb-3">
            <label className="col-sm-3 fw-bold">출근 시간 범위</label>
            <div className="col-sm-9">
            <span className="text-muted">{policy.policyArrange}분</span>
            </div>
        </div>

        <div className="row mb-3">
            <label className="col-sm-3 fw-bold">지각 허용 시간</label>
            <div className="col-sm-9">
            <span className="text-muted">{policy.policyGraceTime}분</span>
            </div>
        </div>

        <div className="row mb-3">
            <label className="col-sm-3 fw-bold">점심 시간</label>
            <div className="col-sm-9">
            <span className="text-muted">{policy.policyLunchTime}분</span>
            </div>
        </div>

        <div className="row mb-3">
            <label className="col-sm-3 fw-bold">저녁 시간</label>
            <div className="col-sm-9">
            <span className="text-muted">{policy.policyDinnerTime}분</span>
            </div>
        </div>

        <div className="row mb-3">
            <label className="col-sm-3 fw-bold">근무 시간</label>
            <div className="col-sm-9">
            <span className="text-muted">{policy.policyWorkTime}분</span>
            </div>
        </div>
        </div>
    
    <div className="d-flex justify-content-end mb-3 mt-4">
        <button className="btn btn-primary rounded-pill px-4 d-flex align-items-center" onClick={openPolicyModal}>
            새 출결 정책
        </button>
    </div>

    <div className="modal fade" tabIndex="-1" role="dialog" ref={policyModal} data-bs-backdrop="static">
                <div className="modal-dialog modal-lg" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                        <h2>출결 정책</h2>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"  >
                        </button>
                        </div>
                        <div className="modal-body">
                            <div className="row mt-4">
                                <label className="col-sm-3 col-form-label">출근 시각</label>
                                <div className="col-sm-9">
                                    <select className="form-select" value={newPolicy.policyInTime} name="policyInTime" onChange={changePolicy}>
                                    {Array.from({ length: 13 }, (_, i) => {
                                        const hour = 8 + Math.floor(i / 6);
                                        const minute = (i % 6) * 10;
                                        const label = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
                                        return <option key={label} value={label}>{label}</option>;
                                    })}
                                    </select>
                                </div>
                                </div>

                                <div className="row mt-4">
                                <label className="col-sm-3 col-form-label">출근 시간 범위</label>
                                <div className="col-sm-9 d-flex align-items-center">
                                    <input type="number" className="form-control w-auto" min="0" 
                                    value={newPolicy.policyArrange} name="policyArrange" onChange={changePolicy}/>
                                    <span className="ms-2">분</span>
                                </div>
                                </div>

                                <div className="row mt-4">
                                <label className="col-sm-3 col-form-label">지각 허용 시간</label>
                                <div className="col-sm-9 d-flex align-items-center">
                                    <input type="number" className="form-control w-auto" min="0" 
                                    value={newPolicy.policyGraceTime} name="policyGraceTime" onChange={changePolicy}/>
                                    <span className="ms-2">분</span>
                                </div>
                                </div>

                                <div className="row mt-4">
                                <label className="col-sm-3 col-form-label">점심 시간</label>
                                <div className="col-sm-9 d-flex align-items-center">
                                    <input type="number" className="form-control w-auto" min="0" 
                                    value={newPolicy.policyLunchTime} name="policyLunchTime" onChange={changePolicy}/>
                                    <span className="ms-2">분</span>
                                </div>
                                </div>
                                <div className="row mt-4">
                                <label className="col-sm-3 col-form-label">저녁 시간</label>
                                <div className="col-sm-9 d-flex align-items-center">
                                    <input type="number" className="form-control w-auto" min="0" 
                                    value={newPolicy.policyDinnerTime} name="policyDinnerTime" onChange={changePolicy}/>
                                    <span className="ms-2">분</span>
                                </div>
                                </div>
                                <div className="row mt-4">
                                <label className="col-sm-3 col-form-label">근무 시간</label>
                                <div className="col-sm-9 d-flex align-items-center">
                                    <input type="number" className="form-control w-auto" min="0" 
                                    value={newPolicy.policyWorkTime} name="policyWorkTime" onChange={changePolicy}/>
                                    <span className="ms-2">분</span>
                                </div>
                                </div>
                        </div>
                        <div className="modal-footer">
                                <button className="btn btn-success" onClick={savePolicy}>저장하기</button>
                                <button className="btn btn-danger" onClick={closePolicyModal}>닫기</button>
                        </div>
                    </div>
                    </div>
                    </div>


    </>)
}