import { useState, useEffect, useMemo, Suspense } from 'react';
import axios from 'axios';
import { VizCanvas } from './VizCanvas';
import CascadeSimulator from './CascadeSimulator';
import CongestionHeatmap from './CongestionHeatmap';
import SpaceCopilot from './SpaceCopilot';
import SustainabilityIndex from './SustainabilityIndex';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const API = 'http://localhost:8001';

const NAV_ITEMS = [
    { icon: '◉', label: 'Satellite Guardian', key: 'guardian' },
    { icon: '△', label: 'Risk Intelligence', key: 'risk' },
    { icon: '▷', label: 'Maneuver Sim', key: 'maneuver' },
    { icon: '◈', label: 'Cascade Sim', key: 'cascade', badge: 'NEW', badgeColor: 'red' },
    { icon: '▦', label: 'Congestion Map', key: 'heatmap', badge: 'LIVE', badgeColor: 'gold' },
    { icon: '◫', label: 'Solar System', key: 'solar', badge: '3D', badgeColor: 'gold' },
    { icon: '☄', label: 'NEO Prediction', key: 'neo', badge: 'ALERT', badgeColor: 'red' },
    { icon: '◎', label: 'Space Copilot', key: 'copilot', badge: 'AI', badgeColor: 'gold' },
    { icon: '◬', label: 'Sustainability', key: 'sustain' },
];

const GLOBE_TABS = new Set(['guardian', 'risk', 'maneuver', 'cascade']);
const SOLAR_TABS = new Set(['solar', 'neo']);

const PLANETS = {
    mercury: {
        name: 'Mercury', radius: '2,439 km', gravity: '3.7 m/s²', temp: '167°C', period: '88 days', moons: 0, type: 'Terrestrial', orbitScale: 14,
        satellites: { active: 1, debris: 0 },
        temperatureData: [{ year: 2020, temp: 165 }, { year: 2022, temp: 166 }, { year: 2024, temp: 167 }, { year: 2026, temp: 167 }]
    },
    venus: {
        name: 'Venus', radius: '6,051 km', gravity: '8.87 m/s²', temp: '464°C', period: '225 days', moons: 0, type: 'Terrestrial', orbitScale: 22,
        satellites: { active: 2, debris: 3 },
        temperatureData: [{ year: 2020, temp: 462 }, { year: 2022, temp: 463 }, { year: 2024, temp: 464 }, { year: 2026, temp: 464 }]
    },
    earth: {
        name: 'Earth', radius: '6,371 km', gravity: '9.81 m/s²', temp: '15°C', period: '365 days', moons: 1, type: 'Terrestrial', orbitScale: 30,
        satellites: { active: 9400, debris: 36500 },
        temperatureData: [{ year: 2010, temp: 14.4 }, { year: 2015, temp: 14.7 }, { year: 2020, temp: 14.9 }, { year: 2025, temp: 15.2 }, { year: 2030, temp: 15.6 }]
    },
    mars: {
        name: 'Mars', radius: '3,389 km', gravity: '3.72 m/s²', temp: '-65°C', period: '687 days', moons: 2, type: 'Terrestrial', orbitScale: 40,
        satellites: { active: 14, debris: 22 },
        predictions: [{ name: '2007 WD5', prob: '1 in 10k', date: '2042-01-30', severity: 'High', color: 'var(--red)' }],
        temperatureData: [{ year: 2020, temp: -64.5 }, { year: 2022, temp: -64.8 }, { year: 2024, temp: -65.0 }, { year: 2026, temp: -65.2 }]
    },
    jupiter: {
        name: 'Jupiter', radius: '69,911 km', gravity: '24.79 m/s²', temp: '-110°C', period: '12 years', moons: 95, type: 'Gas Giant', orbitScale: 60,
        satellites: { active: 2, debris: 5 },
        temperatureData: [{ year: 2020, temp: -110 }, { year: 2022, temp: -110 }, { year: 2024, temp: -110 }, { year: 2026, temp: -110 }]
    },
    saturn: {
        name: 'Saturn', radius: '58,232 km', gravity: '10.44 m/s²', temp: '-140°C', period: '29 years', moons: 146, type: 'Gas Giant', orbitScale: 80,
        satellites: { active: 0, debris: 3 },
        temperatureData: [{ year: 2020, temp: -140 }, { year: 2022, temp: -140 }, { year: 2024, temp: -140 }, { year: 2026, temp: -140 }]
    },
    uranus: {
        name: 'Uranus', radius: '25,362 km', gravity: '8.69 m/s²', temp: '-195°C', period: '84 years', moons: 27, type: 'Ice Giant', orbitScale: 100,
        satellites: { active: 0, debris: 1 },
        temperatureData: [{ year: 2020, temp: -195 }, { year: 2022, temp: -195 }, { year: 2024, temp: -195 }, { year: 2026, temp: -195 }]
    },
    neptune: {
        name: 'Neptune', radius: '24,622 km', gravity: '11.15 m/s²', temp: '-200°C', period: '165 years', moons: 14, type: 'Ice Giant', orbitScale: 120,
        satellites: { active: 0, debris: 1 },
        temperatureData: [{ year: 2020, temp: -200 }, { year: 2022, temp: -200 }, { year: 2024, temp: -200 }, { year: 2026, temp: -200 }]
    }
};

const NEO_DATASET = [
    { name: 'Apophis (99942)', size: '370m', velocity: '30.73 km/s', approach: '31,200 km', risk: 'Critical', prob: '1 in 100k', color: '#e74c3c', date: '2029-04-13', perihelion: 25, aphelion: 35 },
    { name: 'Bennu (101955)', size: '490m', velocity: '27.77 km/s', approach: '300,000 km', risk: 'Elevated', prob: '1 in 2.7k', color: '#f39c12', date: '2182-09-24', perihelion: 26, aphelion: 42 },
    { name: '2023 DZ2', size: '50m', velocity: '18.2 km/s', approach: '280,000 km', risk: 'Low', prob: '1 in 4M', color: '#5b9bd5', date: '2028-04-12', perihelion: 12, aphelion: 20 },
    { name: '2007 WD5', size: '50m', velocity: '22.0 km/s', approach: 'Intersection', risk: 'High', prob: '1 in 10k', color: '#e74c3c', date: '2042-01-30', perihelion: 35, aphelion: 50 },
    { name: 'Shoemaker L. 9 (Remnants)', size: 'Multiple', velocity: '50.0 km/s', approach: 'Impacted', risk: 'Moderate', prob: '100%', color: '#f39c12', date: 'Ongoing', perihelion: 55, aphelion: 85 },
];

export default function Dashboard({ orbits, risks, onManeuver, onAutoSolve, onComplete, maneuverDone, maneuverData, spaceWeather }) {
    const [activeNav, setActiveNav] = useState('guardian');
    const [deltaV, setDeltaV] = useState(0.8);
    const [isSolving, setIsSolving] = useState(false);

    // Mock trend line for top risk history
    const topRisk = risks && risks.length > 0 ? risks[0] : null;
    const riskTrendData = useMemo(() => {
        if (!topRisk) return [];
        const baseProb = topRisk.probability * 100;
        const data = [];
        for (let i = 24; i >= 0; i -= 2) {
            const val = baseProb * Math.exp(-i * 0.15);
            data.push({ time: `T-${i}h`, risk: val + (Math.random() * baseProb * 0.05) });
        }
        return data;
    }, [topRisk]);

    // Guardian state
    const [selectedSatId, setSelectedSatId] = useState('');

    // Future simulator state
    const [futureYears, setFutureYears] = useState(1);
    const [newSats, setNewSats] = useState(1000);
    const [cascadeData, setCascadeData] = useState(null);
    const [heatmapData, setHeatmapData] = useState(null);

    // Planet & Time Engine
    const [activePlanet, setActivePlanet] = useState(null); // Default to null for overview
    const [timeMultiplier, setTimeMultiplier] = useState(1);
    const [isLiveMode, setIsLiveMode] = useState(true);

    const [neoSort, setNeoSort] = useState('date');
    const sortedNeos = useMemo(() => {
        return [...NEO_DATASET].sort((a, b) => {
            if (neoSort === 'date') {
                if (a.date === 'Ongoing') return -1;
                if (b.date === 'Ongoing') return 1;
                return new Date(a.date) - new Date(b.date);
            }
            if (neoSort === 'threat') {
                const threatOrder = { Critical: 3, High: 2, Elevated: 1, Moderate: 0, Low: -1 };
                return threatOrder[b.risk] - threatOrder[a.risk];
            }
            if (neoSort === 'distance') {
                const parseDist = (d) => {
                    if (d === 'Impacted' || d === 'Intersection') return 0;
                    return parseInt(d.replace(/,/g, '').replace(' km', ''));
                }
                return parseDist(a.approach) - parseDist(b.approach);
            }
            return 0;
        });
    }, [neoSort]);

    // Global Key Listener for "Escape" to clear active planet view
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') setActivePlanet(null);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const highRisk = topRisk && topRisk.probability > 0.05 && activePlanet === 'earth';

    // Lazy-load cascade / heatmap on first visit
    useEffect(() => {
        if (activeNav === 'cascade' && !cascadeData) {
            axios.get(`${API}/api/cascade`).then(r => setCascadeData(r.data)).catch(() => setCascadeData(DEMO_CASCADE));
        }
        if ((activeNav === 'heatmap' || activeNav === 'forecast') && !heatmapData) {
            axios.get(`${API}/api/heatmap`).then(r => setHeatmapData(r.data)).catch(() => setHeatmapData(DEMO_HEATMAP));
            if (activeNav === 'forecast') setActiveNav('heatmap'); // handle landing page routing
        }
    }, [activeNav]);

    // Setup default Guardian
    useEffect(() => {
        if (!selectedSatId && Object.keys(orbits).length > 0) {
            const iss = Object.keys(orbits).find(k => k.includes('25544')) || Object.keys(orbits)[0];
            setSelectedSatId(iss);
        }
    }, [orbits, selectedSatId]);

    // Guardian logic
    const gOrbit = orbits[selectedSatId];
    const gSatState = gOrbit ? gOrbit[0] : null;
    const gAlt = gSatState ? (Math.sqrt(gSatState.position.x ** 2 + gSatState.position.y ** 2 + gSatState.position.z ** 2) - 6371).toFixed(1) : 0;
    const gSpeed = gSatState ? (Math.sqrt(gSatState.velocity.x ** 2 + gSatState.velocity.y ** 2 + gSatState.velocity.z ** 2)).toFixed(1) : 0;
    // synthesize health score based on risk
    const gRisk = risks.find(r => r.sat1_id === selectedSatId || r.sat2_id === selectedSatId);
    const gHealthScore = gRisk ? Math.max(0, 100 - (gRisk.probability * 1000)) : 98;
    const gHealthColor = gHealthScore >= 80 ? 'var(--good)' : (gHealthScore >= 50 ? 'var(--gold)' : 'var(--red)');

    // Future Simulator logic
    const futureMultiplier = 1 + (newSats / 50000) * (futureYears / 2);
    const osiScore = Math.max(0, 100 - ((futureMultiplier - 1) * 35));
    const osiColor = osiScore > 75 ? '#22cc55' : osiScore > 40 ? '#f39c12' : '#e74c3c';

    // Generate forecast trend data
    const forecastData = useMemo(() => {
        const data = [];
        for (let i = 0; i <= futureYears; i++) {
            const fm = 1 + (newSats / 50000) * (i / 2);
            data.push({
                year: new Date().getFullYear() + i,
                osi: Math.max(0, 100 - ((fm - 1) * 35)),
                congestion: fm * 100,
                risk: (fm ** 2) * 5
            });
        }
        return data;
    }, [futureYears, newSats]);

    const displayedHeatmap = heatmapData ? {
        ...heatmapData,
        bands: heatmapData.bands.map(b => ({
            ...b,
            object_density: Math.min(1.0, b.object_density * futureMultiplier),
            color: Math.min(1.0, b.object_density * futureMultiplier) > 0.8 ? 'var(--red)' :
                Math.min(1.0, b.object_density * futureMultiplier) > 0.4 ? 'var(--gold)' : 'var(--good)'
        }))
    } : null;

    // Mission Control Global State
    const activeRiskCount = risks.length;
    let globalOsiScore = 98 - (activeRiskCount * 4) - (activeNav === 'cascade' && cascadeData?.kessler_threshold_crossed ? 30 : 0);
    globalOsiScore = Math.max(0, globalOsiScore);
    const globalStatus = globalOsiScore >= 80 ? 'OPERATIONAL' : globalOsiScore >= 50 ? 'ELEVATED RISK' : 'CRITICAL';
    const globalStatusColor = globalOsiScore >= 80 ? 'var(--good)' : globalOsiScore >= 50 ? 'var(--gold)' : 'var(--red)';

    const HEATMAP_DEMO_ALERT = true;
    const dynamicAlerts = useMemo(() => {
        const alerts = [];
        if (activeRiskCount > 0) alerts.push({ text: `Elevated collision risk: ${activeRiskCount} active conjunctions detected.`, type: 'elevated' });
        if (activeNav === 'cascade' && cascadeData?.kessler_threshold_crossed) alerts.push({ text: `CRITICAL: Kessler scale threshold crossed in active simulation zone.`, type: 'critical' });
        if (HEATMAP_DEMO_ALERT) alerts.push({ text: `⚠ GEO Band Congestion Exceeds 78% of sustainable limits.`, type: 'elevated' });
        return alerts;
    }, [activeRiskCount, activeNav, cascadeData]);

    // Time ticker
    const [utcTime, setUtcTime] = useState(new Date().toISOString().replace('T', ' ').slice(0, 19));
    useEffect(() => {
        const int = setInterval(() => setUtcTime(new Date().toISOString().replace('T', ' ').slice(0, 19)), 1000);
        return () => clearInterval(int);
    }, []);

    return (
        <div className="dashboard">

            {/*  MISSION CONTROL GLOBAL HEADER  */}
            <header className="topbar">
                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <img src="/logo.png" alt="DebrisX" className="topbar-logo" />
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <span style={{ fontSize: 11, color: 'var(--grey-300)', textTransform: 'uppercase', letterSpacing: 2, fontWeight: 'bold' }}>Orbital Operations</span>
                        </div>
                    </div>
                    <div className="topbar-divider" />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: 9, color: 'var(--grey-500)', textTransform: 'uppercase', letterSpacing: 1 }}>System Status</span>
                        <span style={{ fontSize: 13, fontWeight: 'bold', color: globalStatusColor, letterSpacing: 1 }}>{globalStatus}</span>
                    </div>
                    <div className="topbar-divider" />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: 9, color: 'var(--grey-500)', textTransform: 'uppercase', letterSpacing: 1 }}>Global OSI</span>
                        <span style={{ fontSize: 14, fontFamily: 'monospace', color: globalStatusColor }}>{globalOsiScore.toFixed(1)}</span>
                    </div>
                    <div className="topbar-divider" />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: 9, color: 'var(--grey-500)', textTransform: 'uppercase', letterSpacing: 1 }}>Active Risks</span>
                        <span style={{ fontSize: 14, fontFamily: 'monospace', color: activeRiskCount > 0 ? 'var(--gold)' : 'var(--grey-100)' }}>{activeRiskCount}</span>
                    </div>
                </div>

                <div className="topbar-right">
                    {/* Compact Time Engine */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,0,0,0.5)', padding: '4px 12px', border: '1px solid var(--border-dim)', borderRadius: 2 }}>
                        <span style={{ fontSize: 9, color: 'var(--blue)', textTransform: 'uppercase', letterSpacing: 1, marginRight: 8 }}>Sim Speed</span>
                        {[1, 10, 100, 1000].map(speed => (
                            <button
                                key={speed}
                                onClick={() => { setIsLiveMode(speed === 1); setTimeMultiplier(speed); }}
                                style={{
                                    padding: '2px 8px', fontSize: 10, fontFamily: 'monospace',
                                    background: timeMultiplier === speed ? 'var(--gold)' : 'transparent',
                                    color: timeMultiplier === speed ? '#000' : 'var(--grey-400)',
                                    border: `1px solid ${timeMultiplier === speed ? 'var(--gold)' : 'transparent'}`,
                                    borderRadius: 2, cursor: 'pointer'
                                }}
                            >
                                x{speed}
                            </button>
                        ))}
                    </div>
                    <div className="topbar-divider" style={{ margin: '0 8px' }} />
                    <span style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--grey-300)' }}>
                        {utcTime} UTC
                    </span>
                </div>
            </header>

            {/*  DYNAMIC ALERT STRIP  */}
            {dynamicAlerts.length > 0 && (
                <div style={{ width: '100%', background: dynamicAlerts[0].type === 'critical' ? 'var(--red)' : 'var(--gold)', color: '#000', padding: '4px 16px', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 12, zIndex: 1000, position: 'relative' }}>
                    <span className={dynamicAlerts[0].type === 'critical' ? 'blink' : ''}>⚠</span>
                    <span>{dynamicAlerts[0].text}</span>
                </div>
            )}

            {/*  SIDEBAR  */}
            <aside className="sidebar">
                <div className="sidebar-brand">
                    <img src="/logo.png" alt="DebrisX" className="sidebar-brand-img" />
                </div>

                <div className="sidebar-section-label">Navigation</div>

                {NAV_ITEMS.map(n => (
                    <div
                        key={n.key}
                        className={`nav-item${activeNav === n.key ? ' active' : ''}`}
                        onClick={() => setActiveNav(n.key)}
                    >
                        <span className="nav-icon">{n.icon}</span>
                        {n.label}
                        {n.badge && (
                            <span className={`nav-badge ${n.badgeColor || 'red'}`}>{n.badge}</span>
                        )}
                    </div>
                ))}

                <div className="sidebar-bottom">
                    <div className="sidebar-version">v1.0.0 · MVP Build</div>
                    <div className="sidebar-count">{Object.keys(orbits).length} objects tracked</div>
                </div>
            </aside>

            {/*  CENTER PANEL  */}
            <main className="center-panel">

                {/* 3D Globe for main tabs */}
                {GLOBE_TABS.has(activeNav) && (
                    <div className="viz-area">
                        <div className="scan-line" />
                        <VizCanvas
                            orbits={orbits}
                            riskEvents={risks}
                            mode="orbital"
                            cascadeActive={activeNav === 'cascade'}
                            cascadeData={cascadeData}
                        />
                        <div className="center-mode-label">
                            <div className="center-mode-label-text">
                                Digital Twin — Low Earth Orbit · Drag to rotate
                            </div>
                        </div>
                    </div>
                )}

                {/* Solar System view (Planet Switcher & Time Engine) */}
                {SOLAR_TABS.has(activeNav) && (
                    <div className="viz-area" style={{ display: 'flex', flexDirection: 'column' }}>

                        {/* Time & Planet Controls Overlay */}
                        <div style={{ position: 'absolute', top: 20, left: 20, right: 20, zIndex: 10, display: 'flex', justifyContent: 'space-between', pointerEvents: 'none' }}>

                            {/* Planet Selector */}
                            <div style={{ display: 'flex', gap: 10, pointerEvents: 'auto' }}>
                                {Object.keys(PLANETS).map(p => (
                                    <button
                                        key={p}
                                        onClick={() => setActivePlanet(p)}
                                        style={{
                                            background: activePlanet === p ? 'rgba(91, 155, 213, 0.2)' : 'rgba(0,0,0,0.5)',
                                            border: `1px solid ${activePlanet === p ? 'var(--blue)' : 'var(--border-dim)'}`,
                                            color: activePlanet === p ? 'var(--white)' : 'var(--grey-300)',
                                            padding: '6px 16px', borderRadius: 20, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1,
                                            cursor: 'pointer', fontFamily: 'var(--font-display)', backdropFilter: 'blur(4px)', transition: 'all 0.3s'
                                        }}
                                    >
                                        {PLANETS[p].name}
                                    </button>
                                ))}
                            </div>

                            {/* Removed old Time Engine overlay block */}
                            {/* Added Back Button for Cinematic Mode */}
                            {activePlanet && (
                                <button
                                    onClick={() => setActivePlanet(null)}
                                    style={{
                                        position: 'absolute', top: 80, left: 20, zIndex: 20,
                                        background: 'rgba(0,0,0,0.8)', border: '1px solid var(--blue)',
                                        color: 'var(--white)', padding: '8px 16px', borderRadius: 4,
                                        fontSize: 11, textTransform: 'uppercase', letterSpacing: 1,
                                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                                        backdropFilter: 'blur(4px)', transition: 'all 0.3s'
                                    }}
                                >
                                    <span>←</span> BACK TO SOLAR SYSTEM
                                </button>
                            )}
                        </div>

                        <VizCanvas
                            orbits={{}}
                            riskEvents={[]}
                            mode="solar"
                            showNeo={activeNav === 'neo'}
                            timeMultiplier={timeMultiplier}
                            activePlanet={activePlanet}
                            onPlanetSelect={(name) => setActivePlanet(name)}
                        />

                        <div className="center-mode-label">
                            <div className="center-mode-label-text">
                                {activePlanet ? `System Base: ${PLANETS[activePlanet]?.name} · Press ESC to return` : 'Solar System Overview · Click a planet to zoom'}
                            </div>
                        </div>
                    </div>
                )}

                {/* NEO Prediction Engine full page */}
                {activeNav === 'neo' && (
                    <div className="center-content">
                        <div>
                            <div className="section-eyebrow" style={{ color: 'var(--gold)' }}> Planetary Defense System</div>
                            <p className="center-content-title" style={{ fontFamily: 'var(--font-display)' }}>Near-Earth Object (NEO) Threat Engine</p>
                            <p className="center-content-sub">
                                Simulating orbital paths for known asteroids and comets to detect Earth intersection zones
                                and calculate probabilistic impact risk over a 50-year horizon.
                            </p>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 1fr) 1fr', gap: 32, alignItems: 'start' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ fontSize: 13, textTransform: 'uppercase', color: 'var(--grey-300)', letterSpacing: 1 }}>Global Planetary Defense Schedule</div>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        {['date', 'distance', 'threat'].map(s => (
                                            <button
                                                key={s}
                                                onClick={() => setNeoSort(s)}
                                                style={{ padding: '6px 12px', fontSize: 10, fontFamily: 'monospace', textTransform: 'uppercase', cursor: 'pointer', background: neoSort === s ? 'var(--blue)' : 'var(--bg-deep)', color: neoSort === s ? '#000' : 'var(--grey-300)', border: `1px solid ${neoSort === s ? 'var(--blue)' : 'var(--border-dim)'}`, borderRadius: 2 }}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-dim)', borderRadius: 4, overflow: 'hidden' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                        <thead>
                                            <tr style={{ background: 'var(--bg-deep)', borderBottom: '1px solid var(--border-dim)', fontSize: 10, textTransform: 'uppercase', color: 'var(--grey-500)', letterSpacing: 1 }}>
                                                <th style={{ padding: '14px 16px', fontWeight: 'normal' }}>Object Identifier</th>
                                                <th style={{ padding: '14px 16px', fontWeight: 'normal' }}>Approach Date</th>
                                                <th style={{ padding: '14px 16px', fontWeight: 'normal' }}>Min Distance</th>
                                                <th style={{ padding: '14px 16px', fontWeight: 'normal' }}>Threat</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sortedNeos.map((neo, i) => (
                                                <tr key={i} style={{ borderBottom: '1px solid var(--border-dim)', fontSize: 12 }}>
                                                    <td style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                                                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: neo.color }} />
                                                        <span style={{ color: 'var(--white)', fontWeight: 'bold' }}>{neo.name}</span>
                                                    </td>
                                                    <td style={{ padding: '14px 16px', color: 'var(--blue)', fontFamily: 'monospace' }}>{neo.date}</td>
                                                    <td style={{ padding: '14px 16px', color: neo.approach === 'Intersection' || neo.approach === 'Impacted' ? 'var(--red)' : 'var(--grey-100)', fontFamily: 'monospace' }}>{neo.approach}</td>
                                                    <td style={{ padding: '14px 16px', color: neo.color, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 'bold', fontSize: 10 }}>{neo.risk}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <div style={{ background: 'rgba(198,32,10,0.05)', border: '1px solid rgba(198,32,10,0.3)', borderRadius: 4, padding: 16 }}>
                                    <div style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--red)', fontWeight: 'bold', marginBottom: 4 }}>Target Lock: Apophis</div>
                                    <div style={{ fontSize: 12, color: 'var(--grey-100)', lineHeight: 1.5 }}>
                                        Trajectory simulation confirms a close approach on April 13, 2029.
                                        Path intersects the GEO satellite belt. Artificial satellite shielding recommended.
                                    </div>
                                </div>

                                <div className="viz-area" style={{ height: 420, borderRadius: 4, overflow: 'hidden', border: '1px solid var(--border-dim)', position: 'relative' }}>
                                    <VizCanvas orbits={{}} riskEvents={[]} mode="solar" showNeo={true} timeMultiplier={timeMultiplier} />
                                    <div style={{ position: 'absolute', bottom: 10, left: 10, right: 10, background: 'rgba(0,0,0,0.8)', padding: 8, fontSize: 10, color: 'var(--gold)', textAlign: 'center', fontFamily: 'monospace', backdropFilter: 'blur(4px)', border: '1px solid var(--border-dim)', borderRadius: 2 }}>
                                        NEO Intersection Zone Visualization Active
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Cascade */}
                {activeNav === 'cascade' && (
                    <div className="center-content">
                        <div>
                            <div className="section-eyebrow"> Cascade Simulation Engine</div>
                            <p className="center-content-title">What Happens If A Collision Occurs?</p>
                            <p className="center-content-sub">
                                Each collision generates thousands of fragments that remain in orbit for decades,
                                causing additional collisions in a self-reinforcing chain reaction.
                                Press "Run Cascade" to simulate the propagation timeline.
                            </p>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start', position: 'relative', zIndex: 10 }}>
                            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-dim)', borderRadius: 4, padding: 20 }}>
                                <div className="panel-card-title">Cascade Propagation Model</div>
                                <CascadeSimulator data={cascadeData} />
                            </div>
                            <CascadeTimeline cascadeData={cascadeData} />
                        </div>
                    </div>
                )}

                {/* Heatmap & Future Forecast */}
                {activeNav === 'heatmap' && (
                    <div className="center-content">
                        <div>
                            <div className="section-eyebrow"> Long-Term Forecaster</div>
                            <p className="center-content-title">Orbital Stability Projection Engine</p>
                            <p className="center-content-sub">
                                Model how accelerated launch rates impact debris density, cascade thresholds, and the global Orbital Stability Index (OSI).
                            </p>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                {/* Future Simulator Controls */}
                                <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-dim)', borderRadius: 4, padding: '16px 24px', display: 'flex', gap: 32, alignItems: 'center' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, textTransform: 'uppercase', color: 'var(--grey-300)', marginBottom: 8, letterSpacing: 1 }}>
                                            <span>Simulation Horizon</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            {[5, 10, 20].map(y => (
                                                <button
                                                    key={y}
                                                    onClick={() => setFutureYears(y)}
                                                    style={{
                                                        flex: 1, padding: '8px 0', fontSize: 12, fontFamily: 'var(--font-display)',
                                                        background: futureYears === y ? 'var(--blue)' : 'var(--bg-deep)',
                                                        color: futureYears === y ? '#000' : 'var(--grey-300)',
                                                        border: `1px solid ${futureYears === y ? 'var(--blue)' : 'var(--border-dim)'}`,
                                                        borderRadius: 2, cursor: 'pointer', letterSpacing: 1
                                                    }}
                                                >
                                                    {y} YEARS
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, textTransform: 'uppercase', color: 'var(--grey-300)', marginBottom: 8, letterSpacing: 1 }}>
                                            <span>Satellites Added / Yr</span>
                                            <span style={{ color: 'var(--gold)' }}>+{newSats.toLocaleString()} Sats</span>
                                        </div>
                                        <input type="range" min="0" max="100000" step="1000" value={newSats} onChange={e => setNewSats(+e.target.value)} style={{ width: '100%', accentColor: 'var(--gold)' }} />
                                    </div>
                                </div>

                                {/* Graphing block */}
                                <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-dim)', borderRadius: 4, padding: 24, height: 320 }}>
                                    <div style={{ fontSize: 13, textTransform: 'uppercase', color: 'var(--grey-300)', letterSpacing: 1, marginBottom: 16 }}>Projection Timeline: Stability vs Risk</div>
                                    <ResponsiveContainer width="100%" height="80%">
                                        <LineChart data={forecastData}>
                                            <XAxis dataKey="year" stroke="var(--grey-500)" fontSize={11} tickMargin={10} />
                                            <YAxis yAxisId="left" stroke="var(--grey-500)" fontSize={11} domain={[0, 100]} />
                                            <YAxis yAxisId="right" orientation="right" stroke="var(--red)" fontSize={11} domain={[0, 'auto']} />
                                            <Tooltip
                                                contentStyle={{ background: 'rgba(0,0,0,0.8)', border: '1px solid var(--border-dim)', borderRadius: 4, fontSize: 11 }}
                                                labelStyle={{ color: 'var(--grey-300)', marginBottom: 4 }}
                                            />
                                            <Line yAxisId="left" type="monotone" name="OSI Score" dataKey="osi" stroke="#22cc55" strokeWidth={2} dot={false} />
                                            <Line yAxisId="right" type="monotone" name="Risk Index" dataKey="risk" stroke="#e74c3c" strokeWidth={2} dot={false} />
                                            <Line yAxisId="left" type="monotone" name="Congestion %" dataKey="congestion" stroke="#f39c12" strokeWidth={2} dot={false} strokeDasharray="4 4" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                {/* OSI Meter Block */}
                                <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-dim)', borderRadius: 4, padding: '24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--grey-300)', marginBottom: 16 }}>Projected Orbital Stability (OSI)</div>
                                    <div style={{ position: 'relative', width: 140, height: 140 }}>
                                        <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                                            <circle cx="50" cy="50" r="45" fill="none" stroke="var(--bg-deep)" strokeWidth="6" />
                                            <circle cx="50" cy="50" r="45" fill="none" stroke={osiColor} strokeWidth="6" strokeDasharray="283" strokeDashoffset={283 - (283 * osiScore) / 100} style={{ transition: 'stroke-dashoffset 0.5s ease-out, stroke 0.5s ease-out' }} />
                                        </svg>
                                        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                            <span style={{ fontSize: 32, fontFamily: 'var(--font-display)', fontWeight: 'bold', color: osiColor }}>{osiScore.toFixed(0)}</span>
                                            <span style={{ fontSize: 9, color: 'var(--grey-500)', textTransform: 'uppercase' }}>Index</span>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ background: 'var(--bg-deep)', border: '1px solid var(--border-dim)', borderRadius: 4, padding: 16 }}>
                                    <div style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--blue)', fontWeight: 'bold', marginBottom: 12, letterSpacing: 1 }}>Orbital Projection Forecast</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-dim)', paddingBottom: 6 }}>
                                            <span style={{ fontSize: 11, color: 'var(--grey-300)' }}>Predicted Object Count</span>
                                            <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--white)' }}>{(50000 * futureMultiplier).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-dim)', paddingBottom: 6 }}>
                                            <span style={{ fontSize: 11, color: 'var(--grey-300)' }}>Collision Prob. Increase</span>
                                            <span style={{ fontFamily: 'monospace', fontSize: 12, color: futureMultiplier > 1.4 ? 'var(--red)' : 'var(--gold)' }}>+{((futureMultiplier - 1) * 100).toFixed(1)}%</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: 11, color: 'var(--grey-300)' }}>Estimated Instability Year</span>
                                            <span style={{ fontFamily: 'monospace', fontSize: 12, color: futureMultiplier > 1.8 ? 'var(--red)' : 'var(--good)' }}>
                                                {futureMultiplier > 1.8 ? (new Date().getFullYear() + Math.floor((1.8 - 1) * 50000 / newSats * 2)) : 'Stable (>2050)'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Space Copilot full page */}
                {activeNav === 'copilot' && (
                    <div className="center-content">
                        <div>
                            <div className="section-eyebrow"> Autonomous Space Intelligence</div>
                            <p className="center-content-title">Space Copilot Interface</p>
                            <p className="center-content-sub">
                                Ask the AI about conjunction risks, maneuver recommendations, cascade scenarios,
                                or orbital congestion. The copilot uses live telemetry data to give contextual advice.
                            </p>
                        </div>
                        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-dim)', borderRadius: 4, padding: 24, height: 520 }}>
                            <SpaceCopilot risks={risks} orbits={orbits} sustainScore={81} />
                        </div>
                    </div>
                )}

                {/* Sustainability full page */}
                {activeNav === 'sustain' && (
                    <div className="center-content">
                        <div>
                            <div className="section-eyebrow"> Governance & Compliance</div>
                            <p className="center-content-title">Global Orbital Sustainability Index</p>
                            <p className="center-content-sub">
                                Your operator sustainability score reflects maneuver compliance, debris risk exposure,
                                congestion contribution, and end-of-life planning — benchmarked against IADC guidelines.
                            </p>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>
                            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-dim)', borderRadius: 4, padding: 28 }}>
                                <SustainabilityIndex />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                {[
                                    { icon: '', title: 'IADC Compliant', sub: 'All guidelines met', color: '#22cc55' },
                                    { icon: '', title: 'ITU Registered', sub: 'Frequency coordination complete', color: '#5b9bd5' },
                                    { icon: '', title: 'Active ADR Plan', sub: 'Deorbit sequence in progress', color: '#c8a84b' },
                                    { icon: '', title: 'Net-Zero Debris', sub: '0 uncontrolled reentries', color: '#22cc55' },
                                ].map(b => (
                                    <div key={b.title} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-dim)', borderRadius: 4, padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'center' }}>
                                        <div style={{ fontSize: 20 }}>{b.icon}</div>
                                        <div>
                                            <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', color: b.color }}>{b.title}</div>
                                            <div style={{ fontSize: 10, color: 'var(--grey-500)', marginTop: 2 }}>{b.sub}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Banners */}
                {(GLOBE_TABS.has(activeNav) || SOLAR_TABS.has(activeNav)) && activeNav !== 'solar' && highRisk && !maneuverDone && (
                    <div className="risk-alert">
                        <div>
                            <div className="risk-alert-label"> Conjunction Alert</div>
                            <div style={{ fontSize: 11, color: 'var(--grey-500)', marginTop: 2 }}>
                                {topRisk.sat1_id}  {topRisk.sat2_id}
                            </div>
                        </div>
                        <div className="risk-alert-pct">{(topRisk.probability * 100).toFixed(1)}%</div>
                        <div className="risk-alert-detail">Collision Probability</div>
                        <div className="risk-alert-time">
                            T–{Math.abs(topRisk.time_to_approach_hours).toFixed(1)}h
                        </div>
                    </div>
                )}
                {maneuverDone && GLOBE_TABS.has(activeNav) && (
                    <div className="success-banner">
                        AVOIDANCE MANEUVER EXECUTED — RISK REDUCED TO &lt;0.1%
                    </div>
                )}
            </main>

            {/*  RIGHT PANEL  */}
            <aside className="right-panel">

                {/* Solar System Statistics Panel */}
                {SOLAR_TABS.has(activeNav) && activePlanet && (
                    <div className="panel-card">
                        <div className="panel-card-title">Planetary Statistics</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                            <div style={{ fontSize: 32, fontFamily: 'var(--font-display)', color: 'var(--white)', fontWeight: 300 }}>{PLANETS[activePlanet].name}</div>
                            <div style={{ fontSize: 10, background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: 4, color: 'var(--grey-300)', textTransform: 'uppercase', letterSpacing: 1 }}>{PLANETS[activePlanet].type}</div>
                        </div>
                        <div className="metric-row"><span className="metric-label">Mean Radius</span><span className="metric-value">{PLANETS[activePlanet].radius}</span></div>
                        <div className="metric-row"><span className="metric-label">Gravity</span><span className="metric-value">{PLANETS[activePlanet].gravity}</span></div>
                        <div className="metric-row"><span className="metric-label">Mean Temperature</span><span className="metric-value accent">{PLANETS[activePlanet].temp}</span></div>
                        <div className="metric-row"><span className="metric-label">Orbital Period</span><span className="metric-value">{PLANETS[activePlanet].period}</span></div>
                        <div className="metric-row"><span className="metric-label">Confirmed Moons</span><span className="metric-value">{PLANETS[activePlanet].moons}</span></div>

                        {/* Additional Planet Info section */}
                        <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border-dim)' }}>
                            <div style={{ fontSize: 11, color: 'var(--grey-500)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Orbital Activity</div>
                            <div className="metric-row"><span className="metric-label">Active Satellites</span><span className="metric-value good">{PLANETS[activePlanet].satellites?.active.toLocaleString()}</span></div>
                            <div className="metric-row"><span className="metric-label">Orbital Debris</span><span className="metric-value danger">{PLANETS[activePlanet].satellites?.debris.toLocaleString()}</span></div>
                        </div>

                        {/* Asteroid Predictions section */}
                        <div style={{ marginTop: 16 }}>
                            <div style={{ fontSize: 11, color: 'var(--grey-500)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Planetary NEO Threats</div>
                            {(() => {
                                // Dynamically filter NEO dataset based on active planet orbit intersection
                                const pOrbit = PLANETS[activePlanet].orbitScale;
                                const margin = 8; // orbital overlap margin
                                const threats = NEO_DATASET.filter(neo => neo.perihelion <= pOrbit + margin && neo.aphelion >= pOrbit - margin);

                                if (threats.length === 0) {
                                    return <div style={{ fontSize: 11, color: 'var(--grey-400)', fontStyle: 'italic', padding: '8px 0' }}>No known critical impact events for this planetary band.</div>;
                                }

                                const closest = threats.reduce((min, n) => {
                                    const dist = n.approach === 'Intersection' || n.approach === 'Impacted' ? 0 : parseInt(n.approach.replace(/,/g, ''));
                                    return dist < min.d ? { d: dist, prob: n.prob, risk: n.risk, color: n.color } : min;
                                }, { d: Infinity, prob: threats[0].prob, risk: threats[0].risk, color: threats[0].color });

                                return (
                                    <div style={{ background: 'var(--bg-deep)', border: `1px solid ${closest.color}`, borderRadius: 4, padding: 16 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                            <span style={{ fontSize: 11, color: 'var(--grey-300)' }}>Active NEOs</span>
                                            <span style={{ fontSize: 13, fontFamily: 'monospace', color: 'var(--white)' }}>{threats.length}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                            <span style={{ fontSize: 11, color: 'var(--grey-300)' }}>Closest Approach</span>
                                            <span style={{ fontSize: 13, fontFamily: 'monospace', color: closest.d === 0 ? 'var(--red)' : 'var(--blue)' }}>{closest.d === 0 ? 'Intersection' : `${closest.d.toLocaleString()} km`}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                            <span style={{ fontSize: 11, color: 'var(--grey-300)' }}>Impact Probability</span>
                                            <span style={{ fontSize: 13, fontFamily: 'monospace', color: closest.color }}>{closest.prob}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-dim)', paddingTop: 10, marginTop: 4 }}>
                                            <span style={{ fontSize: 11, color: 'var(--grey-300)', textTransform: 'uppercase', letterSpacing: 1 }}>Threat Level</span>
                                            <span style={{ fontSize: 12, color: closest.color, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>{closest.risk}</span>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Temperature Trends section */}
                        {PLANETS[activePlanet].temperatureData && (
                            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border-dim)' }}>
                                <div style={{ fontSize: 11, color: 'var(--grey-500)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Surface Temperature Trend (°C)</div>
                                <div style={{ width: '100%', height: 100 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={PLANETS[activePlanet].temperatureData}>
                                            <XAxis dataKey="year" stroke="var(--grey-500)" fontSize={10} tickLine={false} axisLine={false} />
                                            <YAxis domain={['auto', 'auto']} width={30} stroke="var(--grey-500)" fontSize={10} tickLine={false} axisLine={false} />
                                            <Tooltip
                                                contentStyle={{ background: 'rgba(0,0,0,0.8)', border: '1px solid var(--border-dim)', borderRadius: 4, fontSize: 10 }}
                                                labelStyle={{ color: 'var(--grey-300)' }}
                                            />
                                            <Area type="monotone" dataKey="temp" stroke="#f39c12" fill="rgba(243, 156, 18, 0.2)" strokeWidth={2} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Personal Satellite Guardian */}
                {activeNav === 'guardian' && (
                    <div className="panel-card">
                        <div className="panel-card-title">Personal Satellite Guardian</div>
                        <select
                            style={{ width: '100%', background: 'var(--bg-deep)', color: 'white', padding: 8, border: '1px solid var(--border-dim)', borderRadius: 4, marginBottom: 12 }}
                            value={selectedSatId}
                            onChange={e => setSelectedSatId(e.target.value)}
                        >
                            {Object.keys(orbits).map(k => <option key={k} value={k}>{k}</option>)}
                        </select>

                        {gSatState && (
                            <>
                                <div className="metric-row"><span className="metric-label">Satellite Name</span><span className="metric-value">{selectedSatId}</span></div>
                                <div className="metric-row"><span className="metric-label">NORAD ID</span><span className="metric-value">{selectedSatId.replace('NORAD-', '')}</span></div>
                                <div className="metric-row"><span className="metric-label">Altitude</span><span className="metric-value accent">{gAlt} km</span></div>
                                <div className="metric-row"><span className="metric-label">Orbital Speed</span><span className="metric-value accent">{gSpeed} km/s</span></div>

                                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border-dim)' }}>
                                    <div style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--grey-500)', marginBottom: 8 }}>Orbital Health Score</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{ fontSize: 28, fontFamily: 'var(--font-display)', fontWeight: 'bold', color: gHealthColor }}>{gHealthScore.toFixed(0)}</div>
                                        <div style={{ fontSize: 11, color: 'var(--grey-300)', lineHeight: 1.4 }}>
                                            Based on local altitude congestion, relative velocity of nearby debris, and min separation.
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Live Metrics */}
                {(!SOLAR_TABS.has(activeNav) && activeNav !== 'guardian') && (
                    <div className="panel-card">
                        <div className="panel-card-title">Live System Metrics</div>
                        <div className="metric-row"><span className="metric-label">Tracked Objects</span><span className="metric-value accent">{Object.keys(orbits).length}</span></div>
                        <div className="metric-row"><span className="metric-label">Active Risk Events</span><span className={`metric-value${risks.length ? ' danger' : ' good'}`}>{risks.length}</span></div>
                        {topRisk && <>
                            <div className="metric-row"><span className="metric-label">Min Separation</span><span className="metric-value danger">{topRisk.min_distance_km.toFixed(2)} km</span></div>
                            <div className="metric-row"><span className="metric-label">Time to Event</span><span className="metric-value danger">{Math.abs(topRisk.time_to_approach_hours).toFixed(1)} h</span></div>
                        </>}
                        <div className="metric-row"><span className="metric-label">Orbital Health Score</span><span className="metric-value good">81 / 100</span></div>
                    </div>
                )}

                {/* Space Weather Integration */}
                {spaceWeather && (!SOLAR_TABS.has(activeNav) && activeNav !== 'guardian') && (
                    <div className="panel-card">
                        <div className="panel-card-title">Space Weather Threat</div>
                        <div className="metric-row"><span className="metric-label">NOAA Kp-Index</span><span className={`metric-value ${spaceWeather.kp_index >= 4 ? 'danger' : 'gold'}`}>{spaceWeather.kp_index}</span></div>
                        <div className="metric-row"><span className="metric-label">Threat Level</span><span className={`metric-value ${spaceWeather.threat_level === 'Nominal' ? 'good' : 'danger'}`}>{spaceWeather.threat_level}</span></div>
                        <div style={{ marginTop: 8, fontSize: 10, color: 'var(--grey-300)', lineHeight: 1.4, padding: '6px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: 3 }}>
                            {spaceWeather.drag_impact}
                        </div>
                    </div>
                )}

                {/* Context panel */}
                {(activeNav === 'guardian' || activeNav === 'risk') && (
                    <div className="panel-card">
                        <div className="panel-card-title">Risk Intelligence</div>
                        {risks.length === 0
                            ? <p style={{ fontSize: 11, color: 'var(--grey-500)', textAlign: 'center', padding: '10px 0' }}>No critical events detected.</p>
                            : risks.slice(0, 4).map((r, i) => (
                                <div key={i} className="risk-item">
                                    <div className="risk-item-header">
                                        <span className="risk-item-ids">{r.sat1_id}  {r.sat2_id}</span>
                                        <span className="risk-item-pct">{(r.probability * 100).toFixed(1)}%</span>
                                    </div>
                                    <div className="risk-item-detail">
                                        <div className="risk-item-stat">Dist: <span>{r.min_distance_km.toFixed(2)} km</span></div>
                                        <div className="risk-item-stat">T–{Math.abs(r.time_to_approach_hours).toFixed(1)}h</div>
                                    </div>
                                    <div className="prob-bar-wrap">
                                        <div className="prob-bar-fill" style={{ width: `${Math.min(r.probability * 100 * 3, 100)}%` }} />
                                    </div>

                                    {/* Advanced: Explainability & Uncertainty (Top Risk only) */}
                                    {i === 0 && (
                                        <div style={{ marginTop: 12, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 10 }}>
                                            <div style={{ fontSize: 9, color: 'var(--blue)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, fontWeight: 'bold' }}>Explainable Risk Analysis</div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 6, borderBottom: '1px solid var(--border-dim)', paddingBottom: 4 }}>
                                                <span style={{ color: 'var(--grey-300)' }}>Collision Probability</span>
                                                <span style={{ color: 'var(--red)', fontFamily: 'monospace' }}>{(r.probability * 100).toFixed(1)}%</span>
                                            </div>
                                            <div style={{ fontSize: 9, color: 'var(--grey-500)', textTransform: 'uppercase', letterSpacing: 1, margin: '8px 0 6px' }}>Contributors</div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 4 }}>
                                                <span style={{ color: 'var(--grey-300)' }}>Relative Velocity</span>
                                                <span style={{ color: 'var(--red)', fontFamily: 'monospace' }}>+18%</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 4 }}>
                                                <span style={{ color: 'var(--grey-300)' }}>Orbital Congestion</span>
                                                <span style={{ color: 'var(--red)', fontFamily: 'monospace' }}>+22%</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 4 }}>
                                                <span style={{ color: 'var(--grey-300)' }}>Intersection Angle</span>
                                                <span style={{ color: 'var(--gold)', fontFamily: 'monospace' }}>+14%</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 4 }}>
                                                <span style={{ color: 'var(--grey-300)' }}>Debris Density</span>
                                                <span style={{ color: 'var(--gold)', fontFamily: 'monospace' }}>+11%</span>
                                            </div>
                                            {r.uncertainty_ellipsoid && (
                                                <div style={{ marginTop: 8, padding: '6px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: 4 }}>
                                                    <div style={{ fontSize: 9, color: 'var(--blue)' }}>Uncertainty Ellipsoid (1σ)</div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--grey-500)', marginTop: 2 }}>
                                                        <span>R: {r.uncertainty_ellipsoid.radial_km}km</span>
                                                        <span>I: {r.uncertainty_ellipsoid.in_track_km}km</span>
                                                        <span>C: {r.uncertainty_ellipsoid.cross_track_km}km</span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Risk Trend Graph */}
                                            <div style={{ marginTop: 14 }}>
                                                <div style={{ fontSize: 9, color: 'var(--grey-500)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>24-Hour Risk Trend</div>
                                                <div style={{ width: '100%', height: 60 }}>
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <AreaChart data={riskTrendData}>
                                                            <XAxis dataKey="time" hide />
                                                            <YAxis domain={[0, 'auto']} hide />
                                                            <Tooltip
                                                                contentStyle={{ background: 'rgba(0,0,0,0.8)', border: '1px solid var(--border-dim)', borderRadius: 4, fontSize: 10 }}
                                                                formatter={(val) => [val.toFixed(2) + '%', 'Risk']}
                                                                labelStyle={{ color: 'var(--grey-300)' }}
                                                            />
                                                            <Area type="monotone" dataKey="risk" stroke="#ff2a2a" fill="rgba(255,42,42,0.15)" strokeWidth={1.5} />
                                                        </AreaChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        }
                    </div>
                )}

                {activeNav === 'cascade' && cascadeData && (
                    <div className="panel-card">
                        <div className="panel-card-title">Cascade Statistics</div>
                        <div className="metric-row"><span className="metric-label">Primary Fragments</span><span className="metric-value danger">{cascadeData.primary_fragments?.toLocaleString()}</span></div>
                        <div className="metric-row"><span className="metric-label">Kessler Risk</span><span className={`metric-value ${cascadeData.kessler_threshold_crossed ? 'danger' : 'good'}`}>{cascadeData.kessler_threshold_crossed ? 'HIGH' : 'LOW'}</span></div>
                        <div className="metric-row"><span className="metric-label">Stages</span><span className="metric-value accent">{cascadeData.stages?.length}</span></div>
                    </div>
                )}

                {activeNav === 'heatmap' && heatmapData?.summary && (
                    <div className="panel-card">
                        <div className="panel-card-title">Congestion Summary</div>
                        <div className="metric-row"><span className="metric-label">Critical Bands</span><span className="metric-value danger">{heatmapData.summary.critical_bands}</span></div>
                        <div className="metric-row"><span className="metric-label">Dense Bands</span><span className="metric-value gold">{heatmapData.summary.dense_bands}</span></div>
                        <div className="metric-row"><span className="metric-label">Safe Bands</span><span className="metric-value good">{heatmapData.summary.safe_bands}</span></div>
                        <div className="metric-row"><span className="metric-label">Global Health</span><span className="metric-value accent">{heatmapData.summary.global_health_score ?? '—'}%</span></div>
                    </div>
                )}

                {/* AI Copilot */}
                <div className="panel-card">
                    <div className="panel-card-title">AI Copilot</div>
                    <div className="copilot-msg">
                        <div className="copilot-prefix">&gt; SYSTEM ASSESSMENT</div>
                        {activeNav === 'cascade'
                            ? 'Cascade simulation initiated. Monitor fragment expansion rate at 550–600 km altitude band. Proactive collision avoidance recommended for assets in this zone.'
                            : activeNav === 'heatmap'
                                ? 'Critical congestion detected in LEO 550–800 km. Recommend deorbit timeline enforcement and new launch licensing restrictions for this zone.'
                                : topRisk
                                    ? `A ${(topRisk.probability * 100).toFixed(1)}% collision probability is predicted in the next ${Math.abs(topRisk.time_to_approach_hours).toFixed(0)} hours between objects ${topRisk.sat1_id} and ${topRisk.sat2_id}.`
                                    : 'Orbital environment nominal. No immediate conjunctions detected. Continue monitoring.'}
                        {topRisk && !maneuverDone && activeNav === 'maneuver' && (
                            <div className="copilot-action-box">
                                <div className="copilot-action-label">Recommended Action</div>
                                A {deltaV.toFixed(1)} m/s delta-v maneuver at T+14h reduces risk to &lt;0.1%.
                            </div>
                        )}
                        {maneuverDone && (
                            <div className="copilot-action-box" style={{ borderColor: 'rgba(34,204,85,0.3)', background: 'rgba(34,204,85,0.05)' }}>
                                <div className="copilot-action-label" style={{ color: '#22cc55' }}>Maneuver Executed</div>
                                Risk reduced to 0.08%. Fuel cost: {(deltaV * 0.56).toFixed(2)} kg.
                            </div>
                        )}
                    </div>
                </div>

                {/* Maneuver */}
                <div className="panel-card">
                    <div className="panel-card-title">Maneuver Simulation</div>
                    <div className="slider-wrap">
                        <div className="slider-label">
                            Delta-V Thrust
                            <span>{deltaV.toFixed(1)} m/s</span>
                        </div>
                        <input type="range" min="0.1" max="3.0" step="0.1" value={deltaV} onChange={e => setDeltaV(+e.target.value)} disabled={maneuverDone} />

                        {/* Cost-Risk Tradeoff Model */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--grey-500)', marginTop: 6, marginBottom: 8 }}>
                            <span>Propellant: {(deltaV * 0.56).toFixed(2)} kg</span>
                            {maneuverData?.tradeoff_curve && <span>Risk: {(maneuverData.tradeoff_curve.find(c => Math.abs(c.delta_v_ms / 1000 - deltaV) < 0.05)?.collision_prob * 100 || 0).toFixed(3)}%</span>}
                        </div>

                        {/* Tradeoff Curve Graph */}
                        {maneuverData?.tradeoff_curve && (
                            <div style={{ width: '100%', height: 80, marginTop: 8 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={maneuverData.tradeoff_curve}>
                                        <XAxis dataKey="delta_v_ms" tickFormatter={(v) => (v / 1000).toFixed(1)} hide />
                                        <YAxis dataKey="collision_prob" domain={[0, 'auto']} hide />
                                        <Tooltip
                                            contentStyle={{ background: 'rgba(0,0,0,0.8)', border: '1px solid var(--border-dim)', borderRadius: 4, fontSize: 10 }}
                                            formatter={(val, name) => [name === 'collision_prob' ? (val * 100).toFixed(3) + '%' : val, name === 'collision_prob' ? 'Risk' : 'Δv (m/s)']}
                                            labelFormatter={(v) => `Δv: ${(v / 1000).toFixed(1)} m/s`}
                                        />
                                        <Area type="monotone" dataKey="collision_prob" stroke="#ff2a2a" fill="rgba(255,42,42,0.1)" strokeWidth={2} />
                                        {/* Marker for current Delta-V selection */}
                                        <Line type="monotone" data={maneuverData.tradeoff_curve.filter(c => Math.abs(c.delta_v_ms / 1000 - deltaV) < 0.05)} dataKey="collision_prob" stroke="#00c8ff" strokeWidth={0} activeDot={{ r: 4, fill: '#00c8ff', stroke: '#fff', strokeWidth: 1 }} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>

                    {/* Multi-Satellite Conflict Warning */}
                    {maneuverDone && maneuverData?.secondary_conflict && (
                        <div style={{ marginTop: 12, padding: 10, background: 'rgba(198,32,10,0.1)', border: '1px solid var(--red)', borderRadius: 4 }}>
                            <div style={{ fontSize: 10, color: 'var(--red)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 4 }}>⚠ Secondary Conflict Detected</div>
                            <div style={{ fontSize: 11, color: 'var(--grey-100)' }}>
                                {maneuverData.secondary_conflict.warning}. T-{maneuverData.secondary_conflict.time_to_approach_hours}h.
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                        {!maneuverDone && (
                            <button
                                className="btn-hero-primary"
                                disabled={isSolving}
                                onClick={async () => {
                                    setIsSolving(true);
                                    const { newRisk, deltaV: opt } = await onAutoSolve();
                                    const startVal = deltaV;
                                    const endVal = opt;
                                    const steps = 20;
                                    const stepVal = (endVal - startVal) / steps;
                                    let currentStep = 0;

                                    const interval = setInterval(() => {
                                        currentStep++;
                                        setDeltaV(startVal + stepVal * currentStep);
                                        if (currentStep >= steps) {
                                            clearInterval(interval);
                                            setDeltaV(endVal);
                                            setIsSolving(false);
                                            onComplete(newRisk);
                                        }
                                    }, 40);
                                }}
                                style={{ flex: 1, padding: '12px 0', fontSize: 11, opacity: isSolving ? 0.7 : 1 }}
                            >
                                {isSolving ? 'CALCULATING...' : 'AI AUTO-SOLVE'}
                            </button>
                        )}
                        <button
                            className={`btn-maneuver${maneuverDone ? ' success' : ''}`}
                            onClick={async () => {
                                setIsSolving(true);
                                const { newRisk } = await onManeuver(deltaV);
                                setIsSolving(false);
                                onComplete(newRisk);
                            }}
                            disabled={maneuverDone || isSolving}
                            style={{ flex: maneuverDone ? '1' : '1.5', opacity: isSolving ? 0.7 : 1 }}
                        >
                            {maneuverDone ? ' MANEUVER COMPLETE' : 'MANUAL SIMULATION'}
                        </button>
                    </div>
                </div>

                {/* Sustainability */}
                <div className="panel-card">
                    <div className="panel-card-title">Orbital Sustainability</div>
                    <div className="score-ring-wrap">
                        <div className="score-ring"><div className="score-ring-num">81</div></div>
                        <div className="score-details">
                            <div><strong>Responsible Operator</strong></div>
                            <div>Risk Exposure: Low</div>
                            <div>Maneuver History: Clean</div>
                            <div>Congestion Impact: Minimal</div>
                        </div>
                    </div>
                </div>

            </aside>
        </div>
    );
}

/*  Sub-components  */

function CascadeTimeline({ cascadeData }) {
    const stages = cascadeData?.stages || [];
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-dim)', borderRadius: 4, padding: 20 }}>
                <div className="panel-card-title">Event Statistics</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {[
                        { label: 'Debris Multiplication', val: 'x14.2', color: 'var(--red)' },
                        { label: 'Secondary Prob.', val: '94%', color: 'var(--red)' },
                        { label: 'OSI Impact', val: '-42 pts', color: 'var(--gold)' },
                        { label: 'Recovery Timeline', val: '12 yrs', color: 'var(--blue)' },
                    ].map(m => (
                        <div key={m.label} style={{ background: 'var(--bg-raised)', borderRadius: 3, padding: '10px 12px' }}>
                            <div style={{ fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--grey-500)', marginBottom: 5 }}>{m.label}</div>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: m.color }}>{m.val}</div>
                        </div>
                    ))}
                </div>
                {cascadeData?.stages?.length > 0 && (
                    <div style={{ marginTop: 12, padding: 10, background: 'rgba(198,32,10,0.05)', border: '1px solid var(--border-red)', borderRadius: 3, fontSize: 11, color: 'var(--red)', fontFamily: 'monospace' }}>
                        &gt; Estimated orbital recovery time: 12 years under current mitigation rate.
                    </div>
                )}
            </div>
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-dim)', borderRadius: 4, padding: 20 }}>
                <div className="panel-card-title">Propagation Timeline</div>
                {stages.map((s, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'flex-start' }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 10, color: 'var(--red)', width: 60, flexShrink: 0, paddingTop: 2, letterSpacing: 1 }}>
                            T+{s.years_forward}mo
                        </div>
                        <div style={{ width: 1, background: 'rgba(198,32,10,0.25)', alignSelf: 'stretch', flexShrink: 0 }} />
                        <div>
                            <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 2 }}>{s.label}</div>
                            <div style={{ fontSize: 10, color: 'var(--grey-500)' }}>+{s.fragments_added.toLocaleString()} fragments · {s.altitude_km.toFixed(0)} km</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function CongestionLegend() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
                { color: '#22cc55', title: 'Safe', desc: 'Below sustainable density. Normal operations supported.' },
                { color: '#ffd700', title: 'Dense', desc: 'Elevated encounter rate. Enhanced tracking required.' },
                { color: '#ff7700', title: 'High', desc: 'Conjunction rates rising. Maneuver planning essential.' },
                { color: 'var(--red)', title: 'Critical', desc: 'Approaching Kessler threshold. Policy action needed.' },
            ].map(c => (
                <div key={c.title} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-dim)', borderRadius: 4, padding: '12px 14px' }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 5 }}>
                        <div style={{ width: 10, height: 10, borderRadius: 2, background: c.color, flexShrink: 0 }} />
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>{c.title}</span>
                    </div>
                    <p style={{ fontSize: 11, color: 'var(--grey-300)', lineHeight: 1.6 }}>{c.desc}</p>
                </div>
            ))}
        </div>
    );
}

/*  Demo fallback data  */

const DEMO_CASCADE = {
    primary_fragments: 420, primary_collision_energy_kj: 3150,
    kessler_threshold_crossed: false,
    warning: 'Contained event — cascade manageable with active debris removal.',
    stages: [
        { stage: 0, years_forward: 0, fragments_added: 420, total_fragments_cumulative: 420, altitude_km: 550, affected_band_km: 50, risk_score: 0.08, orbital_accessibility: 0.93, label: 'Primary Collision' },
        { stage: 1, years_forward: 6, fragments_added: 126, total_fragments_cumulative: 546, altitude_km: 580, affected_band_km: 130, risk_score: 0.11, orbital_accessibility: 0.90, label: 'First Fragmentation Wave' },
        { stage: 2, years_forward: 12, fragments_added: 38, total_fragments_cumulative: 584, altitude_km: 560, affected_band_km: 210, risk_score: 0.12, orbital_accessibility: 0.89, label: 'Secondary Cascade' },
        { stage: 3, years_forward: 18, fragments_added: 11, total_fragments_cumulative: 595, altitude_km: 590, affected_band_km: 290, risk_score: 0.12, orbital_accessibility: 0.88, label: 'Tertiary Propagation' },
        { stage: 4, years_forward: 24, fragments_added: 3, total_fragments_cumulative: 598, altitude_km: 570, affected_band_km: 370, risk_score: 0.12, orbital_accessibility: 0.87, label: 'Runaway Congestion' },
    ],
};

const DEMO_HEATMAP = {
    bands: [
        { band: '100–200 km', object_density: 0.05, status: 'safe', color: '#22cc55' },
        { band: '200–400 km', object_density: 0.12, status: 'safe', color: '#22cc55' },
        { band: '400–600 km', object_density: 0.68, status: 'dense', color: '#ffd700' },
        { band: '550–600 km', object_density: 0.91, status: 'critical', color: '#c6200a' },
        { band: '600–800 km', object_density: 0.85, status: 'critical', color: '#c6200a' },
        { band: '800–1000 km', object_density: 0.72, status: 'high', color: '#ff7700' },
        { band: '1000–1500 km', object_density: 0.35, status: 'dense', color: '#ffd700' },
        { band: '1500–2000 km', object_density: 0.15, status: 'safe', color: '#22cc55' },
        { band: 'GEO Ring', object_density: 0.55, status: 'dense', color: '#ffd700' },
    ],
    summary: { critical_bands: 2, dense_bands: 3, safe_bands: 4, global_health_score: 58 },
    recommendation: 'Critical congestion detected in LEO 550–800 km. Recommend mandatory deorbit timelines for all non-operational satellites in this zone.',
};
