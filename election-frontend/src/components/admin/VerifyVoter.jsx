import { useState } from "react";
import { getContract } from "../../contract";

export default function VerifyVoter() {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  async function verify() {
    if (!address) return alert("Please enter a wallet address");
    
    setLoading(true);
    try {
      const contract = await getContract();
      const tx = await contract.verifyVoter(address);
      await tx.wait();
      alert("Student verified");
    } catch (err) {
      console.error(err);
      alert("Verification failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 bg-purple-500/20 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
          <span className="text-white">🛡️</span>
        </div>
        <h3 className="text-xl font-bold tracking-tight text-white">Verify Student Wallet</h3>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-white/90 ml-1">Wallet Address</label>
          <input
            className="w-full p-3 bg-white/10 dark:bg-slate-900/50 border border-white/20 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400 outline-none transition-all text-white placeholder-white/40"
            placeholder="0x..."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        <button 
          onClick={verify}
          disabled={loading}
          className="w-full bg-white text-sky-700 dark:bg-purple-600 dark:text-white py-3.5 rounded-xl font-black transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:opacity-50"
        >
          {loading ? "Verifying..." : "Verify Student"}
        </button>
      </div>
    </div>
  );
}
