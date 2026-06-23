// src/app/layout.tsx
import Navbar from '@/components/Navbar';
import { ThemeProvider } from '@/components/ThemeProvider';
import '@/styles/globals.css';

export const metadata = {
  title: 'Bangla Typing Test by Jahid',
  description: 'Advanced Unijoy Unicode Bangla Typing Engine',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn" className="transition-colors duration-200">
      <body className="bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 min-h-screen font-sans">
        <ThemeProvider>
          <Navbar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
