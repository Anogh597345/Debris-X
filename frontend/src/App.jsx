import { useState, useEffect } from 'react';
import axios from 'axios';
import LoadingScreen from './components/LoadingScreen';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import './index.css';

const API = 'http://localhost:8001';

// App pages: 'loading' → 'landing' → 'dashboard'
export default function App() {
    const [page, setPage] = useState('loading');
    const [orbits, setOrbits] = useState({});
    const [risks, setRisks] = useState([]);
    const [maneuverDone, setManeuverDone] = useState(false);
    const [maneuverData, setManeuverData] = useState(null);
    const [spaceWeather, setSpaceWeather] = useState(null);

    // Fetch data in background while loading screen plays
    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [orbitRes, riskRes, weatherRes] = await Promise.all([
                    axios.get(`${API}/api/orbits`),
                    axios.get(`${API}/api/risk`),
                    axios.get(`${API}/api/space-weather`).catch(() => ({ data: { kp_index: 2.3, threat_level: 'Nominal', drag_impact: 'Low' } }))
                ]);
                setOrbits(orbitRes.data.trajectories || {});
                setRisks(riskRes.data.risks || []);
                setSpaceWeather(weatherRes.data);
            } catch (e) {
                console.error('Backend unreachable — running in demo mode.', e);
                setOrbits({});
                setRisks([
                    { sat1_id: 'ISS', sat2_id: 'DEMO-DEB', min_distance_km: 4.24, time_to_approach_hours: 0.9, probability: 0.613 }
                ]);
            }
        };
        fetchAll();
    }, []);

    const handleManeuver = async (deltaV) => {
        const topRisk = risks[0];
        try {
            const sid = topRisk ? topRisk.sat1_id : "NORAD-DEF";
            const baseProb = topRisk ? topRisk.probability * 100 : 1.2;
            const minDist = topRisk ? topRisk.min_distance_km : 0.8;

            const res = await axios.post(`${API}/api/maneuver?sat_id=${sid}&baseline_risk_pct=${baseProb}&min_distance_km=${minDist}`);
            setManeuverData(res.data);

            const curve = res.data.tradeoff_curve || [];
            let newRisk = 0.0008;
            if (curve.length > 0) {
                const closest = curve.reduce((prev, curr) => Math.abs(curr.delta_v_ms - deltaV * 1000) < Math.abs(prev.delta_v_ms - deltaV * 1000) ? curr : prev);
                newRisk = closest.collision_prob;
            }

            return { newRisk, deltaV };
        } catch (e) {
            console.error("Maneuver sim failed", e);
            return { newRisk: 0.0008, deltaV };
        }
    };

    const handleAutoSolve = async () => {
        const topRisk = risks[0];
        try {
            const sid = topRisk ? topRisk.sat1_id : "NORAD-DEF";
            const baseProb = topRisk ? topRisk.probability * 100 : 1.2;
            const minDist = topRisk ? topRisk.min_distance_km : 0.8;

            const res = await axios.post(`${API}/api/maneuver?sat_id=${sid}&baseline_risk_pct=${baseProb}&min_distance_km=${minDist}`);
            setManeuverData(res.data);

            const curve = res.data.tradeoff_curve || [];
            let opt = curve[curve.length - 1];
            for (let point of curve) {
                if (point.collision_prob < 0.0015) {
                    opt = point;
                    break;
                }
            }
            return { newRisk: opt.collision_prob, deltaV: opt.delta_v_ms / 1000 };
        } catch (e) {
            console.error("Auto solve failed", e);
            return { newRisk: 0.0008, deltaV: 1.2 };
        }
    };

    const completeManeuver = (newRisk) => {
        setRisks(prev => prev.map((r, i) => i === 0 ? { ...r, probability: newRisk } : r));
        setManeuverDone(true);
    };

    if (page === 'loading') {
        return <LoadingScreen onComplete={() => setPage('landing')} />;
    }

    if (page === 'landing') {
        return <LandingPage onEnter={() => setPage('dashboard')} />;
    }

    return (
        <Dashboard
            orbits={orbits}
            risks={risks}
            onManeuver={handleManeuver}
            onAutoSolve={handleAutoSolve}
            onComplete={completeManeuver}
            maneuverDone={maneuverDone}
            maneuverData={maneuverData}
            spaceWeather={spaceWeather}
        />
    );
}
