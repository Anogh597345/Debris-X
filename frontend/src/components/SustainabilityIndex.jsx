import { useEffect, useRef } from 'react';

/* 
   Global Orbital Sustainability Index
   Animated SVG score ring with category breakdown
 */

const CATEGORIES = [
    { label: 'Maneuver Compliance', score: 92, color: '#22cc55' },
    { label: 'Debris Exposure Risk', score: 78, color: '#5b9bd5' },
    { label: 'Congestion Impact', score: 85, color: '#c8a84b' },
    { label: 'EOL Deorbit Planning', score: 70, color: '#ff7700' },
    { label: 'ITU Compliance', score: 88, color: '#e040fb' },
];

const OVERALL = Math.round(CATEGORIES.reduce((a, c) => a + c.score, 0) / CATEGORIES.length);

function ScoreArc({ score, size = 120, strokeWidth = 8, color = '#c6200a' }) {
    const r = (size - strokeWidth) / 2;
    const circum = 2 * Math.PI * r;
    const dash = (score / 100) * circum;
    const cx = size / 2, cy = size / 2;

    return (
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
            <circle
                cx={cx} cy={cy} r={r} fill="none"
                stroke={color} strokeWidth={strokeWidth}
                strokeDasharray={`${dash} ${circum}`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.4,0,0.2,1)' }}
            />
        </svg>
    );
}

function MiniBar({ score, color }) {
    return (
        <div style={{ height: 3, background: 'rgba(255,255,255,0.07)', borderRadius: 2, overflow: 'hidden', marginTop: 4 }}>
            <div style={{
                height: '100%', width: `${score}%`, background: color, borderRadius: 2,
                transition: 'width 1s ease', boxShadow: `0 0 4px ${color}`,
            }} />
        </div>
    );
}

export default function SustainabilityIndex() {
    const ratingLabel =
        OVERALL >= 90 ? 'Exemplary Operator' :
            OVERALL >= 75 ? 'Responsible Operator' :
                OVERALL >= 60 ? 'Compliant Operator' :
                    OVERALL >= 40 ? 'At-Risk Operator' : 'Non-Compliant';

    const ratingColor =
        OVERALL >= 90 ? '#22cc55' :
            OVERALL >= 75 ? '#5b9bd5' :
                OVERALL >= 60 ? '#c8a84b' : '#c6200a';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Main score ring */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                    <ScoreArc score={OVERALL} size={110} strokeWidth={9} color={ratingColor} />
                    <div style={{
                        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center',
                        transform: 'none',
                    }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: ratingColor, lineHeight: 1 }}>{OVERALL}</div>
                        <div style={{ fontSize: 8, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--grey-500)', marginTop: 2 }}>/ 100</div>
                    </div>
                </div>

                <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', color: ratingColor, marginBottom: 4 }}>
                        {ratingLabel}
                    </div>
                    <p style={{ fontSize: 10, color: 'var(--grey-300)', lineHeight: 1.7, margin: 0 }}>
                        Your operator profile has maintained a clean maneuver history and minimal congestion impact, earning recognition under IADC responsible space operations guidelines.
                    </p>
                </div>
            </div>

            {/* Category breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--grey-500)', marginBottom: 2 }}>Category Breakdown</div>
                {CATEGORIES.map(c => (
                    <div key={c.label}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 11, color: 'var(--grey-300)' }}>{c.label}</span>
                            <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: c.color }}>{c.score}</span>
                        </div>
                        <MiniBar score={c.score} color={c.color} />
                    </div>
                ))}
            </div>

            {/* IADC badge */}
            <div style={{
                border: '1px solid rgba(91,155,213,0.25)',
                borderRadius: 4, padding: '10px 14px',
                background: 'rgba(91,155,213,0.04)',
                display: 'flex', alignItems: 'center', gap: 10,
            }}>
                <div style={{ fontSize: 18 }}></div>
                <div>
                    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--blue)' }}>IADC Compliant</div>
                    <div style={{ fontSize: 10, color: 'var(--grey-500)', marginTop: 1 }}>Inter-Agency Space Debris Coordination Committee</div>
                </div>
            </div>

            {/* Trend note */}
            <div style={{
                fontSize: 10, color: 'var(--grey-500)', padding: '8px 12px',
                borderLeft: '2px solid var(--red)', background: 'rgba(198,32,10,0.04)',
                lineHeight: 1.7,
            }}>
                 EOL deorbit planning score is below target (70 vs 80 benchmark). Consider registering active deorbit timeline with ITU to improve rating.
            </div>
        </div>
    );
}
