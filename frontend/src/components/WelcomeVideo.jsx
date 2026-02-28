import { useState } from 'react';

export default function WelcomeVideo() {
  const [videoOk, setVideoOk] = useState(true);
  if (!videoOk) return null;
  return (
    <div className="w-full mb-6 animate-fade-in">
      <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.5)] group">
        <video
          controls
          playsInline
          preload="metadata"
          className="w-full h-full object-cover"
          onError={() => setVideoOk(false)}
        >
          <source src="/videos/welcome_placeholder.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg pointer-events-none group-hover:opacity-0 transition-opacity duration-300">
          <span className="text-[10px] font-bold text-white tracking-widest uppercase">Start Here</span>
        </div>
      </div>
    </div>
  );
}
