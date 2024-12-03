import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router, Link, Route, Routes } from 'react-router-dom'

import { MusicTeacher } from './components/MusicTeacher'

import './styles.css'

const App: React.FC = () => {
  return (
    <Router>
      <div className='min-h-screen bg-gray-100'>
        <nav className='bg-blue-600 p-4 text-white'>
          <div className='container mx-auto'>
            <Link to='/' className='text-xl font-bold'>
              AI Music Teacher
            </Link>
          </div>
        </nav>

        <main className='container mx-auto p-4'>
          <Routes>
            <Route path='/' element={<MusicTeacher />} />
          </Routes>
        </main>

        <footer className='mt-8 bg-gray-800 p-4 text-white'>
          <div className='container mx-auto text-center'>
            <p>AI Music Teacher - Your personal music education companion</p>
          </div>
        </footer>
      </div>
    </Router>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
