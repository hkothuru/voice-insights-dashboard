
````markdown
# VoiceInsights Dashboard

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app). It provides an AI-driven interface for analyzing buyer-seller conversations, extracting business insights, and auditing lead responsiveness.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
````

### Accessing the Application

The application is hosted on the local system and is accessible via the network at the following addresses:

  - **Local:** [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000)
  - **Network:** http://192.168.30.63:3000

-----

## Project Walkthrough

### 1\. Dashboard Overview

A comprehensive view of real-time insights including Total Calls Analyzed, Average Buyer Intent scores, and visual breakdowns of Deal Status and Top Objections (e.g., Price, Location, Trust).
<img width="1680" height="886" alt="dashboard" src="https://github.com/user-attachments/assets/c5afeb4a-c005-479d-9936-37de39252a19" />


### 2\. Calls Explorer

Detailed analysis of individual conversations. Features include:

  - **Audio Player:** Playback specific calls.
  - **Intent Scoring:** AI-driven scores (e.g., 8/10 for "Automatic Numbering Machine").
  - **Deal Intelligence:** Insights into seller tone, engagement levels, and background noise.
  <img width="1680" height="886" alt="calls-explorer" src="https://github.com/user-attachments/assets/05dd72b6-cdc8-4664-aace-f94cd130ed23" />


### 3\. Call Processing

Upload audio files directly or provide Audio URLs to process new calls and extract insights instantly.
<img width="1680" height="886" alt="upload-call" src="https://github.com/user-attachments/assets/b2d482e5-d0c4-46b5-9d40-ab69978e8801" />


### 4\. Category Analysis & Recommendations

Automated suggestions for improving product listings.

  - **Recommended Specifications:** Identifies missing specs (e.g., "Bottle label printing machine").
  - **Validation Rules:** Checks for required fields and formatting standardization.
  <img width="1680" height="886" alt="recommendations" src="https://github.com/user-attachments/assets/755222b7-2d56-4326-abc2-bb523ebebefb" />


-----

## Learn More

To learn more about Next.js, take a look at the following resources:

  - [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
  - [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome\!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
