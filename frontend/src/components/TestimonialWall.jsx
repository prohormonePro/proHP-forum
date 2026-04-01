import { useState, useEffect, useRef } from 'react';
import testimonials from '../data/testimonials.json';

function ReviewCard({ review }) {
  return (
    <div className="bg-slate-800/40 border border-white/5 p-4 rounded-xl mb-3 backdrop-blur-sm">
      <div className="flex justify-between items-center mb-2">
        <span className="text-white font-medium text-xs">{review.name}</span>
        {review.likes > 0 && <span className="text-[10px] text-prohp-400">{review.likes} likes</span>}
      </div>
      <p className="text-slate-300 text-[13px] leading-relaxed">{review.text}</p>
      {review.compound && <span className="inline-block mt-2 text-[10px] text-slate-500 bg-slate-800/60 px-2 py-0.5 rounded-full">{review.compound}</span>}
    </div>
  );
}

function ScrollColumn({ data, direction, speed }) {
  var colRef = useRef(null);
  var [paused, setPaused] = useState(false);

  useEffect(function() {
    var el = colRef.current;
    if (!el) return;
    var scrollSpeed = speed || 0.5;
    var pos = direction === 'up' ? 0 : el.scrollHeight / 2;
    el.scrollTop = pos;

    var frame;
    function tick() {
      if (!paused && el) {
        if (direction === 'up') {
          pos += scrollSpeed;
          if (pos >= el.scrollHeight / 2) pos = 0;
        } else {
          pos -= scrollSpeed;
          if (pos <= 0) pos = el.scrollHeight / 2;
        }
        el.scrollTop = pos;
      }
      frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return function() { cancelAnimationFrame(frame); };
  }, [paused, direction, speed]);

  var doubled = data.concat(data);

  return (
    <div
      ref={colRef}
      className="flex-1 overflow-hidden h-[420px] relative"
      style={{ maskImage: 'linear-gradient(to bottom, transparent, black 8%, black 92%, transparent)' }}
      onMouseEnter={function() { setPaused(true); }}
      onMouseLeave={function() { setPaused(false); }}
    >
      <div className="flex flex-col">
        {doubled.map(function(review, i) { return <ReviewCard key={i} review={review} />; })}
      </div>
    </div>
  );
}

export default function TestimonialWall() {
  if (!testimonials || testimonials.length < 3) return null;

  var third = Math.ceil(testimonials.length / 3);
  var col1 = testimonials.slice(0, third);
  var col2 = testimonials.slice(third, third * 2);
  var col3 = testimonials.slice(third * 2);

  return (
    <div className="prohp-card p-6 mb-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-extrabold text-slate-100 mb-1">Proof Over Hype.</h3>
        <p className="text-sm text-slate-400">Real people. Real cycles. Real results.</p>
      </div>
      <div className="flex gap-3 overflow-hidden">
        <ScrollColumn data={col1} direction="up" speed={0.4} />
        <ScrollColumn data={col2} direction="down" speed={0.5} />
        <div className="hidden md:block flex-1">
          <ScrollColumn data={col3} direction="up" speed={0.35} />
        </div>
      </div>
    </div>
  );
}
