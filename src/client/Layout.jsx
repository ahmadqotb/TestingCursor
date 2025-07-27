import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth, logout } from '@wasp/auth'
import './Layout.css'

export const Layout = ({ children }) => {
  const { data: user } = useAuth()

  return (
    <div className="layout">
      <header className="header">
        <div className="header-content">
          <Link to="/" className="logo">
            Purchase Order System
          </Link>
          {user && (
            <div className="user-menu">
              <span className="user-info">
                {user.username} ({user.role})
              </span>
              <button onClick={logout} className="logout-btn">
                Logout
              </button>
            </div>
          )}
        </div>
      </header>
      <main className="main-content">
        {children}
      </main>
    </div>
  )
}