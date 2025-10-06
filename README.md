# 🏠 Weather to Stay or Not

Welcome! This is an evaluation project for Warden.

You are provided with a slice of the Warden backend codebase. At present, it contains only one  API endpoint, `/get-properties`, which returns the first 20 properties and supports basic text search.

In the file `.env.example` you are given readonly credentials of a live hosted database. This db is already populated with properties data on which this API operates.

## Objectives

Your task is to build a single **search page in Next.js** that consumes this API to return accurate results and provides users with both search and filtering capabilities. **Specific Requirement is given below.**

The focus here is **functionality rather than design**. This means the main priority is on backend query optimization (efficiently handling multiple filters, scaling to larger datasets, and returning results quickly) and smooth frontend integration (accurate wiring between filters, search, and API responses). The UI itself can remain minimal: a simple search bar, intuitive filtering inputs, and property cards showing relevant information are more than enough.

## User Requirements

![It sure is a hot one today](https://arden-public.s3.ap-south-1.amazonaws.com/hotone.jpg)

Our Product team has identified that weather is a critical factor when people choose properties to stay at. In fact, some residents might even reject a job offer if the local weather doesn’t suit them. To address this, we need to enhance the property search experience by adding **live weather-based filters**.

After a 6 hour meeting, following filters and constraints were finalized.

- **Temperature Range (°C)** → Numeric range input (min and max) [-20°C to 50°C].
- **Humidity Range (%)** → Numeric range input (min and max) [0% to 100%].
- **Weather Condition** → Dropdown with the following **5 grouped options**, mapped to WMO (World Meteorological Organization) weather codes:
  - **Clear** → 0 (clear sky)
  - **Cloudy** → 1–3 (partly cloudy to overcast)
  - **Drizzle** → 51–57 (light to dense drizzle)
  - **Rainy** → 61–67, 80–82 (rain showers, light to heavy)
  - **Snow** → 71–77, 85–86 (snowfall, snow showers)

## Approach

1. Use [Open-Meteo](https://open-meteo.com/) to fetch **live weather data** by passing `latitude` and `longitude` from each property. No API key is required.

2. You only have **readonly access** to the provided database. If you wish to create migrations or modify the schema, please follow the [migration guide](docs/migrations.md).

## Installation

1. Clone this repository and move into the folder:
   ```bash
   git clone <repo-url>
   cd warden-test-one
   ```
2. Install Dependencies
   ```bash
   npm i
   npm run prisma:gen
   ```
3. Copy Environment File
   ```bash
   cp .env.example .env
   ```
4. Start the development server
   ```bash
   npm run dev
   ```
   open `http://localhost:5000` you should see "Warden Weather Test: OK"

## Technical Expectations

1. Use strict types as much as possible.

2. Keep the code modular, resource efficient and fast!

3. Keep a good commit history, with small meaningful commits

## Quality Expectations

Assume that you are already working here, and you are given full responsibilty ownership of this endpoint. Treat this codebase as production!

If you feel that you can enhance this project with any additional filters, better UI elements, or something different altogether! Feel free to run wild.

Good luck, have fun.
