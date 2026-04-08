import { Link, useLocation } from 'react-router-dom';
import { Home, FlaskConical, Shield, User } from 'lucide-react';
import useAuthStore from '../../stores/auth';

export default function MobileNav() {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);

  const tabs = [
    { path: '/', icon: Home, label: 'Home', exact: true },
    { path: '/compounds', icon: FlaskConical, label: 'Encyclopedia', exact: false },
    { path: '/pct', icon: Shield, label: 'PCT', exact: true },
    { path: user ? '/u/' + user.username : '/login', icon: User, label: user ? 'Profile' : 'Log In', exact: false },
  ];

  const isActive = (tab) => tab.exact ? location.pathname === tab.path : location.pathname.startsWith(tab.path);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden safe-area-pb px-3 pb-3">
      <nav className="bg-slate-950/80 backdrop-blur-2xl rounded-2xl border border-white/[0.06] shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
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
                <div className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 ${active ? 'bg-[#229DD8]/10' : 'group-active:bg-white/5'}`}>
                  <Icon
                    className={`w-5 h-5 transition-all duration-200 ${active ? 'text-[#229DD8] drop-shadow-[0_0_6px_rgba(34,157,216,0.4)]' : 'text-slate-500 group-hover:text-slate-300'}`}
                    strokeWidth={2}
                    fill={active ? 'rgba(34,157,216,0.15)' : 'none'}
                  />
                  <span className={`text-[10px] tracking-wide transition-all duration-200 ${active ? 'text-[#229DD8] font-semibold drop-shadow-[0_0_8px_rgba(34,157,216,0.3)]' : 'text-slate-600 font-medium group-hover:text-slate-400'}`}>
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
