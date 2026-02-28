import { useRef, useEffect, useState } from 'react';

/**
 * CascadeSimulator — visualizes a Kessler cascade event
 * as an animated expanding debris field using Canvas 2D.
 */
export default function CascadeSimulator({ data }) {
    const canvasRef = useRef(null);
    const [animStep, setAnimStep] = useState(0);
    const [playing, setPlaying] = useState(false);

    const stages = data?.stages || [];
    const currentStage = stages[animStep] || null;

    // Auto-advance if playing
    useEffect(() => {
        if (!playing) return;
        if (animStep >= stages.length - 1) { setPlaying(false); return; }
        const t = setTimeout(() => setAnimStep(s => s + 1), 1200);
        return () => clearTimeout(t);
    }, [playing, animStep, stages.length]);

    // Draw the debris expansion on canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !currentStage) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;
        const cx = W / 2, cy = H / 2;

        ctx.clearRect(0, 0, W, H);

        // Draw Earth
        const earthR = 40;
        const grad = ctx.createRadialGradient(cx - 8, cy - 8, 5, cx, cy, earthR);
        grad.addColorStop(0, '#1a3a5c');
        grad.addColorStop(1, '#0b1e36');
        ctx.beginPath(); ctx.arc(cx, cy, earthR, 0, Math.PI * 2);
        ctx.fillStyle = grad; ctx.fill();
        ctx.strokeStyle = 'rgba(0,243,255,0.3)'; ctx.lineWidth = 1; ctx.stroke();

        // Draw past stages (faded)
        stages.slice(0, animStep + 1).forEach((stage, idx) => {
            const alpha = idx === animStep ? 0.75 : 0.15 + idx * 0.06;
            const ringR = earthR + 20 + stage.altitude_km / 20;
            const bandW = stage.affected_band_km / 20;

            // Colored debris ring
            ctx.beginPath();
            ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
            ctx.strokeStyle = idx === animStep ? '#ff2a2a' : `rgba(255,42,42,${alpha})`;
            ctx.lineWidth = Math.max(2, bandW * alpha);
            ctx.stroke();

            // Label
            if (idx === animStep) {
                ctx.fillStyle = '#ff2a2a';
                ctx.font = '9px Orbitron, monospace';
                ctx.fillText(stage.label, cx + ringR * 0.7, cy - ringR * 0.7);
            }

            // Scatter dots around the ring
            const count = Math.min(40, Math.floor(stage.fragments_added / 30));
            for (let i = 0; i < count; i++) {
                const angle = (i / count) * Math.PI * 2;
                const jitter = (Math.random() - 0.5) * bandW * 2;
                const r = ringR + jitter;
                ctx.beginPath();
                ctx.arc(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r, 1.2, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255,${100 - idx * 20},${50 - idx * 10},${alpha})`;
                ctx.fill();
            }
        });

    }, [animStep, stages]);

    const risk = currentStage ? (currentStage.risk_score * 100).toFixed(1) : 0;
    const fragments = currentStage ? currentStage.total_fragments_cumulative.toLocaleString() : 0;
    const access = currentStage ? (currentStage.orbital_accessibility * 100).toFixed(1) : 100;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Warning header */}
            {data?.kessler_threshold_crossed && (
                <div style={{
                    padding: '10px 14px',
                    background: 'rgba(255,42,42,0.1)',
                    border: '1px solid rgba(255,42,42,0.4)',
                    borderRadius: 8,
                    fontSize: 11,
                    color: '#ff2a2a',
                    letterSpacing: '0.5px',
                    lineHeight: 1.5,
                }}>
                    {data.warning}
                </div>
            )}

            {/* Stage info */}
            {currentStage && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {[
                        { label: 'Stage', val: `${animStep + 1} / ${stages.length}` },
                        { label: 'Fragments', val: fragments, danger: true },
                        { label: 'Zone Risk', val: `${risk}%`, danger: true },
                        { label: 'Orbital Access', val: `${access}%`, good: +access > 50 },
                    ].map(m => (
                        <div key={m.label} style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 6, padding: '8px 10px' }}>
                            <div style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 4 }}>{m.label}</div>
                            <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 13, fontWeight: 700, color: m.danger ? '#ff2a2a' : m.good ? '#22dd66' : '#00f3ff' }}>{m.val}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Canvas */}
            <canvas
                ref={canvasRef}
                width={280}
                height={200}
                style={{ width: '100%', borderRadius: 8, background: '#000', display: 'block' }}
            />

            {/* Controls */}
            <div style={{ display: 'flex', gap: 8 }}>
                <button
                    onClick={() => { setAnimStep(0); setPlaying(true); }}
                    style={{
                        flex: 1, padding: '10px', fontFamily: "'Orbitron', monospace",
                        fontSize: 10, letterSpacing: 2, textTransform: 'uppercase',
                        background: 'rgba(255,42,42,0.15)', color: '#ff2a2a',
                        border: '1px solid rgba(255,42,42,0.4)', borderRadius: 6, cursor: 'pointer',
                    }}
                >
                    {playing ? ' Simulating...' : ' Run Cascade'}
                </button>
                <button
                    onClick={() => setAnimStep(s => Math.max(0, s - 1))}
                    style={{
                        padding: '10px 14px', fontFamily: "'Orbitron', monospace", fontSize: 12,
                        background: 'rgba(0,0,0,0.3)', color: 'rgba(255,255,255,0.4)',
                        border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, cursor: 'pointer',
                    }}
                >‹</button>
                <button
                    onClick={() => setAnimStep(s => Math.min(stages.length - 1, s + 1))}
                    style={{
                        padding: '10px 14px', fontFamily: "'Orbitron', monospace", fontSize: 12,
                        background: 'rgba(0,0,0,0.3)', color: 'rgba(255,255,255,0.4)',
                        border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, cursor: 'pointer',
                    }}
                >›</button>
            </div>

            {/* Timeline strip */}
            <div style={{ display: 'flex', gap: 4 }}>
                {stages.map((s, i) => (
                    <div
                        key={i}
                        onClick={() => setAnimStep(i)}
                        style={{
                            flex: 1, height: 4, borderRadius: 10, cursor: 'pointer',
                            background: i <= animStep ? '#ff2a2a' : 'rgba(255,255,255,0.08)',
                            boxShadow: i === animStep ? '0 0 6px #ff2a2a' : 'none',
                            transition: 'all 0.3s',
                        }}
                    />
                ))}
            </div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', textAlign: 'center', letterSpacing: 1 }}>
                {currentStage ? `T + ${currentStage.years_forward} months · ${currentStage.label}` : ''}
            </div>
        </div>
    );
}
