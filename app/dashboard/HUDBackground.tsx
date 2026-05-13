"use client"
import { useEffect, useRef } from "react"

type Particle = {
  x: number; y: number; vx: number; vy: number
  type: "dot" | "cross" | "hex"
  size: number; opacity: number
}

export function HUDBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener("resize", resize)

    const particles: Particle[] = Array.from({ length: 50 }, (_, i) => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      type: i % 6 === 0 ? "cross" : i % 9 === 0 ? "hex" : "dot",
      size: Math.random() * 7 + 3,
      opacity: Math.random() * 0.15 + 0.10,
    }))

    function drawCross(x: number, y: number, s: number) {
      const gap = s * 0.35
      ctx!.beginPath()
      ctx!.moveTo(x - s, y); ctx!.lineTo(x - gap, y)
      ctx!.moveTo(x + gap, y); ctx!.lineTo(x + s, y)
      ctx!.moveTo(x, y - s); ctx!.lineTo(x, y - gap)
      ctx!.moveTo(x, y + gap); ctx!.lineTo(x, y + s)
      ctx!.stroke()
    }

    function drawHex(x: number, y: number, s: number) {
      ctx!.beginPath()
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3 - Math.PI / 6
        i === 0 ? ctx!.moveTo(x + s * Math.cos(a), y + s * Math.sin(a))
                : ctx!.lineTo(x + s * Math.cos(a), y + s * Math.sin(a))
      }
      ctx!.closePath()
      ctx!.stroke()
    }

    let frame: number
    function draw() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height)
      for (const p of particles) {
        ctx!.save()
        ctx!.strokeStyle = `rgba(245,158,11,${p.opacity})`
        ctx!.fillStyle = `rgba(245,158,11,${p.opacity})`
        ctx!.lineWidth = 0.8
        if (p.type === "dot") {
          ctx!.beginPath(); ctx!.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2); ctx!.fill()
        } else if (p.type === "cross") {
          drawCross(p.x, p.y, p.size * 2.5)
        } else {
          drawHex(p.x, p.y, p.size * 1.8)
        }
        ctx!.restore()
        p.x += p.vx; p.y += p.vy
        const W = canvas!.width, H = canvas!.height
        if (p.x < -30) p.x = W + 30; if (p.x > W + 30) p.x = -30
        if (p.y < -30) p.y = H + 30; if (p.y > H + 30) p.y = -30
      }
      frame = requestAnimationFrame(draw)
    }
    draw()

    return () => { cancelAnimationFrame(frame); window.removeEventListener("resize", resize) }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{ position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none" }}
    />
  )
}
