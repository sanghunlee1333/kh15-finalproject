
import { useRecoilValue } from "recoil";
import { userDepartmentState, userLoadingState } from "./stroage";
import { Navigate } from "react-router-dom";
import { FaSpinner } from "react-icons/fa6";

export default function admin({children}){

    const userLoading = useRecoilValue(userLoadingState);
    const userDepartment = useRecoilValue(userDepartmentState);

    if(!userLoading){
        return <h1><FaSpinner></FaSpinner></h1>
    }

    //view
    return userDepartment === '인사' || userDepartment === '인사관리' ? children : <Navigate to={"/member/login"} />;
}