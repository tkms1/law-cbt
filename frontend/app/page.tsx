"use client";
import React, { useState, useEffect, useRef, memo, useCallback } from "react";
import { Box, CircularProgress, Backdrop } from "@mui/material";
import { Header } from "./_components/Header";
import { QuestionPanel, QuestionPanelRef } from "./_components/QuestionPanel";
import { LawPanel } from "./_components/LawPanel";
import { AnswerPanel } from "./_components/AnswerPanel";
import { MemoPad } from "./_components/MemoPad";
import { PanelType, ColorSchemeType } from "../type/type";
import jsPDF from "jspdf";
import { PDFDocument } from "pdf-lib";

const MemoizedQuestionPanel = memo(QuestionPanel);
const MemoizedLawPanel = memo(LawPanel);
const MemoizedAnswerPanel = memo(AnswerPanel);

// --- ヘルパー関数: ArrayBuffer を Base64 文字列に変換 (Buffer非依存) ---
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// --- IndexedDB Helper Utilities ---
const DB_NAME = "CBT_SYSTEM_DB";
const STORE_NAME = "pdf_store";
const DB_VERSION = 1;

const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
};

const savePdfToDB = async (data: ArrayBuffer): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(data, "current_pdf");
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

const getPdfFromDB = async (): Promise<ArrayBuffer | null> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.get("current_pdf");
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
};

const clearPdfFromDB = async (): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete("current_pdf");
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

function App() {
  // --- State定義 ---
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
  const [memoContent, setMemoContent] = useState("");

  // PDFの復元用State
  const [initialPdfData, setInitialPdfData] = useState<ArrayBuffer | null>(
    null
  );

  // 初期ロード完了フラグ
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const [horizontalSplit, setHorizontalSplit] = useState(50);
  const [verticalSplit, setVerticalSplit] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const [resizingDirection, setResizingDirection] = useState<
    "horizontal" | "vertical" | null
  >(null);
  const questionPanelRef = useRef<QuestionPanelRef>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [showMemo, setShowMemo] = useState(false);
  const [colorScheme, setColorScheme] = useState<ColorSchemeType>("none");

  // タイマー設定 (初期値7200秒)
  const [timeLeft, setTimeLeft] = useState(7200);
  const [isTimerActive, setIsTimerActive] = useState(false);

  // --- ★★★ データ読み込み処理 (LocalStorage & IndexedDB) ★★★ ---
  useEffect(() => {
    // 1. LocalStorage (テキストデータ)
    const savedAnswer = localStorage.getItem("cbt_answer_text");
    const savedMemo = localStorage.getItem("cbt_memo_content");
    const savedTime = localStorage.getItem("cbt_time_left");
    const savedIsActive = localStorage.getItem("cbt_timer_active");

    if (savedAnswer) setAnswerText(savedAnswer);
    if (savedMemo) setMemoContent(savedMemo);

    if (savedTime) {
      const parsedTime = parseInt(savedTime, 10);
      if (!isNaN(parsedTime) && parsedTime > 0) {
        setTimeLeft(parsedTime);
      }
    }

    if (savedIsActive === "true") {
      setIsTimerActive(true);
    }

    // 2. IndexedDB (PDFデータ)
    getPdfFromDB()
      .then((data) => {
        if (data) {
          setInitialPdfData(data);
        }
      })
      .catch((err) => {
        console.error("Failed to load PDF from DB:", err);
      })
      .finally(() => {
        // 全てのロードが完了したらフラグを立てる
        setIsDataLoaded(true);
      });
  }, []);

  // --- ★★★ データ保存処理 ★★★ ---

  useEffect(() => {
    if (isDataLoaded) {
      localStorage.setItem("cbt_answer_text", answerText);
    }
  }, [answerText, isDataLoaded]);

  useEffect(() => {
    if (isDataLoaded) {
      localStorage.setItem("cbt_memo_content", memoContent);
    }
  }, [memoContent, isDataLoaded]);

  useEffect(() => {
    if (isDataLoaded) {
      localStorage.setItem("cbt_time_left", timeLeft.toString());
    }
  }, [timeLeft, isDataLoaded]);

  useEffect(() => {
    if (isDataLoaded) {
      localStorage.setItem("cbt_timer_active", isTimerActive.toString());
    }
  }, [isTimerActive, isDataLoaded]);

  // PDFが変更されたら保存するハンドラ
  const handlePdfChange = useCallback((pdfBuffer: ArrayBuffer) => {
    // 1. DBに保存
    savePdfToDB(pdfBuffer).catch((err) =>
      console.error("Failed to save PDF:", err)
    );

    // 2. 解答テキストとメモをリセット
    setAnswerText("");
    setMemoContent("");

    // 3. タイマーを2時間(7200秒)にリセットし、開始状態にする
    setTimeLeft(7200);
    setIsTimerActive(true);
  }, []);

  // --- タイマー処理 ---
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
    // PDF読み込み完了時(表示完了時)にも念のためタイマー開始を呼ぶ
    setIsTimerActive(true);
  }, []);

  // --- 提出・終了処理 ---
  const handleFinish = async () => {
    if (!window.confirm("試験を終了しますか？答案をダウンロードします。")) {
      return;
    }

    setIsTimerActive(false);
    setIsGeneratingPdf(true);

    try {
      // 1. フォント読み込み
      // 注意: public/fonts/MPLUS1p-Regular.ttf が存在する必要があります
      const fontResponse = await fetch("/MPLUS1p-Regular.ttf");

      if (!fontResponse.ok) {
        throw new Error(
          `フォントファイルの読み込みに失敗しました (Status: ${fontResponse.status})。\npublic/fonts/MPLUS1p-Regular.ttf が正しく配置されているか確認してください。`
        );
      }

      const font = await fontResponse.arrayBuffer();

      // 2. 答案PDF生成
      const answerDoc = new jsPDF({
        orientation: "p",
        unit: "mm",
        format: "a4",
      });

      // ★ Buffer.from を自作関数に置き換え (ブラウザ互換性対応)
      const fontBase64 = arrayBufferToBase64(font);

      answerDoc.addFileToVFS("MPLUS1p-Regular.ttf", fontBase64);
      answerDoc.addFont("MPLUS1p-Regular.ttf", "MPLUS1p-Regular", "normal");
      answerDoc.setFont("MPLUS1p-Regular", "normal");

      const margin = 15;
      const pdfPageWidth = answerDoc.internal.pageSize.getWidth();
      const pdfPageHeight = answerDoc.internal.pageSize.getHeight();
      const contentWidth = pdfPageWidth - margin * 2;

      answerDoc.setFontSize(14);
      answerDoc.text("【答案】", margin, margin);
      answerDoc.setFontSize(10.5);

      const splitText = answerDoc.splitTextToSize(answerText, contentWidth);
      let currentY = margin + 10;
      const lineHeight = 7;

      for (let i = 0; i < splitText.length; i++) {
        if (currentY + lineHeight > pdfPageHeight - margin) {
          answerDoc.addPage();
          currentY = margin;
        }
        answerDoc.text(splitText[i], margin, currentY);
        currentY += lineHeight;
      }

      const answerPdfBytes = answerDoc.output("arraybuffer");

      // 3. 問題PDFと結合
      const rawProblemPdf = questionPanelRef.current?.getPdfData();
      let mergedPdf: PDFDocument;

      if (rawProblemPdf) {
        mergedPdf = await PDFDocument.load(rawProblemPdf);
      } else {
        mergedPdf = await PDFDocument.create();
      }

      const loadedAnswerPdf = await PDFDocument.load(answerPdfBytes);
      const copiedPages = await mergedPdf.copyPages(
        loadedAnswerPdf,
        loadedAnswerPdf.getPageIndices()
      );

      copiedPages.forEach((page) => mergedPdf.addPage(page));

      const pdfBytes = await mergedPdf.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], {
        type: "application/pdf",
      });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "cbt-submission.pdf";
      link.click();
      URL.revokeObjectURL(link.href);

      // --- 完了後のデータクリア ---

      // 1. LocalStorage削除
      localStorage.removeItem("cbt_answer_text");
      localStorage.removeItem("cbt_memo_content");
      localStorage.removeItem("cbt_time_left");
      localStorage.removeItem("cbt_timer_active");

      // 2. IndexedDB削除 (PDF)
      await clearPdfFromDB();

      // 3. Stateリセット
      setAnswerText("");
      setMemoContent("");
      setTimeLeft(7200);
      setInitialPdfData(null); // PDF表示もクリア

      alert("答案をダウンロードしました。お疲れ様でした。");
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert(
        "PDFの生成に失敗しました。\n" +
          (error instanceof Error ? error.message : String(error))
      );
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // --- パネル操作系 (変更なし) ---
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
    const idx1 = panelOrder.indexOf(activePanels[0]);
    const idx2 = panelOrder.indexOf(activePanels[1]);
    if (idx1 !== -1 && idx2 !== -1) {
      const temp = newOrder[idx1];
      newOrder[idx1] = newOrder[idx2];
      newOrder[idx2] = temp;
      setPanelOrder(newOrder);
    }
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
        const x = e.clientX - rect.left;
        const widthPercent = (x / rect.width) * 100;
        setHorizontalSplit(Math.min(Math.max(widthPercent, 10), 90));
      } else {
        const y = e.clientY - rect.top;
        const heightPercent = (y / rect.height) * 100;
        setVerticalSplit(Math.min(Math.max(heightPercent, 10), 90));
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
            initialPdfData={initialPdfData}
            onPdfChange={handlePdfChange}
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
        {/* 左パネル */}
        {leftPanelType && (
          <Box
            sx={{
              width: rightTopPanelType ? `${horizontalSplit}%` : "100%",
              height: "100%",
              position: "relative",
            }}
          >
            {renderPanelContent(leftPanelType)}
            {resizingDirection && (
              <Box sx={{ position: "absolute", inset: 0, zIndex: 100 }} />
            )}
          </Box>
        )}

        {/* リサイズバー (横) */}
        {leftPanelType && rightTopPanelType && (
          <Box
            sx={{
              width: 6,
              cursor: "col-resize",
              bgcolor: "grey.300",
              zIndex: 50,
            }}
            onMouseDown={() => handleMouseDown("horizontal")}
          />
        )}

        {/* 右側エリア */}
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
            {/* 右上 */}
            <Box
              sx={{
                height: rightBottomPanelType ? `${verticalSplit}%` : "100%",
                width: "100%",
                position: "relative",
              }}
            >
              {renderPanelContent(rightTopPanelType)}
              {resizingDirection && (
                <Box sx={{ position: "absolute", inset: 0, zIndex: 100 }} />
              )}
            </Box>

            {/* リサイズバー (縦) */}
            {rightTopPanelType && rightBottomPanelType && (
              <Box
                sx={{
                  height: 6,
                  cursor: "row-resize",
                  bgcolor: "grey.300",
                  zIndex: 50,
                }}
                onMouseDown={() => handleMouseDown("vertical")}
              />
            )}

            {/* 右下 */}
            {rightBottomPanelType && (
              <Box sx={{ flex: 1, width: "100%", position: "relative" }}>
                {renderPanelContent(rightBottomPanelType)}
                {resizingDirection && (
                  <Box sx={{ position: "absolute", inset: 0, zIndex: 100 }} />
                )}
              </Box>
            )}
          </Box>
        )}

        <Box sx={{ display: showMemo ? "block" : "none" }}>
          <MemoPad
            value={memoContent}
            onChange={setMemoContent}
            onClose={() => setShowMemo(false)}
          />
        </Box>

        <Backdrop open={isGeneratingPdf} sx={{ color: "#fff", zIndex: 9999 }}>
          <CircularProgress color="inherit" />
        </Backdrop>
      </Box>
    </Box>
  );
}

export default App;
