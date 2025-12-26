/* eslint-disable */
import React from "react";
import {
  AppdxTable,
  Article,
  Chapter,
  Column,
  Item,
  LawData,
  Paragraph,
  Part,
  Section,
  Sentence,
  Subitem1,
  Subitem2,
  Subitem3,
  Subsection,
  Table,
  TableStruct,
  AnyArticle,
} from "@/type/LawDataZod";
import { Box, Typography, IconButton, Tooltip } from "@mui/material";
import { NoteAdd, NoteAlt } from "@mui/icons-material";
import { ColorSchemeType } from "../../type/type";

interface TopMainProps {
  data: LawData;
  userId?: string | undefined;
  lawId?: string | undefined;
  bookmarkStatusMap?: Map<string, any>; // 簡易化のため any
  stickyNotes?: Set<string>;
  onToggleSticky?: (id: string) => void;
  colorScheme?: ColorSchemeType;
}

export const renderTableStruct = (
  tableStructs: TableStruct | null | undefined
) => {
  if (!Array.isArray(tableStructs)) return null;
  return tableStructs.map((ts, idx) => (
    <div key={idx} className="my-3">
      {ts.TableStructTitle && (
        <Typography variant="h6" component="h3" className="font-bold mb-1">
          {ts.TableStructTitle}
        </Typography>
      )}
      {ts.Table &&
        Array.isArray(ts.Table.TableRow) &&
        ts.Table.TableRow.length > 0 && (
          <table
            className={`mx-2 border-collapse ${
              ts.Table.WritingMode === "vertical" ? "table-fixed" : ""
            }`}
          >
            <tbody>
              {ts.Table.TableRow.map((tr, i) => (
                <tr key={i}>
                  {Array.isArray(tr.TableColumn) &&
                    tr.TableColumn.map((tc, j) => (
                      <td
                        key={j}
                        className={`align-top p-2 ${
                          tc.BorderTop !== "none" ? "border-t" : ""
                        } ${tc.BorderBottom !== "none" ? "border-b" : ""} ${
                          tc.BorderLeft !== "none" ? "border-l" : ""
                        } ${tc.BorderRight !== "none" ? "border-r" : ""}`}
                        rowSpan={tc.Rowspan !== 0 ? tc.Rowspan : undefined}
                        colSpan={tc.Colspan !== 0 ? tc.Colspan : undefined}
                      >
                        {renderSentences(tc.Sentence)}
                      </td>
                    ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      {Array.isArray(ts.Remarks) &&
        ts.Remarks.map((remark, rIdx) => (
          <div key={rIdx} className="mt-2 text-sm text-gray-600">
            <strong>{remark.RemarksLabel}:</strong>
            {renderSentences(remark.Sentence)}
            {Array.isArray(remark.Item) &&
              remark.Item.map((item) => (
                <div key={item.Num} className="ml-4 mt-1">
                  {item.ItemTitle}．
                  {renderSentences(item.ItemSentence?.Sentence)}
                </div>
              ))}
          </div>
        ))}
    </div>
  ));
};

export const renderSentences = (sentences: Sentence[] | null | undefined) => {
  if (!Array.isArray(sentences)) return null;
  return sentences.map((s, i) => <span key={i}>{s.Text}</span>);
};

const TopMain: React.FC<TopMainProps> = ({
  data,
  userId,
  lawId,
  bookmarkStatusMap,
  stickyNotes = new Set(),
  onToggleSticky = () => {},
  colorScheme = "none",
}) => {
  if (!data) return null;

  const isDark = colorScheme === "black";

  // ▼ ヘルパー: 付箋ボタンコンポーネント
  const StickyButton = ({ id }: { id: string }) => {
    const isActive = stickyNotes.has(id);
    return (
      <Tooltip title={isActive ? "付箋を外す" : "付箋を貼る"}>
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSticky(id);
          }}
          sx={{
            mr: 0.5,
            mt: -0.5, // 位置微調整
            color: isActive ? "#f50057" : isDark ? "grey.600" : "grey.300",
            "&:hover": {
              color: isActive ? "#c51162" : "grey.500",
              bgcolor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.04)",
            },
          }}
        >
          {isActive ? (
            <NoteAlt fontSize="small" />
          ) : (
            <NoteAdd fontSize="small" />
          )}
        </IconButton>
      </Tooltip>
    );
  };

  const renderColumns = (columns: Column[] | null | undefined) => {
    if (!Array.isArray(columns)) return null;
    return columns.map((col) => (
      <div key={col.Num} className="inline">
        &nbsp;
        {renderSentences(col.Sentence)}
      </div>
    ));
  };

  const renderSubitem3 = (subitems3: Subitem3[] | null | undefined) => {
    if (!Array.isArray(subitems3)) return null;
    return subitems3.map((sub) => (
      <div key={sub.Num}>
        &nbsp;&nbsp;&nbsp;&nbsp;{sub.Subitem3Title}&nbsp;
        {renderSentences(sub.Subitem3Sentence?.Sentence)}
        {renderColumns(sub.Subitem3Sentence?.Column)}
      </div>
    ));
  };

  const renderSubitem2 = (subitems2: Subitem2[] | null | undefined) => {
    if (!Array.isArray(subitems2)) return null;
    return subitems2.map((sub) => (
      <div key={sub.Num}>
        &nbsp;&nbsp;&nbsp;{sub.Subitem2Title}&nbsp;
        {renderSentences(sub.Subitem2Sentence?.Sentence)}
        {renderColumns(sub.Subitem2Sentence?.Column)}
        {renderSubitem3(sub.Subitem3)}
      </div>
    ));
  };

  const renderSubitem1 = (subitems1: Subitem1[] | null | undefined) => {
    if (!Array.isArray(subitems1)) return null;
    return subitems1.map((sub) => (
      <div key={sub.Num}>
        &nbsp;&nbsp;{sub.Subitem1Title}&nbsp;
        {renderSentences(sub.Subitem1Sentence?.Sentence)}
        {renderColumns(sub.Subitem1Sentence?.Column)}
        {renderSubitem2(sub.Subitem2)}
        {renderSubitem3(sub.Subitem3)}
      </div>
    ));
  };

  // 号 (Item) のレンダリング
  const renderItem = (
    item: Item,
    articleNum?: string,
    paragraphNum?: string
  ) => {
    // 付箋用ID生成に必要な情報が揃っているか
    const canSticky = articleNum && paragraphNum && item.Num;

    // 付箋ID: Article-73-Paragraph-1-Item-1
    const uniqueId = canSticky
      ? `Article-${articleNum}-Paragraph-${paragraphNum}-Item-${item.Num}`
      : "";

    // スクロール用DOM ID: 73-paragraph-1-item-1
    const domId = canSticky
      ? `${articleNum}-paragraph-${paragraphNum}-item-${item.Num}`
      : undefined;

    // 号のテキストコンテンツ
    const content = (
      <>
        {item.ItemTitle}
        {renderSentences(item.ItemSentence?.Sentence)}
        {renderColumns(item.ItemSentence?.Column)}
        {renderSubitem1(item.Subitem1)}
        {renderSubitem2(item.Subitem2)}
        {renderSubitem3(item.Subitem3)}
      </>
    );

    // 付箋可能な場合 (通常の条文内の号)
    if (canSticky) {
      return (
        <Box
          key={item.Num}
          id={domId}
          sx={{
            display: "flex",
            alignItems: "flex-start",
            // アイコンの位置を項などと揃えるため、親でのインデントを回避する構造にする
            // ここではテキスト側にマージンを持たせる
            mt: 0.5,
          }}
        >
          {/* 左側の付箋ボタン (左端) */}
          <Box sx={{ flexShrink: 0 }}>
            <StickyButton id={uniqueId} />
          </Box>
          {/* 右側のテキスト (ここでインデントを設定) */}
          <Box sx={{ ml: 3 }}>{content}</Box>
        </Box>
      );
    }

    // 付箋なしの場合 (別表や構造化テーブル内の号など)
    return (
      <div key={item.Num} style={{ marginLeft: "1em" }}>
        &nbsp;{content}
      </div>
    );
  };

  // ★修正: renderParagraphの構造を変更
  const renderParagraph = (paragraph: Paragraph, parentArticleNum: string) => {
    // ID生成: 条数 + 段落番号
    const pNum = paragraph.Num || "1";
    const uniqueId = `Article-${parentArticleNum}-Paragraph-${pNum}`;

    return (
      <Box
        key={paragraph.Num}
        id={`${parentArticleNum}-paragraph-${paragraph.Num}`}
        sx={{ mb: 1 }}
      >
        {/* 項の本文ブロック (Flex) */}
        <Box sx={{ display: "flex", alignItems: "flex-start" }}>
          {/* 左側に付箋ボタン配置 */}
          <Box sx={{ flexShrink: 0 }}>
            <StickyButton id={uniqueId} />
          </Box>

          {/* 右側にテキスト本文 */}
          <Box>
            {paragraph.ParagraphCaption && (
              <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
                {paragraph.ParagraphCaption}
              </div>
            )}
            <span>
              {/* 1項の場合は番号を表示しない */}
              {paragraph.Num != "1" && <>{paragraph.Num}&nbsp;</>}
              {renderSentences(paragraph.ParagraphSentence?.Sentence)}
            </span>
            {renderTableStruct(paragraph.TableStruct)}
          </Box>
        </Box>

        {/* 
          ★ポイント: 号（Item）のレンダリングを「項のテキストBox」の外に出す。
          これにより、renderItem内のStickyButtonが、親のインデント影響を受けずに左端に配置される。
          renderItem側でテキストに `ml: 3` を設定しているため、テキストのインデント構造は維持される。
        */}
        {paragraph.Item?.map((item) =>
          renderItem(item, parentArticleNum, pNum)
        )}
      </Box>
    );
  };

  const renderArticle = (article: AnyArticle, isSuppl: boolean = false) => {
    const articleDomId = isSuppl
      ? `${data.ApplData.LawFullText.Law.LawBody.SupplProvision?.[0]?.AmendLawNum}-top-article-${article.Num}`
      : `top-article-${article.Num}`;

    const titleStickyId = `Article-${article.Num}`;
    const captionStickyId = `Article-${article.Num}-Caption`;
    const captionDomId = `${articleDomId}-caption`;

    return (
      <Box key={article.Num} id={articleDomId} sx={{ mt: 3, mb: 2 }}>
        {/* ArticleCaptionが存在する場合 */}
        {article.ArticleCaption && (
          <Box
            id={captionDomId}
            sx={{ display: "flex", alignItems: "center", mb: 0.5 }}
          >
            <Box sx={{ flexShrink: 0 }}>
              <StickyButton id={captionStickyId} />
            </Box>
            <Typography variant="caption" sx={{ fontWeight: "bold" }}>
              {article.ArticleCaption}
            </Typography>
          </Box>
        )}

        {/* 条文タイトル (ArticleTitle) */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <Box sx={{ flexShrink: 0 }}>
            <StickyButton id={titleStickyId} />
          </Box>
          <Typography fontWeight="bold">{article.ArticleTitle}</Typography>
        </Box>

        {/* 段落のレンダリング */}
        <Box sx={{ pl: 0 }}>
          {article?.Paragraph?.map((p) => renderParagraph(p, article.Num))}
        </Box>
      </Box>
    );
  };

  const renderSubsection = (subsection: Subsection) => (
    <div key={subsection.Num}>
      <br />
      <p>{subsection.SubsectionTitle}</p>
      <div>
        {subsection.Article?.map((art) => renderArticle(art))}
        {subsection.Division?.map((division) => (
          <div key={division.Num}>
            <p>{division.DivisionTitle}</p>
            <div>{division.Article?.map((art) => renderArticle(art))}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSection = (section: Section) => (
    <div key={section.Num}>
      <p>{section.SectionTitle}</p>
      <div>
        {section.Article?.map((art) => renderArticle(art))}
        {section.Subsection?.map(renderSubsection)}
      </div>
    </div>
  );

  const renderChapter = (chapter: Chapter) => (
    <div key={chapter.Num}>
      <br />
      <p>{chapter.ChapterTitle}</p>
      <div>
        {chapter.Article?.map((art) => renderArticle(art))}
        {chapter.Section?.map(renderSection)}
      </div>
    </div>
  );

  const renderPart = (part: Part) => (
    <div key={part.Num}>
      <br />
      {part.PartTitle}
      <div>
        {part.Article?.map((art) => renderArticle(art))}
        {part.Chapter?.map(renderChapter)}
      </div>
    </div>
  );

  const mainProvision = data.ApplData.LawFullText.Law.LawBody.MainProvision;

  return (
    <>
      <div id="top-box">
        {data && (
          <Box
            sx={{
              p: 2,
              pb: 20, // 下部に余白を追加
              boxShadow: 1,
              bgcolor: "white",
            }}
          >
            <h2>{data?.ApplData?.LawFullText?.Law?.LawBody?.LawTitle?.Text}</h2>

            {/* Preamble */}
            {data?.ApplData?.LawFullText?.Law?.LawBody?.Preamble?.Paragraph?.map(
              (p) => (
                <div key={p.Num}>
                  {renderSentences(p?.ParagraphSentence?.Sentence)}
                </div>
              )
            )}

            {/* MainProvision */}
            {mainProvision.Part?.map(renderPart)}
            {mainProvision.Chapter?.map(renderChapter)}
            {mainProvision.Division?.map((division) => (
              <div key={division.Num}>
                <p>{division.DivisionTitle}</p>
                <div>
                  {division.Article?.map((art) => renderArticle(art))}
                  {division.Section?.map(renderSection)}
                  {division.Subsection?.map(renderSubsection)}
                </div>
              </div>
            ))}
            {!mainProvision.Part &&
              !mainProvision.Chapter &&
              !mainProvision.Division &&
              mainProvision.Article?.map((art) => renderArticle(art))}

            {/* 補足規定 */}
            {data.ApplData.LawFullText.Law.LawBody.SupplProvision?.map(
              (suppl, idx) => (
                <div key={idx}>
                  <br />
                  <div>
                    {suppl.SupplProvisionLabel}({suppl.AmendLawNum})
                  </div>
                  {suppl.Article?.map((art) => renderArticle(art, true))}
                  {suppl.Paragraph?.map((p) => {
                    const uniqueId = `${suppl.AmendLawNum}-Paragraph-${
                      p.Num || "1"
                    }`;
                    return (
                      <Box
                        key={p.Num}
                        id={`${suppl.AmendLawNum}-paragraph-${p.Num}`}
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          mb: 1,
                        }}
                      >
                        <Box sx={{ flexShrink: 0 }}>
                          <StickyButton id={uniqueId} />
                        </Box>
                        <Box>
                          {p.ParagraphCaption && (
                            <div>{p.ParagraphCaption}</div>
                          )}
                          {/* 1項の場合は番号を表示しない */}
                          {p.Num != "1" && <>{p.Num}&nbsp;</>}
                          {renderSentences(p?.ParagraphSentence?.Sentence)}
                        </Box>
                      </Box>
                    );
                  })}
                </div>
              )
            )}

            {/* 附則表 */}
            {data.ApplData.LawFullText.Law.LawBody.AppdxTable?.map(
              (appdxTable, index) => {
                if (!appdxTable?.AppdxTableTitle) return null;
                // const status = getStatus(appdxTable.AppdxTableTitle);
                return (
                  <div
                    key={index}
                    id={`top-appendTable-${appdxTable.AppdxTableTitle}`}
                  >
                    <Typography component="br" />
                    <span className="flex">{appdxTable.AppdxTableTitle}</span>
                    <div className="ml-4">
                      {appdxTable?.RelatedArticleNum?.replace(/　/g, "")}
                      {appdxTable.Item?.map((item) => renderItem(item))}
                      {renderTableStruct(appdxTable.TableStruct)}
                    </div>
                  </div>
                );
              }
            )}
          </Box>
        )}
      </div>
    </>
  );
};

export default TopMain;
