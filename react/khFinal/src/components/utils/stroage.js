import {atom, selector} from "recoil";

const userNoState = atom({
    key:"userNoState",
    default:null,
});

const userDepartmentState = atom({
    key:"userDepartmentState",
    default:null,
})

const loginState = selector({
    key:"loginState",
    get:(state)=>{
        const userNo = state.get(userNoState);
        const userDepartment = state.get(userDepartmentState);

        return(userNo !== null && userDepartment !== null);
    }
});

export{userNoState, userDepartmentState, loginState};
