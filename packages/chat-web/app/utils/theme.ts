export const getStoredTheme = () => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('theme') || null
}

export const setStoredTheme = (theme: string) => {
  if (typeof window === 'undefined') return
  localStorage.setItem('theme', theme)
  document.documentElement.setAttribute('data-theme', theme)
}
