/**
 * Color extraction utilities for generating dynamic backgrounds
 */

/**
 * Extract dominant colors from an image
 * @param {string} imageSrc - Image source URL
 * @param {number} colorCount - Number of colors to extract (default: 3)
 * @returns {Promise<Array>} Array of dominant colors in hex format
 */
export const extractColorsFromImage = (imageSrc, colorCount = 3) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        canvas.width = img.width
        canvas.height = img.height

        ctx.drawImage(img, 0, 0)

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const colors = extractDominantColors(imageData.data, colorCount)

        resolve(colors)
      } catch (error) {
        reject(error)
      }
    }

    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = imageSrc
  })
}

/**
 * Extract dominant colors using color quantization
 * @param {Uint8ClampedArray} imageData - Image pixel data
 * @param {number} colorCount - Number of colors to extract
 * @returns {Array} Array of dominant colors in hex format
 */
const extractDominantColors = (imageData, colorCount) => {
  const pixelCount = imageData.length / 4
  const colors = []

  // Sample pixels (every 4th pixel for performance)
  for (let i = 0; i < pixelCount; i += 4) {
    const r = imageData[i * 4]
    const g = imageData[i * 4 + 1]
    const b = imageData[i * 4 + 2]
    const a = imageData[i * 4 + 3]

    // Skip transparent pixels
    if (a < 128) continue

    colors.push({ r, g, b, count: 1 })
  }

  // Group similar colors
  const groupedColors = groupSimilarColors(colors)

  // Sort by frequency and return top colors
  const sortedColors = groupedColors
    .sort((a, b) => b.count - a.count)
    .slice(0, colorCount)
    .map(color => rgbToHex(color.r, color.g, color.b))

  return sortedColors
}

/**
 * Group similar colors together
 * @param {Array} colors - Array of color objects
 * @returns {Array} Grouped colors
 */
const groupSimilarColors = (colors) => {
  const grouped = []
  const threshold = 30 // Color similarity threshold

  colors.forEach(color => {
    let found = false

    for (let group of grouped) {
      if (colorDistance(color, group) < threshold) {
        // Merge with existing group
        group.r = Math.round((group.r * group.count + color.r) / (group.count + 1))
        group.g = Math.round((group.g * group.count + color.g) / (group.count + 1))
        group.b = Math.round((group.b * group.count + color.b) / (group.count + 1))
        group.count += 1
        found = true
        break
      }
    }

    if (!found) {
      grouped.push({ ...color })
    }
  })

  return grouped
}

/**
 * Calculate distance between two colors
 * @param {Object} color1 - First color {r, g, b}
 * @param {Object} color2 - Second color {r, g, b}
 * @returns {number} Color distance
 */
const colorDistance = (color1, color2) => {
  return Math.sqrt(
    Math.pow(color1.r - color2.r, 2) +
    Math.pow(color1.g - color2.g, 2) +
    Math.pow(color1.b - color2.b, 2)
  )
}

/**
 * Convert RGB to hex
 * @param {number} r - Red value
 * @param {number} g - Green value
 * @param {number} b - Blue value
 * @returns {string} Hex color string
 */
const rgbToHex = (r, g, b) => {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

/**
 * Convert hex to RGB
 * @param {string} hex - Hex color string
 * @returns {Object} RGB color object {r, g, b}
 */
export const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

/**
 * Generate complementary colors
 * @param {string} baseColor - Base color in hex format
 * @returns {Array} Array of complementary colors
 */
export const generateComplementaryColors = (baseColor) => {
  const rgb = hexToRgb(baseColor)
  if (!rgb) return [baseColor]

  const complementary = rgbToHex(255 - rgb.r, 255 - rgb.g, 255 - rgb.b)
  const analogous1 = rgbToHex(
    Math.min(255, rgb.r + 30),
    Math.min(255, rgb.g + 15),
    Math.max(0, rgb.b - 15)
  )
  const analogous2 = rgbToHex(
    Math.max(0, rgb.r - 15),
    Math.min(255, rgb.g + 30),
    Math.min(255, rgb.b + 15)
  )

  return [baseColor, analogous1, analogous2, complementary]
}

/**
 * Lighten or darken a color
 * @param {string} color - Color in hex format
 * @param {number} amount - Amount to lighten (positive) or darken (negative)
 * @returns {string} Modified color in hex format
 */
export const adjustColorBrightness = (color, amount) => {
  const rgb = hexToRgb(color)
  if (!rgb) return color

  const r = Math.max(0, Math.min(255, rgb.r + amount))
  const g = Math.max(0, Math.min(255, rgb.g + amount))
  const b = Math.max(0, Math.min(255, rgb.b + amount))

  return rgbToHex(r, g, b)
}

/**
 * Generate dynamic background CSS based on extracted colors
 * @param {Array} colors - Array of colors in hex format
 * @param {Object} options - Configuration options
 * @returns {Object} CSS style object for background
 */
export const generateDynamicBackground = (colors, options = {}) => {
  const {
    direction = '135deg',
    opacity = 1,
    blendMode = 'normal',
    pattern = 'gradient',
    barDirection = 'horizontal' // 'horizontal' or 'vertical'
  } = options

  if (!colors || colors.length === 0) {
    // Fallback to default gradient similar to profile-banner.png
    return {
      background: `linear-gradient(${direction}, #74C0FC 0%, #B2E5FC 25%, #FDF2F8 50%, #F8BBD9 75%, #F48FB1 100%)`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }
  }

  let backgroundStyle = {}

  switch (pattern) {
                case 'bars':
    case 'stripes':
      // Create wide diagonal bands like the reference image
      const diagonalAngle = barDirection === 'horizontal' ? '135deg' : '45deg'

      // Create distinct diagonal bands with clean color separation
      const bandSize = 100 / colors.length
      const colorStops = []

      colors.forEach((color, index) => {
        const startPos = index * bandSize
        const endPos = (index + 1) * bandSize

        // Sharp color stops for distinct bands
        colorStops.push(`${color} ${startPos}%`)
        colorStops.push(`${color} ${endPos}%`)
      })

      backgroundStyle.background = `linear-gradient(${diagonalAngle}, ${colorStops.join(', ')})`
      break

    case 'radial':
      backgroundStyle.background = `radial-gradient(ellipse at center, ${colors.map((color, index) =>
        `${adjustColorBrightness(color, index * 10)} ${(index / (colors.length - 1)) * 100}%`
      ).join(', ')})`
      break

    case 'diagonal':
      backgroundStyle.background = `linear-gradient(${direction}, ${colors.map((color, index) =>
        `${color} ${(index / (colors.length - 1)) * 100}%`
      ).join(', ')})`
      break

    case 'waves':
      // Create a wave-like pattern using multiple gradients
      const [primary, secondary, tertiary] = colors
      backgroundStyle.background = `
        linear-gradient(${direction}, ${primary}22 0%, transparent 50%),
        linear-gradient(${parseInt(direction) + 60}deg, ${secondary}33 0%, transparent 50%),
        linear-gradient(${parseInt(direction) + 120}deg, ${tertiary || primary}22 0%, transparent 50%),
        linear-gradient(${direction}, ${primary} 0%, ${secondary} 50%, ${tertiary || primary} 100%)
      `
      break

    default: // gradient
      // Create a sophisticated gradient similar to the original banner
      const enhancedColors = enhanceColorPalette(colors)
      backgroundStyle.background = `linear-gradient(${direction}, ${enhancedColors.map((color, index) =>
        `${color} ${(index / (enhancedColors.length - 1)) * 100}%`
      ).join(', ')})`
  }

  return {
    ...backgroundStyle,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    opacity: opacity,
    mixBlendMode: blendMode
  }
}

/**
 * Enhance color palette to create more visually appealing gradients
 * @param {Array} colors - Original color array
 * @returns {Array} Enhanced color array
 */
const enhanceColorPalette = (colors) => {
  if (colors.length < 2) {
    // If only one color, create a complementary palette
    return generateComplementaryColors(colors[0])
  }

  const enhanced = []

  // Add lighter version of first color
  enhanced.push(adjustColorBrightness(colors[0], 40))

  // Add original colors with some adjustments
  colors.forEach((color, index) => {
    if (index === 0) {
      enhanced.push(color)
    } else if (index === 1) {
      enhanced.push(adjustColorBrightness(color, 20))
      enhanced.push(color)
    } else {
      enhanced.push(adjustColorBrightness(color, -10))
    }
  })

  // Add darker version of last color
  enhanced.push(adjustColorBrightness(colors[colors.length - 1], -30))

  return enhanced
}

/**
 * Generate a data URL for a dynamic background canvas
 * @param {Array} colors - Array of colors
 * @param {Object} dimensions - Canvas dimensions {width, height}
 * @param {Object} options - Pattern options
 * @returns {string} Data URL of the generated background
 */
export const generateBackgroundDataUrl = (colors, dimensions = { width: 800, height: 250 }, options = {}) => {
  const {
    pattern = 'gradient',
    barDirection = 'horizontal',
    addPattern = false
  } = options

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  canvas.width = dimensions.width
  canvas.height = dimensions.height

  if (!colors || colors.length === 0) {
    // Default gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, '#74C0FC')
    gradient.addColorStop(0.25, '#B2E5FC')
    gradient.addColorStop(0.5, '#FDF2F8')
    gradient.addColorStop(0.75, '#F8BBD9')
    gradient.addColorStop(1, '#F48FB1')

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)
        } else if (pattern === 'bars' || pattern === 'stripes') {
    // Create wide diagonal bands like the reference image
    const angle = barDirection === 'horizontal' ? 135 : 45

    // Create diagonal bands with distinct colors
    ctx.save()

    // Rotate canvas for diagonal effect
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    ctx.translate(centerX, centerY)
    ctx.rotate((angle * Math.PI) / 180)
    ctx.translate(-centerX, -centerY)

    // Calculate band width to cover the rotated canvas
    const diagonalLength = Math.sqrt(canvas.width * canvas.width + canvas.height * canvas.height)
    const bandWidth = diagonalLength / colors.length

    // Draw distinct color bands
    colors.forEach((color, index) => {
      ctx.fillStyle = color
      const x = index * bandWidth - diagonalLength / 2 + centerX
      ctx.fillRect(x, -diagonalLength / 2 + centerY, bandWidth, diagonalLength)
    })

    ctx.restore()

    // Add subtle pattern overlay if requested
    if (addPattern) {
      ctx.globalAlpha = 0.05
      ctx.fillStyle = ctx.createPattern(createPatternCanvas(), 'repeat')
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
  } else {
    // Create gradient from extracted colors (original behavior)
    const enhancedColors = enhanceColorPalette(colors)
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)

    enhancedColors.forEach((color, index) => {
      gradient.addColorStop(index / (enhancedColors.length - 1), color)
    })

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Add subtle pattern overlay if requested
    if (addPattern) {
      ctx.globalAlpha = 0.1
      ctx.fillStyle = ctx.createPattern(createPatternCanvas(), 'repeat')
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
  }

  return canvas.toDataURL('image/png')
}

/**
 * Create a subtle pattern canvas for overlay
 * @returns {HTMLCanvasElement} Pattern canvas
 */
const createPatternCanvas = () => {
  const patternCanvas = document.createElement('canvas')
  const patternCtx = patternCanvas.getContext('2d')

  patternCanvas.width = 60
  patternCanvas.height = 60

  patternCtx.strokeStyle = '#ffffff'
  patternCtx.lineWidth = 1
  patternCtx.globalAlpha = 0.1

  // Create a subtle geometric pattern
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      patternCtx.beginPath()
      patternCtx.arc(i * 30 + 15, j * 30 + 15, 8, 0, Math.PI * 2)
      patternCtx.stroke()
    }
  }

  return patternCanvas
}

/**
 * Create an elegant pattern canvas for sophisticated overlay
 * @returns {HTMLCanvasElement} Elegant pattern canvas
 */
const createElegantPatternCanvas = () => {
  const patternCanvas = document.createElement('canvas')
  const patternCtx = patternCanvas.getContext('2d')

  patternCanvas.width = 80
  patternCanvas.height = 80

  // Create elegant diagonal lines with varying opacity
  patternCtx.strokeStyle = '#ffffff'
  patternCtx.lineWidth = 0.5
  patternCtx.globalAlpha = 0.15

  // Draw diagonal lines
  for (let i = 0; i < 8; i++) {
    patternCtx.beginPath()
    patternCtx.moveTo(i * 20, 0)
    patternCtx.lineTo(i * 20 + 40, 80)
    patternCtx.stroke()
  }

  // Add subtle dots for texture
  patternCtx.globalAlpha = 0.08
  patternCtx.fillStyle = '#ffffff'
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      patternCtx.beginPath()
      patternCtx.arc(i * 40 + 20, j * 40 + 20, 1, 0, Math.PI * 2)
      patternCtx.fill()
    }
  }

  return patternCanvas
}

/**
 * Determine if a color is light or dark for contrast calculations
 * @param {string} hexColor - Color in hex format
 * @returns {boolean} True if color is light
 */
export const isLightColor = (hexColor) => {
  const rgb = hexToRgb(hexColor)
  if (!rgb) return true

  // Calculate relative luminance
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255
  return luminance > 0.5
}

/**
 * Get contrasting text color for a background
 * @param {string} backgroundColor - Background color in hex
 * @returns {string} Contrasting text color
 */
export const getContrastingTextColor = (backgroundColor) => {
  return isLightColor(backgroundColor) ? '#000000' : '#ffffff'
}
