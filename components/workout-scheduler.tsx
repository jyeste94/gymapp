"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { WorkoutTemplate } from "@/data/models"

interface WorkoutSchedulerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  templates: WorkoutTemplate[]
  selectedDate: Date
  plannedWorkouts: PlannedWorkout[]
  onSchedule: (workout: PlannedWorkout) => void
}

interface PlannedWorkout {
  id: string
  templateId: string
  templateName: string
  date: string
  time?: string
  notes?: string
  completed?: boolean
}

export function WorkoutScheduler({
  open,
  onOpenChange,
  templates,
  selectedDate,
  plannedWorkouts,
  onSchedule,
}: WorkoutSchedulerProps) {
  const [formData, setFormData] = useState({
    templateId: "",
    date: selectedDate,
    time: "",
    notes: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.templateId) return

    const template = templates.find((t) => t.id === formData.templateId)
    if (!template) return

    const newWorkout: PlannedWorkout = {
      id: `planned-${Date.now()}`,
      templateId: formData.templateId,
      templateName: template.name,
      date: formData.date.toISOString().split("T")[0],
      time: formData.time || undefined,
      notes: formData.notes || undefined,
      completed: false,
    }

    onSchedule(newWorkout)

    // Reset form
    setFormData({
      templateId: "",
      date: selectedDate,
      time: "",
      notes: "",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Programar Entrenamiento</DialogTitle>
          <DialogDescription>Selecciona una rutina y programa tu próximo entrenamiento</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="template">Rutina de Entrenamiento</Label>
            <Select
              value={formData.templateId}
              onValueChange={(value) => setFormData({ ...formData, templateId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar rutina" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    <div>
                      <div className="font-medium">{template.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {template.estimatedDuration} min • {template.goal}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Fecha</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(formData.date, "PPP", { locale: es })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.date}
                  onSelect={(date) => date && setFormData({ ...formData, date })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="time">Hora (opcional)</Label>
            <Input
              id="time"
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Objetivos específicos, modificaciones, etc."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={!formData.templateId} className="flex-1">
              Programar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
