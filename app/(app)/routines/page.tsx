'use client';
import { useState } from 'react';

interface Exercise {
  name: string;
  series: number;
  reps: string;
  rest: string;
}

interface Day {
  title: string;
  exercises: Exercise[];
}

const routine: Day[] = [
  {
    title: 'Día 1 – Empuje (Pecho, Hombros, Tríceps)',
    exercises: [
      { name: 'Press banca plano (barra)', series: 4, reps: '6–8', rest: '2–3 min' },
      { name: 'Press inclinado mancuernas', series: 3, reps: '8–10', rest: '90s' },
      { name: 'Press militar (barra/mancuernas)', series: 4, reps: '6–8', rest: '2–3 min' },
      { name: 'Elevaciones laterales mancuernas', series: 3, reps: '12–15', rest: '60–90s' },
      { name: 'Fondos en paralelas', series: 3, reps: '8–12', rest: '90s' },
      { name: 'Extensión tríceps en cuerda (polea)', series: 3, reps: '12–15', rest: '60s' },
      { name: 'Press cerrado en banco', series: 3, reps: '8–10', rest: '90s' },
    ],
  },
  {
    title: 'Día 2 – Tirón (Espalda, Bíceps, Trapecio)',
    exercises: [
      { name: 'Dominadas (lastradas o jalón al pecho)', series: 4, reps: '6–8', rest: '2–3 min' },
      { name: 'Remo con barra', series: 4, reps: '8–10', rest: '2–3 min' },
      { name: 'Remo mancuerna unilateral', series: 3, reps: '10–12', rest: '90s' },
      { name: 'Facepull (polea/gomas)', series: 3, reps: '12–15', rest: '60–90s' },
      { name: 'Curl bíceps barra', series: 3, reps: '8–10', rest: '90s' },
      { name: 'Curl bíceps inclinado mancuernas', series: 3, reps: '10–12', rest: '90s' },
      { name: 'Encogimientos trapecio (mancuernas)', series: 3, reps: '12–15', rest: '60s' },
    ],
  },
  {
    title: 'Día 3 – Empuje (Piernas anterior + Core)',
    exercises: [
      { name: 'Sentadilla barra', series: 4, reps: '6–8', rest: '2–3 min' },
      { name: 'Prensa inclinada', series: 4, reps: '8–10', rest: '2 min' },
      { name: 'Zancadas mancuernas', series: 3, reps: '10–12', rest: '90s' },
      { name: 'Peso muerto rumano', series: 3, reps: '8–10', rest: '2 min' },
      { name: 'Gemelos en máquina', series: 4, reps: '12–15', rest: '60–90s' },
      { name: 'Plancha + rueda abdominal', series: 3, reps: '30–60s / 8–12 reps', rest: '60s' },
    ],
  },
  {
    title: 'Día 4 – Tirón (Piernas posterior + Espalda + Core)',
    exercises: [
      { name: 'Peso muerto convencional', series: 4, reps: '5–6', rest: '3 min' },
      { name: 'Dominadas supinas (agarre cerrado)', series: 4, reps: '8–10', rest: '2–3 min' },
      { name: 'Remo en polea baja', series: 3, reps: '10–12', rest: '90s' },
      { name: 'Curl femoral tumbado', series: 4, reps: '10–12', rest: '90s' },
      { name: 'Curl bíceps martillo', series: 3, reps: '10–12', rest: '90s' },
      { name: 'Facepull / pájaros', series: 3, reps: '12–15', rest: '60–90s' },
      { name: 'Abdominales en polea', series: 3, reps: '12–15', rest: '60s' },
    ],
  },
];

interface Entry {
  weight: string;
  reps: string;
  comment: string;
}

export default function RoutinesPage() {
  const [entries, setEntries] = useState<Record<string, Entry>>({});

  const handleChange = (key: string, field: keyof Entry, value: string) => {
    setEntries((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  };

  return (
    <div className="space-y-4">
      {routine.map((day, dayIdx) => (
        <div key={dayIdx} className="rounded-2xl border p-4">
          <h3 className="font-semibold mb-2">{day.title}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="p-2">Ejercicio</th>
                  <th className="p-2">Series</th>
                  <th className="p-2">Reps</th>
                  <th className="p-2">Descanso</th>
                  <th className="p-2">Kilos</th>
                  <th className="p-2">Repes</th>
                  <th className="p-2">Comentario</th>
                </tr>
              </thead>
              <tbody>
                {day.exercises.map((ex, exIdx) => {
                  const key = `${dayIdx}-${exIdx}`;
                  const entry = entries[key] || { weight: '', reps: '', comment: '' };
                  return (
                    <tr key={exIdx} className="border-t">
                      <td className="p-2">{ex.name}</td>
                      <td className="p-2">{ex.series}</td>
                      <td className="p-2">{ex.reps}</td>
                      <td className="p-2">{ex.rest}</td>
                      <td className="p-2">
                        <input
                          type="number"
                          value={entry.weight}
                          onChange={(e) => handleChange(key, 'weight', e.target.value)}
                          className="w-20 border rounded px-2 py-1"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          value={entry.reps}
                          onChange={(e) => handleChange(key, 'reps', e.target.value)}
                          className="w-16 border rounded px-2 py-1"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          value={entry.comment}
                          onChange={(e) => handleChange(key, 'comment', e.target.value)}
                          className="w-full border rounded px-2 py-1"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

