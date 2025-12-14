"use client";
import React, { useState, useEffect, useRef, memo } from "react";
import { Box } from "@mui/material";
// 分離したHeaderコンポーネントをインポート
import { Header } from "./_components/Header";
// 各パネルコンポーネント
import { QuestionPanel } from "./_components/QuestionPanel";
import { LawPanel } from "./_components/LawPanel";
import { AnswerPanel } from "./_components/AnswerPanel";
import { MemoPad } from "./_components/MemoPad";
import { PanelType } from "../types";

// =================================================================
// ★重要★: パネルコンポーネントをメモ化 (React.memo)
// これにより、親コンポーネント(App)でタイマー(timeLeft)が更新されても、
// パネルの中身(propsが変わらない限り)は再レンダリングされなくなります。
// =================================================================
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

  // パネルの表示順序の管理
  const [panelOrder, setPanelOrder] = useState<PanelType[]>([
    PanelType.QUESTION,
    PanelType.LAW,
    PanelType.ANSWER,
  ]);

  // 答案テキストの状態（パネル入れ替え時も保持するためここで管理）
  const [answerText, setAnswerText] = useState("");

  // レイアウト分割比率の状態
  const [horizontalSplit, setHorizontalSplit] = useState(50); // 左パネルの幅(%)
  const [verticalSplit, setVerticalSplit] = useState(50); // 右上パネルの高さ(%)

  const containerRef = useRef<HTMLDivElement>(null);
  const [resizingDirection, setResizingDirection] = useState<
    "horizontal" | "vertical" | null
  >(null);

  const [showMemo, setShowMemo] = useState(false);

  // タイマーの状態 (秒数: 2時間 = 7200秒)
  const [timeLeft, setTimeLeft] = useState(7200);

  // =================================================================
  // タイマーのカウントダウン処理
  // =================================================================
  useEffect(() => {
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
  }, []);

  // パネルの表示/非表示切り替え
  const togglePanel = (type: PanelType) => {
    let newPanels = [...visiblePanels];
    if (newPanels.includes(type)) {
      // 最後の1枚は消せないようにする
      if (newPanels.length === 1) return;
      newPanels = newPanels.filter((p) => p !== type);
    } else {
      newPanels.push(type);
    }
    setVisiblePanels(newPanels);
  };

  // 表示されているパネルのみを抽出
  const activePanels = panelOrder.filter((p) => visiblePanels.includes(p));

  // パネルの配置入れ替え（ローテーション）
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

  // =================================================================
  // リサイズ（ドラッグ）処理
  // useEffect内にロジックを閉じることで、不要なイベント残留を防ぐ
  // =================================================================
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
        // 10%〜90%の範囲に制限
        setHorizontalSplit(Math.min(Math.max(newWidth, 10), 90));
      } else if (resizingDirection === "vertical") {
        const newHeight = ((e.clientY - rect.top) / rect.height) * 100;
        // 10%〜90%の範囲に制限
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

  // パネル描画ヘルパー（メモ化コンポーネントを使用）
  const renderPanelContent = (type: PanelType) => {
    switch (type) {
      case PanelType.QUESTION:
        return <MemoizedQuestionPanel width={500} />;
      case PanelType.LAW:
        return <MemoizedLawPanel />;
      case PanelType.ANSWER:
        return (
          <MemoizedAnswerPanel value={answerText} onChange={setAnswerText} />
        );
      default:
        return null;
    }
  };

  // レイアウトスロットへの割り当て
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
      {/* Header: ここにtimeLeftを渡す。数字が変わってもここだけ再描画される */}
      <Header
        timeLeft={timeLeft}
        showMemo={showMemo}
        onToggleMemo={() => setShowMemo(!showMemo)}
        visiblePanels={visiblePanels}
        onTogglePanel={togglePanel}
        onSwapPanels={handleSwap}
      />

      {/* Main Content Area */}
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
        {/* 左側パネルエリア */}
        {leftPanelType && (
          <Box
            key={leftPanelType}
            sx={{
              width: rightTopPanelType ? `${horizontalSplit}%` : "100%",
              height: "100%",
              position: "relative",
              // ドラッグ中はtransitionを無効化して追従性を良くする
              transition: resizingDirection ? "none" : "width 0.2s",
            }}
          >
            {renderPanelContent(leftPanelType)}
            {/* iframe等がある場合にドラッグイベントを吸われないためのカバー */}
            {resizingDirection && (
              <Box sx={{ position: "absolute", inset: 0, zIndex: 100 }} />
            )}
          </Box>
        )}

        {/* 左右リサイズハンドル */}
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

        {/* 右側パネルエリア（コンテナ） */}
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
            {/* 右上パネル */}
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

            {/* 上下リサイズハンドル */}
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

            {/* 右下パネル */}
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

        {/* メモ帳オーバーレイ */}
        {showMemo && <MemoPad onClose={() => setShowMemo(false)} />}
      </Box>
    </Box>
  );
}

export default App;
