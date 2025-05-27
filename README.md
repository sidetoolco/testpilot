# TestPilot Platform

TestPilot is a modern web application built for conducting and analyzing product tests, surveys, and competitive insights. The platform provides a comprehensive suite of tools for gathering, analyzing, and visualizing customer feedback and market research data.

## 🚀 Features

- **Test Management**: Create and manage product tests with multiple variants
- **Survey System**: Conduct detailed surveys with customizable questions
- **Competitive Analysis**: Compare products against competitors
- **Data Visualization**: Interactive charts and graphs using Chart.js and D3.js
- **PDF Report Generation**: Export test results and insights
- **Real-time Analytics**: Track and analyze responses in real-time
- **User Authentication**: Secure user management with Supabase
- **Responsive Design**: Modern UI with Tailwind CSS

## 🛠️ Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Backend**: Supabase
- **Database**: PostgreSQL (via Supabase)
- **Charts**: Chart.js, D3.js
- **PDF Generation**: React-PDF
- **Form Handling**: Zod
- **Routing**: React Router DOM
- **UI Components**: Custom components with Framer Motion animations

## 📦 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account and project
- Environment variables setup

## 🔧 Installation

1. Clone the repository:

```bash
git clone [repository-url]
cd testpilot-platform
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
# Add other required environment variables
```

4. Start the development server:

```bash
npm run dev
# or
yarn dev
```

## 📁 Project Structure

```
src/
├── components/     # Reusable UI components
├── features/       # Feature-specific components and logic
├── hooks/         # Custom React hooks
├── lib/           # Utility libraries and configurations
├── pages/         # Page components
├── store/         # Zustand store configurations
├── styles/        # Global styles and Tailwind configurations
├── types/         # TypeScript type definitions
└── utils/         # Utility functions
```

## 🚀 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🔒 Security

- JWT-based authentication
- Secure API endpoints
- Environment variable protection
- Input validation with Zod

## 📱 Responsive Design

The application is fully responsive and optimized for:

- Desktop
- Tablet
- Mobile devices

---

Built with ❤️ by the TestPilot/Sidetool
