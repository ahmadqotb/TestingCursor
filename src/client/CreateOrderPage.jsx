import React, { useState } from 'react'
import { useAuth } from '@wasp/auth'
import { useAction } from '@wasp/actions'
import { createPurchaseOrder } from '@wasp/actions/createPurchaseOrder'
import { useHistory } from 'react-router-dom'

const CreateOrderPage = () => {
  const { data: user } = useAuth()
  const history = useHistory()
  const createOrderAction = useAction(createPurchaseOrder)
  
  const [formData, setFormData] = useState({
    title: '',
    amount: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Check if user has permission to create orders
  if (user?.role !== 'REQUESTER') {
    return (
      <div className="error-page">
        <h1>Access Denied</h1>
        <p>Only users with REQUESTER role can create purchase orders.</p>
      </div>
    )
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    // Validation
    if (!formData.title.trim()) {
      setError('Title is required')
      setIsSubmitting(false)
      return
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Amount must be a positive number')
      setIsSubmitting(false)
      return
    }

    try {
      await createOrderAction({
        title: formData.title.trim(),
        amount: parseFloat(formData.amount)
      })
      
      // Redirect to dashboard on success
      history.push('/')
    } catch (err) {
      setError(err.message || 'Failed to create purchase order')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="create-order-page">
      <div className="page-header">
        <h1>Create Purchase Order</h1>
        <p>Submit a new purchase order for approval</p>
      </div>

      <div className="form-container">
        <form onSubmit={handleSubmit} className="create-order-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter order title"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="amount">Amount ($) *</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              placeholder="Enter amount"
              min="0.01"
              step="0.01"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => history.push('/')}
              className="btn btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateOrderPage