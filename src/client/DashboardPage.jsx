import React from 'react'
import { useAuth } from '@wasp/auth'

const DashboardPage = () => {
  const { data: user } = useAuth()

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <div className="welcome-section">
        <h2>Welcome, {user?.username}!</h2>
        <p>Role: {user?.role}</p>
      </div>
      
      <div className="dashboard-content">
        <div className="dashboard-card">
          <h3>Purchase Orders</h3>
          <p>Manage your purchase orders here.</p>
        </div>
        
        {user?.role === 'REQUESTER' && (
          <div className="dashboard-card">
            <h3>Create New Order</h3>
            <p>Submit a new purchase order for approval.</p>
          </div>
        )}
        
        {user?.role?.startsWith('APPROVER') && (
          <div className="dashboard-card">
            <h3>Pending Approvals</h3>
            <p>Review purchase orders waiting for your approval.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardPage