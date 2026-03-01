# DebrisX  
## The AI Brain for Earth’s Orbit

DebrisX is an AI-powered orbital intelligence platform that transforms Earth’s orbit and the Solar System into a living, interactive digital twin.

It combines satellite collision risk modeling, long-term orbital sustainability forecasting, Near-Earth Object (NEO) monitoring, and planetary system simulation within a mission-control-style interface.

This project was built as part of the AMD Slingshot Hackathon. **(Final Implementation)**

---

## Overview

Earth’s orbit is becoming increasingly congested, with thousands of active satellites and debris objects. The risk of collision, cascade failures (Kessler Syndrome), and long-term orbital instability is rising.

DebrisX addresses this challenge by providing:

- Real-time satellite risk monitoring  
- AI-based collision probability modeling  
- Autonomous maneuver simulation with AI Auto Solve  
- Long-term congestion forecasting  
- Orbital Stability Index (OSI) metric  
- Planet-specific NEO threat monitoring  
- Solar System digital twin with time simulation  

DebrisX is not just a tracker.  
It is a predictive orbital intelligence system.

---

## Core Features

### 1. Earth Orbit Intelligence
- Satellite tracking with per-satellite Keplerian orbital mechanics
- Collision probability calculation
- Risk explanation engine
- Autonomous maneuver simulation (AI Auto Solve)
- Cascade event simulation
- Orbital Sustainability Index (OSI)

### 2. Time Simulation Engine
- Real-time mode
- Accelerated simulation (x10, x100, x1000)
- ±10 year orbital projection
- Long-term stability forecasting

### 3. Solar System Mode
- Interactive 3D planetary system
- Planet focus zoom
- Planet statistics (temperature, gravity, orbital period)
- Moon and artificial satellite visualization

### 4. Near-Earth Object (NEO) Monitoring
- Upcoming close approach calendar
- Planet-specific NEO filtering
- Impact probability estimation
- Threat classification levels

### 5. Orbital Stability Index (OSI)
A proprietary metric that quantifies:
- Orbital congestion
- Active risk events
- Debris growth rate
- Cascade risk
- Long-term instability forecast

---

## Mission Control Design Philosophy

DebrisX is designed to resemble a real operational console.

The interface emphasizes:
- Structured telemetry
- Clear risk states
- System health indicators
- Time-controlled simulation
- Minimal, professional visual hierarchy

No gamification.  
No distraction.  
Pure orbital intelligence.

---

## Technology Stack

- **3D Visualization**: WebGL / Three.js
- **Simulation Engine**: Custom orbital logic with Keplerian mechanics
- **Risk Modeling**: AI-inspired probabilistic calculations
- **Backend API**: Python, FastAPI
- **UI Framework**: React / Modern Web Stack (Vite, Zustand)
- **Performance Optimization**: GPU-accelerated rendering support

---

## AMD Ecosystem Alignment

DebrisX is architected to benefit from:

- AMD Ryzen AI acceleration for real-time inference
- AMD Radeon GPU parallel processing for 3D orbital simulation
- AMD EPYC server-class scalability for large-scale orbital datasets
- ROCm support for accelerated AI model computation

The platform is designed for high-performance, low-latency orbital intelligence workloads.

---

## Problem Statement

Current space tracking systems primarily provide raw positional data.  
They do not offer accessible predictive intelligence, sustainability metrics, or integrated planetary defense simulation in a unified interface.

DebrisX bridges this gap by combining:

- Collision intelligence
- Sustainability forecasting
- Planetary threat monitoring
- System-level orbital modeling

---

## Future Roadmap

- Live TLE integration
- Solar storm impact modeling
- Satellite insurance risk estimator
- Multi-operator fleet coordination engine
- Policy-driven orbital congestion simulation

---

## Repository Structure

```text
/ backend
  / api          # FastAPI routes
  / core         # Core business logic
  / data         # Datasets & generation
  / ml           # Machine learning & simulation logic
  run.py         # Entry point for backend
/ frontend
  / public       # Static assets
  / src          # React components & app logic
README.md
LICENSE
```

---

## Installation

### Prerequisites
- Node.js (v18+)
- Python 3.9+

### Backend Setup
Clone the repository and set up the Python backend:

```bash
git clone https://github.com/your-username/debrisx.git
cd debrisx/backend

# Create and activate virtual environment
python -m venv venv
# On Windows: venv\Scripts\activate
# On Linux/Mac: source venv/bin/activate

# Install dependencies
pip install fastapi uvicorn pydantic # Add any other required packages

# Run the backend server
python run.py
```

### Frontend Setup
In a new terminal, navigate to the frontend directory:

```bash
cd debrisx/frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

---

## Disclaimer

DebrisX is a simulation and visualization platform.  
It does not provide official orbital safety advisories or real-world operational guidance.

---

## Authors

Team DebrisX  
AMD Slingshot Hackathon Submission (Final Version)

---

## License

This project is licensed under the MIT License. See the LICENSE file for details.
