# Purchase Order Approval System

## App Purpose

The Purchase Order Approval System is a full-stack web application built with Wasp (React + Node.js + Prisma) that manages purchase orders requiring sequential approval from five different approvers. The system ensures that each purchase order must be approved by all five approvers in sequence before being finalized. If any approver rejects the order, it is immediately canceled.

### Key Features
- User authentication with role-based access control
- Sequential approval workflow (5 steps)
- Purchase order creation and management
- Real-time approval timeline tracking
- Role-based permissions and visibility

## Data Model

### User Entity
```prisma
model User {
  id              Int             @id @default(autoincrement())
  username        String          @unique
  password        String
  role            UserRole
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  
  // Relations
  createdOrders   PurchaseOrder[] @relation("CreatedOrders")
  approvals       Approval[]      @relation("ApproverRelation")
}
```

### PurchaseOrder Entity
```prisma
model PurchaseOrder {
  id          Int             @id @default(autoincrement())
  title       String
  amount      Float
  createdBy   Int
  status      OrderStatus     @default(PENDING)
  createdAt   DateTime        @default(now())
  
  // Relations
  creator     User            @relation("CreatedOrders", fields: [createdBy], references: [id])
  approvals   Approval[]
}
```

### Approval Entity
```prisma
model Approval {
  id          Int             @id @default(autoincrement())
  orderId     Int
  step        Int             // 1 to 5 representing approval step
  approverId  Int?            // Nullable until assigned
  decision    ApprovalDecision?
  notes       String?
  approvedAt  DateTime?
  
  // Relations
  order       PurchaseOrder   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  approver    User?           @relation("ApproverRelation", fields: [approverId], references: [id])
  
  @@unique([orderId, step])
}
```

### Enums
- **UserRole**: `REQUESTER`, `APPROVER1`, `APPROVER2`, `APPROVER3`, `APPROVER4`, `APPROVER5`
- **OrderStatus**: `PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`
- **ApprovalDecision**: `APPROVED`, `REJECTED`

## API/Action Descriptions

### Authentication Actions
- **Login/Signup**: Built-in Wasp authentication using username and password
- **Role-based access**: Users are assigned specific roles that determine their permissions

### Purchase Order Actions

#### `createPurchaseOrder`
**Purpose**: Creates a new purchase order and initializes the approval workflow

**Input Parameters**:
- `title` (string): The title of the purchase order
- `amount` (number): The monetary amount of the order

**Access Control**: Only users with `REQUESTER` role

**Logic**:
1. Validates user authentication and role
2. Validates input parameters (title and amount)
3. Creates the purchase order with status `PENDING`
4. Automatically creates 5 approval steps (steps 1-5)
5. Returns the created order with approval steps

#### `submitApprovalDecision`
**Purpose**: Processes approval or rejection decisions from approvers

**Input Parameters**:
- `approvalId` (number): The ID of the approval step
- `decision` (string): Either "APPROVED" or "REJECTED"
- `notes` (string, optional): Additional comments from the approver

**Access Control**: Only users with appropriate `APPROVER` role for the current step

**Logic**:
1. Validates user authentication and role
2. Verifies the approver is authorized for the current step
3. Ensures the approval step is currently pending
4. Saves the decision, notes, and timestamp
5. If approved: unlocks the next step or marks order as approved if final step
6. If rejected: marks the entire purchase order as rejected

#### `getPurchaseOrders`
**Purpose**: Retrieves purchase orders based on user role and permissions

**Access Control**:
- **Requesters**: Can only view their own created orders
- **Approvers**: Can only view orders that require their approval

**Logic**:
1. Filters orders based on user role
2. Includes approval timeline and current status
3. Returns formatted data for display

#### `getPendingApprovals`
**Purpose**: Retrieves approvals pending for the current user

**Access Control**: Only users with `APPROVER` roles

**Logic**:
1. Finds approval steps assigned to the current user
2. Filters for pending (undecided) approvals
3. Includes purchase order details

## Approval Flow Logic

### Sequential Approval Process

1. **Order Creation**
   - Requester creates a purchase order
   - System automatically creates 5 approval steps
   - Order status is set to `PENDING`
   - Only Step 1 is initially available for approval

2. **Approval Steps (1-5)**
   - Each step must be completed sequentially
   - Only the designated approver for each step can make decisions
   - Approvers can either `APPROVE` or `REJECT` with optional notes

3. **Approval Decision Logic**
   ```
   IF decision = APPROVED:
     - Save approval with timestamp
     - IF current step < 5:
       - Unlock next approval step
     - ELSE (step 5):
       - Mark entire order as APPROVED
   
   IF decision = REJECTED:
     - Save rejection with timestamp
     - Mark entire order as REJECTED
     - No further approvals required
   ```

4. **Final States**
   - **APPROVED**: All 5 approvers have approved the order
   - **REJECTED**: Any approver has rejected the order
   - **PENDING**: Order is still in the approval process

### Access Control Matrix

| Role | Create Orders | View Own Orders | View All Orders | Approve Step 1 | Approve Step 2 | ... | Approve Step 5 |
|------|---------------|-----------------|-----------------|----------------|----------------|-----|----------------|
| REQUESTER | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| APPROVER1 | ❌ | ❌ | Step 1 only | ✅ | ❌ | ❌ | ❌ |
| APPROVER2 | ❌ | ❌ | Step 2 only | ❌ | ✅ | ❌ | ❌ |
| APPROVER3 | ❌ | ❌ | Step 3 only | ❌ | ❌ | ✅ | ❌ |
| APPROVER4 | ❌ | ❌ | Step 4 only | ❌ | ❌ | ❌ | ✅ |
| APPROVER5 | ❌ | ❌ | Step 5 only | ❌ | ❌ | ❌ | ✅ |

### Timeline Component Features

- **Visual Progress Indicator**: Shows completion status of each step
- **Step Details**: Displays approver name, decision, timestamp, and notes
- **Status Icons**: Different icons for pending, approved, and rejected steps
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Updates**: Reflects current approval status

### Security Considerations

1. **Authentication Required**: All actions require user authentication
2. **Role-based Authorization**: Each action validates user role permissions
3. **Data Isolation**: Users can only access data relevant to their role
4. **Input Validation**: All inputs are validated on both client and server
5. **Audit Trail**: All approval decisions are logged with timestamps

### Error Handling

- Invalid user roles return 403 Forbidden
- Unauthorized access attempts return 401 Unauthorized
- Invalid input parameters return 400 Bad Request
- Database errors return 500 Internal Server Error
- Client-side validation prevents invalid form submissions