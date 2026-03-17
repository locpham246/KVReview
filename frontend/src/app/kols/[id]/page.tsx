'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { kolApi, reviewApi, bookingApi, getRole, getUserId } from '@/lib/api';
import type { KolProfile, Review } from '@/lib/api';

const PLATFORM_ICONS: Record<string, string> = { tiktok: '🎵', instagram: '📸', youtube: '▶️', facebook: '👥' };

export default function KolDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const role = typeof window !== 'undefined' ? getRole() : null;

  const [kol, setKol] = useState<KolProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState({ price: '', date: '' });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingMsg, setBookingMsg] = useState('');

  useEffect(() => {
    Promise.all([kolApi.getById(id), reviewApi.getByKol(id)])
      .then(([k, r]) => { setKol(k); setReviews(r); })
      .finally(() => setLoading(false));
  }, [id]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingLoading(true); setBookingMsg('');
    try {
      await bookingApi.create({ kolId: id, priceOffered: Number(booking.price), scheduledDate: booking.date });
      setBookingMsg('✅ Gửi yêu cầu booking thành công! KOL sẽ phản hồi sớm.');
    } catch (err: unknown) {
      setBookingMsg(`❌ ${err instanceof Error ? err.message : 'Booking thất bại'}`);
    } finally { setBookingLoading(false); }
  };

  if (loading) return <div className="page-wrapper"><div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>Đang tải...</div></div>;
  if (!kol) return <div className="page-wrapper"><div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>KOL không tồn tại.</div></div>;

  const initials = kol.displayName.slice(0, 2).toUpperCase();
  const totalFollowers = kol.metrics.reduce((s, m) => s + m.followersCount, 0);

  return (
    <div className="page-wrapper">
      <div className="container" style={{ padding: '2rem 1.5rem 4rem' }}>
        <button onClick={() => router.back()} className="btn btn-ghost" style={{ marginBottom: '1.5rem' }}>← Quay lại</button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem', alignItems: 'start' }}>
          {/* Left: Profile */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Header */}
            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                <div className="kol-avatar" style={{ width: 80, height: 80, fontSize: '2rem' }}>{initials}</div>
                <div style={{ flex: 1 }}>
                  <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{kol.displayName}</h1>
                  {kol.tier && <span className={`badge badge-${kol.tier}`} style={{ marginBottom: '0.75rem', display: 'inline-block' }}>{kol.tier}</span>}
                  {kol.bio && <p style={{ fontSize: '0.95rem', lineHeight: 1.7 }}>{kol.bio}</p>}
                </div>
              </div>

              {/* Platforms */}
              {kol.platforms.length > 0 && (
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1.25rem' }}>
                  {kol.platforms.map(p => (
                    <span key={p} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem',
                      background: 'rgba(255,255,255,0.06)', padding: '0.4rem 0.875rem', borderRadius: 'var(--radius-full)' }}>
                      {PLATFORM_ICONS[p] ?? '📱'} {p}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Metrics */}
            {kol.metrics.length > 0 && (
              <div className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>📊 Chỉ số mạng xã hội</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {kol.metrics.map(m => (
                    <div key={m.platform} style={{ display: 'flex', justifyContent: 'space-between',
                      padding: '0.875rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)' }}>
                      <span style={{ fontWeight: 600 }}>{PLATFORM_ICONS[m.platform] ?? '📱'} {m.platform}</span>
                      <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.9rem' }}>
                        <span>👥 {m.followersCount.toLocaleString()}</span>
                        <span style={{ color: 'var(--success)' }}>⚡ {Number(m.engagementRate).toFixed(1)}% ER</span>
                        {m.reach30D && <span style={{ color: 'var(--text-muted)' }}>👁 {m.reach30D.toLocaleString()}/30d</span>}
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '2rem', marginTop: '1.25rem', padding: '0.875rem 1rem',
                  background: 'rgba(255,107,53,0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,107,53,0.15)' }}>
                  <div><div style={{ fontWeight: 800, color: 'var(--primary)' }}>{totalFollowers.toLocaleString()}</div><div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tổng followers</div></div>
                  {kol.avgEngagementRate && <div><div style={{ fontWeight: 800, color: 'var(--success)' }}>{Number(kol.avgEngagementRate).toFixed(1)}%</div><div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Avg. ER</div></div>}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>⭐ Đánh giá ({reviews.length})</h3>
              {reviews.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Chưa có đánh giá nào.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {reviews.map(r => (
                    <div key={r.id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)',
                      borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{r.restaurantName}</span>
                        <span style={{ color: 'var(--accent-gold)' }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                      </div>
                      {r.comment && <p style={{ fontSize: '0.875rem' }}>{r.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Booking panel */}
          <div style={{ position: 'sticky', top: 100 }}>
            <div className="card" style={{ padding: '1.75rem' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Giá booking</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>
                  {kol.basePrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/ lần</div>
              </div>

              {role === 'restaurant' ? (
                <form onSubmit={handleBooking} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="input-group">
                    <label className="input-label">Giá đề nghị (VNĐ)</label>
                    <input id="booking-price" type="number" className="input-field"
                      placeholder={String(Math.ceil(kol.basePrice))}
                      value={booking.price} onChange={e => setBooking(p => ({ ...p, price: e.target.value }))} required min={kol.basePrice} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Ngày hẹn</label>
                    <input id="booking-date" type="datetime-local" className="input-field"
                      value={booking.date} onChange={e => setBooking(p => ({ ...p, date: e.target.value }))} required />
                  </div>
                  <button id="book-btn" type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={bookingLoading}>
                    {bookingLoading ? 'Đang gửi...' : '📅 Gửi yêu cầu booking'}
                  </button>
                  {bookingMsg && <div className={`alert ${bookingMsg.startsWith('✅') ? 'alert-success' : 'alert-error'}`}>{bookingMsg}</div>}
                </form>
              ) : !role ? (
                <a href="/login" className="btn btn-primary" style={{ width: '100%', display: 'block', textAlign: 'center' }}>
                  Đăng nhập để đặt booking
                </a>
              ) : (
                <div className="alert" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)' }}>
                  Chỉ nhà hàng mới có thể đặt booking.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
