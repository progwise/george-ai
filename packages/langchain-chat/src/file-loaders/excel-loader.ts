import readXlsxFile, { readSheetNames } from 'read-excel-file/node'

export class ExcelLoader {
  constructor(private filePath: string) {}

  async load() {
    const sheetNames = await readSheetNames(this.filePath)
    const documents = []
    for (const sheetName of sheetNames) {
      const rows = await readXlsxFile(this.filePath, { sheet: sheetName })

      documents.push(
        ...rows.map((row, index) => ({
          pageContent: row.join('; '),
          metadata: {
            source: this.filePath,
            line: index,
            sheetName,
          },
        })),
      )
    }
    return documents
  }
}
