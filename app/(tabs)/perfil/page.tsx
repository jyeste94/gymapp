"use client"
import useAppStore from '@/store/use-app-store'
import { GoalSelector } from '@/components/goal-selector'
import { ImportExportData } from '@/components/import-export-data'

export default function ProfilePage(){
  const profile = useAppStore(s=>s.profile)
  const setProfile = useAppStore(s=>s.setProfile)
  return (
    <div className="space-y-4 p-4">
      <div>
        <label className="text-sm">Nombre</label>
        <input value={profile.name} onChange={e=>setProfile({name:e.target.value})} className="w-full rounded border p-2" />
      </div>
      <div>
        <label className="text-sm">Unidades</label>
        <select value={profile.unit} onChange={e=>setProfile({unit:e.target.value as any})} className="w-full rounded border p-2">
          <option value="kg">kg</option>
          <option value="lb">lb</option>
        </select>
      </div>
      <GoalSelector />
      <ImportExportData />
    </div>
  )
}
