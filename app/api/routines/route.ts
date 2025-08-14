import { NextResponse } from "next/server"
import { routineSchema } from "@/lib/schemas/routine"
import type { Routine } from "@/lib/models/routine"

const routines: Routine[] = []

export async function GET() {
  return NextResponse.json(routines)
}

export async function POST(req: Request) {
  const json = await req.json()
  const parse = routineSchema.safeParse(json)
  if (!parse.success) {
    return NextResponse.json({ error: parse.error.flatten() }, { status: 400 })
  }
  routines.push(parse.data)
  return NextResponse.json(parse.data, { status: 201 })
}
