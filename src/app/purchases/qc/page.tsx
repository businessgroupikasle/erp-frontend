import React from 'react';
import QCClient from '@/components/modules/purchases/QCClient';

export const metadata = {
  title: 'Quality Control | Food ERP',
  description: 'Manage material inspections and quality assurance workflows.',
};

export default function QCPage() {
  return <QCClient />;
}
