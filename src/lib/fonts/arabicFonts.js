import {
  Almarai,
  Amiri,
  Cairo,
  IBM_Plex_Sans_Arabic,
  Noto_Kufi_Arabic,
  Noto_Naskh_Arabic,
  Noto_Sans_Arabic,
  Tajawal,
} from 'next/font/google'

const notoKufiArabic = Noto_Kufi_Arabic({
  subsets: ['arabic'],
  weight: 'variable',
  display: 'swap',
  variable: '--font-noto-kufi-arabic',
})

const notoSansArabic = Noto_Sans_Arabic({
  subsets: ['arabic'],
  weight: 'variable',
  display: 'swap',
  variable: '--font-noto-sans-arabic',
})

const notoNaskhArabic = Noto_Naskh_Arabic({
  subsets: ['arabic'],
  weight: 'variable',
  display: 'swap',
  variable: '--font-noto-naskh-arabic',
})

const cairo = Cairo({
  subsets: ['arabic'],
  weight: 'variable',
  display: 'swap',
  variable: '--font-cairo',
})

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-ibm-plex-sans-arabic',
})

const tajawal = Tajawal({
  subsets: ['arabic'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--font-tajawal',
})

const almarai = Almarai({
  subsets: ['arabic'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-almarai',
})

const amiri = Amiri({
  subsets: ['arabic'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-amiri',
})

/** All next/font Arabic loaders — variables are registered in app/layout.jsx */
export const loadedArabicFonts = [
  notoKufiArabic,
  notoSansArabic,
  notoNaskhArabic,
  cairo,
  ibmPlexSansArabic,
  tajawal,
  almarai,
  amiri,
]

/** Join for `<html className={...}>` in layout.jsx */
export const arabicFontVariableClassName = loadedArabicFonts.map((font) => font.variable).join(' ')

/**
 * Pick a font in any component:
 *   fontFamily: ARABIC_FONT_FAMILIES.cairo
 *   fontFamily: ARABIC_FONT_FAMILIES.ibmPlexSansArabic
 *   fontFamily: ARABIC_FONT_FAMILIES.arial
 */
export const ArabicFonts = {
  default: 'var(--font-noto-kufi-arabic), sans-serif',
  notoKufiArabic: 'var(--font-noto-kufi-arabic), sans-serif',
  notoSansArabic: 'var(--font-noto-sans-arabic), sans-serif',
  notoNaskhArabic: 'var(--font-noto-naskh-arabic), sans-serif',
  cairo: 'var(--font-cairo), sans-serif',
  ibmPlexSansArabic: 'var(--font-ibm-plex-sans-arabic), sans-serif',
  ibmPlex: 'var(--font-ibm-plex-sans-arabic), sans-serif',
  tajawal: 'var(--font-tajawal), sans-serif',
  almarai: 'var(--font-almarai), sans-serif',
  amiri: 'var(--font-amiri), sans-serif',
  arial: 'Arial, sans-serif',
  tahoma: 'Tahoma, sans-serif',
  sansSerif: 'sans-serif',
}

/** @deprecated Use ARABIC_FONT_FAMILIES.default */
export const ARABIC_FONT_FAMILY = ArabicFonts.default

/** Default loader — backward compatible */
export const arabicFont = notoKufiArabic

export const arabicFontLoaders = {
  notoKufiArabic,
  notoSansArabic,
  notoNaskhArabic,
  cairo,
  ibmPlexSansArabic,
  tajawal,
  almarai,
  amiri,
}
