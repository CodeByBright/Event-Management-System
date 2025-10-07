# Event Management System

A full-stack event management application with a mobile frontend and backend service.

## Features

- User authentication (sign up, login)
- Create and manage events
- View event details
- Responsive mobile interface
- RESTful API backend

## Project Structure

```
Event Management System/
├── backend/         # Backend server code (Python/FastAPI)
├── frontend     # Mobile app (React Native)
```

## Getting Started

### Prerequisites

- Node.js (for mobile app)
- Python 3.8+ (for backend)
- postgreSQL (for database)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd "Event Management System"
   ```

2. Set up the backend:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. Set up the frontend app
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

1. Start the backend server:
   ```bash
   cd backend
   uvicorn main:app --reload
   ```

2. Start the frontend app
   ```bash
   cd ../frontend
   npx expo start
   ```

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```
DATABASE_URL=your_database_connection_string
SECRET_KEY=your_secret_key
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

Email: josephbrightakpan@gmail.com

Project Link: [https://github.com/Dev-Kelz/Event-Management-System](https://github.com/Dev-Kelz/event-management-system)