import { NavLink, Route, Routes } from 'react-router-dom'
import './App.css'
import { AdminPage } from './AdminPage'
import { SurveyPage } from './SurveyPage'

function App() {
  return (
    <div className="app-layout">
      <nav className="app-nav" aria-label="サイト内">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            isActive ? 'nav-link nav-link--active' : 'nav-link'
          }
        >
          アンケート
        </NavLink>
        <NavLink
          to="/admin"
          className={({ isActive }) =>
            isActive ? 'nav-link nav-link--active' : 'nav-link'
          }
        >
          管理画面
        </NavLink>
      </nav>
      <Routes>
        <Route path="/" element={<SurveyPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </div>
  )
}

export default App
