import { NextResponse } from "next/server"
import { exerciseSchema } from "@/lib/schemas/exercise"
import type { Exercise } from "@/lib/models/exercise"

const exercises: Exercise[] = []

export async function GET() {
  return NextResponse.json(exercises)
}

export async function POST(req: Request) {
  const json = await req.json()
  const parse = exerciseSchema.safeParse(json)
  if (!parse.success) {
    return NextResponse.json({ error: parse.error.flatten() }, { status: 400 })
  }
  exercises.push(parse.data)
  return NextResponse.json(parse.data, { status: 201 })
}
