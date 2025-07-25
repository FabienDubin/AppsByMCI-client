import React, { useState } from "react";
import { DateInput } from "@/components/ui/date-input";
import { Label } from "@/components/ui/label";

const TestDateInput = () => {
  const [date1, setDate1] = useState(null);
  const [date2, setDate2] = useState(new Date());
  const [date3, setDate3] = useState(null);

  return (
    <div className="flex flex-col items-center gap-6 p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold">Test DateInput</h1>
      
      <div className="w-full space-y-6">
        {/* Test basique */}
        <div className="space-y-2">
          <Label htmlFor="date1">Date vide (test basique)</Label>
          <DateInput
            id="date1"
            value={date1}
            onChange={setDate1}
            placeholder="JJ/MM/AAAA"
          />
          <p className="text-sm text-gray-600">
            Valeur : {date1 ? date1.toLocaleDateString("fr-FR") : "null"}
          </p>
        </div>

        {/* Test avec valeur initiale */}
        <div className="space-y-2">
          <Label htmlFor="date2">Date avec valeur initiale (aujourd'hui)</Label>
          <DateInput
            id="date2"
            value={date2}
            onChange={setDate2}
            placeholder="JJ/MM/AAAA"
          />
          <p className="text-sm text-gray-600">
            Valeur : {date2 ? date2.toLocaleDateString("fr-FR") : "null"}
          </p>
        </div>

        {/* Test avec erreur */}
        <div className="space-y-2">
          <Label htmlFor="date3">Date avec état d'erreur</Label>
          <DateInput
            id="date3"
            value={date3}
            onChange={setDate3}
            placeholder="JJ/MM/AAAA"
            error={true}
          />
          <p className="text-sm text-red-500">Ceci est un état d'erreur</p>
          <p className="text-sm text-gray-600">
            Valeur : {date3 ? date3.toLocaleDateString("fr-FR") : "null"}
          </p>
        </div>

        {/* Test désactivé */}
        <div className="space-y-2">
          <Label htmlFor="date4">Date désactivée</Label>
          <DateInput
            id="date4"
            value={new Date(2024, 11, 25)} // 25 décembre 2024
            onChange={() => {}}
            placeholder="JJ/MM/AAAA"
            disabled={true}
          />
          <p className="text-sm text-gray-600">Cet input est désactivé</p>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h2 className="font-semibold mb-2">Instructions de test :</h2>
        <ul className="text-sm space-y-1 list-disc list-inside">
          <li>Tapez des chiffres, les "/" apparaissent automatiquement</li>
          <li>Les "/" deviennent noirs quand les chiffres précédents sont complets</li>
          <li>Essayez de supprimer les "/" avec Backspace (ne devrait pas marcher)</li>
          <li>Testez des dates invalides (31/02/2024, 32/12/2024, etc.)</li>
          <li>La bordure devient orange pour les dates invalides</li>
        </ul>
      </div>
    </div>
  );
};

export default TestDateInput;