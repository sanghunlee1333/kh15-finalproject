import { useState } from "react";

export default function MemberLogin(){
    //state
    const [members, setMembers] = useState([]);
    const [input, setInput] = useState("");




    // view
    return (<>
    <div className="row mt-4">
        <label className="col-sm-3 form-label-control"></label>
        <div className="col-sm-9">
            <input type="text" className="form-control"/>
        </div>
    </div>
    
    </>);
}