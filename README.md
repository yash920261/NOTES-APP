# NOTES APP

A modern, secure, full-stack web application for organizing your thoughts and notes. Built with **React** + **Vite** on the frontend and **Node.js** + **Express** on the backend, featuring a glassmorphism design system.

## 🌟 Features

- **React Frontend**: Component-based UI with React Router, context-based auth state, and Vite for blazing-fast HMR.
- **Secure Authentication**: 
  - Complete signup, login, and logout flows.
  - Password hashing using `bcryptjs`.
  - Session management with `express-session`.
  - Protection against brute force with `express-rate-limit`.
- **Notes Management**: Create, edit, delete, color-code, and pin your personal notes.
- **Profile Customization**: Update display name, email, and password. View account statistics.
- **Zero-Config Database**: Uses `sql.js` (pure JavaScript SQLite) for lightning-fast, local data storage without needing native C++ build tools.

## 🛠️ Technology Stack

- **Frontend**: React, React Router, Vite
- **Backend**: Node.js, Express
- **Database**: SQLite (via `sql.js`)
- **Security**: `helmet`, `bcryptjs`, `express-rate-limit`

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)

### Installation

1. Clone the repository or download the source code.
2. Navigate to the project directory:
   ```bash
   cd DEKNEK
   ```
3. Install backend dependencies:
   ```bash
   npm install
   ```
4. Install frontend dependencies:
   ```bash
   cd client
   npm install
   cd ..
   ```
5. Create a `.env` file in the root directory:
   ```env
   PORT=3000
   SESSION_SECRET=your-super-secret-session-key
   NODE_ENV=development
   ```

### Running in Development

Start the backend (Express API on port 3000):
```bash
node server.js
```

In a separate terminal, start the frontend (React on port 5173):
```bash
cd client
npm run dev
```

Open your browser at `http://localhost:5173`.

### Running in Production

Build the React frontend and serve everything from Express:
```bash
npm run prod
```

Then open `http://localhost:3000`.

## 📁 Project Structure

```text
DEKNEK/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── components/     # Navbar, Toast, NoteModal
│   │   ├── context/        # AuthContext (global auth state)
│   │   ├── pages/          # Landing, Login, Signup, Dashboard
│   │   ├── App.jsx         # Routes and layout
│   │   ├── main.jsx        # Entry point
│   │   └── index.css       # Design system
│   ├── vite.config.js      # Vite config with API proxy
│   └── package.json
├── database/
│   └── init.js             # SQLite setup and helpers
├── middleware/
│   └── auth.js             # Session auth middleware
├── routes/
│   ├── auth.js             # Auth API endpoints
│   └── notes.js            # Notes CRUD endpoints
├── server.js               # Express entry point
├── package.json
└── .env
```

## 🔒 Security Features

- **Helmet**: Secures Express apps by setting various HTTP headers.
- **Rate Limiting**: Prevents brute-force attacks on authentication endpoints.
- **Password Hashing**: Passwords are never stored in plain text.
- **Session Cookies**: Configured with `httpOnly` and `sameSite` flags for enhanced security.
