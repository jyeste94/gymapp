interface Props {
  bars: number[]
}

const days = ['L','M','X','J','V','S','D']

export function WeeklyProgressBar({ bars }: Props){
  return (
    <div className="flex items-end gap-1" aria-label="Progreso semanal">
      {bars.map((b,i)=>(
        <div key={i} className="flex flex-col items-center">
          <div className="h-12 w-2 rounded-sm bg-muted relative overflow-hidden">
            <div className="absolute bottom-0 left-0 right-0 bg-primary" style={{height:`${b*100}%`}}></div>
          </div>
          <span className="text-[10px] mt-1">{days[i]}</span>
        </div>
      ))}
    </div>
  )
}
