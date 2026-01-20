function globToRegex(glob: string): RegExp {
  // Escape special regex characters except * and ?
  let pattern = glob
    .replace(/[.+^${}()|[\]\\]/g, '\\$&') // Escape regex special chars
    .replace(/\*\*/g, '<!DOUBLESTAR!>') // Temporarily mark ** to handle separately
    .replace(/\*/g, '[^/]*') // * matches any chars except path separator
    .replace(/<!DOUBLESTAR!>/g, '.*') // ** matches any chars including /
    .replace(/\?/g, '.') // ? matches single character

  // Match glob pattern anywhere in the path (not just at start)
  // But if pattern doesn't start with **, anchor it to filename only
  if (!glob.startsWith('**')) {
    // Match just the filename part (after last /)
    pattern = `(^|/)${pattern}$`
  } else {
    pattern = `${pattern}$`
  }

  return new RegExp(pattern, 'i')
}

export function matchGlobPattern(value: string, glob: string): boolean {
  const regex = globToRegex(glob)
  return regex.test(value)
}
