export default function SettingsPage() {
  return (
    <div className="rounded-2xl border p-4 space-y-2">
      <h3 className="font-semibold">Ajustes</h3>
      <ul className="list-disc pl-6 text-sm text-zinc-700">
        <li>Perfil y unidades</li>
        <li>Tema oscuro/claro</li>
        <li>Objetivo calórico/macro</li>
      </ul>
    </div>
  );
}
