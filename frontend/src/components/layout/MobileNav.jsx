import { Link, useLocation } from 'react-router-dom';
import { Home, FlaskConical, BarChart3, User, Shield } from 'lucide-react';
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

  const active = (tab) => tab.exact ? location.pathname === tab.path : location.pathname.startsWith(tab.path);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-slate-950/95 backdrop-blur-xl border-t border-white/5 safe-area-pb">
      <div className="flex items-center justify-around h-14">
        {tabs.map((tab) => {
          const isActive = active(tab);
          const Icon = tab.icon;
          return (
            <Link key={tab.path} to={tab.path} className={`flex flex-col items-center justify-center gap-0.5 w-full h-full transition-colors ${isActive ? 'text-[#229DD8]' : 'text-slate-500 hover:text-slate-300'}`}>
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.5} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
