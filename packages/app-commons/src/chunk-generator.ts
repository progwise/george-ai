export function* chunkGenerator<T>(arr: T[], chunkSize: number) {
  for (let i = 0; i < arr.length; i++) {
    yield arr.slice(i, i + chunkSize)
  }
}
