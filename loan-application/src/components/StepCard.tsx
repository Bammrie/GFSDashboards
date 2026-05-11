import { ReactNode } from 'react';
export default function StepCard({ title, children }: { title: string; children: ReactNode }) {
  return <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-10"><h1 className="text-2xl font-semibold text-gray-900 mb-6">{title}</h1>{children}</section>;
}
