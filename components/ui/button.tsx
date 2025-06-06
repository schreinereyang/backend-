export function Button({ children, onClick, className }: any) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded bg-pink-600 hover:bg-pink-700 transition ${className}`}
    >
      {children}
    </button>
  );
}