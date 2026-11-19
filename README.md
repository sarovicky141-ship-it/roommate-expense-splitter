# Roommate Expense Splitter

A small web app for groups to record shared expenses, see each member's
balance, and view suggested repayments.

## 1. Requirements

- Node.js 20.19+ or 22.12+
- npm
- MongoDB (a local installation or a MongoDB connection URI)

## 2. Installation and Setup

The submitted ZIP does not include `node_modules`. Extract the ZIP file, then
open the project folder in VS Code. Run the
following commands from the project root.

GitHub cloning is optional. If you prefer to clone the repository instead:

```powershell
git clone https://github.com/sarovicky141-ship-it/roommate-expense-splitter.git
cd roommate-expense-splitter
```

### Step 1: Install backend dependencies

```powershell
cd server
npm install
cd ..
```

This installs the backend packages.

### Step 2: Install frontend dependencies

```powershell
cd client
npm install
cd ..
```

This installs the frontend packages. Run `npm install` separately inside both
the `server` and `client` folders.

### Step 3: Configure environment variables

The project includes a root `.env.example` file. From the project root, create
`.env` from it:

```powershell
Copy-Item .env.example .env
```

Before starting the backend, update `MONGO_URI` in `.env` with your MongoDB
connection details. For a local MongoDB server, the settings can be:

```dotenv
MONGO_URI=your_mangoDb_uri
PORT=5000
CLIENT_URL=http://localhost:5173
```

`MONGO_URI` is required. `PORT` and `CLIENT_URL` are optional; they default to
`5000` and `http://localhost:5173`. Do not commit credentials or your `.env`
file. MongoDB must be running before you use database-backed features.

The frontend optionally accepts `VITE_API_URL`. Its default is
`http://localhost:5000/api`. To override it, set it in a client-side Vite env
file such as `client/.env.local`.

## 3. How to Run

Run the backend and frontend in separate terminals.

Backend:

```powershell
cd server
npm run dev
```

Frontend:

```powershell
cd client
npm run dev
```

Local URLs:

- Backend: [http://localhost:5000](http://localhost:5000)
- Frontend: [http://localhost:5173](http://localhost:5173)

## 4. Dependencies

**Frontend**

- React
- React DOM
- React Router DOM
- Vite
- `@vitejs/plugin-react`

**Backend**

- Express
- Mongoose
- dotenv
- cors

## 5. Features

- Create groups and add members.
- Add expenses, choose one payer, and select the members sharing each expense.
- View expense history and delete expenses.
- Calculate each member's paid amount, share, and balance.
- View suggested settlements and export expense and balance data as CSV.
- Delete a group and its associated expenses.
- Store groups and expenses in MongoDB.

## 6. Project Structure

```text
.
├── client/
│   ├── public/                 # Static images
│   └── src/
│       ├── components/         # Group, expense, dashboard, and shared UI
│       ├── hooks/              # Group and expense state
│       ├── pages/              # Groups and expenses pages
│       ├── services/           # Frontend API requests
│       └── utils/              # Currency and CSV helpers
├── server/
│   ├── config/                 # MongoDB connection
│   ├── controllers/            # Group, expense, balance, and settlement logic
│   ├── middleware/             # API error handling
│   ├── models/                 # Mongoose Group and Expense models
│   ├── routes/                 # API routes
│   └── tests/                  # Automated settlement tests
├── .env.example
└── README.md
```

The client contains the React/Vite application. The server contains the
Express API and MongoDB models.

## 7. API Endpoints

All endpoints are served from `http://localhost:5000`.

| Method | Endpoint | Description | Route File | Controller File and Function |
| --- | --- | --- | --- | --- |
| GET | `/api/health` | Reports API and MongoDB connection status. | [healthRoutes.js](server/routes/healthRoutes.js) | Inline handler in [healthRoutes.js](server/routes/healthRoutes.js); no separate controller. |
| GET | `/api/groups` | Lists saved groups. | [groupRoutes.js](server/routes/groupRoutes.js) | [groupController.js](server/controllers/groupController.js) — `getGroups` |
| GET | `/api/groups/:groupId` | Returns one group and its members. | [groupRoutes.js](server/routes/groupRoutes.js) | [groupController.js](server/controllers/groupController.js) — `getGroupById` |
| POST | `/api/groups` | Creates a group with at least two members. | [groupRoutes.js](server/routes/groupRoutes.js) | [groupController.js](server/controllers/groupController.js) — `createGroup` |
| DELETE | `/api/groups/:groupId` | Deletes a group and its associated expenses. | [groupRoutes.js](server/routes/groupRoutes.js) | [groupController.js](server/controllers/groupController.js) — `deleteGroup` |
| GET | `/api/groups/:groupId/expenses` | Lists a group's expenses. | [groupRoutes.js](server/routes/groupRoutes.js) | [expenseController.js](server/controllers/expenseController.js) — `getGroupExpenses` |
| POST | `/api/groups/:groupId/expenses` | Adds an expense to a group. | [groupRoutes.js](server/routes/groupRoutes.js) | [expenseController.js](server/controllers/expenseController.js) — `createExpense` |
| DELETE | `/api/groups/:groupId/expenses/:expenseId` | Deletes an expense from that group. | [groupRoutes.js](server/routes/groupRoutes.js) | [expenseController.js](server/controllers/expenseController.js) — `deleteExpense` |
| GET | `/api/groups/:groupId/balances` | Calculates each member's paid amount, share, and balance. | [groupRoutes.js](server/routes/groupRoutes.js) | [balanceController.js](server/controllers/balanceController.js) — `getGroupBalances` |
| GET | `/api/groups/:groupId/settlements` | Returns suggested payments between members. | [groupRoutes.js](server/routes/groupRoutes.js) | [settlementController.js](server/controllers/settlementController.js) — `getGroupSettlements` |

Expense amounts sent to the API use integer paise. The frontend converts rupee
amounts entered in the form to paise.

## 8. Assumptions

- A group needs a name and at least two members.
- Each expense has one payer, and the payer must belong to the group.
- At least one group member must be selected to share an expense. Selected
  members must belong to the group.
- Expenses are divided equally among the selected members.
- Money is stored and calculated as integer paise. Any remaining paise are
  assigned in the order of the `sharedAmong` list.
- Deleting an expense recalculates balances and settlements from the remaining
  expenses. Deleting a group also deletes its expenses.
- MongoDB stores group and expense data.
- Authentication is not included.

## 9. Test Scenarios

The following scenarios were used to check the main application features and
validations.

| Test Case | Steps | Expected Result |
| --- | --- | --- |
| Create a group | Enter a group name and at least two member names, then create it. | The group is created and appears in the group list. |
| Add an expense | Enter an expense description and amount, select a payer and sharing members, then submit. | The expense is saved and appears in the group's expense history. |
| Enter zero or a negative amount | Submit an expense with `0` or a negative amount. | The app rejects the amount; the API accepts only positive paise. |
| Add an expense without a payer | Leave the payer unselected and submit. | The app displays an error and does not create the expense. |
| View expense history | Open a group and navigate to its expense history. | The saved expenses are displayed with the correct details. |
| Calculate member balances | Add expenses with different payers and sharing members, then view the balances. | Each member's paid amount, share, and net balance are calculated correctly. |
| View settlement suggestions | Create expenses that result in members owing and receiving money. | The application displays the correct suggested payments between members. |
| Delete an expense | Delete an existing expense from the expense history. | The expense is removed, and the balances and settlements are updated. |
| Check data persistence | Restart the backend while using the same MongoDB database, then reload the app. | Saved groups and expenses remain available. |

## 10. Automated Tests

Run the backend tests from the `server` folder:

```powershell
cd server
npm test
```

The tests use Node.js's built-in `node:test` and `node:assert` modules. They
check a ₹500 debtor-to-creditor settlement and an expense shared only with its
payer, which should require no settlement.

## 11. Worked Example

**Group members:** Ravi, Anu, Kiran

**Expense 1**

- Description: Dinner
- Amount: ₹900
- Paid by: Ravi
- Shared among: Ravi, Anu, Kiran

**Expense 2**

- Description: Groceries
- Amount: ₹600
- Paid by: Anu
- Shared among: Anu, Kiran

| Member | Paid | Share | Net Balance |
| --- | ---: | ---: | ---: |
| Ravi | ₹900 | ₹300 | +₹600 |
| Anu | ₹600 | ₹600 | ₹0 |
| Kiran | ₹0 | ₹600 | -₹600 |

**Settlement:** Kiran pays ₹600 to Ravi.

A positive balance means the member should receive money. A negative balance
means the member owes money.

## 12. Data Persistence

MongoDB stores groups and expenses. Saved information remains available after
the backend restarts, provided it connects to the same database. The frontend
stores the selected group ID in browser storage and reloads expense, balance,
and settlement information from the backend.
