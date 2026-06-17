import { useContext, useState } from "react";
import { AuthContext } from "./context/AuthContext";
import AdminDashboard from "./components/admin/AdminDashboard";
import VotingPanel from "./components/VotingPanel";
import Results from "./components/Results";
import WalletButton from "./components/WalletButton";

function App() {
  const { wallet, isAdmin, voterStatus, registerAsVoter, loading } =
    useContext(AuthContext);

  const [darkMode, setDarkMode] = useState(false);

  return (
    <div
      className={`min-h-screen transition-colors duration-700 font-sans ${
        darkMode ? "dark bg-[#020617] text-slate-100" : "bg-[#f8fafc] text-slate-900"
      }`}
    >
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-20 animate-mesh bg-gradient-to-br from-blue-600 to-indigo-600 ${darkMode ? "mix-blend-lighten" : "mix-blend-multiply"}`}></div>
        <div className={`absolute top-[40%] -right-[10%] w-[50%] h-[50%] rounded-full blur-[140px] opacity-20 animate-mesh bg-gradient-to-br from-rose-600 to-orange-600 ${darkMode ? "mix-blend-lighten" : "mix-blend-multiply"}`} style={{ animationDelay: '-5s' }}></div>
        <div className={`absolute -bottom-[10%] left-[20%] w-[30%] h-[30%] rounded-full blur-[100px] opacity-20 animate-mesh bg-gradient-to-br from-emerald-600 to-teal-600 ${darkMode ? "mix-blend-lighten" : "mix-blend-multiply"}`} style={{ animationDelay: '-10s' }}></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto p-4 md:p-10">
        {/* HEADER */}
        <header className="sticky top-6 z-50 flex justify-between items-center p-4 md:p-6 glass rounded-[2.5rem] shadow-2xl shadow-blue-500/10 mb-16 border border-white/40 dark:border-slate-800/60">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/40 rotate-3 hover:rotate-0 transition-transform duration-300">
              <span className="text-white font-black text-2xl tracking-tighter">IT</span>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-blue-600 to-slate-900 dark:from-white dark:via-blue-400 dark:to-white">
                Election System
              </h1>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 dark:text-blue-400 opacity-80">Blockchain Secured</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-3 rounded-2xl bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 transition-all border border-slate-200 dark:border-slate-700 shadow-sm group active:scale-90"
            >
              {darkMode ? (
                <span className="text-yellow-400 text-xl block group-hover:rotate-45 transition-transform">☀</span>
              ) : (
                <span className="text-slate-600 text-xl block group-hover:-rotate-12 transition-transform">🌙</span>
              )}
            </button>

            <div className="hidden md:block">
              <WalletButton />
            </div>
          </div>
        </header>

        <div className="md:hidden mb-8 flex justify-center">
          <WalletButton />
        </div>

        {/* MAIN */}
        <main className="space-y-12">
          {!wallet ? (
            <div className="glass p-16 rounded-[3rem] shadow-3xl text-center space-y-6 border border-white/50 dark:border-slate-800/50">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                <div className="absolute inset-0 rounded-full animate-ping bg-blue-500/20"></div>
                <span className="text-5xl">🦊</span>
              </div>
              <h2 className="text-4xl font-black tracking-tighter italic">
                Ready to Vote?
              </h2>
              <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto text-lg leading-relaxed">
                Connect your digital wallet to access the decentralized voting portal and make your voice heard.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-12">
              {/* REGISTER */}
              {!isAdmin && !voterStatus.registered && (
                <div className="relative group overflow-hidden rounded-[2.5rem]">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 animate-mesh"></div>
                  <div className="relative m-[2px] bg-white dark:bg-[#020617] p-8 md:p-10 rounded-[2.4rem] flex flex-col md:flex-row items-center justify-between gap-8 transition-colors">
                    <div className="space-y-2 text-center md:text-left">
                      <h2 className="text-3xl font-black tracking-tight">Become a Verified Voter</h2>
                      <p className="text-slate-500 dark:text-slate-400 text-lg">
                        Complete your one-time registration to participate in all club elections.
                      </p>
                    </div>
                    <button
                      onClick={registerAsVoter}
                      disabled={loading}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-10 py-4 rounded-2xl font-black text-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50 shadow-[0_10px_30px_rgba(37,99,235,0.4)]"
                    >
                      {loading ? "Registering..." : "Verify Identity"}
                    </button>
                  </div>
                </div>
              )}

              {/* PENDING / SUCCESS ALERTS */}
              {!isAdmin && voterStatus.registered && !voterStatus.verified && (
                <div className="glass bg-amber-50/50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-900/30 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-6 shadow-xl">
                  <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/40 rounded-2xl flex items-center justify-center text-3xl">⏳</div>
                  <div className="text-center md:text-left">
                    <h2 className="text-2xl font-black text-amber-900 dark:text-amber-400 tracking-tight">Under Review</h2>
                    <p className="text-amber-800/70 dark:text-amber-300/60 font-medium">We're verifying your student status. This usually takes a few minutes.</p>
                  </div>
                </div>
              )}

              {voterStatus.hasVoted && (
                <div className="glass bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-900/30 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-6 shadow-xl">
                  <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/40 rounded-2xl flex items-center justify-center text-3xl">✅</div>
                  <div className="text-center md:text-left">
                    <h2 className="text-2xl font-black text-emerald-900 dark:text-emerald-400 tracking-tight">Voice Recorded</h2>
                    <p className="text-emerald-800/70 dark:text-emerald-300/60 font-medium">Your vote has been cryptographically secured on the blockchain.</p>
                  </div>
                </div>
              )}

              {/* VOTING PANEL */}
              {voterStatus.verified && !voterStatus.hasVoted && (
                <div className="glass p-1 md:p-10 rounded-[3.5rem] shadow-4xl">
                  <VotingPanel />
                </div>
              )}

              {/* RESULTS */}
              <div className="glass p-1 md:p-12 rounded-[3.5rem] shadow-4xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] rounded-full -mr-32 -mt-32"></div>
                <div className="relative z-10">
                  <Results />
                </div>
              </div>

              {/* ADMIN PANEL */}
              {isAdmin && (
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-rose-600 via-purple-600 to-blue-600 rounded-[3.5rem] blur-xl opacity-20 group-hover:opacity-40 transition duration-1000 animate-mesh"></div>
                  <div className="relative glass p-1 md:p-12 rounded-[3.5rem] shadow-4xl">
                    <AdminDashboard />
                  </div>
                </div>
              )}
            </div>
          )}
        </main>

        <footer className="mt-24 pb-12 text-center space-y-4">
          <div className="flex justify-center gap-6 text-2xl opacity-40 hover:opacity-100 transition-opacity">
            <span>🔗</span><span>🛡️</span><span>⚡</span>
          </div>
          <p className="text-slate-400 dark:text-slate-600 text-sm font-black uppercase tracking-[0.4em]">
            Decentralized Election Protocol v2.0
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;