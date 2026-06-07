const ATTRIBUTE = 'data-mui-color-scheme'

const normalizeMode = mode => (mode === 'dark' ? 'dark' : 'light')

export const resolveColorSchemeMode = (mode, systemMode = 'light', prefersDark = false) => {
  if (mode === 'system') return prefersDark ? 'dark' : 'light'

  return normalizeMode(mode || systemMode)
}

export const getThemeColorSchemeInitProps = serverMode => {
  const mode = normalizeMode(serverMode)

  return {
    attribute: ATTRIBUTE,
    script: `document.documentElement.setAttribute('${ATTRIBUTE}','${mode}')`
  }
}
