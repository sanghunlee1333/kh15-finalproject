import { useParams } from "react-router";
import Jumbotron from "../template/Jumbotron";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import userImg from '/public/images/profile_basic.png';

export default function MemberManage(){
    const { memberNo } = useParams(); 
    const [member, setMember] = useState({
        memberNo:"", memberId:"", memberDepartment:"", memberName:"", memberContact:"", memberEmail:"",
        memberPost:"", memberAddress1:"", memberAddress2:"", memberRank:"", memberBank:"", memberBankNo:"", 
        memberJoin:"", memberState:"",
    })
    const loadOne = useCallback(async ()=>{
        const rest = await axios.get("/admin/member/"+memberNo);
        console.log(rest.data);
        setMember(rest.data.vo);
    },[]);

    useEffect(()=>{
        loadOne();
    },[])
    return(<>
        <Jumbotron subject="gd"></Jumbotron>
       
        <div className="row mt-4">
            <div className="col-3 d-flex">
            <img src={userImg} alt="기본 사용자 이미지" style={{maxWidth:350}} />
            <div className="ms-4 d-flex flex-column">

            <span>사원번호 : {memberNo}</span>
            <span>아이디 : {member.memberId}</span>
            <span>이름 : {member.memberName}</span>
            <span>부서 : {member.memberDepartment}</span>
            <span>연락처 : {member.memberContact}</span>
            <span>이메일 : {member.memberEmail}</span>
            <span>주소 : [{member.memberPost}] {member.memberAddress1} {member.memberAddress2}</span>
            </div>
            
            
            </div>
        </div>





    </>)
}