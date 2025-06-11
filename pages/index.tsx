// pages/index.tsx
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0b0f1a] text-white flex flex-col items-center justify-center px-4 py-20">
      <h1 className="text-4xl font-bold text-purple-400 mb-4">
        👋 Bienvenue sur OnlyMoly
      </h1>
      <p className="text-lg text-gray-300 mb-10 text-center max-w-xl">
        Connecte ton compte OnlyFans, automatise tes ventes, et laisse l'IA faire le reste. 🚀
      </p>

      <Link href="/models">
        <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded text-white font-semibold transition">
          🔐 Lancer la plateforme
        </button>
      </Link>
    </div>
  );
}
