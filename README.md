📘 Smart Campus Management System

PAF – IT3030 Group Project (2026)

🚀 Overview

The Smart Campus Management System is a full-stack web application designed to streamline campus resource management. It enables administrators and users to efficiently manage, track, and monitor resources such as assets, stock, and campus facilities through a centralized digital platform.

This system focuses on improving operational efficiency, visibility, and decision-making within a smart campus environment.

🎯 Key Features
🔹 Resource Management
Add, update, and delete campus resources
Categorize and organize assets efficiently
Secure access for authorized users
🔹 Stock & Aisle Navigation System
Track stock levels by aisle, row, and item
Low stock alerts and notifications
Near-expiry tracking for better inventory control
🔹 Search & Filtering
Fast and dynamic search functionality
Filter resources based on categories and availability
🔹 User Management
Role-based access (Admin / User)
Secure authentication and authorization
🔹 Dashboard & Monitoring
Centralized dashboard for quick insights
Real-time updates on resource availability
🏗️ System Architecture
Frontend: React / Next.js
Backend: Spring Boot (Java)
Database: MySQL / Oracle SQL
API Type: RESTful APIs
⚙️ Installation & Setup
1️⃣ Clone the Repository
git clone https://github.com/BIMSARA15/it3030-paf-2026-smart-campus-group17.git
cd it3030-paf-2026-smart-campus-group17
2️⃣ Backend Setup
cd backend
./mvnw spring-boot:run
3️⃣ Frontend Setup
cd frontend
npm install
npm run dev
4️⃣ Environment Configuration

Create a .env or application.properties file and add:

spring.datasource.url=jdbc:mysql://localhost:3306/your_db
spring.datasource.username=your_username
spring.datasource.password=your_password
🔌 API Endpoints (Sample)
Method	Endpoint	Description
GET	/resources	Retrieve all resources
POST	/resources	Add new resource
PUT	/resources/{id}	Update resource
DELETE	/resources/{id}	Delete resource
🧪 Testing
Backend tested using Postman
Frontend tested via browser UI
API integration verified with real-time data
📁 Project Structure
├── backend
│   ├── controllers
│   ├── services
│   ├── models
│   └── repositories
│
├── frontend
│   ├── components
│   ├── pages
│   └── services
👥 Team Members
Asiri Tennakoon
Bimsara (Repo Owner)
Other Group Members

(Add all members with student IDs if required)

📌 Future Improvements
Mobile application integration
AI-based stock prediction
QR-based asset tracking
Real-time notifications system
📜 License

This project is developed for academic purposes under the PAF IT3030 module.
