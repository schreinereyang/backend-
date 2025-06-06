export function Card({ children, className }: any) {
  return <div className={`rounded-xl shadow bg-white/5 ${className}`}>{children}</div>;
}

export function CardContent({ children, className }: any) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}