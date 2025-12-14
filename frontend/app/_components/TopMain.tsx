/* eslint-disable */
// TopMain.tsx (Refactored)
import {
  AppdxTable,
  Article,
  Chapter,
  Column,
  // Division,
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
  // SupplProvision,
  Table,
  TableStruct,
  AnyArticle,
} from "@/type/LawDataZod";
import { Box, Typography } from "@mui/material";
// import PersonalBookMarks from "./PersonalBookMarks";

interface TopMainProps {
  data: LawData;
  userId?: string | undefined;
  lawId?: string | undefined;
  bookmarkStatusMap?: Map<string, BookmarkStatus>;
}

export type BookmarkStatus =
  | { exists: true; id: number }
  | { exists: false; id: null };
export const renderTableStruct = (
  tableStructs: TableStruct | null | undefined
) => {
  if (!Array.isArray(tableStructs)) return null;
  return tableStructs.map((ts, idx) => (
    <div key={idx} className="my-3">
      {/* TableStructTitle */}
      {ts.TableStructTitle && (
        <Typography variant="h6" component="h3" className="font-bold mb-1">
          {ts.TableStructTitle}
        </Typography>
      )}

      {/* Table */}
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

      {/* Remarks */}
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
}) => {
  if (!data) return null;

  // const getStatus = (key: string): BookmarkStatus =>
  //   bookmarkStatusMap.get(key) || { exists: false, id: null };

  // // --- 再利用関数 ---

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

  const renderItem = (item: Item) => (
    <div key={item.Num}>
      &nbsp;{item.ItemTitle}
      {renderSentences(item.ItemSentence?.Sentence)}
      {renderColumns(item.ItemSentence?.Column)}
      {renderSubitem1(item.Subitem1)}
      {renderSubitem2(item.Subitem2)}
      {renderSubitem3(item.Subitem3)}
    </div>
  );

  const renderTable = (table: Table) => {
    if (!table?.TableRow) return null;
    return (
      <table
        className={`mx-2 border-${
          table.WritingMode === "vertical" ? "table-fixed" : ""
        }`}
      >
        <tbody>
          {table.TableRow.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row?.TableColumn?.map((column, colIndex) => (
                <td
                  key={colIndex}
                  className={`align-top border border-t-${
                    column.BorderTop === "solid" ? 1 : 0
                  } border-b-${
                    column.BorderBottom === "solid" ? 1 : 0
                  } border-r-${
                    column.BorderRight === "solid" ? 1 : 0
                  } border-l-${column.BorderLeft === "solid" ? 1 : 0} p-2`}
                  rowSpan={column.Rowspan !== 0 ? column.Rowspan : undefined}
                  colSpan={column.Colspan !== 0 ? column.Colspan : undefined}
                >
                  {renderSentences(column.Sentence)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const renderParagraph = (paragraph: Paragraph) => (
    <div key={paragraph.Num}>
      {paragraph.ParagraphCaption && <div>{paragraph.ParagraphCaption}</div>}
      {paragraph.Num}&nbsp;
      {renderSentences(paragraph.ParagraphSentence?.Sentence)}
      {renderTableStruct(paragraph.TableStruct)}
      {paragraph.Item?.map((item) => renderItem(item))}
    </div>
  );

  const renderArticle = (article: AnyArticle, isSuppl: boolean = false) => {
    const articleNum = isSuppl
      ? `${data.ApplData.LawFullText.Law.LawBody.SupplProvision?.[0]?.AmendLawNum}-top-article-${article.Num}`
      : `top-article-${article.Num}`;
    // const status = getStatus(article.Num);

    return (
      <div key={article.Num} id={articleNum}>
        <br />
        {article.ArticleCaption && <p>{article.ArticleCaption}</p>}
        <span className="flex">
          {article.ArticleTitle}
          {/* <PersonalBookMarks
            lawTitle={data?.ApplData?.LawFullText?.Law?.LawBody?.LawTitle?.Text}
            article={article}
            articleNumber={article.Num}
            lawId={lawId}
            userId={userId}
            isBookmarked={status.exists}
            bookmarkId={status.id}
          /> */}
        </span>
        <div>{article?.Paragraph?.map(renderParagraph)}</div>
      </div>
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
              p: 1,
              // my: 2.5,
              // border: 1,
              // borderColor: "#D1D5DB",
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
                  {suppl.Paragraph?.map((p) => (
                    <div
                      key={p.Num}
                      id={`${suppl.AmendLawNum}-paragraph-${p.Num}`}
                    >
                      {p.ParagraphCaption && <div>{p.ParagraphCaption}</div>}
                      {p.Num}&nbsp;
                      {renderSentences(p?.ParagraphSentence?.Sentence)}
                    </div>
                  ))}
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
                    <span className="flex">
                      {appdxTable.AppdxTableTitle}
                      {/* <PersonalBookMarks
                        lawTitle={
                          data?.ApplData?.LawFullText?.Law?.LawBody?.LawTitle
                            ?.Text
                        }
                        appdxTable={appdxTable}
                        articleNumber={appdxTable.AppdxTableTitle}
                        lawId={lawId}
                        userId={userId}
                        isBookmarked={status.exists}
                        bookmarkId={status.id}
                      /> */}
                    </span>
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
