"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import type { RunSession } from "@/data/models"
import { formatPace } from "@/lib/estimates"
import { Save, X } from "lucide-react"

interface RunFormProps {
  onRunLogged: (session: RunSession) => void
  onCancel: () => void
}

const quickDistances = [1, 2, 3, 5, 8, 10, 15, 21.1, 42.2]
const quickDurations = [15, 20, 30, 45, 60, 90, 120]

export function RunForm({ onRunLogged, onCancel }: RunFormProps) {
  const [distance, setDistance] = useState("")
  const [duration, setDuration] = useState("")
  const [minutes, setMinutes] = useState("")
  const [seconds, setSeconds] = useState("")
  const [elevation, setElevation] = useState("")
  const [rpe, setRpe] = useState("")
  const [shoe, setShoe] = useState("")
  const [notes, setNotes] = useState("")

  const distanceKm = Number.parseFloat(distance)
  const durationSec = duration
    ? Number.parseInt(duration) * 60
    : (Number.parseInt(minutes) || 0) * 60 + (Number.parseInt(seconds) || 0)
  const pace = distanceKm > 0 && durationSec > 0 ? durationSec / distanceKm : 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!distance || durationSec === 0) return

    const session: RunSession = {
      id: `run-${Date.now()}`,
      dateISO: new Date().toISOString(),
      distanceKm,
      durationSec,
      elevationGain: elevation ? Number.parseInt(elevation) : undefined,
      rpe: rpe ? Number.parseInt(rpe) : undefined,
      shoe: shoe || undefined,
      notes: notes || undefined,
    }

    onRunLogged(session)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Distance */}
      <div>
        <Label htmlFor="distance">Distancia (km)</Label>
        <div className="space-y-2">
          <Input
            id="distance"
            type="number"
            step="0.1"
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
            placeholder="5.0"
            required
          />
          <div className="flex flex-wrap gap-2">
            {quickDistances.map((dist) => (
              <Badge
                key={dist}
                variant="outline"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                onClick={() => setDistance(dist.toString())}
              >
                {dist} km
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Duration */}
      <div>
        <Label>Duración</Label>
        <div className="space-y-3">
          <div>
            <Label htmlFor="duration-minutes" className="text-sm text-muted-foreground">
              Minutos totales
            </Label>
            <Input
              id="duration-minutes"
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="30"
            />
          </div>

          <div className="text-center text-sm text-muted-foreground">o</div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="minutes" className="text-sm text-muted-foreground">
                Minutos
              </Label>
              <Input
                id="minutes"
                type="number"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                placeholder="25"
              />
            </div>
            <div>
              <Label htmlFor="seconds" className="text-sm text-muted-foreground">
                Segundos
              </Label>
              <Input
                id="seconds"
                type="number"
                max="59"
                value={seconds}
                onChange={(e) => setSeconds(e.target.value)}
                placeholder="30"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {quickDurations.map((dur) => (
              <Badge
                key={dur}
                variant="outline"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                onClick={() => setDuration(dur.toString())}
              >
                {dur} min
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Calculated Pace */}
      {pace > 0 && (
        <div className="p-4 bg-primary/10 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold">{formatPace(pace)}</div>
            <div className="text-sm text-muted-foreground">Ritmo por kilómetro</div>
          </div>
        </div>
      )}

      {/* Additional Info */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="elevation">Desnivel positivo (m)</Label>
          <Input
            id="elevation"
            type="number"
            value={elevation}
            onChange={(e) => setElevation(e.target.value)}
            placeholder="0"
          />
        </div>
        <div>
          <Label htmlFor="rpe">RPE (1-10)</Label>
          <Select value={rpe} onValueChange={setRpe}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 10 }, (_, i) => i + 1).map((value) => (
                <SelectItem key={value} value={value.toString()}>
                  {value} -{" "}
                  {value <= 3
                    ? "Muy fácil"
                    : value <= 5
                      ? "Fácil"
                      : value <= 7
                        ? "Moderado"
                        : value <= 9
                          ? "Difícil"
                          : "Máximo"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="shoe">Zapatillas (opcional)</Label>
        <Input
          id="shoe"
          value={shoe}
          onChange={(e) => setShoe(e.target.value)}
          placeholder="Nike Air Zoom, Adidas Ultraboost..."
        />
      </div>

      <div>
        <Label htmlFor="notes">Notas</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="¿Cómo te has sentido? Condiciones meteorológicas, terreno..."
          rows={3}
        />
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={!distance || durationSec === 0} className="flex-1">
          <Save className="h-4 w-4 mr-2" />
          Guardar Carrera
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="bg-transparent">
          <X className="h-4 w-4 mr-2" />
          Cancelar
        </Button>
      </div>
    </form>
  )
}
