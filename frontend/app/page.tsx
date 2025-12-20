// App.tsx
"use client";
import React, { useState, useEffect, useRef, memo, useCallback } from "react";
import { Box, CircularProgress, Backdrop, Typography } from "@mui/material";
import { Header } from "./_components/Header";
import { QuestionPanel, QuestionPanelRef } from "./_components/QuestionPanel";
import { LawPanel } from "./_components/LawPanel";
import { AnswerPanel } from "./_components/AnswerPanel";
import { MemoPad } from "./_components/MemoPad";
import { PanelType, ColorSchemeType } from "../type//type";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// メモ化コンポーネント
const MemoizedQuestionPanel = memo(QuestionPanel);
const MemoizedLawPanel = memo(LawPanel);
const MemoizedAnswerPanel = memo(AnswerPanel);

function App() {
  // 表示するパネルの種類の管理
  const [visiblePanels, setVisiblePanels] = useState<PanelType[]>([
    PanelType.QUESTION,
    PanelType.LAW,
    PanelType.ANSWER,
  ]);

  const [panelOrder, setPanelOrder] = useState<PanelType[]>([
    PanelType.QUESTION,
    PanelType.LAW,
    PanelType.ANSWER,
  ]);

  const [answerText, setAnswerText] = useState("");
  const [horizontalSplit, setHorizontalSplit] = useState(50);
  const [verticalSplit, setVerticalSplit] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const [resizingDirection, setResizingDirection] = useState<
    "horizontal" | "vertical" | null
  >(null);

  // QuestionPanelのref
  const questionPanelRef = useRef<QuestionPanelRef>(null);

  // PDF生成中のローディングstate
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [showMemo, setShowMemo] = useState(false);

  // 配色設定の状態管理
  const [colorScheme, setColorScheme] = useState<ColorSchemeType>("none");

  // --- タイマー関連 ---
  const [timeLeft, setTimeLeft] = useState(7200); // 2時間
  // タイマーが動いているかどうかのフラグ
  const [isTimerActive, setIsTimerActive] = useState(false);

  useEffect(() => {
    if (!isTimerActive) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimerActive]);

  const handlePdfLoaded = useCallback(() => {
    setTimeLeft(7200);
    setIsTimerActive(true);
  }, []);

  // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
  // ★ 修正版: PDF生成処理 (スマート分割 & 余白対応)
  // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
  const handleFinish = async () => {
    if (!window.confirm("答案を提出して試験を終了しますか？")) {
      return;
    }

    setIsTimerActive(false);
    setIsGeneratingPdf(true);

    try {
      // 1. 日本語フォントを読み込む
      const fontResponse = await fetch("/MPLUS1p-Regular.ttf");
      if (!fontResponse.ok) {
        throw new Error(
          "フォントファイルの読み込みに失敗しました。public/fonts/MPLUS1p-Regular.ttf を確認してください。"
        );
      }
      const font = await fontResponse.arrayBuffer();

      const questionContent = questionPanelRef.current?.getContent();
      if (!questionContent) {
        alert("問題文が読み込まれていません。");
        return;
      }

      // 2. 一時的なコンテナを作成して問題文のHTMLをレンダリング
      const container = document.createElement("div");
      container.style.position = "absolute";
      container.style.left = "-9999px";
      container.style.top = "0px";
      container.style.width = "800px"; // 描画幅を固定
      container.style.padding = "20px"; // HTMLレンダリング時の内部パディング
      container.style.backgroundColor = "white"; // ★重要: 背景を白にしておかないとピクセル判定が誤動作する
      container.innerHTML = questionContent;
      document.body.appendChild(container);

      // 3. html2canvasで問題文全体を1枚の長い画像に変換
      const canvas = await html2canvas(container, {
        scale: 2, // 文字の鮮明さのためscaleは2推奨
        useCORS: true,
        height: container.scrollHeight, // 全体をキャプチャ
        windowHeight: container.scrollHeight,
      });

      // 一時的なコンテナを削除
      document.body.removeChild(container);

      // 4. jsPDFの準備
      const pdf = new jsPDF({
        orientation: "p",
        unit: "mm",
        format: "a4",
      });

      // フォント登録
      pdf.addFileToVFS(
        "MPLUS1p-Regular.ttf",
        Buffer.from(font).toString("base64")
      );
      pdf.addFont("MPLUS1p-Regular.ttf", "MPLUS1p-Regular", "normal");

      // --- ページ分割と余白の計算設定 ---
      const pdfPageWidth = pdf.internal.pageSize.getWidth(); // 210mm
      const pdfPageHeight = pdf.internal.pageSize.getHeight(); // 297mm
      const margin = 20; // ★ PDF周囲の余白 (mm)

      // PDF上のコンテンツ描画可能エリア
      const contentWidthMm = pdfPageWidth - margin * 2;
      const contentHeightMm = pdfPageHeight - margin * 2;

      // キャンバス上の画像幅とPDF上の幅の比率
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      // PDFのコンテンツ幅(mm)に合わせたときの、キャンバス上のピクセル換算係数
      const pxPerMm = imgWidth / contentWidthMm;

      // 1ページに収められるキャンバス上の高さ制限 (px)
      const pageHeightInPx = contentHeightMm * pxPerMm;

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context error");

      let currentY = 0; // 現在処理しているキャンバスのY位置

      // --- 画像をページごとに分割して配置するループ ---
      while (currentY < imgHeight) {
        // 残りの高さが1ページに収まるか？
        let splitHeight = pageHeightInPx;

        if (currentY + splitHeight > imgHeight) {
          // 残りが1ページ未満ならそのまま採用
          splitHeight = imgHeight - currentY;
        } else {
          // --- スマート分割ロジック ---
          // ページ区切り位置(proposedSplitY)が文字の上に来ないよう、
          // その位置から上に向かって「白い行（余白）」を探す
          const proposedSplitY = currentY + splitHeight;
          const searchRange = splitHeight * 0.2; // ページ下部20%の範囲を探索

          // チェックする画像の幅（全幅）
          const checkWidth = imgWidth;
          // 探索範囲の高さ
          const scanHeight = Math.floor(searchRange);
          // 探索開始位置（Y）
          const scanStartY = Math.floor(proposedSplitY - scanHeight);

          if (scanStartY > currentY) {
            // 該当エリアのピクセルデータを取得
            const imageData = ctx.getImageData(
              0,
              scanStartY,
              checkWidth,
              scanHeight
            );
            const data = imageData.data;

            // 下（ページ区切り予定位置に近い方）から上に向かって走査
            for (let y = scanHeight - 1; y >= 0; y--) {
              let isRowWhite = true;

              // 横方向のピクセルをチェック (高速化のため5px飛ばしでチェック)
              for (let x = 0; x < checkWidth; x += 5) {
                const idx = (y * checkWidth + x) * 4;
                const r = data[idx];
                const g = data[idx + 1];
                const b = data[idx + 2];
                // 白ではない画素（文字など）があるか判定
                // JPEGノイズやアンチエイリアスを考慮し、240程度を閾値とする
                if (r < 240 || g < 240 || b < 240) {
                  isRowWhite = false;
                  break;
                }
              }

              if (isRowWhite) {
                // 白い行が見つかった！ここを実際の区切り位置にする
                splitHeight = scanStartY + y - currentY;
                break;
              }
            }
          }
        }

        // --- 切り出した画像をPDFに追加 ---
        // 1. その部分だけのCanvasを作成
        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = imgWidth;
        pageCanvas.height = splitHeight;
        const pageCtx = pageCanvas.getContext("2d");

        if (pageCtx) {
          // 元画像から該当部分を転写
          pageCtx.drawImage(
            canvas,
            0,
            currentY,
            imgWidth,
            splitHeight, // 元画像の切り抜き範囲
            0,
            0,
            imgWidth,
            splitHeight // 新キャンバスへの描画範囲
          );

          // 2. 画像データ化 (JPEGで圧縮してサイズ削減)
          const pageImgData = pageCanvas.toDataURL("image/jpeg", 0.8);

          // 3. PDFに追加
          // もし2ページ目以降なら改ページ
          if (currentY > 0) {
            pdf.addPage();
          }

          // PDF上の高さを計算 (mm)
          const heightOnPdf = splitHeight / pxPerMm;

          pdf.addImage(
            pageImgData,
            "JPEG",
            margin, // X: 左余白
            margin, // Y: 上余白
            contentWidthMm,
            heightOnPdf
          );
        }

        // 次の開始位置へ進める
        currentY += splitHeight;
      }

      // 5. 答案を追加（新しいページ）
      pdf.addPage();
      pdf.setFont("MPLUS1p-Regular", "normal");
      pdf.setFontSize(12);
      pdf.text("答案", margin, margin);

      // 答案も余白を考慮して折り返し処理
      const splitAnswer = pdf.splitTextToSize(answerText, contentWidthMm);
      pdf.text(splitAnswer, margin, margin + 10);

      // 6. PDFをダウンロード
      pdf.save("cbt-submission.pdf");
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert(
        "PDFの生成に失敗しました。" +
          (error instanceof Error ? error.message : String(error))
      );
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const togglePanel = (type: PanelType) => {
    let newPanels = [...visiblePanels];
    if (newPanels.includes(type)) {
      if (newPanels.length === 1) return;
      newPanels = newPanels.filter((p) => p !== type);
    } else {
      newPanels.push(type);
    }
    setVisiblePanels(newPanels);
  };

  const activePanels = panelOrder.filter((p) => visiblePanels.includes(p));

  const handleSwap = () => {
    if (activePanels.length < 2) return;
    const newOrder = [...panelOrder];

    if (activePanels.length === 2) {
      const p1 = activePanels[0];
      const p2 = activePanels[1];
      const idx1 = newOrder.indexOf(p1);
      const idx2 = newOrder.indexOf(p2);
      newOrder[idx1] = p2;
      newOrder[idx2] = p1;
    } else if (activePanels.length === 3) {
      const p0 = activePanels[0];
      const p1 = activePanels[1];
      const p2 = activePanels[2];
      const idx0 = newOrder.indexOf(p0);
      const idx1 = newOrder.indexOf(p1);
      const idx2 = newOrder.indexOf(p2);
      newOrder[idx0] = p2;
      newOrder[idx1] = p0;
      newOrder[idx2] = p1;
    }
    setPanelOrder(newOrder);
  };

  const handleMouseDown = (direction: "horizontal" | "vertical") => {
    setResizingDirection(direction);
  };

  useEffect(() => {
    if (!resizingDirection) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();

      if (resizingDirection === "horizontal") {
        const newWidth = ((e.clientX - rect.left) / rect.width) * 100;
        setHorizontalSplit(Math.min(Math.max(newWidth, 10), 90));
      } else if (resizingDirection === "vertical") {
        const newHeight = ((e.clientY - rect.top) / rect.height) * 100;
        setVerticalSplit(Math.min(Math.max(newHeight, 10), 90));
      }
    };

    const handleMouseUp = () => {
      setResizingDirection(null);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [resizingDirection]);

  const renderPanelContent = (type: PanelType) => {
    switch (type) {
      case PanelType.QUESTION:
        return (
          <MemoizedQuestionPanel
            ref={questionPanelRef}
            width={500}
            onPdfLoaded={handlePdfLoaded}
          />
        );
      case PanelType.LAW:
        return <MemoizedLawPanel colorScheme={colorScheme} />;
      case PanelType.ANSWER:
        return (
          <MemoizedAnswerPanel
            value={answerText}
            onChange={setAnswerText}
            colorScheme={colorScheme}
          />
        );
      default:
        return null;
    }
  };

  const leftPanelType = activePanels[0];
  const rightTopPanelType = activePanels.length > 1 ? activePanels[1] : null;
  const rightBottomPanelType = activePanels.length > 2 ? activePanels[2] : null;

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#f0f4f8",
        overflow: "hidden",
      }}
    >
      <Header
        timeLeft={timeLeft}
        showMemo={showMemo}
        onToggleMemo={() => setShowMemo(!showMemo)}
        visiblePanels={visiblePanels}
        onTogglePanel={togglePanel}
        onSwapPanels={handleSwap}
        colorScheme={colorScheme}
        onFinish={handleFinish}
        onChangeColorScheme={setColorScheme}
      />

      <Box
        ref={containerRef}
        sx={{
          flex: 1,
          display: "flex",
          overflow: "hidden",
          position: "relative",
          flexDirection: "row",
        }}
      >
        {leftPanelType && (
          <Box
            key={leftPanelType}
            sx={{
              width: rightTopPanelType ? `${horizontalSplit}%` : "100%",
              height: "100%",
              position: "relative",
              transition: resizingDirection ? "none" : "width 0.2s",
            }}
          >
            {renderPanelContent(leftPanelType)}
            {resizingDirection && (
              <Box sx={{ position: "absolute", inset: 0, zIndex: 100 }} />
            )}
          </Box>
        )}

        {leftPanelType && rightTopPanelType && (
          <Box
            sx={{
              width: 6,
              cursor: "col-resize",
              bgcolor: "grey.300",
              zIndex: 50,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              transition: "background-color 0.2s",
              "&:hover": { bgcolor: "primary.light" },
            }}
            onMouseDown={() => handleMouseDown("horizontal")}
          >
            <Box
              sx={{
                width: 2,
                height: 32,
                bgcolor: "grey.400",
                borderRadius: 1,
              }}
            />
          </Box>
        )}

        {rightTopPanelType && (
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              height: "100%",
              minWidth: 0,
            }}
          >
            <Box
              key={rightTopPanelType}
              sx={{
                height: rightBottomPanelType ? `${verticalSplit}%` : "100%",
                width: "100%",
                position: "relative",
                transition: resizingDirection ? "none" : "height 0.2s",
              }}
            >
              {renderPanelContent(rightTopPanelType)}
              {resizingDirection && (
                <Box sx={{ position: "absolute", inset: 0, zIndex: 100 }} />
              )}
            </Box>

            {rightTopPanelType && rightBottomPanelType && (
              <Box
                sx={{
                  height: 6,
                  cursor: "row-resize",
                  bgcolor: "grey.300",
                  zIndex: 50,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  transition: "background-color 0.2s",
                  "&:hover": { bgcolor: "primary.light" },
                }}
                onMouseDown={() => handleMouseDown("vertical")}
              >
                <Box
                  sx={{
                    height: 2,
                    width: 32,
                    bgcolor: "grey.400",
                    borderRadius: 1,
                  }}
                />
              </Box>
            )}

            {rightBottomPanelType && (
              <Box
                key={rightBottomPanelType}
                sx={{
                  flex: 1,
                  width: "100%",
                  position: "relative",
                }}
              >
                {renderPanelContent(rightBottomPanelType)}
                {resizingDirection && (
                  <Box sx={{ position: "absolute", inset: 0, zIndex: 100 }} />
                )}
              </Box>
            )}
          </Box>
        )}

        {showMemo && <MemoPad onClose={() => setShowMemo(false)} />}

        <Backdrop
          sx={{
            color: "#fff",
            zIndex: (theme) => theme.zIndex.drawer + 1,
            flexDirection: "column",
          }}
          open={isGeneratingPdf}
        >
          <CircularProgress color="inherit" />
          <Typography sx={{ mt: 2 }}>PDFを生成しています...</Typography>
        </Backdrop>
      </Box>
    </Box>
  );
}

export default App;
