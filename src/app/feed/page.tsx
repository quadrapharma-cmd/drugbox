'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import AppShell from '@/components/layout/AppShell'
import type { Post, Profile } from '@/types'

const CATS: Record<string, {label:string, cls:string}> = {
  general:{label:'General',cls:'pill-gr'}, regulatory:{label:'Regulatory',cls:'pill-b'},
  market:{label:'Market',cls:'pill-t'}, innovation:{label:'Innovation',cls:'pill-p'},
  question:{label:'Question',cls:'pill-o'}, job:{label:'Job',cls:'pill-g'}
}

function PostCard({ post, me, onDelete }: { post: Post & {author?: Profile}, me: Profile | null, onDelete: (id:string)=>void }) {
  const [likes, setLikes] = useState(0)
  const [comments, setComments] = useState(0)
  const [showCmts, setShowCmts] = useState(false)
  const [cmtList, setCmtList] = useState<any[]>([])
  const [cmtText, setCmtText] = useState('')
  const cat = CATS[post.category] || CATS.general
  const ini = (n:string) => n?.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase() || '?'

  useEffect(() => {
    supabase.from('likes').select('id',{count:'exact',head:true}).eq('post_id',post.id).then(({count})=>setLikes(count||0))
    supabase.from('comments').select('id',{count:'exact',head:true}).eq('post_id',post.id).then(({count})=>setComments(count||0))
  },[post.id])

  async function toggleLike() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('likes').select('id').eq('post_id',post.id).eq('user_id',user.id)
    if (data?.length) { await supabase.from('likes').delete().eq('post_id',post.id).eq('user_id',user.id); setLikes(l=>l-1) }
    else { await supabase.from('likes').insert({post_id:post.id,user_id:user.id,kind:'like'}); setLikes(l=>l+1) }
  }

  async function loadComments() {
    const { data } = await supabase.from('comments').select('*,author:profiles(id,name,avatar_color)').eq('post_id',post.id).order('created_at')
    setCmtList(data||[])
  }

  async function addComment() {
    if (!cmtText.trim()) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('comments').insert({post_id:post.id,user_id:user.id,body:cmtText.trim()})
    setCmtText(''); setComments(c=>c+1); loadComments()
  }

  const timeAgo = (ts: string) => { const s=(Date.now()-new Date(ts).getTime())/1000; if(s<3600)return Math.floor(s/60)+'m'; if(s<86400)return Math.floor(s/3600)+'h'; return Math.floor(s/86400)+'d' }
  const author = post.author

  return (
    <div className="card p-4 mb-3">
      <div className="flex gap-2 items-start mb-3">
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{background:author?.avatar_color||'#2D6BE4'}}>{ini(author?.name||'?')}</div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm">{author?.name} {author?.verified && <span className="text-blue-500 text-xs">✓</span>}</div>
          <div className="text-xs" style={{color:'#5B6A82'}}>{author?.headline}{author?.company && ` · ${author.company}`} · {timeAgo(post.created_at)}</div>
        </div>
        <span className={`pill ${cat.cls} flex-shrink-0`}>{cat.label}</span>
        {me?.id === post.user_id && <button onClick={()=>onDelete(post.id)} className="text-xs opacity-40 hover:opacity-100 ml-1">🗑</button>}
      </div>
      <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{color:'#0F1B2E'}}>{post.body}</p>
      <div className="flex gap-1 mt-3 pt-3" style={{borderTop:'1px solid #E4E9F1'}}>
        <button onClick={toggleLike} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-gray-50" style={{color:'#5B6A82'}}>👍 {likes}</button>
        <button onClick={()=>{setShowCmts(!showCmts);if(!showCmts)loadComments()}} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-gray-50" style={{color:'#5B6A82'}}>💬 {comments}</button>
      </div>
      {showCmts && (
        <div className="mt-3 pt-3" style={{borderTop:'1px solid #E4E9F1'}}>
          {cmtList.map(c => (
            <div key={c.id} className="flex gap-2 mb-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{background:c.author?.avatar_color||'#2D6BE4'}}>{ini(c.author?.name||'?')}</div>
              <div className="flex-1 rounded-xl px-3 py-2 text-sm" style={{background:'#F4F6FB'}}><span className="font-bold">{c.author?.name}</span> {c.body}</div>
            </div>
          ))}
          <div className="flex gap-2 mt-2">
            <input value={cmtText} onChange={e=>setCmtText(e.target.value)} placeholder="Add a comment..." onKeyDown={e=>e.key==='Enter'&&addComment()}
              className="flex-1 h-8 rounded-full px-4 text-sm outline-none" style={{background:'#F4F6FB',border:'1.5px solid #E4E9F1'}} />
            <button onClick={addComment} className="px-3 h-8 rounded-full text-white text-xs font-bold" style={{background:'#2D6BE4'}}>Send</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function FeedPage() {
  const [posts, setPosts] = useState<(Post & {author?: Profile})[]>([])
  const [me, setMe] = useState<Profile | null>(null)
  const [body, setBody] = useState('')
  const [category, setCategory] = useState('general')
  const [loading, setLoading] = useState(true)
  const [trending, setTrending] = useState<any[]>([])

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) { const { data } = await supabase.from('profiles').select('*').eq('id',user.id).single(); if(data) setMe(data) }
      const { data: postsData } = await supabase.from('posts').select('*').order('created_at',{ascending:false}).limit(50)
      if (postsData) {
        const uids = [...new Set(postsData.map(p=>p.user_id))]
        const { data: profiles } = await supabase.from('profiles').select('id,name,headline,company,avatar_color,country,verified').in('id', uids)
        const profileMap: Record<string, Profile> = {}
        profiles?.forEach(p => profileMap[p.id] = p)
        setPosts(postsData.map(p => ({...p, author: profileMap[p.user_id]})))
      }
      const { data: listingsData } = await supabase.from('listings').select('id,type,title,emoji').order('created_at',{ascending:false}).limit(5)
      setTrending(listingsData||[])
      setLoading(false)
    }
    load()

    // Realtime new posts
    const channel = supabase.channel('posts').on('postgres_changes',{event:'INSERT',schema:'public',table:'posts'},async payload => {
      const { data: author } = await supabase.from('profiles').select('*').eq('id',payload.new.user_id).single()
      setPosts(prev => [{...payload.new as Post, author: author||undefined}, ...prev])
    }).subscribe()
    return () => { supabase.removeChannel(channel) }
  },[])

  async function submitPost() {
    if (!body.trim()) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('posts').insert({user_id:user.id,body:body.trim(),category}).select().single()
    if (data) { setPosts(prev => [{...data,author:me||undefined},...prev]); setBody('') }
  }

  async function deletePost(id: string) {
    if (!confirm('Delete this post?')) return
    await supabase.from('posts').delete().eq('id',id)
    setPosts(prev => prev.filter(p=>p.id!==id))
  }

  const TYPE_COLORS: Record<string,string> = {supply:'lt-s',demand:'lt-d',service:'lt-sv',license:'lt-l',equipment:'lt-e',cmo:'lt-c',job:'lt-j',training:'lt-t'}

  return (
    <AppShell>
      <div className="grid lg:grid-cols-[1fr_260px] gap-4">
        <div>
          {/* Composer */}
          <div className="card p-4 mb-4">
            <div className="flex gap-2">
              {me && <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{background:me.avatar_color||'#2D6BE4'}}>{me.name?.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase()}</div>}
              <textarea value={body} onChange={e=>setBody(e.target.value)} placeholder="Share an update, ask a question..." rows={2}
                className="flex-1 rounded-xl p-3 text-sm outline-none resize-none" style={{border:'1.5px solid #E4E9F1',background:'#fafbfd'}}
                onFocus={e=>(e.target as HTMLTextAreaElement).rows=4} />
            </div>
            <div className="flex items-center justify-between mt-3 pt-3" style={{borderTop:'1px solid #E4E9F1'}}>
              <select value={category} onChange={e=>setCategory(e.target.value)}
                className="h-8 rounded-lg px-2 text-xs font-semibold outline-none" style={{border:'1.5px solid #E4E9F1',background:'#fafbfd',color:'#0B1B3A'}}>
                {Object.entries(CATS).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
              <button onClick={submitPost} className="h-8 px-4 rounded-lg text-white text-xs font-bold" style={{background:'#2D6BE4'}}>✉️ Post</button>
            </div>
          </div>
          {/* Posts */}
          {loading ? <div className="text-center py-10 text-gray-400">Loading...</div> :
           posts.length ? posts.map(p => <PostCard key={p.id} post={p} me={me} onDelete={deletePost} />) :
           <div className="text-center py-10 text-gray-400">No posts yet. Be the first!</div>}
        </div>
        {/* Sidebar */}
        <div className="hidden lg:block space-y-4">
          <div className="card p-4">
            <div className="font-bold text-sm mb-3" style={{color:'#0B1B3A'}}>🔥 Recent Listings</div>
            {trending.map(l => (
              <div key={l.id} className="flex items-center gap-2 py-2 cursor-pointer hover:bg-gray-50 rounded-lg px-1">
                <span className="text-lg">{l.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold truncate">{l.title}</div>
                  <span className={`lt ${TYPE_COLORS[l.type]||'lt-s'}`}>{l.type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
