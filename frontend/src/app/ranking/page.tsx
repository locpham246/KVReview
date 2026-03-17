'use client';
import { useState, useEffect } from 'react';
import { kolApi } from '@/lib/api';
import type { KolRankingItem } from '@/lib/api';
import Link from 'next/link';

export default function RankingPage() {
  const [ranking, setRanking] = useState<KolRankingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    kolApi.getRanking().then(setRanking).finally(() => setLoading(false));
  }, []);

  const rankClass = (rank: number) => rank === 1 ? 'rank-1' : rank === 2 ? 'rank-2' : rank === 3 ? 'rank-3' : '';

  return (
    <div className="page-wrapper">
      <div className="container" style={{ padding: '2rem 1.5rem 4rem' }}>
        <div className="page-header">
          <h1 className="page-title">🏆 Bảng xếp hạng KOL</h1>
          <p className="page-subtitle">Top KOL theo tỷ lệ tương tác, cập nhật mỗi giờ</p>
        </div>

        {/* Podium top 3 */}
        {!loading && ranking.length >= 3 && (
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', alignItems: 'flex-end', marginBottom: '3rem', flexWrap: 'wrap' }}>
            {[ranking[1], ranking[0], ranking[2]].map((k, idx) => {
              const heights = ['180px', '220px', '160px'];
              const medals = ['🥈', '🥇', '🥉'];
              const colors = ['#C0C0C0', '#FFD700', '#CD7F32'];
              return (
                <Link key={k.userId} href={`/kols/${k.userId}`}
                  style={{ textAlign: 'center', flex: '0 0 180px', textDecoration: 'none' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{medals[idx]}</div>
                  <div style={{ width: 56, height: 56, borderRadius: '50%',
                    background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.25rem', fontWeight: 800, color: 'white', margin: '0 auto 0.5rem', border: `3px solid ${colors[idx]}` }}>
                    {k.displayName.slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ fontWeight: 700, marginBottom: '0.25rem', color: 'var(--text-primary)' }}>{k.displayName}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{k.avgEngagementRate ? `${Number(k.avgEngagementRate).toFixed(1)}% ER` : ''}</div>
                  <div style={{ height: heights[idx], background: `linear-gradient(to top, ${colors[idx]}22, transparent)`,
                    border: `1px solid ${colors[idx]}44`, borderRadius: 'var(--radius-md) var(--radius-md) 0 0', marginTop: '0.5rem' }} />
                </Link>
              );
            })}
          </div>
        )}

        {/* Table */}
        <div className="card" style={{ padding: '1.5rem 0', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <div className="skeleton" style={{ height: 40, marginBottom: 8 }} />
              <div className="skeleton" style={{ height: 40, marginBottom: 8 }} />
              <div className="skeleton" style={{ height: 40 }} />
            </div>
          ) : (
            <table className="ranking-table">
              <thead>
                <tr>
                  <th style={{ paddingLeft: '1.5rem', width: 64 }}>#</th>
                  <th>KOL</th>
                  <th>Tier</th>
                  <th>Followers</th>
                  <th>Engagement Rate</th>
                  <th style={{ paddingRight: '1.5rem' }}>Base Price</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map(k => (
                  <tr key={k.userId}>
                    <td style={{ paddingLeft: '1.5rem' }}>
                      <span className={`rank-number ${rankClass(k.rank)}`}>
                        {k.rank <= 3 ? ['🥇','🥈','🥉'][k.rank - 1] : k.rank}
                      </span>
                    </td>
                    <td>
                      <Link href={`/kols/${k.userId}`} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div className="kol-avatar" style={{ width: 36, height: 36, fontSize: '0.9rem', marginBottom: 0 }}>
                          {k.displayName.slice(0, 2).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{k.displayName}</span>
                      </Link>
                    </td>
                    <td>{k.tier ? <span className={`badge badge-${k.tier}`}>{k.tier}</span> : '–'}</td>
                    <td>{k.totalFollowers.toLocaleString()}</td>
                    <td>
                      {k.avgEngagementRate != null ? (
                        <span style={{ color: 'var(--success)', fontWeight: 600 }}>{Number(k.avgEngagementRate).toFixed(1)}%</span>
                      ) : '–'}
                    </td>
                    <td style={{ paddingRight: '1.5rem', color: 'var(--primary)', fontWeight: 700 }}>
                      {k.basePrice.toLocaleString()} đ
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
