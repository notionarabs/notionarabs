# Notion Arabs - Authentication System

A complete authentication system for the Notion Arabs platform with Arabic language support.

## Features

### Backend (Express.js + MongoDB)

- ✅ User registration and login
- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ User profile management
- ✅ Role-based access control (user, creator, admin)
- ✅ Input validation and error handling
- ✅ Arabic error messages

### Frontend (Next.js)

- ✅ Login and signup pages
- ✅ User profile management
- ✅ Authentication context with React hooks
- ✅ Protected routes
- ✅ Responsive design with Arabic RTL support
- ✅ Integration with existing design system

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the backend directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/notion-arabs
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
FRONTEND_URL=http://localhost:3000
```

4. Start the backend server:

```bash
npm run dev
```

The backend will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file in the frontend directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

4. Start the frontend development server:

```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## API Endpoints

### Authentication Routes (`/api/auth`)

- `POST /register` - Register a new user
- `POST /login` - Login user
- `GET /me` - Get current user profile
- `PUT /profile` - Update user profile
- `POST /change-password` - Change user password
- `POST /logout` - Logout user

### Request/Response Examples

#### Register User

```javascript
POST /api/auth/register
{
  "name": "أحمد محمد",
  "email": "ahmed@example.com",
  "password": "password123",
  "role": "user"
}
```

#### Login User

```javascript
POST /api/auth/login
{
  "email": "ahmed@example.com",
  "password": "password123"
}
```

## Frontend Pages

- `/login` - Login page
- `/signup` - Registration page
- `/profile` - User profile page (protected)

## Authentication Context

The `useAuth` hook provides:

- `user` - Current user data
- `isAuthenticated` - Authentication status
- `isLoading` - Loading state
- `login(credentials)` - Login function
- `register(userData)` - Register function
- `logout()` - Logout function
- `updateProfile(profileData)` - Update profile function

## Protected Routes

Use the `ProtectedRoute` component to protect pages:

```javascript
import ProtectedRoute from "../components/ProtectedRoute";

export default function ProtectedPage() {
  return (
    <ProtectedRoute>
      <div>Protected content</div>
    </ProtectedRoute>
  );
}
```

## User Roles

- `user` - Regular user (default)
- `creator` - Can create and sell templates
- `admin` - Full access

## Security Features

- Password hashing with bcrypt
- JWT tokens with expiration
- Input validation and sanitization
- CORS configuration
- Error handling without sensitive data exposure

## Arabic Language Support

- All UI text in Arabic
- RTL (Right-to-Left) layout support
- Arabic error messages
- Proper form validation messages in Arabic

## Testing the Authentication Flow

1. Start both backend and frontend servers
2. Visit `http://localhost:3000`
3. Click "إنشاء حساب" to register
4. Fill in the registration form
5. After successful registration, you'll be logged in automatically
6. Visit `/profile` to see your profile page
7. Test logout functionality

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**

   - Ensure MongoDB is running
   - Check the MONGODB_URI in your .env file

2. **CORS Errors**

   - Verify FRONTEND_URL in backend .env matches your frontend URL

3. **JWT Token Issues**

   - Ensure JWT_SECRET is set in backend .env
   - Check token expiration (default: 30 days)

4. **API Connection Issues**
   - Verify NEXT_PUBLIC_API_URL in frontend .env
   - Ensure backend server is running on the correct port

## Production Deployment

### Backend

- Use a production MongoDB instance (MongoDB Atlas)
- Set secure JWT_SECRET
- Configure proper CORS origins
- Use environment variables for all sensitive data

### Frontend

- Build the application: `npm run build`
- Deploy to Vercel, Netlify, or your preferred platform
- Set production API URL in environment variables

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details
"# notion-arabs" 
