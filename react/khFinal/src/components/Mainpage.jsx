import { FaCalendarAlt } from "react-icons/fa";

export default function Mainpage() {

    return (<>
       
            <h2 className="mb-4 mt-2">
                <FaCalendarAlt className="text-danger me-2"/>
                <span className="align-middle">일정</span>
            </h2>

            <div className="border rounded shadow-sm p-5 text-center text-muted"
                style={{ height: "80%", minHeight: "400px" }}
            >
                [여기에 달력 API 들어올 예정]
            </div>
     
    </>)
}