📊 Poll Platform — README

📌 Overview

A simple online polling platform where users can create polls, vote, and see real-time results. Built using React + Node.js/Express, great for learning CRUD, state management, and backend integration.

🚀 Features

📝 Create polls

✔️ One vote per user

📊 Live result updates

⏳ Poll expiry option


🛠️ Tech Stack

Frontend: React
Backend: Node.js, Express
Database: MongoDB / JSON (your choice)

⚙️ How to Run
1️⃣ Clone Repository
git clone https://github.com/<your-username>/poll-platform.git
cd poll-platform

2️⃣ Install Dependencies

Frontend:

cd client
npm install
npm start


Backend:

cd server
npm install
node index.js

🛠️ API Endpoints
Method	Endpoint	Description
POST	/polls	Create a poll
GET	/polls/:id	Get poll details
POST	/polls/:id/vote	Submit a vote
