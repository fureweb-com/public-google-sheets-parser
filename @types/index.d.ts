interface ISheetOption {
  sheetName?: TSheetName
  sheetId?: TGID
  useFormat?: boolean
  useFormattedDate?: boolean
}

type TSpreadSheetId = string
type TSheetName = string
type TGID = string
type TOption = TSheetName | ISheetOption

declare class PublicGoogleSheetsParser {
  private id?: TSpreadSheetId
  private sheetName?: TSheetName
  private sheetId?: TGID
  private useFormat: boolean = false
  private useFormattedDate: boolean = false

  constructor(spreadsheetId?: TSpreadSheetId, option?: TOption)

  private isDate(date: string): boolean
  private getSpreadsheetDataUsingFetch(): Promise<string | null>
  private normalizeRow(rows: any[]): any[]
  private applyHeaderIntoRows(header: string[], rows: any[]): any[]
  private getItems(spreadsheetResponse: string): any[]
  
  setOption(option?: TOption): void
  parse(spreadsheetId?: TSpreadSheetId, option?: TOption): Promise<any[]>
}

export default PublicGoogleSheetsParser