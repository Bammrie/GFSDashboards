export default function ProgressIndicator({ current, total }: { current: number; total: number }) {
  return <div className="h-2 bg-gray-200 rounded-full"><div className="h-2 bg-tan rounded-full transition-all" style={{ width: `${(current / total) * 100}%` }} /></div>;
}
