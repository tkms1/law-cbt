export enum PanelType {
  QUESTION = "QUESTION",
  LAW = "LAW",
  ANSWER = "ANSWER",
}

export enum ColorTheme {
  DEFAULT = "DEFAULT",
  YELLOW = "YELLOW",
  BLUE = "BLUE",
  BLACK = "BLACK",
}

export enum ToolMode {
  SELECT = "SELECT",
  HAND = "HAND",
  MARKER = "MARKER",
  PEN = "PEN",
  TEXT = "TEXT",
  SHAPE = "SHAPE",
}

export interface LawChapter {
  id: string;
  title: string;
  content: string;
}

export interface QuestionData {
  id: string;
  title: string;
  content: string;
}

export interface AnswerData {
  id: string;
  questionId: string;
  content: string;
}
