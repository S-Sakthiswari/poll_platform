[![Watch the demo video](https://img.youtube.com/vi/RzCUqQnde7U/0.jpg)](https://youtu.be/RzCUqQnde7U?si=1wFIj53u0B4-Bu1h)

# 📊 Poll Platform

## 🎯 Project Aim
The **Poll Platform** helps users create simple polls, vote, and instantly view results. It provides an easy way to gather opinions and make quick decisions through a clean and user-friendly interface.

---

## 📌 Project Description
The Poll Platform is a full-stack web application built to create and manage polls.

Users can:

- Create a poll  
- Add multiple options  
- Vote once per poll  
- View real-time results  
- Track poll expiry  

It is built using **React** for the frontend and **Node.js/Express** for the backend, making it a great project for understanding basic full-stack concepts.

---

## ⚙️ Features  

### 📝 Create Polls  
Add a question and options to build a new poll.

### ✔️ One Vote Per User  
Ensures fair voting by restricting repeated votes.

### 📊 Live Result Updates  
View results that update instantly after voting.

### ⏳ Poll Expiry  
Polls automatically close after the expiry time.

### 🎨 Simple Interface  
Clean and responsive UI for easy usage.

---

## 🧰 Tech Stack & Tools  

| Component  | Technology         |
|-----------|---------------------|
| Frontend  | React               |
| Backend   | Node.js, Express    |
| Database  | MongoDB / JSON      |
| Language  | JavaScript          |

---

## 🚀 Getting Started  

### **Prerequisites**
Make sure the following are installed:

- Node.js  
- npm  
- MongoDB (or JSON storage)

---

## 🔧 Installation  

### **Clone the repository:**
```bash
cd poll-platform
```

---

### **Install frontend dependencies:**
```bash
cd frontend
npm install
npm start
```

---

### **Install backend dependencies:**
Open a new terminal:
```bash
cd backend
npm install
node index.js
```

---

## 🔌 API Endpoints  

| Method | Endpoint           | Description        |
|--------|---------------------|--------------------|
| POST   | `/polls`            | Create a new poll  |
| GET    | `/polls/:id`        | Get poll details   |
| POST   | `/polls/:id/vote`   | Submit a vote      |

---

