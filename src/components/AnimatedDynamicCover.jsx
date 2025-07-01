'use client'

import { motion } from 'framer-motion'

const AnimatedDynamicCover = ({ colors = [] }) => {
  // Default colors if none provided
  const defaultColors = ['#5EEAD4', '#A7F3D0', '#FED7AA', '#FBCFE8']
  const finalColors = colors.length >= 4 ? colors.slice(0, 4) : defaultColors

  // Common skew angle for all bars
  const skewAngle = -20

  return (
    <div 
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        backgroundColor: '#ffffff' // White background, no initial image
      }}
    >
      {/* Bar 1 - Leftmost, TOP layer */}
      <motion.div
        initial={{ x: '-150%', opacity: 0 }}
        animate={{ x: '0%', opacity: 1 }}
        transition={{ 
          delay: 0, 
          type: 'spring', 
          stiffness: 55, 
          damping: 20,
          mass: 1.2,
          restDelta: 0.001
        }}
        style={{
          position: 'absolute',
          top: '-50%',
          left: '-25%',
          width: '65%',
          height: '200%',
          backgroundColor: finalColors[0],
          transform: `rotate(${skewAngle}deg)`,
          transformOrigin: 'center',
          boxShadow: '-30px 20px 60px rgba(0, 0, 0, 0.45), -20px 12px 40px rgba(0, 0, 0, 0.4), -10px 6px 20px rgba(0, 0, 0, 0.35)',
          zIndex: 4 // Top layer (leftmost)
        }}
      />
      
      {/* Bar 2 - Second from left */}
      <motion.div
        initial={{ x: '-150%', opacity: 0 }}
        animate={{ x: '0%', opacity: 1 }}
        transition={{ 
          delay: 0.15, 
          type: 'spring', 
          stiffness: 60, 
          damping: 20,
          mass: 1,
          restDelta: 0.001
        }}
        style={{
          position: 'absolute',
          top: '-50%',
          left: '15%',
          width: '30%',
          height: '200%',
          backgroundColor: finalColors[1],
          transform: `rotate(${skewAngle}deg)`,
          transformOrigin: 'center',
          boxShadow: '-25px 18px 55px rgba(0, 0, 0, 0.4), -15px 10px 35px rgba(0, 0, 0, 0.35), -8px 5px 18px rgba(0, 0, 0, 0.3)',
          zIndex: 3 // Third layer
        }}
      />
      
      {/* Bar 3 - Third from left */}
      <motion.div
        initial={{ x: '-150%', opacity: 0 }}
        animate={{ x: '0%', opacity: 1 }}
        transition={{ 
          delay: 0.3, 
          type: 'spring', 
          stiffness: 65, 
          damping: 20,
          mass: 0.8,
          restDelta: 0.001
        }}
        style={{
          position: 'absolute',
          top: '-50%',
          left: '35%',
          width: '20%',
          height: '200%',
          backgroundColor: finalColors[2],
          transform: `rotate(${skewAngle}deg)`,
          transformOrigin: 'center',
          boxShadow: '-20px 15px 50px rgba(0, 0, 0, 0.35), -12px 8px 30px rgba(0, 0, 0, 0.3), -6px 4px 15px rgba(0, 0, 0, 0.25)',
          zIndex: 2 // Second layer
        }}
      />
      
      {/* Bar 4 - Rightmost, BOTTOM layer */}
      <motion.div
        initial={{ x: '-150%', opacity: 0 }}
        animate={{ x: '0%', opacity: 1 }}
        transition={{ 
          delay: 0.45, 
          type: 'spring', 
          stiffness: 70, 
          damping: 22,
          mass: 0.6,
          restDelta: 0.001,
          restSpeed: 0.001
        }}
        style={{
          position: 'absolute',
          top: '-50%',
          left: '45%',
          width: '70%',
          height: '200%',
          backgroundColor: finalColors[3],
          transform: `rotate(${skewAngle}deg)`,
          transformOrigin: 'center',
          zIndex: 1 // Bottom layer (rightmost) - no shadow needed
        }}
      />
    </div>
  )
}

export default AnimatedDynamicCover 