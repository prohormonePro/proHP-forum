import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export default function BackButton({ fallback = '/', label = 'Back' }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate(fallback);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-prohp-400 transition-colors mb-4"
    >
      <ChevronLeft size={16} />
      {label}
    </button>
  );
}
