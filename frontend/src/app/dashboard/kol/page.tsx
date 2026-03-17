'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { bookingApi, kolApi, getRole, getUserId } from '@/lib/api';
import type { Booking, KolProfile } from '@/lib/api';

export default function KolDashboard() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [profile, setProfile] = useState<KolProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined' && getRole() !== 'kol') {
      router.push('/login'); return;
    }
    const uid = getUserId()!;
    Promise.all([bookingApi.getList(), kolApi.getById(uid)])
      .then(([b, k]) => { setBookings(b); setProfile(k); })
      .finally(() => setLoading(false));
  }, [router]);

  const handleStatus = async (id: string, status: string) => {
    try {
      await bookingApi.updateStatus(id, status);
      const b = await bookingApi.getList();
      setBookings(b);
      setActionMsg(`✅ Đã ${status === 'accepted' ? 'chấp nhận' : 'từ chối'} booking`);
    } catch (err: unknown) {
      setActionMsg(err instanceof Error ? err.message : 'Lỗi');
    }
  };

  if (loading) return <div className="page-wrapper"><div className="container" style={{ padding: '4rem', textAlign: 'center' }}>Đang tải...</div></div>;

  const pending = bookings.filter(b => b.status === 'pending');
  const active = bookings.filter(b => b.status === 'accepted');
  const done = bookings.filter(b => b.status === 'completed');
  const totalRevenue = done.reduce((s, b) => s + b.priceOffered, 0);

  return (
    <div className="page-wrapper">
      <div className="container" style={{ padding: '2rem 1.5rem 4rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem' }}>⭐ Dashboard KOL</h1>
          <p style={{ marginTop: '0.25rem' }}>{profile?.displayName}</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Yêu cầu mới', value: pending.length, color: 'var(--warning)' },
            { label: 'Đang thực hiện', value: active.length, color: 'var(--info)' },
            { label: 'Hoàn thành', value: done.length, color: 'var(--success)' },
            { label: 'Doanh thu', value: totalRevenue.toLocaleString('vi-VN') + ' đ', color: 'var(--primary)', big: true },
          ].map(s => (
            <div key={s.label} className="card stat-card">
              <div className="value" style={{ color: s.color, fontSize: s.big ? '1.25rem' : undefined }}>{s.value}</div>
              <div className="label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Profile info box */}
        {profile && (
          <div className="card" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            <div><span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Tier</span><div style={{ fontWeight: 700 }}>{profile.tier ?? '–'}</div></div>
            <div><span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Base price</span><div style={{ fontWeight: 700, color: 'var(--primary)' }}>{profile.basePrice.toLocaleString()} đ</div></div>
            <div><span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Avg ER</span><div style={{ fontWeight: 700, color: 'var(--success)' }}>{profile.avgEngagementRate ? `${Number(profile.avgEngagementRate).toFixed(1)}%` : '–'}</div></div>
            <div><span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Platforms</span><div style={{ fontWeight: 700 }}>{profile.platforms.join(', ') || '–'}</div></div>
          </div>
        )}

        {actionMsg && <div className="alert alert-success" style={{ marginBottom: '1.25rem' }}>{actionMsg}</div>}

        {/* Pending bookings */}
        {pending.length > 0 && (
          <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>🔔 Yêu cầu đang chờ ({pending.length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {pending.map(b => (
                <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(245,158,11,0.2)', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>🍽️ {b.restaurantName}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      📅 {new Date(b.scheduledDate).toLocaleDateString('vi-VN')} · 💰 {b.priceOffered.toLocaleString()} đ
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button id={`accept-${b.id}`} className="btn btn-primary btn-sm" onClick={() => handleStatus(b.id, 'accepted')}>✅ Chấp nhận</button>
                    <button id={`reject-${b.id}`} className="btn btn-secondary btn-sm" onClick={() => handleStatus(b.id, 'cancelled')}>❌ Từ chối</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All bookings */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>📋 Tất cả Booking</h3>
          {bookings.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>Chưa có booking nào.</p>
          ) : (
            <table className="ranking-table">
              <thead>
                <tr>
                  <th>Nhà hàng</th><th>Ngày hẹn</th><th>Giá</th><th>Trạng thái</th><th>Đánh giá</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id}>
                    <td>{b.restaurantName}</td>
                    <td>{new Date(b.scheduledDate).toLocaleDateString('vi-VN')}</td>
                    <td style={{ color: 'var(--primary)', fontWeight: 600 }}>{b.priceOffered.toLocaleString()} đ</td>
                    <td><span className={`badge badge-${b.status}`}>{b.status}</span></td>
                    <td>
                      {b.review ? (
                        <span style={{ color: 'var(--accent-gold)' }}>{'★'.repeat(b.review.rating)}</span>
                      ) : '–'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
