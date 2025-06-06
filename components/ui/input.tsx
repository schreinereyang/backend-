export function Input({ value, onChange, placeholder }: any) {
  return (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-3 py-2 rounded bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-pink-500"
    />
  );
}