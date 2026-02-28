import React from 'react';

export const CopilotPanel = ({ onSimulate }) => {
    return (
        <div className="absolute top-4 right-4 w-96 glass-panel p-4 z-10 text-white flex flex-col gap-4">
            <h2 className="text-xl font-bold text-glow-blue uppercase tracking-wide">DebrisX Copilot</h2>

            <div className="bg-black/50 border border-[#00f3ff]/30 p-3 rounded-lg text-sm text-gray-200">
                <p className="font-mono text-xs text-[#00f3ff] mb-2">&gt; SYSTEM RECOMMENDATION</p>
                <p>
                    A 7.2% collision probability is predicted in the next 18 hours due to an approach event between ISS and DEMO DEBRIS 1.
                </p>
                <div className="mt-3 p-2 bg-[#00f3ff]/10 rounded border border-[#00f3ff]/20">
                    <span className="block text-[#00f3ff] text-xs font-bold mb-1">SUGGESTED ACTION</span>
                    <p className="text-xs">A minor 0.8 m/s delta-v maneuver at T+14h reduces risk to &lt;0.1%.</p>
                </div>
            </div>

            <button
                onClick={onSimulate}
                className="w-full py-3 mt-2 bg-[#00f3ff]/20 hover:bg-[#00f3ff]/40 border border-[#00f3ff] rounded font-bold text-[#00f3ff] tracking-wide transition-all shadow-[0_0_15px_rgba(0,243,255,0.3)]">
                SIMULATE AVOIDANCE MANEUVER
            </button>
        </div>
    );
};
