'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false) }
    else router.push('/feed')
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* Hero */}
      <div className="hidden md:flex flex-col justify-center p-14" style={{background:'linear-gradient(145deg,#1040a0,#1a56db 55%,#2D6BE4)',color:'white'}}>
        <div className="text-4xl font-black mb-3">DRUGBOX</div>
        <h1 className="text-3xl font-bold mb-4 leading-tight">The Professional Network for Pharma, Cosmetics & Medical Devices</h1>
        <p className="opacity-90 mb-6">Connect with manufacturers, suppliers & regulatory experts across Egypt, GCC and beyond.</p>
        {['Raw materials — APIs, excipients, cosmetic actives','Registrations — EDA, SFDA, DHA, MOHAP','Contract manufacturing — CMO / Toll','Jobs — QA, RA, Medical Rep, Production','Training — GMP, Regulatory, Formulation'].map(f => (
          <div key={f} className="flex items-center gap-3 mb-2 text-sm opacity-90">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0" style={{background:'rgba(255,255,255,0.15)'}}>✓</div>
            {f}
          </div>
        ))}
      </div>
      {/* Form */}
      <div className="flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm">
          <div className="text-2xl font-black mb-1" style={{color:'#2D6BE4'}}>DRUGBOX</div>
          <h2 className="text-xl font-bold mb-1" style={{color:'#0F1B2E'}}>Welcome back</h2>
          <p className="text-sm mb-5" style={{color:'#5B6A82'}}>Sign in to your Drugbox account</p>
          {error && <div className="mb-4 p-3 rounded-lg text-sm" style={{background:'#FEF2F2',color:'#B91C1C',border:'1px solid #FCA5A5'}}>{error}</div>}
          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="block text-xs font-bold mb-1" style={{color:'#0F1B2E'}}>Email</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@company.com" required
                className="w-full h-11 border rounded-xl px-3 text-sm outline-none focus:border-blue-500" style={{borderColor:'#E4E9F1',background:'#fafbfd'}} />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1" style={{color:'#0F1B2E'}}>Password</label>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required
                className="w-full h-11 border rounded-xl px-3 text-sm outline-none focus:border-blue-500" style={{borderColor:'#E4E9F1',background:'#fafbfd'}} />
            </div>
            <button type="submit" disabled={loading}
              className="w-full h-11 rounded-xl font-bold text-sm text-white disabled:opacity-50"
              style={{background:'#2D6BE4'}}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p className="text-center mt-4 text-sm" style={{color:'#5B6A82'}}>
            Don&apos;t have an account? <Link href="/auth/signup" className="font-bold" style={{color:'#2D6BE4'}}>Create one</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
