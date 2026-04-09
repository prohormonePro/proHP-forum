import { Link, useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { Home, FlaskConical, Shield, User } from 'lucide-react';
import useAuthStore from '../../stores/auth';

export default function MobileNav() {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);

  // Chrome mobile URL bar fix: force dock to visual viewport bottom
  const dockRef = useRef(null);
  useEffect(() => {
    const isChrome = /Chrome/.test(navigator.userAgent) && !/Edg/.test(navigator.userAgent);
    if (!isChrome || !window.visualViewport || !dockRef.current) return;
    const handler = () => {
      if (dockRef.current) {
        const vv = window.visualViewport;
        dockRef.current.style.bottom = (window.innerHeight - vv.height - vv.offsetTop) + 'px';
      }
    };
    window.visualViewport.addEventListener('resize', handler);
    window.visualViewport.addEventListener('scroll', handler);
    return () => {
      window.visualViewport.removeEventListener('resize', handler);
      window.visualViewport.removeEventListener('scroll', handler);
    };
  }, []);

  const tabs = [
    { path: '/', icon: Home, label: 'Home', exact: true },
    { path: '/compounds', icon: FlaskConical, label: 'Encyclopedia', exact: false },
    { path: '/pct', icon: Shield, label: 'PCT', exact: true },
    { path: user ? '/u/' + user.username : '/login', icon: User, label: user ? 'Profile' : 'Log In', exact: false },
  ];

  const isActive = (tab) => tab.exact ? location.pathname === tab.path : location.pathname.startsWith(tab.path);

  return (
    <div ref={dockRef} className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      <nav className="bg-slate-950 mx-3 mb-2 rounded-2xl rounded-2xl border border-white/[0.12] shadow-[0_-4px_30px_rgba(0,0,0,0.5),0_8px_40px_rgba(0,0,0,0.7),0_0_1px_rgba(255,255,255,0.08)]">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
          {tabs.map((tab) => {
            const active = isActive(tab);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.label}
                to={tab.path}
                className="relative flex flex-col items-center justify-center flex-1 h-full group"
              >
                <div className={`flex flex-col items-center justify-center gap-0.5 px-4 py-2 rounded-xl transition-all duration-200 ${active ? 'bg-[#229DD8]/25' : 'group-active:bg-white/5'}`}>
                  <Icon
                    className={`w-[22px] h-[22px] transition-all duration-200 ${active ? 'text-[#229DD8] drop-shadow-[0_0_12px_rgba(34,157,216,0.7)]' : 'text-slate-300 group-hover:text-slate-100'}`}
                    strokeWidth={active ? 2.5 : 2}
                    fill={active ? 'currentColor' : 'none'}
                  />
                  <span className={`text-[11px] tracking-wide transition-all duration-200 ${active ? 'text-[#229DD8] font-bold drop-shadow-[0_0_10px_rgba(34,157,216,0.6)]' : 'text-slate-300 font-medium group-hover:text-slate-100'}`}>
                    {tab.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
