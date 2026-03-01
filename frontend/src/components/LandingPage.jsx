import { useRef, useEffect, Suspense } from 'react';
import HeroEarth from './HeroEarth';

/* High-quality space images — Unsplash CDN */
const ORBIT_IMG = 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=900&q=85';
const GALLERY_1 = 'https://images.unsplash.com/photo-1541185934-01b600ea069c?auto=format&fit=crop&w=900&q=85';
const GALLERY_2 = 'https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&w=900&q=85';
const GALLERY_3 = 'https://images.unsplash.com/photo-1614642264762-d0a3b8bf3700?auto=format&fit=crop&w=900&q=85';

const TIMELINE_DATA = [
    { year: '1957', name: 'Sputnik 1', provider: 'Soviet Union', type: 'Pioneer Satellite', status: 'Historical', color: '#5b9bd5', desc: 'First artificial satellite. 83.6 kg. Changed human civilization forever.' },
    { year: '1961', name: 'Vostok 1 (Gagarin)', provider: 'Soviet Union', type: 'Crewed Mission', status: 'Historical', color: '#5b9bd5', desc: 'First human in orbit. Yuri Gagarin. 108 minutes mission duration.' },
    { year: '1969', name: 'Apollo 11', provider: 'NASA', type: 'Lunar Mission', status: 'Historical', color: '#5b9bd5', desc: 'First humans on the Moon. Armstrong, Aldrin, Collins crew.' },
    { year: '1972', name: 'Landsat 1', provider: 'NASA/USGS', type: 'Earth Obs.', status: 'Historical', color: '#5b9bd5', desc: 'First civilian Earth observation satellite. Launched continuous monitoring legacy.' },
    { year: '1973', name: 'Skylab', provider: 'NASA', type: 'Space Station', status: 'Historical', color: '#5b9bd5', desc: 'First US space station. Hosted 3 crews for 171 total days in orbit.' },
    { year: '1990', name: 'Hubble Space Telescope', provider: 'NASA/ESA', type: 'Science Observatory', status: 'Historical', color: '#5b9bd5', desc: 'Revolutionary optical telescope. Transformed our view of the universe for decades.' },
    { year: '1993', name: 'GPS Constellation (IIR)', provider: 'USAF', type: 'Navigation Constellation', status: 'Historical', color: '#5b9bd5', desc: 'Completed full GPS operational constellation. 24 satellites covering the globe.' },
    { year: '1998', name: 'ISS Module Zarya', provider: 'NASA / Roscosmos', type: 'Space Station', status: 'Operational', color: '#22cc55', desc: 'First ISS module launched. International partnership across 15 nations.' },
    { year: '2009', name: 'Kepler Space Telescope', provider: 'NASA', type: 'Science Observatory', status: 'Historical', color: '#5b9bd5', desc: 'Discovered 2,662 exoplanets. Revolutionized planetary science and our view of life.' },
    { year: '2013', name: 'Gaia (ESA)', provider: 'ESA', type: 'Astrometry', status: 'Operational', color: '#22cc55', desc: 'Maps 1 billion stars in the Milky Way with unprecedented precision.' },
    { year: '2015', name: 'DSCOVR', provider: 'NOAA / NASA', type: 'Space Weather Monitor', status: 'Operational', color: '#22cc55', desc: 'Real-time solar wind monitoring at L1 Lagrange Point. Powers our space weather API.' },
    { year: '2019', name: 'Starlink Batch 1 (V0.9)', provider: 'SpaceX', type: 'Broadband Constellation', status: 'Operational', color: '#22cc55', desc: 'First 60 Starlink satellites. Beginning of the LEO mega-constellation era.' },
    { year: '2021', name: 'James Webb Space Telescope', provider: 'NASA / ESA / CSA', type: 'Science Observatory', status: 'Operational', color: '#22cc55', desc: '6.5m infrared telescope. Observes galaxies from the early universe. Still operational.' },
    { year: '2022', name: 'OneWeb Full Constellation', provider: 'OneWeb / Eutelsat', type: 'Broadband Constellation', status: 'Operational', color: '#22cc55', desc: '648-satellite LEO constellation. Global broadband coverage achieved.' },
    { year: '2022', name: 'DART Mission (Impact)', provider: 'NASA / APL', type: 'Planetary Defense', status: 'Historical', color: '#5b9bd5', desc: 'First successful asteroid deflection. Impacted Dimorphos. Changed its orbit by 33 minutes.' },
    { year: '2024', name: 'Starlink Direct-to-Cell', provider: 'SpaceX', type: 'Direct Cellular Satellite', status: 'Operational', color: '#22cc55', desc: 'First direct-to-smartphone connectivity from orbit without special hardware.' },
    { year: '2025', name: 'NISAR (NASA-ISRO)', provider: 'NASA / ISRO', type: 'Earth Obs. Radar', status: 'Operational', color: '#22cc55', desc: 'Largest-ever NASA-ISRO collaboration. Dual-band radar with 12-day global coverage.' },
    { year: '2025', name: 'New Uranus Moon (S/2025 U1)', provider: 'NASA / JWST', type: 'Discovery', status: 'Historical', color: '#5b9bd5', desc: 'James Webb discovers 29th moon of Uranus. 6-mile diameter. Retrograde orbit.' },
    { year: '2026 Q2', name: 'Starlink Group 8-3', provider: 'SpaceX', type: 'Broadband Constellation', status: 'Upcoming', color: '#f39c12', desc: 'Continuing V2 mega-constellation expansion. Target: 7,500+ total active satellites.' },
    { year: '2026 Sep', name: 'Artemis II', provider: 'NASA', type: 'Crewed Lunar Flyby', status: 'Upcoming', color: '#f39c12', desc: 'First crewed SLS/Orion mission. Reid Wiseman, Victor Glover, Christina Koch, Jeremy Hansen.' },
    { year: '2026', name: 'Gaganyaan (Crewed)', provider: 'ISRO', type: 'Crewed Mission', status: 'Planned', color: '#c8a84b', desc: "India's first crewed orbital mission. 3-day LEO mission. Crew of 3 Indian astronauts." },
    { year: '2027', name: 'ESA PLATO Mission', provider: 'ESA', type: 'Exoplanet Science', status: 'Planned', color: '#c8a84b', desc: 'Planetary Transits and Oscillations of stars. Survey of 1 million stars for Earth-like planets.' },
    { year: '2028', name: 'Lunar Gateway (Halo)', provider: 'NASA / Int\'l Partners', type: 'Lunar Station', status: 'Planned', color: '#c8a84b', desc: 'First module of human outpost orbiting the Moon. Humanity\'s next permanent orbital destination.' },
];

function TimelineCard({ item, isLeft }) {
    const cardStyle = {
        width: 'calc(50% - 32px)',
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid ${item.color}22`,
        borderRadius: 4,
        padding: '18px 22px',
        position: 'relative',
        transition: 'background 0.2s',
    };
    if (isLeft) cardStyle.borderLeft = `3px solid ${item.color}`;
    else cardStyle.borderRight = `3px solid ${item.color}`;

    const statusBg = {
        'Operational': 'rgba(34,204,85,0.12)', 'Upcoming': 'rgba(243,156,18,0.12)',
        'Planned': 'rgba(200,168,75,0.12)', 'Historical': 'rgba(91,155,213,0.12)'
    }[item.status] || 'rgba(255,255,255,0.08)';

    return (
        <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: item.color, fontWeight: 'bold', lineHeight: 1, letterSpacing: 1 }}>
                    {item.year}
                </div>
                <div style={{ fontSize: 9, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: 1.5, padding: '3px 8px', borderRadius: 2, background: statusBg, color: item.color }}>
                    {item.status}
                </div>
            </div>
            <div style={{ fontSize: 14, fontWeight: 'bold', color: '#fff', marginBottom: 5, letterSpacing: 0.3 }}>{item.name}</div>
            <div style={{ fontSize: 10, color: item.color, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                {item.provider}  ·  {item.type}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{item.desc}</div>
        </div>
    );
}

export default function LandingPage({ onEnter }) {
    const canvasRef = useRef(null);

    const scrollTo = (id) => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let raf;
        const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
        resize();
        window.addEventListener('resize', resize);
        const stars = Array.from({ length: 180 }, () => ({
            x: Math.random() * canvas.width, y: Math.random() * canvas.height,
            r: Math.random() * 1.2 + 0.2, o: Math.random() * 0.5 + 0.15,
            speed: Math.random() * 0.03 + 0.008, phase: Math.random() * Math.PI * 2,
        }));
        const draw = (t) => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            stars.forEach(s => {
                const a = s.o * (0.6 + 0.4 * Math.sin(t * s.speed + s.phase));
                ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255,255,255,${a})`; ctx.fill();
            });
            raf = requestAnimationFrame(draw);
        };
        raf = requestAnimationFrame(draw);
        return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
    }, []);

    return (
        <div className="landing-page">
            <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }} />

            {/*  NAV  */}
            <nav className="landing-nav" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50 }}>
                <img src="/logo.png" alt="DebrisX" className="nav-logo" />
                <ul className="nav-links">
                    <li><a href="#" onClick={e => { e.preventDefault(); scrollTo('mission'); }}>Mission</a></li>
                    <li><a href="#" onClick={e => { e.preventDefault(); scrollTo('capabilities'); }}>Capabilities</a></li>
                    <li><a href="#" onClick={e => { e.preventDefault(); scrollTo('timeline'); }}>Timeline</a></li>
                    <li><a href="#" onClick={e => { e.preventDefault(); onEnter(); }}>Control Center</a></li>
                </ul>
                <button className="nav-cta" onClick={onEnter}>Launch System</button>
            </nav>

            {/*  HERO  */}
            <section className="hero" style={{ marginTop: 64, background: '#000' }}>
                <Suspense fallback={null}><HeroEarth /></Suspense>
                <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(to right, rgba(0,0,0,0.85) 50%, rgba(0,0,0,0.2) 100%)' }} />
                <div className="hero-content" style={{ position: 'relative', zIndex: 2 }}>
                    <div className="hero-eyebrow">Autonomous Orbital Intelligence</div>
                    <img src="/logo.png" alt="DebrisX" className="hero-logo-img" />
                    <h1 className="hero-title">THE <span className="hero-title-accent">AI BRAIN</span><br />FOR EARTH'S ORBIT</h1>
                    <p className="hero-sub" style={{ fontSize: '18px', maxWidth: '600px', lineHeight: 1.5, color: 'var(--white)' }}>
                        An AI-powered digital twin that predicts and protects orbital stability.
                    </p>
                    <div className="hero-actions">
                        <button className="btn-hero-primary" onClick={() => onEnter('guardian')}>ADOPT A SATELLITE</button>
                        <button className="btn-hero-ghost" onClick={() => scrollTo('timeline')}>VIEW LAUNCH TIMELINE</button>
                    </div>
                </div>
                <div className="scroll-cue"><div className="scroll-cue-line" />SCROLL</div>
            </section>

            {/*  STATS  */}
            <div className="stats-bar">
                {[
                    { num: '36', unit: 'K+', label: 'Tracked Orbital Objects' },
                    { num: '750', unit: 'K', label: 'Untracked Fragments >1cm' },
                    { num: '28,000', unit: '', label: 'km/h Average Impact Speed' },
                    { num: '48', unit: 'h', label: 'Prediction Horizon' },
                ].map(s => (
                    <div className="stat-item" key={s.label}>
                        <div className="stat-num">{s.num}<span>{s.unit}</span></div>
                        <div className="stat-label">{s.label}</div>
                    </div>
                ))}
            </div>

            {/*  MISSION  */}
            <section className="section" id="mission" style={{ background: 'var(--bg-deep)' }}>
                <div className="problem-grid">
                    <div>
                        <div className="section-eyebrow">The Kessler Crisis</div>
                        <h2 className="section-title">Earth's Orbit is Becoming<br />a Debris Minefield</h2>
                        <p className="section-body">
                            Over 36,000 tracked objects circle Earth at 28,000 km/h. Even a 1 cm fragment carries the kinetic energy of a hand grenade. A single collision can trigger a <strong style={{ color: 'var(--white)' }}> Kessler cascade</strong> — making entire orbital bands unusable for generations.
                        </p>
                        <p className="section-body" style={{ marginTop: 16 }}>
                            DebrisX uses AI-driven orbital simulation to predict, assess, and avert these events before they happen — autonomously.
                        </p>
                    </div>
                    <div style={{ position: 'relative' }}>
                        <img src={ORBIT_IMG} alt="Orbital debris field simulation" style={{ width: '100%', borderRadius: 4, display: 'block', filter: 'brightness(0.8) saturate(0.7)', border: '1px solid var(--border-dim)' }} />
                        <div style={{ position: 'absolute', bottom: 10, left: 10, fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', background: 'rgba(0,0,0,0.5)', padding: '3px 8px', borderRadius: 2 }}>Simulated GEO Debris Field · ESA/NASA</div>
                    </div>
                </div>
            </section>

            {/* CINEMATIC FULLWIDTH IMAGE — LAUNCH */}
            <div style={{ position: 'relative', width: '100%', height: 520, overflow: 'hidden' }}>
                <img
                    src="https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&w=1800&q=90"
                    alt="Rocket launch"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%', filter: 'brightness(0.55) saturate(0.85)' }}
                    crossOrigin="anonymous"
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.75) 30%, transparent 70%), linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)' }} />
                <div style={{ position: 'absolute', bottom: 56, left: 72 }}>
                    <div style={{ fontSize: 10, letterSpacing: 3, color: 'var(--blue)', textTransform: 'uppercase', marginBottom: 10 }}>PROPULSION</div>
                    <div style={{ fontSize: 'clamp(26px, 4vw, 52px)', fontFamily: 'var(--font-display)', color: '#fff', fontWeight: 300, lineHeight: 1.1, letterSpacing: 2, textTransform: 'uppercase' }}>
                        EVERY LAUNCH<br /><span style={{ color: 'rgba(255,255,255,0.5)' }}>CHANGES THE ORBIT.</span>
                    </div>
                </div>
            </div>

            {/* CINEMATIC 2-PANEL — EARTH + DEBRIS */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', height: 480 }}>
                <div style={{ position: 'relative', overflow: 'hidden' }}>
                    <img
                        src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=900&q=90"
                        alt="Earth from orbit"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.6)' }}
                        crossOrigin="anonymous"
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 60%)' }} />
                    <div style={{ position: 'absolute', bottom: 40, left: 40 }}>
                        <div style={{ fontSize: 9, letterSpacing: 3, color: 'var(--blue)', textTransform: 'uppercase', marginBottom: 8 }}>ISS · 400 KM ALTITUDE</div>
                        <div style={{ fontSize: 28, fontFamily: 'var(--font-display)', color: '#fff', fontWeight: 300, letterSpacing: 1 }}>THE BLUE MARBLE</div>
                    </div>
                </div>
                <div style={{ position: 'relative', overflow: 'hidden' }}>
                    <img
                        src="https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=900&q=90"
                        alt="Orbital debris field"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.45) saturate(0.6)' }}
                        crossOrigin="anonymous"
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.1) 60%)' }} />
                    <div style={{ position: 'absolute', bottom: 40, left: 40 }}>
                        <div style={{ fontSize: 9, letterSpacing: 3, color: '#e74c3c', textTransform: 'uppercase', marginBottom: 8 }}>CRITICAL ZONE</div>
                        <div style={{ fontSize: 28, fontFamily: 'var(--font-display)', color: '#fff', fontWeight: 300, letterSpacing: 1 }}>36,000 TRACKED<br />OBJECTS</div>
                    </div>
                </div>
            </div>

            {/* CINEMATIC FULLWIDTH IMAGE — DEEP SPACE */}
            <div style={{ position: 'relative', width: '100%', height: 460, overflow: 'hidden' }}>
                <img
                    src="https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1800&q=90"
                    alt="Milky Way galaxy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', filter: 'brightness(0.6)' }}
                    crossOrigin="anonymous"
                />
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.7) 100%)' }} />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                    <div>
                        <div style={{ fontSize: 10, letterSpacing: 4, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', marginBottom: 16 }}>DEEP SPACE · MILKY WAY</div>
                        <div style={{ fontSize: 'clamp(22px, 4vw, 56px)', fontFamily: 'var(--font-display)', color: '#fff', fontWeight: 300, letterSpacing: 3, textTransform: 'uppercase', lineHeight: 1.1 }}>
                            THE UNIVERSE IS<br /><span style={{ color: 'var(--blue)' }}>WATCHING BACK</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* CINEMATIC 3-PANEL STRIP — MOON, EVA, NEBULA */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 1fr', height: 360 }}>
                {[
                    { url: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=600&q=90', tag: 'LUNAR', label: 'MOON SURFACE', color: 'rgba(255,255,255,0.5)' },
                    { url: 'https://images.unsplash.com/photo-1541185934-01b600ea069c?auto=format&fit=crop&w=800&q=90', tag: 'ZERO-G', label: 'SPACEWALK', color: 'var(--blue)' },
                    { url: 'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?auto=format&fit=crop&w=600&q=90', tag: 'STELLAR', label: 'NEBULA FIELD', color: '#c8a84b' },
                ].map((img) => (
                    <div key={img.label} style={{ position: 'relative', overflow: 'hidden' }}>
                        <img src={img.url} alt={img.label} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.5)' }} crossOrigin="anonymous" />
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 60%)' }} />
                        <div style={{ position: 'absolute', bottom: 28, left: 28 }}>
                            <div style={{ fontSize: 8, letterSpacing: 3, color: img.color, textTransform: 'uppercase', marginBottom: 6 }}>{img.tag}</div>
                            <div style={{ fontSize: 18, fontFamily: 'var(--font-display)', color: '#fff', fontWeight: 300, letterSpacing: 2 }}>{img.label}</div>
                        </div>
                    </div>
                ))}
            </div>


            <section className="section" id="capabilities" style={{ background: 'var(--bg-dark)' }}>

                <div style={{ textAlign: 'center' }}>
                    <div className="section-eyebrow" style={{ justifyContent: 'center' }}>SYSTEM CAPABILITIES</div>
                    <h2 className="section-title">What DebrisX Does</h2>
                </div>
                <div className="feature-grid">
                    {[
                        { num: '01', title: 'Collision Intelligence', desc: 'SGP4 orbital propagation over 24–48h horizons. AI-powered probability scoring using distance, velocity, and time-to-approach data.' },
                        { num: '02', title: 'Autonomous Maneuver AI', desc: 'Decision-agent computing optimal delta-v maneuvers balancing fuel cost, risk reduction, and downstream congestion impact.' },
                        { num: '03', title: 'Kessler Cascade Sim', desc: 'NASA fragmentation model simulates debris multiplication across 5 time stages — visualizing the chain-reaction risk in real time.' },
                        { num: '04', title: 'Congestion Heatmap', desc: 'Altitude-band density analysis from LEO to GEO, color-coded from safe to critical with policy-level recommendations.' },
                        { num: '05', title: 'Solar System Digital Twin', desc: 'Full 3D solar system visualization with real planet textures. Live orbital mechanics. Sun, 8 planets, debris fields.' },
                        { num: '06', title: 'Orbital Sustainability', desc: 'Governance score for operators and nations — factoring maneuver responsibility, congestion impact, and debris exposure history.' },
                    ].map(f => (
                        <div className="feature-card" key={f.num}>
                            <div className="feature-number">{f.num}</div>
                            <div className="feature-title">{f.title}</div>
                            <div className="feature-desc">{f.desc}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ═══════ GLOBAL ORBITAL LAUNCH TIMELINE ═══════ */}
            <section id="timeline" style={{
                background: 'var(--bg-deep)', padding: '90px 0 80px',
                borderTop: '1px solid var(--border-dim)', position: 'relative', overflow: 'hidden'
            }}>
                {/* subtle blue glow at top */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 300, background: 'radial-gradient(ellipse at 50% -50%, rgba(91,155,213,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

                <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 40px', position: 'relative' }}>
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: 64 }}>
                        <div style={{ fontSize: 10, letterSpacing: 3, color: 'var(--blue)', textTransform: 'uppercase', marginBottom: 12 }}>▷ GLOBAL SPACE HISTORY & FUTURE</div>
                        <h2 style={{ fontSize: 'clamp(28px,4vw,50px)', fontFamily: 'var(--font-display)', fontWeight: 300, color: '#fff', letterSpacing: 2, textTransform: 'uppercase', margin: '0 0 16px' }}>
                            THE ORBITAL <span style={{ color: 'var(--blue)' }}>LAUNCH TIMELINE</span>
                        </h2>
                        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, maxWidth: 560, margin: '0 auto 24px', lineHeight: 1.7 }}>
                            From Sputnik to the mega-constellation era. Every milestone that shaped the orbital environment we monitor today — plus what comes next.
                        </p>
                        {/* Legend */}
                        <div style={{ display: 'inline-flex', gap: 20, padding: '10px 24px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 4, fontSize: 11 }}>
                            {[['#5b9bd5','Historical'],['#22cc55','Operational'],['#f39c12','Upcoming'],['#c8a84b','Planned']].map(([c,l]) => (
                                <span key={l} style={{ color: c, display:'flex', alignItems:'center', gap:6 }}>
                                    <span style={{ width:8, height:8, borderRadius:'50%', background:c, display:'inline-block' }} />{l}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Timeline body */}
                    <div style={{ position: 'relative' }}>
                        {/* Vertical center spine */}
                        <div style={{
                            position: 'absolute', left: '50%', top: 0, bottom: 0,
                            width: 1,
                            background: 'linear-gradient(to bottom, transparent, rgba(91,155,213,0.3) 5%, rgba(91,155,213,0.3) 95%, transparent)',
                            transform: 'translateX(-50%)', zIndex: 0
                        }} />

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {TIMELINE_DATA.map((item, i) => {
                                const isLeft = i % 2 === 0;
                                return (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', position: 'relative', minHeight: 40 }}>
                                        {/* LEFT card or spacer */}
                                        {isLeft
                                            ? <TimelineCard item={item} isLeft={true} />
                                            : <div style={{ width: 'calc(50% - 32px)' }} />
                                        }

                                        {/* Center dot */}
                                        <div style={{
                                            width: 14, height: 14, borderRadius: '50%',
                                            background: item.color,
                                            border: '3px solid var(--bg-deep)',
                                            flexShrink: 0, zIndex: 2,
                                            margin: '0 25px',
                                            boxShadow: `0 0 10px ${item.color}88, 0 0 20px ${item.color}33`,
                                        }} />

                                        {/* RIGHT card or spacer */}
                                        {!isLeft
                                            ? <TimelineCard item={item} isLeft={false} />
                                            : <div style={{ width: 'calc(50% - 32px)' }} />
                                        }
                                    </div>
                                );
                            })}
                        </div>

                        {/* End tag */}
                        <div style={{ textAlign: 'center', marginTop: 40 }}>
                            <div style={{ display: 'inline-block', padding: '10px 24px', background: 'rgba(91,155,213,0.08)', border: '1px solid rgba(91,155,213,0.3)', borderRadius: 4 }}>
                                <span style={{ fontSize: 10, color: 'var(--blue)', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: 2 }}>
                                    ▲ Timeline Simulation Context — NASA · ESA · SpaceX · ISRO · IAU
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/*  CTA  */}
            <section className="cta-section" id="control">
                <div className="section-eyebrow" style={{ justifyContent: 'center', marginBottom: 20 }}>READY TO TAKE CONTROL</div>
                <h2 className="cta-title">ENTER ORBITAL CONTROL CENTER</h2>
                <p className="cta-sub">Access live telemetry, AI risk intelligence, cascade simulation, and maneuver planning.</p>
                <button className="btn-cta-main" onClick={onEnter}>LAUNCH DEBRISX SYSTEM</button>
            </section>

            {/*  FOOTER  */}
            <footer className="landing-footer">
                <img src="/logo.png" alt="DebrisX" className="footer-logo" />
                <div className="footer-text">© 2026 DebrisX · Autonomous Orbital Intelligence Infrastructure</div>
            </footer>
        </div>
    );
}
