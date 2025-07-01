'use client'

import { useState, useEffect, useCallback } from 'react'
import { extractColorsFromImage } from '@/utils/colorUtils'

/**
 * Custom hook for extracting colors from company logos
 * @param {string} sourceImage - Source image URL to extract colors from
 * @param {Object} options - Configuration options
 * @returns {Object} Hook state and utilities
 */
export const useDynamicBackground = (sourceImage, options = {}) => {
  const {
    fallbackImage = '/images/pages/profile-banner.png',
    colorCount = 4
  } = options

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
      } else {
        throw new Error('No colors extracted from image')
      }
    } catch (err) {
      console.log('Could not extract colors:', err)
      setError(err.message)
      setExtractedColors([])
    } finally {
      setIsGenerating(false)
    }
  }, [colorCount, isGenerating])

  // Reset colors
  const resetBackground = useCallback(() => {
    setExtractedColors([])
    setError(null)
  }, [])

  // Auto-generate when source image changes
  useEffect(() => {
    if (sourceImage && sourceImage !== fallbackImage) {
      generateBackground(sourceImage)
    } else {
      resetBackground()
    }
  }, [sourceImage, fallbackImage, generateBackground, resetBackground])

  return {
    extractedColors,
    isGenerating,
    error,
    isDynamic: extractedColors.length > 0,
    generateBackground,
    resetBackground
  }
}

export default useDynamicBackground