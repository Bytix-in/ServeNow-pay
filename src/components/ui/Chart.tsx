import React from 'react'

interface ChartData {
  name: string
  value: number
  color?: string
}

interface BarChartProps {
  data: ChartData[]
  height?: number
  className?: string
}

export function BarChart({ data, height = 200, className = '' }: BarChartProps) {
  if (!data.length) return null

  const maxValue = Math.max(...data.map(d => d.value))
  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
  ]

  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <div className="flex items-end justify-between h-full space-x-2">
        {data.map((item, index) => (
          <div key={item.name} className="flex flex-col items-center flex-1">
            <div
              className="w-full rounded-t transition-all duration-300 hover:opacity-80"
              style={{
                height: `${(item.value / maxValue) * 80}%`,
                backgroundColor: item.color || colors[index % colors.length],
                minHeight: '4px'
              }}
              title={`${item.name}: ${item.value}`}
            />
            <div className="text-xs text-gray-600 mt-2 text-center truncate w-full">
              {item.name}
            </div>
            <div className="text-xs font-medium text-gray-900">
              {item.value.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface PieChartProps {
  data: ChartData[]
  size?: number
  className?: string
}

export function PieChart({ data, size = 120, className = '' }: PieChartProps) {
  if (!data.length) return null

  const total = data.reduce((sum, item) => sum + item.value, 0)
  let cumulativePercentage = 0

  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
  ]

  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - 2}
            fill="none"
            stroke="#f3f4f6"
            strokeWidth="4"
          />
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100
            const strokeDasharray = `${percentage} ${100 - percentage}`
            const strokeDashoffset = -cumulativePercentage
            cumulativePercentage += percentage

            return (
              <circle
                key={item.name}
                cx={size / 2}
                cy={size / 2}
                r={size / 2 - 2}
                fill="none"
                stroke={item.color || colors[index % colors.length]}
                strokeWidth="4"
                strokeDasharray={`${(percentage / 100) * (2 * Math.PI * (size / 2 - 2))} ${2 * Math.PI * (size / 2 - 2)}`}
                strokeDashoffset={`${(-cumulativePercentage / 100) * (2 * Math.PI * (size / 2 - 2))}`}
                className="transition-all duration-300"
              />
            )
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">{total}</div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={item.name} className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color || colors[index % colors.length] }}
            />
            <span className="text-sm text-gray-700">{item.name}</span>
            <span className="text-sm font-medium text-gray-900">
              {item.value} ({((item.value / total) * 100).toFixed(1)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

interface LineChartProps {
  data: { name: string; value: number }[]
  height?: number
  className?: string
}

export function LineChart({ data, height = 200, className = '' }: LineChartProps) {
  if (!data.length) return null

  const maxValue = Math.max(...data.map(d => d.value))
  const minValue = Math.min(...data.map(d => d.value))
  const range = maxValue - minValue || 1

  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <svg width="100%" height="100%" className="overflow-visible">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
          <line
            key={ratio}
            x1="0"
            y1={`${ratio * 80 + 10}%`}
            x2="100%"
            y2={`${ratio * 80 + 10}%`}
            stroke="#f3f4f6"
            strokeWidth="1"
          />
        ))}
        
        {/* Line path */}
        <path
          d={data.map((point, index) => {
            const x = (index / (data.length - 1)) * 100
            const y = 90 - ((point.value - minValue) / range) * 80
            return `${index === 0 ? 'M' : 'L'} ${x}% ${y}%`
          }).join(' ')}
          fill="none"
          stroke="#3B82F6"
          strokeWidth="2"
          className="transition-all duration-300"
        />
        
        {/* Area fill */}
        <path
          d={[
            data.map((point, index) => {
              const x = (index / (data.length - 1)) * 100
              const y = 90 - ((point.value - minValue) / range) * 80
              return `${index === 0 ? 'M' : 'L'} ${x}% ${y}%`
            }).join(' '),
            `L 100% 90%`,
            `L 0% 90%`,
            'Z'
          ].join(' ')}
          fill="url(#lineGradient)"
        />
        
        {/* Data points */}
        {data.map((point, index) => {
          const x = (index / (data.length - 1)) * 100
          const y = 90 - ((point.value - minValue) / range) * 80
          return (
            <circle
              key={index}
              cx={`${x}%`}
              cy={`${y}%`}
              r="3"
              fill="#3B82F6"
              className="hover:r-4 transition-all duration-200"
            >
              <title>{`${point.name}: ${point.value}`}</title>
            </circle>
          )
        })}
      </svg>
    </div>
  )
}