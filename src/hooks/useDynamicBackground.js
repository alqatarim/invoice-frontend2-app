'use client'

import { useState, useEffect, useCallback } from 'react'
import { extractColorsFromImage, generateBackgroundDataUrl, generateDynamicBackground } from '@/utils/colorUtils'

/**
 * Custom hook for generating dynamic backgrounds from images
 * @param {string} sourceImage - Source image URL to extract colors from
 * @param {Object} options - Configuration options
 * @returns {Object} Hook state and utilities
 */
export const useDynamicBackground = (sourceImage, options = {}) => {
  const {
    fallbackImage = '/images/pages/profile-banner.png',
    colorCount = 4,
    dimensions = { width: 800, height: 250 },
    pattern = 'gradient',
    addPattern = true,
    direction = '135deg',
    barDirection = 'horizontal' // 'horizontal' or 'vertical' for bar patterns
  } = options

  const [backgroundSrc, setBackgroundSrc] = useState(fallbackImage)
  const [extractedColors, setExtractedColors] = useState([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState(null)

  const generateBackground = useCallback(async (imageSrc) => {
    if (!imageSrc || isGenerating) {
      return
    }

    try {
      setIsGenerating(true)
      setError(null)

      // Extract colors from the source image
      const colors = await extractColorsFromImage(imageSrc, colorCount)

      if (colors && colors.length > 0) {
        setExtractedColors(colors)

        // Generate dynamic background as data URL
        const dynamicBackgroundDataUrl = generateBackgroundDataUrl(
          colors,
          dimensions,
          { addPattern, pattern, barDirection }
        )

        setBackgroundSrc(dynamicBackgroundDataUrl)
      } else {
        throw new Error('No colors extracted from image')
      }
    } catch (err) {
      console.log('Could not generate dynamic background:', err)
      setError(err.message)
      // Keep the fallback background on error
      setBackgroundSrc(fallbackImage)
    } finally {
      setIsGenerating(false)
    }
  }, [colorCount, dimensions, addPattern, pattern, barDirection, fallbackImage, isGenerating])

  // Generate CSS background style from extracted colors
  const getBackgroundStyle = useCallback((customOptions = {}) => {
    if (extractedColors.length === 0) {
      return {}
    }

    return generateDynamicBackground(extractedColors, {
      direction,
      pattern,
      barDirection,
      ...customOptions
    })
  }, [extractedColors, direction, pattern, barDirection])

  // Reset to fallback background
  const resetBackground = useCallback(() => {
    setBackgroundSrc(fallbackImage)
    setExtractedColors([])
    setError(null)
  }, [fallbackImage])

  // Auto-generate when source image changes
  useEffect(() => {
    if (sourceImage && sourceImage !== fallbackImage) {
      generateBackground(sourceImage)
    } else {
      resetBackground()
    }
  }, [sourceImage, fallbackImage, generateBackground, resetBackground])

  return {
    backgroundSrc,
    extractedColors,
    isGenerating,
    error,
    isDynamic: backgroundSrc !== fallbackImage,
    generateBackground,
    getBackgroundStyle,
    resetBackground
  }
}

export default useDynamicBackground