import { getContract } from "../../contract";
import { useState } from "react";

export default function ElectionControl() {
  const [loading, setLoading] = useState(false);

  async function startRegistration() {
    setLoading(true);
    try {
      const contract = await getContract();
      const tx = await contract.startRegistration();
      await tx.wait();
      alert("Registration started");
    } catch (err) {
      console.error(err);
      alert("Error starting registration");
    } finally {
      setLoading(false);
    }
  }

  async function startElection() {
    setLoading(true);
    try {
      const contract = await getContract();
      const tx = await contract.startElection(60); // Default 60 minutes
      await tx.wait();
      alert("Voting started for 60 minutes");
    } catch (err) {
      console.error(err);
      alert("Error starting election");
    } finally {
      setLoading(false);
    }
  }

  async function endElection() {
    setLoading(true);
    try {
      const contract = await getContract();
      const tx = await contract.endElection();
      await tx.wait();
      alert("Election ended");
    } catch (err) {
      console.error(err);
      alert("Error ending election");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 bg-blue-500/20 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
          <span className="text-white">⚙️</span>
        </div>
        <h3 className="text-xl font-bold tracking-tight text-white">Election Control</h3>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <button 
          onClick={startRegistration} 
          disabled={loading}
          className="flex items-center justify-center gap-2 bg-white text-blue-700 dark:bg-blue-500 dark:text-white py-3 rounded-xl font-black transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:opacity-50"
        >
          <span>📝</span> Start Registration
        </button>

        <button 
          onClick={startElection} 
          disabled={loading}
          className="flex items-center justify-center gap-2 bg-white text-emerald-700 dark:bg-emerald-500 dark:text-white py-3 rounded-xl font-black transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:opacity-50"
        >
          <span>🗳️</span> Start Voting (60m)
        </button>

        <button 
          onClick={endElection} 
          disabled={loading}
          className="flex items-center justify-center gap-2 bg-white text-rose-700 dark:bg-rose-500 dark:text-white py-3 rounded-xl font-black transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:opacity-50"
        >
          <span>🛑</span> End Election
        </button>
      </div>
    </div>
  );
}
