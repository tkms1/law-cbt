// schema.ts
import { z } from "zod";

export const SentenceSchema = z.object({
  WritingMode: z.string().optional(), // 欠損対応
  Text: z.string(),
});

export const ColumnSchema = z.object({
  Num: z.string(),
  Sentence: z.array(SentenceSchema).nullable().optional().default([]),
});

// SubitemSentence 内の Sentence も null 対応
const Subitem1SentenceSchema = z.object({
  Sentence: z.array(SentenceSchema).nullable().optional().default([]),
  Column: z.array(ColumnSchema).nullable().optional().default([]),
});

const Subitem2SentenceSchema = z.object({
  Sentence: z.array(SentenceSchema).nullable().optional().default([]),
  Column: z.array(ColumnSchema).nullable().optional().default([]),
});

const Subitem3SentenceSchema = z.object({
  Sentence: z.array(SentenceSchema).nullable().optional().default([]),
  Column: z.array(ColumnSchema).nullable().optional().default([]),
});

const Subitem3Schema = z.object({
  Num: z.string(),
  Subitem3Title: z.string().optional(),
  Subitem3Sentence: Subitem3SentenceSchema.optional(),
});

const Subitem2Schema = z.object({
  Num: z.string(),
  Subitem2Title: z.string().optional(),
  Subitem2Sentence: Subitem2SentenceSchema.optional(),
  Subitem3: z.array(Subitem3Schema).nullable().optional().default([]),
});

export const Subitem1Schema = z.object({
  Num: z.string(),
  Subitem1Title: z.string().optional(),
  Subitem1Sentence: Subitem1SentenceSchema.optional(),
  Subitem2: z.array(Subitem2Schema).nullable().optional().default([]),
  Subitem3: z.array(Subitem3Schema).nullable().optional().default([]),
});

export const TableColumnSchema = z.object({
  BorderBottom: z.string().optional(),
  BorderLeft: z.string().optional(),
  BorderRight: z.string().optional(),
  BorderTop: z.string().optional(),
  Rowspan: z.number().optional().default(1),
  Colspan: z.number().optional().default(1),
  Sentence: z.array(SentenceSchema).nullable().optional().default([]),
});

export const TableRowSchema = z.object({
  TableColumn: z.array(TableColumnSchema).nullable().optional().default([]),
});

export const TableSchema = z
  .object({
    WritingMode: z.string().nullable().optional(),
    TableRow: z.array(TableRowSchema).nullable().optional().default([]),
  })
  .nullable()
  .optional()
  .default(null);

// ItemSentence の Sentence が null → ここで修正！
const ItemSchema = z.object({
  Num: z.string(),
  ItemTitle: z.string(),
  ItemSentence: z
    .object({
      Sentence: z.array(SentenceSchema).nullable().optional().default([]), // ← ここが重要！
      Column: z.array(ColumnSchema).nullable().optional().default([]),
    })
    .optional(),
  Subitem1: z.array(Subitem1Schema).nullable().optional().default([]),
  Subitem2: z.array(Subitem2Schema).nullable().optional().default([]),
  Subitem3: z.array(Subitem3Schema).nullable().optional().default([]),
});

export const RemarksSchema = z.object({
  RemarksLabel: z.string(),
  Item: z.array(ItemSchema).nullable().optional().default([]),
  Sentence: z.array(SentenceSchema).nullable().optional().default([]),
});

const RawTableStructSchema = z.object({
  TableStructTitle: z.string().optional(),
  Table: TableSchema,
  Remarks: z.array(RemarksSchema).nullable().optional().default([]),
});

export const TableStructSchema = z.array(RawTableStructSchema);

// ParagraphSchema：ParagraphSentence.Sentence が null でもOK
export const ParagraphSchema = z.object({
  Num: z.string(),
  ParagraphSentence: z
    .object({
      Sentence: z.array(SentenceSchema).nullable().optional().default([]), // ← 修正
    })
    .optional(),
  Item: z.array(ItemSchema).nullable().optional().default([]),
  TableStruct: z
    .union([
      z.array(RawTableStructSchema),
      RawTableStructSchema,
      z.null(),
      z.undefined(),
    ])
    .transform((val) => {
      if (Array.isArray(val)) return val;
      if (val == null) return [];
      return [val];
    })
    .optional(),
  ParagraphCaption: z.string().optional(),
});

export const AppdxTableSchema = z.object({
  Num: z.string(),
  AppdxTableTitle: z.string().optional(),
  RelatedArticleNum: z.string().optional(),
  TableStruct: TableStructSchema.nullable(),
  Item: z.array(ItemSchema).nullable().optional().default([]),
  LawTitle: z
    .object({
      Text: z.string(),
      Kana: z.string().optional(),
      Abbrev: z.string().optional(),
    })
    .optional(),
});

// SupplProvisionArticleSchema：Paragraph が null でもOK
export const SupplProvisionArticleSchema = z.lazy(() =>
  z.object({
    Num: z.string(),
    ArticleCaption: z.string().optional(),
    ArticleTitle: z.string(),
    Paragraph: z.array(ParagraphSchema).nullable().optional().default([]), // ← null 可
    LawTitle: z
      .object({
        Text: z.string(),
        Kana: z.string().optional(),
        Abbrev: z.string().optional(),
      })
      .optional(),
    BookmarkID: z.number().optional(),
    LawId: z.string().optional(),
    AppdxTable: AppdxTableSchema.optional(),
    RelatedArticleNum: z.string().optional(),
    AppdxTableTitle: z.string().optional(),
    Item: z.array(ItemSchema).nullable().optional().default([]),
    TableStruct: TableStructSchema.optional(),
  })
);

// SupplProvisionSchema：Paragraph が null でもOK
export const SupplProvisionSchema = z.object({
  AmendLawNum: z.string(),
  Extract: z.boolean().optional(),
  SupplProvisionLabel: z.string(),
  Paragraph: z.array(ParagraphSchema).nullable().optional().default([]), // ← 修正
  Article: z
    .array(SupplProvisionArticleSchema)
    .nullable()
    .optional()
    .default([]),
});

export const ArticleSchema = z.object({
  Num: z.string(),
  ArticleCaption: z.string().optional(),
  ArticleTitle: z.string().optional(),
  Paragraph: z.array(ParagraphSchema).nullable().optional().default([]),
  LawTitle: z
    .object({
      Text: z.string(),
      Kana: z.string().optional(),
      Abbrev: z.string().optional(),
    })
    .optional(),
  BookmarkID: z.number().optional(),
  LawId: z.string().optional(),
  AppdxTable: AppdxTableSchema.optional(),
  SupplProvision: z
    .array(SupplProvisionSchema)
    .nullable()
    .optional()
    .default([]), // ← parse 時に確実に配列にする
  TableStruct: TableStructSchema.nullable().optional(), // ✅ ここを修正！
  RelatedArticleNum: z.string().optional(),
  AppdxTableTitle: z.string().optional(),
  Item: z.array(ItemSchema).nullable().optional().default([]),
});

export interface SectionType {
  Num: string;
  SectionTitle: string;
  Article?: Article[] | null;
  Subsection?: Subsection[] | null;
}
export interface SubsectionType {
  Num: string;
  SubsectionTitle: string;
  Article?: Article[] | null;
  Division?: Division[] | null;
}

// 階層スキーマも一貫性を持たせる
export const SectionSchema: z.ZodType<SectionType> = z.lazy(() =>
  z.object({
    Num: z.string(),
    SectionTitle: z.string(),
    Article: z.array(ArticleSchema).nullable().optional().default([]),
    Subsection: z.array(SubsectionSchema).nullable().optional().default([]),
  })
);

export const SubsectionSchema: z.ZodType<SubsectionType> = z.lazy(() =>
  z.object({
    Num: z.string(),
    SubsectionTitle: z.string(),
    Article: z.array(ArticleSchema).nullable().optional().default([]),
    Division: z.array(DivisionSchema).nullable().optional().default([]),
  })
);

export const DivisionSchema = z.lazy(() =>
  z.object({
    Num: z.string(),
    DivisionTitle: z.string(),
    Article: z.array(ArticleSchema).nullable().optional().default([]),
    Section: z.array(SectionSchema).nullable().optional().default([]),
    Subsection: z.array(SubsectionSchema).nullable().optional().default([]),
  })
);

export const ChapterSchema = z.object({
  Num: z.string(),
  ChapterTitle: z.string(),
  Article: z.array(ArticleSchema).nullable().optional().default([]),
  Section: z.array(SectionSchema).nullable().optional().default([]),
});

export const PartSchema = z.object({
  Num: z.string(),
  PartTitle: z.string(),
  Article: z.array(ArticleSchema).nullable().optional().default([]),
  Chapter: z.array(ChapterSchema).nullable().optional().default([]),
});

export const PreambleSchema = z.object({
  Paragraph: z.array(ParagraphSchema).nullable().optional().default([]),
});

export const LawSchema = z.object({
  LawBody: z.object({
    LawTitle: z
      .object({
        Text: z.string(),
        Kana: z.string().optional(),
        Abbrev: z.string().optional(),
      })
      .optional(),
    Preamble: PreambleSchema.optional(),
    MainProvision: z.object({
      Article: z.array(ArticleSchema).nullable().optional().default([]),
      Part: z.array(PartSchema).nullable().optional().default([]),
      Chapter: z.array(ChapterSchema).nullable().optional().default([]),
      Division: z.array(DivisionSchema).nullable().optional().default([]),
    }),
    SupplProvision: z
      .array(SupplProvisionSchema)
      .nullable()
      .optional()
      .default([]),
    AppdxTable: z.array(AppdxTableSchema).nullable().optional().default([]),
  }),
});
export const BookmarkDataSchema = z.object({
  id: z.number().int().positive(),
  lawId: z.string().min(1),
  userId: z.string().min(1),
  articleNumber: z.string().min(1),
  created_at: z.coerce.date(), // 文字列でも Date に変換可能（例: "2025-04-05T10:00:00Z"）
  article: ArticleSchema.nullable(), // Article | null → nullable() で表現
  lawTitle: z.string().min(1),
});
export const LawDataSchema = z.object({
  Result: z
    .object({
      Code: z.number().optional(),
      Message: z.string().optional(),
    })
    .nullable()
    .optional(),
  ApplData: z.object({
    LawId: z.string(),
    LawFullText: z.object({
      Law: LawSchema,
    }),
  }),
});
// Article と SupplProvisionArticle の両方を受け入れる
export type AnyArticle =
  | z.infer<typeof ArticleSchema>
  | z.infer<typeof SupplProvisionArticleSchema>;
export type Part = z.infer<typeof PartSchema>;
export type Column = z.infer<typeof ColumnSchema>;
export type Article = z.infer<typeof ArticleSchema>;
export type SupplProvisionArticle = z.infer<typeof SupplProvisionArticleSchema>;
export type Section = z.infer<typeof SectionSchema>;
export type Chapter = z.infer<typeof ChapterSchema>;
export type Division = z.infer<typeof DivisionSchema>;
export type Subsection = z.infer<typeof SubsectionSchema>;
export type AppdxTable = z.infer<typeof AppdxTableSchema>;
export type SupplProvision = z.infer<typeof SupplProvisionSchema>;
export type Paragraph = z.infer<typeof ParagraphSchema>;
export type Item = z.infer<typeof ItemSchema>;
export type Table = z.infer<typeof TableSchema>;
export type TableStruct = z.infer<typeof TableStructSchema>;
export type Remarks = z.infer<typeof RemarksSchema>;
export type Sentence = z.infer<typeof SentenceSchema>;
export type Subitem1 = z.infer<typeof Subitem1Schema>;
export type Subitem2 = z.infer<typeof Subitem2Schema>;
export type Subitem3 = z.infer<typeof Subitem3Schema>;
export type TableColumn = z.infer<typeof TableColumnSchema>;
export type TableRow = z.infer<typeof TableRowSchema>;
export type LawData = z.infer<typeof LawDataSchema>;
export type Law = z.infer<typeof LawSchema>;
export type BookmarkData = z.infer<typeof BookmarkDataSchema>;
// export const LawSchema = z.object({
//   LawBody: z.object({
//     LawTitle: z.object({
//       Text: z.string(),
//       Kana: z.string(),
//       Abbrev: z.string(),
//     }), // LawTitle
//     Preamble: PreambleSchema,
//     MainProvision: z.object({
//       Article: z.array(ArticleSchema).nullable(),
//       Part: z.array(PartSchema).nullable().optional().default([]), // ← ここを修正      Chapter: z.array(ChapterSchema).nullable(),
//       Chapter: z.array(ChapterSchema).nullable().optional().default([]), // ← ここを修正
//     }),
//     SupplProvision: z
//       .array(SupplProvisionSchema)
//       .nullable()
//       .optional()
//       .default([]),
//     AppdxTable: z.array(AppdxTableSchema).nullable().optional().default([]),
//   }),
// });
// export const LawDataSchema = z.object({
//   Result: z
//     .object({
//       Code: z.number().optional(),
//       Message: z.string().optional(),
//     })
//     .nullable() // null を許可
//     .optional(), // 欠損も許可,
//   ApplData: z.object({
//     LawId: z.string(),
//     LawFullText: z.object({
//       Law: LawSchema,
//     }),
//   }),
// });
// const ParagraphSchema = z.lazy(
//   (): z.ZodType<Paragraph> =>
//     z.object({
//       Num: z.string(),
//       ParagraphSentence: z.object({
//         Sentence: z.array(SentenceSchema),
//       }),
//       Item: z.array(ItemSchema).optional(),
//       ParagraphCaption: z.string().optional(),
//     })
// ) satisfies z.ZodType<Paragraph>;

// ✅ 新しい配列スキーマ
// export const ParagraphsSchema = z.array(ParagraphSchema) satisfies z.ZodType<
//   Paragraph[]
// >;
// export const ArticleSchema = z.object({
//   Num: z.string(),
//   ArticleCaption: z.string(),
//   ArticleTitle: z.string(),
//   Paragraph: z.array(ParagraphSchema),
//   LawTitle: z.object({
//     Text: z.string(),
//     Kana: z.string(),
//     Abbrev: z.string(),
//   }),
//   BookmarkID: z.number(),
//   LawId: z.string(),
//   // SupplProvision: SupplProvision, // 補則規定（オプショナル）
//   // AppdxTable: AppdxTable, // 付録表（オプショナル）
//   // TableStruct: TableStruct[],
//   RelatedArticleNum: z.string(),
//   AppdxTableTitle: z.string(),
//   // Item: Item[];
// });

// const ColumnSchema = z.object({
//   Num: z.string(),
//   Sentence: z.array(SentenceSchema),
// });

// Subitem3
// const Subitem3SentenceSchema = z.object({
//   Sentence: z.array(SentenceSchema).optional(),
//   Column: z.array(ColumnSchema).optional(),
// });

// const Subitem3Schema = z.lazy(
//   (): z.ZodType<Subitem3> =>
//     z.object({
//       Num: z.string(),
//       Subitem3Title: z.string().optional(), // ← optional
//       Subitem3Sentence: Subitem3SentenceSchema,
//     })
// );

// Subitem2
// const Subitem2SentenceSchema = z.object({
//   Sentence: z.array(SentenceSchema).optional(),
//   Column: z.array(ColumnSchema).optional(),
// });

// const Subitem2Schema = z.lazy(
//   (): z.ZodType<Subitem2> =>
//     z.object({
//       Num: z.string(),
//       Subitem2Title: z.string().optional(), // ← optional
//       Subitem2Sentence: Subitem2SentenceSchema,
//       Subitem3: z.array(Subitem3Schema).optional(),
//     })
// );

// Subitem1
// const Subitem1SentenceSchema = z.object({
//   Sentence: z.array(SentenceSchema).optional(),
//   Column: z.array(ColumnSchema).optional(),
// });

// const Subitem1Schema = z.lazy(
//   (): z.ZodType<Subitem1> =>
//     z.object({
//       Num: z.string(),
//       Subitem1Title: z.string().optional(), // ← optional
//       Subitem1Sentence: Subitem1SentenceSchema,
//       Subitem2: z.array(Subitem2Schema).optional(),
//       Subitem3: z.array(Subitem3Schema).optional(),
//     })
// );

// Item
// const ItemSchema = z.lazy(
//   (): z.ZodType<Item> =>
//     z.object({
//       Num: z.string(),
//       ItemTitle: z.string().optional(),
//       ItemSentence: z
//         .object({
//           Sentence: z.array(SentenceSchema).optional(),
//           Column: z.array(ColumnSchema).optional(),
//         })
//         .optional(),
//       Subitem1: z.array(Subitem1Schema).optional(),
//       Subitem2: z.array(Subitem2Schema).optional(),
//       Subitem3: z.array(Subitem3Schema).optional(),
//     })
// ) satisfies z.ZodType<Item>;
