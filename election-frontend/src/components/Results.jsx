import { useState, useEffect } from "react";
import { ethers } from "ethers";
import electionABI from "../abi/Election.json";
import { CONTRACT_ADDRESS } from "../config";

const getPositionLabel = (position) => {
  if (position === 0) return "President";
  if (position === 1) return "Secretary";
  return "General Member";
};

export default function Results() {
  const [candidates, setCandidates] = useState([]);

  const fetchResults = async () => {
    try {
      if (!window.ethereum) return;
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, electionABI.abi, provider);
      
      const count = await contract.candidateCount();
      const temp = [];
      for (let i = 1; i <= Number(count); i++) {
        const c = await contract.getCandidate(i);
        temp.push({
          id: Number(c.id),
          name: c.name,
          position: getPositionLabel(Number(c.position)),
          voteCount: Number(c.voteCount)
        });
      }
      setCandidates(temp.sort((a, b) => b.voteCount - a.voteCount));
    } catch (err) {
      console.error("Failed to fetch results from blockchain", err);
    }
  };

  useEffect(() => {
    fetchResults();
    const interval = setInterval(fetchResults, 10000); // Poll blockchain every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const totalVotes = candidates.reduce((acc, c) => acc + Number(c.voteCount), 0);

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/20 rotate-6 group-hover:rotate-0 transition-transform">
            <span className="text-3xl">📈</span>
          </div>
          <div>
            <h2 className="text-4xl font-black tracking-tighter italic text-white">Live Insights</h2>
            <p className="text-sm font-bold text-white/50 uppercase tracking-[0.2em]">Real-time Blockchain Feed</p>
          </div>
        </div>
        
        <div className="flex flex-col items-end">
          <div className="text-4xl font-black text-white tracking-tighter animate-pulse">
            {totalVotes}
          </div>
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Total Network Votes</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {candidates.length > 0 ? candidates.map((c) => {
          const voteCount = Number(c.voteCount);
          const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
          
          return (
            <div key={c.id} className="group relative space-y-4 p-6 bg-white/5 rounded-[2.5rem] border border-white/10 hover:border-white/30 transition-all duration-500 hover:-translate-y-1 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-[40px] rounded-full -mr-16 -mt-16 group-hover:bg-white/10 transition-colors"></div>
              
              <div className="relative z-10 flex justify-between items-end">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-black text-white group-hover:text-indigo-300 transition-colors">{c.name}</span>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 bg-white/10 text-white/80 rounded-full border border-white/10">
                      {c.position}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-none">Candidate ID #{c.id}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-baseline gap-1 justify-end">
                    <span className="text-3xl font-black text-white tracking-tighter">{voteCount}</span>
                    <span className="text-xs font-black text-white/30 uppercase tracking-widest">Votes</span>
                  </div>
                  <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                    {percentage.toFixed(1)}% Share
                  </div>
                </div>
              </div>

              <div className="relative h-3 w-full bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-white dark:bg-gradient-to-r dark:from-indigo-500 dark:to-blue-500 transition-all duration-1000 ease-out rounded-full shadow-[0_0_15px_rgba(255,255,255,0.6)]"
                  style={{ width: `${Math.max(percentage, 2)}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between text-[9px] font-black uppercase tracking-[0.3em] text-white/30">
                <span>Voter Trust Score</span>
                <span className="group-hover:text-white transition-colors">Optimal</span>
              </div>
            </div>
          );
        }) : (
          <div className="py-20 text-center glass rounded-[3rem] border-dashed border-2 border-white/10">
            <div className="text-6xl mb-6 animate-bounce">⏱️</div>
            <p className="text-2xl font-black text-white tracking-tighter">Waiting for Data...</p>
            <p className="text-sm text-white/40 font-bold uppercase tracking-[0.3em] mt-2">Blockchain sync in progress</p>
          </div>
        )}
      </div>
    </div>
  );
}
