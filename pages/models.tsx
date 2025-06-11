// pages/models.tsx
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import LayoutDashboard from '../components/LayoutDashboard';

type Model = {
  id: number;
  name: string;
  age: number;
  active: boolean;
  created_at: string;
  persona?: Record<string, any>;
};

export default function ModelsPage() {
  const router = useRouter();
  const [models, setModels] = useState<Model[]>([]);

  useEffect(() => {
    fetch('/api/models')
      .then((res) => res.json())
      .then((data) => setModels(data.models || []))
      .catch((err) => console.error('Erreur chargement modèles:', err));
  }, []);

  const handleAddModel = () => {
    const id = Math.random().toString(36).substring(2, 10);
    router.push(`/connect/${id}`);
  };

  return (
    <LayoutDashboard>
      <div className="text-white">
        <h1 className="text-3xl font-bold mb-6">🤖 Modèles IA</h1>
        <div className="grid md:grid-cols-2 gap-6">
          {models.map((m) => (
            <div key={m.id} className="bg-[#131b2c] p-4 rounded-xl border border-purple-700">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-semibold text-purple-400">{m.name}</h3>
                <span className={`text-sm ${m.active ? 'text-green-400' : 'text-red-400'}`}>
                  {m.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-sm text-gray-400">Âge : {m.age}</p>
              <p className="text-sm text-gray-400">Créée le : {new Date(m.created_at).toLocaleDateString()}</p>
              {m.persona && (
                <pre className="text-xs text-gray-500 mt-2 bg-black/30 p-2 rounded">
                  {JSON.stringify(m.persona, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <button
            onClick={handleAddModel}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-3 rounded shadow"
          >
            ➕ Ajouter une modèle
          </button>
        </div>
      </div>
    </LayoutDashboard>
  );
}
