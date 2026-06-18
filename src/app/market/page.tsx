'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import AppShell from '@/components/layout/AppShell'

const TYPE_CFG: Record<string,{cls:string,color:string}> = {
  supply:{cls:'lt-s',color:'#15803D'},demand:{cls:'lt-d',color:'#C2410C'},
  service:{cls:'lt-sv',color:'#6D28D9'},license:{cls:'lt-l',color:'#B45309'},
  equipment:{cls:'lt-e',color:'#BE123C'},cmo:{cls:'lt-c',color:'#065F46'},
  job:{cls:'lt-j',color:'#1D4ED8'},training:{cls:'lt-t',color:'#5B21B6'}
}
const TYPES = ['all','supply','demand','service','license','equipment','cmo','job','training']
const SECTORS = ['all','pharma','cosmetics','supplements','devices','packaging','regulatory']
const FLAGS: Record<string,string> = {EG:'🇪🇬',CN:'🇨🇳',IN:'🇮🇳',AE:'🇦🇪',SA:'🇸🇦',US:'🇺🇸',GB:'🇬🇧',DE:'🇩🇪'}

export default function MarketPage() {
  const [listings, setListings] = useState<any[]>([])
  const [type, setType] = useState('all')
  const [sector, setSector] = useState('all')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({type:'supply',sector:'pharma',title:'',description:'',emoji:'📦',price:'',moq:'',certs:'',tag:''})
  const [selected, setSelected] = useState<any>(null)

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await supabase.from('listings').select('*,seller:profiles(id,name,company,avatar_color,country,verified)').order('created_at',{ascending:false}).limit(80)
    setListings(data||[]); setLoading(false)
  }

  const filtered = listings.filter(l => (type==='all'||l.type===type) && (sector==='all'||l.sector===sector))

  async function submit() {
    if (!form.title || !form.description) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('listings').insert({...form,user_id:user.id})
    setShowModal(false); setForm({type:'supply',sector:'pharma',title:'',description:'',emoji:'📦',price:'',moq:'',certs:'',tag:''}); load()
  }

  return (
    <AppShell>
      <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
        <div><h1 className="text-xl font-black" style={{color:'#0F1B2E'}}>🛒 Marketplace</h1><p className="text-sm" style={{color:'#5B6A82'}}>Supply & Demand — materials, licenses, equipment, services</p></div>
        <button onClick={()=>setShowModal(true)} className="h-9 px-4 rounded-xl text-white text-sm font-bold" style={{background:'#2D6BE4'}}>+ Add Listing</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-4">
        {['supply','demand','license','cmo','equipment','training'].map(t => (
          <div key={t} className="card p-3 text-center">
            <div className="text-lg font-black" style={{color:TYPE_CFG[t]?.color||'#2D6BE4'}}>{listings.filter(l=>l.type===t).length}</div>
            <div className="text-xs" style={{color:'#5B6A82'}}>{t}</div>
          </div>
        ))}
      </div>

      {/* Type filter */}
      <div className="flex gap-2 flex-wrap mb-3">
        {TYPES.map(t => <button key={t} onClick={()=>setType(t)} className={`h-8 px-3 rounded-full text-xs font-bold border transition-colors ${type===t ? 'text-white border-transparent' : 'bg-white'}`} style={{borderColor: type===t?'transparent':'#E4E9F1', background: type===t?'#2D6BE4':'white', color: type===t?'white':'#5B6A82'}}>{t==='all'?'All':t}</button>)}
      </div>
      {/* Sector filter */}
      <div className="flex gap-2 flex-wrap mb-4">
        {SECTORS.map(s => <button key={s} onClick={()=>setSector(s)} className={`h-7 px-3 rounded-lg text-xs font-semibold border transition-colors`} style={{background:sector===s?'#EBF2FF':'#F4F6FB',color:sector===s?'#1f5bd6':'#5B6A82',borderColor:sector===s?'#2D6BE4':'#E4E9F1'}}>{s==='all'?'All Sectors':s}</button>)}
      </div>

      {loading ? <div className="text-center py-10 text-gray-400">Loading...</div> : (
        <div className="grid md:grid-cols-2 gap-3">
          {filtered.map(l => {
            const tc = TYPE_CFG[l.type]||{cls:'lt-s',color:'#15803D'}
            const u = l.seller||{}
            return (
              <div key={l.id} className="card listing-card" style={{borderLeftColor:tc.color}} onClick={()=>setSelected(l)}>
                <div className="p-4">
                  <div className="flex gap-3 items-start">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{background:'linear-gradient(135deg,#EBF2FF,#DCE8FB)'}}>{l.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`lt ${tc.cls}`}>{l.type}</span>
                        {l.tag && <span className="pill pill-gr text-[10px]">{l.tag}</span>}
                        {l.certs && <span className="pill pill-b text-[10px]">✓ {l.certs}</span>}
                      </div>
                      <div className="font-bold text-sm leading-tight mb-1">{l.title}</div>
                      <div className="text-xs line-clamp-2" style={{color:'#5B6A82'}}>{l.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3" style={{borderTop:'1px solid #E4E9F1'}}>
                    <div>{l.price && <div className="font-black text-base" style={{color:'#0B1B3A'}}>{l.price}</div>}{l.moq && <div className="text-xs" style={{color:'#5B6A82'}}>MOQ: {l.moq}</div>}</div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold" style={{background:u.avatar_color||'#2D6BE4'}}>{u.name?.split(' ').map((w:string)=>w[0]).join('').slice(0,2)}</div>
                      <div className="text-xs font-semibold">{u.name} {u.verified&&'✓'} {FLAGS[u.country]||''}</div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add listing modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:'rgba(0,0,0,0.5)'}}>
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-4" style={{borderBottom:'1px solid #E4E9F1'}}>
              <h3 className="font-black">Add New Listing</h3>
              <button onClick={()=>setShowModal(false)} className="text-xl">×</button>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex gap-2 flex-wrap">
                {TYPES.filter(t=>t!=='all').map(t => <button key={t} onClick={()=>setForm(f=>({...f,type:t}))} className={`px-3 py-1 rounded-lg text-xs font-bold border ${form.type===t?'text-white border-transparent':'bg-white'}`} style={{background:form.type===t?'#2D6BE4':'',borderColor:'#E4E9F1'}}>{t}</button>)}
              </div>
              {[['title','Title *'],['description','Description *'],['price','Price'],['moq','MOQ'],['certs','Certifications'],['tag','Tag']].map(([k,l]) => (
                <div key={k}>
                  <label className="block text-xs font-bold mb-1">{l}</label>
                  {k==='description' ? <textarea value={(form as any)[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} className="w-full rounded-xl p-2 text-sm outline-none h-20" style={{border:'1.5px solid #E4E9F1',background:'#fafbfd'}} /> :
                  <input value={(form as any)[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} className="w-full h-10 rounded-xl px-3 text-sm outline-none" style={{border:'1.5px solid #E4E9F1',background:'#fafbfd'}} />}
                </div>
              ))}
              <button onClick={submit} className="w-full h-11 rounded-xl text-white font-bold" style={{background:'#2D6BE4'}}>✅ Publish Listing</button>
            </div>
          </div>
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:'rgba(0,0,0,0.5)'}}>
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-4" style={{borderBottom:'1px solid #E4E9F1'}}>
              <h3 className="font-black">{selected.title}</h3>
              <button onClick={()=>setSelected(null)} className="text-xl">×</button>
            </div>
            <div className="p-4">
              <div className="text-center mb-4"><div className="text-5xl mb-2">{selected.emoji}</div>
              {selected.price && <div className="text-xl font-black" style={{color:'#16A34A'}}>{selected.price}</div>}
              {selected.moq && <div className="text-sm" style={{color:'#5B6A82'}}>MOQ: {selected.moq}</div>}</div>
              <div className="rounded-xl p-3 mb-4 text-sm leading-relaxed" style={{background:'#F4F6FB'}}>{selected.description}</div>
              <button className="w-full h-11 rounded-xl text-white font-bold" style={{background:'#2D6BE4'}} onClick={()=>setSelected(null)}>✉️ Contact Seller</button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  )
}
