import { FaCalendarAlt } from "react-icons/fa";

export default function Mainpage() {

    return (<>
        <div className="row mt-2">
            <div className="col d-flex">
                <div className="ms-auto">

                <button className="btn btn-success">출근</button>
                <button className="btn btn-danger">퇴근</button>
                </div>
            </div>
        </div>
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