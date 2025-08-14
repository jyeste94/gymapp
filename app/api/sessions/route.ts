import { NextResponse } from "next/server"
import { sessionSchema } from "@/lib/schemas/session"
import type { Session } from "@/lib/models/session"

const sessions: Session[] = []

export async function GET() {
  return NextResponse.json(sessions)
}

export async function POST(req: Request) {
  const json = await req.json()
  const parse = sessionSchema.safeParse(json)
  if (!parse.success) {
    return NextResponse.json({ error: parse.error.flatten() }, { status: 400 })
  }
  sessions.push(parse.data)
  return NextResponse.json(parse.data, { status: 201 })
}
