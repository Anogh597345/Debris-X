import { useEffect, useState } from 'react';

const messages = [
    "Initializing Orbital Intelligence...",
    "Syncing Satellite Telemetry...",
    "Calibrating Risk Models...",
    "Building Orbital Digital Twin...",
    "Engaging Autonomous Copilot...",
];

export default function LoadingScreen({ onComplete }) {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const iv = setInterval(() => {
            setProgress(prev => {
                const next = prev + 1.6;
                if (next >= 100) {
                    clearInterval(iv);
                    setTimeout(onComplete, 500);
                    return 100;
                }
                return next;
            });
        }, 55);
        return () => clearInterval(iv);
    }, []);

    const msgIdx = Math.min(Math.floor((progress / 100) * messages.length), messages.length - 1);

    return (
        <div style={{
            position: 'fixed', inset: 0,
            background: '#000',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: 36, zIndex: 9999,
        }}>
            {/* Logo — transparent PNG blends into black */}
            <img
                src="/logo.png"
                alt="DebrisX"
                style={{
                    width: 'clamp(260px, 36vw, 480px)',
                    height: 'auto',
                    filter: 'drop-shadow(0 0 32px rgba(198,32,10,0.45))',
                    animation: 'pulse-subtle 2.5s ease-in-out infinite',
                }}
            />

            {/* Progress bar */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, width: 'clamp(260px,30vw,400px)' }}>
                <div style={{ width: '100%', height: 2, background: 'rgba(255,255,255,0.07)', borderRadius: 1, overflow: 'hidden' }}>
                    <div style={{
                        height: '100%',
                        width: `${progress}%`,
                        background: '#c6200a',
                        boxShadow: '0 0 10px #c6200a',
                        borderRadius: 1,
                        transition: 'width 0.06s linear',
                    }} />
                </div>
                <p style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: 10, letterSpacing: 4, textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.3)', margin: 0,
                }}>
                    {messages[msgIdx]}
                </p>
            </div>

            <p style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 11, letterSpacing: 4, textTransform: 'uppercase',
                color: 'rgba(198,32,10,0.6)', margin: 0,
            }}>
                {Math.floor(progress)}%
            </p>
        </div>
    );
}
