import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import SimpleApp from './SimpleApp.tsx'
import DemoMode from './components/DemoMode.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/demo" element={<DemoMode />} />
        <Route path="/*" element={<SimpleApp />} />
      </Routes>
    </Router>
  </React.StrictMode>,
)
