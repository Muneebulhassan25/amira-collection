import { useState } from 'react';
import { useStoreData } from '../../context/StoreDataContext.jsx';
import { adminAuthService } from '../../services/adminAuthService.js';
import { supabaseSelected } from '../../services/supabaseConfig.js';

export default function AdminLoginPage() {
  const auth = adminAuthService.getStatus();
  const { refresh } = useStoreData();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [feedback, setFeedback] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault(); setBusy(true); setFeedback('');
    try {
      const result = await adminAuthService.signIn({ email, password });
      if (!result.ok) { setFeedback(result.error); return; }
      const loaded = await refresh({ showLoading: false });
      if (!loaded.ok) { await adminAuthService.signOut(); setFeedback(loaded.error || 'Store content could not be loaded.'); return; }
      window.location.hash = '#/admin';
    } catch (error) { setFeedback(error?.message || 'Sign-in could not be completed. Check the Supabase connection.'); }
    finally { setBusy(false); }
  }
  return <main className="admin-login-page"><section className="admin-login-card">
    <a className="admin-brand admin-login-brand" href="#/"><span className="admin-brand-mark">AC</span><span>AMIRA Collection<small>STORE ADMIN</small></span></a>
    <p className="admin-eyebrow">Admin access</p>
    <h1>{supabaseSelected ? 'Staff sign in' : 'Preview workspace'}</h1>
    {supabaseSelected ? <>
      <p className="admin-login-description">Sign in with an account that an administrator has already authorized for store staff. Staff accounts are created from the Supabase dashboard; this page has no public sign-up.</p>
      <form className="admin-login-form" onSubmit={submit}>
        <label className="admin-field"><span className="admin-field-label">Email</span><input type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>
        <label className="admin-field"><span className="admin-field-label">Password</span><input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} /></label>
        {feedback && <p className="admin-form-feedback" role="alert">{feedback}</p>}
        <button className="admin-primary-button" type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'} <span aria-hidden="true">→</span></button>
      </form>
    </> : <>
      <p className="admin-login-description">This project is using local browser preview mode. The admin workspace is available for local testing and is not protected for production use.</p>
      <div className="admin-login-warning"><strong>Authentication is not configured</strong><span>No password or account is accepted here. Connect Supabase and authorize staff before deploying admin access.</span></div>
      <a className="admin-primary-button" href="#/admin">Continue to local preview <span aria-hidden="true">→</span></a>
    </>}
    <a className="admin-back-link" href="#/">Return to storefront</a>
    <small className="admin-login-status">Mode: {auth.mode} · {supabaseSelected ? 'Supabase Auth' : 'Preview sign-in unavailable'}</small>
  </section></main>;
}
