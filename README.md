📘 Smart Campus Management System
PAF – IT3030 Group Project (2026)
🚀 Overview

The Smart Campus Management System is a full-stack web application designed to manage campus resources efficiently. It allows users to track assets, manage stock, and monitor resources through a centralized system.

🎯 Features
Resource management (Add, update, delete)
Stock tracking by aisle, row, and item
Low stock alerts and near-expiry tracking
Search and filtering
Role-based access control
Dashboard for monitoring
🏗️ Tech Stack
Frontend: React / Next.js
Backend: Spring Boot (Java)
Database: MySQL / Oracle
API: REST
⚙️ Setup Guide
1. Clone Repository
git clone https://github.com/BIMSARA15/it3030-paf-2026-smart-campus-group17.git
cd it3030-paf-2026-smart-campus-group17
2. Backend Setup
cd backend
./mvnw spring-boot:run
3. Frontend Setup
cd frontend
npm install
npm run dev
4. Database Configuration

Add this to your application.properties file:

spring.datasource.url=jdbc:mysql://localhost:3306/your_db
spring.datasource.username=your_username
spring.datasource.password=your_password
🔌 API Endpoints
Method	Endpoint	Description
GET	/resources	Get all resources
POST	/resources	Add resource
PUT	/resources/{id}	Update resource
DELETE	/resources/{id}	Delete resource
📁 Project Structure
backend/
  controllers/
  services/
  models/
  repositories/

frontend/
  components/
  pages/
  services/
👥 Team
Asiri Tennakoon
Bimsara
Other members
🚧 Future Improvements
Mobile app
AI-based predictions
QR tracking
Notifications
📜 License

Academic project (IT3030 – PAF)
