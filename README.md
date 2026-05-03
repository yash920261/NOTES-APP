# NOTES APP

A modern, secure, full-stack web application for organizing your thoughts and notes. Built with Node.js, Express, and a beautiful vanilla HTML/CSS/JS frontend featuring a glassmorphism design system.

## 🌟 Features

- **Modern UI/UX**: Stunning glassmorphism design with animated backgrounds, responsive layouts, and smooth transitions.
- **Secure Authentication**: 
  - Complete signup, login, and logout flows.
  - Password hashing using `bcryptjs`.
  - Session management with `express-session`.
  - Protection against brute force with `express-rate-limit`.
- **Notes Management**: Create, edit, delete, color-code, and pin your personal notes.
- **Profile Customization**: Update display name, email, and password. View account statistics.
- **Zero-Config Database**: Uses `sql.js` (pure JavaScript SQLite) for lightning-fast, local data storage without needing native C++ build tools.

## 🛠️ Technology Stack

- **Backend**: Node.js, Express
- **Database**: SQLite (via `sql.js`)
- **Security**: `helmet`, `bcryptjs`, `express-rate-limit`
- **Frontend**: HTML5, CSS3 (Vanilla), JavaScript (Vanilla)

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher recommended)

### Installation

1. Clone the repository or download the source code.
2. Navigate to the project directory:
   ```bash
   cd DEKNEK
   ```
3. Install the dependencies:
   ```bash
   npm install
   ```
4. Create a `.env` file in the root directory (or use the existing one) and configure your environment variables:
   ```env
   PORT=3000
   SESSION_SECRET=your-super-secret-session-key
   NODE_ENV=development
   ```

### Running the Application

To start the server in production mode:
```bash
npm start
```

To start the server in development mode (using nodemon for hot-reloading):
```bash
npm run dev
```

Once the server is running, open your browser and navigate to `http://localhost:3000`.

## 📁 Project Structure

```text
DEKNEK/
├── database/
│   └── init.js         # SQLite database initialization and helper functions
├── middleware/
│   └── auth.js         # Authentication middleware for protected routes
├── public/             # Frontend static files
│   ├── css/
│   │   └── style.css   # Global styles and design system
│   ├── dashboard.html  # Protected dashboard UI
│   ├── index.html      # Landing page
│   ├── login.html      # Login page
│   └── signup.html     # Signup page
├── routes/
│   ├── auth.js         # Authentication API endpoints
│   └── notes.js        # Notes CRUD API endpoints
├── server.js           # Express application entry point
├── package.json        # Project metadata and dependencies
└── .env                # Environment variables
```

## 🔒 Security Features

- **Helmet**: Secures Express apps by setting various HTTP headers.
- **Rate Limiting**: Prevents brute-force attacks on authentication endpoints.
- **Password Hashing**: Passwords are never stored in plain text.
- **Session Cookies**: Configured with `httpOnly` and `sameSite` flags for enhanced security.
