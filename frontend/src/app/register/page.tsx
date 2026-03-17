'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authApi, setAuth } from '@/lib/api';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get('role') ?? 'restaurant';

  const [form, setForm] = useState({
    email: '', password: '', role: defaultRole,
    displayName: '', restaurantName: '', address: '', cuisineType: '', bio: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (field: string, value: string) => setForm(p => ({ ...p, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await authApi.register(form);
      setAuth(res.accessToken, res.refreshToken, res.role, res.userId);
      router.push(res.role === 'kol' ? '/dashboard/kol' : '/dashboard/restaurant');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Đăng ký thất bại');
    } finally { setLoading(false); }
  };

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6rem 1rem 2rem' }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link href="/" className="logo" style={{ justifyContent: 'center', marginBottom: '1rem' }}>
            <div className="logo-icon">🍜</div>
            <span style={{ fontSize: '1.5rem' }}>KV<span style={{ color: 'var(--primary)' }}>Review</span></span>
          </Link>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Tạo tài khoản</h1>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          {error && <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>{error}</div>}

          {/* Role selector */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {(['restaurant', 'kol'] as const).map(r => (
              <button key={r} type="button" onClick={() => set('role', r)}
                style={{ flex: 1, padding: '0.875rem', borderRadius: 'var(--radius-md)', fontWeight: 600,
                  border: `2px solid ${form.role === r ? 'var(--primary)' : 'var(--border)'}`,
                  background: form.role === r ? 'rgba(255,107,53,0.1)' : 'transparent',
                  color: form.role === r ? 'var(--primary)' : 'var(--text-secondary)',
                  cursor: 'pointer', transition: 'var(--transition)' }}>
                {r === 'restaurant' ? '🍽️ Nhà hàng' : '⭐ KOL'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="input-group">
              <label className="input-label">Email</label>
              <input id="reg-email" type="email" className="input-field" placeholder="example@email.com"
                value={form.email} onChange={e => set('email', e.target.value)} required />
            </div>
            <div className="input-group">
              <label className="input-label">Mật khẩu</label>
              <input id="reg-password" type="password" className="input-field" placeholder="Tối thiểu 8 ký tự"
                value={form.password} onChange={e => set('password', e.target.value)} required minLength={8} />
            </div>

            {form.role === 'restaurant' && (
              <>
                <div className="input-group">
                  <label className="input-label">Tên nhà hàng</label>
                  <input id="restaurant-name" type="text" className="input-field" placeholder="Nhà hàng ABC"
                    value={form.restaurantName} onChange={e => set('restaurantName', e.target.value)} />
                </div>
                <div className="input-group">
                  <label className="input-label">Địa chỉ</label>
                  <input id="restaurant-address" type="text" className="input-field" placeholder="123 Đường ABC, Quận 1, TP.HCM"
                    value={form.address} onChange={e => set('address', e.target.value)} />
                </div>
                <div className="input-group">
                  <label className="input-label">Loại ẩm thực</label>
                  <select id="cuisine-type" className="input-field" value={form.cuisineType} onChange={e => set('cuisineType', e.target.value)}>
                    <option value="">-- Chọn --</option>
                    {['Việt Nam', 'Nhật Bản', 'Hàn Quốc', 'Trung Hoa', 'Âu Mỹ', 'Lẩu & Nướng', 'Hải sản', 'Chay', 'Khác'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {form.role === 'kol' && (
              <>
                <div className="input-group">
                  <label className="input-label">Tên hiển thị</label>
                  <input id="display-name" type="text" className="input-field" placeholder="Tên KOL của bạn"
                    value={form.displayName} onChange={e => set('displayName', e.target.value)} />
                </div>
                <div className="input-group">
                  <label className="input-label">Giới thiệu bản thân</label>
                  <textarea id="kol-bio" className="input-field" placeholder="Mô tả ngắn về bạn..." rows={3}
                    value={form.bio} onChange={e => set('bio', e.target.value)}
                    style={{ resize: 'vertical' }} />
                </div>
              </>
            )}

            <button id="register-btn" type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
              {loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
          Đã có tài khoản?{' '}
          <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Đăng nhập</Link>
        </p>
      </div>
    </main>
  );
}

export default function RegisterPage() {
  return <Suspense><RegisterForm /></Suspense>;
}
