import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const navigate = useNavigate()

  // Googleログイン処理
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/tasks` },
    })
    if (error) setErrorMessage('Googleログインに失敗しました：' + error.message)
  }

  // ログイン処理
  const handleLogin = async (e) => {
    e.preventDefault()
    setErrorMessage('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setErrorMessage('ログインに失敗しました：' + error.message)
      return
    }

    navigate('/tasks')
  }

  return (
    <div className="auth-container">
      <h1>ログイン</h1>
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label htmlFor="email">メールアドレス</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">パスワード</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <button type="submit">ログイン</button>
      </form>
      <hr style={{ margin: '16px 0' }} />
      <button type="button" onClick={handleGoogleLogin} style={{ width: '100%', padding: '10px', backgroundColor: '#fff', color: '#333', border: '1px solid #ccc', borderRadius: '4px', fontSize: '16px', cursor: 'pointer' }}>
        Googleでログイン
      </button>
      <p>
        会員登録は<Link to="/signup">こちら</Link>
      </p>
    </div>
  )
}

export default Login
