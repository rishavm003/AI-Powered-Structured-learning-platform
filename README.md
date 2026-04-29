# AI-powered Structured Learning Platform

An intelligent learning platform that leverages AI to create personalized learning roadmaps, quizzes, and resources for users.

## Features

- AI-generated personalized learning roadmaps
- Interactive quizzes and assessments
- Resource recommendations
- Progress tracking and analytics
- Export functionality for learning materials

## Architecture

### Backend
- Python-based backend API

### Frontend
- React 18 + Vite + TypeScript
- Tailwind CSS for styling
- Zustand for state management
- React Router for navigation

## Project Structure

```
.
├── learnforge/              # Frontend React application
│   ├── src/                # Source code
│   │   ├── agents/         # AI agents for different features
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── store/           # Zustand stores for state management
│   │   ├── utils/           # Utility functions
│   │   └── ...
│   ├── public/              # Static assets
│   └── package.json        # Frontend dependencies
├── main.py                 # Python entry point
├── pyproject.toml          # Python project configuration
└── README.md               # This file
```

## Setup

### Prerequisites
- Python 3.13+
- Node.js 16+

### Backend Setup
```bash
# Install Python dependencies
pip install -r pyproject.toml

# Run the application
python main.py
```

### Frontend Setup
```bash
cd learnforge
npm install
npm run dev
```

## Development

### AI Agents
The platform uses several AI agents:
- Roadmap Agent: Generates personalized learning paths
- Quiz Agent: Creates daily quizzes
- QA Agent: Handles user questions
- Resource Agent: Recommends learning resources
- MNC Project Agent: Provides real-world project examples

## Deployment

### Frontend
- Deploy to Cloudflare Pages (build: `npm run build`, output: `dist`)

### Backend
- Deploy to Cloudflare Worker
- Set environment variables for API keys

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request