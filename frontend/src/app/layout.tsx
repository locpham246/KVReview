import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'KVReview — Marketplace KOL Ẩm Thực',
  description: 'Kết nối nhà hàng với KOL (Key Opinion Leader) để thực hiện dịch vụ review ẩm thực chuyên nghiệp',
  keywords: 'KOL, review ẩm thực, nhà hàng, marketing, influencer',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
