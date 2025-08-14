'use client'
import useAppStore from '@/store/use-app-store'

export function ImportExportData(){
  const data = useAppStore(s=>({ profile: s.profile, routines: s.routines, sessionLogs: s.sessionLogs }))
  const setProfile = useAppStore(s=>s.setProfile)
  const addRoutine = useAppStore(s=>s.addRoutine)
  const logSession = useAppStore(s=>s.logSession)

  const exportData = () => {
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'gymapp-data.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const importData = (file: File) => {
    file.text().then(txt=>{
      try {
        const json = JSON.parse(txt)
        if(json.profile) setProfile(json.profile)
        if(Array.isArray(json.routines)) json.routines.forEach((r:any)=>addRoutine(r))
        if(Array.isArray(json.sessionLogs)) json.sessionLogs.forEach((l:any)=>logSession(l))
      } catch(e){
        alert('JSON inválido')
      }
    })
  }

  return (
    <div className="space-x-2">
      <button onClick={exportData} className="rounded border px-2 py-1">Exportar</button>
      <label className="rounded border px-2 py-1">
        Importar
        <input type="file" accept="application/json" onChange={e=>e.target.files && importData(e.target.files[0])} className="sr-only" />
      </label>
    </div>
  )
}
