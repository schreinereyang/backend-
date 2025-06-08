// pages/import.js
import { useState } from 'react';

export default function ImportPage() {
  const [persona, setPersona] = useState('');
  const [funnel, setFunnel] = useState('');
  const [preview, setPreview] = useState({ persona: null, funnel: null });
  const [status, setStatus] = useState('');

  const handleFile = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target.result);
        if (type === 'persona') {
          setPersona(evt.target.result);
          setPreview((p) => ({ ...p, persona: parsed }));
        } else {
          setFunnel(evt.target.result);
          setPreview((p) => ({ ...p, funnel: parsed }));
        }
      } catch (err) {
        setStatus('❌ Fichier invalide');
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = async () => {
    setStatus('⏳ Envoi en cours...');
    try {
      const res = await fetch('/api/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: preview.persona?.name || 'Nouveau modèle',
          age: preview.persona?.age || 20,
          assistant_id: '', // à remplir manuellement plus tard
          persona: JSON.parse(persona),
          funnel: JSON.parse(funnel),
          cookies: {} // à connecter plus tard
        })
      });

      if (res.ok) {
        setStatus('✅ Importation réussie');
      } else {
        const err = await res.json();
        setStatus('❌ Erreur : ' + err.error);
      }
    } catch (e) {
      setStatus('❌ Erreur lors de l\'envoi');
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Importer QCM & Funnel</h1>

      <div className="mb-4">
        <label className="block font-semibold">📄 Fichier QCM (persona.json)</label>
        <input type="file" accept=".json" onChange={(e) => handleFile(e, 'persona')} className="mt-1" />
        {preview.persona && (
          <pre className="bg-gray-100 p-2 mt-2 text-sm overflow-auto max-h-40">
            {JSON.stringify(preview.persona, null, 2)}
          </pre>
        )}
      </div>

      <div className="mb-4">
        <label className="block font-semibold">📜 Fichier Funnel (funnel.json)</label>
        <input type="file" accept=".json" onChange={(e) => handleFile(e, 'funnel')} className="mt-1" />
        {preview.funnel && (
          <pre className="bg-gray-100 p-2 mt-2 text-sm overflow-auto max-h-40">
            {JSON.stringify(preview.funnel.slice(0, 2), null, 2)}...
          </pre>
        )}
      </div>

      <button onClick={handleSubmit} className="bg-green-600 text-white px-4 py-2 rounded">
        💾 Enregistrer le modèle
      </button>

      {status && <p className="mt-4 text-sm text-gray-700">{status}</p>}
    </div>
  );
}
