# AI-Powered Support Ticket System

A professional, local AI support system built with the MERN stack (MongoDB, Express, React, Node) and a Python AI Engine.

---

## 🚀 1. Required Setup

Before running the project, ensure you have the following installed:

1.  **Node.js** (v18 or higher)
2.  **Python 3.8+**
3.  **MongoDB** (running locally on port 27017)
4.  **Git** (for version control)

---

## 🛠️ 2. Installation & Initialization

### A. Backend Server
1.  Navigate to the `server` directory.
2.  Install dependencies: `npm install`
3.  Ensure your `.env` file exists with:
    ```env
    PORT=5000
    MONGODB_URI=mongodb://127.0.0.1:27017/support-ticket-system
    JWT_SECRET=supersecretkey_change_in_production
    ```

### B. Python AI Engine
1.  Navigate to the `ai-engine` directory.
2.  Install requirements: `pip install -r requirements.txt`
3.  (Optional but recommended) Create a virtual environment: `python -m venv venv` and activate it.

### C. Frontend Client
1.  Navigate to the `client` directory.
2.  Install dependencies: `npm install`
3.  Install **Lucide-React** and **Recharts** for UI/Charts: `npm install lucide-react recharts`

---

## ▶️ 3. How to Run (Start in this order)

1.  **AI Engine**: `cd ai-engine && python app.py` (Runs on port 8000)
2.  **Backend**: `cd server && npm run dev` (Runs on port 5000)
3.  **Frontend**: `cd client && npm run dev` (Runs on port 5173)

---

## 🔑 4. Default Admin Credentials
The system automatically seeds a default administrator on startup:
- **Email**: `admin@gmail.com`
- **Password**: `admin123`

---

## 📤 5. How to Upload to GitHub

Follow these steps to push your code to a New Repository:

1.  **Create a New Repo** on GitHub (e.g., `ai-support-ticket-agent`). Do **not** initialize with README or License yet.
2.  **Open terminal** in the root project folder (`D:\ai-support-ticket-agent`).
3.  **Initialize Git**:
    ```bash
    git init
    ```
4.  **Add all files**:
    ```bash
    git add .
    ```
5.  **Commit your changes**:
    ```bash
    git commit -m "Initialize project: AI-Powered Support System with local AI"
    ```
6.  **Rename main branch** (optional):
    ```bash
    git branch -M main
    ```
7.  **Add Remote Origin** (Replace `<URL>` with your GitHub repo URL):
    ```bash
    git remote add origin https://github.com/YourUsername/ai-support-ticket-agent.git
    ```
8.  **Push to GitHub**:
    ```bash
    git push -u origin main
    ```

---

## 🏗️ 6. Project Architecture

- **Client**: Vite + React + TailwindCSS + Lucide Icons + Recharts for Analytics.
- **Server**: Node/Express with JWT Authentication and Mongoose Models.
- **AI Engine**: Flask + Transformers (Local GPT-2 generation) + Regex for Keyword Routing.
- **Database**: Local MongoDB.

---

### NOTE: Local AI Processing
The first time you run the project, the AI Engine may take several minutes to download the **GPT-2 Model** (~500MB). Once downloaded, all analysis will happen offline in the background.

Happy coding! 🚀
