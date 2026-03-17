'use client';
import Link from 'next/link';
import type { KolProfile } from '@/lib/api';

const PLATFORM_ICONS: Record<string, string> = {
  tiktok: '🎵',
  instagram: '📸',
  youtube: '▶️',
  facebook: '👥',
};

const TIER_LABELS: Record<string, string> = {
  nano: 'Nano',
  micro: 'Micro',
  macro: 'Macro',
  mega: 'Mega',
};

interface Props {
  kol: KolProfile;
}

export default function KolCard({ kol }: Props) {
  const initials = kol.displayName.slice(0, 2).toUpperCase();
  const totalFollowers = kol.metrics.reduce((s, m) => s + m.followersCount, 0);

  return (
    <Link href={`/kols/${kol.userId}`} className="kol-card" style={{ display: 'block' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
        <div className="kol-avatar">{initials}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="kol-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {kol.displayName}
          </div>
          {kol.tier && (
            <span className={`badge badge-${kol.tier}`}>{TIER_LABELS[kol.tier] ?? kol.tier}</span>
          )}
        </div>
      </div>

      {kol.bio && (
        <p style={{ fontSize: '0.85rem', marginBottom: '0.75rem', lineHeight: 1.5, color: 'var(--text-muted)',
          overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {kol.bio}
        </p>
      )}

      {/* Platforms */}
      {kol.platforms.length > 0 && (
        <div className="kol-meta">
          {kol.platforms.map(p => (
            <span key={p} style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              fontSize: '0.8rem', color: 'var(--text-muted)',
              background: 'rgba(255,255,255,0.06)', padding: '3px 10px',
              borderRadius: 'var(--radius-full)'
            }}>
              {PLATFORM_ICONS[p] ?? '📱'} {p}
            </span>
          ))}
        </div>
      )}

      {/* Stats row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
        <div>
          <div className="kol-price">
            {kol.basePrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
          </div>
          <div className="kol-engagement">/ booking</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          {kol.avgEngagementRate != null && (
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--success)' }}>
              {Number(kol.avgEngagementRate).toFixed(1)}% ER
            </div>
          )}
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {totalFollowers.toLocaleString()} followers
          </div>
        </div>
      </div>

      {kol.distanceKm != null && (
        <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          📍 Cách {kol.distanceKm} km
        </div>
      )}
    </Link>
  );
}
