import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function RutinasPage() {
  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-end">
        <Link href="/rutinas/nueva">
          <Button>Crear rutina</Button>
        </Link>
      </div>
      <p className="text-sm text-muted-foreground">No hay rutinas guardadas.</p>
    </div>
  )
}
