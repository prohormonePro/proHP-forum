#!/bin/bash
# STAGE_046b: Compound Discussion Thread Pipe
# Surgical patch for CompoundDetail.jsx
# Adds inline thread discussion below GrepGate, before Related Threads
# Anchor: E3592DC3

set -e
FILE="$HOME/prohp-forum/frontend/src/pages/CompoundDetail.jsx"
cp "$FILE" "$FILE.bak_046b"

# === PATCH 1: Add imports ===
# Add useMutation + useQueryClient to tanstack import
sed -i "s|import { useQuery } from '@tanstack/react-query';|import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';|" "$FILE"

# Add ArrowUp, ArrowDown, CornerDownRight, CheckCircle, Award to lucide import
sed -i "s|import { ChevronLeft, MessageSquare, Search, X, AlertTriangle, Youtube, Lock, ExternalLink } from 'lucide-react';|import { ChevronLeft, MessageSquare, Search, X, AlertTriangle, Youtube, Lock, ExternalLink, ArrowUp, ArrowDown, CornerDownRight, CheckCircle, Award } from 'lucide-react';|" "$FILE"

# Add useAuthStore import after UpgradeButton import
sed -i "/import UpgradeButton from '..\/components\/UpgradeButton';/a import useAuthStore from '../stores/auth';" "$FILE"

# === PATCH 2: Add thread query + state after line 229 (after upgrade_cta) ===
# We insert after "var upgrade_cta = data ? (data.upgrade_cta || '') : '';"
sed -i '/var upgrade_cta = data ? (data.upgrade_cta/a\
\
    // --- STAGE_046b: Compound Discussion Thread ---\
    var user = useAuthStore(function(s) { return s.user; });\
    var queryClient = useQueryClient();\
    var [replyBody046, setReplyBody046] = useState("");\
    var [replyTo046, setReplyTo046] = useState(null);\
    var [replyError046, setReplyError046] = useState("");\
\
    var threadQuery = useQuery({\
      queryKey: ["compound-thread", compound ? compound.thread_id : null],\
      queryFn: function() { return api.get("/api/threads/" + compound.thread_id); },\
      enabled: !!(compound && compound.thread_id),\
    });\
\
    var threadData = threadQuery.data || null;\
    var threadPosts = threadData ? (threadData.posts || []) : [];\
    var threadPagination = threadData ? (threadData.pagination || {}) : {};\
\
    var votePost046 = useMutation({\
      mutationFn: function(args) { return api.post("/api/posts/" + args.postId + "/vote", { value: args.value }); },\
      onSuccess: function() { queryClient.invalidateQueries({ queryKey: ["compound-thread", compound ? compound.thread_id : null] }); },\
    });\
\
    var createReply046 = useMutation({\
      mutationFn: function(payload) { return api.post("/api/posts", payload); },\
      onSuccess: function() {\
        queryClient.invalidateQueries({ queryKey: ["compound-thread", compound ? compound.thread_id : null] });\
        setReplyBody046("");\
        setReplyTo046(null);\
        setReplyError046("");\
      },\
      onError: function(err) { setReplyError046(err.message); },\
    });\
\
    var handleReply046 = function(e) {\
      e.preventDefault();\
      if (!replyBody046.trim()) { setReplyError046("Say something."); return; }\
      setReplyError046("");\
      createReply046.mutate({\
        thread_id: compound.thread_id,\
        body: replyBody046.trim(),\
        parent_id: replyTo046 || undefined,\
      });\
    };\
    // --- /STAGE_046b ---' "$FILE"

# === PATCH 3: Add discussion render block ===
# Insert BEFORE the Related Threads section (line with "prohp-card p-6 mb-4" that has MessageSquare)
# We target the line: <div className="prohp-card p-6 mb-4">
# that contains the Related Threads header
sed -i '/<div className="prohp-card p-6 mb-4">/,/Related Threads/ {
  /Related Threads/ {
    # We found the right block. Insert BEFORE the parent div.
  }
}' "$FILE"

# Actually, let's use a more reliable anchor: the exact line with "Related Threads"
# Insert the discussion block BEFORE line 519 (<div className="prohp-card p-6 mb-4">)
# which is right after the GrepGate closing </div> at line 517

sed -i '/<\/div>\s*$/N; /mb-12/,/<div className="prohp-card p-6 mb-4">/ {
}' "$FILE"

echo "Patch 1-2 applied (imports + query). Now applying render block..."

# For the render block, use python for reliable multi-line insertion
python3 << 'PYEOF'
import re

filepath = "/home/travisd/prohp-forum/frontend/src/pages/CompoundDetail.jsx" if __import__('os').path.exists("/home/travisd/prohp-forum/frontend/src/pages/CompoundDetail.jsx") else None
# Actually we're running on srv2 as travisd
import os
home = os.path.expanduser("~")
filepath = os.path.join(home, "prohp-forum/frontend/src/pages/CompoundDetail.jsx")

with open(filepath, 'r') as f:
    content = f.read()

# The render block to insert
render_block = '''
        {/* --- STAGE_046b: Community Discussion Thread --- */}
        {compound && compound.thread_id && (
          <div className="prohp-card p-6 mb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-prohp-400" />
                <div className="text-sm font-semibold text-slate-200">
                  Community Discussion
                  <span className="text-slate-500 font-normal ml-1.5">
                    ({threadPagination.total || 0} {threadPagination.total === 1 ? "reply" : "replies"})
                  </span>
                </div>
              </div>
              <Link to={"/t/" + compound.thread_id} className="text-xs text-prohp-400 hover:text-prohp-300 transition-colors">
                View full discussion &rarr;
              </Link>
            </div>

            {threadQuery.isLoading ? (
              <div className="animate-pulse">
                <div className="h-16 bg-slate-800 rounded mb-2" />
                <div className="h-16 bg-slate-800 rounded mb-2" />
                <div className="h-16 bg-slate-800 rounded" />
              </div>
            ) : threadPosts.length > 0 ? (
              <div className="flex flex-col gap-1.5 mb-4">
                {threadPosts.map(function(post) {
                  return (
                    <div key={post.id} className={"prohp-card px-4 py-3 " + (post.is_best_answer ? "border-l-2 border-l-emerald-500/50 bg-emerald-500/[0.03] " : "") + (post.parent_id ? "ml-8 border-l-2 border-l-slate-800/50" : "")}>
                      <div className="flex items-start gap-3">
                        <div className="flex flex-col items-center gap-0.5 min-w-[28px]">
                          <button
                            onClick={function() { user && votePost046.mutate({ postId: post.id, value: 1 }); }}
                            className={"p-0.5 transition-colors " + (!user ? "opacity-40 cursor-default" : "cursor-pointer") + " " + (post.user_vote === 1 ? "text-prohp-400" : "text-slate-600 hover:text-prohp-400")}
                            disabled={!user}
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <span className={"text-[11px] font-bold font-mono " + (post.score > 0 ? "text-prohp-400" : post.score < 0 ? "text-red-400" : "text-slate-500")}>{post.score}</span>
                          <button
                            onClick={function() { user && votePost046.mutate({ postId: post.id, value: -1 }); }}
                            className={"p-0.5 transition-colors " + (!user ? "opacity-40 cursor-default" : "cursor-pointer") + " " + (post.user_vote === -1 ? "text-red-400" : "text-slate-600 hover:text-red-400")}
                            disabled={!user}
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="flex-1 min-w-0">
                          {post.is_best_answer && (
                            <div className="flex items-center gap-1.5 mb-2 text-emerald-400 text-xs font-bold">
                              <CheckCircle className="w-3.5 h-3.5" /> Verdict
                            </div>
                          )}
                          <MarkdownRenderer content={post.body} className="text-sm text-slate-300 leading-relaxed mb-2" />
                          <div className="flex items-center gap-3 text-[11px] text-slate-500 flex-wrap">
                            <Link to={"/u/" + post.author_username} className="font-medium text-slate-400 hover:text-prohp-400 hover:underline transition-colors">{post.author_username}</Link>
                            {post.author_founding && <span className="tier-badge tier-founding text-[8px] py-0">FM</span>}
                            <span>{new Date(post.created_at).toLocaleDateString()}</span>
                            {user && (
                              <button onClick={function() { setReplyTo046(post.id); var el = document.getElementById("reply-box-046"); if (el) el.focus(); }} className="flex items-center gap-1 text-slate-500 hover:text-prohp-400 transition-colors ml-auto">
                                <CornerDownRight className="w-3 h-3" /> Reply
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6">
                <MessageSquare className="w-5 h-5 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400">No replies yet. Be the first to share your experience.</p>
              </div>
            )}

            {user ? (
              <form onSubmit={handleReply046} className="border-t border-white/[0.04] pt-4">
                {replyTo046 && (
                  <div className="flex items-center gap-2 mb-2 text-xs text-slate-500">
                    <CornerDownRight className="w-3 h-3" />
                    <span>Replying to a post</span>
                    <button type="button" onClick={function() { setReplyTo046(null); }} className="text-slate-500 hover:text-slate-300 ml-1">cancel</button>
                  </div>
                )}
                <textarea id="reply-box-046" value={replyBody046} onChange={function(e) { setReplyBody046(e.target.value); }} placeholder="Drop your experience, ask your question..." className="prohp-input min-h-[80px] resize-y mb-3 text-sm" rows={3} />
                {replyError046 && <div className="text-xs text-red-400 mb-2">{replyError046}</div>}
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-slate-600">Receipts appreciated. Proof over hype.</p>
                  <button type="submit" disabled={createReply046.isPending} className="prohp-btn-primary text-xs">
                    {createReply046.isPending ? "Posting..." : "Post Reply"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="border-t border-white/[0.04] pt-4 text-center">
                <p className="text-xs text-slate-400">
                  <Link to="/login" className="text-prohp-400 hover:text-prohp-300">Log in</Link> to join the conversation.
                </p>
              </div>
            )}
          </div>
        )}
        {/* --- /STAGE_046b --- */}
'''

# Find the insertion point: right before the Related Threads section
# The Related Threads section starts with: <div className="prohp-card p-6 mb-4">
# followed by: Related Threads
# We need to find the SPECIFIC one (not the article content one which also has prohp-card p-6 mb-4)

# Look for the pattern with MessageSquare and "Related Threads"
marker = '        <div className="prohp-card p-6 mb-4">\n          <div className="flex items-center justify-between mb-3">\n            <div className="flex items-center gap-2">\n              <MessageSquare className="w-4 h-4 text-slate-400" />\n              <div className="text-sm font-semibold text-slate-200">Related Threads</div>'

if marker in content:
    content = content.replace(marker, render_block + "\n" + marker)
    with open(filepath, 'w') as f:
        f.write(content)
    print("PATCH 3 APPLIED: Discussion render block inserted before Related Threads")
else:
    # Try a simpler marker
    simple_marker = '<MessageSquare className="w-4 h-4 text-slate-400" />\n              <div className="text-sm font-semibold text-slate-200">Related Threads</div>'
    if simple_marker in content:
        # Find the parent div and insert before it
        # Go back to find the opening <div className="prohp-card p-6 mb-4">
        idx = content.index(simple_marker)
        # Search backward for the opening div
        search_back = content[:idx].rfind('<div className="prohp-card p-6 mb-4">')
        if search_back >= 0:
            content = content[:search_back] + render_block + "\n" + content[search_back:]
            with open(filepath, 'w') as f:
                f.write(content)
            print("PATCH 3 APPLIED (method 2): Discussion render block inserted before Related Threads")
        else:
            print("ERROR: Could not find Related Threads parent div")
    else:
        print("ERROR: Could not find Related Threads marker")
        print("Looking for alternatives...")
        if "Related Threads" in content:
            print("Found 'Related Threads' in file but marker pattern didn't match")
            # Show context
            idx = content.index("Related Threads")
            print("Context:", repr(content[idx-200:idx+50]))
        else:
            print("'Related Threads' not found in file at all")

PYEOF

echo ""
echo "=== VERIFICATION ==="
grep -n "STAGE_046b" "$FILE"
grep -c "useAuthStore" "$FILE"
grep -c "compound-thread" "$FILE"
echo "=== DONE ==="
