import { useRecoilValue } from "recoil"
import { loginState, userLoadingState } from "./stroage"
import { Navigate } from "react-router";
import { FaSpinner } from "react-icons/fa6";

export default function member({children}){
    const userLoading = useRecoilValue(userLoadingState);
    const login = useRecoilValue(loginState);

    if(!userLoading){
        return <h1><FaSpinner></FaSpinner></h1>
    }

    return login === true ? children: <Navigate to={"/member/login"}/>;
}