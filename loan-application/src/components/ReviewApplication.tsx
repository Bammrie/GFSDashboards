import { LoanApplication } from '../types/application';

export default function ReviewApplication({ application, onEdit }: { application: LoanApplication; onEdit: (id: string) => void }) {
  return <div className="space-y-3">{Object.entries(application).map(([k, v]) => <div key={k} className="border rounded-xl px-4 py-3 flex justify-between"><div><p className="text-xs text-gray-500">{k}</p><p className="font-medium">{v}</p></div><button className="text-burgundy" onClick={() => onEdit(k)}>Edit</button></div>)}</div>;
}
