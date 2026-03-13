<div style="color: black;">

# AMN Pickle - Enterprise Fintech Store

AMN Pickle is a professional, full-stack e-commerce platform specializing in premium handcrafted pickles. Built with a focus on fintech-grade security and a seamless user experience, it features a robust Razorpay payment integration, role-based authentication, and a powerful admin management suite.

---

## Key Features

### Customer Experience
- Seamless Shopping: Modern, responsive UI with glassmorphism design and smooth animations.
- Dynamic Cart & Checkout: Real-time order summary before payment.
- Fintech Integration: Secure end-to-end payment processing via Razorpay PG.
- Digital Invoices: Instant printable PDF-style bill generation upon successful payment.
- Account Management: Secure user registration, login, and password recovery.

### Admin Capabilities
- Product Management: Full CRUD operations for products (Create, Read, Update, Delete).
- Image Uploads: Upload product images directly via a dedicated admin uploader (powered by Multer).
- Stock Tracking: Monitor and manage inventory levels in real-time.
- Business Insights: View and manage all products and order statuses.
- Protected Access: Multi-layered admin authentication requiring a secure secret code for registration.

---

## Tech Stack

### Frontend
- Framework: React 19 (Vite)
- Language: TypeScript
- Styling: Tailwind CSS 4.0 (Modern utility-first architecture)
- Icons: Lucide React
- HTTP Client: Axios with interceptors for token handling

### Backend
- Runtime: Node.js
- Framework: Express.js
- Database: MongoDB (Mongoose ODM)
- Security: JWT, BcryptJS, Helmet, Express Rate Limit, Zod validation
- Storage: Multer for local product image processing

---

## Project Structure

```text
AMN-Pickle/
├── frontend/             # React (Vite) Application
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Main application views (Store, Admin, Auth)
│   │   ├── services/     # API abstraction layer
│   │   ├── context/      # Auth & Global state
│   │   └── types/        # TypeScript interfaces
│   └── public/           # Static assets
├── backend/              # Express.js Server
│   ├── src/
│   │   ├── controllers/  # Business logic
│   │   ├── models/       # Mongoose schemas
│   │   ├── routes/       # API endpoints
│   │   ├── middleware/   # Auth & Security layers
│   │   └── config/       # Environment variables & DB connection
│   └── uploads/          # Product image storage
├── package.json          # Root build orchestration
└── render.yaml           # Deployment configuration for Render
```

---

## Getting Started

### 1. Prerequisities
- Node.js (v18+)
- MongoDB Atlas Account
- Razorpay Test Credentials (Key ID & Secret)

### 2. Installation
```text
# Install root orchestration dependencies
npm install

# Install all workspace dependencies (Frontend & Backend)
npm run install:all
```

### 3. Environment Setup
Create a .env file in the backend directory:
```text
PORT=5001
MONGODB_URI=your_mongodb_connection_string
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
JWT_SECRET=your_long_random_jwt_secret
ADMIN_CODE=ADMIN2024
USER_RESET_CODE=USERRESET2024
ADMIN_RESET_CODE=ADMINRESET2024
NODE_ENV=development
```

### 4. Running Locally
```text
# Start backend (from /backend)
npm run dev

# Start frontend (from /frontend)
npm run dev
```

---

## Admin Account Setup

To access the Admin Dashboard, you must first register an administrator account:
1. Navigate to the Signup page and select the "Admin" role.
2. Enter the ADMIN_CODE (default: ADMIN2024) to authorize the registration.
3. Once registered, log in to access the management panel at /admin.

---

## Environment Variable Reference

- PORT: The port the server runs on (Production default: 5001).
- MONGODB_URI: Connection string for your MongoDB database.
- RAZORPAY_KEY_ID: Public key from your Razorpay dashboard.
- RAZORPAY_KEY_SECRET: Secret key from your Razorpay dashboard.
- RAZORPAY_WEBHOOK_SECRET: Secret used to verify Razorpay webhook signatures.
- JWT_SECRET: Private key used to sign and verify user authentication tokens.
- ADMIN_CODE: Secret code required to register a new admin account.
- USER_RESET_CODE: Code used for user password reset verification.
- ADMIN_RESET_CODE: Code used for admin password reset verification.

---

## API Reference (Quick View)

### Authentication
- POST /api/auth/register : Register a new user or admin.
- POST /api/auth/login : Authenticate and receive a JWT token.
- POST /api/auth/reset-password : Recover account access.
- GET /api/auth/me : Retrieve current account details.

### Products
- GET /api/products : Fetch all active products (Public).
- GET /api/admin/products : Fetch all products including inactive (Admin).
- POST /api/admin/products : Create a new product with image upload (Admin).
- PUT /api/admin/products/:id : Update product details or image (Admin).
- DELETE /api/admin/products/:id : Deactivate a product (Admin).

### Orders & Payments
- POST /api/orders : Create a new order in the system.
- POST /api/payments/verify : Validate Razorpay payment signature.
- POST /api/webhooks/razorpay : Process incoming Razorpay events.

---

## Deployment (Render)

The project is configured for Zero-Config Deployment on Render as a single web service.

1. Push your code to a GitHub repository.
2. In Render, create a New Blueprint Instance.
3. Connect your repository.
4. Render will automatically read render.yaml and set up the build pipeline:
   - Build Command: npm run build
   - Start Command: npm start
5. Configure the environment variables in the Render dashboard.

Note: In the Render Free Tier, product images uploaded to the local /uploads directory will be reset when the server restarts. For permanent storage, an external provider is recommended.

---

## Security & Best Practices

- Role-Based Access Control (RBAC): Distinct permissions for Admins and Customers.
- Payload Validation: Strict Zod schemas for all API requests.
- Request Hardening: Helmet for secure headers and Rate Limiting to prevent brute force.
- Secret Management: Passwords hashed with Bcrypt (10 rounds) and protected reset flows.
- Graceful Shutdown: Server handles SIGTERM and SIGINT to close DB connections cleanly.

---

## License
This project is licensed under the ISC License.

Developed by ARULMJURUGAN N

</div>
