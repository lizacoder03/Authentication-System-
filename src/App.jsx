import { useEffect, useState } from 'react'
import './App.css'

const LOCAL_TOKEN_KEY = 'assignment-7-auth-token'
const SESSION_TOKEN_KEY = 'assignment-7-session-token'
const SESSION_LIFETIME = 60 * 60 * 1000
const REMEMBERED_LIFETIME = 7 * 24 * 60 * 60 * 1000

function encodeBase64Url(value) {
  const bytes = new TextEncoder().encode(value)
  let binary = ''
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  return btoa(binary)
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

function decodeBase64Url(value) {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
  const binary = atob(padded)
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

function createSimulatedToken(username, remember) {
  const issuedAt = Math.floor(Date.now() / 1000)
  const expiresIn = remember ? REMEMBERED_LIFETIME : SESSION_LIFETIME
  const payload = {
    sub: username,
    iat: issuedAt,
    exp: issuedAt + Math.floor(expiresIn / 1000),
  }
  const randomBytes = crypto.getRandomValues(new Uint8Array(24))
  const signature = encodeBase64Url(String.fromCharCode(...randomBytes))
  return `${encodeBase64Url(JSON.stringify({ alg: 'SIM', typ: 'JWT' }))}.${encodeBase64Url(JSON.stringify(payload))}.${signature}`
}

function readSession() {
  try {
    const storedToken =
      localStorage.getItem(LOCAL_TOKEN_KEY) ||
      sessionStorage.getItem(SESSION_TOKEN_KEY)
    if (!storedToken) return null

    const [, encodedPayload, signature] = storedToken.split('.')
    if (!encodedPayload || !signature) throw new Error('Invalid token')
    const payload = JSON.parse(decodeBase64Url(encodedPayload))
    if (!payload.sub || payload.exp * 1000 <= Date.now()) {
      throw new Error('Expired token')
    }

    return {
      username: payload.sub,
      token: storedToken,
      expiresAt: payload.exp * 1000,
      remembered: localStorage.getItem(LOCAL_TOKEN_KEY) === storedToken,
    }
  } catch {
    localStorage.removeItem(LOCAL_TOKEN_KEY)
    sessionStorage.removeItem(SESSION_TOKEN_KEY)
    return null
  }
}

function getPasswordStrength(password) {
  if (!password) return { score: 0, label: 'Not entered' }
  const checks = [
    password.length >= 8,
    /[a-z]/.test(password) && /[A-Z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ]
  const score = checks.filter(Boolean).length
  const labels = ['Weak', 'Fair', 'Good', 'Strong']
  return { score, label: labels[Math.max(0, score - 1)] }
}

function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <svg viewBox="0 0 32 32" fill="none">
        <path d="M16 3.5 27 8v7.2c0 6.6-4.6 11.3-11 13.3C9.6 26.5 5 21.8 5 15.2V8l11-4.5Z" />
        <path d="m11.5 15.7 3 3 6.3-6.5" />
      </svg>
    </span>
  )
}

function EyeIcon({ hidden }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {hidden ? (
        <>
          <path d="M3 3 21 21M10.6 10.7a2 2 0 0 0 2.7 2.7" />
          <path d="M9.9 5.3A10.7 10.7 0 0 1 12 5c5.1 0 8.7 4.5 9.5 7-.3 1-1.2 2.3-2.5 3.5M6.1 6.1C3.5 7.7 1.9 10.4 1.5 12c.8 2.5 4.4 7 10.5 7 1 0 1.9-.1 2.7-.4" />
        </>
      ) : (
        <>
          <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
          <circle cx="12" cy="12" r="3" />
        </>
      )}
    </svg>
  )
}

function LoginView({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const strength = getPasswordStrength(password)

  function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = {}
    if (!username.trim()) nextErrors.username = 'Enter your username.'
    if (!password) nextErrors.password = 'Enter your password.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length === 0) {
      onLogin(username.trim(), remember)
    }
  }

  return (
    <main className="auth-layout">
      <aside className="intro-panel">
        <div className="brand-lockup">
          <BrandMark />
          <span>Northstar<span className="brand-period">.</span></span>
        </div>
        <div className="intro-copy">
          <p className="eyebrow"><span /> ACCESS PORTAL</p>
          <h1>Your workspace,<br />within reach.</h1>
          <p className="intro-description">
            A simple, secure sign-in experience for the things you do every day.
          </p>
        </div>
        <div className="security-visual" aria-hidden="true">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="security-core">
            <BrandMark />
            <span className="core-signal" />
          </div>
          <div className="signal-card signal-top">
            <span className="signal-dot" /> SESSION ENCRYPTED
          </div>
          <div className="signal-card signal-bottom">
            <span className="signal-check">✓</span> IDENTITY VERIFIED
          </div>
        </div>
        <div className="panel-footer">
          <span>DEMO ENVIRONMENT</span>
          <span>AUTH SYSTEM <b>·</b> 01</span>
        </div>
      </aside>

      <section className="form-panel" aria-labelledby="login-title">
        <div className="form-topline">
          <span className="mobile-brand"><BrandMark /> NORTHSTAR</span>
          <span className="secure-label"><span /> SECURE SIGN IN</span>
        </div>
        <div className="login-content">
          <div className="form-heading">
            <p className="eyebrow">WELCOME BACK</p>
            <h2 id="login-title">Sign in to continue</h2>
            <p>Enter your credentials to access your dashboard.</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <div className="field-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                placeholder="e.g. alex.morgan"
                value={username}
                aria-invalid={Boolean(errors.username)}
                aria-describedby={errors.username ? 'username-error' : undefined}
                onChange={(event) => {
                  setUsername(event.target.value)
                  setErrors((current) => ({ ...current, username: '' }))
                }}
              />
              {errors.username && <span className="field-error" id="username-error">{errors.username}</span>}
            </div>

            <div className="field-group">
              <div className="label-row">
                <label htmlFor="password">Password</label>
                <span className="field-hint">REQUIRED</span>
              </div>
              <div className={`password-input ${errors.password ? 'has-error' : ''}`}>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={errors.password ? 'password-error' : 'password-strength'}
                  onChange={(event) => {
                    setPassword(event.target.value)
                    setErrors((current) => ({ ...current, password: '' }))
                  }}
                />
                <button
                  className="visibility-button"
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((visible) => !visible)}
                >
                  <EyeIcon hidden={showPassword} />
                </button>
              </div>
              {errors.password ? (
                <span className="field-error" id="password-error">{errors.password}</span>
              ) : (
                <div className={`strength-meter strength-${strength.score}`} id="password-strength" aria-live="polite">
                  <div className="strength-track" aria-hidden="true">
                    {[1, 2, 3, 4].map((step) => <span className={step <= strength.score ? 'filled' : ''} key={step} />)}
                  </div>
                  <span>Password strength <b>{strength.label}</b></span>
                </div>
              )}
            </div>

            <label className="remember-option">
              <input
                type="checkbox"
                checked={remember}
                onChange={(event) => setRemember(event.target.checked)}
              />
              <span className="custom-checkbox" aria-hidden="true" />
              <span>Remember me <small>· stay signed in for 7 days</small></span>
            </label>

            <button className="submit-button" type="submit">
              Sign in <span aria-hidden="true">↗</span>
            </button>
            <p className="demo-note"><span aria-hidden="true">i</span> Demo mode: any non-empty username and password will work.</p>
          </form>
        </div>
        <footer className="form-footer">
          <span>© 2026 NORTHSTAR</span>
          <span>AUTHENTICATION SYSTEM <b>·</b> ASSIGNMENT 07</span>
        </footer>
      </section>
    </main>
  )
}

function Dashboard({ session, onLogout }) {
  const expiryLabel = new Date(session.expiresAt).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  return (
    <main className="dashboard-shell">
      <header className="dashboard-header">
        <a className="dashboard-brand" href="#dashboard" aria-label="Northstar dashboard">
          <BrandMark /> <span>Northstar<span className="brand-period">.</span></span>
        </a>
        <div className="header-actions">
          <span className="session-indicator"><span /> SESSION ACTIVE</span>
          <button className="logout-button" type="button" onClick={onLogout}>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M10 17l5-5-5-5M15 12H3m9-8h7a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-7" /></svg>
            Sign out
          </button>
        </div>
      </header>

      <section className="dashboard-main" id="dashboard">
        <div className="dashboard-heading">
          <p className="eyebrow"><span /> PROTECTED DASHBOARD</p>
          <h1>Good to see you,<br /><span>{session.username}.</span></h1>
          <p>Your sign-in is active. This page is only available while your simulated token is valid.</p>
        </div>

        <div className="dashboard-grid">
          <article className="welcome-panel">
            <div className="welcome-topline"><span className="welcome-icon"><BrandMark /></span><span>ACCOUNT OVERVIEW</span></div>
            <h2>You’re all set.</h2>
            <p>Your identity has been verified for this demo session. Sign out any time to end access to this protected area.</p>
            <div className="welcome-divider" />
            <div className="account-row">
              <span className="avatar" aria-hidden="true">{session.username.slice(0, 1).toUpperCase()}</span>
              <span><b>{session.username}</b><small>Signed in user</small></span>
              <span className="verified-badge"><span /> VERIFIED</span>
            </div>
          </article>

          <article className="session-panel">
            <div className="panel-heading-row"><h2>Session details</h2><span className="live-pill"><span /> LIVE</span></div>
            <dl className="session-details">
              <div><dt>AUTHENTICATION</dt><dd>JWT simulation</dd></div>
              <div><dt>REMEMBER USER</dt><dd>{session.remembered ? 'On · 7 day expiry' : 'Off · session only'}</dd></div>
              <div><dt>TOKEN EXPIRES</dt><dd>{expiryLabel}</dd></div>
            </dl>
            <div className="token-preview">
              <div><span>ACCESS TOKEN</span><span className="token-type">JWT · SIMULATED</span></div>
              <code title={session.token}>{session.token.slice(0, 35)}…</code>
            </div>
          </article>
        </div>

        <div className="protected-banner">
          <span className="protected-check" aria-hidden="true">✓</span>
          <div><b>Protected route unlocked</b><span>Your valid session token grants access to this dashboard.</span></div>
          <span className="route-tag">/dashboard</span>
        </div>
      </section>

      <footer className="dashboard-footer"><span>NORTHSTAR <b>·</b> AUTH SYSTEM</span><span>DEMO ENVIRONMENT <i /></span></footer>
    </main>
  )
}

function App() {
  const [session, setSession] = useState(() => readSession())
  const [route, setRoute] = useState(() => window.location.pathname)

  useEffect(() => {
    function handlePopState() {
      setRoute(window.location.pathname)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => {
    const destination = session ? '/dashboard' : '/'
    if (window.location.pathname !== destination) {
      window.history.replaceState({}, '', destination)
    }
  }, [route, session])

  function handleLogin(username, remember) {
    const token = createSimulatedToken(username, remember)
    const storage = remember ? localStorage : sessionStorage
    const key = remember ? LOCAL_TOKEN_KEY : SESSION_TOKEN_KEY
    const otherStorage = remember ? sessionStorage : localStorage
    const otherKey = remember ? SESSION_TOKEN_KEY : LOCAL_TOKEN_KEY
    otherStorage.removeItem(otherKey)
    storage.setItem(key, token)
    const [, encodedPayload] = token.split('.')
    const payload = JSON.parse(decodeBase64Url(encodedPayload))
    setSession({
      username,
      token,
      expiresAt: payload.exp * 1000,
      remembered: remember,
    })
  }

  function handleLogout() {
    localStorage.removeItem(LOCAL_TOKEN_KEY)
    sessionStorage.removeItem(SESSION_TOKEN_KEY)
    setSession(null)
  }

  return session ? (
    <Dashboard session={session} onLogout={handleLogout} />
  ) : (
    <LoginView onLogin={handleLogin} />
  )
}

export default App
