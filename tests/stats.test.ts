import { describe, expect, it } from 'vitest'
import { computeStreak, weekBars } from '../lib/stats'
import type { SessionLog } from '../store/use-app-store'

describe('stats utilities', () => {
  it('computes week bars', () => {
    const logs: SessionLog[] = [
      { id:'1', date:new Date().toISOString(), routineId:'r', completed:true, exercises:[] }
    ]
    const bars = weekBars(logs)
    expect(bars.reduce((a,b)=>a+b,0)).toBe(1)
    expect(bars.length).toBe(7)
  })

  it('computes streak', () => {
    const today = new Date()
    const yesterday = new Date(today.getTime()-86400000)
    const logs: SessionLog[] = [
      { id:'1', date:yesterday.toISOString(), routineId:'r', completed:true, exercises:[] },
      { id:'2', date:today.toISOString(), routineId:'r', completed:true, exercises:[] }
    ]
    const { streak, best } = computeStreak(logs)
    expect(streak).toBe(2)
    expect(best).toBe(2)
  })
})
