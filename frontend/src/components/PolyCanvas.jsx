import { useEffect, useRef } from 'react'

// Icosahedron vertices
const PHI = (1 + Math.sqrt(5)) / 2
const ICO_VERTS_RAW = [
  [-1, PHI, 0], [1, PHI, 0], [-1, -PHI, 0], [1, -PHI, 0],
  [0, -1, PHI], [0, 1, PHI], [0, -1, -PHI], [0, 1, -PHI],
  [PHI, 0, -1], [PHI, 0, 1], [-PHI, 0, -1], [-PHI, 0, 1],
]
const normalize = ([x, y, z]) => {
  const len = Math.sqrt(x * x + y * y + z * z)
  return [x / len, y / len, z / len]
}
const ICO_VERTS = ICO_VERTS_RAW.map(normalize)
const ICO_FACES = [
  [0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],
  [1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],
  [3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],
  [4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1],
]

function rotateXYZ(v, rx, ry, rz) {
  let [x, y, z] = v
  // rotate X
  let ny = y * Math.cos(rx) - z * Math.sin(rx)
  let nz = y * Math.sin(rx) + z * Math.cos(rx)
  y = ny; z = nz
  // rotate Y
  let nx = x * Math.cos(ry) + z * Math.sin(ry)
  nz = -x * Math.sin(ry) + z * Math.cos(ry)
  x = nx; z = nz
  // rotate Z
  nx = x * Math.cos(rz) - y * Math.sin(rz)
  ny = x * Math.sin(rz) + y * Math.cos(rz)
  x = nx; y = ny
  return [x, y, z]
}

function project(v, size, fov = 4) {
  const [x, y, z] = v
  const scale = fov / (fov + z)
  return [
    size * 0.5 + x * scale * size * 0.35,
    size * 0.5 + y * scale * size * 0.35,
    z,
    scale,
  ]
}

export default function PolyCanvas({ size = 340, className = '' }) {
  const canvasRef = useRef(null)
  const rafRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    canvas.width = size * dpr
    canvas.height = size * dpr
    ctx.scale(dpr, dpr)

    let rx = 0, ry = 0, rz = 0

    function draw(ts) {
      ctx.clearRect(0, 0, size, size)

      rx = ts * 0.00018
      ry = ts * 0.00028
      rz = ts * 0.00012

      const projected = ICO_VERTS.map(v => project(rotateXYZ(v, rx, ry, rz), size))

      // Sort faces back-to-front
      const faces = ICO_FACES.map(face => {
        const avgZ = face.reduce((s, i) => s + projected[i][2], 0) / 3
        return { face, avgZ }
      }).sort((a, b) => a.avgZ - b.avgZ)

      // Draw edges (unique)
      const edgeSet = new Set()
      ICO_FACES.forEach(face => {
        for (let i = 0; i < 3; i++) {
          const a = face[i], b = face[(i + 1) % 3]
          const key = Math.min(a, b) + '_' + Math.max(a, b)
          if (!edgeSet.has(key)) {
            edgeSet.add(key)
            const [px1, py1, , s1] = projected[a]
            const [px2, py2, , s2] = projected[b]
            const avgScale = (s1 + s2) / 2
            const alpha = Math.max(0.08, Math.min(0.55, avgScale * 0.45))
            ctx.beginPath()
            ctx.moveTo(px1, py1)
            ctx.lineTo(px2, py2)
            ctx.strokeStyle = `rgba(200,169,81,${alpha})`
            ctx.lineWidth = 0.7
            ctx.stroke()
          }
        }
      })

      // Draw vertices
      ICO_VERTS.forEach((_, i) => {
        const [px, py, , s] = projected[i]
        const alpha = Math.max(0.1, Math.min(0.8, s * 0.7))
        ctx.beginPath()
        ctx.arc(px, py, 2 * s, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(200,169,81,${alpha})`
        ctx.fill()
      })

      // Second, larger, counter-rotating icosahedron
      const rx2 = -ts * 0.00010
      const ry2 = ts * 0.00015
      const rz2 = ts * 0.00008

      const projected2 = ICO_VERTS.map(v => {
        const rotated = rotateXYZ(v, rx2, ry2, rz2)
        const scaled = [rotated[0] * 1.65, rotated[1] * 1.65, rotated[2] * 1.65]
        return project(scaled, size, 5)
      })

      const edgeSet2 = new Set()
      ICO_FACES.forEach(face => {
        for (let i = 0; i < 3; i++) {
          const a = face[i], b = face[(i + 1) % 3]
          const key = Math.min(a, b) + '_' + Math.max(a, b)
          if (!edgeSet2.has(key)) {
            edgeSet2.add(key)
            const [px1, py1, z1, s1] = projected2[a]
            const [px2, py2, z2, s2] = projected2[b]
            if (z1 > 0 && z2 > 0) continue // clip behind
            const avgScale = (s1 + s2) / 2
            const alpha = Math.max(0.03, Math.min(0.18, avgScale * 0.15))
            ctx.beginPath()
            ctx.moveTo(px1, py1)
            ctx.lineTo(px2, py2)
            ctx.strokeStyle = `rgba(200,169,81,${alpha})`
            ctx.lineWidth = 0.4
            ctx.stroke()
          }
        }
      })

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [size])

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className={className}
      style={{ width: size, height: size }}
    />
  )
}
