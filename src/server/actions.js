import HttpError from '@wasp/core/HttpError.js'

export const createPurchaseOrder = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'User must be authenticated')
  }

  // Check if user has permission to create orders
  if (context.user.role !== 'REQUESTER') {
    throw new HttpError(403, 'Only users with REQUESTER role can create purchase orders')
  }

  const { title, amount } = args

  // Validation
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    throw new HttpError(400, 'Title is required and must be a non-empty string')
  }

  if (!amount || typeof amount !== 'number' || amount <= 0) {
    throw new HttpError(400, 'Amount is required and must be a positive number')
  }

  try {
    // Create the purchase order
    const purchaseOrder = await context.entities.PurchaseOrder.create({
      data: {
        title: title.trim(),
        amount: amount,
        createdBy: context.user.id,
        status: 'PENDING'
      }
    })

    // Create 5 approval steps for the purchase order
    const approvalSteps = []
    for (let step = 1; step <= 5; step++) {
      approvalSteps.push({
        orderId: purchaseOrder.id,
        step: step,
        approverId: null, // Will be assigned later
        decision: null,
        notes: null,
        approvedAt: null
      })
    }

    await context.entities.Approval.createMany({
      data: approvalSteps
    })

    // Return the created purchase order with its approvals
    return await context.entities.PurchaseOrder.findUnique({
      where: { id: purchaseOrder.id },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            role: true
          }
        },
        approvals: {
          orderBy: { step: 'asc' },
          include: {
            approver: {
              select: {
                id: true,
                username: true,
                role: true
              }
            }
          }
        }
      }
    })
  } catch (error) {
    console.error('Error creating purchase order:', error)
    throw new HttpError(500, 'Failed to create purchase order')
  }
}