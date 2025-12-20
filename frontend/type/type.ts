// types.ts
export enum PanelType {
  QUESTION = "question",
  LAW = "law",
  ANSWER = "answer",
}

export enum ToolMode {
  SELECT = "select",
  HAND = "hand",
  MARKER = "marker",
  PEN = "pen",
  TEXT = "text",
  SHAPE = "shape",
}

// ▼ 追加: 配色設定の型
export type ColorSchemeType = "none" | "yellow" | "blue" | "black";
