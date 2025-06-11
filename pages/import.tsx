// pages/import.tsx
import { useState, ChangeEvent } from 'react';

export default function ImportPage() {
  const [persona, setPersona] = useState<string>('');
  const [funnel, setFunnel] = useState<string>('');
  const [preview, setPreview] = useState<{ persona: any; funnel: any }>({ persona: null, funnel: null });
  const [status, setStatus] = useState<string>('');

  const handleFile = (e: ChangeEvent<HTMLInputElement>, type: 'persona' | 'funnel') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const content = evt.target?.result as string;
        const parsed = JSON.parse(content);
        if (type === 'persona') {
          setPersona(content);
          setPreview((p) => ({ ...p, persona: parsed }));
        } else {
          setFunnel(content);
          setPreview((p) => ({ ...p, funnel: parsed }));
        }
      } catch (err) {
        setStatus('❌ Fichier invalide');
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = async () => {
    if (!persona || !funnel) {
      setStatus('❌ Merci d’importer les deux fichiers.');
      return;
    }

    setStatus('⏳ Envoi en cours...');
    try {
      const res = await fetch('/api/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: preview.persona?.name || 'Nouveau modèle',
          age: preview.persona?.age || 20,
          assistant_id: '', // à ajouter plus tard
          persona: JSON.parse(persona),
          funnel: JSON.parse(funnel),
          cookies: {},
        }),
      });

      if (res.ok) {
        setStatus('✅ Importation réussie');
      } else {
        const err = await res.json();
        setStatus('❌ Erreur : ' + err.error);
      }
    } catch (e) {
      setStatus('❌ Erreur lors de l’envoi');
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f1a] text-white px-6 py-10 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-purple-400 mb-8 text-center">📦 Importer QCM + Funnel</h1>

      <div className="mb-6">
        <label className="block font-semibold mb-2">📄 Fichier QCM (persona.json)</label>
        <input type="file" accept=".json" onChange={(e) => handleFile(e, 'persona')} />
        {preview.persona && (
          <pre className="bg-white/10 text-sm p-2 mt-2 rounded overflow-auto max-h-40">
            {JSON.stringify(preview.persona, null, 2)}
          </pre>
        )}
      </div>

      <div className="mb-6">
        <label className="block font-semibold mb-2">📜 Fichier Funnel (funnel.json)</label>
        <input type="file" accept=".json" onChange={(e) => handleFile(e, 'funnel')} />
        {preview.funnel && (
          <pre className="bg-white/10 text-sm p-2 mt-2 rounded overflow-auto max-h-40">
            {JSON.stringify(preview.funnel.slice(0, 2), null, 2)}...
          </pre>
        )}
      </div>

      <button
        onClick={handleSubmit}
        className="bg-green-600 hover:bg-green-700 px-6 py-2 text-white rounded font-semibold"
      >
        💾 Enregistrer le modèle
      </button>

      {status && <p className="mt-4 text-sm text-yellow-400">{status}</p>}
    </div>
  );
}
