import React from 'react';
import QCClient from '@/components/modules/purchases/QCClient';

export const metadata = {
  title: 'Quality Control | Food ERP',
  description: 'Manage material inspections and quality assurance workflows.',
};

export default function QCPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0c]">
      <QCClient />
    </main>
  );
}
