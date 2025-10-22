import { Box, Circle, Cone, Cuboid, Cylinder, Diamond, Heart, Hexagon } from 'lucide-react'

/**
 * Maps shape names to their corresponding Lucide React icon components
 * Supports: box, circle, cone, cuboid, cylinder, diamond, heart, hexagon
 */
const shapeMap = {
  box: Box,
  circle: Circle,
  cone: Cone,
  cuboid: Cuboid,
  cylinder: Cylinder,
  diamond: Diamond,
  heart: Heart,
  hexagon: Hexagon,
}

/**
 * ShapeIcon Component
 * 
 * Renders a colored icon representation of a geometric shape.
 * Uses Lucide React icons for consistent, scalable vector graphics.
 * 
 * @param {Object} props - Component props
 * @param {string} props.shape - The shape type (box, circle, cone, cuboid, cylinder, diamond, heart, hexagon)
 * @param {string} props.color - Hex color code to apply to the icon (e.g., "#FF0000")
 * 
 * @returns {JSX.Element} A colored shape icon
 * 
 * @example
 * ```tsx
 * <ShapeIcon shape="circle" color="#3B82F6" />
 * <ShapeIcon shape="square" color="#EF4444" />
 * ```
 */
export function ShapeIcon({ shape, color }: { shape: string; color: string }) {
  const Icon = shapeMap[shape as keyof typeof shapeMap] || Circle
  return <Icon className="size-5" style={{ color }}  />
}
