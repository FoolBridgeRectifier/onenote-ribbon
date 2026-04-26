export interface TextPosition {
  line: number;
  ch: number;
}

export interface TextIndex {
  lineStartOffsets: number[];
  lineLengths: number[];
  sourceLength: number;
}
