# Library Management System

A professional, full-stack, responsive **Library Management System** web application. Built with React (Vite) + Tailwind CSS on the frontend, and Node.js + Express + MySQL on the backend.

---

## Technical Architecture Overview

The application features a decoupled client-server architecture:
- **Frontend Client**: Built as a React SPA with Tailwind CSS styling and Recharts analytics. Uses state variables to route between views and manages dark/light modes.
- **Backend API Server**: Express REST backend implementing controllers for CRUD collections, stored procedure triggers, and relational reports.
- **Dual-Driver Failover**: Features a database adapter that connects to a MySQL pool. If no credentials are provided or connection times out, it automatically falls back to an **In-Memory Mock Database Driver**. This mock database mimics transactional inserts, trigger event side-effects, and executes all 10 custom SQL reports queries in JavaScript, allowing the application to be tested instantly out-of-the-box!

---

## Folder Structure

```
library-management-system/
├── README.md
├── package.json               # Root scripts runner
├── database/
│   ├── schema.sql            # Table DDL, triggers, stored procedures
│   └── sample_data.sql       # Seed data script
├── backend/
│   ├── server.js             # Express app entrypoint
│   ├── package.json
│   ├── .env.example
│   ├── config/
│   │   └── db.js             # MySQL connector & mock driver adapter
│   └── routes/
│       └── api.js            # REST API endpoints & reports
└── frontend/
    ├── package.json
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── index.html
    └── src/
        ├── main.jsx          # React app wrapper
        ├── App.jsx           # App shell layout & routing
        ├── index.css         # Styling directive rules
        ├── context/
        │   └── ThemeContext.jsx # Theme switcher
        ├── components/
        │   ├── Sidebar.jsx   # Menu drawer
        │   └── Navbar.jsx    # Stats, mode-toggles & DB indicator
        └── pages/
            ├── Login.jsx     # Admin credentials login
            ├── Dashboard.jsx # Key charts & trigger outputs
            ├── Books.jsx
            ├── Authors.jsx
            ├── Categories.jsx
            ├── Members.jsx
            ├── Issues.jsx    # Issue & Return book modules
            ├── Fines.jsx     # Fines management
            ├── Reports.jsx   # Tabular lists of 10 complex queries
            └── ProceduresTriggers.jsx # SP trigger tools & logs
```

---

## Database Schema Design

The application contains the following tables:
- **AUTHOR** (`author_id`, `name`, `country`)
- **CATEGORY** (`category_id`, `category_name`)
- **BOOK** (`book_id`, `title`, `price`, `category_id`, `author_id`, `availability`)
- **MEMBER** (`member_id`, `name`, `phone`, `email`)
- **ISSUE** (`issue_id`, `book_id`, `member_id`, `issue_date`, `due_date`, `return_date`)
- **FINE** (`fine_id`, `member_id`, `amount`, `paid_status`)

### Procedures & Triggers
1. **Trigger: `after_issue_insert`**: Updates book availability to `'Unavailable'` when a book is issued.
2. **Trigger: `after_issue_update`**: Sets book availability to `'Available'` when returned. If returned late, it automatically calculates overdue days and inserts a fine into `FINE`.
3. **Stored Procedure: `IssueBook()`**: Verifies book availability and inserts an issue record.
4. **Stored Procedure: `CalculateFine()`**: Outputs calculated fine amount dynamically based on overdue calendar days.

---

## Local Setup & Run

### Prerequisites
- Node.js installed (v16+)
- MySQL server running locally (Optional, falls back to Mock database automatically)

### Setup Instructions

1. **Clone & Open Workspace**:
   Navigate inside the project directory:
   ```bash
   cd library-management-system
   ```

2. **Setup Environment**:
   Under `backend/`, copy `.env.example` to `.env` and fill in your MySQL details:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=library_db
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=admin123
   ```

3. **Initialize Database (If using MySQL)**:
   Login to MySQL CLI or use a GUI tool like phpMyAdmin/DBeaver, and run:
   ```sql
   SOURCE database/schema.sql;
   SOURCE database/sample_data.sql;
   ```

4. **Install Dependencies**:
   Run the root installer script to configure concurrently and download package components:
   ```bash
   npm run install-all
   ```

5. **Start Dev Servers**:
   Run the boot script in the project root:
   ```bash
   npm run dev
   ```
   - Frontend runs on: `http://localhost:5173`
   - Backend API runs on: `http://localhost:5000`

---

## Deployment Guide

This project is structured to easily split and deploy the client (frontend) and API (backend) separately:

### 1. Frontend Client (Vercel / Netlify / GitHub Pages)
- The frontend is built on **Vite**.
- To build the production folder:
  ```bash
  cd frontend
  npm run build
  ```
  This creates a `frontend/dist` directory containing static HTML, CSS, and JS.
- **Vercel / Netlify Deployment**:
  1. Link your GitHub repository to Vercel/Netlify.
  2. Set the **Root Directory** configuration to `frontend`.
  3. Build Command: `npm run build`
  4. Output Directory: `dist`
  5. Set environment variable on frontend if necessary (repointing API fetch calls from `localhost:5000` to your deployed backend URL).

### 2. Backend API (Render / Railway)
- The API is an Express server.
- **Render / Railway Deployment**:
  1. Add a new Web Service and link your GitHub repository.
  2. Set the **Root Directory** configuration to `backend`.
  3. Start Command: `npm start`
  4. In the service's Environment settings, declare your variables:
     - `PORT`
     - `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` (pointing to your cloud-managed MySQL instance).
     - `ADMIN_USERNAME`, `ADMIN_PASSWORD`

### 3. Database Hosting (Aiven / PlanetScale / Railway MySQL)
- Provision a managed MySQL instance on Aiven or Railway.
- Run the `schema.sql` and `sample_data.sql` scripts in your hosted instance to populate tables.
- Reference the connection credentials in your Express backend configuration.
