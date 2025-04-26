import { useState } from "react";
import Jumbotron from "../template/Jumbotron";

export default function MemberList(){
    const [members, setMembers] = useState({})
    
    return(<>
        <Jumbotron subject="사원 리스트"/>

    </>)
}