import { useState, useEffect } from 'react';

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label=Scroll to top
      className=fixed bottom-6 right-6 z-50 flex items-center justify-center w-10 h-10 rounded-full bg-[#229DD8] text-white shadow-lg hover:bg-[#1b7fb0] transition-colors duration-200
    >
      <svg xmlns=http://www.w3.org/2000/svg viewBox=0 0 20 20 fill=currentColor className=w-5 h-5>
        <path fillRule=evenodd d=M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z clipRule=evenodd />
      </svg>
    </button>
  );
}
