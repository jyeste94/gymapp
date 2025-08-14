import { notFound } from "next/navigation"
import { exercises } from "@/data/exercises"
import { ExerciseDetail } from "@/components/exercises/exercise-detail"

interface ExercisePageProps {
  params: {
    slug: string
  }
}

export default function ExercisePage({ params }: ExercisePageProps) {
  const exercise = exercises.find((ex) => ex.slug === params.slug)

  if (!exercise) {
    notFound()
  }

  return <ExerciseDetail exercise={exercise} />
}

export function generateStaticParams() {
  return exercises.map((exercise) => ({
    slug: exercise.slug,
  }))
}
