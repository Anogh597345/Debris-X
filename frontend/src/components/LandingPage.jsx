import { useRef, useEffect, Suspense } from 'react';
import HeroEarth from './HeroEarth';

/* High-quality space images — Unsplash CDN (browser-accessible, no CORS) */
const ORBIT_IMG = 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=900&q=85';
const GALLERY_1 = 'https://images.unsplash.com/photo-1541185934-01b600ea069c?auto=format&fit=crop&w=900&q=85';
const GALLERY_2 = 'https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&w=900&q=85';
const GALLERY_3 = 'https://images.unsplash.com/photo-1614642264762-d0a3b8bf3700?auto=format&fit=crop&w=900&q=85';

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
                    <li><a href="#" onClick={e => { e.preventDefault(); onEnter(); }}>Control Center</a></li>
                </ul>
                <button className="nav-cta" onClick={onEnter}>Launch System</button>
            </nav>

            {/*  HERO  */}
            <section className="hero" style={{ marginTop: 64, background: '#000' }}>
                {/* Rotating 3D Earth as background */}
                <Suspense fallback={null}>
                    <HeroEarth />
                </Suspense>
                {/* Dark overlay so text stays readable */}
                <div style={{
                    position: 'absolute', inset: 0, zIndex: 1,
                    background: 'linear-gradient(to right, rgba(0,0,0,0.85) 50%, rgba(0,0,0,0.2) 100%)',
                }} />
                <div className="hero-content" style={{ position: 'relative', zIndex: 2 }}>
                    <div className="hero-eyebrow">Autonomous Orbital Intelligence</div>
                    <img src="/logo.png" alt="DebrisX" className="hero-logo-img" />
                    <h1 className="hero-title">
                        THE <span className="hero-title-accent">AI BRAIN</span><br />FOR EARTH'S ORBIT
                    </h1>
                    <p className="hero-sub" style={{ fontSize: '18px', maxWidth: '600px', lineHeight: 1.5, color: 'var(--white)' }}>
                        An AI-powered digital twin that predicts and protects orbital stability.
                    </p>
                    <div className="hero-actions">
                        <button className="btn-hero-primary" onClick={() => onEnter('guardian')}>ADOPT A SATELLITE</button>
                        <button className="btn-hero-ghost" onClick={() => onEnter('heatmap')}>EXPLORE THE FUTURE OF ORBIT</button>
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
                            Over 36,000 tracked objects circle Earth at 28,000 km/h. Even a 1 cm fragment
                            carries the kinetic energy of a hand grenade. A single collision can trigger a
                            <strong style={{ color: 'var(--white)' }}> Kessler cascade</strong> — making entire
                            orbital bands unusable for generations.
                        </p>
                        <p className="section-body" style={{ marginTop: 16 }}>
                            DebrisX uses AI-driven orbital simulation to predict, assess, and avert these
                            events before they happen — autonomously.
                        </p>
                    </div>
                    <div style={{ position: 'relative' }}>
                        <img src={ORBIT_IMG} alt="Orbital debris field simulation" style={{
                            width: '100%', borderRadius: 4, display: 'block',
                            filter: 'brightness(0.8) saturate(0.7)',
                            border: '1px solid var(--border-dim)',
                        }} />
                        <div style={{
                            position: 'absolute', bottom: 10, left: 10,
                            fontSize: 9, letterSpacing: 2, textTransform: 'uppercase',
                            color: 'rgba(255,255,255,0.4)', background: 'rgba(0,0,0,0.5)',
                            padding: '3px 8px', borderRadius: 2,
                        }}>Simulated GEO Debris Field · ESA/NASA</div>
                    </div>
                </div>
            </section>

            {/*  GALLERY  */}
            <div className="gallery-grid">
                <img src={GALLERY_1} alt="EVA astronaut" className="gallery-img" crossOrigin="anonymous" />
                <img src={GALLERY_2} alt="Falcon 9 launch" className="gallery-img" crossOrigin="anonymous" />
                <img src={GALLERY_3} alt="ISS spacewalk" className="gallery-img" crossOrigin="anonymous" />
            </div>

            {/*  CAPABILITIES  */}
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
                        { num: '05', title: 'Solar System Digital Twin', desc: 'Full 3D solar system visualization with real planet textures (NASA, Solar System Scope). Live orbital mechanics. Sun, 8 planets, debris fields.' },
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
