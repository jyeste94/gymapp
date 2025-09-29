export default function SettingsPage() {
  return (
    <div className="glass-card border-[rgba(10,46,92,0.16)] bg-white/80 p-6">
      <h2 className="text-lg font-semibold text-zinc-900">Ajustes</h2>
      <p className="mt-2 text-sm text-[#4b5a72]">Personaliza unidades, objetivos y preferencias de la app.</p>
      <ul className="mt-4 space-y-2 text-sm text-[#4b5a72]">
        <li>? Perfil y unidades</li>
        <li>? Tema claro/oscuro</li>
        <li>? Objetivos caloricos y macros</li>
      </ul>
    </div>
  );
}


