import React from 'react'
import { Link } from 'react-router-dom'
import { LoginForm } from '@wasp/auth/forms/Login'

const LoginPage = () => {
  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1>Login</h1>
        <LoginForm />
        <p>
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage