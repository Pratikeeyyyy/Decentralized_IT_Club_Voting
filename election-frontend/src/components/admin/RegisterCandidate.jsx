import { useState } from "react";
import { uploadToIPFS } from "../../web3/ipfs";
import { getContract } from "../../contract";

export default function RegisterCandidate() {
  const [file, setFile] = useState(null);
  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [year, setYear] = useState(4);
  const [isFemale, setIsFemale] = useState(false);
  const [position, setPosition] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!file || !name || !studentId) return alert("Please fill all fields");
    
    setLoading(true);
    try {
      // 1. Upload image to IPFS
      const cid = await uploadToIPFS(file);

      // 2. Get Contract
      const contract = await getContract();

      // 3. Register candidate
      const tx = await contract.registerCandidate(
        name,
        studentId,
        year,
        isFemale,
        cid,
        position
      );

      await tx.wait();
      alert("Candidate Registered!");
    } catch (err) {
      console.error("Registration error:", err);
      alert(err.reason || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 bg-rose-500/20 dark:bg-rose-900/30 rounded-lg flex items-center justify-center">
          <span className="text-white">👤</span>
        </div>
        <h3 className="text-xl font-bold tracking-tight text-white">Register Candidate</h3>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-white/90 ml-1">Full Name</label>
          <input 
            className="w-full p-3 bg-white/10 dark:bg-slate-900/50 border border-white/20 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-rose-400/50 focus:border-rose-400 outline-none transition-all text-white placeholder-white/40"
            placeholder="e.g. Prajwal Giri" 
            onChange={(e) => setName(e.target.value)} 
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-white/90 ml-1">Student ID</label>
          <input 
            className="w-full p-3 bg-white/10 dark:bg-slate-900/50 border border-white/20 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-rose-400/50 focus:border-rose-400 outline-none transition-all text-white placeholder-white/40"
            placeholder="e.g. IT2024001" 
            onChange={(e) => setStudentId(e.target.value)} 
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-white/90 ml-1">Year</label>
            <select 
              className="w-full p-3 bg-white/10 dark:bg-slate-900/50 border border-white/20 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-rose-400/50 focus:border-rose-400 outline-none transition-all text-white [&>option]:text-slate-900"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              <option value={1}>Year 1</option>
              <option value={2}>Year 2</option>
              <option value={3}>Year 3</option>
              <option value={4}>Year 4</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-white/90 ml-1">Position</label>
            <select 
              className="w-full p-3 bg-white/10 dark:bg-slate-900/50 border border-white/20 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-rose-400/50 focus:border-rose-400 outline-none transition-all text-white [&>option]:text-slate-900"
              value={position}
              onChange={(e) => setPosition(Number(e.target.value))}
            >
              <option value={0}>President</option>
              <option value={1}>Secretary</option>
              <option value={2}>General Member</option>
            </select>
          </div>
        </div>
        
        <label className="flex items-center gap-3 p-3 bg-white/10 dark:bg-slate-900/50 rounded-xl border border-white/20 dark:border-slate-700 cursor-pointer hover:bg-white/20 transition-colors">
          <input 
            type="checkbox" 
            className="w-5 h-5 rounded-md border-white/30 text-rose-500 focus:ring-rose-400/50 bg-transparent"
            checked={isFemale}
            onChange={(e) => setIsFemale(e.target.checked)}
          />
          <span className="text-sm font-medium text-white">Female Candidate</span>
        </label>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-white/90 ml-1">Profile Picture</label>
          <input 
            type="file" 
            className="w-full p-2.5 text-sm text-white/70 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-white/20 file:text-white hover:file:bg-white/30 border border-dashed border-white/30 rounded-xl"
            onChange={(e) => setFile(e.target.files[0])} 
          />
        </div>

        <button 
          onClick={handleRegister}
          disabled={loading}
          className="w-full mt-4 bg-white text-sky-700 dark:bg-rose-600 dark:text-white py-4 rounded-xl font-black transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:opacity-50"
        >
          {loading ? "Processing..." : "Register Candidate"}
        </button>
      </div>
    </div>
  );
}