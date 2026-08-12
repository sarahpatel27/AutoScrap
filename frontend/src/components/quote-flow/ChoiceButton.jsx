export default function ChoiceButton({
  selected,
  negative = false,
  children,
  ...props
}) {
  return (
    <button
      className={`cursor-pointer rounded-lg border px-4 py-2 font-extrabold ${
        selected
          ? negative
            ? 'border-orange-800 bg-orange-800 text-white'
            : 'border-[#0f7b4f] bg-[#0f7b4f] text-white'
          : 'border-slate-200 bg-white text-slate-950'
      }`}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}
