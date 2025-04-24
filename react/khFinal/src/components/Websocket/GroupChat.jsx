import { FaArrowTurnUp } from "react-icons/fa6";
import { IoArrowBack } from "react-icons/io5";
import { Link } from "react-router";

export default function GroupChat() {

    return (<>
        <div className="main-content">

            <div className="row mt-2">
                <div className="col">
                    <h2>
                        <Link to="#" className="btn">
                            <IoArrowBack className="fs-3" />
                        </Link>
                    </h2>
                </div>
            </div>

        <hr className="hr-stick" />
    
            {/* 채팅 입력창 */}
            <div className="row mt-2">
                <div className="col">
                    <div className="d-flex">
                        <input type="text" className="form-control" 
                            placeholder="채팅 입력"/>
                        <button className="btn btn-primary ms-2 text-nowrap">
                            <FaArrowTurnUp />
                        </button>
                    </div>
                </div>
            </div>

        </div>
    </>);
}