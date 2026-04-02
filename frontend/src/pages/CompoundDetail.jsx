import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, MessageSquare, Search, X, AlertTriangle, Youtube, Lock, ExternalLink, ArrowUp, ArrowDown, CornerDownRight, CheckCircle, Award, Clock, Shield, Beaker, Heart, Activity, Zap, Droplets, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { api } from '../hooks/api';
import MarkdownRenderer from '../components/MarkdownRenderer';
import GrepGate from '../components/GrepGate';
import BackButton from '../components/layout/BackButton';
import useAuthStore from '../stores/auth';
import TestimonialWall from '../components/TestimonialWall';


/* ═══════════════════════════════════════════
   UTILITIES
   ═══════════════════════════════════════════ */
function getSessionInt(key, fallback) { try { var raw = sessionStorage.getItem(key); var v = raw ? parseInt(raw, 10) : fallback; return Number.isFinite(v) ? v : fallback; } catch (e) { return fallback; } }
function setSessionInt(key, value) { try { sessionStorage.setItem(key, String(value)); } catch (e) {} }

function extractYouTubeId(input) {
  if (!input) return '';
  var s = String(input).trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(s)) return s;
  try { var u = new URL(s); var host = u.hostname.replace('www.', ''); if (host === 'youtu.be') { var id = u.pathname.replace('/', '').trim(); return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : ''; } var v = u.searchParams.get('v'); if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v; var m = u.pathname.match(/\/embed\/([a-zA-Z0-9_-]{11})/); if (m && m[1]) return m[1]; } catch (e) {} return '';
}

/* ═══════════════════════════════════════════
   SMART CONTENT RENDERERS (wall-of-text killers)
   ═══════════════════════════════════════════ */

/* Detect if a line is an ALL CAPS HEADER like "TESTOSTERONE CONNECTION:" */
function isHeader(line) {
  var trimmed = line.trim();
  if (trimmed.length < 4 || trimmed.length > 120) return false;
  var upper = trimmed.replace(/[^A-Z]/g, '');
  return upper.length > trimmed.length * 0.5 && trimmed.indexOf(':') !== -1;
}

/* Render HTML content with hyperlinks */
function renderHtml(text) {
  if (!text) return null;
  var hasHtml = /<[a-z][\s\S]*>/i.test(text);
  if (hasHtml) {
    return <span dangerouslySetInnerHTML={{ __html: text }} />;
  }
  return text;
}

/* BENEFITS: Universal parser - pills, stat cards, check lists, prose cards */
function BenefitsRenderer({ content, preview }) {
  if (!content) return null;
  var clean = content.replace(/\u0093\u00c7\u00f3/g, '- ').replace(/\u0393\u00c7\u00f3/g, '- ');
  var trimmed = clean.trim();
  if (trimmed.indexOf('\n') === -1 && trimmed.split(',').length >= 3) {
    var pills = trimmed.split(',').map(function(p) { return p.trim(); }).filter(Boolean);
    return (<div className="flex flex-wrap gap-2">{pills.map(function(pill, i) { return (<span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-900/20 border border-emerald-700/20 text-[12px] text-emerald-300"><Check className="w-3 h-3" />{pill}</span>); })}</div>);
  }
  var blocks = clean.split(/\n\n+/).filter(function(b) { return b.trim(); });
  var sections = [];
  var currentSection = { header: null, items: [] };
  blocks.forEach(function(block) {
    var text = block.trim();
    var sectionMatch = text.match(/^(Other benefits|Travis.s conclusion|Additional|Key findings|Summary)[:\s]/i);
    if (sectionMatch) {
      if (currentSection.items.length > 0) sections.push(currentSection);
      var headerEnd = text.indexOf(':');
      currentSection = { header: text.slice(0, headerEnd + 1).trim(), items: [] };
      var rest = text.slice(headerEnd + 1).trim();
      if (rest) currentSection.items.push(rest);
    } else {
      currentSection.items.push(text);
    }
  });
  if (currentSection.items.length > 0) sections.push(currentSection);

  function classifyItem(text) {
    var colonMatch = text.match(/^([A-Z][A-Za-z\s\/&]{2,30}):\s+(.+)/);
    if (colonMatch && text.length < 200 && text.indexOf('\n') === -1) return 'stat';
    var dLines = text.split('\n').filter(function(l) { return l.trim(); });
    if (dLines.length > 1 && dLines.every(function(l) { return /^[-\u2022\u2013]\s/.test(l.trim()); })) return 'dashlist';
    if (text.length < 100 && text.indexOf('\n') === -1) return 'pill';
    return 'card';
  }

  function renderBenefitItem(text, key) {
    var type = classifyItem(text);
    if (type === 'stat') {
      var cm = text.match(/^([A-Z][A-Za-z\s\/&]{2,30}):\s+(.+)/);
      return (<div key={key} className="bg-slate-800/40 rounded-lg p-3 border border-white/5 text-center"><div className="text-[10px] font-bold text-prohp-400 uppercase tracking-wider mb-1">{cm[1]}</div><div className="text-sm text-slate-200 font-semibold">{renderHtml(cm[2])}</div></div>);
    }
    if (type === 'dashlist') {
      var dLines = text.split('\n').filter(function(l) { return l.trim(); });
      return (<div key={key} className="space-y-1.5">{dLines.map(function(line, j) { var c = line.trim().replace(/^[-\u2022\u2013]\s*/, ''); var bm = c.match(/^Best\s+for\s+(.+)/i); if (bm) { var bfRaw = bm[1]; var bfParen = bfRaw.indexOf('('); var bfPeriod = bfRaw.indexOf('.'); var bfSplit = bfParen > 0 ? bfParen : bfPeriod > 0 ? bfPeriod : -1; var bfKeyword = bfSplit > 0 ? bfRaw.slice(0, bfSplit).trim() : bfRaw.trim(); var bfSub = bfSplit > 0 ? bfRaw.slice(bfSplit).replace(/^[(.]+\s*/, '').replace(/[)]+$/, '').trim() : ''; bfKeyword = bfKeyword.charAt(0).toUpperCase() + bfKeyword.slice(1); return (<div key={j} className="p-3 rounded-lg bg-prohp-400/[0.06] border border-prohp-400/20 mt-1 text-center"><div className="flex items-center justify-center gap-2"><span className="text-[10px] font-bold text-prohp-400 uppercase tracking-wider px-2 py-0.5 rounded bg-prohp-400/10">Best For</span><span className="text-base font-bold text-slate-100">{bfKeyword}</span></div>{bfSub && <div className="text-[12px] text-slate-400 mt-1">{bfSub}</div>}</div>); } return (<div key={j} className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" /><div className="text-sm text-slate-300 leading-relaxed">{renderHtml(c)}</div></div>); })}</div>);
    }
    if (type === 'pill') {
      var ct = text.replace(/^[-\u2022\u2013]\s*/, '');
      /* "Best for X" gets special badge treatment */
      var bestMatch = ct.match(/^Best\s+for\s+(.+)/i);
      if (bestMatch) {
        var bfR = bestMatch[1]; var bfP = bfR.indexOf('('); var bfD = bfR.indexOf('.'); var bfS = bfP > 0 ? bfP : bfD > 0 ? bfD : -1; var bfK = bfS > 0 ? bfR.slice(0, bfS).trim() : bfR.trim(); var bfSb = bfS > 0 ? bfR.slice(bfS).replace(/^[(.]+\s*/, '').replace(/[)]+$/, '').trim() : ''; bfK = bfK.charAt(0).toUpperCase() + bfK.slice(1);
        return (<div key={key} className="col-span-full p-3 rounded-lg bg-prohp-400/[0.06] border border-prohp-400/20"><div className="flex items-center gap-2"><span className="text-[10px] font-bold text-prohp-400 uppercase tracking-wider px-2 py-0.5 rounded bg-prohp-400/10">Best For</span><span className="text-base font-bold text-slate-100">{bfK}</span></div>{bfSb && <div className="text-[12px] text-slate-400 mt-1">{bfSb}</div>}</div>);
      }
      return (<span key={key} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-900/20 border border-emerald-700/20 text-[12px] text-emerald-300"><Check className="w-3 h-3" />{renderHtml(ct)}</span>);
    }
    return (<div key={key} className="p-3 rounded-lg bg-emerald-900/[0.04] border-l-2 border-emerald-500/30"><div className="text-sm text-slate-300 leading-relaxed">{renderHtml(text)}</div></div>);
  }

  /* PREVIEW MODE: pills only, no cards, no section headers */
  if (preview) {
    var allPills = [];
    sections.forEach(function(section) {
      section.items.forEach(function(item, idx) {
        var t = item.trim();
        if (!t) return;
        var type = classifyItem(t);
        if (type === 'pill' || t.length < 60) {
          var ct = t.replace(/^[-\u2022\u2013]\s*/, '');
          allPills.push(ct);
        }
      });
    });
    if (allPills.length === 0) {
      var first3 = [];
      sections.forEach(function(s) { s.items.slice(0, 2).forEach(function(it) { var short = it.trim().split('.')[0].split(':')[0].trim(); if (short.length > 3 && short.length < 60) first3.push(short); }); });
      allPills = first3.slice(0, 8);
    }
    return (<div><div className="flex flex-wrap justify-center gap-2">{allPills.slice(0, 10).map(function(pill, i) { return (<span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-900/20 border border-emerald-700/20 text-[12px] text-emerald-300"><Check className="w-3 h-3" />{pill}</span>); })}</div>{allPills.length > 10 && <div className="text-center mt-3 text-[11px] text-slate-500">+ {allPills.length - 10} more benefits for Inner Circle members</div>}</div>);
  }

  return (
    <div className="space-y-4">
      {sections.map(function(section, si) {
        var pills = [];
        var cards = [];
        section.items.forEach(function(item, idx) {
          var t = item.trim();
          if (!t) return;
          var type = classifyItem(t);
          if (type === 'pill') { pills.push({ text: t, k: si + '-' + idx }); }
          else { cards.push({ text: t, k: si + '-' + idx }); }
        });
        return (
          <div key={si}>
            {section.header && (<div className="flex items-center gap-3 mb-3 mt-2"><div className="flex-1 h-px bg-gradient-to-r from-emerald-700/30 to-transparent" /><span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">{section.header.replace(/:$/, '')}</span><div className="flex-1 h-px bg-gradient-to-r from-transparent to-emerald-700/30" /></div>)}
            {pills.length > 0 && (<div className="flex flex-wrap justify-center gap-2 mb-3">{pills.map(function(p) { return renderBenefitItem(p.text, 'p-' + p.k); })}</div>)}
            {cards.length > 0 && (<div className="grid grid-cols-1 md:grid-cols-2 gap-3">{cards.map(function(c) { return renderBenefitItem(c.text, 'c-' + c.k); })}</div>)}
          </div>
        );
      })}
    </div>
  );
}

/* MECHANISM: Magazine lede + collapsible + centered section headers */
function MechanismRenderer({ content, preview }) {
  var [expanded, setExpanded] = useState(false);
  if (!content) return null;
  var paragraphs = content.split(/\n\n+/).filter(function(p) { return p.trim(); });
  if (preview) {
    var firstPara = paragraphs[0] || '';
    return (<div><div className="text-sm text-slate-300 leading-relaxed">{renderHtml(firstPara)}</div>{paragraphs.length > 1 && <div className="mt-3 text-center"><span className="text-[11px] text-slate-500 italic">Full mechanism breakdown available for Inner Circle members</span></div>}</div>);
  }
  var previewCount = 3;
  var needsCollapse = paragraphs.length > previewCount;
  var visible = expanded ? paragraphs : paragraphs.slice(0, previewCount);
  return (
    <div>
      <div className="space-y-5">
        {visible.map(function(para, i) {
          var lines = para.split('\n');
          var firstLine = lines[0] || '';
          if (isHeader(firstLine)) {
            var headerText = firstLine.replace(/:$/, '').trim();
            var bodyLines = lines.slice(1).join('\n').trim();
            return (<div key={i} className="mt-2"><div className="flex items-center gap-3 mb-3"><div className="flex-1 h-px bg-gradient-to-r from-transparent via-prohp-400/20 to-transparent" /><span className="text-[11px] font-bold text-prohp-400 uppercase tracking-widest">{headerText}</span><div className="flex-1 h-px bg-gradient-to-r from-transparent via-prohp-400/20 to-transparent" /></div>{bodyLines && <div className="text-sm text-slate-300 leading-relaxed">{renderHtml(bodyLines)}</div>}</div>);
          }
          if (i === 0) return (<div key={i} className="text-[15px] text-slate-200 leading-relaxed font-medium">{renderHtml(para)}</div>);
          return (<div key={i} className="text-sm text-slate-300 leading-relaxed pl-3 border-l-2 border-slate-700/40">{renderHtml(para)}</div>);
        })}
      </div>
      {needsCollapse && (<button onClick={function() { setExpanded(!expanded); }} className="mt-5 w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-prohp-400 hover:text-prohp-300 transition-colors rounded-lg hover:bg-prohp-400/[0.04]">{expanded ? (<><ChevronUp className="w-3.5 h-3.5" /> Show less</>) : (<><ChevronDown className="w-3.5 h-3.5" /> Read full mechanism ({paragraphs.length - previewCount} more sections)</>)}</button>)}
    </div>
  );
}

/* DOSING: Universal parser - weeks, tiers, protocols, stacks, PCT */
function DosingRenderer({ content }) {
  if (!content) return null;
  var allBlocks = content.split(/\n\n+/).filter(function(b) { return b.trim(); });
  var stackBlocks = [];
  var normalBlocks = [];
  var inStacks = false;
  allBlocks.forEach(function(block) {
    var fl = block.split('\n')[0].trim();
    if (/^stacks/i.test(fl)) {
      inStacks = true;
      block.split('\n').slice(1).filter(function(l) { return l.trim(); }).forEach(function(l) { stackBlocks.push(l.trim()); });
      return;
    }
    if (inStacks && /^[-\u2022]\s/.test(fl)) { stackBlocks.push(block.trim()); return; }
    if (inStacks && !/^[-\u2022]\s/.test(fl)) inStacks = false;
    normalBlocks.push(block);
  });

  function renderDosingBlock(block, i) {
    var lines = block.split('\n');
    var fl = (lines[0] || '').trim();
    if (isHeader(fl)) {
      var ht = fl.replace(/:$/, '').trim();
      var bl = lines.slice(1).join('\n').trim();
      return (<div key={i}><div className="flex items-center gap-3 mb-2 mt-1"><div className="flex-1 h-px bg-gradient-to-r from-prohp-400/20 to-transparent" /><span className="text-[10px] font-bold text-prohp-400 uppercase tracking-widest">{ht}</span><div className="flex-1 h-px bg-gradient-to-r from-transparent to-prohp-400/20" /></div>{bl && <div className="text-sm text-slate-300 leading-relaxed">{renderHtml(bl)}</div>}</div>);
    }
    if (/^(week|wk)\s*\d/i.test(fl)) {
      var weekLabel = fl.match(/^((?:week|wk)\s*[\d+\-]+)/i);
      var weekTitle = weekLabel ? weekLabel[1].trim() : fl.split(':')[0].trim();
      var weekBody = fl.indexOf(':') > 0 ? fl.slice(fl.indexOf(':') + 1).trim() : '';
      var weekExtra = lines.slice(1).join(' ').trim();
      if (weekExtra) weekBody = weekBody ? weekBody + ' ' + weekExtra : weekExtra;
      var weekDose = '';
      var weekNote = weekBody;
      var dotIdx = weekBody.indexOf('.');
      if (dotIdx > 0 && dotIdx < 60) { weekDose = weekBody.slice(0, dotIdx).trim(); weekNote = weekBody.slice(dotIdx + 1).trim(); }
      return (
        <div key={i} className="p-3 rounded-lg bg-prohp-400/[0.04] border border-prohp-400/10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-prohp-400 shrink-0" />
            <span className="text-xs font-bold text-prohp-400 uppercase tracking-wider">{weekTitle}</span>
          </div>
          {weekDose && <div className="text-base font-bold text-slate-100 mb-1">{weekDose}</div>}
          {weekNote && <div className="text-[12px] text-slate-400 leading-relaxed italic">{renderHtml(weekNote)}</div>}
        </div>
      );
    }
    var tierMatch = fl.match(/^(Beginner|Intermediate|Advanced|Sweet spot|Standard|Clinical|First-time)/i);
    if (tierMatch) {
      var tk = tierMatch[1].toLowerCase();
      var ts = { 'beginner': ['border-emerald-500/20','bg-emerald-900/[0.06]','text-emerald-400'], 'first-time': ['border-emerald-500/20','bg-emerald-900/[0.06]','text-emerald-400'], 'standard': ['border-emerald-500/20','bg-emerald-900/[0.06]','text-emerald-400'], 'intermediate': ['border-yellow-500/20','bg-yellow-900/[0.06]','text-yellow-400'], 'sweet spot': ['border-prohp-400/20','bg-prohp-400/[0.06]','text-prohp-400'], 'clinical': ['border-yellow-500/20','bg-yellow-900/[0.06]','text-yellow-400'], 'advanced': ['border-orange-500/20','bg-orange-900/[0.06]','text-orange-400'] };
      var s = ts[tk] || ['border-prohp-400/20','bg-prohp-400/[0.06]','text-prohp-400'];
      return (<div key={i} className={'p-3 rounded-lg border ' + s[0] + ' ' + s[1]}><div className={'text-[10px] font-bold uppercase tracking-wider mb-1 ' + s[2]}>{tierMatch[1]}</div><div className="text-sm text-slate-300 leading-relaxed">{renderHtml(block)}</div></div>);
    }
    if (/^FOR\s/i.test(fl)) {
      var pl = fl.replace(/:$/, '').trim();
      var pb = lines.slice(1).join('\n').trim();
      return (<div key={i} className="border-l-2 border-prohp-400/30 pl-4"><div className="text-[10px] font-bold text-prohp-400 uppercase tracking-wider mb-2">{pl}</div>{pb && <div className="text-sm text-slate-300 leading-relaxed">{renderHtml(pb)}</div>}</div>);
    }
    if (/^(cycle|duration|length|bottles)/i.test(fl)) {
      return (<div key={i} className="p-3 rounded-lg bg-slate-800/30 border border-white/5"><div className="flex items-center gap-2 mb-1"><Clock className="w-3.5 h-3.5 text-prohp-400" /><span className="text-xs font-bold text-slate-300">Cycle Info</span></div><div className="text-sm text-slate-300 leading-relaxed">{renderHtml(block)}</div></div>);
    }
    if (/^PCT/i.test(fl)) {
      return (<div key={i} className="bg-red-900/[0.06] border border-red-700/15 rounded-lg p-3"><div className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-1">Post-Cycle Therapy</div><div className="text-sm text-slate-300 leading-relaxed">{renderHtml(block)}</div></div>);
    }
    if (/^(COMT|comt)\s/i.test(fl)) {
      return (<div key={i} className="bg-amber-900/[0.04] border border-amber-700/15 rounded-lg p-3"><div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-1">COMT Support</div><div className="text-sm text-slate-300 leading-relaxed">{renderHtml(block)}</div></div>);
    }
    var dl = lines.filter(function(l) { return l.trim(); });
    if (dl.length > 1 && dl.every(function(l) { return /^[-\u2022]\s/.test(l.trim()); })) {
      return (<div key={i} className="space-y-1.5">{dl.map(function(line, j) { var c = line.trim().replace(/^[-\u2022]\s*/, ''); return (<div key={j} className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-prohp-400 mt-2 shrink-0" /><div className="text-sm text-slate-300 leading-relaxed">{renderHtml(c)}</div></div>); })}</div>);
    }
    /* Each pill/capsule → pill chips */
    var eachMatch = block.match(/^Each\s+(pill|capsule|serving|tablet)[:\s]+(.+)/i);
    if (eachMatch) {
      var parts = eachMatch[2].split(/\.\s+/).filter(function(p) { return p.trim(); });
      return (<div key={i} className="flex flex-wrap justify-center gap-2">{parts.map(function(part, pi) { return (<span key={pi} className="inline-flex items-center px-4 py-2 rounded-full bg-slate-800/60 border border-white/10 text-[12px] text-slate-200 font-medium">{renderHtml(part.trim().replace(/\.$/, ''))}</span>); })}</div>);
    }
    return (<div key={i} className="text-sm text-slate-300 leading-relaxed">{renderHtml(block)}</div>);
  }

  return (
    <div className="space-y-4">
      {normalBlocks.filter(function(b) { return !/^Best\s+for\s/im.test(b.trim()); }).map(function(block, i) { return renderDosingBlock(block, i); })}
      {stackBlocks.length > 0 && (
        <div className="prohp-card p-4 border border-prohp-400/10 bg-prohp-400/[0.02]">
          <div className="text-[10px] font-bold text-prohp-400 uppercase tracking-wider mb-3">Recommended Stacks</div>
          <div className="space-y-3">
            {stackBlocks.map(function(stack, si) {
              var cl = stack.replace(/^[-\u2022]\s*/, '');
              var lm = cl.match(/^([^(]+)\(([^)]+)\):\s*(.+)/);
              if (lm) return (<div key={si} className="bg-slate-800/40 rounded-lg p-3 border border-white/5"><div className="text-xs font-bold text-slate-200 mb-0.5">{lm[1].trim()}</div><div className="text-[10px] text-slate-500 mb-1">{lm[2].trim()}</div><div className="text-[12px] text-slate-400 leading-relaxed">{renderHtml(lm[3].trim())}</div></div>);
              var sm = cl.match(/^([^:]+):\s*(.+)/);
              if (sm) return (<div key={si} className="bg-slate-800/40 rounded-lg p-3 border border-white/5"><div className="text-xs font-bold text-slate-200 mb-1">{sm[1].trim()}</div><div className="text-[12px] text-slate-400 leading-relaxed">{renderHtml(sm[2].trim())}</div></div>);
              return (<div key={si} className="bg-slate-800/40 rounded-lg p-3 border border-white/5"><div className="text-sm text-slate-300">{renderHtml(cl)}</div></div>);
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* SIDE EFFECTS: Universal parser - ALL CAPS headers, dash labels, severity split */
function SideEffectsRenderer({ content, preview }) {
  if (!content) return null;
  var clean = content.replace(/\u0093\u00c7\u00f3/g, '- ').replace(/\u0393\u00c7\u00f3/g, '- ');
  var blocks = clean.split(/\n\n+/).filter(function(b) { return b.trim(); });
  var items = [];
  blocks.forEach(function(block) {
    var text = block.trim();
    if (!text || text.length < 5) return;
    var isPositive = /no liver|unaffected|no lipid|no creatinine|clean|well-tolerated|zero/i.test(text) && !/if|can|may|might|watch/i.test(text.slice(0, 30));
    var isSevere = !isPositive && /suppress|liver|toxic|shutdown|banned|extreme|mandatory|HPTA|heart|cardiac|death|METHYLATED|hepatotoxic|methyl/i.test(text);
    var capsMatch = text.match(/^([A-Z][A-Z\s,/&]{2,40}):\s*([\s\S]+)/);
    if (capsMatch) { items.push({ label: capsMatch[1].trim(), body: capsMatch[2].trim(), severe: true, positive: false }); return; }
    var dashIdx = text.indexOf(' - ');
    if (dashIdx > 0 && dashIdx < 60) { items.push({ label: text.slice(0, dashIdx).trim(), body: text.slice(dashIdx + 3).trim(), severe: isSevere, positive: isPositive }); return; }
    items.push({ label: null, body: text, severe: isSevere, positive: isPositive });
  });
  items.sort(function(a, b) { if (a.positive !== b.positive) return a.positive ? 1 : -1; return (b.severe ? 1 : 0) - (a.severe ? 1 : 0); });
  var severe = items.filter(function(it) { return it.severe; });
  var mild = items.filter(function(it) { return !it.severe && !it.positive; });
  var positive = items.filter(function(it) { return it.positive; });

  if (preview) {
    var labels = items.filter(function(it) { return it.label; }).map(function(it) { return it.label; }).slice(0, 5);
    return (<div className="flex flex-col items-center space-y-3 w-full"><div className="flex items-center justify-center gap-4 max-w-xs mx-auto

This is a single class-string swap on the inner badge row (~line 313). w-full forced badges to stretch across the entire parent width on desktop. max-w-xs mx-auto caps the row at 320px and centers it — badges stay tight on wide screens, mobile layout unchanged since the parent is already narrower than 320px.

No other files touched. No schema changes. No new dependencies."><div className="flex-1 text-center"><div className="text-2xl font-bold text-red-400">{severe.length}</div><div className="text-[10px] text-slate-500 uppercase tracking-wider">Watch Closely</div></div><div className="flex-1 text-center"><div className="text-2xl font-bold text-yellow-400">{mild.length}</div><div className="text-[10px] text-slate-500 uppercase tracking-wider">Be Aware</div></div>{positive.length > 0 && <div className="flex-1 text-center"><div className="text-2xl font-bold text-emerald-400">{positive.length}</div><div className="text-[10px] text-slate-500 uppercase tracking-wider">Clean</div></div>}</div>{labels.length > 0 && <div className="flex flex-wrap justify-center gap-2">{labels.map(function(l, i) { return (<span key={i} className="px-3 py-1 rounded-full bg-slate-800/60 border border-white/5 text-[11px] text-slate-400">{l}</span>); })}</div>}<div className="text-center mt-2"><span className="text-[11px] text-slate-500 italic">Detailed severity analysis for Inner Circle members</span></div></div>);
  }
  function renderSECard(item, i) {
    var bc = item.positive ? 'border-emerald-700/20 bg-emerald-900/[0.04]' : item.severe ? 'border-red-700/20 bg-red-900/[0.04]' : 'border-yellow-700/10 bg-yellow-900/[0.03]';
    var dc = item.positive ? 'bg-emerald-500' : item.severe ? 'bg-red-500' : 'bg-yellow-500';
    return (<div key={i} className={'p-3 rounded-lg border ' + bc}><div className="flex items-start gap-2.5"><div className={'w-2 h-2 rounded-full mt-1.5 shrink-0 ' + dc} /><div>{item.label && <div className="text-xs font-bold text-slate-200 mb-0.5">{item.label}</div>}<div className="text-[13px] text-slate-300 leading-relaxed">{renderHtml(item.body)}</div></div></div></div>);
  }
  if (severe.length > 0 && mild.length > 0) {
    return (<div className="grid grid-cols-1 md:grid-cols-2 gap-3"><div className="space-y-2"><div className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-1">Watch Closely</div>{severe.map(function(it, i) { return renderSECard(it, 's' + i); })}</div><div className="space-y-2"><div className="text-[10px] font-bold text-yellow-400 uppercase tracking-wider mb-1">Be Aware</div>{mild.map(function(it, i) { return renderSECard(it, 'm' + i); })}</div></div>);
  }
  return (<div className="space-y-2">{items.map(function(it, i) { return renderSECard(it, i); })}</div>);
}

/* SOURCE REFERENCES: Parse from content text */
function SourceReferences({ content }) {
  if (!content) return null;
  var match = content.match(/SOURCE REFERENCES:\n([\s\S]*?)$/i);
  if (!match) return null;
  var refs = match[1].split('\n').filter(function(l) { return l.trim() && /^\d+\./.test(l.trim()); });
  if (refs.length === 0) return null;

  return (
    <div className="prohp-card p-5 mb-4 border border-white/5">
      <div className="flex items-center gap-2 mb-3">
        <Beaker className="w-4 h-4 text-prohp-400" />
        <span className="text-sm font-bold text-slate-200">Source References</span>
      </div>
      <div className="space-y-2">
        {refs.map(function(ref, i) {
          return (
            <div key={i} className="text-[12px] text-slate-400 leading-relaxed pl-4 border-l border-slate-700/40">
              {ref.trim()}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* Generic fallback content block */
function ContentBlock({ content, className }) {
  if (!content) return null;
  var hasHtml = /<[a-z][\s\S]*>/i.test(content);
  if (hasHtml) {
    return (<div className={className || 'text-sm text-slate-300 leading-relaxed whitespace-pre-line'} dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br/>') }} />);
  }
  return <MarkdownRenderer content={content} className={className} />;
}

/* ═══════════════════════════════════════════
   CORE SUB-COMPONENTS
   ═══════════════════════════════════════════ */
function YouTubeEmbed({ videoId, title, className }) {
  if (!videoId) return null;
  var src = 'https://www.youtube-nocookie.com/embed/' + videoId + '?rel=0&modestbranding=1&iv_load_policy=3&cc_load_policy=0&autoplay=0&playsinline=1';
  return (<iframe src={src} title={title || 'YouTube video'} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className={className || ''} />);
}

function Modal({ open, title, onClose, children }) {
  useEffect(function() { if (!open) return; function onKey(e) { if (e.key === 'Escape') onClose(); } document.addEventListener('keydown', onKey); var prev = document.body.style.overflow; document.body.style.overflow = 'hidden'; return function() { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; }; }, [open, onClose]);
  if (!open) return null;
  return (<div className="fixed inset-0 z-[100] flex items-center justify-center p-4"><div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} /><div className="relative w-full max-w-5xl rounded-2xl overflow-hidden border border-white/10 bg-slate-950 shadow-2xl"><div className="flex items-center justify-between px-4 py-3 border-b border-white/10"><div className="text-sm font-semibold text-slate-200 truncate">{title}</div><button onClick={onClose} className="text-slate-400 hover:text-slate-200 inline-flex items-center gap-2 text-xs px-2 py-1 rounded-lg hover:bg-white/5"><X className="w-4 h-4" /> Close</button></div><div className="p-3">{children}</div></div></div>);
}

function JoinModal({ open, onClose }) {
  useEffect(function() { if (!open) return; function onKey(e) { if (e.key === 'Escape') onClose(); } document.addEventListener('keydown', onKey); var prev = document.body.style.overflow; document.body.style.overflow = 'hidden'; return function() { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; }; }, [open, onClose]);
  if (!open) return null;
  return (<div className="fixed inset-0 z-[100] flex items-center justify-center p-4"><div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} /><div className="relative w-full max-w-md rounded-2xl overflow-hidden border border-white/10 bg-slate-950 shadow-2xl"><div className="flex items-center justify-between px-5 py-4 border-b border-white/10"><div className="text-base font-bold text-slate-100">Join Inner Circle</div><button onClick={onClose} className="text-slate-400 hover:text-slate-200"><X className="w-5 h-5" /></button></div><div className="p-5"><div className="text-sm text-slate-300 leading-relaxed mb-4">Full access to every thread, every search result, and every compound breakdown in The Library and The Lab.</div><div className="space-y-2 mb-5">{['Unlimited search across all threads and compounds','Post threads, log cycles, ask questions','Filter compounds by risk tier, hair loss, benefits','Full ranking list and side-by-side comparisons','Access every compound video breakdown'].map(function(item,i){return(<div key={i} className="flex items-start gap-2 text-sm text-slate-300"><span className="text-prohp-400 mt-0.5">&#10003;</span><span>{item}</span></div>);})}</div><div className="text-center mb-4"><span className="text-3xl font-extrabold text-slate-100">$19</span><span className="text-sm text-slate-400 ml-1">/ month</span></div><Link to="/register" className="prohp-btn-primary w-full text-center block py-3 text-sm font-bold">Join Inner Circle</Link><div className="mt-3 text-center text-[11px] text-slate-500">First 1,000 members get a permanent Founding Member badge.</div></div></div></div>);
}

/* ═══════════════════════════════════════════
   BADGE HELPERS
   ═══════════════════════════════════════════ */
function riskClass(tier) { var t = (tier || '').toLowerCase(); if (t === 'low') return 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/40'; if (t === 'moderate') return 'bg-yellow-900/60 text-yellow-300 border border-yellow-700/40'; if (t === 'high') return 'bg-orange-900/60 text-orange-300 border border-orange-700/40'; if (t === 'extreme') return 'bg-red-900/60 text-red-300 border border-red-700/40'; return 'bg-slate-800 text-slate-300'; }
function hairClass(sev) { var s = (sev || '').toLowerCase(); if (s === 'none') return 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/40'; if (s === 'mild') return 'bg-yellow-900/60 text-yellow-300 border border-yellow-700/40'; if (s === 'moderate') return 'bg-orange-900/60 text-orange-300 border border-orange-700/40'; if (s === 'severe') return 'bg-red-900/60 text-red-300 border border-red-700/40'; return 'bg-slate-800 text-slate-300'; }
function legalClass(status) { var s = (status || 'active').toLowerCase(); if (s === 'active') return 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/40'; if (s === 'banned') return 'bg-red-900/60 text-red-300 border border-red-700/40'; if (s === 'grey_market') return 'bg-yellow-900/60 text-yellow-300 border border-yellow-700/40'; return 'bg-slate-800 text-slate-300'; }
function legalLabel(status) { var s = (status || 'active').toLowerCase(); if (s === 'banned') return 'Banned'; if (s === 'grey_market') return 'Grey Market'; return 'Active'; }

/* ═══════════════════════════════════════════
   ANIMATED RISK METER
   ═══════════════════════════════════════════ */
function riskBarColor(level) { if (level <= 0) return 'bg-slate-700'; if (level === 1) return 'bg-emerald-500'; if (level === 2) return 'bg-yellow-500'; if (level === 3) return 'bg-amber-500'; if (level === 4) return 'bg-orange-500'; return 'bg-red-500'; }
function riskBarLabel(level) { if (level <= 0) return 'None'; if (level === 1) return 'Minimal'; if (level === 2) return 'Low'; if (level === 3) return 'Moderate'; if (level === 4) return 'High'; return 'Severe'; }
function riskBarTextColor(level) { if (level <= 0) return 'text-slate-500'; if (level === 1) return 'text-emerald-400'; if (level === 2) return 'text-yellow-400'; if (level === 3) return 'text-amber-400'; if (level === 4) return 'text-orange-400'; return 'text-red-400'; }

function getDefaultLevels(category, riskTier) {
  var cat = (category || '').toLowerCase(); var tier = (riskTier || '').toLowerCase();
  if (cat === 'ancillary' || cat === 'natural' || cat === 'other') return null;
  if (cat === 'sarm') { if (tier === 'extreme') return {s:5,l:3,h:4,w:1,c:4,m:4}; if (tier === 'high') return {s:4,l:1,h:3,w:1,c:3,m:3}; if (tier === 'moderate') return {s:3,l:1,h:2,w:1,c:2,m:2}; return {s:2,l:0,h:1,w:0,c:1,m:1}; }
  if (cat === 'prohormone') { if (tier === 'extreme') return {s:5,l:4,h:4,w:3,c:4,m:4}; if (tier === 'high') return {s:4,l:2,h:2,w:3,c:2,m:3}; if (tier === 'moderate') return {s:3,l:1,h:2,w:2,c:2,m:2}; return {s:2,l:1,h:1,w:2,c:1,m:1}; }
  if (cat === 'peptide') return {s:1,l:0,h:0,w:1,c:0,m:1}; if (cat === 'serm') return {s:0,l:1,h:0,w:0,c:0,m:2}; if (cat === 'ai') return {s:0,l:1,h:0,w:0,c:0,m:1};
  return {s:2,l:1,h:1,w:1,c:1,m:1};
}

function RiskMeter({ compound }) {
  var [animated, setAnimated] = useState(false);
  var cat = (compound.category || '').toLowerCase();
  if (cat === 'ancillary' || cat === 'natural' || cat === 'other') return null;

  var hasDbValues = compound.suppression_level != null;
  var defaults = getDefaultLevels(compound.category, compound.risk_tier);
  if (!hasDbValues && !defaults) return null;

  var levels = {
    suppression: hasDbValues ? (compound.suppression_level || 0) : defaults.s,
    liver: hasDbValues ? (compound.liver_level || 0) : defaults.l,
    hair: hasDbValues ? (compound.hair_loss_level || 0) : defaults.h,
    water: hasDbValues ? (compound.water_retention_level || 0) : defaults.w,
    cholesterol: hasDbValues ? (compound.cholesterol_level || 0) : defaults.c,
    mood: hasDbValues ? (compound.mood_level || 0) : defaults.m,
  };

  /* Trigger animation after mount */
  useEffect(function() {
    var timer = setTimeout(function() { setAnimated(true); }, 150);
    return function() { clearTimeout(timer); };
  }, []);

  var bars = [
    { key: 'suppression', label: 'Suppression', level: levels.suppression, note: levels.suppression >= 3 },
    { key: 'liver', label: 'Liver Stress', level: levels.liver },
    { key: 'hair', label: 'Hair Loss', level: levels.hair },
    { key: 'water', label: 'Water Retention', level: levels.water },
    { key: 'cholesterol', label: 'Cholesterol', level: levels.cholesterol },
    { key: 'mood', label: 'Mood / Anxiety', level: levels.mood, note: levels.mood >= 3 },
  ];

  return (
    <div className="prohp-card p-6 mb-4 border border-prohp-400/20" style={{ boxShadow: '0 0 30px rgba(34, 157, 216, 0.08), 0 4px 20px rgba(0,0,0,0.3)' }}>
      <div className="flex items-center gap-2 mb-5">
        <Shield className="w-5 h-5 text-prohp-400" />
        <span className="text-base font-bold text-slate-100">Risk Profile</span>
        {!hasDbValues && <span className="text-[9px] text-slate-600 ml-auto">Estimated from category</span>}
      </div>
      <div className="space-y-3">
        {bars.map(function(bar, idx) {
          var pct = Math.min(bar.level * 20, 100);
          return (
            <div key={bar.key}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-400">{bar.label}</span>
                <span className={'text-xs font-bold ' + riskBarTextColor(bar.level)}>{riskBarLabel(bar.level)}</span>
              </div>
              <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={'h-full rounded-full ' + riskBarColor(bar.level)}
                  style={{
                    width: animated ? pct + '%' : '0%',
                    transition: 'width ' + (0.6 + idx * 0.1) + 's cubic-bezier(0.4, 0, 0.2, 1) ' + (idx * 0.08) + 's'
                  }}
                />
              </div>
              {bar.key === 'suppression' && bar.note && (
                <div className="mt-1 text-[11px] text-slate-500 italic">Your body slows testosterone production. Moody, tired, unmotivated. <Link to="/compounds/arimiplex" className="text-prohp-400 hover:text-prohp-300">PCT</Link> fixes this.</div>
              )}
              {bar.key === 'mood' && bar.note && (
                <div className="mt-1 text-[11px] text-slate-500 italic">DHT slows <Link to="/compounds/comt" className="text-prohp-400 hover:text-prohp-300">COMT</Link> enzyme. Anxiety, irritability, fight-or-flight.</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   TEST BASE + ANCILLARIES + OTHER V3 SECTIONS
   ═══════════════════════════════════════════ */
function TestBaseSection({ compound }) {
  var cat = (compound.category || '').toLowerCase(); var tier = (compound.risk_tier || '').toLowerCase();
  var isSuppressive = ['moderate','high','extreme'].indexOf(tier) !== -1;
  var needsTestBase = isSuppressive && (cat === 'sarm' || cat === 'prohormone');
  if (!needsTestBase) return null;
  var slug = (compound.slug || '').toLowerCase();
  if (['andriol','sustanon-250','brutal-4ce'].indexOf(slug) !== -1) return null;
  return (
    <div className="prohp-card p-5 mb-4 border border-orange-700/20 bg-orange-900/[0.04]">
      <div className="flex items-center gap-2 mb-3"><AlertTriangle className="w-4 h-4 text-orange-400" /><span className="text-sm font-bold text-slate-200">Test Base</span><span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">Non-negotiable</span></div>
      <div className="mb-3"><div className="text-xs text-slate-400 mb-2">OTC (over-the-counter):</div><div className="flex flex-wrap gap-2"><Link to="/compounds/andriol" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-white/10 text-xs font-semibold text-slate-200 hover:border-prohp-400/40 hover:text-prohp-400 transition-all">Andriol <span className="text-[9px] text-slate-500">(most popular)</span></Link><Link to="/compounds/sustanon-250" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-white/10 text-xs font-semibold text-slate-200 hover:border-prohp-400/40 hover:text-prohp-400 transition-all">Sustanon 250</Link><Link to="/compounds/brutal-4ce" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-white/10 text-xs font-semibold text-slate-200 hover:border-prohp-400/40 hover:text-prohp-400 transition-all">Brutal 4ce</Link></div></div>
      <div className="text-[11px] text-slate-500 leading-relaxed">Without a test base, you get: dry joints, flat mood, low libido, and deeper suppression. 4-Andro provides the testosterone and estrogen your body needs while running {compound.name}.</div>
    </div>
  );
}

function AncillariesSection({ compound }) {
  var cat = (compound.category || '').toLowerCase(); var tier = (compound.risk_tier || '').toLowerCase();
  if (cat === 'ancillary' || cat === 'natural' || cat === 'other') return null;
  var isSuppressive = ['moderate','high','extreme'].indexOf(tier) !== -1;
  var isMethylated = ['m1t','m-sten','epistane','halotestin','dmz','methaquad','halo-elite','halodrol','helladrol','yk-11','monsterplexx'].indexOf(compound.slug || '') !== -1;
  var isDHT = ['dymethazine','winstrol','primobolan','pink-magic','superstrol-7','rad-140','rad-150','s23','lgd-3303'].indexOf(compound.slug || '') !== -1;
  var is4Andro = ['andriol','sustanon-250','brutal-4ce'].indexOf(compound.slug || '') !== -1;
  return (
    <div className="prohp-card p-5 mb-4 border border-prohp-400/10 bg-prohp-400/[0.02]">
      <div className="flex items-center gap-2 mb-4"><Beaker className="w-4 h-4 text-prohp-400" /><span className="text-sm font-bold text-slate-200">Must-Have Ancillaries</span></div>
      <div className="space-y-3">
        <div><div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1.5">Daily Essentials</div><div className="flex flex-wrap gap-1.5"><Link to="/compounds/vitamin-d" className="text-[11px] px-2.5 py-1 rounded-md bg-emerald-900/30 border border-emerald-700/30 text-emerald-300 hover:border-emerald-500/50 transition-colors">Vitamin D 5000 IU</Link><Link to="/compounds/fish-oil" className="text-[11px] px-2.5 py-1 rounded-md bg-emerald-900/30 border border-emerald-700/30 text-emerald-300 hover:border-emerald-500/50 transition-colors">Fish Oil</Link><Link to="/compounds/magnesium" className="text-[11px] px-2.5 py-1 rounded-md bg-emerald-900/30 border border-emerald-700/30 text-emerald-300 hover:border-emerald-500/50 transition-colors">Magnesium</Link><Link to="/compounds/zinc" className="text-[11px] px-2.5 py-1 rounded-md bg-emerald-900/30 border border-emerald-700/30 text-emerald-300 hover:border-emerald-500/50 transition-colors">Zinc 25mg</Link></div></div>
        {isMethylated && (<div><div className="text-[10px] font-bold text-yellow-400 uppercase tracking-wider mb-1.5">On-Cycle Liver Support <span className="text-yellow-500/60">(methylated)</span></div><div className="flex flex-wrap gap-1.5"><Link to="/compounds/tudca" className="text-[11px] px-2.5 py-1 rounded-md bg-yellow-900/20 border border-yellow-700/30 text-yellow-300 hover:border-yellow-500/50 transition-colors">TUDCA 1000mg</Link><Link to="/compounds/nac" className="text-[11px] px-2.5 py-1 rounded-md bg-yellow-900/20 border border-yellow-700/30 text-yellow-300 hover:border-yellow-500/50 transition-colors">NAC 600mg</Link></div></div>)}
        {isDHT && (<div><div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-1.5">COMT Support <span className="text-amber-500/60">(DHT compound)</span></div><div className="flex flex-wrap gap-1.5"><Link to="/compounds/magnesium" className="text-[11px] px-2.5 py-1 rounded-md bg-amber-900/20 border border-amber-700/30 text-amber-300 hover:border-amber-500/50 transition-colors">Mag Glycinate 400mg</Link><Link to="/compounds/zinc" className="text-[11px] px-2.5 py-1 rounded-md bg-amber-900/20 border border-amber-700/30 text-amber-300 hover:border-amber-500/50 transition-colors">Zinc 50mg</Link><Link to="/compounds/p5p-b6" className="text-[11px] px-2.5 py-1 rounded-md bg-amber-900/20 border border-amber-700/30 text-amber-300 hover:border-amber-500/50 transition-colors">P5P 100mg</Link><Link to="/compounds/coq10-ubiquinol" className="text-[11px] px-2.5 py-1 rounded-md bg-amber-900/20 border border-amber-700/30 text-amber-300 hover:border-amber-500/50 transition-colors">CoQ10 200mg</Link></div></div>)}
        {is4Andro && (<div><div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1.5">Estrogen Management</div><div className="flex flex-wrap gap-1.5 mb-1"><Link to="/compounds/arimistane" className="text-[11px] px-2.5 py-1 rounded-md bg-blue-900/20 border border-blue-700/30 text-blue-300 hover:border-blue-500/50 transition-colors">Arimistane (have on hand)</Link></div><div className="text-[10px] text-slate-500 leading-snug">Only take if water retention, puffy/itchy nipples, or moodiness appears. Do NOT take preventatively. Estrogen is anabolic and supports mood.</div></div>)}
        {isSuppressive && (<div><div className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-1.5">PCT (Post-Cycle Therapy)</div><div className="flex flex-wrap gap-1.5"><Link to="/compounds/arimiplex" className="text-[11px] px-2.5 py-1 rounded-md bg-red-900/20 border border-red-700/30 text-red-300 hover:border-red-500/50 transition-colors">Arimiplex (4 weeks)</Link><Link to="/compounds/enclomiphene" className="text-[11px] px-2.5 py-1 rounded-md bg-red-900/20 border border-red-700/30 text-red-300 hover:border-red-500/50 transition-colors">Enclomiphene (longer cycles)</Link></div></div>)}
      </div>
    </div>
  );
}

function HalfLifeBar({ halfLife, dosageRange }) {
  if (!halfLife && !dosageRange) return null;
  return (
    <div className="grid grid-cols-2 gap-3 mb-4">
      {halfLife && (
        <div className="prohp-card p-4 border border-white/5 text-center flex flex-col items-center justify-center">
          <Clock className="w-5 h-5 text-prohp-400 mb-2" />
          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Half-life</div>
          <div className="text-lg font-bold text-slate-100">{halfLife}</div>
        </div>
      )}
      {dosageRange && (
        <div className="prohp-card p-4 border border-white/5 text-center flex flex-col items-center justify-center">
          <Beaker className="w-5 h-5 text-prohp-400 mb-2" />
          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Dose</div>
          {(() => {
            var parts = dosageRange.split(/[.!]\s+/);
            var main = parts[0] || dosageRange;
            var mgMatch = main.match(/\(([^)]+)\)/);
            var pillText = mgMatch ? main.replace(mgMatch[0], '').trim() : main;
            var mgText = mgMatch ? mgMatch[1] : null;
            var subtext = parts.length > 1 ? parts.slice(1).join('. ').trim() : null;
            return (<div><div className="text-base font-bold text-slate-100">{pillText}</div>{mgText && <div className="text-xs text-slate-400 mt-0.5">{mgText}</div>}{subtext && <div className="text-[11px] text-slate-500 mt-1 italic">{subtext}</div>}</div>);
          })()}
        </div>
      )}
    </div>
  );
}

function BloodworkCTA() {
  var ultaUrl = 'https://www.ultalabtests.com/partners/travisdillard/cart/cartshare?scl=eyJBY2NvdW50SUQiOjQ0NTA3LCJGZWVJRHMiOlsxXSwiSXRlbUlEcyI6WzQ4Miw2NzUsMzA3M10sIkl0ZW1Qcm9tb3Rpb25JRCI6bnVsbH0=#/shopping-cart';
  return (<div className="prohp-card p-5 mb-4 border border-prohp-400/15 bg-prohp-400/[0.03]"><div className="flex items-center gap-2 mb-3"><Activity className="w-4 h-4 text-prohp-400" /><span className="text-sm font-bold text-slate-200">Bloodwork</span></div><div className="grid grid-cols-3 gap-2 mb-4"><div className="bg-slate-800/60 rounded-lg p-3 text-center border border-white/5"><div className="text-[10px] font-bold text-prohp-400 uppercase tracking-wider mb-1">Before</div><div className="text-[10px] text-slate-400 leading-tight">Baseline<br/>Total T, Free T, SHBG, E2, Liver, Lipids, CBC</div></div><div className="bg-slate-800/60 rounded-lg p-3 text-center border border-white/5"><div className="text-[10px] font-bold text-yellow-400 uppercase tracking-wider mb-1">During (wk4)</div><div className="text-[10px] text-slate-400 leading-tight">Mid-cycle<br/>Same panel, compare to baseline</div></div><div className="bg-slate-800/60 rounded-lg p-3 text-center border border-white/5"><div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1">Post-PCT</div><div className="text-[10px] text-slate-400 leading-tight">4 wks after<br/>Confirm recovery</div></div></div><a href={ultaUrl} target="_blank" rel="noopener noreferrer" className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-prohp-400 to-[#00c6ff] px-5 py-3 text-sm font-bold text-white shadow-lg hover:-translate-y-0.5 transition-all"><Activity className="w-4 h-4" /> Order your bloodwork. Walk into any lab. No doctor needed.</a></div>);
}

function CycleLogCTA({ compoundName }) {
  return (<div className="prohp-card p-5 mb-4 border border-emerald-700/20 bg-emerald-900/[0.06]"><div className="text-sm font-bold text-slate-200 mb-2">Have you run {compoundName}?</div><p className="text-xs text-slate-400 mb-3">Log your cycle. We will give you in-the-trenches feedback.</p><div className="flex flex-wrap gap-3"><Link to="/cycles" className="prohp-btn-primary text-xs inline-flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" /> Start a Cycle Log</Link><Link to="/r/lab" className="text-xs text-slate-400 hover:text-prohp-400 transition-colors inline-flex items-center gap-1">Your log appears publicly in The Lab &rarr;</Link></div></div>);
}

function GateCTA({ gate_state, upgrade_cta }) {
  if (!upgrade_cta || gate_state === "member") return null;
  var isWindow = gate_state === "window";
  return (<div className="prohp-card p-6 mb-4 border border-[rgba(34,157,216,0.2)] bg-[rgba(34,157,216,0.04)]"><div className="flex items-center gap-2 mb-2"><Lock className="w-4 h-4 text-[#229DD8]" /><span className="text-sm font-bold text-slate-100">{isWindow ? "Unlock the Full Breakdown" : "Want the full breakdown?"}</span></div><p className="text-[13px] text-slate-400 leading-relaxed mb-4">{isWindow ? upgrade_cta : "Dosing protocols, stacking logic, PCT, bloodwork markers."}</p>{isWindow ? (<a href="/compounds" className="prohp-btn-primary inline-flex items-center gap-2 text-xs px-4 py-2">Enter Your Email to Unlock</a>) : (<Link to="/register" className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#0070f3] to-[#00c6ff] px-5 py-2.5 text-xs font-bold text-white shadow-lg hover:-translate-y-0.5 transition-all">Unlock Inner Circle</Link>)}</div>);
}

function DiscountSection({ compound, gate_state }) {
  if (!compound.public_discount_code || !compound.product_url) return null;
  var isSoma = (compound.product_url || '').toLowerCase().indexOf('somachem') !== -1;
  if (isSoma) { return (<div className="bg-emerald-900/20 border border-emerald-700/30 rounded-xl p-4 mt-4"><div className="flex items-center gap-2 mb-2"><span className="text-emerald-400 text-sm font-semibold">Discount Available</span></div><div className="flex items-center gap-3 flex-wrap"><code className="bg-slate-800 text-emerald-300 px-3 py-1.5 rounded-lg text-sm font-mono font-bold tracking-wider">TRAVISD</code><span className="text-slate-400 text-sm">20% off - use at checkout</span><a href={compound.product_url} target="_blank" rel="noopener noreferrer" className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 transition-colors shadow-md"><ExternalLink className="w-3.5 h-3.5" />Buy Now</a></div><p className="text-xs text-slate-500 mt-2">Apply to your order at the product page.</p></div>); }
  var now = new Date(); var mm = String(now.getUTCMonth() + 1).padStart(2, '0'); var yy = String(now.getUTCFullYear()).slice(-2); var activeMemCode = 'PROHP' + mm + yy;
  return (<div className="bg-emerald-900/20 border border-emerald-700/30 rounded-xl p-4 mt-4"><div className="flex items-center gap-2 mb-2"><span className="text-emerald-400 text-sm font-semibold">Discount Available</span></div><div className="flex items-center gap-3 flex-wrap"><code className="bg-slate-800 text-emerald-300 px-3 py-1.5 rounded-lg text-sm font-mono font-bold tracking-wider">{gate_state === 'member' ? activeMemCode : 'TRAVISD'}</code><span className="text-slate-400 text-sm">{gate_state === 'member' ? '20% off - Inner Circle exclusive' : '10% off - use at checkout'}</span><a href={compound.product_url} target="_blank" rel="noopener noreferrer" className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 transition-colors shadow-md"><ExternalLink className="w-3.5 h-3.5" />Buy Now</a></div><p className="text-xs text-slate-500 mt-2">Apply to your order at the product page.</p>{gate_state !== 'member' && (<div className="mt-2 text-[11px] text-slate-500">Inner Circle members get 20% off.</div>)}</div>);
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */
export default function CompoundDetail() {
  var { slug } = useParams();
  var { data, isLoading, error } = useQuery({ queryKey: ['compound', slug], queryFn: function() { return api.get('/api/compounds/' + slug); }, enabled: !!slug });
  var compound = data ? data.compound : null;
  var relatedThreads = data ? (data.related_threads || []) : [];
  var relatedCycles = data ? (data.related_cycles || []) : [];
  var gate_state = data ? (data.gate_state || 'window') : 'window';
  var upgrade_cta = data ? (data.upgrade_cta || '') : '';

  var user = useAuthStore(function(s) { return s.user; });
  var queryClient = useQueryClient();
  var [replyBody046, setReplyBody046] = useState("");
  var [replyTo046, setReplyTo046] = useState(null);
  var [replyError046, setReplyError046] = useState("");

  var threadQuery = useQuery({ queryKey: ["compound-thread", compound ? compound.thread_id : null], queryFn: function() { return api.get("/api/threads/" + compound.thread_id); }, enabled: !!(compound && compound.thread_id) });
  var threadData = threadQuery.data || null;
  var threadPosts = threadData ? (threadData.posts || []) : [];
  var threadPagination = threadData ? (threadData.pagination || {}) : {};

  var votePost046 = useMutation({ mutationFn: function(args) { return api.post("/api/posts/" + args.postId + "/vote", { value: args.value }); }, onSuccess: function() { queryClient.invalidateQueries({ queryKey: ["compound-thread", compound ? compound.thread_id : null] }); } });
  var createReply046 = useMutation({ mutationFn: function(payload) { return api.post("/api/posts", payload); }, onSuccess: function() { queryClient.invalidateQueries({ queryKey: ["compound-thread", compound ? compound.thread_id : null] }); setReplyBody046(""); setReplyTo046(null); setReplyError046(""); }, onError: function(err) { setReplyError046(err.message); } });
  var handleReply046 = function(e) { e.preventDefault(); if (!replyBody046.trim()) { setReplyError046("Say something."); return; } setReplyError046(""); createReply046.mutate({ thread_id: compound.thread_id, body: replyBody046.trim(), parent_id: replyTo046 || undefined }); };

  var videoId = useMemo(function() { if (!compound) return ''; return extractYouTubeId(compound.youtube_video_id) || extractYouTubeId(compound.youtube_url); }, [compound]);
  var [videoOpen, setVideoOpen] = useState(false);
  var [joinOpen, setJoinOpen] = useState(false);
  var [labelOpen, setLabelOpen] = useState(false);
  var [showAllPosts, setShowAllPosts] = useState(false);

  var searchKey = 'compoundSearchCount:' + (slug || 'x');
  var dismissKey = 'compoundBannerDismissed:' + (slug || 'x');
  var [searchCount, setSearchCountState] = useState(function() { return getSessionInt(searchKey, 0); });
  var [bannerDismissed, setBannerDismissed] = useState(function() { return getSessionInt(dismissKey, 0) === 1; });
  var abortRef = useRef(null);
  useEffect(function() { setSearchCountState(getSessionInt(searchKey, 0)); setBannerDismissed(getSessionInt(dismissKey, 0) === 1); }, [slug, searchKey, dismissKey]);
  useEffect(function() { setSessionInt(searchKey, searchCount); }, [searchKey, searchCount]);
  useEffect(function() { setSessionInt(dismissKey, bannerDismissed ? 1 : 0); }, [dismissKey, bannerDismissed]);

  var [communityStats, setCommunityStats] = useState(null);
  var [communityComments, setCommunityComments] = useState([]);
  var [showScrollTop, setShowScrollTop] = useState(false);
  useEffect(function() {
    function onScroll() { setShowScrollTop(window.scrollY > 600); }
    window.addEventListener('scroll', onScroll, { passive: true });
    return function() { window.removeEventListener('scroll', onScroll); };
  }, []);
  useEffect(function() {
    if (!compound || !compound.name) return;
    var apiBase = import.meta.env.VITE_API_URL || '';
    var encoded = encodeURIComponent(compound.name);
    Promise.all([
      fetch(apiBase + '/api/community-comments/stats?compound=' + encoded).then(function(r) { return r.ok ? r.json() : null; }).catch(function() { return null; }),
      fetch(apiBase + '/api/community-comments?compound=' + encoded + '&limit=5&sort=likes').then(function(r) { return r.ok ? r.json() : null; }).catch(function() { return null; }),
    ]).then(function(res) { setCommunityStats(res[0]); setCommunityComments(res[1] && res[1].comments ? res[1].comments : []); }).catch(function() { setCommunityStats(null); setCommunityComments([]); });
  }, [compound ? compound.name : null]);

  if (isLoading) return (<div className="animate-pulse max-w-3xl mx-auto px-4 py-6"><div className="h-8 bg-slate-800 rounded w-1/3 mb-4" /><div className="h-4 bg-slate-800/60 rounded w-2/3 mb-3" /><div className="h-40 bg-slate-800 rounded mb-4" /><div className="h-24 bg-slate-800/40 rounded" /></div>);
  if (error) return <div className="text-red-400 text-sm text-center py-12">{error.message}</div>;
  if (!compound) return <div className="text-slate-400 text-sm text-center py-12">Compound not found.</div>;

  var hasRealSummary = compound.summary && !compound.summary.toLowerCase().includes('buy it here');
  var isSuppressive = compound.risk_tier && ['moderate','high','extreme'].indexOf(compound.risk_tier.toLowerCase()) !== -1;
  var visiblePosts = showAllPosts ? threadPosts : threadPosts.slice(0, 5);
  var hasMorePosts = threadPosts.length > 5;

  /* Extract source references from dosing content for separate rendering */
  var dosingForDisplay = compound.dosing || '';
  var sourceRefMatch = dosingForDisplay.match(/SOURCE REFERENCES:\n[\s\S]*$/i);
  if (sourceRefMatch) { dosingForDisplay = dosingForDisplay.replace(sourceRefMatch[0], '').trim(); }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in px-4 py-6">
      <BackButton fallback="/compounds" label="Back to Compounds" className="sticky top-0 z-30 flex w-fit items-center gap-1.5 text-xs text-slate-500 hover:text-prohp-400 transition-colors mb-4 py-3 -mt-6 pt-6 bg-[#0f1117]" />
      <Link to="/compounds" className="fixed bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:right-8 md:translate-x-0 z-[100] inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/90 backdrop-blur-md px-5 py-3 text-sm font-semibold text-slate-200 shadow-lg transition hover:bg-slate-800 hover:border-white/20 hover:text-[#229DD8]" aria-label="Back to Encyclopedia"><ChevronLeft className="w-4 h-4" /> Encyclopedia</Link>

      {/* ═══ 1. HEADER ═══ */}
      <div className="prohp-card p-6 mb-4 relative overflow-visible">
        {/* Desktop: grid with compressed hero column */}
        <div className="hidden md:grid" style={{ gridTemplateColumns: '1fr 240px', gap: '20px', alignItems: 'start' }}>
          <div className="min-w-0">
            <h1 className="text-2xl font-extrabold tracking-tight mb-1">{compound.name}</h1>
            {compound.company && <p className="text-xs text-slate-500 mb-2">{compound.company}</p>}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {compound.risk_tier && (<span className={'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ' + riskClass(compound.risk_tier)}>Risk: {compound.risk_tier.charAt(0).toUpperCase() + compound.risk_tier.slice(1).toLowerCase()}</span>)}
              {compound.category && (<span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700/40">{compound.category}</span>)}
              {compound.legal_status && (<span className={'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ' + legalClass(compound.legal_status)}>{legalLabel(compound.legal_status)}</span>)}
              {compound.hair_loss_severity && (<span className={'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ' + hairClass(compound.hair_loss_severity)}>Hair loss: {compound.hair_loss_severity}</span>)}
            </div>
            {hasRealSummary && <ContentBlock content={compound.summary} className="text-sm text-slate-300 leading-relaxed" />}
          </div>
          {/* Hero asset wrapper: position relative, tight, no extra height */}
          {compound.slug && (
            <div className="relative flex justify-center" style={{ marginTop: '-8px', paddingBottom: '8px' }}>
              {/* Backlight */}
              <div className="absolute" style={{ width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(14,165,233,0.08) 0%, rgba(14,165,233,0.02) 40%, transparent 70%)', borderRadius: '50%', top: '50%', left: '50%', transform: 'translate(-50%, -55%)', zIndex: 0, pointerEvents: 'none' }} />
              {/* Bottle */}
              <img src={'/images/compounds/' + compound.slug + '.png'} onError={function(e) { e.target.closest('.relative.flex').style.display = 'none'; }} alt={compound.name} className="relative z-10" style={{ height: '250px', width: 'auto', maxWidth: '230px', objectFit: 'contain', filter: 'drop-shadow(0 12px 28px rgba(0,0,0,0.5)) drop-shadow(0 4px 8px rgba(0,0,0,0.25))' }} />
              {/* Anchor shadow kissing bottle base */}
              <div className="absolute z-[5]" style={{ bottom: '18px', left: '50%', transform: 'translateX(-50%)', width: '70%', height: '10px', background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%' }} />
              {/* Frosted pill button: absolute, zero height footprint */}
              {videoId && (
                <button type="button" onClick={function() { setVideoOpen(true); }} className="absolute z-20" style={{ bottom: '24px', left: '50%', transform: 'translateX(-50%)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', whiteSpace: 'nowrap', padding: '8px 22px', borderRadius: '9999px', background: 'rgba(14, 165, 233, 0.10)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', border: '1px solid rgba(14, 165, 233, 0.4)', color: '#0EA5E9', fontSize: '12px', fontWeight: '700', letterSpacing: '0.02em', textShadow: '0 0 8px rgba(14, 165, 233, 0.25)', boxShadow: '0 0 12px rgba(14,165,233,0.08), 0 2px 6px rgba(0,0,0,0.2)', cursor: 'pointer', transition: 'all 0.2s ease-in-out' }} onMouseEnter={function(e) { var s = e.currentTarget.style; s.background = '#0EA5E9'; s.color = '#0f1117'; s.textShadow = 'none'; s.transform = 'translateX(-50%) scale(1.05)'; s.boxShadow = '0 0 24px rgba(14,165,233,0.3), 0 4px 14px rgba(0,0,0,0.3)'; }} onMouseLeave={function(e) { var s = e.currentTarget.style; s.background = 'rgba(14, 165, 233, 0.10)'; s.color = '#0EA5E9'; s.textShadow = '0 0 8px rgba(14, 165, 233, 0.25)'; s.transform = 'translateX(-50%)'; s.boxShadow = '0 0 12px rgba(14,165,233,0.08), 0 2px 6px rgba(0,0,0,0.2)'; }}>
                  <Youtube className="w-3.5 h-3.5" /> Watch breakdown
                </button>
              )}
            </div>
          )}
        </div>

        {/* Mobile: stacked with hero between tags and summary */}
        <div className="md:hidden flex flex-col">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight mb-1">{compound.name}</h1>
            {compound.company && <p className="text-xs text-slate-500 mb-2">{compound.company}</p>}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {compound.risk_tier && (<span className={'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ' + riskClass(compound.risk_tier)}>Risk: {compound.risk_tier.charAt(0).toUpperCase() + compound.risk_tier.slice(1).toLowerCase()}</span>)}
              {compound.category && (<span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700/40">{compound.category}</span>)}
              {compound.legal_status && (<span className={'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ' + legalClass(compound.legal_status)}>{legalLabel(compound.legal_status)}</span>)}
              {compound.hair_loss_severity && (<span className={'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ' + hairClass(compound.hair_loss_severity)}>Hair loss: {compound.hair_loss_severity}</span>)}
            </div>
          </div>
          {compound.slug && (
            <div className="relative flex flex-col items-center my-3 pb-6">
              <div className="absolute" style={{ width: '180px', height: '180px', background: 'radial-gradient(circle, rgba(14,165,233,0.06) 0%, transparent 70%)', borderRadius: '50%', top: '50%', left: '50%', transform: 'translate(-50%, -55%)', pointerEvents: 'none' }} />
              <img src={'/images/compounds/' + compound.slug + '.png'} onError={function(e) { e.target.closest('.relative.flex').style.display = 'none'; }} alt={compound.name} className="relative z-10" style={{ height: '150px', width: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.4))' }} />
              <div style={{ width: '50%', height: '8px', marginTop: '-4px', background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.45) 0%, transparent 70%)', borderRadius: '50%' }} />
              {videoId && (
                <button type="button" onClick={function() { setVideoOpen(true); }} className="inline-flex items-center justify-center gap-2 mt-4" style={{ whiteSpace: 'nowrap', padding: '8px 22px', borderRadius: '9999px', background: 'rgba(14, 165, 233, 0.10)', backdropFilter: 'blur(14px)', border: '1px solid rgba(14, 165, 233, 0.4)', color: '#0EA5E9', fontSize: '12px', fontWeight: '700' }}>
                  <Youtube className="w-3.5 h-3.5" /> Watch breakdown
                </button>
              )}
            </div>
          )}
          {hasRealSummary && <ContentBlock content={compound.summary} className="text-sm text-slate-300 leading-relaxed" />}
        </div>

        {compound.product_url && (<div className="mt-3 pt-3 border-t border-white/5"><a href={compound.product_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-prohp-400 transition-colors"><ExternalLink className="w-3.5 h-3.5" /> Support the encyclopedia</a><DiscountSection compound={compound} gate_state={gate_state} /></div>)}
      </div>

      <Modal open={videoOpen} title={(compound.name || 'Video') + ' - Breakdown'} onClose={function() { setVideoOpen(false); }}><div className="aspect-video rounded-xl overflow-hidden bg-black/40 border border-white/10"><YouTubeEmbed videoId={videoId} title={compound.name + ' breakdown'} className="w-full h-full" /></div></Modal>
      <JoinModal open={joinOpen} onClose={function() { setJoinOpen(false); }} />
      {gate_state === "window" && <GateCTA gate_state={gate_state} upgrade_cta={upgrade_cta} />}

      {/* ═══ 2. RISK METER (animated) ═══ */}
      <RiskMeter compound={compound} />

      
      {gate_state === "window" && (
        <div className="prohp-card p-6 mb-4 border border-[rgba(34,157,216,0.2)] bg-[rgba(34,157,216,0.04)] text-center">
          <Lock className="w-5 h-5 text-[#229DD8] mx-auto mb-2" />
          <div className="text-sm font-bold text-slate-100 mb-1">See the full compound breakdown</div>
          <p className="text-[13px] text-slate-400 leading-relaxed mb-4">Benefits, mechanism, dosing protocols, side effects, bloodwork markers, and stacking logic.</p>
          <a href="/compounds" className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#0070f3] to-[#00c6ff] px-5 py-2.5 text-xs font-bold text-white shadow-lg hover:-translate-y-0.5 transition-all">Enter Your Email to Unlock</a>
        </div>
      )}

      {/* ═══ 3. HALF-LIFE BAR ═══ */}
      {gate_state === "member" && <HalfLifeBar halfLife={compound.half_life} dosageRange={compound.dosage_range} />}

      {/* ═══ 4. BENEFITS ═══ */}
      {compound.benefits && gate_state !== "window" && (
        <div className="prohp-card p-6 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <Check className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-bold text-slate-200">Benefits</span>
            <div className="flex-1 h-px bg-gradient-to-r from-emerald-700/30 to-transparent" />
          </div>
          <BenefitsRenderer content={compound.benefits} preview={gate_state === "lead"} />
        </div>
      )}

      {/* ═══ 5. MECHANISM ═══ */}
      {compound.mechanism && gate_state !== "window" && (
        <div className="prohp-card p-6 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <Beaker className="w-4 h-4 text-prohp-400" />
            <span className="text-sm font-bold text-slate-200">Mechanism</span>
            <div className="flex-1 h-px bg-gradient-to-r from-prohp-400/30 to-transparent" />
          </div>
          <MechanismRenderer content={compound.mechanism} preview={gate_state === "lead"} />
        </div>
      )}

      {/* ═══ 6. TEST BASE ═══ */}
      {gate_state === "member" && <TestBaseSection compound={compound} />}

      {/* ═══ 7. ANCILLARIES ═══ */}
      {gate_state === "member" && <AncillariesSection compound={compound} />}

      {/* ═══ 10. SIDE EFFECTS ═══ */}
      {compound.side_effects && gate_state !== "window" && (
        <div className="prohp-card p-6 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-sm font-bold text-slate-200">Side Effects</span>
            <div className="flex-1 h-px bg-gradient-to-r from-red-700/30 to-transparent" />
          </div>
          <SideEffectsRenderer content={compound.side_effects} preview={gate_state === "lead"} />
        </div>
      )}

      {/* Nutrition Label */}
      {gate_state === "member" && compound.nutrition_label_url && (<div className="prohp-card p-6 mb-4"><div className="text-sm font-semibold text-slate-200 mb-2">Supplement Facts</div><img src={compound.nutrition_label_url} alt={(compound.name || "Supplement") + " supplement facts"} className="rounded-xl max-h-64 object-contain mx-auto cursor-pointer hover:opacity-80 transition-opacity" onClick={function() { setLabelOpen(true); }} /><div className="mt-2 text-[11px] text-slate-500 text-center">Click to enlarge</div></div>)}
      {gate_state === "member" && compound.nutrition_label_url && (<Modal open={labelOpen} title={(compound.name || "Supplement") + " - Supplement Facts"} onClose={function() { setLabelOpen(false); }}><div className="flex items-center justify-center p-4"><img src={compound.nutrition_label_url} alt={(compound.name || "Supplement") + " supplement facts"} className="max-w-full max-h-[80vh] object-contain" /></div></Modal>)}

      {compound.hair_loss_explanation && (<div className="text-xs text-slate-400 italic mb-4 px-1">Hair loss note: {compound.hair_loss_explanation}</div>)}


      {gate_state !== "window" && <TestimonialWall />}

      {gate_state === "lead" && (
        <div className="prohp-card p-8 mb-4 border border-[rgba(34,157,216,0.25)] text-center" style={{ background: 'linear-gradient(180deg, rgba(14,165,233,0.06) 0%, rgba(14,165,233,0.02) 100%)' }}>
          <Lock className="w-6 h-6 text-[#229DD8] mx-auto mb-3" />
          <h3 className="text-lg font-extrabold text-slate-100 mb-2">Unlock the Complete Protocol</h3>
          <p className="text-sm text-slate-400 leading-relaxed mb-4 max-w-md mx-auto">You know the benefits. You know the risks. Now get the exact week-by-week dosing, mandatory PCT, stacking logic, and bloodwork markers to run {compound.name} safely.</p>
          <div className="flex flex-wrap justify-center gap-2 mb-5 text-[11px] text-slate-500">
            <span className="px-3 py-1 rounded-full bg-slate-800/60 border border-white/5">Dosing protocols</span>
            <span className="px-3 py-1 rounded-full bg-slate-800/60 border border-white/5">Stacking logic</span>
            <span className="px-3 py-1 rounded-full bg-slate-800/60 border border-white/5">PCT timelines</span>
            <span className="px-3 py-1 rounded-full bg-slate-800/60 border border-white/5">Bloodwork panels</span>
            <span className="px-3 py-1 rounded-full bg-slate-800/60 border border-white/5">Ancillary stacks</span>
          </div>
          <Link to="/register" className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#0070f3] to-[#00c6ff] px-8 py-3 text-sm font-bold text-white shadow-lg hover:-translate-y-0.5 transition-all">Unlock Inner Circle &mdash; $19/mo</Link>
          <div className="mt-3 text-[11px] text-slate-500">First 1,000 members get a permanent Founding Member badge.</div>
        </div>
      )}

      {/* ═══ 8. VIDEO ═══ */}
      {videoId && (<div className="prohp-card p-5 mb-4"><div className="flex items-center gap-2 mb-3"><Youtube className="w-4 h-4 text-red-500" /><span className="text-sm font-semibold text-slate-200">{compound.name} - Video Breakdown</span></div><div className="aspect-video rounded-lg overflow-hidden bg-black/30 border border-white/5"><YouTubeEmbed videoId={videoId} title={compound.name + ' breakdown'} className="w-full h-full" /></div></div>)}

      
      

      {/* ═══ 9. DOSING ═══ */}
      {compound.dosing && gate_state === "member" && (
        <div className="prohp-card p-6 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-4 h-4 text-prohp-400" />
            <span className="text-sm font-bold text-slate-200">Dosing Protocol</span>
            <div className="flex-1 h-px bg-gradient-to-r from-prohp-400/30 to-transparent" />
          </div>
          <DosingRenderer content={dosingForDisplay} />
        </div>
      )}

      {gate_state === "member" && compound.article_content && (<div className="prohp-card p-6 mb-4"><div className="text-sm font-semibold text-slate-200 mb-2">Full Breakdown</div><ContentBlock content={compound.article_content} /></div>)}
      
      {/* ═══ 11. SOURCE REFERENCES ═══ */}
      {gate_state === "member" && <SourceReferences content={compound.dosing} />}

      {/* ═══ 12. BLOODWORK ═══ */}
      {gate_state === "member" && isSuppressive && <BloodworkCTA />}

      {/* ═══ 13. CYCLE LOG ═══ */}
      {gate_state === "member" && <CycleLogCTA compoundName={compound.name} />}

      {!videoId && compound && (<div className="prohp-card p-5 mb-4 border border-prohp-400/20 bg-prohp-400/[0.04] text-center"><div className="text-sm font-semibold text-slate-200 mb-2">This compound has not been covered yet.</div><p className="text-xs text-slate-400 mb-3">Want Travis to break it down? Drop a comment below and let him know.</p><button onClick={function() { var el = document.getElementById('community-discussion'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }} className="prohp-btn-primary text-xs">Request Coverage</button></div>)}

      {/* ═══ 14. SEARCH ═══ */}
      <div className="mb-8">{compound && (<GrepGate excludeSlug={compound.slug || ""} autoQuery={compound.name} title={'Questions about ' + compound.name + '?'} />)}</div>

      {/* ═══ 15. COMMUNITY DISCUSSION ═══ */}
      {compound && compound.thread_id && (
        <div id="community-discussion" className="prohp-card p-6 mb-4">
          <div className="flex items-center justify-between mb-4"><div className="flex items-center gap-2"><MessageSquare className="w-4 h-4 text-prohp-400" /><div className="text-sm font-semibold text-slate-200">Community Discussion<span className="text-slate-500 font-normal ml-1.5">({threadPagination.total || 0} {threadPagination.total === 1 ? "reply" : "replies"})</span></div></div><Link to={"/t/" + compound.thread_id} className="text-xs text-prohp-400 hover:text-prohp-300 transition-colors">View full discussion &rarr;</Link></div>
          {threadQuery.isLoading ? (<div className="animate-pulse"><div className="h-16 bg-slate-800 rounded mb-2" /><div className="h-16 bg-slate-800 rounded mb-2" /><div className="h-16 bg-slate-800 rounded" /></div>
          ) : threadQuery.error ? (<div className="text-center py-4"><p className="text-xs text-slate-500">Discussion temporarily unavailable.</p><Link to={"/t/" + compound.thread_id} className="text-xs text-prohp-400 hover:text-prohp-300">View thread directly &rarr;</Link></div>
          ) : visiblePosts.length > 0 ? (
            <div className="flex flex-col gap-1.5 mb-4">
              {visiblePosts.map(function(post) { return (<div key={post.id} className={"prohp-card px-4 py-3 " + (post.is_best_answer ? "border-l-2 border-l-emerald-500/50 bg-emerald-500/[0.03] " : "") + (post.parent_id ? "ml-8 border-l-2 border-l-slate-800/50" : "")}><div className="flex items-start gap-3"><div className="flex flex-col items-center gap-0.5 min-w-[28px]"><button onClick={function() { user && votePost046.mutate({ postId: post.id, value: 1 }); }} className={"p-0.5 transition-colors " + (!user ? "opacity-40 cursor-default" : "cursor-pointer") + " " + (post.user_vote === 1 ? "text-prohp-400" : "text-slate-600 hover:text-prohp-400")} disabled={!user}><ArrowUp className="w-3.5 h-3.5" /></button><span className={"text-[11px] font-bold font-mono " + (post.score > 0 ? "text-prohp-400" : post.score < 0 ? "text-red-400" : "text-slate-500")}>{post.score}</span><button onClick={function() { user && votePost046.mutate({ postId: post.id, value: -1 }); }} className={"p-0.5 transition-colors " + (!user ? "opacity-40 cursor-default" : "cursor-pointer") + " " + (post.user_vote === -1 ? "text-red-400" : "text-slate-600 hover:text-red-400")} disabled={!user}><ArrowDown className="w-3.5 h-3.5" /></button></div><div className="flex-1 min-w-0">{post.is_best_answer && (<div className="flex items-center gap-1.5 mb-2 text-emerald-400 text-xs font-bold"><CheckCircle className="w-3.5 h-3.5" /> Verdict</div>)}<MarkdownRenderer content={post.body} className="text-sm text-slate-300 leading-relaxed mb-2" /><div className="flex items-center gap-3 text-[11px] text-slate-500 flex-wrap"><Link to={"/u/" + post.author_username} className="font-medium text-slate-400 hover:text-prohp-400 hover:underline transition-colors">{post.author_username}</Link>{post.author_founding && <span className="tier-badge tier-founding text-[8px] py-0">FM</span>}<span>{new Date(post.created_at).toLocaleDateString()}</span>{gate_state === "member" && user && (<button onClick={function() { setReplyTo046(post.id); var el = document.getElementById("reply-box-046"); if (el) el.focus(); }} className="flex items-center gap-1 text-slate-500 hover:text-prohp-400 transition-colors ml-auto"><CornerDownRight className="w-3 h-3" /> Reply</button>)}</div></div></div></div>); })}
              {hasMorePosts && !showAllPosts && (<button onClick={function() { setShowAllPosts(true); }} className="text-xs text-prohp-400 hover:text-prohp-300 transition-colors py-2 text-center">Show all {threadPosts.length} replies &darr;</button>)}
            </div>
          ) : (<div className="text-center py-6"><MessageSquare className="w-5 h-5 text-slate-600 mx-auto mb-2" /><p className="text-xs text-slate-400">No replies yet. Be the first to share your experience.</p></div>)}
          {user && gate_state === "member" ? (<div className="border-t border-white/[0.04] pt-4">{replyTo046 && (<div className="flex items-center gap-2 mb-2 text-xs text-slate-500"><CornerDownRight className="w-3 h-3" /><span>Replying to a post</span><button type="button" onClick={function() { setReplyTo046(null); }} className="text-slate-500 hover:text-slate-300 ml-1">cancel</button></div>)}<textarea id="reply-box-046" value={replyBody046} onChange={function(e) { setReplyBody046(e.target.value); }} placeholder="Drop your experience, ask your question..." className="prohp-input min-h-[80px] resize-y mb-3 text-sm" rows={3} />{replyError046 && <div className="text-xs text-red-400 mb-2">{replyError046}</div>}<div className="flex items-center justify-between"><p className="text-[10px] text-slate-600">Receipts appreciated. Proof over hype.</p><button type="submit" onClick={handleReply046} disabled={createReply046.isPending} className="prohp-btn-primary text-xs">{createReply046.isPending ? "Posting..." : "Post Reply"}</button></div></div>) : null}
        </div>
      )}

      {/* ═══ 17. COMMUNITY INTEL ═══ */}
      {communityStats && communityStats.total > 0 && gate_state !== "window" && (<div className="prohp-card p-6 mb-4 border border-prohp-400/15 bg-prohp-400/[0.03]"><h3 className="text-sm font-bold text-prohp-400 mb-4 flex items-center gap-2"><Shield className="w-4 h-4" /> Community Intel</h3><div className="flex gap-3 flex-wrap mb-4"><div className="bg-prohp-400/10 rounded-lg px-3 py-2"><span className="text-[10px] text-slate-400 block">Total Reports</span><div className="text-lg font-bold text-white">{communityStats.total}</div></div>{communityStats.with_side_effects > 0 && (<div className="bg-red-900/20 rounded-lg px-3 py-2"><span className="text-[10px] text-slate-400 block">Side Effect Reports</span><div className="text-lg font-bold text-red-400">{communityStats.with_side_effects}</div></div>)}</div>{communityStats.top_side_effects && communityStats.top_side_effects.length > 0 && (<div className="flex gap-2 flex-wrap mb-4">{communityStats.top_side_effects.slice(0, 6).map(function(se, i) { return (<span key={i} className="bg-red-900/15 border border-red-700/25 rounded-full px-3 py-1 text-[11px] text-red-400">{se.effect} ({se.count})</span>); })}</div>)}{user && (user.tier === 'inner_circle' || user.tier === 'admin' || user.role === 'admin') ? (<div>{communityComments.length > 0 && (<div className="flex flex-col gap-2 mt-3"><h4 className="text-xs font-semibold text-slate-400">Top Community Comments</h4>{communityComments.map(function(c, i) { return (<div key={c.id || i} className="bg-white/[0.03] rounded-lg p-3 border border-white/5"><div className="text-[13px] text-slate-300 leading-relaxed mb-2">{c.content && c.content.length > 280 ? c.content.slice(0, 280) + '...' : c.content}</div><div className="flex justify-between text-[11px] text-slate-500"><span>{c.author || 'Anonymous'}</span><span className="text-prohp-400">{c.likes || 0} likes</span></div></div>); })}</div>)}</div>) : (<div className="text-center pt-3 border-t border-white/5"><p className="text-xs text-slate-400 mb-3">Unlock full community intel: top comments, dosage patterns, and detailed reports</p><Link to="/register" className="prohp-btn-primary text-xs px-4 py-2">Unlock Community Intel</Link></div>)}</div>)}

      {/* ═══ 16. RELATED ═══ */}
      <div className="prohp-card p-6 mb-4"><div className="flex items-center justify-between mb-3"><div className="flex items-center gap-2"><MessageSquare className="w-4 h-4 text-slate-400" /><div className="text-sm font-semibold text-slate-200">Related Threads</div></div><Link to="/rooms/library" className="text-xs text-slate-500 hover:text-prohp-400 transition-colors">Library</Link></div>{relatedThreads.length ? (<div className="flex flex-col gap-2">{relatedThreads.map(function(t) { return (<Link key={t.id} to={'/t/' + t.id} className="prohp-card p-3 hover:bg-slate-800/40 transition-colors"><div className="text-[13px] font-semibold text-slate-200">{t.title}</div><div className="mt-1 text-[11px] text-slate-500">{t.reply_count} replies</div></Link>); })}</div>) : (<div className="text-sm text-slate-400">No related threads yet.</div>)}</div>
      {relatedCycles.length > 0 && (<div className="prohp-card p-6 mb-4"><div className="text-sm font-semibold text-slate-200 mb-3">Related Cycles</div><div className="flex flex-col gap-2">{relatedCycles.map(function(c) { return (<div key={c.id} className="prohp-card p-3"><div className="text-[13px] font-semibold text-slate-200">{c.title}</div><div className="mt-1 text-[12px] text-slate-400">{c.status ? 'Status: ' + c.status : ''}{c.duration_weeks ? ' - ' + c.duration_weeks + ' weeks' : ''}</div></div>); })}</div></div>)}

      {/* ═══ 18. FOOTER ═══ */}
      <div className="text-center py-6 mb-8"><div className="text-sm font-bold text-slate-300 mb-1">Proof Over Hype.</div><div className="text-xs text-slate-500">Track your bloodwork. Trust your body. Adjust accordingly.</div></div>
      {showScrollTop && (<button onClick={function() { window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="fixed z-[90] w-12 h-12 rounded-full bg-slate-800/90 backdrop-blur-sm border border-white/10 text-slate-400 hover:text-prohp-400 hover:border-prohp-400/30 transition-all shadow-lg flex items-center justify-center" style={{ bottom: '28px', right: '16px' }} aria-label="Back to top"><ArrowUp className="w-5 h-5" /></button>)}
    </div>
  );
}
