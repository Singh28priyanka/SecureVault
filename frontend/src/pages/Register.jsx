import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import AuthShell from './AuthShell'
import Icon from '../components/Icon'
import StrengthMeter from '../components/StrengthMeter'
import { register } from '../store/slices/authSlice'
import { passwordApi } from '../api/endpoints'

export default function Register() {
  const dispatch = useDispatch()
  const { status, error } = useSelector((s) => s.auth)
  const [form, setForm] = useState({ fullName: '', username: '', email: '', password: '' })
  const [score, setScore] = useState(0)
  const [showPwd, setShowPwd] = useState(false)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const onPassword = async (e) => {
    const v = e.target.value
    setForm((f) => ({ ...f, password: v }))
    if (v.length > 0) {
      try {
        const { data } = await passwordApi.strength(v)
        setScore(data.score)
      } catch {
        /* ignore */
      }
    } else setScore(0)
  }

  const submit = (e) => {
    e.preventDefault()
    dispatch(register(form))
  }

  return (
    <AuthShell>
      <div className="animate-fade-up">
        <h2 className="text-2xl font-bold text-white">Create your vault</h2>
        <p className="mt-1 text-sm text-slate-400">Start protecting your credentials in seconds.</p>

        {error && (
          <div className="mt-5 flex items-center gap-2 rounded-xl border border-aurora-rose/30 bg-aurora-rose/10 px-3.5 py-2.5 text-sm text-aurora-rose">
            <Icon name="alert" size={16} />
            {error}
          </div>
        )}

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="label">Full name</label>
            <input className="input" placeholder="Ada Lovelace" value={form.fullName} onChange={set('fullName')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Username</label>
              <input className="input" placeholder="ada" value={form.username} onChange={set('username')} required />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" placeholder="ada@mail.com" value={form.email} onChange={set('email')} required />
            </div>
          </div>
          <div>
            <label className="label">Master password</label>
            <div className="relative">
              <input
                className="input pr-11"
                type={showPwd ? 'text' : 'password'}
                placeholder="Choose a strong password"
                value={form.password}
                onChange={onPassword}
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPwd((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <Icon name={showPwd ? 'eyeOff' : 'eye'} size={18} />
              </button>
            </div>
            {form.password && (
              <div className="mt-2">
                <StrengthMeter score={score} />
              </div>
            )}
          </div>

          <button type="submit" className="btn-primary w-full" disabled={status === 'loading'}>
            {status === 'loading' ? 'Creating…' : (
              <>
                <Icon name="sparkle" size={18} /> Create account
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-aurora-cyan hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </AuthShell>
  )
}
