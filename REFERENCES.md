# Skillswap Project - References & Documentation

## Tech Stack & Dependencies

### Frontend (React)
| Package | Version | Documentation |
|---------|---------|----------------|
| **react** | 19.2.4 | https://react.dev |
| **react-dom** | 19.2.4 | https://react.dev/reference/react-dom |
| **react-router-dom** | 7.13.1 | https://reactrouter.com |
| **axios** | 1.13.6 | https://axios-http.com |
| **socket.io-client** | 4.8.3 | https://socket.io/docs/v4/client-api |
| **react-hot-toast** | 2.6.0 | https://react-hot-toast.com |
| **tailwindcss** | 3.4.19 | https://tailwindcss.com |
| **lucide-react** | 0.577.0 | https://lucide.dev |

### Backend (Node.js/Express)
| Package | Version | Documentation |
|---------|---------|----------------|
| **express** | 5.2.1 | https://expressjs.com |
| **mongoose** | 9.2.4 | https://mongoosejs.com |
| **socket.io** | 4.8.3 | https://socket.io/docs/v4/server-api |
| **jsonwebtoken** | 9.0.3 | https://github.com/auth0/node-jsonwebtoken |
| **bcryptjs** | 3.0.3 | https://github.com/dcodeIO/bcrypt.js |
| **multer** | 2.1.1 | https://github.com/expressjs/multer |
| **express-validator** | 7.3.1 | https://express-validator.github.io/docs |
| **cors** | 2.8.6 | https://github.com/expressjs/cors |
| **dotenv** | 17.3.1 | https://github.com/motdotla/dotenv |

### Database
| Service | Documentation |
|---------|----------------|
| **MongoDB** | https://docs.mongodb.com |
| **Mongoose ODM** | https://mongoosejs.com |
| **MongoDB Atlas** | https://www.mongodb.com/docs/atlas |

### Development Tools
| Tool | Version | Purpose |
|------|---------|---------|
| **nodemon** | 3.1.14 | Auto-restart Node.js during development |
| **react-scripts** | 5.0.1 | Create React App build tools |
| **testing-library** | v10.4.1, v6.9.1, v16.3.2 | Testing utilities |

---

## Deployment & Hosting

### Frontend Hosting
- **Platform:** Vercel
- **Documentation:** https://vercel.com/docs
- **Deployment:** Connected to GitHub repository
- **Build Command:** `npm run build`
- **Output:** Static React build

### Backend Hosting
- **Platform:** Render
- **Documentation:** https://render.com/docs
- **Configuration:** `render.yaml`
- **Build Command:** `npm install`
- **Start Command:** `npm start`

### Database Hosting
- **Platform:** MongoDB Atlas (Cloud)
- **Documentation:** https://www.mongodb.com/docs/atlas
- **Connection:** Connection string via environment variables

---

## Authentication & Security

| Feature | Technology | Documentation |
|---------|-----------|----------------|
| **Password Hashing** | bcryptjs | https://github.com/dcodeIO/bcrypt.js |
| **JWT Tokens** | jsonwebtoken | https://jwt.io |
| **CORS** | cors middleware | https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS |
| **Input Validation** | express-validator | https://express-validator.github.io |
| **Environment Variables** | dotenv | https://github.com/motdotla/dotenv |

---

## Real-time Communication

| Feature | Library | Documentation |
|---------|---------|----------------|
| **WebSocket** | Socket.io | https://socket.io/docs |
| **Real-time Events** | Socket.io | https://socket.io/docs/v4/socket-events |

---

## API & Data Validation

### Express Middleware
- **CORS:** Cross-Origin Resource Sharing
- **Body Parser:** Built into Express for JSON/form data
- **Auth Middleware:** JWT verification
- **Validation:** express-validator for request validation

### Request Validation Examples
```javascript
// Example validation
const { body, validationResult } = require('express-validator');

const validateUser = [
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
];
```

---

## File Upload & Storage

| Feature | Technology |
|---------|-----------|
| **File Upload** | Multer middleware |
| **Storage** | Local `/uploads` directory |
| **Supported Types** | Images, documents (configurable) |

---

## Testing

| Framework | Purpose |
|-----------|---------|
| **@testing-library/react** | React component testing |
| **@testing-library/jest-dom** | Custom Jest matchers |
| **jest** | Test runner (via react-scripts) |

---

## External Resources

### Learning Resources
- **Node.js Best Practices:** https://nodejs.org/en/docs/guides
- **Express.js Guide:** https://expressjs.com/en/guide/routing.html
- **React Documentation:** https://react.dev
- **MongoDB University:** https://university.mongodb.com
- **Socket.io Tutorial:** https://socket.io/docs/v4/tutorial

### Tools & Utilities
- **Postman:** API testing - https://www.postman.com
- **MongoDB Compass:** Database GUI - https://www.mongodb.com/products/compass
- **VS Code Extensions:**
  - Thunder Client (API testing)
  - MongoDB for VS Code
  - REST Client

### Performance & Monitoring
- **React DevTools:** https://react.dev/learn/react-developer-tools
- **Redux DevTools:** https://github.com/reduxjs/redux-devtools
- **Network Monitoring:** Chrome DevTools
- **Web Vitals:** https://web.dev/vitals

---

## Environment Variables Reference

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/skillswap
JWT_SECRET=your_secret_key_here
CLIENT_URL=http://localhost:3000
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
REACT_APP_API_ORIGIN=http://localhost:5000
```

---

## Useful Commands

### Backend
```bash
npm install              # Install dependencies
npm run dev              # Start with auto-reload (nodemon)
npm start                # Start production server
npm audit                # Check for vulnerabilities
npm audit fix            # Fix vulnerabilities
```

### Frontend
```bash
npm install              # Install dependencies
npm start                # Start development server
npm run build            # Build for production
npm test                 # Run tests
npm run eject            # Eject from Create React App (irreversible)
```

---

## API Documentation

### Base URL
- **Local:** `http://localhost:5000/api`
- **Production:** `https://<render-service>.onrender.com/api`

### Main Routes
- **Auth:** `/auth` - Register, Login, Logout
- **Users:** `/users` - Profile, Search
- **Chats:** `/chat` - Messages
- **Sessions:** `/sessions` - Booking, Management
- **Swaps:** `/swaps` - Swap Requests
- **Reviews:** `/reviews` - Ratings and Reviews
- **Call Logs:** `/callLogs` - Call History
- **Upload:** `/upload` - File Uploads

---

## Community & Support

- **GitHub:** https://github.com/Radhil-33/skillswap
- **Stack Overflow:** https://stackoverflow.com/questions/tagged/express+socket.io+react
- **Discord Communities:** Node.js, React, MongoDB communities
- **MongoDB Community:** https://www.mongodb.com/community

---

## License & Attribution

- **Project:** Skillswap
- **Author:** Radhil-33
- **Repository:** https://github.com/Radhil-33/skillswap
- **License:** (Add your license here)

---

## Additional Resources

### Tutorials
- Socket.io Real-time Chat: https://socket.io/docs/v4/tutorial
- MERN Stack Tutorial: https://www.mongodb.com/languages/mern-stack-tutorial
- JWT Authentication: https://jwt.io/introduction

### Security Best Practices
- **OWASP Top 10:** https://owasp.org/www-project-top-ten
- **Node.js Security:** https://nodejs.org/en/docs/guides/security
- **MongoDB Security:** https://docs.mongodb.com/manual/security

### Performance Optimization
- **React Performance:** https://react.dev/learn/render-and-commit
- **Express Optimization:** https://expressjs.com/en/advanced/best-practice-performance.html
- **MongoDB Indexing:** https://docs.mongodb.com/manual/indexes
