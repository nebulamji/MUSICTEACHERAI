import React, { useEffect, useRef } from 'react'

interface Note {
  pitch: number
  startTime: number
  endTime: number
  velocity: number
}

interface VisualizationProps {
  notes: Note[]
  width?: number
  height?: number
}

export const MusicVisualization: React.FC<VisualizationProps> = ({
  notes,
  width = 800,
  height = 200,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Set background
    ctx.fillStyle = '#1a1a1a'
    ctx.fillRect(0, 0, width, height)

    if (notes.length === 0) return

    // Find time range
    const startTime = Math.min(...notes.map((n) => n.startTime))
    const endTime = Math.max(...notes.map((n) => n.endTime))
    const timeRange = endTime - startTime

    // Find pitch range
    const minPitch = Math.min(...notes.map((n) => n.pitch))
    const maxPitch = Math.max(...notes.map((n) => n.pitch))
    const pitchRange = maxPitch - minPitch + 1

    // Draw notes
    notes.forEach((note) => {
      const x = ((note.startTime - startTime) / timeRange) * width
      const noteWidth = ((note.endTime - note.startTime) / timeRange) * width
      const y = height - ((note.pitch - minPitch + 1) / pitchRange) * height
      const noteHeight = height / pitchRange

      // Calculate color based on velocity
      const hue = (note.velocity / 127) * 60 + 200 // Blue to purple
      ctx.fillStyle = `hsla(${hue}, 70%, 60%, 0.8)`

      // Draw note rectangle
      ctx.fillRect(x, y, noteWidth, noteHeight)

      // Add border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
      ctx.strokeRect(x, y, noteWidth, noteHeight)
    })

    // Draw grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.lineWidth = 1

    // Vertical time markers
    for (let i = 0; i <= 10; i++) {
      const x = (width / 10) * i
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }

    // Horizontal pitch markers
    for (let i = 0; i <= 12; i++) {
      const y = (height / 12) * i
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }
  }, [notes, width, height])

  return (
    <div className='visualization-container'>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className='rounded-lg shadow-lg'
        style={{
          width: '100%',
          height: 'auto',
          maxWidth: width,
        }}
      />
      <div className='mt-2 text-sm text-gray-600'>
        <div className='flex justify-between'>
          <span>Time →</span>
          <span>Pitch ↑</span>
        </div>
      </div>
    </div>
  )
}
