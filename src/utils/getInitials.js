/**
 * Returns the initials of a given string
 * @param {String} string
 */
export const getInitials = string => {
  if (!string) return 'U'
  
  const words = string.split(' ')
  
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase()
  }
  
  return words[0].charAt(0).toUpperCase() + words[1].charAt(0).toUpperCase()
}