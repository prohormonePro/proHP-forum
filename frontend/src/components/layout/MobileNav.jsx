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
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden safe-area-pb">
      <div className="bg-slate-950/98 backdrop-blur-2xl border-t border-[#229DD8]/8">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
          {tabs.map((tab) => {
            const active = isActive(tab);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.label}
                to={tab.path}
                className="relative flex flex-col items-center justify-center w-full h-full group"
              >
                {active && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-[#229DD8] shadow-[0_0_8px_rgba(34,157,216,0.6)]" />
                )}
                <div className={`relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 ${active ? 'bg-[#229DD8]/10' : 'group-active:bg-white/5'}`}>
                  <Icon
                    className={`w-5 h-5 transition-all duration-200 ${active ? 'text-[#229DD8]' : 'text-slate-500 group-hover:text-slate-300'}`}
                    strokeWidth={active ? 2.5 : 1.5}
                  />
                  {active && (
                    <div className="absolute inset-0 rounded-xl bg-[#229DD8]/5 shadow-[0_0_12px_rgba(34,157,216,0.15)]" />
                  )}
                </div>
                <span className={`text-[10px] font-medium mt-0.5 transition-colors duration-200 ${active ? 'text-[#229DD8]' : 'text-slate-600 group-hover:text-slate-400'}`}>
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
