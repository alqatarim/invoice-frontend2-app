export const PRODUCT_META_MARKER = '[[KANAKKU_META]]'

const normalizeString = (value) => (typeof value === 'string' ? value : '')

const isMetaEmpty = (meta) => {
  if (!meta) return true

  const hasBatch = Boolean(
    meta?.batchInfo?.batchNumber ||
      meta?.batchInfo?.expiryDate ||
      (meta?.batchInfo?.shelfLifeDays !== undefined && meta?.batchInfo?.shelfLifeDays !== null)
  )
  const hasVariants = Array.isArray(meta?.variants) && meta.variants.length > 0
  const hasPackaging = Array.isArray(meta?.packagingUnits) && meta.packagingUnits.length > 0
  const hasTiers = Array.isArray(meta?.priceTiers) && meta.priceTiers.length > 0
  const hasPromos = Array.isArray(meta?.promotions) && meta.promotions.length > 0
  const hasSerials = Boolean(
    meta?.serialTracking?.enabled ||
      (Array.isArray(meta?.serialTracking?.serialNumbers) && meta.serialTracking.serialNumbers.length > 0) ||
      (Array.isArray(meta?.serialTracking?.imeiNumbers) && meta.serialTracking.imeiNumbers.length > 0)
  )

  return !(hasBatch || hasVariants || hasPackaging || hasTiers || hasPromos || hasSerials)
}

export const parseProductDescription = (value) => {
  const raw = normalizeString(value)
  const markerIndex = raw.indexOf(PRODUCT_META_MARKER)
  if (markerIndex === -1) {
    return { description: raw.trim(), meta: {} }
  }

  const description = raw.slice(0, markerIndex).trim()
  const jsonText = raw.slice(markerIndex + PRODUCT_META_MARKER.length).trim()

  try {
    const parsed = JSON.parse(jsonText)
    return {
      description,
      meta: parsed && typeof parsed === 'object' ? parsed : {}
    }
  } catch (error) {
    return { description: raw.trim(), meta: {} }
  }
}

export const buildProductDescription = (description, meta) => {
  const baseText = normalizeString(description).trim()
  if (isMetaEmpty(meta)) {
    return baseText
  }

  const metaString = `${PRODUCT_META_MARKER}${JSON.stringify(meta)}`
  if (!baseText) {
    return metaString
  }
  return `${baseText}\n\n${metaString}`
}
