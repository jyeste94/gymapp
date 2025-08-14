"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Block, SetScheme, Superset } from "@/data/models"
import { Plus, Trash2, GripVertical, Users } from "lucide-react"
import { SetSchemeBuilder } from "./set-scheme-builder"
import { SupersetBuilder } from "./superset-builder"

interface BlockBuilderProps {
  block: Block
  onBlockChange: (block: Block) => void
}

export function BlockBuilder({ block, onBlockChange }: BlockBuilderProps) {
  const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null)

  const updateBlock = (updates: Partial<Block>) => {
    onBlockChange({ ...block, ...updates })
  }

  const addSetScheme = () => {
    const newSetScheme: SetScheme = {
      exerciseId: "",
      sets: 3,
      reps: 10,
      weightType: "absoluto",
      restSec: 90,
    }
    updateBlock({
      items: [...block.items, newSetScheme],
    })
    setActiveItemIndex(block.items.length)
  }

  const addSuperset = () => {
    const newSuperset: Superset = {
      name: "Superset",
      items: [
        {
          exerciseId: "",
          sets: 3,
          reps: 10,
          weightType: "absoluto",
          restSec: 0,
        },
        {
          exerciseId: "",
          sets: 3,
          reps: 10,
          weightType: "absoluto",
          restSec: 90,
        },
      ],
    }
    updateBlock({
      items: [...block.items, newSuperset],
    })
    setActiveItemIndex(block.items.length)
  }

  const updateItem = (index: number, item: SetScheme | Superset) => {
    const newItems = [...block.items]
    newItems[index] = item
    updateBlock({ items: newItems })
  }

  const removeItem = (index: number) => {
    const newItems = block.items.filter((_, i) => i !== index)
    updateBlock({ items: newItems })
    if (activeItemIndex === index) {
      setActiveItemIndex(null)
    }
  }

  const isSuperset = (item: SetScheme | Superset): item is Superset => {
    return "items" in item && Array.isArray(item.items)
  }

  return (
    <div className="space-y-6">
      {/* Block Header */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración del Bloque</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="block-name">Nombre del bloque</Label>
            <Input
              id="block-name"
              placeholder="Ej: Calentamiento, Bloque principal..."
              value={block.name || ""}
              onChange={(e) => updateBlock({ name: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Items List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Ejercicios del Bloque</CardTitle>
              <CardDescription>Añade ejercicios individuales o superseries</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={addSetScheme} size="sm" className="bg-transparent">
                <Plus className="h-4 w-4 mr-2" />
                Ejercicio
              </Button>
              <Button variant="outline" onClick={addSuperset} size="sm" className="bg-transparent">
                <Users className="h-4 w-4 mr-2" />
                Superset
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {block.items.map((item, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  activeItemIndex === index ? "bg-primary/10 border-primary" : "hover:bg-muted/50"
                }`}
                onClick={() => setActiveItemIndex(index)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <div>
                      {isSuperset(item) ? (
                        <div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span className="font-medium text-sm">{item.name || "Superset"}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {item.items.length} ejercicios en superset
                          </div>
                        </div>
                      ) : (
                        <div>
                          <span className="font-medium text-sm">{item.exerciseId || "Ejercicio sin seleccionar"}</span>
                          <div className="text-xs text-muted-foreground">
                            {item.sets} series × {item.reps || `${item.repRange?.[0]}-${item.repRange?.[1]}`} reps
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeItem(index)
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}

            {block.items.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p className="mb-4">No hay ejercicios en este bloque</p>
                <div className="flex justify-center gap-2">
                  <Button variant="outline" onClick={addSetScheme} size="sm" className="bg-transparent">
                    <Plus className="h-4 w-4 mr-2" />
                    Añadir Ejercicio
                  </Button>
                  <Button variant="outline" onClick={addSuperset} size="sm" className="bg-transparent">
                    <Users className="h-4 w-4 mr-2" />
                    Añadir Superset
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Item Editor */}
      {activeItemIndex !== null && block.items[activeItemIndex] && (
        <Card>
          <CardHeader>
            <CardTitle>
              {isSuperset(block.items[activeItemIndex]) ? "Configurar Superset" : "Configurar Ejercicio"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isSuperset(block.items[activeItemIndex]) ? (
              <SupersetBuilder
                superset={block.items[activeItemIndex] as Superset}
                onSupersetChange={(superset) => updateItem(activeItemIndex, superset)}
              />
            ) : (
              <SetSchemeBuilder
                setScheme={block.items[activeItemIndex] as SetScheme}
                onSetSchemeChange={(setScheme) => updateItem(activeItemIndex, setScheme)}
              />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
