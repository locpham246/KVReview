import Link from 'next/link';

const FEATURES = [
  { icon: '🎯', title: 'Tìm KOL Phù Hợp', desc: 'Lọc theo khu vực, nền tảng, ngân sách và chỉ số tương tác thực tế' },
  { icon: '📊', title: 'Giá Tự Động & Minh Bạch', desc: 'Giá KOL được tính toán tự động dựa trên followers, engagement rate và tier' },
  { icon: '🔄', title: 'Quy Trình Đơn Giản', desc: 'Gửi booking → KOL xác nhận → Thực hiện review → Đánh giá' },
  { icon: '⭐', title: 'Bảng Xếp Hạng KOL', desc: 'Top KOL được cập nhật theo engagement rate và lịch sử hợp tác' },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Nhà hàng đăng ký', desc: 'Tạo tài khoản và hoàn thiện hồ sơ nhà hàng của bạn' },
  { step: '02', title: 'Tìm kiếm KOL', desc: 'Lọc theo khu vực, nền tảng mạng xã hội và ngân sách' },
  { step: '03', title: 'Gửi yêu cầu booking', desc: 'Đề nghị giá và thời gian thực hiện review' },
  { step: '04', title: 'KOL review & nhà hàng đánh giá', desc: 'Xây dựng thương hiệu qua nội dung thực tế từ KOL' },
];

export default function HomePage() {
  return (
    <main>
      {/* ─── Hero ─────────────────────────────────────────────── */}
      <section className="hero">
        <div className="container hero-content">
          <div style={{ maxWidth: 700 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: 'rgba(255,107,53,0.1)', border: '1px solid rgba(255,107,53,0.3)',
              borderRadius: 'var(--radius-full)', padding: '0.4rem 1rem',
              fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)', marginBottom: '1.5rem' }}>
              🚀 Nền tảng KOL ẩm thực #1 Việt Nam
            </div>
            <h1 className="hero-title fade-up">
              Kết nối nhà hàng với <span>KOL ẩm thực</span> uy tín
            </h1>
            <p className="hero-subtitle fade-up" style={{ animationDelay: '0.1s' }}>
              KVReview giúp nhà hàng tìm kiếm và hợp tác với KOL review ẩm thực phù hợp nhất — nhanh chóng, minh bạch và hiệu quả.
            </p>
            <div className="hero-cta fade-up" style={{ animationDelay: '0.2s' }}>
              <Link href="/register" className="btn btn-primary btn-lg">
                Bắt đầu ngay 🍜
              </Link>
              <Link href="/kols" className="btn btn-secondary btn-lg">
                Xem danh sách KOL →
              </Link>
            </div>

            <div className="hero-stats fade-up" style={{ animationDelay: '0.3s' }}>
              {[
                { n: '500+', l: 'KOL ẩm thực' },
                { n: '1,200+', l: 'Nhà hàng' },
                { n: '8,500+', l: 'Booking thành công' },
                { n: '4.8★', l: 'Đánh giá trung bình' },
              ].map(s => (
                <div key={s.l} className="stat-item">
                  <div className="stat-number">{s.n}</div>
                  <div className="stat-label">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features ─────────────────────────────────────────── */}
      <section className="section" style={{ background: 'var(--surface)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2>Tại sao chọn KVReview?</h2>
            <p style={{ marginTop: '0.75rem', maxWidth: 500, margin: '0.75rem auto 0' }}>
              Giải pháp toàn diện cho marketing ẩm thực qua KOL
            </p>
          </div>
          <div className="grid-4">
            {FEATURES.map(f => (
              <div key={f.title} className="card" style={{ padding: '2rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{f.icon}</div>
                <h3 style={{ marginBottom: '0.75rem' }}>{f.title}</h3>
                <p style={{ fontSize: '0.9rem', lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How it works ─────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2>Quy trình hoạt động</h2>
          </div>
          <div className="grid-4">
            {HOW_IT_WORKS.map((s, i) => (
              <div key={s.step} style={{ textAlign: 'center', position: 'relative' }}>
                {i < HOW_IT_WORKS.length - 1 && (
                  <div style={{ position: 'absolute', top: '1.5rem', right: '-1rem',
                    width: '2rem', height: '2px', background: 'var(--border)' }} />
                )}
                <div style={{ width: '4rem', height: '4rem', borderRadius: 'var(--radius-full)',
                  background: 'rgba(255,107,53,0.1)', border: '2px solid var(--primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1.25rem', fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>
                  {s.step}
                </div>
                <h4 style={{ marginBottom: '0.5rem' }}>{s.title}</h4>
                <p style={{ fontSize: '0.875rem' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────────── */}
      <section className="section" style={{ background: 'var(--surface)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(255,107,53,0.1) 0%, rgba(233,69,96,0.1) 100%)',
            border: '1px solid rgba(255,107,53,0.2)',
            borderRadius: 'var(--radius-xl)', padding: '4rem 2rem'
          }}>
            <h2 style={{ marginBottom: '1rem' }}>Sẵn sàng bắt đầu?</h2>
            <p style={{ marginBottom: '2rem', maxWidth: 500, margin: '0 auto 2rem' }}>
              Đăng ký miễn phí và kết nối với hàng trăm KOL ẩm thực hàng đầu ngay hôm nay.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/register?role=restaurant" className="btn btn-primary btn-lg">
                🍽️ Tôi là Nhà hàng
              </Link>
              <Link href="/register?role=kol" className="btn btn-secondary btn-lg">
                ⭐ Tôi là KOL
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ───────────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '2rem 0', marginTop: '1rem' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div className="logo">
            <div className="logo-icon">🍜</div>
            <span>KV<span style={{ color: 'var(--primary)' }}>Review</span></span>
          </div>
          <p style={{ fontSize: '0.85rem' }}>© 2026 KVReview. Marketplace KOL ẩm thực Việt Nam.</p>
        </div>
      </footer>
    </main>
  );
}
