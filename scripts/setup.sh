#!/usr/bin/env bash
set -e

echo "Installing backend dependencies..."
(cd backend && npm install)

echo "Installing frontend dependencies..."
(cd frontend && npm install)

[ -f backend/.env ] || cp backend/.env.example backend/.env
[ -f frontend/.env ] || cp frontend/.env.example frontend/.env

echo "Done. Edit backend/.env with your OPENAI_API_KEY / TAVILY_API_KEY / DATABASE_URL, then:"
echo "  cd backend && npm run dev"
echo "  cd frontend && npm run dev"
