export default function DetailItem({ label, children }) {
  return (
    <span className="flex flex-col">
      <small className="text-slate-500">{label}</small>
      {children}
    </span>
  );
}
