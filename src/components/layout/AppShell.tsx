'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types'

const NAV = [
  { id:'feed', label:'Feed', icon:'🏠', href:'/feed' },
  { id:'market', label:'Marketplace', icon:'🛒', href:'/market' },
  { id:'messages', label:'Messages', icon:'💬', href:'/messages' },
  { id:'network', label:'Network', icon:'🤝', href:'/network' },
  { id:'groups', label:'Groups', icon:'👥', href:'/groups' },
  { id:'jobs', label:'Jobs', icon:'💼', href:'/jobs' },
  { id:'training', label:'Training', icon:'🎓', href:'/training' },
  { id:'profile', label:'My Profile', icon:'👤', href:'/profile/me' },
]

const TICKER = ['⚗️ Supply: Metformin HCl GMP – $5.80/kg','🔍 Demand: Ciprofloxacin HCl – 2MT/month','📋 EDA Cosmetic Registration For Sale','🏭 Contract Mfg – WHO-GMP','💼 Job: Senior RA Specialist – Egypt','🌍 GCC Registration – All 6 States','⚙️ Fette 1200 Tablet Press – $45K','💧 Hyaluronic Acid – $180/kg']

export default function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [unreadMsg, setUnreadMsg] = useState(0)
  const [pendingConn, setPendingConn] = useState(0)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/auth/login'); return }
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) setProfile(data)
      // Badges
      const { count: mc } = await supabase.from('messages').select('id', {count:'exact',head:true}).eq('receiver_id', user.id).eq('read', false)
      setUnreadMsg(mc || 0)
      const { count: pc } = await supabase.from('connections').select('id', {count:'exact',head:true}).eq('addressee', user.id).eq('status', 'pending')
      setPendingConn(pc || 0)
    })
  }, [router])

  async function logout() {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const ini = (name: string) => name?.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase() || '?'
  const curPage = pathname?.split('/')[1] || 'feed'

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className={`fixed top-0 bottom-0 left-0 w-[252px] bg-white z-50 flex flex-col transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
        style={{borderRight:'1.5px solid #E4E9F1'}}>
        <div className="p-4 flex justify-center" style={{borderBottom:'1px solid #E4E9F1'}}>
          <div className="text-2xl font-black" style={{color:'#2D6BE4'}}>DRUGBOX</div>
        </div>
        <nav className="flex-1 p-2 overflow-y-auto">
          {NAV.map(item => (
            <Link key={item.id} href={item.href} onClick={()=>setSidebarOpen(false)}
              className={`nav-item mb-1 ${curPage === item.id ? 'active' : ''}`}>
              <span className="w-5 text-center">{item.icon}</span>
              <span>{item.label}</span>
              {item.id==='messages' && unreadMsg > 0 && <span className="ml-auto text-xs font-bold px-1.5 py-0.5 rounded-full text-white" style={{background:'#EF4444'}}>{unreadMsg}</span>}
              {item.id==='network' && pendingConn > 0 && <span className="ml-auto text-xs font-bold px-1.5 py-0.5 rounded-full text-white" style={{background:'#EF4444'}}>{pendingConn}</span>}
            </Link>
          ))}
        </nav>
        {profile && (
          <div className="p-2" style={{borderTop:'1px solid #E4E9F1'}}>
            <Link href="/profile/me" className="flex items-center gap-2 p-2 rounded-xl hover:bg-gray-50 cursor-pointer">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{background: profile.avatar_color || '#2D6BE4'}}>
                {ini(profile.name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">{profile.name}</div>
                <div className="text-xs truncate" style={{color:'#5B6A82'}}>{profile.headline || profile.company || 'Member'}</div>
              </div>
              <button onClick={e=>{e.preventDefault();logout()}} className="text-sm opacity-50 hover:opacity-100">⎋</button>
            </Link>
          </div>
        )}
      </aside>

      {/* Overlay mobile */}
      {sidebarOpen && <div className="fixed inset-0 z-40 lg:hidden" style={{background:'rgba(0,0,0,0.4)'}} onClick={()=>setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 lg:ml-[252px] flex flex-col min-w-0">
        {/* Ticker */}
        <div className="overflow-hidden whitespace-nowrap py-1.5 px-4 text-xs text-white flex gap-3" style={{background:'linear-gradient(90deg,#0B1B3A,#13294D)'}}>
          <span className="font-bold flex-shrink-0" style={{color:'#60A5FA'}}>🔴 LIVE</span>
          <div className="overflow-hidden flex-1">
            <span className="inline-block animate-[marquee_30s_linear_infinite]">
              {TICKER.concat(TICKER).map((t,i) => <span key={i} className="mx-7">{t}</span>)}
            </span>
          </div>
        </div>

        {/* Topbar */}
        <header className="h-14 sticky top-0 z-40 flex items-center gap-3 px-4" style={{background:'rgba(255,255,255,0.93)',backdropFilter:'blur(12px)',borderBottom:'1.5px solid #E4E9F1'}}>
          <button className="lg:hidden text-xl" onClick={()=>setSidebarOpen(true)}>☰</button>
          <div className="text-lg font-black lg:hidden" style={{color:'#2D6BE4'}}>DRUGBOX</div>
          <div className="flex-1 max-w-md relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30 text-sm">🔍</span>
            <input placeholder="Search people, products, materials..." className="w-full h-9 rounded-xl pl-8 pr-3 text-sm outline-none" style={{background:'#F4F6FB',border:'1.5px solid #E4E9F1'}}
              onKeyDown={e => { if(e.key==='Enter') router.push('/search?q='+(e.target as HTMLInputElement).value) }} />
          </div>
          <div className="ml-auto flex items-center gap-1">
            <Link href="/messages" className="w-9 h-9 rounded-lg flex items-center justify-center relative hover:bg-gray-100">
              💬 {unreadMsg > 0 && <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full text-white flex items-center justify-center text-[9px] font-bold" style={{background:'#EF4444'}}>{unreadMsg}</span>}
            </Link>
            <Link href="/network" className="w-9 h-9 rounded-lg flex items-center justify-center relative hover:bg-gray-100">
              🤝 {pendingConn > 0 && <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full text-white flex items-center justify-center text-[9px] font-bold" style={{background:'#EF4444'}}>{pendingConn}</span>}
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 pb-20 lg:pb-6 max-w-5xl mx-auto w-full">
          {children}
        </main>

        {/* Bottom nav mobile */}
        <nav className="fixed bottom-0 left-0 right-0 lg:hidden h-14 bg-white flex items-center justify-around z-50" style={{borderTop:'1.5px solid #E4E9F1'}}>
          {['feed','market','messages','network','profile'].map(id => {
            const item = NAV.find(n=>n.id===id)!
            return (
              <Link key={id} href={item.href} className={`flex flex-col items-center gap-0.5 flex-1 py-1 text-xs font-bold ${curPage===id ? 'text-blue-600' : 'text-gray-400'}`}>
                <span className="text-xl leading-none">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
