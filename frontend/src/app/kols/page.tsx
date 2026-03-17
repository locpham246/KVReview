'use client';
import { useState, useEffect } from 'react';
import { kolApi } from '@/lib/api';
import type { KolProfile } from '@/lib/api';
import KolCard from '@/components/KolCard';

const PLATFORMS = ['', 'tiktok', 'instagram', 'youtube', 'facebook'];
const TIERS = ['', 'nano', 'micro', 'macro', 'mega'];

export default function KolsPage() {
  const [kols, setKols] = useState<KolProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    platform: '', tier: '', minPrice: '', maxPrice: '', radiusKm: '50',
  });

  const search = async () => {
    setLoading(true); setError('');
    try {
      const params: Record<string, string | number | undefined> = {};
      if (filters.platform) params.platform = filters.platform;
      if (filters.tier) params.tier = filters.tier;
      if (filters.minPrice) params.minPrice = Number(filters.minPrice);
      if (filters.maxPrice) params.maxPrice = Number(filters.maxPrice);
      params.pageSize = 24;
      const result = await kolApi.search(params);
      setKols(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách KOL');
    } finally { setLoading(false); }
  };

  useEffect(() => { search(); }, []);

  const set = (f: string, v: string) => setFilters(p => ({ ...p, [f]: v }));

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Tìm kiếm KOL ẩm thực 🍜</h1>
          <p className="page-subtitle">Khám phá hàng trăm KOL ẩm thực uy tín theo nhu cầu của bạn</p>
        </div>

        {/* Filter bar */}
        <div className="filter-bar">
          <div className="input-group" style={{ minWidth: 160 }}>
            <label className="input-label">Nền tảng</label>
            <select id="filter-platform" className="input-field" value={filters.platform} onChange={e => set('platform', e.target.value)}>
              <option value="">Tất cả</option>
              {PLATFORMS.filter(Boolean).map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="input-group" style={{ minWidth: 140 }}>
            <label className="input-label">Tier</label>
            <select id="filter-tier" className="input-field" value={filters.tier} onChange={e => set('tier', e.target.value)}>
              <option value="">Tất cả</option>
              {TIERS.filter(Boolean).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="input-group" style={{ minWidth: 140 }}>
            <label className="input-label">Giá tối thiểu (đ)</label>
            <input id="filter-min-price" type="number" className="input-field" placeholder="0"
              value={filters.minPrice} onChange={e => set('minPrice', e.target.value)} />
          </div>
          <div className="input-group" style={{ minWidth: 140 }}>
            <label className="input-label">Giá tối đa (đ)</label>
            <input id="filter-max-price" type="number" className="input-field" placeholder="Không giới hạn"
              value={filters.maxPrice} onChange={e => set('maxPrice', e.target.value)} />
          </div>
          <button id="search-btn" onClick={search} className="btn btn-primary" disabled={loading}
            style={{ alignSelf: 'flex-end' }}>
            {loading ? '⏳' : '🔍'} Tìm kiếm
          </button>
        </div>

        {/* Error */}
        {error && <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>{error}</div>}

        {/* Results */}
        {loading ? (
          <div className="grid-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 240 }} />
            ))}
          </div>
        ) : kols.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
            <h3>Không tìm thấy KOL phù hợp</h3>
            <p style={{ marginTop: '0.5rem' }}>Thử thay đổi bộ lọc của bạn</p>
          </div>
        ) : (
          <>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
              Tìm thấy <strong style={{ color: 'var(--text-primary)' }}>{kols.length}</strong> KOL
            </p>
            <div className="grid-3">
              {kols.map(kol => <KolCard key={kol.userId} kol={kol} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
