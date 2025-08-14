"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import type { WorkoutTemplate, Block } from "@/data/models"
import { Plus, Trash2, GripVertical, Copy } from "lucide-react"
import { BlockBuilder } from "./block-builder"

interface WorkoutBuilderProps {
  template: WorkoutTemplate
  onTemplateChange: (template: WorkoutTemplate) => void
}

export function WorkoutBuilder({ template, onTemplateChange }: WorkoutBuilderProps) {
  const [activeBlockIndex, setActiveBlockIndex] = useState<number | null>(null)

  const updateTemplate = (updates: Partial<WorkoutTemplate>) => {
    onTemplateChange({ ...template, ...updates })
  }

  const addBlock = () => {
    const newBlock: Block = {
      name: `Bloque ${template.blocks.length + 1}`,
      items: [],
    }
    updateTemplate({
      blocks: [...template.blocks, newBlock],
    })
    setActiveBlockIndex(template.blocks.length)
  }

  const updateBlock = (index: number, block: Block) => {
    const newBlocks = [...template.blocks]
    newBlocks[index] = block
    updateTemplate({ blocks: newBlocks })
  }

  const removeBlock = (index: number) => {
    const newBlocks = template.blocks.filter((_, i) => i !== index)
    updateTemplate({ blocks: newBlocks })
    if (activeBlockIndex === index) {
      setActiveBlockIndex(null)
    }
  }

  const duplicateBlock = (index: number) => {
    const blockToDuplicate = template.blocks[index]
    const duplicatedBlock: Block = {
      ...blockToDuplicate,
      name: `${blockToDuplicate.name} (Copia)`,
    }
    const newBlocks = [...template.blocks]
    newBlocks.splice(index + 1, 0, duplicatedBlock)
    updateTemplate({ blocks: newBlocks })
  }

  const saveTemplate = () => {
    // TODO: Implement save functionality
    console.log("Saving template:", template)
    alert("Rutina guardada correctamente!")
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {/* Template Settings */}
      <div className="lg:col-span-1 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Configuración de la Rutina</CardTitle>
            <CardDescription>Información básica de tu rutina</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="template-name">Nombre de la rutina</Label>
              <Input
                id="template-name"
                placeholder="Ej: Mi rutina personalizada"
                value={template.name}
                onChange={(e) => updateTemplate({ name: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="template-goal">Objetivo</Label>
              <Select value={template.goal || ""} onValueChange={(value) => updateTemplate({ goal: value as any })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un objetivo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fuerza">Fuerza</SelectItem>
                  <SelectItem value="hipertrofia">Hipertrofia</SelectItem>
                  <SelectItem value="potencia">Potencia</SelectItem>
                  <SelectItem value="mixto">Mixto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div>
              <h4 className="text-sm font-medium mb-2">Resumen</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Bloques:</span>
                  <span>{template.blocks.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ejercicios totales:</span>
                  <span>
                    {template.blocks.reduce((total, block) => {
                      return (
                        total +
                        block.items.reduce((blockTotal, item) => {
                          if ("items" in item) {
                            return blockTotal + item.items.length
                          }
                          return blockTotal + 1
                        }, 0)
                      )
                    }, 0)}
                  </span>
                </div>
              </div>
            </div>

            <Button onClick={saveTemplate} className="w-full" disabled={!template.name}>
              Guardar Rutina
            </Button>
          </CardContent>
        </Card>

        {/* Blocks List */}
        <Card>
          <CardHeader>
            <CardTitle>Bloques de Entrenamiento</CardTitle>
            <CardDescription>Organiza tu rutina en bloques</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {template.blocks.map((block, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    activeBlockIndex === index ? "bg-primary/10 border-primary" : "hover:bg-muted/50"
                  }`}
                  onClick={() => setActiveBlockIndex(index)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-sm">{block.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          duplicateBlock(index)
                        }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeBlock(index)
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {block.items.length} ejercicio{block.items.length !== 1 ? "s" : ""}
                  </div>
                </div>
              ))}

              <Button variant="outline" onClick={addBlock} className="w-full bg-transparent">
                <Plus className="h-4 w-4 mr-2" />
                Añadir Bloque
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Block Builder */}
      <div className="lg:col-span-2">
        {activeBlockIndex !== null && template.blocks[activeBlockIndex] ? (
          <BlockBuilder
            block={template.blocks[activeBlockIndex]}
            onBlockChange={(block) => updateBlock(activeBlockIndex, block)}
          />
        ) : (
          <Card>
            <CardContent className="flex items-center justify-center h-96">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">Selecciona un bloque para editarlo</p>
                {template.blocks.length === 0 && (
                  <Button onClick={addBlock}>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Primer Bloque
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
