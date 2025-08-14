'use client'
import useAppStore from '@/store/use-app-store'

export function GoalSelector(){
  const goal = useAppStore(s=>s.profile.weeklyGoal)
  const setProfile = useAppStore(s=>s.setProfile)
  return (
    <div className="space-y-2">
      <label htmlFor="goal" className="text-sm">Meta semanal: {goal}</label>
      <input id="goal" type="range" min={1} max={7} value={goal} onChange={e=>setProfile({weeklyGoal:+e.target.value})} className="w-full" />
    </div>
  )
}
