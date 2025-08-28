# 🏠 Weather to Stay or Not

Welcome! This is the **Weather Dashboard Project for Warden**, designed to enhance the property search experience with live weather insights.

---

## 🌐 Project Overview

The project provides a single API endpoint:  

`/get-properties`  

- Returns the first 12 properties.  
- Supports **basic text search**.  
- Integrates **weather data** into the property search experience.  

Weather data is periodically updated and linked to each property, forming the foundation of the **Property Weather Dashboard**, which includes grid, table, and loading slider views.

---

## 🎯 Objectives

Enhance property search with **weather-based filters**.  

### Filters

- **Temperature Range (°C):** Between **-20°C to 50°C**.  
- **Humidity Range (%):** Between **0% to 100%**.  
- **Weather Condition (WMO Codes):**  
  - **Clear:** 0 (clear sky)  
  - **Cloudy:** 1–3 (partly cloudy → overcast)  
  - **Drizzle:** 51–57 (light → dense drizzle)  
  - **Rainy:** 61–67, 80–82 (light → heavy rain)  
  - **Snow:** 71–77, 85–86 (snowfall, snow showers)  

---

## ⚙️ Approach

- **Weather Data Source:** [Open-Meteo](https://open-meteo.com/) (no API key required).  
- **How it works:**  
  - Each property’s `latitude` and `longitude` are used to fetch live weather data.  
  - A dedicated database table maps weather data to its respective property.  
  - A **cron job** runs every 45 minutes to refresh property weather snapshots.  

---

## 🔍 Query Search

Backend API:  
`https://warden-backend-test.onrender.com/get-properties`

### Supported Parameters
- **Basic Text Search:** `searchText`  
- **Temperature Filter:** `tempMin`, `tempMax`  
- **Humidity Filter:** `humidityMin`, `humidityMax`  
- **Weather Condition Filter:** (WMO code ranges)  

### Example
```
https://warden-backend-test.onrender.com/get-properties?searchText=kochi&tempMin=23&tempMax=30&humidityMin=80&humidityMax=90
```
This example will:  
- Search for properties containing `"kochi"`.  
- Filter by temperature: 23°C → 30°C.  
- Filter by humidity: 80% → 90%.  

---

## 🚀 Installation

Follow these steps to set up the project locally:

1. **Clone the Repository**  
   ```bash
   git clone https://github.com/Naveen-warden/warden-backend-test.git
   cd warden-test-one
   ```

2. **Install Dependencies**  
   ```bash
   npm i
   npm run prisma:gen
   ```

3. **Setup Environment Variables**  
   ```bash
   cp .env.example .env
   ```
   > The `.env` file contains readonly credentials for a hosted database already populated with property data.

4. **Start the Development Server**  
   ```bash
   npm run dev
   ```
   Open `http://localhost:5000` → you should see:  
   ```
   Warden Weather Test: OK
   ```

---

## 🌍 Live Links
- **Frontend (Demo):** [warden-backend-test.vercel.app](https://warden-backend-test.vercel.app)  
- **Backend API:** [warden-backend-test.onrender.com](https://warden-backend-test.onrender.com)  
