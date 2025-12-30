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

// --- 定数: デフォルトの試験時間 (2時間20分 = 8400秒) ---
const DEFAULT_DURATION = 2 * 3600 + 20 * 60;

// --- ヘルパー関数: ArrayBuffer を Base64 文字列に変換 ---
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

  // コンポーネントリセット用のキー
  const [resetKey, setResetKey] = useState(0);

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

  // タイマー設定 (初期値は一旦0にしてuseEffectで設定)
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);

  // handlePdfChange 内で最新の時間を参照するための Ref
  const timeLeftRef = useRef(timeLeft);
  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  // --- ★★★ データ読み込み処理 (LocalStorage & IndexedDB) ★★★ ---
  useEffect(() => {
    const loadData = async () => {
      const savedAnswer = localStorage.getItem("cbt_answer_text");
      const savedMemo = localStorage.getItem("cbt_memo_content");
      const savedTime = localStorage.getItem("cbt_time_left");
      const savedIsActive = localStorage.getItem("cbt_timer_active");
      const savedTimestamp = localStorage.getItem("cbt_last_timestamp");
      const savedDefaultDuration = localStorage.getItem("cbt_default_duration");

      // ★デフォルト時間の決定 (保存されていなければ定数を使用)
      const defaultDuration = savedDefaultDuration
        ? parseInt(savedDefaultDuration, 10)
        : DEFAULT_DURATION;

      let calculatedTimeLeft = defaultDuration; // 基本はデフォルト値
      let shouldExpire = false;

      // ★修正: 試験途中データの復元計算
      // 以前は savedTime があれば無条件で時間を減算していましたが、
      // savedIsActive === "true" (試験中) の場合のみ時間を進めるように修正しました。
      if (savedTime && savedTimestamp && savedIsActive === "true") {
        const storedTimeLeft = parseInt(savedTime, 10);
        const lastSavedTime = parseInt(savedTimestamp, 10);
        const now = Date.now();
        const elapsedSeconds = Math.floor((now - lastSavedTime) / 1000);
        const realRemainingTime = storedTimeLeft - elapsedSeconds;

        if (realRemainingTime <= 0) {
          shouldExpire = true;
          calculatedTimeLeft = 0;
        } else {
          calculatedTimeLeft = realRemainingTime;
        }
      } else if (savedTime) {
        // ★追加: 試験中ではなかった(リロードや閉じていた)場合、保存されていた時間をそのまま使う
        const parsedTime = parseInt(savedTime, 10);
        if (!isNaN(parsedTime)) {
          calculatedTimeLeft = parsedTime;
        }
      }

      // Stateへの反映
      if (savedAnswer) setAnswerText(savedAnswer);
      if (savedMemo) setMemoContent(savedMemo);
      setTimeLeft(calculatedTimeLeft);

      // 期限切れでない、かつアクティブだった場合は再開
      if (!shouldExpire && savedIsActive === "true" && calculatedTimeLeft > 0) {
        setIsTimerActive(true);
      } else {
        setIsTimerActive(false);
      }

      // PDFの復元
      try {
        const pdfData = await getPdfFromDB();
        if (pdfData) {
          setInitialPdfData(pdfData);
        }
      } catch (err) {
        console.error("Failed to load PDF from DB:", err);
      }

      setIsDataLoaded(true);
    };

    loadData();
  }, []);

  // --- ★★★ データ保存処理 (LocalStorage) ★★★ ---
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
      localStorage.setItem("cbt_last_timestamp", Date.now().toString());
    }
  }, [timeLeft, isDataLoaded]);

  useEffect(() => {
    if (isDataLoaded) {
      localStorage.setItem("cbt_timer_active", isTimerActive.toString());
    }
  }, [isTimerActive, isDataLoaded]);

  // --- ★ 時間を手動変更するハンドラ ---
  const handleTimeChange = useCallback((newSeconds: number) => {
    setTimeLeft(newSeconds);
    localStorage.setItem("cbt_time_left", newSeconds.toString());
    // ★変更: ユーザーが設定した時間を「次のデフォルト」として保存
    localStorage.setItem("cbt_default_duration", newSeconds.toString());
  }, []);

  // --- ★共通: 試験終了処理 ---
  const processExamFinish = useCallback(
    async (isAutoSubmit: boolean = false) => {
      if (
        !isAutoSubmit &&
        !window.confirm("試験を終了しますか？答案をダウンロードします。")
      ) {
        return;
      }

      // タイマーを止める
      setIsTimerActive(false);
      setIsGeneratingPdf(true);

      try {
        const fontResponse = await fetch("/MPLUS1p-Regular.ttf");
        if (!fontResponse.ok) throw new Error("Font load failed");
        const font = await fontResponse.arrayBuffer();

        const answerDoc = new jsPDF({
          orientation: "p",
          unit: "mm",
          format: "a4",
        });

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
        link.download = isAutoSubmit
          ? "cbt-submission-timeout.pdf"
          : "cbt-submission.pdf";
        link.click();
        URL.revokeObjectURL(link.href);

        // --- クリーンアップ処理 ---
        await clearPdfFromDB();

        // ★重要: デフォルト時間設定を退避してからクリアする
        const savedDefaultDuration = localStorage.getItem(
          "cbt_default_duration"
        );

        setInitialPdfData(null);
        setAnswerText("");
        setMemoContent("");
        localStorage.clear();

        // ★重要: デフォルト時間設定を復元
        if (savedDefaultDuration) {
          localStorage.setItem("cbt_default_duration", savedDefaultDuration);
        }

        setResetKey((prev) => prev + 1);

        console.log("Exam finished. PDF removed from DB and Screen.");

        if (isAutoSubmit) {
          alert("制限時間になりました。答案をダウンロードしました。");
        } else {
          alert("試験終了。答案をダウンロードしました。");
        }
      } catch (error) {
        console.error("PDF generation failed:", error);
        alert("PDFの生成に失敗しました。");
      } finally {
        setIsGeneratingPdf(false);
      }
    },
    [answerText]
  );

  // --- タイマーが0になった時の自動処理 ---
  useEffect(() => {
    // アクティブかつ時間が0になった瞬間に実行
    if (isTimerActive && timeLeft === 0) {
      processExamFinish(true);
    }
  }, [timeLeft, isTimerActive, processExamFinish]);

  // --- ★重要: PDFが変更されたら「完全リセット」して試験開始 ---
  const handlePdfChange = useCallback((pdfBuffer: ArrayBuffer) => {
    // 1. DBに保存
    savePdfToDB(pdfBuffer).catch((err) =>
      console.error("Failed to save PDF:", err)
    );
    setInitialPdfData(pdfBuffer);

    // ★重要: デフォルト時間設定を取得（なければ定数）
    const savedDefaultDuration = localStorage.getItem("cbt_default_duration");
    const nextTime = savedDefaultDuration
      ? parseInt(savedDefaultDuration, 10)
      : DEFAULT_DURATION;

    // 2. 状態の完全初期化
    setAnswerText("");
    setMemoContent("");

    // 3. ローカルストレージもクリア（ただしデフォルト時間は維持したい）
    localStorage.clear();
    if (savedDefaultDuration) {
      localStorage.setItem("cbt_default_duration", savedDefaultDuration);
    }

    // 4. コンポーネントの強制再マウント用キー更新
    setResetKey((prev) => prev + 1);

    // 5. タイマー再設定 & スタート
    setTimeLeft(nextTime);

    // ★重要: 時間がセットされている場合のみ試験開始（タイマー始動）
    if (nextTime > 0) {
      setIsTimerActive(true);
      localStorage.setItem("cbt_timer_active", "true");
    } else {
      setIsTimerActive(false);
      localStorage.setItem("cbt_timer_active", "false");
    }

    // 6. 新しい状態をストレージに書き込み
    localStorage.setItem("cbt_answer_text", "");
    localStorage.setItem("cbt_memo_content", "");
    localStorage.setItem("cbt_time_left", nextTime.toString());
    localStorage.setItem("cbt_last_timestamp", Date.now().toString());
  }, []);

  // --- タイマーカウントダウン処理 ---
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

  const handlePdfLoaded = useCallback(() => {}, []);

  const handleFinish = () => {
    if (timeLeft === 0 || !isTimerActive) return;
    processExamFinish(false);
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
            key={`qp-${resetKey}`}
            ref={questionPanelRef}
            width={500}
            onPdfLoaded={handlePdfLoaded}
            initialPdfData={initialPdfData}
            onPdfChange={handlePdfChange}
          />
        );
      case PanelType.LAW:
        return (
          <MemoizedLawPanel
            key={`lp-${resetKey}`}
            colorScheme={colorScheme}
            isExamActive={isTimerActive}
          />
        );
      case PanelType.ANSWER:
        return (
          <MemoizedAnswerPanel
            value={answerText}
            onChange={setAnswerText}
            colorScheme={colorScheme}
            isExamActive={isTimerActive}
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
        onTimeChange={handleTimeChange}
        isExamActive={isTimerActive}
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
            isExamActive={isTimerActive}
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
