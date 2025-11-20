'use client'

export default function TempleHeatmap() {
  const zones = [
    {
      id: 'garbha-griha',
      name: 'Garbha Griha',
      x: '30%',
      y: '30%',
      density: 95,
      people: 450,
      color: 'bg-red-600',
    },
    {
      id: 'pradakshina',
      name: 'Pradakshina Path',
      x: '50%',
      y: '50%',
      density: 75,
      people: 320,
      color: 'bg-orange-500',
    },
    {
      id: 'entrance',
      name: 'Entrance',
      x: '20%',
      y: '80%',
      density: 45,
      people: 180,
      color: 'bg-yellow-500',
    },
    {
      id: 'prasad',
      name: 'Prasad Counter',
      x: '70%',
      y: '75%',
      density: 60,
      people: 220,
      color: 'bg-orange-400',
    },
    {
      id: 'parking',
      name: 'Parking',
      x: '80%',
      y: '20%',
      density: 35,
      people: 140,
      color: 'bg-green-500',
    },
  ]

  const getDensityColor = (density: number) => {
    if (density >= 80) return 'from-red-600 to-red-700'
    if (density >= 60) return 'from-orange-500 to-orange-600'
    if (density >= 40) return 'from-yellow-500 to-yellow-600'
    return 'from-green-500 to-green-600'
  }

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg overflow-hidden border border-primary/20">
      {/* Temple Layout */}
      <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 200 200">
        <rect x="30" y="30" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="2" />
        <rect x="80" y="40" width="60" height="60" fill="none" stroke="currentColor" strokeWidth="2" />
        <rect x="20" y="100" width="160" height="60" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>

      {/* Heatmap Zones */}
      {zones.map((zone) => (
        <div
          key={zone.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
          style={{ left: zone.x, top: zone.y }}
        >
          {/* Pulsing Dot */}
          <div
            className={`w-16 h-16 rounded-full blur-lg ${zone.color} opacity-40 group-hover:opacity-60 transition-all group-hover:scale-110`}
          />

          {/* Core Dot */}
          <div
            className={`absolute inset-0 w-4 h-4 rounded-full ${zone.color} shadow-lg shadow-primary/50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2`}
          />

          {/* Tooltip */}
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 bg-card/95 border border-primary/50 rounded-lg px-3 py-2 text-xs font-semibold text-foreground opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap shadow-lg">
            <div className="font-bold">{zone.name}</div>
            <div className="text-muted-foreground">{zone.people} people</div>
            <div className={`${zone.color} bg-clip-text text-transparent font-bold`}>{zone.density}% density</div>
          </div>
        </div>
      ))}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-card/80 backdrop-blur-sm rounded-lg p-3 border border-primary/30">
        <div className="text-xs font-bold text-foreground mb-2">Density</div>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-600" />
            <span className="text-muted-foreground">80%+ Critical</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-orange-500" />
            <span className="text-muted-foreground">60-79% High</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            <span className="text-muted-foreground">40-59% Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-muted-foreground">{'<40% Safe'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
