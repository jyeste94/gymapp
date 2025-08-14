"use client"

import { useState } from "react"
import { workoutTemplates } from "@/data/templates"
import { WorkoutTemplateCard } from "@/components/workouts/workout-template-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search } from "lucide-react"
import Link from "next/link"

const goalOptions = ["fuerza", "hipertrofia", "potencia", "mixto"]

export default function WorkoutsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])

  const filteredTemplates = workoutTemplates.filter((template) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesSearch =
        template.name.toLowerCase().includes(query) || (template.goal && template.goal.toLowerCase().includes(query))
      if (!matchesSearch) return false
    }

    // Goal filter
    if (selectedGoals.length > 0 && template.goal && !selectedGoals.includes(template.goal)) {
      return false
    }

    return true
  })

  const toggleGoal = (goal: string) => {
    if (selectedGoals.includes(goal)) {
      setSelectedGoals(selectedGoals.filter((g) => g !== goal))
    } else {
      setSelectedGoals([...selectedGoals, goal])
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Rutinas de Entrenamiento</h1>
          <p className="text-muted-foreground">Plantillas prediseñadas y rutinas personalizadas</p>
        </div>
        <Button asChild>
          <Link href="/workouts/new">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Rutina
          </Link>
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar rutinas por nombre o objetivo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div>
          <h3 className="text-sm font-medium mb-2">Filtrar por objetivo:</h3>
          <div className="flex flex-wrap gap-2">
            {goalOptions.map((goal) => (
              <Badge
                key={goal}
                variant={selectedGoals.includes(goal) ? "default" : "secondary"}
                className="cursor-pointer capitalize"
                onClick={() => toggleGoal(goal)}
              >
                {goal}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          Mostrando {filteredTemplates.length} de {workoutTemplates.length} rutinas
        </p>
      </div>

      {/* Templates Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.map((template) => (
          <WorkoutTemplateCard key={template.id} template={template} />
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No se encontraron rutinas con los filtros seleccionados.</p>
          <Button asChild>
            <Link href="/workouts/new">Crear Nueva Rutina</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
