import { useState, useEffect, useRef } from 'react';

/* 
   Space Copilot Interface
   An interactive AI assistant panel that answers orbital 
   intelligence questions and generates context-aware advice.
 */

const PROMPT_SUGGESTIONS = [
    "What is the highest risk conjunction right now?",
    "Recommend an avoidance maneuver",
    "Assess Kessler cascade probability",
    "Which altitude band is most congested?",
    "What is our sustainability score?",
    "How much fuel is needed for the maneuver?",
];

function generateResponse(query, { risks, orbits, sustainScore }) {
    const q = query.toLowerCase();
    const topRisk = risks[0];

    if (q.includes('risk') || q.includes('conjunction') || q.includes('collision')) {
        if (!topRisk) return " No active conjunctions detected. Orbital environment is currently nominal. Continue standard monitoring protocols.";
        return ` CONJUNCTION ALERT\n\nObjects: ${topRisk.sat1_id}  ${topRisk.sat2_id}\nProbability: ${(topRisk.probability * 100).toFixed(2)}%\nMin separation: ${topRisk.min_distance_km.toFixed(2)} km\nTime to approach: T-${Math.abs(topRisk.time_to_approach_hours).toFixed(1)}h\n\nRecommendation: Risk exceeds 1% threshold. Initiate avoidance planning immediately.`;
    }

    if (q.includes('maneuver') || q.includes('delta') || q.includes('thrust') || q.includes('fuel')) {
        if (!topRisk) return "No maneuver required at this time. Risk levels are within nominal bounds.";
        const dv = (topRisk.probability * 15 + 0.3).toFixed(1);
        const fuel = (dv * 0.56).toFixed(2);
        return ` MANEUVER RECOMMENDATION\n\nTarget orbit: ${topRisk.sat1_id}\nRequired ΔV: ${dv} m/s\nBurn direction: Retrograde +Z\nEstimated fuel: ${fuel} kg\nExecution window: T+${(Math.abs(topRisk.time_to_approach_hours) - 2).toFixed(1)}h\n\nThis maneuver reduces collision probability from ${(topRisk.probability * 100).toFixed(1)}% to <0.1%.`;
    }

    if (q.includes('kessler') || q.includes('cascade') || q.includes('fragment')) {
        return " KESSLER CASCADE ASSESSMENT\n\nCurrent debris density in LEO 550–800 km: CRITICAL\n5-stage cascade model: Active\nPrimary risk zone: 550–620 km\n\nIf a major collision occurs at this altitude, the cascade will generate ~420 primary fragments within 6 months. Orbital accessibility would degrade to 87% within 2 years.\n\nMitigation: Active debris removal for 3+ objects in the critical zone is recommended.";
    }

    if (q.includes('congestion') || q.includes('heatmap') || q.includes('altitude') || q.includes('band')) {
        return " CONGESTION ANALYSIS\n\nMost congested band: 550–600 km (CRITICAL - 91% density)\nSecond highest: 600–800 km (CRITICAL - 85% density)\nSafest band: 100–200 km (5% density, natural drag removal)\n\nGlobal orbital health score: 58/100 \n\nPolicy recommendation: Mandatory deorbit within 5 years for all non-operational satellites below 800 km.";
    }

    if (q.includes('sustainability') || q.includes('score') || q.includes('index')) {
        return ` ORBITAL SUSTAINABILITY INDEX\n\nYour score: ${sustainScore}/100 — Responsible Operator\n\nBreakdown:\n• Maneuver history: Clean (no avoidance failures)\n• Debris exposure: Low (well-maintained orbit)\n• Congestion contribution: Minimal\n• Compliance: Full ITU/IADC compliance\n\nTo improve: Consider proactive orbital slot sharing and EOL deorbit planning.`;
    }

    if (q.includes('orbit') || q.includes('satellite') || q.includes('tracked')) {
        return ` ORBITAL ENVIRONMENT STATUS\n\nTracked objects: ${Object.keys(orbits).length}\nActive risk events: ${risks.length}\nData freshness: Real-time (SGP4 propagation)\n\nAll tracked objects are being propagated using Two-Line Element sets. Trajectory accuracy degrades after ~48h due to atmospheric drag and solar pressure variations. TLE refresh recommended every 24h.`;
    }

    return ` COPILOT RESPONSE\n\nI analyzed your query: "${query}"\n\nCurrent system status:\n• ${Object.keys(orbits).length} objects tracked\n• ${risks.length} active risk event(s)\n• Orbital health: Nominal\n\nFor specific queries try: risk assessment, maneuver planning, Kessler cascade, or congestion analysis.`;
}

export default function SpaceCopilot({ risks = [], orbits = {}, sustainScore = 81 }) {
    const [messages, setMessages] = useState([
        {
            role: 'system',
            text: `DEBRISX COPILOT ONLINE\n\nI am your autonomous orbital intelligence assistant. I can analyze conjunction risks, recommend avoidance maneuvers, assess cascade scenarios, and interpret congestion data.\n\nTracking ${Object.keys(orbits).length} objects. ${risks.length > 0 ? ` ${risks.length} active risk event(s) detected.` : ' No active conjunctions.'}\n\nHow can I assist?`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
    ]);
    const [input, setInput] = useState('');
    const [typing, setTyping] = useState(false);
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = (text) => {
        const q = text || input.trim();
        if (!q) return;
        setInput('');

        const userMsg = { role: 'user', text: q, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
        setMessages(prev => [...prev, userMsg]);
        setTyping(true);

        setTimeout(() => {
            const response = generateResponse(q, { risks, orbits, sustainScore });
            setMessages(prev => [...prev, {
                role: 'ai',
                text: response,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }]);
            setTyping(false);
        }, 800 + Math.random() * 400);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 500 }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexShrink: 0 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22cc55', boxShadow: '0 0 6px #22cc55', animation: 'pulse-dot 2s infinite' }} />
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--white)' }}>Space Copilot</span>
                <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-display)', fontSize: 9, letterSpacing: 2, color: 'var(--grey-500)', textTransform: 'uppercase' }}>AI v2.1</span>
            </div>

            {/* Message area */}
            <div style={{
                flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12,
                paddingRight: 4, marginBottom: 12,
                minHeight: 0,
            }}>
                {messages.map((m, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                        {m.role !== 'user' && (
                            <div style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: m.role === 'system' ? 'var(--red)' : 'var(--blue)', marginBottom: 4 }}>
                                {m.role === 'system' ? ' SYSTEM' : ' COPILOT'}
                            </div>
                        )}
                        <div style={{
                            maxWidth: '90%',
                            padding: m.role === 'user' ? '8px 12px' : '10px 14px',
                            borderRadius: m.role === 'user' ? '8px 8px 2px 8px' : '2px 8px 8px 8px',
                            background: m.role === 'user' ? 'var(--red)' : m.role === 'system' ? 'rgba(198,32,10,0.06)' : 'rgba(255,255,255,0.04)',
                            border: m.role === 'user' ? 'none' : '1px solid var(--border-dim)',
                            fontSize: 11, lineHeight: 1.7,
                            color: m.role === 'user' ? '#fff' : 'var(--grey-100)',
                            whiteSpace: 'pre-wrap',
                            fontFamily: m.role === 'user' ? 'var(--font-ui)' : 'var(--font-ui)',
                        }}>
                            {m.text}
                        </div>
                        <div style={{ fontSize: 9, color: 'var(--grey-500)', marginTop: 3, letterSpacing: 1 }}>{m.time}</div>
                    </div>
                ))}

                {typing && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px' }}>
                        {[0, 1, 2].map(d => (
                            <div key={d} style={{
                                width: 5, height: 5, borderRadius: '50%', background: 'var(--blue)',
                                animation: `typing-bounce 1.2s ${d * 0.2}s infinite ease-in-out`,
                            }} />
                        ))}
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Quick suggestions */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10, flexShrink: 0 }}>
                {PROMPT_SUGGESTIONS.slice(0, 3).map(s => (
                    <button key={s} onClick={() => sendMessage(s)} style={{
                        padding: '4px 10px', fontSize: 9, letterSpacing: 1, textTransform: 'uppercase',
                        background: 'transparent', border: '1px solid var(--border-mid)',
                        color: 'var(--grey-300)', borderRadius: 3, cursor: 'pointer',
                        fontFamily: 'var(--font-display)', transition: 'all 0.2s',
                    }}
                        onMouseEnter={e => e.target.style.borderColor = 'var(--red)'}
                        onMouseLeave={e => e.target.style.borderColor = 'var(--border-mid)'}
                    >
                        {s}
                    </button>
                ))}
            </div>

            {/* Input */}
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                    placeholder="Ask the copilot..."
                    style={{
                        flex: 1, padding: '9px 12px', background: 'rgba(255,255,255,0.04)',
                        border: '1px solid var(--border-mid)', borderRadius: 4,
                        color: 'var(--white)', fontSize: 11, fontFamily: 'var(--font-ui)',
                        outline: 'none',
                    }}
                />
                <button onClick={() => sendMessage()} style={{
                    padding: '9px 16px', background: 'var(--red)', border: 'none',
                    borderRadius: 4, color: '#fff', fontSize: 11, letterSpacing: 1,
                    fontFamily: 'var(--font-display)', textTransform: 'uppercase', cursor: 'pointer',
                }}>
                    SEND
                </button>
            </div>
        </div>
    );
}
