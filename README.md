<h1 align="center">🧬 NutriSync AI</h1>
<p align="center">
  <strong>AI-Powered Health & Nutrition Tracking Platform</strong><br/>
  <em>Built with React · Tailwind CSS · Google Fitness API</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-17.0.2-61DAFB?logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.3-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Material_UI-5.x-007FFF?logo=mui&logoColor=white" alt="MUI" />
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License" />
</p>

---

## 📋 Overview

NutriSync AI is a comprehensive health tracking dashboard that integrates with Google Fitness API to provide real-time health metrics, AI-powered predictions, and nutritional analysis. Designed with a professional medical aesthetic and full dark/light mode support for accessibility across all age groups.

## ✨ Features

### 🏠 Dashboard
- Real-time health stats: calories burnt, move minutes, heart points, step count
- Weekly progress charts (line & bar) powered by ApexCharts
- Welcome banner with quick action shortcuts
- Responsive grid layout with animated stat cards

### 🤖 AI Predictions
- Health score metrics with confidence indicators
- Personalized AI insights based on health trends
- Prediction cards for calorie goals, hydration, sleep quality, protein intake, HRV, and workout consistency
- Actionable recommendations

### 🥗 Nutritional Audit
- Overall nutrition grade with visual ring indicator
- Macronutrient & micronutrient tracking with progress bars
- Calorie budget tracker
- Hydration monitoring
- Expandable meal breakdown with per-meal grading

### 🍽️ Meal Tracker
- Log daily meals with nutritional information
- Calorie tracking integrated with dashboard

### 💊 Medicine Tracker
- Medicine reminder system with notifications
- WhatsApp notification integration via Twilio

### 🏋️ Workout Tracker
- Log workouts with persistence (localStorage)
- Track workout name, time, and frequency

### 🌗 Dark / Light Mode
- Class-based Tailwind dark mode with smooth transitions
- Persists user preference in localStorage
- Designed for accessibility across all age groups

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 17, Tailwind CSS 3, Material UI 5 |
| **Charts** | ApexCharts, Recharts |
| **Auth** | Google OAuth 2.0 |
| **Health Data** | Google Fitness REST API |
| **Styling** | Tailwind CSS + MUI hybrid |
| **Build Tool** | CRACO (Create React App Configuration Override) |
| **Backend** | Express.js, MongoDB, Mongoose |
| **Notifications** | Twilio (WhatsApp) |

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm 8+

### Installation

```bash
# Clone the repository
git clone https://github.com/<your-username>/NutriSync-AI.git
cd NutriSync-AI

# Install dependencies
npm install --legacy-peer-deps

# Start development server
# On Windows (PowerShell):
$env:NODE_OPTIONS="--openssl-legacy-provider"
node .\node_modules\@craco\craco\bin\craco.js start

# On macOS/Linux:
NODE_OPTIONS=--openssl-legacy-provider npx craco start
```

The app will be available at **http://localhost:3000**

### Dev Mode
Click **"🚀 Preview Dashboard (Dev Mode)"** on the login page to explore the dashboard without Google authentication.

## 📁 Project Structure

```
src/
├── components/
│   ├── NutriSyncSidebar/     # Tailwind sidebar with nav & theme toggle
│   ├── NutriSyncLayout/      # Main layout wrapper
│   ├── VuiBox/               # Shared UI components
│   └── ...
├── context/
│   ├── index.js              # Vision UI controller context
│   └── ThemeContext.js        # Dark/light mode context
├── layouts/
│   ├── dashboard/            # Main dashboard + refactored version
│   ├── ai-predictions/       # AI Predictions page
│   ├── nutritional-audit/    # Nutritional Audit page
│   ├── tables/               # Meal Tracker
│   ├── tables2/              # Medicine Tracker
│   ├── billing/              # Workout Tracker
│   └── profile/              # User profile
├── assets/                   # Theme, images, icons
├── examples/                 # Chart components, navbars, sidenav
└── Utility/                  # Cookie, data request managers
```

## 🎨 Theme Configuration

Custom Tailwind config with medical-grade color palette:

- **Dark mode**: Deep navy surfaces (`#0f172a` → `#1e293b`) with blue/purple accents
- **Light mode**: Clean whites with subtle gray borders
- **Health colors**: Green, red, blue, purple, amber, cyan, teal for metrics
- **Fonts**: Inter, Plus Jakarta Sans

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Original Health Tracker by [ViditaShetty](https://github.com/ViditaShetty/Health-Tracker-in-MERN)
- Vision UI Dashboard by [Creative Tim](https://www.creative-tim.com/)
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
- [Google Fitness API](https://developers.google.com/fit) for health data integration
