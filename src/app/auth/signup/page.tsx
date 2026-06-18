'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const COLORS = ['#0F7A63','#7A5680','#0E8C66','#A24B57','#B0883F','#246C8E']

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name:'', headline:'', company:'', sector:'pharma', country:'EG', email:'', password:'' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k: string, v: string) => setForm(f => ({...f, [k]:v}))

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (form.password.length < 6) { setError('Password min 6 characters'); return }
    setLoading(true); setError('')
    const color = COLORS[Math.floor(Math.random()*COLORS.length)]
    const { error } = await supabase.auth.signUp({
      email: form.email, password: form.password,
      options: { data: { name:form.name, headline:form.headline, company:form.company, sector:form.sector, country:form.country, avatar_color:color } }
    })
    if (error) { setError(error.message); setLoading(false) }
    else router.push('/feed')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-white">
      <div className="w-full max-w-md">
        <div className="text-2xl font-black mb-1" style={{color:'#2D6BE4'}}>DRUGBOX</div>
        <h2 className="text-xl font-bold mb-1" style={{color:'#0F1B2E'}}>Create your account</h2>
        <p className="text-sm mb-5" style={{color:'#5B6A82'}}>Join the pharma professional network</p>
        {error && <div className="mb-4 p-3 rounded-lg text-sm" style={{background:'#FEF2F2',color:'#B91C1C',border:'1px solid #FCA5A5'}}>{error}</div>}
        <form onSubmit={handleSignup} className="space-y-3">
          {[['name','Full name','Dr. Jane Smith','text'],['email','Email','you@company.com','email'],['password','Password (min 6)','••••••••','password']].map(([k,l,p,t]) => (
            <div key={k}>
              <label className="block text-xs font-bold mb-1">{l}</label>
              <input type={t} value={(form as any)[k]} onChange={e=>set(k,e.target.value)} placeholder={p} required
                className="w-full h-11 border rounded-xl px-3 text-sm outline-none focus:border-blue-500" style={{borderColor:'#E4E9F1',background:'#fafbfd'}} />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold mb-1">Specialty</label>
              <input value={form.headline} onChange={e=>set('headline',e.target.value)} placeholder="Regulatory Manager"
                className="w-full h-11 border rounded-xl px-3 text-sm outline-none" style={{borderColor:'#E4E9F1',background:'#fafbfd'}} />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Company</label>
              <input value={form.company} onChange={e=>set('company',e.target.value)} placeholder="PharmaCo"
                className="w-full h-11 border rounded-xl px-3 text-sm outline-none" style={{borderColor:'#E4E9F1',background:'#fafbfd'}} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold mb-1">Sector</label>
              <select value={form.sector} onChange={e=>set('sector',e.target.value)}
                className="w-full h-11 border rounded-xl px-3 text-sm outline-none" style={{borderColor:'#E4E9F1',background:'#fafbfd'}}>
                <option value="pharma">Pharma 💊</option>
                <option value="cosmetics">Cosmetics 💄</option>
                <option value="supplements">Supplements 🥗</option>
                <option value="devices">Devices 🏥</option>
                <option value="regulatory">Regulatory 📋</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Country</label>
              <select value={form.country} onChange={e=>set('country',e.target.value)}
                className="w-full h-11 border rounded-xl px-3 text-sm outline-none" style={{borderColor:'#E4E9F1',background:'#fafbfd'}}>
                <option value="EG">🇪🇬 Egypt</option>
                <option value="AE">🇦🇪 UAE</option>
                <option value="SA">🇸🇦 Saudi Arabia</option>
                <option value="JO">🇯🇴 Jordan</option>
                <option value="IN">🇮🇳 India</option>
                <option value="CN">🇨🇳 China</option>
                <option value="US">🇺🇸 USA</option>
                <option value="GB">🇬🇧 UK</option>
              </select>
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full h-11 rounded-xl font-bold text-sm text-white disabled:opacity-50"
            style={{background:'#2D6BE4'}}>
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>
        <p className="text-center mt-4 text-sm" style={{color:'#5B6A82'}}>
          Already have an account? <Link href="/auth/login" className="font-bold" style={{color:'#2D6BE4'}}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
