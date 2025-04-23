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
