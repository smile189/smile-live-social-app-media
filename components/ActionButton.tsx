import { useState } from "react";
import {
  Heart,
  MessageSquare,
  Bookmark,
  Share2,
  MoreHorizontal,
  ShieldAlert,
  FileText,
  Ban,
  Flag,
  X,
  Send,
  CheckCircle2,
  ChevronRight,
  AlertTriangle,
  Ghost,
  Frown,
  Skull,
  ShieldOff,
  Zap
} from "lucide-react";

export default function SidebarActions() {
  const [showMenu, setShowMenu] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showReportSheet, setShowReportSheet] = useState(false);
  const [likes, setLikes] = useState<{ id: number; left: number; delay: number }[]>([]);

  const triggerLike = () => {
    const id = Date.now();
    const randomLeft = Math.floor(Math.random() * 100) - 50;
    const randomDelay = Math.random() * 0.5;
    setLikes((prev) => [...prev, { id, left: randomLeft, delay: randomDelay }]);
    setTimeout(() => {
      setLikes((prev) => prev.filter((like) => like.id !== id));
    }, 3000);
  };

  const reportReasons = [
    { label: "Dangerous Organizations", icon: ShieldOff },
    { label: "Hate Speech & Harassment", icon: Frown },
    { label: "Violence & Graphic Content", icon: Skull },
    { label: "Spam & False Information", icon: Zap },
    { label: "Bullying or Cyberstalking", icon: Ghost },
    { label: "Illegal Goods & Activities", icon: AlertTriangle },
    { label: "Intellectual Property Theft", icon: FileText },
  ];

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: "SmileLive", url: window.location.href }); } catch {}
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const mainActions = [
    { icon: Heart, count: "1.2M", active: "group-hover:text-red-500", onClick: triggerLike },
    { icon: MessageSquare, count: "45K", active: "group-hover:text-blue-400", onClick: () => setShowComments(true) },
    { icon: Bookmark, count: "89K", active: "group-hover:text-yellow-400", onClick: () => {} },
    { icon: Share2, count: "Share", active: "group-hover:text-green-400", onClick: handleShare },
  ];

  return (
    <>
      {/* --- SIDEBAR DREAPTA (RESPONSIVE & COMPACT) --- */}
      <div className="absolute right-2 sm:right-4 bottom-[15vh] flex flex-col items-center gap-4 sm:gap-6 z-40">
        {likes.map((like) => (
          <div key={like.id} className="absolute bottom-10 pointer-events-none animate-heart-slow" style={{ left: `${like.left}px`, animationDelay: `${like.delay}s` }}>
            <Heart size={42} fill="url(#heart-gradient)" className="drop-shadow-[0_0_20px_rgba(255,50,50,0.6)]" />
            <svg width="0" height="0"><linearGradient id="heart-gradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#ff4d4d" /><stop offset="100%" stopColor="#ff0000" /></linearGradient></svg>
          </div>
        ))}

        {/* PROFILE */}
        <div className="relative mb-3 sm:mb-4 group cursor-pointer">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-white/30 p-0.5 overflow-hidden backdrop-blur-xl bg-white/10">
            <div className="w-full h-full rounded-full bg-linear-to-tr from-zinc-900 to-zinc-700 flex items-center justify-center font-black text-white/50 text-[9px] sm:text-[10px]">USER</div>
          </div>
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full flex items-center justify-center text-black text-[12px] sm:text-[14px] font-black shadow-xl">+</div>
        </div>

        {/* ACTIONS */}
        {mainActions.map((item, idx) => (
          <button key={idx} onClick={item.onClick} className="group flex flex-col items-center gap-1 transition-all active:scale-75">
            <div className="relative p-2.5 sm:p-3 rounded-full group-hover:bg-white/10 transition-colors backdrop-blur-md border border-white/5">
              <item.icon
                strokeWidth={1.8}
                className={`text-white transition-all duration-300 drop-shadow-2xl ${item.active}`}
                size={28}
              />
            </div>
            <span className="text-[9px] sm:text-[10px] font-black text-white tracking-widest uppercase drop-shadow-md">
              {item.count}
            </span>
          </button>
        ))}

        {/* MORE */}
        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)} className={`mt-1 sm:mt-2 p-2.5 sm:p-3 rounded-full transition-all ${showMenu ? "bg-white text-black" : "bg-white/10 text-white backdrop-blur-md"}`}>
            {showMenu ? <X size={22} /> : <MoreHorizontal size={24} />}
          </button>

          {showMenu && (
            <div className="absolute bottom-0 right-14 sm:right-16 w-56 sm:w-60 bg-zinc-900/95 backdrop-blur-3xl border border-white/10 rounded-[28px] sm:rounded-[32px] p-3 sm:p-4 shadow-2xl animate-in fade-in slide-in-from-right-8 duration-300">
              <div className="flex flex-col gap-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-white/60">
                <a href="#" className="flex items-center gap-4 p-2.5 sm:p-3 hover:bg-white/10 hover:text-white rounded-2xl transition-all"><FileText size={18} /> Terms</a>
                <a href="#" className="flex items-center gap-4 p-2.5 sm:p-3 hover:bg-white/10 hover:text-white rounded-2xl transition-all"><ShieldAlert size={18} /> Privacy</a>
                <div className="h-[1px] bg-white/10 my-2" />
                <button className="flex items-center gap-4 p-2.5 sm:p-3 hover:text-orange-400 rounded-2xl transition-all"><Ban size={18} /> Not Interested</button>
                <button onClick={() => { setShowReportSheet(true); setShowMenu(false); }} className="flex items-center gap-4 p-2.5 sm:p-3 hover:text-red-500 rounded-2xl text-red-500/80 transition-all"><Flag size={18} /> Report</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* REPORT OVERLAY */}
      {showReportSheet && <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 animate-in fade-in" onClick={() => setShowReportSheet(false)} />}

      {/* REPORT SHEET */}
      <div className={`fixed bottom-[10vh] left-4 right-4 sm:left-auto sm:right-4 z-50 bg-white/95 backdrop-blur-3xl rounded-[40px] shadow-[0_25px_80px_rgba(0,0,0,0.3)] transform transition-all duration-500 ease-out sm:max-w-md ${showReportSheet ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0 pointer-events-none"}`}>
        <div className="p-7 font-sans">
          <div className="w-12 h-1 bg-zinc-200 rounded-full mx-auto mb-6" />

          <div className="flex items-center justify-between mb-8 px-1">
            <div className="flex flex-col">
              <h3 className="text-xl font-black text-zinc-950 uppercase tracking-tighter">Report Content</h3>
              <span className="text-[10px] text-zinc-400 font-bold tracking-widest uppercase">Safe Community Policy</span>
            </div>
            <button onClick={() => setShowReportSheet(false)} className="bg-zinc-100 p-2.5 rounded-full text-zinc-400 hover:text-black transition-all">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-2 max-h-[50vh] overflow-y-auto no-scrollbar">
            {reportReasons.map((reason, i) => (
              <button key={i} className="w-full flex items-center justify-between p-4 bg-zinc-50/50 hover:bg-zinc-100/80 rounded-[28px] transition-all group border border-zinc-100/20">
                <div className="flex items-center gap-4">
                  <div className="bg-white p-2 rounded-xl shadow-sm text-zinc-400 group-hover:text-red-500 transition-colors">
                    <reason.icon size={18} />
                  </div>
                  <span className="text-[14px] font-bold text-zinc-700">{reason.label}</span>
                </div>
                <ChevronRight size={18} className="text-zinc-300 group-hover:text-zinc-950 transition-all" />
              </button>
            ))}
          </div>

          <p className="text-[9px] text-center text-zinc-400 mt-6 font-bold uppercase tracking-widest">
            Pressing submit will notify our moderators
          </p>
        </div>
      </div>

      {/* COMMENTS */}
      <div className={`fixed bottom-[11vh] right-4 left-4 sm:left-auto sm:w-[440px] h-[60vh] z-50 transform transition-all duration-700 cubic-bezier(0.16, 1, 0.3, 1) ${showComments ? "translate-y-0 opacity-100" : "translate-y-[120%] opacity-0 pointer-events-none"}`}>
        <div className="flex flex-col h-full bg-white/90 backdrop-blur-[40px] rounded-[40px] border border-white shadow-2xl overflow-hidden">
          <div className="px-8 pt-8 pb-4 flex items-center justify-between font-black uppercase">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-zinc-900 rounded-2xl shadow-lg"><MessageSquare size={18} className="text-white" /></div>
              <h3 className="text-zinc-900 text-xl tracking-tighter">Comments</h3>
            </div>
            <button onClick={() => setShowComments(false)} className="bg-zinc-100 p-3 rounded-2xl text-zinc-400"><X size={20} /></button>
          </div>

          <div className="flex-1 overflow-y-auto px-8 py-4 space-y-6 no-scrollbar bg-zinc-50/30">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-zinc-100 border border-white shrink-0 shadow-sm" />
                <div className="flex flex-col gap-1.5 flex-1">
                  <span className="text-[11px] font-black text-zinc-900 flex items-center gap-1 uppercase tracking-tighter">
                    User_{i} <CheckCircle2 size={12} className="text-blue-500" />
                  </span>
                  <p className="text-[14px] text-zinc-600 font-medium leading-relaxed bg-white p-4 rounded-3xl rounded-tl-none border border-white shadow-sm">
                    Satin glass interface.
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 bg-white/50 border-t border-zinc-100">
            <div className="relative flex items-center bg-white border border-zinc-200 shadow-sm rounded-3xl p-2">
              <input type="text" placeholder="Post a comment..." className="flex-1 px-4 text-sm text-zinc-900 outline-none font-medium" />
              <button className="bg-zinc-950 text-white px-6 py-3 rounded-2xl font-bold uppercase text-[10px] tracking-widest active:scale-95 transition-all">
                Send
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes heart-slow {
          0% { transform: translateY(0) scale(0.5) rotate(0deg); opacity: 0; }
          15% { opacity: 1; transform: translateY(-50px) scale(1.2) rotate(-10deg); }
          50% { transform: translateY(-250px) scale(1.4) rotate(15deg); }
          100% { transform: translateY(-800px) scale(2.2) rotate(20deg); opacity: 0; }
        }
        .animate-heart-slow { animation: heart-slow 3s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </>
  );
}
