# 🏦 Meilleur Bank

> A simulated digital banking backend built with Node.js, Express, and MongoDB — integrating with the NibssByPhoenix API for identity verification, account management, and fund transfers.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Install Dependencies](#2-install-dependencies)
  - [3. Register on NibssByPhoenix](#3-register-on-nibssbyphoenix)
  - [4. Environment Setup](#4-environment-setup)
  - [5. Start MongoDB](#5-start-mongodb)
  - [6. Run the Server](#6-run-the-server)
- [Seeding Identity Records](#seeding-identity-records)
  - [Why Seeding Is Necessary](#why-seeding-is-necessary)
  - [How to Seed](#how-to-seed)
  - [Available Test Identities](#available-test-identities)
- [Using the Implementation Guide](#using-the-implementation-guide)
- [API Reference](#api-reference)
  - [Auth Routes](#auth-routes)
  - [Customer Routes](#customer-routes)
  - [Account Routes](#account-routes)
  - [Banking Routes](#banking-routes)
- [Testing with ThunderClient](#testing-with-thunderclient)
- [System Architecture](#system-architecture)
- [Data Privacy & Isolation](#data-privacy--isolation)
- [Error Handling](#error-handling)
- [Key Rules & Constraints](#key-rules--constraints)
- [Troubleshooting](#troubleshooting)

---

## Project Overview

Meilleur Bank is a backend system for a simulated digital bank. It was built as part of the TSA Backend Engineering Assignment and integrates with **NibssByPhoenix** — a mock NIBSS (Nigeria Inter-Bank Settlement System) — to handle:

- Identity verification via BVN and NIN
- Bank account creation tied to verified identities
- Intra-bank and inter-bank fund transfers
- Transaction tracking with strict per-customer data isolation

The system enforces core banking rules: a customer must pass KYC verification before an account can be created, and each customer is limited to one account.

```
Client (ThunderClient / Frontend)
         │
         ▼
  Meilleur Bank API  (Express — port 3000)
         │                    │
         ▼                    ▼
     MongoDB            NibssByPhoenix API
  (your data)         (identity + transfers)
```

**Bank Details:**

- Bank Name: `MEI Bank`
- Bank Code: `798`
- NIBSS Base URL: `https://nibssbyphoenix.onrender.com`
- Swagger Docs: `https://nibssbyphoenix.onrender.com/api/docs`

---

## Tech Stack

| Layer          | Technology                                |
| -------------- | ----------------------------------------- |
| Runtime        | Node.js v18+                              |
| Framework      | Express.js                                |
| Database       | MongoDB + Mongoose                        |
| Authentication | JSON Web Tokens (jsonwebtoken) + bcryptjs |
| HTTP Client    | Axios                                     |
| Validation     | Joi                                       |
| Environment    | dotenv / dotenvx                          |
| Dev Server     | Nodemon                                   |

---

## Prerequisites

Make sure the following are installed on your machine before getting started:

- **Node.js** v18 or higher — [nodejs.org](https://nodejs.org)
- **MongoDB** (local) — [mongodb.com](https://www.mongodb.com/try/download/community) or use MongoDB Atlas
- **Git** — [git-scm.com](https://git-scm.com)
- **ThunderClient** (VS Code extension) or **Postman** for API testing
- A terminal (Git Bash, PowerShell, or any Unix shell)

---

## Project Structure

```
meilleur-bank/
├── seed/
│   └── seedIdentities.js       # One-time script to insert fake BVN/NIN records
├── src/
│   ├── config/
│   │   └── db.js               # MongoDB connection (local vs Atlas)
│   ├── controllers/
│   │   ├── auth.controller.js      # Register + Login logic
│   │   ├── customer.controller.js  # KYC verification logic
│   │   ├── account.controller.js   # Account creation + retrieval
│   │   └── banking.controller.js   # Transfer, balance, history, name enquiry
│   ├── middleware/
│   │   ├── authenticate.js     # Verifies your Meilleur Bank JWT
│   │   ├── isVerified.js       # Blocks unverified customers from account creation
│   │   ├── validate.js         # Joi validation factory
│   │   └── errorHandler.js     # Global error handler
│   ├── models/
│   │   ├── customer.model.js   # Customer schema (with password hashing)
│   │   ├── account.model.js    # Account schema (1-per-customer enforced)
│   │   └── transaction.model.js # Transaction schema with data isolation
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── customer.routes.js
│   │   ├── account.routes.js
│   │   └── banking.routes.js
│   ├── services/
│   │   └── nibss.service.js    # All NibssByPhoenix API calls + token management
│   ├── validators/
│   │   └── schemas.js          # Joi schemas for all request bodies
│   └── app.js                  # Express app entry point
├── .env                        # Production environment variables (never commit)
├── .env.local                  # Local development environment variables
├── .env.example                # Template showing required env variables
├── .gitignore
├── implementation-guide.md     # Detailed step-by-step build reference
├── package.json
└── README.md
```

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/meilleur-bank.git
cd meilleur-bank
```

---

### 2. Install Dependencies

```bash
npm install
```

This installs all required packages listed in `package.json`:

```
express, mongoose, axios, jsonwebtoken, bcryptjs, dotenv, joi, nodemon
```

---

### 3. Register on NibssByPhoenix

> Skip this step if you already have your `apiKey`, `apiSecret`, and `bankCode`.

Before running the app, you need to register Meilleur Bank with the NibssByPhoenix API to receive your credentials. Run this once in your terminal:

```bash
curl -X POST https://nibssbyphoenix.onrender.com/api/fintech/onboard \
  -H "Content-Type: application/json" \
  --ssl-no-revoke \
  -d "{\"name\": \"Meilleur Bank\", \"email\": \"your@email.com\"}"
```

**Response:**

```json
{
  "apiKey": "your_api_key",
  "apiSecret": "your_api_secret",
  "bankCode": "798",
  "bankName": "MEI Bank",
  "message": "Fintech already onboarded"
}
```

Save the `apiKey`, `apiSecret`, and `bankCode` — you will need them in the next step.

> If you see `"Fintech already onboarded"` it means your email was already registered. The credentials returned are still valid — use them.

---

### 4. Environment Setup

The project uses two environment files — one for local development and one for production. An example template is provided:

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in your values:

```env
PORT=3000
NODE_ENV=development

# Local MongoDB
MONGODB_URI_LOCAL=mongodb://localhost:27017/meilleur-bank

# JWT — generate this yourself (see note below)
JWT_SECRET=your_generated_secret_here

# NibssByPhoenix credentials (from step 3)
NIBSS_BASE_URL=https://nibssbyphoenix.onrender.com
NIBSS_API_KEY=your_api_key_here
NIBSS_API_SECRET=your_api_secret_here
NIBSS_BANK_CODE=798
NIBSS_BANK_NAME=MEI Bank
```

**Generating a secure JWT_SECRET:**

Run this in your terminal and paste the output into `.env.local`:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

> The `JWT_SECRET` is a string only your server knows. It signs and verifies customer login tokens. Never share it or commit it to git.

**For production** (MongoDB Atlas), fill in `.env` instead:

```env
PORT=3000
NODE_ENV=production

MONGODB_URI_ATLAS=mongodb+srv://username:password@cluster.mongodb.net/meilleur-bank

JWT_SECRET=your_production_secret

NIBSS_BASE_URL=https://nibssbyphoenix.onrender.com
NIBSS_API_KEY=your_api_key_here
NIBSS_API_SECRET=your_api_secret_here
NIBSS_BANK_CODE=798
NIBSS_BANK_NAME=MEI Bank
```

---

### 5. Start MongoDB

**Local MongoDB:**

```bash
# macOS / Linux
mongod

# Windows (run as administrator)
net start MongoDB
```

**Or use MongoDB Atlas** — create a free cluster at [cloud.mongodb.com](https://cloud.mongodb.com), get your connection string, and paste it into `MONGODB_URI_ATLAS` in `.env`.

---

### 6. Run the Server

**Development (with auto-reload):**

```bash
npm run dev
```

**Production:**

```bash
npm start
```

**Expected output:**

```
🏦 Meilleur Bank running on port 3000
✅ MongoDB connected
```

The server is now running at `http://localhost:3000`.

---

## Seeding Identity Records

### Why Seeding Is Necessary

Meilleur Bank uses NibssByPhoenix as its mock NIBSS for identity verification. Before a customer can register and pass KYC, their BVN or NIN must already exist in the NibssByPhoenix database.

Since no real BVNs or NINs are allowed, you seed fake ones manually using the seed script. These records are inserted into the **NibssByPhoenix database** — not your MongoDB. Think of it as pre-populating the national identity registry with test data.

```
npm run seed
      │
      ▼
seed/seedIdentities.js
      │
      ▼
POST /api/insertBvn  ──▶  NibssByPhoenix database
POST /api/insertNin  ──▶  NibssByPhoenix database
```

### How to Seed

Make sure your `.env.local` is set up and the server dependencies are installed, then run:

```bash
npm run seed
```

The script will output success or error messages for each record. If you see `"BVN already exists"` or `"NIN already exists"` — that is fine. It means the record was seeded in a previous run and is already available for testing.

> Run this script **once** before you start testing. You do not need to run it again unless you add new identities to the seed file.

### Available Test Identities

Use these exact values when registering test customers. The DOB must match what NibssByPhoenix has on record — using a different DOB will cause KYC verification to fail.

| Type | ID            | First Name  | Last Name | DOB (use exactly) |
| ---- | ------------- | ----------- | --------- | ----------------- |
| BVN  | `74829163057` | Obiageli    | Oduenyi   | `1988-03-17`      |
| BVN  | `36150947823` | Chukwuemeka | Ozoemenam | `1993-11-29`      |
| NIN  | `58203746819` | Adaeze      | Nwanneka  | `1996-07-04`      |
| NIN  | `12433445572` | Kamchi      | Bello     | `1978-10-05`      |

> These identities are shared on the NibssByPhoenix platform. If a colleague has already used one of these BVNs to create an account, account creation for that identity may be blocked. Use a different identity from the table in that case.

---

## Using the Implementation Guide

The file `implementation-guide.md` in the root of this project is the full step-by-step build reference for Meilleur Bank. It covers every phase of the project from environment setup to testing.

**How to use it:**

Open `implementation-guide.md` alongside your editor as you build. It is organised into phases that mirror the build order:

| Phase   | What it covers                                   |
| ------- | ------------------------------------------------ |
| Phase 0 | Bootstrap, credentials, project scaffold         |
| Phase 1 | Database models (Customer, Account, Transaction) |
| Phase 2 | NIBSS service layer, KYC verification flow       |
| Phase 3 | Account creation with 1-account enforcement      |
| Phase 4 | Core banking — transfers, balance, name enquiry  |
| Phase 5 | Transaction history with data isolation          |
| Phase 6 | Auth system — register, login, JWT middleware    |
| Phase 7 | Error handling and Joi validation                |

**Key things to note:**

- The routes in the implementation guide under `src/routes/` are **your own Meilleur Bank routes** — they do not appear in the NibssByPhoenix Swagger docs. The Swagger docs only show NibssByPhoenix's own endpoints.
- The NIBSS service layer (`src/services/nibss.service.js`) wraps all external NibssByPhoenix calls. Your controllers call the service, not the NIBSS API directly.
- The guide includes code for every file. If a file already exists, compare what you have against the guide and update accordingly.
- Follow the **Build Order table** in Section 12 of the guide — some files depend on others being in place first.

---

## API Reference

All endpoints are relative to `http://localhost:3000` in development.

For protected routes, include the JWT token from login in every request header:

```
Authorization: Bearer <your_token>
```

---

### Auth Routes

#### Register a Customer

```
POST /api/auth/register
```

No authentication required.

**Request body:**

```json
{
  "firstName": "Obiageli",
  "lastName": "Oduenyi",
  "email": "obiageli@meilleurbank.com",
  "password": "Password123",
  "kycType": "bvn",
  "kycId": "74829163057",
  "dob": "1988-03-17"
}
```

| Field       | Type   | Rules                         |
| ----------- | ------ | ----------------------------- |
| `firstName` | string | required                      |
| `lastName`  | string | required                      |
| `email`     | string | required, valid email, unique |
| `password`  | string | required, min 8 characters    |
| `kycType`   | string | required, `"bvn"` or `"nin"`  |
| `kycId`     | string | required, exactly 11 digits   |
| `dob`       | string | required, format `YYYY-MM-DD` |

**Response (201):**

```json
{
  "message": "Registration successful. Please complete KYC verification.",
  "customerId": "68123abc..."
}
```

---

#### Login

```
POST /api/auth/login
```

No authentication required.

**Request body:**

```json
{
  "email": "obiageli@meilleurbank.com",
  "password": "Password123"
}
```

**Response (200):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "customer": {
    "id": "68123abc...",
    "name": "Obiageli Oduenyi",
    "email": "obiageli@meilleurbank.com",
    "isVerified": false
  }
}
```

> Save the `token` — you will use it as `Bearer <token>` in the Authorization header for all subsequent requests.

---

### Customer Routes

#### Verify KYC

```
POST /api/customers/verify
```

Requires JWT. No request body needed — the server reads the customer's `kycType`, `kycId`, and `dob` from the database and validates against NibssByPhoenix.

**Response (200):**

```json
{
  "message": "KYC verification successful",
  "customer": {
    "name": "Obiageli Oduenyi",
    "isVerified": true
  }
}
```

> This must succeed before account creation is allowed.

---

### Account Routes

#### Create Account

```
POST /api/accounts/create
```

Requires JWT + completed KYC. No request body needed.

**Response (201):**

```json
{
  "message": "Account created successfully",
  "account": {
    "accountNumber": "0123456789",
    "bankCode": "798",
    "bankName": "MEI Bank",
    "balance": 15000
  }
}
```

> Each customer can only create one account. Attempting a second will return a 409 error.

---

#### Get My Account

```
GET /api/accounts/me
```

Requires JWT.

**Response (200):**

```json
{
  "account": {
    "accountNumber": "0123456789",
    "bankCode": "798",
    "bankName": "MEI Bank",
    "balance": 15000,
    "createdAt": "2026-04-27T..."
  }
}
```

---

### Banking Routes

#### Check Balance

```
GET /api/banking/balance
```

Requires JWT. Returns both your local balance and the live balance from NibssByPhoenix.

**Response (200):**

```json
{
  "accountNumber": "0123456789",
  "localBalance": 13000,
  "nibssBalance": 13000
}
```

---

#### Name Enquiry

```
GET /api/banking/name-enquiry/:accountNumber
```

Requires JWT. Use this to verify a recipient before sending a transfer.

**Example:**

```
GET /api/banking/name-enquiry/0123456789
```

**Response (200):**

```json
{
  "accountName": "Chukwuemeka Ozoemenam",
  "accountNumber": "0123456789",
  "bankCode": "798"
}
```

---

#### Transfer Funds

```
POST /api/banking/transfer
```

Requires JWT. Supports both intra-bank (same bank) and inter-bank transfers.

**Request body:**

```json
{
  "toAccount": "0987654321",
  "amount": 2000,
  "narration": "Payment for services"
}
```

| Field       | Type   | Rules                       |
| ----------- | ------ | --------------------------- |
| `toAccount` | string | required, exactly 10 digits |
| `amount`    | number | required, positive          |
| `narration` | string | optional                    |

**Response (201):**

```json
{
  "message": "Transfer successful",
  "transactionId": "TXN-abc123...",
  "status": "success"
}
```

> The transfer type (intra or inter) is determined automatically based on whether the destination account belongs to MEI Bank.

---

#### Transaction Status

```
GET /api/banking/transaction/:transactionId
```

Requires JWT. Returns the status of a specific transaction. Only accessible to the customer who initiated it.

**Response (200):**

```json
{
  "transactionId": "TXN-abc123...",
  "status": "success",
  "amount": 2000,
  "from": "0123456789",
  "to": "0987654321",
  "type": "intra",
  "date": "2026-04-27T19:52:05.869Z"
}
```

---

#### Transaction History

```
GET /api/banking/transactions
```

Requires JWT. Returns only the authenticated customer's own transactions. Supports pagination.

**Query parameters:**

| Param   | Default | Description      |
| ------- | ------- | ---------------- |
| `page`  | `1`     | Page number      |
| `limit` | `10`    | Results per page |

**Example:**

```
GET /api/banking/transactions?page=1&limit=5
```

**Response (200):**

```json
{
  "transactions": [
    {
      "transactionId": "TXN-abc123...",
      "type": "intra",
      "amount": 2000,
      "status": "success",
      "createdAt": "2026-04-27T..."
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "pages": 1
  }
}
```

---

#### All Accounts (Admin)

```
GET /api/banking/accounts
```

Requires JWT. Returns all accounts created under MEI Bank (bankCode `798`) from NibssByPhoenix. Intended for admin/internal use.

**Response (200):**

```json
{
  "accounts": [...]
}
```

---

## Testing with ThunderClient

ThunderClient is a VS Code extension for making HTTP requests — similar to Postman but built into your editor.

**Install it:** Open VS Code → Extensions → search `Thunder Client` → Install.

**Recommended test sequence:**

```
1. POST /api/auth/register        → create Customer 1 (BVN: 74829163057)
2. POST /api/auth/login           → get JWT token for Customer 1
3. POST /api/customers/verify     → verify KYC for Customer 1
4. POST /api/accounts/create      → create account for Customer 1
5. GET  /api/accounts/me          → confirm account details

6. POST /api/auth/register        → create Customer 2 (BVN: 36150947823)
7. POST /api/auth/login           → get JWT token for Customer 2
8. POST /api/customers/verify     → verify KYC for Customer 2
9. POST /api/accounts/create      → create account for Customer 2

10. GET  /api/banking/balance              → check Customer 1 balance
11. GET  /api/banking/name-enquiry/:acct   → verify Customer 2 account name
12. POST /api/banking/transfer             → send ₦2,000 from Customer 1 to Customer 2
13. GET  /api/banking/transaction/:id      → check transfer status
14. GET  /api/banking/transactions         → view Customer 1 history
15. GET  /api/banking/accounts             → view all MEI Bank accounts
```

**Setting the Authorization header in ThunderClient:**

After login, copy the token. In ThunderClient, go to the `Auth` tab on your request, select `Bearer Token`, and paste the token. ThunderClient will automatically add the `Authorization: Bearer <token>` header.

---

## System Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Meilleur Bank API                   │
│                                                      │
│  Routes → Controllers → Services → NibssByPhoenix   │
│               ↓                                      │
│          Middleware                                  │
│    (authenticate, isVerified, validate)              │
│               ↓                                      │
│            MongoDB                                   │
│   (Customer, Account, Transaction)                   │
└─────────────────────────────────────────────────────┘
```

**Request lifecycle example (transfer):**

```
POST /api/banking/transfer
        │
        ▼
  authenticate.js        ← verifies your Meilleur Bank JWT
        │
        ▼
  banking.controller.js  ← checks ownership, validates balance
        │
        ▼
  nibss.service.js       ← auto-refreshes NIBSS token if needed
        │
        ▼
  POST /api/transfer     ← NibssByPhoenix processes the transfer
        │
        ▼
  MongoDB                ← saves transaction record locally
        │
        ▼
  Response to client
```

**Two separate token systems:**

| Token             | Created by                          | Used for                         | Visible to customer?  |
| ----------------- | ----------------------------------- | -------------------------------- | --------------------- |
| Meilleur Bank JWT | Your server on login                | Authenticating your API requests | ✅ Yes                |
| NIBSS JWT         | NibssByPhoenix on `/api/auth/token` | Authenticating calls to NIBSS    | ❌ No — internal only |

---

## Data Privacy & Isolation

Every database query that touches accounts or transactions is scoped to the authenticated customer. No customer can access another customer's data.

The rule applied throughout every controller:

```js
// ✅ Always include customerId in queries
const transactions = await Transaction.find({ customerId: req.user.id });
const account = await Account.findOne({ customerId: req.user.id });

// ❌ Never query without ownership check
const account = await Account.findOne({ accountNumber }); // exposes all accounts
```

Transaction status checks also enforce this — a customer can only query a transaction they initiated.

---

## Error Handling

All errors are caught by the global `errorHandler.js` middleware and returned in a consistent format:

```json
{
  "success": false,
  "message": "Human-readable error description"
}
```

Common error codes:

| Code | Meaning                                                             |
| ---- | ------------------------------------------------------------------- |
| 400  | Bad request — missing/invalid fields, DOB mismatch                  |
| 401  | Unauthorized — missing or invalid JWT                               |
| 403  | Forbidden — KYC not completed, or accessing another customer's data |
| 404  | Not found — customer, account, or transaction doesn't exist         |
| 409  | Conflict — email already registered, account already exists         |
| 500  | Internal server error — check server logs                           |

---

## Key Rules & Constraints

| Rule                     | Detail                                                                                                                             |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| No real BVNs/NINs        | Only use the seeded fake identities from the test table                                                                            |
| One account per customer | Enforced at both the database level (`unique: true` on `customerId`) and controller level                                          |
| KYC before account       | `isVerified` middleware blocks account creation until KYC passes                                                                   |
| Data isolation           | Every query for accounts or transactions must be scoped to `customerId: req.user.id`                                               |
| NIBSS token is internal  | The NIBSS JWT is managed silently by `nibss.service.js` — customers only receive your Meilleur Bank JWT                            |
| ₦15,000 pre-funding      | Applied locally at account creation — NIBSS manages its own balance state separately                                               |
| DOB format               | Always `YYYY-MM-DD` — NibssByPhoenix returns timestamps with `T00:00:00.000Z` which the KYC controller normalizes before comparing |

---

## Troubleshooting

**`curl: (35) schannel: CRYPT_E_NO_REVOCATION_CHECK`**

Windows SSL issue. Add `--ssl-no-revoke` to your curl command, or use ThunderClient/Postman instead.

---

**`MongoDB connection error`**

Make sure MongoDB is running locally (`mongod`) or your Atlas connection string in `.env.local` is correct and your IP is whitelisted in Atlas.

---

**`KYC verification failed — date of birth does not match`**

The DOB you registered with does not match what NibssByPhoenix has for that BVN/NIN. Use the exact DOB from the [Available Test Identities](#available-test-identities) table.

---

**`BVN already exists` when seeding**

Not an error — the BVN was seeded in a previous run. The record is already on NibssByPhoenix and ready to use.

---

**`Customer already has an account` on account creation**

That customer (logged-in JWT) already created an account. Log in as a different customer and try again, or check MongoDB to confirm.

---

**`Authorization token required`**

You forgot to add the `Authorization: Bearer <token>` header. Copy the token from your login response and add it to the request.

---

**NIBSS API returns unexpected response shape**

The `nibss.service.js` wraps all NIBSS calls. If NIBSS changes its response shape, update the service layer and the affected controller. Always log `nibssResult` during debugging to inspect the exact shape returned.

---

_Meilleur Bank — TSA Backend Engineering Assignment | April 2026_
