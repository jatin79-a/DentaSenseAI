import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { RoleProvider } from '@/components/common/RoleContext';

export const metadata: Metadata = {
  title: 'DentaSense AI — Intelligent Dental Screening & Triage',
  description:
    'AI-assisted oral screening combining image quality analysis, two-way conversational interviews, and deterministic clinical safety triage.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased">
        <RoleProvider>
          <Navbar />
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
        </RoleProvider>
      </body>
    </html>
  );
}
