interface Props { label: string; onClick: () => void; }
export default function ChoiceButton({ label, onClick }: Props) {
  return (
    <button type="button" onClick={onClick} className="w-full md:w-80 rounded-full bg-burgundy text-white px-7 py-4 text-left text-sm font-semibold tracking-wide hover:bg-[#541626] transition flex items-center justify-between">
      <span>{label.toUpperCase()}</span><span aria-hidden>→</span>
    </button>
  );
}
