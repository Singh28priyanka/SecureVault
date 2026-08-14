import Logo from '../components/Logo'
import Icon from '../components/Icon'

const FEATURES = [
  { icon: 'lock', title: 'AES-256 encryption', text: 'Every secret is sealed with authenticated encryption at rest.' },
  { icon: 'shield', title: 'MFA & anomaly detection', text: 'TOTP two-factor plus real-time login monitoring.' },
  { icon: 'share', title: 'Fine-grained sharing', text: 'Share credentials with view, edit or full-control access.' },
  { icon: 'chart', title: 'Password health analytics', text: 'Track strength, reuse and expiry across your vault.' },
]

/** Split-screen auth layout: aurora brand panel + form. */
export default function AuthShell({ children }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-aurora-radial">
      {/* Brand / marketing panel */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden">
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-aurora-violet/20 blur-3xl animate-floaty" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-aurora-teal/20 blur-3xl" />

        <Logo size={40} />

        <div className="relative">
          <h1 className="text-4xl font-extrabold leading-tight text-white">
            Your credentials,
            <br />
            <span className="brand-text">sealed and simple.</span>
          </h1>
          <p className="mt-4 max-w-md text-slate-400">
            A full-stack password vault with encryption, secure sharing, threat
            monitoring and health analytics — all in one beautiful place.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-4 max-w-lg">
            {FEATURES.map((f) => (
              <div key={f.title} className="glass p-4">
                <div className="mb-2 grid h-9 w-9 place-items-center rounded-lg bg-white/[0.05] text-aurora-cyan">
                  <Icon name={f.icon} size={18} />
                </div>
                <div className="text-sm font-semibold text-white">{f.title}</div>
                <div className="mt-1 text-xs text-slate-400">{f.text}</div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-slate-600">
          © 2025 SecureVault · Built with Spring Boot &amp; React
        </p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Logo size={40} />
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
