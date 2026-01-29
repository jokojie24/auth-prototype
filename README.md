# Auth Prototype

A demonstration of various authentication methods including traditional passwords, Multi-Factor Authentication (MFA), and Passkeys (WebAuthn).

## Features

- **Standard Authentication**: Username and password login.
- **MFA (Multi-Factor Authentication)**: Time-based One-Time Password (TOTP) integration.
- **Passkeys**: Passwordless authentication using WebAuthn/FIDO2.

## Tech Stack

- **Backend**: Node.js, Express
- **Database**: SQLite3
- **Authentication**: 
    - `bcrypt` for password hashing
    - `@simplewebauthn/server` & `@simplewebauthn/browser` for Passkeys
    - `uuid` for session/user management

## Prerequisites

- Node.js (v14+ recommended)

## Installation

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

Start the server:
```bash
npm start
```

The application will run at `http://localhost:3000` (or the port specified in your console).

## License

ISC
