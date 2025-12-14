interface Law {
  LawBody: {
    LawTitle: {
      Text: string;
      Kana: string;
      Abbrev: string;
    };
    Preamble: Preamble;
    MainProvision: {
      Article: null | Article[];
      Part: Part[];
      Chapter: null | Chapter[];
      // ... 他のプロパティ
    };
    SupplProvision: SupplProvision[];
    AppdxTable: AppdxTable[];
  };
}
interface Preamble {
  Paragraph: Paragraph[];
}
interface AppdxTable {
  Num: string;
  AppdxTableTitle: string;
  RelatedArticleNum: string;
  TableStruct: TableStruct[];
  Item: Item[];
  LawTitle: {
    Text: string;
    Kana: string;
    Abbrev: string;
  };
  BookmarkID: number;
}
interface SupplProvision {
  AmendLawNum: string;
  Extract: boolean;
  SupplProvisionLabel: string;
  Paragraph: Paragraph[];
  Article: Article[];
}
interface Part {
  Num: string;
  PartTitle: string;
  Article: null | Article[];
  Chapter: null | Chapter[];
}
interface Chapter {
  Num: string;
  ChapterTitle: string;
  Article: null | Article[];
  Section: Section[];

  // ... 他のプロパティ
}

interface Section {
  Num: string;
  SectionTitle: string;
  Article: Article[];
  Subsection: Subsection[];
}
interface Division {
  Num: string;
  DivisionTitle: string;
  Article: Article[];
}

interface Subsection {
  Num: string;
  SubsectionTitle: string;
  Article: Article[];
  Division: Division[];
}

interface Article {
  Num: string;
  // ArticleCaption: string;
  ArticleCaption: string;
  ArticleTitle: string;
  Paragraph: Paragraph[];
  LawTitle: {
    Text: string;
    Kana: string;
    Abbrev: string;
  };
  BookmarkID: number;
  LawId: string;
  SupplProvision: SupplProvision; // 補則規定（オプショナル）
  AppdxTable: AppdxTable; // 付録表（オプショナル）
  TableStruct: TableStruct[];
  RelatedArticleNum: string;
  AppdxTableTitle: string;
  Item: Item[];
  // ... 他のプロパティ
}
// interface ArticleCaption {
//   WritingMode: string;
//   Text: string;
//   Ruby: string;
// }
interface Paragraph {
  Num: string;
  ParagraphSentence: {
    Sentence: Sentence[];
  };
  Item: Item[];
  TableStruct: TableStruct;
  ParagraphCaption: string;
}
interface TableStruct {
  TableStructTitle: string;
  Table: Table;
  Remarks: Remarks[];
}
interface Remarks {
  RemarksLabel: string;
  Item: Item[];
  Sentence: Sentence[];
}

interface Table {
  WritingMode: string;
  TableRow: TableRow[];
}

interface TableRow {
  TableColumn: TableColumn[];
}

interface TableColumn {
  BorderBottom: string;
  BorderLeft: string;
  BorderRight: string;
  BorderTop: string;
  Rowspan: number;
  Colspan: number;
  Sentence: Sentence[];
}
interface Sentence {
  WritingMode: string;
  Text: string;
}
interface Item {
  Num: string;
  ItemTitle: string;
  ItemSentence: {
    Sentence: Sentence[];
    Column: Column[];
  };
  Subitem1: Subitem1[];
  Subitem2: Subitem2[];
  Subitem3: Subitem3[];
}

interface Subitem1 {
  Num: string;
  Subitem1Title: string;
  Subitem1Sentence: Subitem1Sentence;
  Subitem2: Subitem2[];
  Subitem3: Subitem3[];
}

interface Subitem1Sentence {
  Sentence: Sentence[];
  Column: Column[];
}

interface Subitem2 {
  Num: string;
  Subitem2Title: string;
  Subitem2Sentence: Subitem2Sentence;
  Subitem3: Subitem3[];
}

interface Subitem2Sentence {
  Sentence: Sentence[];
  Column: Column[];
}

interface Subitem3 {
  Num: string;
  Subitem3Title: string;
  Subitem3Sentence: Subitem3Sentence;
}

interface Subitem3Sentence {
  Sentence: Sentence[];
  Column: Column[];
}
interface Column {
  Num: string;
  Sentence: Sentence[];
}
interface BookmarkData {
  id: number; // ブックマークの固有ID
  lawId: string; // 法令ID
  userId: string; // ユーザーID
  articleNumber: string; // 条文番号
  created_at: Date; // 作成日時
  article: Article | null; // 段落データ
  lawTitle: string;
}
// 与えられたJSONデータに基づく型定義
interface LawData {
  Result?: {
    Code: number;
    Message: string;
  };
  ApplData: {
    LawId: string;
    LawFullText: {
      Law: Law;
    };
  };
}
export type {
  AppdxTable,
  SupplProvision,
  TableStruct,
  Subitem3,
  Subitem2,
  Subitem1,
  Chapter,
  Division,
  Subsection,
  Section,
  Column,
  Sentence,
  Part,
  Paragraph,
  Article,
  Item,
  Table,
  LawData,
  Subitem1Sentence,
  Law,
  BookmarkData,
  Preamble,
};
