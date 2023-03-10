type SheetName = string
type SheetInfo = SheetName | {
  sheetName?: SheetName
  sheetId?: number
}

declare class PublicGoogleSheetsParser {
  private id?: string
  private sheetId?: string
  private sheetName?: string

  constructor(spreadsheetId?: string, sheetInfo?: SheetInfo)

  private parseSheetInfo(sheetInfo: SheetInfo): void
  private getSpreadsheetDataUsingFetch(): Promise<string | null>
  private normalizeRow(rows: any[]): any[]
  private applyHeaderIntoRows(header: string[], rows: any[]): any[]
  private getItems(spreadsheetResponse: string): any[]

  parse(spreadsheetId?: string, sheetInfo?: SheetInfo): Promise<any[]>
}

export default PublicGoogleSheetsParser
