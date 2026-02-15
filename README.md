# OpenAI Usage Dashboard

A sleek, dark-themed Next.js dashboard to visualize your OpenAI API spending, token consumption, and usage patterns.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![Recharts](https://img.shields.io/badge/Recharts-3-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38bdf8)

## Features

- 📊 **Daily Cost Bar Chart** — See how much you spend each day
- 🍩 **Cost by Model Pie Chart** — Breakdown across gpt-4o, gpt-3.5-turbo, etc.
- 📈 **Cumulative Cost Area Chart** — Running total over time
- 🔢 **Token Usage Stacked Bars** — Prompt vs Completion tokens per day
- 🔴 **Daily Requests Chart** — API call volume over time
- 📋 **Model Breakdown Table** — Detailed per-model stats with progress bars
- 🎯 **Stats Cards** — Total cost, tokens, requests, peak day at a glance

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Demo Mode
Type `mock` in the API key field and click **Analyze Usage** to see a full demo with realistic sample data across 6 OpenAI models.

### With a Real API Key
Any standard OpenAI API key (`sk-proj-...`) will work! The dashboard uses the `/v1/dashboard/billing/usage` endpoint which is accessible to all keys.

1. Paste your API key in the input field
2. Click **Analyze Usage**
3. View your last 30 days of usage across all charts

> 💡 Your key is only used in your browser and never sent anywhere except OpenAI's API.

## API Endpoints Used

| Endpoint | Auth | Purpose |
|---|---|---|
| `/v1/dashboard/billing/usage` | Standard key ✅ | Daily cost & model breakdown |
| `/v1/usage` | Standard key ✅ | Token counts & request volumes |

## Tech Stack

| Technology | Purpose |
|---|---|
| [Next.js 16](https://nextjs.org/) | React framework |
| [Tailwind CSS 4](https://tailwindcss.com/) | Styling |
| [Recharts 3](https://recharts.org/) | Charts & Visualizations |
| [Lucide React](https://lucide.dev/) | Icons |
| [date-fns](https://date-fns.org/) | Date utilities |

## Project Structure

```
├── app/
│   ├── globals.css          # Theme & glassmorphism styles
│   ├── layout.tsx           # Root layout with Inter font
│   └── page.tsx             # Main page with gradient orbs
├── components/
│   ├── usage-dashboard.tsx  # Main dashboard with state management
│   ├── usage-bar-chart.tsx  # Daily cost bar chart
│   ├── usage-pie-chart.tsx  # Model cost donut chart
│   ├── cumulative-cost-chart.tsx  # Cumulative area chart
│   ├── token-bar-chart.tsx  # Stacked token bar chart
│   └── requests-chart.tsx   # Daily requests bar chart
└── lib/
    └── openai.ts            # API fetching & mock data generation
```
