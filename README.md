# Smart Mini-Ledger

A lightweight MERN financial ledger built for the Bytex Junior Full Stack Engineer challenge. The app supports a shared single-instance ledger where users can create, view, update, delete, search, filter, categorize, summarize, and monitor transactions without authentication.

The project goes beyond basic CRUD with backend-powered notification alerts and a **Smart Spending Risk Meter** that turns ledger data into simple cashflow intelligence.

## Highlights

- Transaction CRUD for income and expenses
- Backend search and filtering by text, type, and category
- Backend summary aggregation for income, expenses, and net balance
- Notification settings with a saved alert email
- Gmail/Nodemailer alert trigger for high-risk transactions
- Smart Spending Risk Meter with projected safe days, top spending category, and anomaly detection
- Responsive React dashboard using Bootstrap components
- Defensive backend validation and non-blocking email error handling

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, Vite, React Router, React Bootstrap, Bootstrap, React Toastify |
| Backend | Node.js, Express 5, Mongoose |
| Database | MongoDB |
| Email | Nodemailer with Gmail App Password auth |
| Tooling | oxlint, npm scripts |

## Project Structure

```txt
smart-mini-ledger-app/
  client/
    src/
      components/
        layout/
        transactions/
      hooks/
      pages/
      services/
      types/
      utils/
  server/
    src/
      config/
      constants/
      controllers/
      middleware/
      models/
      routes/
      utils/
```

## Core Workflows

### Transaction Workflow

1. The dashboard loads transactions through `GET /api/transactions`.
2. Search, type filter, and category filter are sent to the backend as query params.
3. The backend builds a MongoDB query and returns only matching transactions.
4. Create, update, and delete actions call the backend API.
5. After mutations, the frontend refreshes summary and insights.

Search/filter are intentionally backend-owned, not duplicated in frontend state.

### Summary Workflow

1. The frontend calls `GET /api/transactions/summary`.
2. The backend uses MongoDB aggregation to sum income and expenses.
3. Net balance is calculated as `income - expense`.
4. The dashboard renders total income, total expenses, and balance cards.

### Notification Workflow

1. The settings panel loads saved notification settings from `GET /api/settings`.
2. The user saves an email using `PUT /api/settings`.
3. When a transaction is created, the backend checks alert conditions:
   - expense amount greater than `5000`
   - balance drops below `0` after the transaction
4. If either condition is true, the backend reads the saved email from `Settings`.
5. If no email is configured, the API logs `No notification email configured`.
6. If email sending fails, the error is logged but the transaction still succeeds.
7. The create response includes `alertTriggered` and `alertReasons`, so the frontend can show a demo-friendly toast.

**Why a settings panel instead of authentication:** The challenge doesn't ask for user accounts or authentication, and this app is a single shared ledger, not multi-tenant. Sending an alert email still needs *an* email address to send to — but that's just a stored value, not a login credential. Rather than hardcoding a fixed email (which would break for anyone else testing the app), a small settings panel lets whoever is running the instance save their own notification email. This solves "who gets notified" without introducing authentication, which the brief never required.

## Unique Twist: Smart Spending Risk Meter

The Smart Spending Risk Meter is the main product twist. Instead of stopping at static totals, the app uses recent ledger behavior to estimate spending risk.

It is powered by `GET /api/transactions/insights` and calculates:

- **Risk Level**: `Safe`, `Watch`, or `Risky`
- **Daily Expense Average**: average expense pace over the last 30 days
- **Projected Safe Days**: current balance divided by average daily expense
- **Top Category**: highest-spend category in the recent 30-day window
- **Unusual Expenses**: recent expenses that are at least 2x their category average and greater than `1000`

Example:

```txt
Net Balance: ₹10,241
Daily Expense Avg: ₹158.63
Projected Safe Days: 65 days
```

This means the balance is expected to stay safe for about 65 days if the user continues spending at the same pace and no new income is added.

## API Endpoints

### Transactions

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/transactions` | List transactions, with optional `search`, `type`, and `category` query params |
| GET | `/api/transactions/summary` | Get total income, total expenses, and balance |
| GET | `/api/transactions/insights` | Get smart spending risk insights |
| GET | `/api/transactions/:id` | Get one transaction |
| POST | `/api/transactions` | Create a transaction and optionally trigger alert email |
| PUT | `/api/transactions/:id` | Update a transaction |
| DELETE | `/api/transactions/:id` | Delete a transaction |

### Settings

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/settings` | Get saved notification settings |
| PUT | `/api/settings` | Create or update the notification email |

## Data Models

### Transaction

```js
{
  title: String,
  amount: Number,
  type: 'income' | 'expense',
  category: 'salary' | 'freelance' | 'food' | 'transport' | 'utilities' | 'entertainment' | 'other',
  date: Date,
  note: String
}
```

### Settings

```js
{
  notifyEmail: String
}
```

The app has no users, so there is only one settings document. Updates use `findOneAndUpdate` with `upsert: true`.

## Installation

### Prerequisites

- Node.js
- npm
- MongoDB running locally or a MongoDB Atlas URI
- Gmail account with an App Password if email alerts should be tested

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd smart-mini-ledger-app
```

### 2. Install Backend Dependencies

```bash
cd server
npm install
```

### 3. Configure Backend Environment

Create `server/.env` from the example:

```bash
cp .env.example .env
```

Example:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/smart-mini-ledger
CLIENT_URL=http://localhost:5173
EMAIL_USER=your-gmail-address@gmail.com
EMAIL_APP_PASSWORD=your-gmail-app-password
```

Email variables are optional for normal CRUD. If they are missing or invalid, alert email sending may fail, but transaction creation still succeeds.

### 4. Start Backend

```bash
npm run dev
```

Backend runs at:

```txt
http://localhost:5000
```

### 5. Install Frontend Dependencies

Open a second terminal:

```bash
cd client
npm install
```

### 6. Start Frontend

```bash
npm run dev
```

Frontend runs at:

```txt
http://localhost:5173
```

## Useful Scripts

### Backend

```bash
npm run dev
npm start
```

### Frontend

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## Demo Guide

1. Start MongoDB, backend, and frontend.
2. Open `http://localhost:5173`.
3. Add income, such as salary.
4. Add expenses across categories.
5. Try search and filters; results come from backend query params.
6. Open Alert Settings and save a notification email.
7. Add an expense greater than `5000`.
8. Confirm the frontend toast says an alert was triggered.
9. Add enough expense to make balance negative and confirm the alert behavior.
10. Review the Smart Spending Risk Meter for risk level, projected safe days, top category, and unusual expenses.

## Error Handling and Production Polish

- Form validation exists on the frontend before submit.
- Backend validates required transaction fields and amount rules.
- Invalid MongoDB IDs return `400`.
- Missing records return `404`.
- Email failures are caught and logged without breaking transaction creation.
- Search/filter logic is centralized on the backend to avoid conflicting frontend/backend results.
- Initial page loading does not interrupt the search input during background filter requests.

## AI Tools Used

I used a mix of AI tools for different parts of this project, split roughly between code generation and design reasoning.

- **Code generation**: GitHub Copilot, Cursor, and Codex were used for scaffolding — Express routes and controllers, React components (transaction table, add/edit modal, filters, settings panel), API service functions, and MongoDB aggregation queries for the summary and insights endpoints. I ended up switching between all three mainly because I hit free-tier usage limits partway through the project, not because the app needed that much AI assistance — for a project this size, one tool would normally be enough.
- **Design and reasoning**: I used Claude for thinking through ambiguous parts of the brief before writing any code — most notably, how to implement a "notification" feature on an app with no authentication, what "send notifications via any medium" actually required versus what it didn't, and reasoning through the design of the Smart Spending Risk Meter (what signals to combine, what thresholds made sense, and how to keep it single-instance-friendly with no user accounts).
- Documentation structure

## Where AI Fell Short

- **Ambiguous requirement interpretation**: The brief mentions "internal feature to send notifications via any medium" without specifying what should trigger it or how it should work without user accounts. My first instinct was that this implied authentication, since the system would need to know *whose* email to notify. Working through this with Claude, I realized authentication was never actually required — a single settings document is enough for a single-instance, no-login app.
- **Duplicate filtering logic**: Copilot's initial suggestion duplicated search/filter logic on the frontend on top of what the backend already handled, creating two sources of truth. I removed the frontend duplication so search and filter are driven only by backend query params.
- **Loading UX bug**: The generated data-fetching logic triggered a full-page loading state on every keystroke in the search box, which caused the input to lose focus while typing. I fixed this by only showing full-page loading on the initial fetch, not on subsequent filter/search requests.
- **Notification safety**: The first version of the email-sending logic didn't isolate failures — a bad SMTP credential could have blocked the transaction creation response entirely. I wrapped the email call so a failed send is logged but never fails the underlying API request.

## Security Notes

- Do not commit real `.env` files.
- Use Gmail App Passwords instead of normal Gmail passwords.
- Rotate any app password that was accidentally exposed locally or in commits.
- This challenge app intentionally has no authentication, so all users share one ledger and one notification email.

### Email Delivery: Local vs Production

This project uses two email delivery methods depending on environment:

- **Local development**: Nodemailer over SMTP (Gmail + App Password). Works reliably on localhost and can send to any recipient.
- **Production (Render)**: Resend's HTTP API. Render's free tier blocks outbound SMTP ports (25/465/587), so Nodemailer fails in production with `ENETUNREACH` or connection timeout errors. Since Resend sends over HTTPS, it isn't affected by this restriction.

**Known limitation**: Resend's sandbox sender (`onboarding@resend.dev`) can only deliver to the account owner's own email address without a verified custom domain. This is a platform restriction, not an application bug — the underlying alert pipeline (event detection → message formatting → send) is fully functional and demonstrated in the attached demo video using the account owner's inbox as the recipient. In a real production deployment, this would be resolved by verifying a custom sending domain with Resend.

## Future Improvements

- Add pagination for large transaction lists.
- Add date-range filters.
- Add CSV import/export.
- Add backend tests for alert triggers and insights.
- Add Docker Compose for MongoDB, backend, and frontend.
- Add deployment instructions for Render/Railway/Vercel or AWS.
