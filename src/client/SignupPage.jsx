import React from 'react'
import { Link } from 'react-router-dom'
import { SignupForm } from '@wasp/auth/forms/Signup'

const SignupPage = () => {
  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1>Sign Up</h1>
        <SignupForm />
        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  )
}

export default SignupPage