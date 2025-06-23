# ZigTask – Task Management App - Vo Thong Khoa

## 🛠 Tech Stack

### Backend (NestJS)

- **Framework:** NestJS
- **Language:** TypeScript
- **Database:** PostgreSQL
- **WebSocket:** Socket.IO
- **Database ORM:** TypeORM
- **Features:**
  - JWT-based authentication
  - Access token stored in cookie
  - Realtime task status updates via WebSockets
  - RESTful API for user and task management
- **Run project**
  - Create database from PostgreSQL
  - Add .env file following the .env.example
  - npm install
  - npm run start

### Frontend (React)

- **Framework:** React + TypeScript
- **UI Library:** Chakra UI
- **State Management:** Zustand
- **Features:**
  - Login / Register
  - Task creation and editing
  - Realtime task updates via WebSocket
  - Drag and drop tasks between status columns
  - Filter due date range
- **Run project**
  - Add .env file following the .env.example
  - npm install
  - npm run dev

---

## 🧱 Database Schema

- **User**
- **LoginSession**
- **Task**
