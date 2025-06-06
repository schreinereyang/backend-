// pages/index.tsx (accueil admin - MVP OnlyMoly)

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function DashboardMVP() {
  const [models, setModels] = useState([]);
  const [newModel, setNewModel] = useState({
    name: "",
    assistantId: "",
    age: "",
    style: "",
  });

  const handleAddModel = () => {
    if (!newModel.name || !newModel.assistantId) return;
    setModels([...models, newModel]);
    setNewModel({ name: "", assistantId: "", age: "", style: "" });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">🎛️ OnlyMoly Admin - Dashboard MVP</h1>

      <Card className="bg-gray-800 mb-6">
        <CardContent className="space-y-4 p-4">
          <h2 className="text-xl font-semibold">➕ Ajouter un modèle IA</h2>
          <Input
            placeholder="Nom du modèle (ex: Eli)"
            value={newModel.name}
            onChange={(e) => setNewModel({ ...newModel, name: e.target.value })}
          />
          <Input
            placeholder="Assistant ID OpenAI"
            value={newModel.assistantId}
            onChange={(e) => setNewModel({ ...newModel, assistantId: e.target.value })}
          />
          <Input
            placeholder="Âge du modèle (optionnel)"
            value={newModel.age}
            onChange={(e) => setNewModel({ ...newModel, age: e.target.value })}
          />
          <Input
            placeholder="Style ou personnalité (ex: douce, joueuse…)"
            value={newModel.style}
            onChange={(e) => setNewModel({ ...newModel, style: e.target.value })}
          />
          <Button onClick={handleAddModel} className="bg-pink-600 hover:bg-pink-700">
            Ajouter le modèle
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">📋 Modèles enregistrés</h2>
        {models.map((model, index) => (
          <Card key={index} className="bg-gray-800">
            <CardContent className="p-4">
              <p><strong>Nom :</strong> {model.name}</p>
              <p><strong>Assistant ID :</strong> {model.assistantId}</p>
              <p><strong>Âge :</strong> {model.age}</p>
              <p><strong>Style :</strong> {model.style}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
