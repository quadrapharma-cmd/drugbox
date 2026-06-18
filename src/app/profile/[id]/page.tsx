'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import AppShell from '@/components/layout/AppShell'

const FLAGS: Record<string,string> = {EG:'🇪🇬',CN:'🇨🇳',IN:'🇮🇳',AE:'🇦🇪',SA:'🇸🇦',US:'🇺🇸',GB:'🇬🇧',DE:'🇩🇪',JO:'🇯🇴'}
const TYPE_CFG: Record<string,string> = {supply:'lt-s',demand:'lt-d',service:'lt-sv',license:'lt-l',equipment:'lt-e',cmo:'lt-c',job:'lt-j',training:'lt-t'}

export default function ProfilePage() {
  const params = useParams()
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [me, setMe] = useState<any>(null)
  const [posts, setPosts] = useState(0)
  const [connections, setConnections] = useState(0)
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<any>({})

  const ini = (n:string) => n?.split(' ').map((w:string)=>w[0]).slice(0,2).join('').toUpperCase()||'?'

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data: meData } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setMe(meData)

      const uid = params.id === 'me' ? user.id : params.id as string

      const { data: p } = await supabase.from('profiles').select('*').eq('id', uid).single()
      if (!p) { setLoading(false); return }
      setProfile(p)
      setForm(p)

      const { count: pc } = await supabase.from('posts').select('id',{count:'exact',head:true}).eq('user_id', uid)
      setPosts(pc||0)

      const { count: cc } = await supabase.from('connections').select('id',{count:'exact',head:true}).eq('status','accepted').or(`requester.eq.${uid},addressee.eq.${uid}`)
      setConnections(cc||0)

      const { data: ld } = await supabase.from('listings').select('id,type,title,emoji').eq('user_id', uid).limit(6)
      setListings(ld||[])

      setLoading(false)
    }
    load()
  }, [params.id, router])

  async function saveProfile() {
    const updates = {
      name: form.name, headline: form.headline, company: form.company,
      country: form.country, bio: form.bio, certs: form.certs,
      website: form.website, phone: form.phone,
      specs: typeof form.specs === 'string' ? form.specs.split(/[,،]/).map((s:string)=>s.trim()).filter(Boolean) : form.specs
    }
    await supabase.from('profiles').update(updates).eq('id', profile.id)
    setProfile({...profile, ...updates})
    setEditing(false)
  }

  async function connect() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('connections').insert({requester: user.id, addressee: profile.id, status: 'pending'})
    alert('Connection request sent!')
  }

  if (loading) return <AppShell><div className="flex items-center justify-center h-64 text-gray-400">Loading...</div></AppShell>
  if (!profile) return <AppShell><div className="flex items-center justify-center h-64 text-gray-400">Profile not found</div></AppShell>

  const isMe = me?.id === profile.id

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto">
        {/* Cover + Avatar */}
        <div className="card overflow-hidden mb-4">
          <div className="h-32 rounded-t-2xl" style={{background:'linear-gradient(120deg,#2D6BE4,#2A9D8F)'}} />
          <div className="px-6 pb-6">
            <div className="flex justify-between items-end flex-wrap gap-3 -mt-10">
              <div className="w-20 h-20 rounded-2xl border-4 border-white flex items-center justify-center text-white text-2xl font-black shadow-lg flex-shrink-0"
                style={{background: profile.avatar_color||'#2D6BE4'}}>
                {ini(profile.name)}
              </div>
              <div className="flex gap-2 mb-1">
                {isMe ? (
                  <button onClick={()=>setEditing(true)} className="h-9 px-4 rounded-xl text-sm font-bold border" style={{borderColor:'#E4E9F1',color:'#0B1B3A',background:'white'}}>
                    ✏️ Edit Profile
                  </button>
                ) : (
                  <>
                    <button onClick={connect} className="h-9 px-4 rounded-xl text-sm font-bold text-white" style={{background:'#2D6BE4'}}>🤝 Connect</button>
                    <button className="h-9 px-4 rounded-xl text-sm font-bold border" style={{borderColor:'#E4E9F1'}}>💬 Message</button>
                  </>
                )}
              </div>
            </div>

            <div className="mt-3">
              <div className="text-xl font-black flex items-center gap-2" style={{color:'#0F1B2E'}}>
                {profile.name}
                {profile.verified && <span style={{color:'#2D6BE4',fontSize:14}}>✓</span>}
              </div>
              <div className="text-sm mt-0.5" style={{color:'#5B6A82'}}>
                {FLAGS[profile.country]||'🌍'} {profile.headline}{profile.company && ` · ${profile.company}`}
              </div>
              {profile.specs?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {profile.specs.map((s:string) => (
                    <span key={s} className="px-2 py-0.5 rounded-lg text-xs font-semibold" style={{background:'#EBF2FF',color:'#1f5bd6'}}>{s}</span>
                  ))}
                </div>
              )}
              <div className="flex gap-5 mt-4">
                {[['Posts',posts],['Connections',connections],['Listings',listings.length]].map(([l,n])=>(
                  <div key={l as string}><div className="text-lg font-black" style={{color:'#0B1B3A'}}>{n}</div><div className="text-xs" style={{color:'#5B6A82'}}>{l}</div></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* About */}
          <div className="card p-5">
            <div className="font-bold text-sm mb-3" style={{color:'#0B1B3A'}}>About</div>
            <p className="text-sm leading-relaxed" style={{color:'#5B6A82'}}>{profile.bio||'No bio added yet.'}</p>
          </div>

          {/* Details */}
          <div className="card p-5">
            <div className="font-bold text-sm mb-3" style={{color:'#0B1B3A'}}>Details</div>
            <div className="space-y-3">
              {[
                ['🏢', 'Company', profile.company],
                ['🌐', 'Website', profile.website],
                ['📞', 'Phone', profile.phone],
                ['🏆', 'Certifications', profile.certs],
              ].filter(([,,v])=>v).map(([ic,l,v])=>(
                <div key={l as string} className="flex gap-3 items-center">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm" style={{background:'#EBF2FF'}}>{ic}</div>
                  <div><div className="text-xs" style={{color:'#5B6A82'}}>{l}</div><div className="text-sm font-semibold">{v}</div></div>
                </div>
              ))}
              {!profile.company && !profile.website && !profile.phone && !profile.certs &&
                <div className="text-sm" style={{color:'#5B6A82'}}>No details yet.</div>}
            </div>
          </div>
        </div>

        {/* Listings */}
        {listings.length > 0 && (
          <div className="card p-5 mt-4">
            <div className="font-bold text-sm mb-3" style={{color:'#0B1B3A'}}>My Listings ({listings.length})</div>
            <div className="space-y-2">
              {listings.map(l => (
                <div key={l.id} className="flex items-center gap-3 py-2 border-b last:border-0" style={{borderColor:'#E4E9F1'}}>
                  <span className="text-xl">{l.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{l.title}</div>
                    <span className={`lt ${TYPE_CFG[l.type]||'lt-s'}`}>{l.type}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:'rgba(0,0,0,0.5)'}}>
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-4 sticky top-0 bg-white" style={{borderBottom:'1px solid #E4E9F1'}}>
              <h3 className="font-black">Edit Profile</h3>
              <button onClick={()=>setEditing(false)} className="text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">×</button>
            </div>
            <div className="p-4 space-y-3">
              {[
                ['name','Name'],['headline','Specialty'],['company','Company'],
                ['website','Website'],['phone','Phone'],['certs','Certifications'],
              ].map(([k,l]) => (
                <div key={k}>
                  <label className="block text-xs font-bold mb-1">{l}</label>
                  <input value={form[k]||''} onChange={e=>setForm((f:any)=>({...f,[k]:e.target.value}))}
                    className="w-full h-10 rounded-xl px-3 text-sm outline-none" style={{border:'1.5px solid #E4E9F1',background:'#fafbfd'}} />
                </div>
              ))}
              <div>
                <label className="block text-xs font-bold mb-1">Bio</label>
                <textarea value={form.bio||''} onChange={e=>setForm((f:any)=>({...f,bio:e.target.value}))} rows={3}
                  className="w-full rounded-xl p-3 text-sm outline-none resize-none" style={{border:'1.5px solid #E4E9F1',background:'#fafbfd'}} />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Specialties (comma separated)</label>
                <input value={Array.isArray(form.specs)?form.specs.join(', '):form.specs||''} onChange={e=>setForm((f:any)=>({...f,specs:e.target.value}))}
                  placeholder="QA/QC, Regulatory..." className="w-full h-10 rounded-xl px-3 text-sm outline-none" style={{border:'1.5px solid #E4E9F1',background:'#fafbfd'}} />
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={saveProfile} className="flex-1 h-11 rounded-xl text-white font-bold" style={{background:'#2D6BE4'}}>Save Changes</button>
                <button onClick={()=>setEditing(false)} className="flex-1 h-11 rounded-xl font-bold border" style={{borderColor:'#E4E9F1'}}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  )
}
// Thu Jun 18 15:15:37 UTC 2026
