'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authApi, setAuth } from '@/lib/api';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await authApi.login(form);
      setAuth(res.accessToken, res.refreshToken, res.role, res.userId);
      const next = searchParams.get('next') ?? (res.role === 'kol' ? '/dashboard/kol' : '/dashboard/restaurant');
      router.push(next);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6rem 1rem 2rem' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <Link href="/" className="logo" style={{ justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div className="logo-icon">🍜</div>
            <span style={{ fontSize: '1.5rem' }}>KV<span style={{ color: 'var(--primary)' }}>Review</span></span>
          </Link>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Chào mừng trở lại</h1>
          <p>Đăng nhập vào tài khoản của bạn</p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: '2rem' }}>
          {error && <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>{error}</div>}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="input-group">
              <label className="input-label">Email</label>
              <input id="email" type="email" className="input-field" placeholder="example@email.com"
                value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
            </div>
            <div className="input-group">
              <label className="input-label">Mật khẩu</label>
              <input id="password" type="password" className="input-field" placeholder="••••••••"
                value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
            </div>
            <button id="login-btn" type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
          Chưa có tài khoản?{' '}
          <Link href="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Đăng ký ngay</Link>
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
