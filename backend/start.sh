#!/bin/bash

# Start FastAPI server in the background
uvicorn main:app --host 0.0.0.0 --port 8082 &

# Start the LiveKit agent worker in the background
python main.py start &

# Keep the process alive
wait