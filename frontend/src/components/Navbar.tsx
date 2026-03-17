'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getRole, clearAuth } from '@/lib/api';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setRole(getRole());
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    clearAuth();
    setRole(null);
    router.push('/');
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <nav className="navbar" style={{ boxShadow: scrolled ? 'var(--shadow-md)' : 'none' }}>
      <div className="container navbar-inner">
        {/* Logo */}
        <Link href="/" className="logo">
          <div className="logo-icon">🍜</div>
          <span>KV<span style={{ color: 'var(--primary)' }}>Review</span></span>
        </Link>

        {/* Nav Links */}
        <nav className="nav-links">
          <Link href="/kols" className={`nav-link ${isActive('/kols') ? 'active' : ''}`}>
            Tìm KOL
          </Link>
          <Link href="/ranking" className={`nav-link ${isActive('/ranking') ? 'active' : ''}`}>
            Bảng xếp hạng
          </Link>
          {role === 'restaurant' && (
            <Link href="/dashboard/restaurant" className={`nav-link ${isActive('/dashboard/restaurant') ? 'active' : ''}`}>
              Dashboard
            </Link>
          )}
          {role === 'kol' && (
            <Link href="/dashboard/kol" className={`nav-link ${isActive('/dashboard/kol') ? 'active' : ''}`}>
              Dashboard
            </Link>
          )}
        </nav>

        {/* Actions */}
        <div className="nav-actions">
          {role ? (
            <>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                {role === 'restaurant' ? '🍽️' : '⭐'} {role}
              </span>
              <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost btn-sm">
                Đăng nhập
              </Link>
              <Link href="/register" className="btn btn-primary btn-sm">
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
