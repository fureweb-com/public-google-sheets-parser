type SheetName = string
type GID = string

type SheetInfo = SheetName | {
  sheetName?: SheetName
  sheetId?: GID
}

declare class PublicGoogleSheetsParser {
  private id?: string
  private sheetName?: SheetName
  private sheetId?: GID

  constructor(spreadsheetId?: string, sheetInfo?: SheetInfo)

  private parseSheetInfo(sheetInfo: SheetInfo): void
  private getSpreadsheetDataUsingFetch(): Promise<string | null>
  private normalizeRow(rows: any[]): any[]
  private applyHeaderIntoRows(header: string[], rows: any[]): any[]
  private getItems(spreadsheetResponse: string): any[]

  parse(spreadsheetId?: string, sheetInfo?: SheetInfo): Promise<any[]>
}

export default PublicGoogleSheetsParser
