import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function WalletButton() {
  const { wallet, connectWallet, loading } = useContext(AuthContext);

  return (
    <button 
      onClick={connectWallet}
      className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all duration-300 active:scale-95 shadow-lg group ${
        wallet 
          ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700" 
          : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-blue-500/25"
      }`}
      disabled={loading}
    >
      {!wallet && (
        <span className="text-lg group-hover:rotate-12 transition-transform">🦊</span>
      )}
      <span className="text-sm tracking-tight">
        {loading 
          ? "Connecting..." 
          : wallet 
            ? `${wallet.slice(0, 6)}...${wallet.slice(-4)}` 
            : "Connect Wallet"
        }
      </span>
      {wallet && (
        <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
      )}
    </button>
  );
}

export default WalletButton;