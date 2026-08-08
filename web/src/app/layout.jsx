import './site.css';
import './course.css';
import './experiments.css';
import Topbar from '@/components/Topbar';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'GESP C++ 学习中心',
  description: 'GESP C++ 备考学习中心：1-8 级课程、错题复习、官方考纲与真题资料库。'
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>
        <div className="page-shell">
          <Topbar />
          <main>{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
