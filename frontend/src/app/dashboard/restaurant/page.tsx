'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { restaurantApi, bookingApi, reviewApi, getRole, getUserId } from '@/lib/api';
import type { RestaurantProfile, Booking } from '@/lib/api';
import Link from 'next/link';

export default function RestaurantDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<RestaurantProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'bookings' | 'profile'>('bookings');
  const [reviewForm, setReviewForm] = useState<{ bookingId: string; rating: number; comment: string } | null>(null);
  const [reviewMsg, setReviewMsg] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined' && getRole() !== 'restaurant') {
      router.push('/login'); return;
    }
    Promise.all([restaurantApi.getMe(), bookingApi.getList()])
      .then(([p, b]) => { setProfile(p); setBookings(b); })
      .finally(() => setLoading(false));
  }, [router]);

  const handleComplete = async (id: string) => {
    await bookingApi.updateStatus(id, 'completed');
    const b = await bookingApi.getList();
    setBookings(b);
  };

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm) return;
    try {
      await reviewApi.create(reviewForm);
      setReviewMsg('✅ Đánh giá thành công!');
      setReviewForm(null);
    } catch (err: unknown) {
      setReviewMsg(err instanceof Error ? err.message : 'Lỗi');
    }
  };

  if (loading) return <div className="page-wrapper"><div className="container" style={{ padding: '4rem', textAlign: 'center' }}>Đang tải...</div></div>;

  const pending = bookings.filter(b => b.status === 'pending').length;
  const accepted = bookings.filter(b => b.status === 'accepted').length;
  const completed = bookings.filter(b => b.status === 'completed').length;

  return (
    <div className="page-wrapper">
      <div className="container" style={{ padding: '2rem 1.5rem 4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem' }}>🍽️ Dashboard Nhà hàng</h1>
            <p style={{ marginTop: '0.25rem' }}>{profile?.name}</p>
          </div>
          <Link href="/kols" className="btn btn-primary">🔍 Tìm KOL</Link>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Đang chờ', value: pending, color: 'var(--warning)' },
            { label: 'Đã xác nhận', value: accepted, color: 'var(--success)' },
            { label: 'Hoàn thành', value: completed, color: 'var(--primary)' },
          ].map(s => (
            <div key={s.label} className="card stat-card">
              <div className="value" style={{ color: s.color }}>{s.value}</div>
              <div className="label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Bookings list */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.25rem' }}>📋 Danh sách Booking</h3>
          {bookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📭</div>
              <p>Chưa có booking nào. <Link href="/kols" style={{ color: 'var(--primary)' }}>Tìm KOL</Link> để bắt đầu!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {bookings.map(b => (
                <div key={b.id} style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.03)',
                  borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div>
                      <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>{b.kolDisplayName}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        📅 {new Date(b.scheduledDate).toLocaleDateString('vi-VN')} · 💰 {b.priceOffered.toLocaleString()} đ
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span className={`badge badge-${b.status}`}>{b.status}</span>
                      {b.status === 'accepted' && (
                        <button id={`complete-${b.id}`} className="btn btn-primary btn-sm" onClick={() => handleComplete(b.id)}>
                          ✅ Hoàn thành
                        </button>
                      )}
                      {b.status === 'completed' && !b.review && (
                        <button className="btn btn-secondary btn-sm" onClick={() => setReviewForm({ bookingId: b.id, rating: 5, comment: '' })}>
                          ⭐ Đánh giá
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Review modal */}
        {reviewForm && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div className="card" style={{ padding: '2rem', width: '100%', maxWidth: 440 }}>
              <h3 style={{ marginBottom: '1.25rem' }}>⭐ Đánh giá KOL</h3>
              {reviewMsg && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{reviewMsg}</div>}
              <form onSubmit={handleReview} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="input-group">
                  <label className="input-label">Sao đánh giá</label>
                  <select id="review-rating" className="input-field" value={reviewForm.rating}
                    onChange={e => setReviewForm(p => p ? { ...p, rating: Number(e.target.value) } : null)}>
                    {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} ★</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Nhận xét</label>
                  <textarea id="review-comment" className="input-field" rows={4} placeholder="Chia sẻ trải nghiệm của bạn..."
                    value={reviewForm.comment} onChange={e => setReviewForm(p => p ? { ...p, comment: e.target.value } : null)}
                    style={{ resize: 'vertical' }} />
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button id="submit-review" type="submit" className="btn btn-primary" style={{ flex: 1 }}>Gửi đánh giá</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setReviewForm(null)}>Huỷ</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
