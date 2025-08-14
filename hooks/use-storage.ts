"use client"

import { useState, useEffect } from "react"
import { storage } from "@/lib/storage"

export function useStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(defaultValue)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadValue = async () => {
      try {
        const stored = await storage.get<T>(key)
        if (stored !== null) {
          setValue(stored)
        }
      } catch (error) {
        console.error(`Error loading ${key} from storage:`, error)
      } finally {
        setLoading(false)
      }
    }

    loadValue()
  }, [key])

  const updateValue = async (newValue: T | ((prev: T) => T)) => {
    try {
      const valueToStore = typeof newValue === "function" ? (newValue as (prev: T) => T)(value) : newValue

      await storage.set(key, valueToStore)
      setValue(valueToStore)
    } catch (error) {
      console.error(`Error saving ${key} to storage:`, error)
    }
  }

  return [value, updateValue, loading] as const
}
