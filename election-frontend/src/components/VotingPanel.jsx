import { useEffect, useState, useContext } from "react";
import { ethers } from "ethers";
import { AuthContext } from "../context/AuthContext";
import electionABI from "../abi/Election.json";
import { CONTRACT_ADDRESS } from "../config";

const getImageUrl = (imageCID) => {
  if (!imageCID) return "";
  if (imageCID.startsWith("http://") || imageCID.startsWith("https://")) return imageCID;
  return `https://ipfs.io/ipfs/${imageCID}`;
};

const getPositionLabel = (position) => {
  if (position === 0) return "President";
  if (position === 1) return "Secretary";
  return "General Member";
};

function CandidateOption({ candidate, selected, onSelect }) {
  const [imageError, setImageError] = useState(false);
  const imageUrl = getImageUrl(candidate.imageCID);
  const initials = candidate.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group relative w-full overflow-hidden rounded-[2.5rem] border-2 transition-all duration-500 ${
        selected 
          ? "border-blue-500 bg-blue-500/10 shadow-2xl shadow-blue-500/20 ring-4 ring-blue-500/10 scale-[1.02]" 
          : "border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/50 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-xl hover:-translate-y-1"
      }`}
    >
      {selected && (
        <div className="absolute top-0 right-0 p-4 z-20">
          <div className="bg-blue-600 text-white p-2 rounded-full shadow-lg animate-bounce">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      )}

      <div className="p-2">
        <div className="relative h-56 md:h-64 overflow-hidden rounded-[2rem] bg-slate-100 dark:bg-slate-800">
          {imageUrl && !imageError ? (
            <img
              src={imageUrl}
              alt={`${candidate.name} profile`}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 text-4xl font-black text-slate-400 dark:text-slate-600">
              {initials || "?"}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
          
          <div className="absolute bottom-0 left-0 p-6 w-full text-left">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 mb-1">
              {getPositionLabel(candidate.position)}
            </p>
            <h4 className="text-xl font-black text-white leading-tight truncate">
              {candidate.name}
            </h4>
          </div>
        </div>

        <div className="p-6 pt-4 grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Student ID</span>
            <p className="text-sm font-bold truncate text-slate-700 dark:text-slate-300">
              {candidate.studentId || "N/A"}
            </p>
          </div>
          <div className="space-y-1 text-right">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Year</span>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Batch {candidate.year || "N/A"}
            </p>
          </div>
        </div>
      </div>
    </button>
  );
}

export default function VotingPanel() {
  const { wallet } = useContext(AuthContext);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selection, setSelection] = useState({
    president: null,
    secretary: null,
    members: []
  });

  const loadCandidates = async () => {
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
          studentId: c.studentId,
          year: Number(c.year),
          isFemale: Boolean(c.isFemale),
          imageCID: c.imageCID,
          position: Number(c.position), // 0: President, 1: Secretary, 2: Member
          voteCount: Number(c.voteCount)
        });
      }
      setCandidates(temp);
    } catch (err) {
      console.error("Load candidates error:", err);
    }
  };

  const castVote = async () => {
    if (!wallet) return alert("Please connect wallet");
    if (!selection.president || !selection.secretary || selection.members.length !== 7) {
      return alert("Please select 1 President, 1 Secretary, and 7 Members");
    }

    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, electionABI.abi, signer);

      const tx = await contract.vote(
        selection.president,
        selection.secretary,
        selection.members
      );
      await tx.wait();
      alert("Vote cast successfully!");
      loadCandidates();
    } catch (err) {
      console.error("Voting error:", err);
      alert(err.reason || "Transaction failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch candidate data whenever the connected wallet changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadCandidates();
  }, [wallet]);

  const toggleMember = (id) => {
    setSelection(prev => {
      const members = prev.members.includes(id) 
        ? prev.members.filter(m => m !== id)
        : prev.members.length < 7 ? [...prev.members, id] : prev.members;
      return { ...prev, members };
    });
  };

  return (
    <div className="space-y-16 p-2 md:p-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 dark:border-slate-800 pb-10">
        <div className="space-y-2">
          <h2 className="text-5xl font-black tracking-tighter italic">
            Cast Your Ballot
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">
            Choose the leaders who will shape the future of our IT Club.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-blue-500/10 px-6 py-3 rounded-[2rem] border border-blue-500/20">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(59,130,246,0.8)]"></div>
          <span className="text-sm font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">Live Polling</span>
        </div>
      </div>

      <div className="space-y-24">
        {/* Presidents */}
        <section className="space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-[1.2rem] flex items-center justify-center text-2xl shadow-lg shadow-blue-500/20">👑</div>
            <div>
              <h3 className="text-2xl font-black tracking-tight">Presidential Candidates</h3>
              <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Mandatory • Select Exactly 1</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {candidates.filter(c => c.position === 0).map(c => (
              <CandidateOption
                key={c.id}
                candidate={c}
                selected={selection.president === c.id}
                onSelect={() => setSelection({ ...selection, president: c.id })}
              />
            ))}
          </div>
        </section>

        {/* Secretary */}
        <section className="space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-[1.2rem] flex items-center justify-center text-2xl shadow-lg shadow-indigo-500/20">🖋️</div>
            <div>
              <h3 className="text-2xl font-black tracking-tight">Secretary Nominees</h3>
              <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Mandatory • Select Exactly 1</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {candidates.filter(c => c.position === 1).map(c => (
              <CandidateOption
                key={c.id}
                candidate={c}
                selected={selection.secretary === c.id}
                onSelect={() => setSelection({ ...selection, secretary: c.id })}
              />
            ))}
          </div>
        </section>

        {/* General Members */}
        <section className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-600 rounded-[1.2rem] flex items-center justify-center text-2xl shadow-lg shadow-emerald-500/20">🤝</div>
              <div>
                <h3 className="text-2xl font-black tracking-tight">General Committee Members</h3>
                <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Mandatory • Select Exactly 7</p>
              </div>
            </div>
            <div className={`text-sm font-black uppercase tracking-[0.2em] px-8 py-3 rounded-full shadow-lg transition-all duration-500 ${
              selection.members.length === 7 
                ? "bg-emerald-500 text-white shadow-emerald-500/20" 
                : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
            }`}>
              {selection.members.length} / 7 Selected
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {candidates.filter(c => c.position === 2).map(c => (
              <CandidateOption
                key={c.id}
                candidate={c}
                selected={selection.members.includes(c.id)}
                onSelect={() => toggleMember(c.id)}
              />
            ))}
          </div>
        </section>

        <div className="pt-12">
          <button 
            onClick={castVote}
            disabled={loading || !wallet}
            className="group relative w-full overflow-hidden rounded-[2.5rem] bg-[#020617] dark:bg-white text-white dark:text-[#020617] py-8 font-black text-2xl tracking-tighter italic transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 shadow-2xl shadow-blue-500/20"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-mesh"></div>
            <span className="relative z-10 flex items-center justify-center gap-4 group-hover:text-white transition-colors duration-500">
              {loading ? (
                <>
                  <svg className="animate-spin h-8 w-8 text-current" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing Vote...
                </>
              ) : (
                <>🚀 Submit Secure Ballot</>
              )}
            </span>
          </button>
          <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-6 font-bold uppercase tracking-[0.5em] opacity-60">
            Immutable Blockchain Transaction • 256-bit Encryption
          </p>
        </div>
      </div>
    </div>
  );
}