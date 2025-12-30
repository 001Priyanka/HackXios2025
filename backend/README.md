# CropCare Backend API

Backend API for CropCare - Smart Crop Advisory Platform built with Node.js, Express, and MongoDB.

## 🚀 Features

- **Express.js** - Fast, unopinionated web framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **JWT Authentication** - Secure user authentication
- **CORS Enabled** - Cross-origin resource sharing
- **Environment Variables** - Secure configuration management
- **Error Handling** - Comprehensive error handling middleware
- **Health Check** - API health monitoring endpoint

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v14.0.0 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas)

## 🛠️ Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd CropCare/backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory and add:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017/cropcare

   # JWT Configuration
   JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_secure
   JWT_EXPIRE=30d

   # CORS Configuration
   CLIENT_URL=http://localhost:5173
   ```

4. **Start MongoDB:**
   Make sure MongoDB is running on your system:
   ```bash
   # For local MongoDB installation
   mongod
   
   # Or use MongoDB Atlas cloud database
   # Update MONGODB_URI in .env with your Atlas connection string
   ```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```
This starts the server with nodemon for automatic restarts on file changes.

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5000`

## 📡 API Endpoints

### Health Check
- **GET** `/api/health` - Check if the backend is running
  ```json
  {
    "status": "success",
    "message": "Backend is running",
    "timestamp": "2024-12-29T15:51:20.271Z",
    "uptime": 53.3385461,
    "environment": "development"
  }
  ```

### Root Endpoint
- **GET** `/` - Welcome message
  ```json
  {
    "message": "Welcome to CropCare API",
    "version": "1.0.0",
    "status": "Server is running successfully"
  }
  ```

### Future API Routes (To be implemented)
- **POST** `/api/auth/register` - User registration
- **POST** `/api/auth/login` - User login
- **GET** `/api/users/profile` - Get user profile
- **POST** `/api/advisory` - Submit crop advisory request
- **GET** `/api/advisory/:id` - Get advisory results
- **GET** `/api/market/prices` - Get market prices
- **POST** `/api/feedback` - Submit feedback

## 📁 Project Structure

```
backend/
├── config/
│   └── db.js              # MongoDB connection configuration
├── models/                # Mongoose models (to be added)
├── routes/                # Express routes (to be added)
├── middleware/            # Custom middleware (to be added)
├── controllers/           # Route controllers (to be added)
├── utils/                 # Utility functions (to be added)
├── .env                   # Environment variables
├── .gitignore            # Git ignore file
├── package.json          # Project dependencies and scripts
├── server.js             # Main server file
└── README.md             # This file
```

## 🔧 Dependencies

### Production Dependencies
- **express** (^4.18.2) - Web framework
- **mongoose** (^9.0.2) - MongoDB ODM
- **cors** (^2.8.5) - CORS middleware
- **bcryptjs** (^3.0.3) - Password hashing
- **jsonwebtoken** (^9.0.3) - JWT implementation
- **dotenv** (^17.2.3) - Environment variables

### Development Dependencies
- **nodemon** (^3.1.11) - Development server with auto-restart

## 🌍 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment mode | `development` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/cropcare` |
| `JWT_SECRET` | JWT secret key | Required |
| `JWT_EXPIRE` | JWT expiration time | `30d` |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:5173` |

## 🧪 Testing

Test the API endpoints using curl or Postman:

```bash
# Health check
curl http://localhost:5000/api/health

# Root endpoint
curl http://localhost:5000/

# Test 404 handling
curl http://localhost:5000/api/nonexistent
```

## 🔒 Security Features

- **CORS Configuration** - Restricts cross-origin requests
- **Environment Variables** - Sensitive data protection
- **Error Handling** - Prevents information leakage
- **JWT Ready** - Token-based authentication setup
- **Password Hashing** - bcryptjs for secure password storage

## 📝 Development Notes

### Adding New Routes
1. Create route files in the `routes/` directory
2. Create corresponding controllers in `controllers/`
3. Add route imports to `server.js`

### Database Models
- Create Mongoose models in the `models/` directory
- Follow consistent naming conventions
- Add proper validation and indexes

### Middleware
- Add custom middleware in the `middleware/` directory
- Common middleware: authentication, validation, logging

## 🚨 Error Handling

The API includes comprehensive error handling:

- **Development Mode**: Detailed error messages
- **Production Mode**: Generic error messages
- **404 Handling**: Custom not found responses
- **Unhandled Rejections**: Graceful server shutdown
- **Uncaught Exceptions**: Process exit with logging

## 📊 Monitoring

- **Health Check Endpoint**: `/api/health`
- **Server Uptime**: Included in health check response
- **Environment Info**: Current environment status
- **MongoDB Connection**: Connection status logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check MONGODB_URI in .env file
   - Verify network connectivity

2. **Port Already in Use**
   - Change PORT in .env file
   - Kill existing processes on port 5000

3. **Environment Variables Not Loading**
   - Ensure .env file exists
   - Check file permissions
   - Verify dotenv configuration

### Support

For support and questions, please create an issue in the repository.