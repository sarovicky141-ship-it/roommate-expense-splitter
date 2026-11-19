# Roommate Expense Splitter

Stages 1 through 7 establish the React/Vite client, Express/Mongoose server,
MongoDB connection, database models, group and expense creation, balance
calculation, settlement suggestions, and expense listing and deletion.

## Requirements

- Node.js 20.19+ or 22.12+
- npm
- MongoDB running locally, or a MongoDB connection URI

## Setup

From the project root, install each app's dependencies:

```powershell
cd client
npm install
cd ..\server
npm install
cd ..
Copy-Item .env.example .env
```

Set `MONGO_URI` in `.env` to your MongoDB connection string. Never commit
`.env`; `.env.example` contains placeholders only.

## Run

Start the backend in one terminal:

```powershell
cd server
npm run dev
```

Start the frontend in another terminal:

```powershell
cd client
npm run dev
```

Vite prints the frontend URL (normally `http://localhost:5173`). The API listens
on port `5000` by default. `CLIENT_URL` controls the frontend origin allowed by
CORS, and `PORT` controls the API port.

## Dependencies

### Client

- `react` and `react-dom`: render the browser UI.
- `react-router-dom`: navigate between the Groups and Expenses pages.
- `vite`: development server and production bundler.
- `@vitejs/plugin-react`: React support in Vite.

### Server

- `express`: HTTP server and REST routing.
- `mongoose`: MongoDB connection and data modeling.
- `dotenv`: load root `.env` settings.
- `cors`: allow requests from the configured frontend origin.

## Frontend structure

- `src/components/`: reusable header, group, expense, dashboard, and common UI
  components.
- `src/pages/GroupsPage.jsx` and `src/pages/ExpensesPage.jsx`: compose the two
  application pages.
- `src/hooks/useGroups.js`: loads saved groups and manages the selected group.
- `src/hooks/useExpenses.js`: loads and updates the selected group's dashboard.
- `src/services/`: shared request handling and group/expense API functions.
- `src/utils/currency.js`: formats paise as rupees and validates rupee input.
- `src/utils/expenseCsv.js`: formats the selected group's expense and backend
  balance data as two escaped CSV sections.
- `src/App.jsx`: owns shared application state and routes; `/` redirects to
  `/groups`.

The shared header links to `/groups` and `/expenses`. The selected group ID is
preserved in browser storage, so opening or refreshing `/expenses` restores the
selected group while expense history, balances, and settlements are fetched
again from the backend.

## API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Reports API/database status. Returns `200` when MongoDB is connected and `503` while it is disconnected. |
| GET | `/api/groups` | Lists saved groups so the frontend can restore them after a page refresh. Returns `{ "groups": [...] }`. |
| GET | `/api/groups/:groupId` | Returns one saved group and its members. Returns `400` for an invalid ID or `404` if the group does not exist. |
| POST | `/api/groups` | Creates a group from a name and at least two named members. Returns `201` on success or `400` for invalid input. |
| POST | `/api/groups/:groupId/expenses` | Creates an expense for an existing group. Returns `201`, `400` for invalid input/member IDs, or `404` if the group does not exist. |
| GET | `/api/groups/:groupId/expenses` | Lists group expenses with payer and sharing-member names and IDs. Returns an empty array when the group has no expenses. |
| DELETE | `/api/groups/:groupId/expenses/:expenseId` | Deletes the specified expense only if it belongs to the group. Returns `400` for invalid IDs and `404` if the group or expense is missing. |
| GET | `/api/groups/:groupId/balances` | Returns each member's total paid, total share, and net balance in paise. Returns `400` for an invalid ID or `404` if the group does not exist. |
| GET | `/api/groups/:groupId/settlements` | Returns suggested payments in integer paise. Returns `400` for an invalid ID or `404` if the group does not exist. |

If MongoDB is unavailable, the API still listens so its health endpoint can
report a degraded state; the connection failure is logged explicitly.

The group endpoint expects JSON such as
`{"name":"Flatmates","members":[{"name":"Ari"},{"name":"Bo"}]}`.
`express.json()` parses the request body and makes that object available as
`request.body` in the controller.

The client loads saved groups from `GET /api/groups` when the page opens. It
stores only the selected group ID in browser storage; expense history, balances,
and settlement suggestions are reloaded from the API for that group.

The expense endpoint expects JSON such as:

```json
{
  "description": "Groceries",
  "amountPaise": 90000,
  "paidBy": "memberId",
  "sharedAmong": ["memberId1", "memberId2"]
}
```

Replace the example IDs with the group's actual ID in the URL and member IDs
from the group's `members` array. The payer and every sharing member must
belong to that group, and sharing member IDs must be unique.

The expense-list endpoint is a `GET` request with no body. A populated response
looks like:

```json
{
  "groupId": "...",
  "expenses": [
    {
      "expenseId": "...",
      "description": "Groceries",
      "amountPaise": 90000,
      "paidBy": { "memberId": "...", "name": "Ari" },
      "sharedAmong": [
        { "memberId": "...", "name": "Ari" },
        { "memberId": "...", "name": "Bo" }
      ],
      "createdAt": "..."
    }
  ]
}
```

For a group with no expenses, `expenses` is an empty array. Delete an expense
with a `DELETE` request to
`/api/groups/{groupId}/expenses/{expenseId}`; no request body is needed. A
successful response is:

```json
{
  "message": "Expense deleted successfully.",
  "expenseId": "..."
}
```

Deletion removes only the expense whose ID and group ID both match. Balances
and settlements are calculated from the remaining expenses, so they update
automatically after deletion.

The balances endpoint returns all members, including members with no expenses.
For each expense it divides `amountPaise` evenly among `sharedAmong` using
integer division, then assigns any remainder paise in the stored member order.
The response contains `totalPaidPaise`, `totalSharePaise`, and
`netBalancePaise` for every member; net balance is total paid minus total share.
For example, 10,000 paise shared by three members allocates 3,334, 3,333, and
3,333 paise in `sharedAmong` order.

The settlements endpoint uses those net balances. It matches debtors with
creditors, adding payments from `from` to `to` for `amountPaise`, until their
balances are settled. Members with zero balances are left out. A group with no
expenses returns an empty `settlements` array. For example:

```json
{
  "groupId": "...",
  "groupName": "Flatmates",
  "settlements": [
    {
      "from": { "memberId": "...", "name": "Bo" },
      "to": { "memberId": "...", "name": "Ari" },
      "amountPaise": 60000
    }
  ]
}
```

Debtor amounts are converted to positive paise with `Math.abs()`. Each payment
is the smaller of the remaining debtor amount and creditor amount
(`Math.min()`), so neither party is overpaid.

## Database models

- `Group` stores a trimmed group name and at least two embedded members.
  Mongoose gives each member subdocument its own `_id`.
- `Expense` stores the group ObjectId, description, positive integer paise
  amount, payer member ID, sharing member IDs, and creation date. Its `group`
  field references the `Group` model. Member IDs refer to embedded member
  subdocuments and are checked against the group by the expense creation API.

## Assumptions and future test scenarios

- Groups require a non-empty name and at least two members.
- Balance calculation splits each expense in integer paise. Any leftover
  paise from an indivisible split is assigned one at a time in `sharedAmong`
  order so the shares sum exactly to the expense total.
- The expense payer must belong to the group, and only group members may share
  an expense.
- Expense payer and sharing-member IDs refer to embedded member subdocuments;
  the expense API validates that they belong to the selected group.
- The APIs validate group and expense creation requests. Deleting an expense
  removes only that expense; balances and settlements recalculate from the
  expenses that remain.

## Implementation status

The project includes initialization, MongoDB connection setup, configured
CORS, error handling, Group and Expense schemas, group and expense APIs,
balance and settlement calculations, and the frontend for managing saved
groups, expenses, balances, and settlement suggestions.
