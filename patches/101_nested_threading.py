"""STAGE 101 — ThreadPage.jsx nested comment threading."""

src = open('/home/travisd/prohp-forum/frontend/src/pages/ThreadPage.jsx', 'r').read()
open('/home/travisd/prohp-forum/frontend/src/pages/ThreadPage.jsx.bak.101', 'w').write(src)

# The current rendering is a flat posts.map with ml-8 for parent_id.
# We need to: 1) build a tree from flat posts, 2) render recursively with increasing indent.

# Find the flat map block and replace with tree-based rendering
old_block = """{posts.map((post) => (                      <div key={post.id} className={`prohp-card px-4 py-3 ${post.is_best_answer ? 'border-l-2 border-l-emerald-500/50 bg-emerald-500/[0.03]' : ''} ${post.parent_id ? 'ml-8 border-l-2 border-l-slate-800/50' : ''}`}"""

# Build the replacement: add a buildTree helper + recursive render
# Insert helper function before the return statement
helper = """
  // STAGE_101: Build nested tree from flat posts
  const buildTree = (flatPosts) => {
    const map = {};
    const roots = [];
    flatPosts.forEach(p => { map[p.id] = { ...p, children: [] }; });
    flatPosts.forEach(p => {
      if (p.parent_id && map[p.parent_id]) {
        map[p.parent_id].children.push(map[p.id]);
      } else {
        roots.push(map[p.id]);
      }
    });
    return roots;
  };
  const postTree = buildTree(posts);

"""

# Insert before "return ("
old_return = "return (          <div"
new_return = helper + "return (          <div"
src = src.replace(old_return, new_return, 1)

# Now replace the flat indent logic with depth-based indent
# Change: ${post.parent_id ? 'ml-8 border-l-2 border-l-slate-800/50' : ''}
# To use a renderPost function that accepts depth

# We need to extract the entire post card JSX and wrap it in a recursive function.
# Since the file is one line, we find the posts.map block and replace it.

old_map_start = "{posts.map((post) => ("
old_map_end = "))}                    {posts.length === 0"

# Get everything between these markers
start_idx = src.index(old_map_start)
end_idx = src.index(old_map_end)
old_post_block = src[start_idx:end_idx]

# Build new recursive renderer
new_post_block = """{postTree.map((post) => renderPost(post, 0))}                    {posts.length === 0"""

# We need to add renderPost function. Insert it right after buildTree.
render_fn = """
  const renderPost = (post, depth) => {
    const indent = depth > 0 ? `ml-${Math.min(depth * 6, 24)}` : '';
    const borderClass = depth > 0 ? 'border-l-2 border-l-slate-800/50' : '';
    return (
      <div key={post.id}>
        <div className={`prohp-card px-4 py-3 ${post.is_best_answer ? 'border-l-2 border-l-emerald-500/50 bg-emerald-500/[0.03]' : ''} ${indent} ${borderClass}`}>
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center gap-0.5 min-w-[28px]">
              <button onClick={() => user && votePost.mutate({ postId: post.id, value: 1 })} className={`p-0.5 transition-colors ${!user ? 'opacity-40 cursor-default' : 'cursor-pointer'} ${post.user_vote === 1 ? 'text-prohp-400' : 'text-slate-600 hover:text-prohp-400'}`} disabled={!user}><ArrowUp className="w-3.5 h-3.5" /></button>
              <span className={`text-[11px] font-bold font-mono ${post.score > 0 ? 'text-prohp-400' : post.score < 0 ? 'text-red-400' : 'text-slate-500'}`}>{post.score}</span>
              <button onClick={() => user && votePost.mutate({ postId: post.id, value: -1 })} className={`p-0.5 transition-colors ${!user ? 'opacity-40 cursor-default' : 'cursor-pointer'} ${post.user_vote === -1 ? 'text-red-400' : 'text-slate-600 hover:text-red-400'}`} disabled={!user}><ArrowDown className="w-3.5 h-3.5" /></button>
            </div>
            <div className="flex-1 min-w-0">
              {post.is_best_answer && (<div className="flex items-center gap-1.5 mb-2 text-emerald-400 text-xs font-bold"><CheckCircle className="w-3.5 h-3.5" /> Verdict</div>)}
              <MarkdownRenderer content={post.body} className="text-sm text-slate-300 leading-relaxed mb-2" />
              <div className="flex items-center gap-3 text-[11px] text-slate-500 flex-wrap">
                <Link to={`/u/${post.author_username}`} className="font-medium text-slate-400 hover:text-prohp-400 hover:underline transition-colors">{post.author_username}</Link>
                {post.author_founding && <span className="tier-badge tier-founding text-[8px] py-0">FM</span>}
                <span>{new Date(post.created_at).toLocaleDateString()}</span>
                {user && !thread.is_locked && (<button onClick={() => { setReplyTo(post.id); document.getElementById('reply-box')?.focus(); }} className="flex items-center gap-1 text-slate-500 hover:text-prohp-400 transition-colors ml-auto"><CornerDownRight className="w-3 h-3" /> Reply</button>)}
                {(isThreadAuthor || isAdmin) && (<button onClick={() => markVerdict.mutate({ postId: post.id })} className={`flex items-center gap-1 transition-colors ${post.is_best_answer ? 'text-emerald-400 hover:text-emerald-300' : 'text-slate-500 hover:text-emerald-400'}`} title={post.is_best_answer ? 'Unmark Verdict' : 'Mark Verdict'}><Award className="w-3 h-3" /> {post.is_best_answer ? 'Unmark Verdict' : 'Mark Verdict'}</button>)}
              </div>
            </div>
          </div>
        </div>
        {post.children && post.children.length > 0 && (
          <div className="flex flex-col gap-1.5 mt-1.5">
            {post.children.map((child) => renderPost(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

"""

# Insert renderPost after the buildTree block
src = src.replace("const postTree = buildTree(posts);\n", "const postTree = buildTree(posts);\n" + render_fn, 1)

# Replace the flat map with tree map
src = src.replace(old_post_block, new_post_block, 1)

open('/home/travisd/prohp-forum/frontend/src/pages/ThreadPage.jsx', 'w').write(src)
print("STAGE 101 PATCHED: ThreadPage.jsx nested threading")
