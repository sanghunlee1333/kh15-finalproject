import { Link, Route, Routes } from 'react-router'
import './App.css'

import Menu from './components/template/Menu'
import Mainpage from './components/Mainpage'

function App() {
  
  return (
    <>
      {/* 메뉴 */}
      <Menu/>

      {/* 컨테이너 */}
      <div className="container mt-5 pt-5">

      
        {/* Routes에 주소와 연결될 컴포넌트를 작성하여 상황에 맞는 화면 출력 */}
        <Routes>
          <Route path="/" element={<Mainpage/>}></Route>
        </Routes>

      </div>
    </>
  )
}

export default App
