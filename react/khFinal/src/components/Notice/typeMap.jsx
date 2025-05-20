import { FaExclamationTriangle, FaExclamationCircle } from "react-icons/fa";
import { IoMdInformationCircle, IoMdPersonAdd } from "react-icons/io";
import { MdEventAvailable } from "react-icons/md";
import { IoPersonSharp, IoSettingsSharp } from "react-icons/io5";
import { FaStarOfLife, FaCircleQuestion, FaFolderOpen } from "react-icons/fa6";

const typeMap = {
    "[긴급]": {
      color : "red",
      icon : () => <FaExclamationTriangle />
    },
    "[안내]": {
      color : "navy",
      icon : () => <IoMdInformationCircle />
    },
    "[행사]": { 
      color : "green",
      icon : () => <MdEventAvailable />
    },
    "[점검]": {
      color : "blue",
      icon : () => <IoSettingsSharp />
    },
    "[인사]": {
      color : "orange",
      icon : () => <IoPersonSharp />
    },
    "[채용]": {
      color :"teal",
      icon : () => <IoMdPersonAdd />
    },
    "[주의]": {
      color : "red",
      icon : () => <FaExclamationCircle />
    },
    "[필독]": {
      color : "red",
      icon : () => <FaStarOfLife />
    },
    "[기타]": {
      color : "gray",
      icon : () => <FaFolderOpen />
    },
    "[FAQ]": {
      color : "dodgerblue",
      icon : () => <FaCircleQuestion />
    }
};
  
export default typeMap;