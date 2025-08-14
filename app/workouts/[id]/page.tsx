import { notFound } from "next/navigation"
import { workoutTemplates } from "@/data/templates"
import { WorkoutTemplateDetail } from "@/components/workouts/workout-template-detail"

interface WorkoutTemplatePageProps {
  params: {
    id: string
  }
}

export default function WorkoutTemplatePage({ params }: WorkoutTemplatePageProps) {
  const template = workoutTemplates.find((t) => t.id === params.id)

  if (!template) {
    notFound()
  }

  return <WorkoutTemplateDetail template={template} />
}

export function generateStaticParams() {
  return workoutTemplates.map((template) => ({
    id: template.id,
  }))
}
