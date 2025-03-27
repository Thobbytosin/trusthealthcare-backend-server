# Trust HealthCare - Backend API

_A secure medical appointment scheduling system_

## 🚀 Technologies Used

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: MongoDB (with Mongoose ODM)
- **Testing**: Jest (with Supertest)
- **File Storage**: Cloudinary
- **Caching**: Redis
- **Form Handling**: Formidable
- **Environment Management**: Dotenv

## 📦 Key Features

- Patient & doctor registration/auth (JWT)
- Appointment scheduling system
- Medical records management
- Real-time notifications
- Rate limiting & API security
- Image uploads (Cloudinary)
- Caching for high-performance (Redis)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Thobbytosin/trust-healthcare-backend.git
   cd trust-healthcare-backend
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Environment Setup**
   ```bash
   Create .env file based on .env.example
   ```
4. **Run the server**
   ```bash
   npm start
   (development mode): npm run dev
   ```

## 📡 API Endpoints

| Endpoint                         | Method | Description              | Auth Required |
| -------------------------------- | ------ | ------------------------ | ------------- |
| /api/v1/signup                   | POST   | User registration        | No            |
| /api/v1/account-verification     | POST   | Email verification       | Yes           |
| /api/v1/login                    | POST   | User Login               | No            |
| /api/v1/resend-verification-code | POST   | Resend verification code | Yes           |
| /api/v1/forgot-password          | POST   | User forgot password     | Yes           |
| /api/v1/reset-password           | POST   | User create new password | Yes           |
| /api/v1/me                       | GET    | Gets user information    | Yes           |

## 🧪 Testing

Run test

```bash
   npm test
```

## 🤝 Contributing

- Fork the project
- Create your feature branch (git checkout -b feature/AmazingFeature)
- Commit your changes (git commit -m 'Add some AmazingFeature')
- Push to the branch (git push origin feature/AmazingFeature)
- Open a Pull Request

## 📜 License

Distributed under the MIT License. See LICENSE for more information.

## 📬 Contact

Project Maintainer - Falode Tobi
Project Link: https://github.com/Thobbytosin/trust-healthcare-backend
