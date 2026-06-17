import ElectionControl from "./ElectionControl";
import RegisterCandidate from "./RegisterCandidate";
import VerifyVoter from "./VerifyVoter";

export default function AdminDashboard() {
  return (
    <div className="space-y-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-white/10 pb-10">
        <div className="flex items-center gap-6">
          <div className="relative group">
            <div className="absolute -inset-2 bg-gradient-to-r from-rose-500 to-orange-500 rounded-2xl blur opacity-40 group-hover:opacity-60 transition duration-500"></div>
            <div className="relative w-16 h-16 bg-[#020617] rounded-2xl flex items-center justify-center border border-white/10 shadow-2xl">
              <span className="text-3xl animate-pulse">🔐</span>
            </div>
          </div>
          <div>
            <h2 className="text-5xl font-black tracking-tighter italic text-white">Central Command</h2>
            <p className="text-sm font-black text-rose-500 uppercase tracking-[0.4em] mt-1">Restricted Access • Level 5</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
        <div className="xl:col-span-4 space-y-12">
          <section className="group relative bg-[#020617]/40 p-8 rounded-[3rem] border border-white/10 shadow-2xl transition-all duration-500 hover:border-blue-500/30 overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="text-6xl font-black">01</span>
            </div>
            <div className="relative z-10">
              <ElectionControl />
            </div>
          </section>
          
          <section className="group relative bg-[#020617]/40 p-8 rounded-[3rem] border border-white/10 shadow-2xl transition-all duration-500 hover:border-purple-500/30 overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="text-6xl font-black">02</span>
            </div>
            <div className="relative z-10">
              <VerifyVoter />
            </div>
          </section>
        </div>

        <section className="xl:col-span-8 group relative bg-[#020617]/40 p-8 md:p-12 rounded-[3.5rem] border border-white/10 shadow-2xl transition-all duration-500 hover:border-rose-500/30 overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="text-8xl font-black">03</span>
          </div>
          <div className="relative z-10">
            <RegisterCandidate />
          </div>
        </section>
      </div>

      <div className="pt-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
          <span className="text-[10px] font-black text-white/40 uppercase tracking-widest text-white">System Integrity: Nominal</span>
        </div>
      </div>
    </div>
  );
}
