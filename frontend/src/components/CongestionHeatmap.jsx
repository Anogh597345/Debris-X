/**
 * CongestionHeatmap — horizontal bar chart of orbital altitude bands
 * color-coded by debris density.
 */
export default function CongestionHeatmap({ data }) {
    const bands = data?.bands || [];
    const summary = data?.summary || {};

    if (!bands.length) return (
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '12px 0' }}>
            Loading heatmap data...
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Summary stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 4 }}>
                {[
                    { label: 'Critical Zones', val: summary.critical_bands, color: '#ff2a2a' },
                    { label: 'Dense Zones', val: summary.dense_bands, color: '#ffd700' },
                    { label: 'Safe Zones', val: summary.safe_bands, color: '#22dd66' },
                ].map(m => (
                    <div key={m.label} style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 6, padding: '6px 8px', textAlign: 'center' }}>
                        <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 16, fontWeight: 700, color: m.color }}>{m.val}</div>
                        <div style={{ fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{m.label}</div>
                    </div>
                ))}
            </div>

            {/* Bands */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {bands.map((band, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {/* Altitude label */}
                        <div style={{ width: 130, fontSize: 9, color: 'rgba(255,255,255,0.45)', letterSpacing: 0.5, flexShrink: 0, textAlign: 'right' }}>
                            {band.band}
                        </div>
                        {/* Bar */}
                        <div style={{ flex: 1, height: 14, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden' }}>
                            <div style={{
                                height: '100%',
                                width: `${band.object_density * 100}%`,
                                background: band.color,
                                boxShadow: `0 0 8px ${band.color}80`,
                                borderRadius: 4,
                                transition: 'width 1s ease',
                            }} />
                        </div>
                        {/* Pct + status badge */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, width: 80, flexShrink: 0 }}>
                            <span style={{ fontFamily: 'Orbitron, monospace', fontSize: 10, color: band.color }}>
                                {(band.object_density * 100).toFixed(0)}%
                            </span>
                            <span style={{
                                fontSize: 8, letterSpacing: 1, padding: '1px 5px', borderRadius: 3,
                                background: `${band.color}22`, border: `1px solid ${band.color}55`,
                                color: band.color, textTransform: 'uppercase',
                            }}>
                                {band.status}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', paddingTop: 4, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                {[['#22dd66', 'Safe'], ['#ffd700', 'Dense'], ['#ff7700', 'High'], ['#ff2a2a', 'Critical']].map(([c, l]) => (
                    <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, textTransform: 'uppercase' }}>
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: c }} />
                        {l}
                    </div>
                ))}
            </div>

            {/* Recommendation */}
            {data?.recommendation && (
                <div style={{
                    fontSize: 10, color: 'rgba(255,200,50,0.75)', lineHeight: 1.6,
                    background: 'rgba(255,200,50,0.04)', border: '1px solid rgba(255,200,50,0.15)',
                    borderRadius: 6, padding: '8px 10px',
                }}>
                     {data.recommendation}
                </div>
            )}
        </div>
    );
}
