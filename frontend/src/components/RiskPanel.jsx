import React from 'react';

export const RiskPanel = ({ risks }) => {
    return (
        <div className="absolute top-4 left-4 w-80 max-h-[80vh] overflow-y-auto glass-panel p-4 z-10 text-white">
            <h2 className="text-xl font-bold mb-4 text-glow-red uppercase tracking-wide">Collision Intelligence</h2>

            {risks.length === 0 ? (
                <div className="text-sm text-gray-400">Scanning Orbital Data... No immediate risks detected.</div>
            ) : null}

            <div className="flex flex-col gap-4">
                {risks.map((risk, idx) => (
                    <div key={idx} className="bg-black/40 border border-[#ff2a2a]/30 rounded p-3 hover:border-[#ff2a2a] transition-all duration-300">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-mono text-sm text-[#ff2a2a]">Object: {risk.sat1_id}  {risk.sat2_id}</span>
                            <span className="font-bold text-[#ff2a2a]">{(risk.probability * 100).toFixed(1)}%</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
                            <div>
                                <span className="block text-gray-500 uppercase text-[10px]">Min Distance</span>
                                <span>{risk.min_distance_km.toFixed(2)} km</span>
                            </div>
                            <div>
                                <span className="block text-gray-500 uppercase text-[10px]">Time to Event</span>
                                <span>{risk.time_to_approach_hours.toFixed(1)} hrs</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
};
