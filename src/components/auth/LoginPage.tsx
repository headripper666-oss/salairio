import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LogIn, AlertCircle } from 'lucide-react'
import { signInWithEmailAndPassword } from '@/lib/firebase'
import { auth } from '@/lib/firebase'

function getFirebaseErrorMessage(code: string): string {
  switch (code) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Identifiants incorrects. Vérifiez votre email et mot de passe.'
    case 'auth/too-many-requests':
      return 'Trop de tentatives. Veuillez patienter quelques minutes.'
    case 'auth/network-request-failed':
      return 'Connexion réseau impossible. Vérifiez votre connexion.'
    default:
      return 'Une erreur est survenue. Veuillez réessayer.'
  }
}

export function LoginPage() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState<string | null>(null)
  const [loading,  setLoading]  = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    setError(null)

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password)
      navigate('/home', { replace: true })
    } catch (err) {
      const code = (err as { code?: string }).code ?? ''
      setError(getFirebaseErrorMessage(code))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-bg">
      <motion.div
        className="login-card"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
      >
        {/* Logo + titre */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
          <motion.div
            className="logo-mark"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
          >
            <span>S</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{ marginTop: '0.875rem', textAlign: 'center' }}
          >
            <h1
              style={{
                fontFamily: "'Bricolage Grotesque', sans-serif",
                fontSize: '1.4rem',
                fontWeight: 800,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: '#F4F4F5',
                margin: 0,
                lineHeight: 1.1,
              }}
            >
              Salairio
            </h1>
            <p style={{ fontSize: '0.78rem', color: '#52525B', marginTop: '0.3rem' }}>
              Votre tableau de bord personnel
            </p>
          </motion.div>
        </div>

        {/* Formulaire */}
        <motion.form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <div className="field-group">
            <label className="field-label" htmlFor="email">Adresse email</label>
            <input
              id="email"
              type="email"
              className="field-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              required
              autoComplete="email"
              autoFocus
            />
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              className="field-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <motion.div
              className="error-banner"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.2 }}
            >
              <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{error}</span>
            </motion.div>
          )}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner" />
                <span>Connexion…</span>
              </>
            ) : (
              <>
                <LogIn size={17} />
                <span>Se connecter</span>
              </>
            )}
          </button>
        </motion.form>
      </motion.div>

      {/* Footer */}
      <div
        style={{
          position: 'absolute',
          bottom: '1.25rem',
          left: 0,
          right: 0,
          textAlign: 'center',
          fontSize: '0.68rem',
          letterSpacing: '0.1em',
          color: '#3F3F46',
          textTransform: 'uppercase',
        }}
      >
        Salairio · Estimation personnelle · 2026
      </div>
    </div>
  )
}
