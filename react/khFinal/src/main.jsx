import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

//apply bootstrap
import "bootstrap/dist/css/bootstrap.min.css";
import "bootswatch/dist/litera/bootstrap.min.css";
import "bootstrap";
import { BrowserRouter } from 'react-router';

//axios 기본 주소 설정
import axios from "axios";
import { RecoilRoot } from 'recoil';
axios.defaults.baseURL = "http://localhost:8080/api"; 
axios.defaults.timeout = 10000; //타임아웃(ms) 
axios.interceptors.request.use((config)=>{
  //추가하고 싶은 내용을 작성
  config.headers["Frontend-URL"] = window.location.href;
  return config;
});

createRoot(document.getElementById('root')).render(
  <>
  {/* <StrictMode> */}
    {/* App 전체에 라우팅 설정을 수행 */}
    <BrowserRouter>
      {/* Recoil에 저장한 데이터가 공유될 범위를 지정 */}
      <RecoilRoot>
        <App />
      </RecoilRoot>
    </BrowserRouter>
  {/* </StrictMode>, */}
  </>
)
