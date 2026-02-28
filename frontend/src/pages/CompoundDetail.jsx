import { useEffect, useMemo, useRef, useState } from 'react'; 
import { useParams, Link } from 'react-router-dom'; 
import { useQuery } from '@tanstack/react-query'; 
import { ChevronLeft, MessageSquare, Search, X, AlertTriangle, Youtube, Lock, ExternalLink } from 'lucide-react'; 
import { api } from '../hooks/api'; 
import MarkdownRenderer from '../components/MarkdownRenderer'; 
import GrepGate from '../components/GrepGate'; 
import BackButton from '../components/layout/BackButton';
import UpgradeButton from '../components/UpgradeButton';

function getSessionInt(key, fallback) {  
  try {    
    var raw = sessionStorage.getItem(key);    
    var v = raw ? parseInt(raw, 10) : fallback;    
    return Number.isFinite(v) ? v : fallback;  
  } catch (e) {    
    return fallback;  
  } 
}

function setSessionInt(key, value) {  
  try { sessionStorage.setItem(key, String(value)); } catch (e) {} 
}

function extractYouTubeId(input) {  
  if (!input) return '';  
  var s = String(input).trim();  
  if (/^[a-zA-Z0-9_-]{11}$/.test(s)) return s;  
  try {    
    var u = new URL(s);    
    var host = u.hostname.replace('www.', '');    
    if (host === 'youtu.be') {      
      var id = u.pathname.replace('/', '').trim();      
      return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : '';    
    }    
    var v = u.searchParams.get('v');    
    if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;    
    var m = u.pathname.match(/\/embed\/([a-zA-Z0-9_-]{11})/);    
    if (m && m[1]) return m[1];  
  } catch (e) {}  
  return ''; 
}

function YouTubeEmbed({ videoId, title, className }) {  
  if (!videoId) return null;  
  var src = 'https://www.youtube-nocookie.com/embed/' + videoId + '?rel=0&modestbranding=1&iv_load_policy=3&cc_load_policy=0&autoplay=0&playsinline=1';  
  return (    
    <iframe      
      src={src}      
      title={title || 'YouTube video'}      
      frameBorder="0"      
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"      
      allowFullScreen      
      className={className || ''}    
    />  
  ); 
}

function Banner({ title, body, actions, onDismiss }) {  
  return (    
    <div className="prohp-card p-4 border border-prohp-400/20 bg-prohp-400/8 relative mt-4">      
      <button onClick={onDismiss} className="absolute top-2 right-2 text-slate-400 hover:text-slate-200" aria-label="Dismiss">        
        <X className="w-4 h-4" />      
      </button>      
      <div className="text-sm font-semibold text-slate-200">{title}</div>      
      <div className="mt-1 text-[13px] leading-relaxed text-slate-400">{body}</div>      
      {actions ? <div className="mt-3 flex gap-2 flex-wrap">{actions}</div> : null}    
    </div>  
  ); 
}

function Modal({ open, title, onClose, children }) {  
  useEffect(function() {    
    if (!open) return;    
    function onKey(e) { if (e.key === 'Escape') onClose(); }    
    document.addEventListener('keydown', onKey);    
    var prev = document.body.style.overflow;    
    document.body.style.overflow = 'hidden';    
    return function() {      
      document.removeEventListener('keydown', onKey);      
      document.body.style.overflow = prev;    
    };  
  }, [open, onClose]);   

  if (!open) return null;   

  return (    
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">      
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />      
      <div className="relative w-full max-w-5xl rounded-2xl overflow-hidden border border-white/10 bg-slate-950 shadow-2xl">        
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">          
          <div className="text-sm font-semibold text-slate-200 truncate">{title}</div>          
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 inline-flex items-center gap-2 text-xs px-2 py-1 rounded-lg hover:bg-white/5">            
            <X className="w-4 h-4" /> Close          
          </button>        
        </div>        
        <div className="p-3">{children}</div>      
      </div>    
    </div>  
  ); 
}

function JoinModal({ open, onClose }) {  
  useEffect(function() {    
    if (!open) return;    
    function onKey(e) { if (e.key === 'Escape') onClose(); }    
    document.addEventListener('keydown', onKey);    
    var prev = document.body.style.overflow;    
    document.body.style.overflow = 'hidden';    
    return function() {      
      document.removeEventListener('keydown', onKey);      
      document.body.style.overflow = prev;    
    };  
  }, [open, onClose]);   

  if (!open) return null;   

  return (    
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">      
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />      
      <div className="relative w-full max-w-md rounded-2xl overflow-hidden border border-white/10 bg-slate-950 shadow-2xl">        
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">          
          <div className="text-base font-bold text-slate-100">Join Inner Circle</div>          
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">            
            <X className="w-5 h-5" />          
          </button>        
        </div>        
        <div className="p-5">          
          <div className="text-sm text-slate-300 leading-relaxed mb-4">            
            Full access to every thread, every search result, and every compound breakdown in The Library and The Lab.          
          </div>          
          <div className="space-y-2 mb-5">            
            <div className="flex items-start gap-2 text-sm text-slate-300">              
              <span className="text-prohp-400 mt-0.5">&#10003;</span>              
              <span>Unlimited search across all threads and compounds</span>            
            </div>            
            <div className="flex items-start gap-2 text-sm text-slate-300">              
              <span className="text-prohp-400 mt-0.5">&#10003;</span>              
              <span>Post threads, log cycles, ask questions</span>            
            </div>            
            <div className="flex items-start gap-2 text-sm text-slate-300">              
              <span className="text-prohp-400 mt-0.5">&#10003;</span>              
              <span>Filter compounds by risk tier, hair loss, benefits</span>            
            </div>            
            <div className="flex items-start gap-2 text-sm text-slate-300">              
              <span className="text-prohp-400 mt-0.5">&#10003;</span>              
              <span>Full ranking list and side-by-side comparisons</span>            
            </div>            
            <div className="flex items-start gap-2 text-sm text-slate-300">              
              <span className="text-prohp-400 mt-0.5">&#10003;</span>              
              <span>Access every compound video breakdown</span>            
            </div>          
          </div>          
          <div className="text-center mb-4">            
            <span className="text-3xl font-extrabold text-slate-100">$19</span>            
            <span className="text-sm text-slate-400 ml-1">/ month</span>          
          </div>          
          <button className="prohp-btn-primary w-full text-center block py-3 text-sm font-bold opacity-50 cursor-not-allowed" onClick={function(e) { e.preventDefault(); }}>            
            Join Inner Circle          
          </button>          
          <div className="mt-3 text-center text-[11px] text-slate-500">            
            First 1,000 members get a permanent Founding Member badge.          
          </div>        
        </div>      
      </div>    
    </div>  
  ); 
}

function riskClass(tier) {  
  var t = (tier || '').toLowerCase();  
  if (t === 'low') return 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/40';  
  if (t === 'moderate') return 'bg-yellow-900/60 text-yellow-300 border border-yellow-700/40';  
  if (t === 'high') return 'bg-orange-900/60 text-orange-300 border border-orange-700/40';  
  if (t === 'extreme') return 'bg-red-900/60 text-red-300 border border-red-700/40';  
  return 'bg-slate-800 text-slate-300'; 
}

function hairClass(sev) {  
  var s = (sev || '').toLowerCase();  
  if (s === 'none') return 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/40';  
  if (s === 'mild') return 'bg-yellow-900/60 text-yellow-300 border border-yellow-700/40';  
  if (s === 'moderate') return 'bg-orange-900/60 text-orange-300 border border-orange-700/40';  
  if (s === 'severe') return 'bg-red-900/60 text-red-300 border border-red-700/40';  
  return 'bg-slate-800 text-slate-300'; 
}


function GateCTA({ gate_state, upgrade_cta }) {
  if (!upgrade_cta || gate_state === "member") return null;
  var isWindow = gate_state === "window";
  return (
    <div className="prohp-card p-6 mb-4 border border-[rgba(34,157,216,0.2)] bg-[rgba(34,157,216,0.04)]">
      <div className="flex items-center gap-2 mb-2">
        <Lock className="w-4 h-4 text-[#229DD8]" />
        <span className="text-sm font-bold text-slate-100">
          {isWindow ? "Unlock the Full Breakdown" : "Go Deeper"}
        </span>
      </div>
      <p className="text-[13px] text-slate-400 leading-relaxed mb-4">{upgrade_cta}</p>
      {isWindow ? (
        <a href="/compounds" className="prohp-btn-primary inline-flex items-center gap-2 text-xs px-4 py-2">
          Enter Your Email to Unlock
        </a>
      ) : (
        <div className="mt-2">
          <UpgradeButton variant="primary" className="!w-auto !px-5 !py-2.5 !text-xs !rounded-lg !shadow-none">
            Unlock Inner Circle
          </UpgradeButton>
        </div>
      )}
    </div>
  );
}

export default function CompoundDetail() {  
  var { slug } = useParams();   

  var { data, isLoading, error } = useQuery({    
    queryKey: ['compound', slug],    
    queryFn: function() { return api.get('/api/compounds/' + slug); },    
    enabled: !!slug,  
  });   

  var compound = data ? data.compound : null;  
  var relatedThreads = data ? (data.related_threads || []) : [];  
  var relatedCycles = data ? (data.related_cycles || []) : [];
  var gate_state = data ? (data.gate_state || 'window') : 'window';
  var upgrade_cta = data ? (data.upgrade_cta || '') : '';   

  var videoId = useMemo(function() {    
    if (!compound) return '';    
    return extractYouTubeId(compound.youtube_video_id) || extractYouTubeId(compound.youtube_url);  
  }, [compound]);   

  var [videoOpen, setVideoOpen] = useState(false);  
  var [joinOpen, setJoinOpen] = useState(false);   

  var [q, setQ] = useState('');  
  var [searching, setSearching] = useState(false);  
  var [searchErr, setSearchErr] = useState('');  
  var [results, setResults] = useState(null);   

  var searchKey = 'compoundSearchCount:' + (slug || 'x');  
  var dismissKey = 'compoundBannerDismissed:' + (slug || 'x');   

  var [searchCount, setSearchCountState] = useState(function() { return getSessionInt(searchKey, 0); });  
  var [bannerDismissed, setBannerDismissed] = useState(function() { return getSessionInt(dismissKey, 0) === 1; });   

  var abortRef = useRef(null);   

  useEffect(function() {    
    setQ('');    
    setResults(null);    
    setSearchErr('');    
    setSearchCountState(getSessionInt(searchKey, 0));    
    setBannerDismissed(getSessionInt(dismissKey, 0) === 1);  
  }, [slug, searchKey, dismissKey]);   

  useEffect(function() { setSessionInt(searchKey, searchCount); }, [searchKey, searchCount]);  
  useEffect(function() { setSessionInt(dismissKey, bannerDismissed ? 1 : 0); }, [dismissKey, bannerDismissed]);   

  var showBanner5 = !bannerDismissed && searchCount >= 5 && searchCount < 15;  
  var showBanner15 = !bannerDismissed && searchCount >= 15;   

  function runSearch(e) {    
    if (e && e.preventDefault) e.preventDefault();    
    var query = q.trim();    
    if (!query) return;     

    setSearchCountState(function(n) { return n + 1; });     

    try { if (abortRef.current) abortRef.current.abort(); } catch (ex) {}    
    var controller = new AbortController();    
    abortRef.current = controller;     

    setSearching(true);    
    setSearchErr('');    
    setResults(null);     

    api.get('/api/threads/search/query?q=' + encodeURIComponent(query) + '&limit=12&offset=0')      
      .then(function(res) { setResults(res); })      
      .catch(function(err2) {        
        if (err2 && err2.name === 'AbortError') return;        
        setSearchErr(err2 ? (err2.message || 'Search failed') : 'Search failed');      
      })      
      .finally(function() { setSearching(false); });  
  }   

  if (isLoading) {    
    return (      
      <div className="animate-pulse max-w-3xl mx-auto px-4 py-6">        
        <div className="h-8 bg-slate-800 rounded w-1/3 mb-4" />        
        <div className="h-40 bg-slate-800 rounded" />      
      </div>    
    );  
  }   

  if (error) return <div className="text-red-400 text-sm text-center py-12">{error.message}</div>;  
  if (!compound) return <div className="text-slate-400 text-sm text-center py-12">Compound not found.</div>;   

  var hasRealSummary = compound.summary && !compound.summary.toLowerCase().includes('buy it here');   

  return (    
    <div className="max-w-3xl mx-auto animate-fade-in px-4 py-6">      
      <BackButton fallback="/compounds" label="Back to Compounds" className="sticky top-0 z-30 flex w-fit items-center gap-1.5 text-xs text-slate-500 hover:text-prohp-400 transition-colors mb-4 py-3 -mt-6 pt-6 bg-[#0f1117]" />      
      <Link to="/compounds" className="fixed bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:right-8 md:translate-x-0 z-[100] inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/90 backdrop-blur-md px-5 py-3 text-sm font-semibold text-slate-200 shadow-lg transition hover:bg-slate-800 hover:border-white/20 hover:text-[#229DD8]" aria-label="Back to Encyclopedia"><ChevronLeft className="w-4 h-4" /> Encyclopedia</Link>       

      <div className="prohp-card p-6 mb-4">        
        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">          
          <div>            
            <h1 className="text-2xl font-extrabold tracking-tight mb-1">{compound.name}</h1>            
            {compound.company ? <p className="text-xs text-slate-500 mb-2">{compound.company}</p> : null}            
            <div className="flex flex-wrap items-center gap-2">              
              {compound.risk_tier ? (                
                <span className={'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ' + riskClass(compound.risk_tier)}>                  
                  Risk: {compound.risk_tier}                
                </span>              
              ) : null}              
              {compound.category ? (                
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700/40">                  
                  {compound.category}                
                </span>              
              ) : null}              
              {compound.hair_loss_severity ? (                
                <span className={'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ' + hairClass(compound.hair_loss_severity)}>                  
                  Hair loss: {compound.hair_loss_severity}                
                </span>              
              ) : null}            
            </div>          
          </div>           

          <div className="flex gap-2">            
            {videoId ? (              
              <button type="button" onClick={function() { setVideoOpen(true); }} className="prohp-btn-primary inline-flex items-center gap-2 text-xs">                
                <Youtube className="w-4 h-4" /> Watch breakdown              
              </button>            
            ) : null}          
          </div>        
        </div>         

        {hasRealSummary ? (          
          <div className="text-sm text-slate-300 leading-relaxed mb-4">{compound.summary}</div>        
        ) : null}         

        {videoId ? (          
          <div className="mb-4">            
            <div className="aspect-video rounded-lg overflow-hidden bg-black/30 border border-white/5">              
              <YouTubeEmbed videoId={videoId} title={compound.name + ' breakdown'} className="w-full h-full" />            
            </div>            
            <div className="mt-2 text-[11px] text-slate-500">              
              Use the player fullscreen icon, or hit <span className="text-slate-300 font-semibold">Watch breakdown</span> for theater mode.            
            </div>          
          </div>        
        ) : null}         

        {compound.product_url ? (          
          <div className="mt-3 pt-3 border-t border-white/5">            
            <a              
              href={compound.product_url}              
              target="_blank"              
              rel="noopener noreferrer"              
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-prohp-400 transition-colors"            
            >              
              <ExternalLink className="w-3.5 h-3.5" />              
              Get it here to support the encyclopedia. Appreciate you, brother.            
            </a>          
          </div>        
        ) : null}         

        {compound.benefits ? (          
          <div className="text-sm text-slate-400 mt-3">            
            <span className="font-semibold text-slate-300">Benefits: </span>{compound.benefits}          
          </div>        
        ) : null}      
      </div>       

      <Modal open={videoOpen} title={(compound.name || 'Video') + ' Î“Ã‡Ã¶ Breakdown'} onClose={function() { setVideoOpen(false); }}>        
        <div className="aspect-video rounded-xl overflow-hidden bg-black/40 border border-white/10">          
          <YouTubeEmbed videoId={videoId} title={compound.name + ' breakdown'} className="w-full h-full" />        
        </div>      
      </Modal>       

      <JoinModal open={joinOpen} onClose={function() { setJoinOpen(false); }} />

      {gate_state === "window" && <GateCTA gate_state={gate_state} upgrade_cta={upgrade_cta} />}       

      {compound.mechanism ? (        
        <div className="prohp-card p-6 mb-4">          
          <div className="text-sm font-semibold text-slate-200 mb-2">Mechanism</div>          
          <MarkdownRenderer content={compound.mechanism} />        
        </div>      
      ) : null}       

      {compound.dosing ? (        
        <div className="prohp-card p-6 mb-4">          
          <div className="text-sm font-semibold text-slate-200 mb-2">Dosing</div>          
          <MarkdownRenderer content={compound.dosing} />        
        </div>      
      ) : null}       

      {compound.side_effects ? (        
        <div className="prohp-card p-6 mb-4">          
          <div className="text-sm font-semibold text-slate-200 mb-2 flex items-center gap-1">            
            <AlertTriangle className="w-4 h-4 text-yellow-500" /> Side Effects          
          </div>          
          <MarkdownRenderer content={compound.side_effects} />        
        </div>      
      ) : null}       

      {compound.hair_loss_explanation ? (        
        <div className="text-xs text-slate-400 italic mb-6 px-1">          
          Hair loss note: {compound.hair_loss_explanation}        
        </div>      
      ) : null}       

      {gate_state === "lead" && <GateCTA gate_state={gate_state} upgrade_cta={upgrade_cta} />}

      <div className="mb-12">        
        {compound && (          
          <GrepGate excludeSlug={compound?.slug || ""}            
            autoQuery={compound.name}            
            title={`Still have a question about ${compound.name} or another product? Search the library.`}          
          />        
        )}      
      </div>       

      <div className="prohp-card p-6 mb-4">        
        <div className="flex items-center justify-between mb-3">          
          <div className="flex items-center gap-2">            
            <MessageSquare className="w-4 h-4 text-slate-400" />            
            <div className="text-sm font-semibold text-slate-200">Related Threads</div>          
          </div>          
          <Link to="/rooms/library" className="text-xs text-slate-500 hover:text-prohp-400 transition-colors">Library</Link>        
        </div>        
        {relatedThreads.length ? (          
          <div className="flex flex-col gap-2">            
            {relatedThreads.map(function(t) {              
              return (                
                <Link key={t.id} to={'/t/' + t.id} className="prohp-card p-3 hover:bg-slate-800/40 transition-colors">                  
                  <div className="text-[13px] font-semibold text-slate-200">{t.title}</div>                  
                  <div className="mt-1 text-[11px] text-slate-500">{t.reply_count} replies</div>                
                </Link>              
              );            
            })}          
          </div>        
        ) : (          
          <div className="text-sm text-slate-400">No related threads yet.</div>        
        )}      
      </div>       

      {relatedCycles.length ? (        
        <div className="prohp-card p-6">          
          <div className="text-sm font-semibold text-slate-200 mb-3">Related Cycles</div>          
          <div className="flex flex-col gap-2">            
            {relatedCycles.map(function(c) {              
              return (                
                <div key={c.id} className="prohp-card p-3">                  
                  <div className="text-[13px] font-semibold text-slate-200">{c.title}</div>                  
                  <div className="mt-1 text-[12px] text-slate-400">                    
                    {c.status ? 'Status: ' + c.status : ''}                    
                    {c.duration_weeks ? ' â”¬â•– ' + c.duration_weeks + ' weeks' : ''}                  
                  </div>                
                </div>              
              );            
            })}          
          </div>        
        </div>      
      ) : null}    
    </div>  
  ); 
}
