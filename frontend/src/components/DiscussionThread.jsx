import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp, ArrowDown, CheckCircle, CornerDownRight, MessageSquare } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';

const buildTree = (flatPosts) => {
  const map = {};
  const roots = [];
  (flatPosts || []).forEach(p => { map[p.id] = { ...p, children: [] }; });
  (flatPosts || []).forEach(p => {
    if (p.parent_id && map[p.parent_id]) {
      map[p.parent_id].children.push(map[p.id]);
    } else {
      roots.push(map[p.id]);
    }
  });
  return roots;
};

function PostNode({ post, depth, user, gateMember, onVote, onReply }) {
  const maxIndent = Math.min(depth * 4, 12);
  const indent = depth > 0 ? ("ml-" + maxIndent) : "";
  const border = depth > 0 ? " border-l-2 border-l-slate-800/50" : "";
  const best = post.is_best_answer ? "border-l-2 border-l-emerald-500/50 bg-emerald-500/[0.03] " : "";
  return (
    <div>
      <div className={"prohp-card px-4 py-3 " + best + indent + border}>
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center gap-0.5 min-w-[28px]">
            <button onClick={() => user && onVote(post.id, 1)}
              className={"p-0.5 transition-colors " + (!user ? "opacity-40 cursor-default" : "cursor-pointer") + " " + (post.user_vote === 1 ? "text-prohp-400" : "text-slate-600 hover:text-prohp-400")}
              disabled={!user}><ArrowUp className="w-3.5 h-3.5" /></button>
            <span className={"text-[11px] font-bold font-mono " + (post.score > 0 ? "text-prohp-400" : post.score < 0 ? "text-red-400" : "text-slate-500")}>{post.score}</span>
            <button onClick={() => user && onVote(post.id, -1)}
              className={"p-0.5 transition-colors " + (!user ? "opacity-40 cursor-default" : "cursor-pointer") + " " + (post.user_vote === -1 ? "text-red-400" : "text-slate-600 hover:text-red-400")}
              disabled={!user}><ArrowDown className="w-3.5 h-3.5" /></button>
          </div>
          <div className="flex-1 min-w-0">
            {post.is_best_answer && (<div className="flex items-center gap-1.5 mb-2 text-emerald-400 text-xs font-bold"><CheckCircle className="w-3.5 h-3.5" /> Verdict</div>)}
            <MarkdownRenderer content={post.body} className="text-sm text-slate-300 leading-relaxed mb-2" />
            <div className="flex items-center gap-3 text-[11px] text-slate-500 flex-wrap">
              <Link to={"/u/" + post.author_username} className="font-medium text-slate-400 hover:text-prohp-400 hover:underline transition-colors">{post.author_username}</Link>
              {post.author_founding && <span className="tier-badge tier-founding text-[8px] py-0">FM</span>}
              <span>{new Date(post.created_at).toLocaleDateString()}</span>
              {gateMember && user && (<button onClick={() => onReply(post.id)} className="flex items-center gap-1 text-slate-500 hover:text-prohp-400 transition-colors ml-auto"><CornerDownRight className="w-3 h-3" /> Reply</button>)}
            </div>
          </div>
        </div>
      </div>
      {depth < 3 && post.children && post.children.map(child => (<PostNode key={child.id} post={child} depth={depth + 1} user={user} gateMember={gateMember} onVote={onVote} onReply={onReply} />))}
    </div>
  );
}

export default function DiscussionThread({ compound, threadPosts, threadData, user, gateState, votePostMutation, setReplyTo, replyTo, replyBody, setReplyBody, replyError, createReply }) {
  const postTree = buildTree(threadPosts);
  const gateMember = gateState === "member";
  const handleVote = (postId, value) => { if (votePostMutation) votePostMutation.mutate({ postId, value }); };
  const handleReply = (postId) => { setReplyTo(postId); const el = document.getElementById("reply-box-disc"); if (el) el.focus(); };
  const handleSubmitReply = (e) => { e.preventDefault(); if (!replyBody.trim()) return; createReply.mutate({ thread_id: compound.thread_id, body: replyBody, parent_id: replyTo || null }); };
  return (
    <div id="community-discussion" className="prohp-card p-6 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-prohp-400" />
          <div className="text-sm font-semibold text-slate-200">Community Discussion</div>
        </div>
        {threadData && (<Link to={"/t/" + compound.thread_id} className="text-xs text-prohp-400 hover:text-prohp-300 transition-colors">View thread directly &rarr;</Link>)}
      </div>
      {threadPosts.length === 0 ? (
        <div className="text-center py-6">
          <MessageSquare className="w-5 h-5 text-slate-600 mx-auto mb-2" />
          <p className="text-xs text-slate-400">No discussion yet. Start one.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5 mb-4">
          {postTree.map(node => (<PostNode key={node.id} post={node} depth={0} user={user} gateMember={gateMember} onVote={handleVote} onReply={handleReply} />))}
        </div>
      )}
      {gateMember && user && (
        <form onSubmit={handleSubmitReply} className="border-t border-white/[0.04] pt-4 mt-2">
          {replyTo && (<div className="flex items-center gap-2 mb-2 text-xs text-slate-500"><CornerDownRight className="w-3 h-3" /><span>Replying to a post</span><button type="button" onClick={() => setReplyTo(null)} className="text-slate-500 hover:text-slate-300 ml-1">cancel</button></div>)}
          <textarea id="reply-box-disc" value={replyBody} onChange={(e) => setReplyBody(e.target.value)} placeholder="Drop your experience, ask your question..." className="prohp-input min-h-[80px] resize-y mb-3 text-sm w-full" rows={3} />
          {replyError && <div className="text-xs text-red-400 mb-2">{replyError}</div>}
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-slate-600">Receipts appreciated. Proof over hype.</p>
            <button type="submit" disabled={createReply.isPending} className="prohp-btn-primary text-xs">{createReply.isPending ? 'Posting...' : 'Post Reply'}</button>
          </div>
        </form>
      )}
    </div>
  );
}
