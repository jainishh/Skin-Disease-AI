@echo off
echo Starting AI Skin Disease Detection System...

echo Starting Backend...
cd backend
start cmd /k "python -m uvicorn app.main:app --reload"
cd ..

echo Starting Frontend...
cd frontend
start cmd /k "npm run dev"
cd ..

echo Both servers are starting up in new windows!
echo Frontend will be available at: http://localhost:5173
echo Backend API will be available at: http://localhost:8000

@REM uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
