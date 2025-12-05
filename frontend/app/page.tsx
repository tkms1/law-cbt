"use client";
import React, { useState, useEffect, useRef } from "react";
import { AppBar, Toolbar, Box, Typography, Button } from "@mui/material";
import {
  EditNote,
  Description,
  Balance,
  Create,
  SwapHoriz,
  ContentCopy,
  ContentCut,
  ContentPaste,
  Translate,
  ZoomIn,
  ZoomOut,
  Palette,
  FilterAlt,
  HelpOutline,
} from "@mui/icons-material";
import { ToolbarButton } from "./_components/ToolbarButton";
import { QuestionPanel } from "./_components/QuestionPanel";
import { LawPanel } from "./_components/LawPanel";
import { AnswerPanel } from "./_components/AnswerPanel";
import { MemoPad } from "./_components/MemoPad";
import { PanelType } from "../types";

function App() {
  // Track visibility of each panel type
  const [visiblePanels, setVisiblePanels] = useState<PanelType[]>([
    PanelType.QUESTION,
    PanelType.LAW,
    PanelType.ANSWER,
  ]);

  // Track the visual order of panels
  // Index 0: Left Main Panel
  // Index 1: Right Top Panel (if 3 screens) or Right Panel (if 2 screens)
  // Index 2: Right Bottom Panel
  const [panelOrder, setPanelOrder] = useState<PanelType[]>([
    PanelType.QUESTION,
    PanelType.LAW,
    PanelType.ANSWER,
  ]);

  // State for Answer Text (Lifted up to persist during swap)
  const [answerText, setAnswerText] = useState("");

  // Layout state
  const [horizontalSplit, setHorizontalSplit] = useState(50); // % width of left panel
  const [verticalSplit, setVerticalSplit] = useState(50); // % height of top right panel

  const containerRef = useRef<HTMLDivElement>(null);
  const [resizingDirection, setResizingDirection] = useState<
    "horizontal" | "vertical" | null
  >(null);

  const [showMemo, setShowMemo] = useState(false);
  const [timeLeft, setTimeLeft] = useState(7200);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const togglePanel = (type: PanelType) => {
    let newPanels = [...visiblePanels];
    if (newPanels.includes(type)) {
      // Don't allow hiding the last panel
      if (newPanels.length === 1) return;
      newPanels = newPanels.filter((p) => p !== type);
    } else {
      newPanels.push(type);
    }
    setVisiblePanels(newPanels);
  };

  const isVisible = (type: PanelType) => visiblePanels.includes(type);

  // Get only the panels that are currently visible, ordered by panelOrder
  const activePanels = panelOrder.filter((p) => visiblePanels.includes(p));

  const handleSwap = () => {
    if (activePanels.length < 2) return;

    const newOrder = [...panelOrder];

    if (activePanels.length === 2) {
      // Swap the positions of the two visible panels
      const p1 = activePanels[0];
      const p2 = activePanels[1];

      const idx1 = newOrder.indexOf(p1);
      const idx2 = newOrder.indexOf(p2);

      newOrder[idx1] = p2;
      newOrder[idx2] = p1;
    } else if (activePanels.length === 3) {
      // Clockwise rotation for 3 panels:
      // Left (0) -> Top Right (1)
      // Top Right (1) -> Bottom Right (2)
      // Bottom Right (2) -> Left (0)

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

  // Drag handlers
  const handleMouseDown = (direction: "horizontal" | "vertical") => {
    setResizingDirection(direction);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!containerRef.current || !resizingDirection) return;
    const rect = containerRef.current.getBoundingClientRect();

    if (resizingDirection === "horizontal") {
      const newWidth = ((e.clientX - rect.left) / rect.width) * 100;
      // Clamp between 10% and 90%
      setHorizontalSplit(Math.min(Math.max(newWidth, 10), 90));
    } else if (resizingDirection === "vertical") {
      // For vertical split, we approximate based on container height
      const newHeight = ((e.clientY - rect.top) / rect.height) * 100;
      setVerticalSplit(Math.min(Math.max(newHeight, 10), 90));
    }
  };

  const handleMouseUp = () => {
    setResizingDirection(null);
  };

  useEffect(() => {
    if (resizingDirection) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [resizingDirection]);

  // Helper to render specific panel component
  const renderPanelContent = (type: PanelType) => {
    switch (type) {
      case PanelType.QUESTION:
        return <QuestionPanel width={500} />;
      case PanelType.LAW:
        return <LawPanel />;
      case PanelType.ANSWER:
        return <AnswerPanel value={answerText} onChange={setAnswerText} />;
      default:
        return null;
    }
  };

  // Assign slots based on active panels count
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
      {/* Header */}
      <AppBar
        position="static"
        elevation={2}
        sx={{
          background: "linear-gradient(to bottom, #5c86bc, #2c5fa3)",
          height: 64,
        }}
      >
        <Toolbar variant="dense" sx={{ height: "100%", px: 1, minHeight: 64 }}>
          {/* Title Area */}
          <Box sx={{ mr: 2, display: "flex", flexDirection: "column" }}>
            <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
              司法試験等CBTシステム (体験版)
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              論文式 令和７年_司法試験_公法系科目第１問
            </Typography>
          </Box>

          <Box sx={{ height: "100%", display: "flex" }}>
            <ToolbarButton
              icon={<EditNote sx={{ fontSize: 24 }} />}
              label="メモ"
              color="#b91c1c"
              onClick={() => setShowMemo(!showMemo)}
            />

            <Box
              sx={{
                width: "1px",
                height: 40,
                bgcolor: "rgba(255,255,255,0.2)",
                mx: 0.5,
                my: "auto",
              }}
            />

            <ToolbarButton
              icon={<Description sx={{ fontSize: 20 }} />}
              label="問題"
              active={isVisible(PanelType.QUESTION)}
              onClick={() => togglePanel(PanelType.QUESTION)}
            />
            <ToolbarButton
              icon={<Balance sx={{ fontSize: 20 }} />}
              label="法文"
              active={isVisible(PanelType.LAW)}
              onClick={() => togglePanel(PanelType.LAW)}
            />
            <ToolbarButton
              icon={<Create sx={{ fontSize: 20 }} />}
              label="答案"
              active={isVisible(PanelType.ANSWER)}
              onClick={() => togglePanel(PanelType.ANSWER)}
            />

            <ToolbarButton
              icon={<SwapHoriz sx={{ fontSize: 20 }} />}
              label="入替え"
              onClick={handleSwap}
            />

            <Box
              sx={{
                width: "1px",
                height: 40,
                bgcolor: "rgba(255,255,255,0.2)",
                mx: 0.5,
                my: "auto",
              }}
            />

            <ToolbarButton
              icon={<ContentCopy sx={{ fontSize: 18 }} />}
              label="コピー"
            />
            <ToolbarButton
              icon={<ContentCut sx={{ fontSize: 18 }} />}
              label="切取り"
            />
            <ToolbarButton
              icon={<ContentPaste sx={{ fontSize: 18 }} />}
              label="貼付け"
            />

            <Box
              sx={{
                width: "1px",
                height: 40,
                bgcolor: "rgba(255,255,255,0.2)",
                mx: 0.5,
                my: "auto",
              }}
            />

            <ToolbarButton
              icon={<Translate sx={{ fontSize: 18 }} />}
              label="ローマ字"
              subLabel="入力"
              active
            />
            <ToolbarButton
              icon={<Translate sx={{ fontSize: 18 }} />}
              label="かな"
              subLabel="入力"
            />

            <Box
              sx={{
                width: "1px",
                height: 40,
                bgcolor: "rgba(255,255,255,0.2)",
                mx: 0.5,
                my: "auto",
              }}
            />

            <ToolbarButton
              icon={<ZoomIn sx={{ fontSize: 18 }} />}
              label="拡大"
            />
            <ToolbarButton
              icon={<ZoomOut sx={{ fontSize: 18 }} />}
              label="縮小"
            />
            <ToolbarButton
              icon={<FilterAlt sx={{ fontSize: 18 }} />}
              label="フィルタ"
            />
            <ToolbarButton
              icon={<Palette sx={{ fontSize: 18 }} />}
              label="配色"
            />
            <ToolbarButton
              icon={<HelpOutline sx={{ fontSize: 18 }} />}
              label="使い方"
            />
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {/* Right Side */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              height: "100%",
              bgcolor: "rgba(0,0,0,0.2)",
              px: 2,
              ml: 2,
            }}
          >
            <Box sx={{ textAlign: "right", mr: 2 }}>
              <Typography
                variant="caption"
                sx={{ display: "block", opacity: 0.8, lineHeight: 1 }}
              >
                残り時間
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: "monospace",
                  fontWeight: "bold",
                  lineHeight: 1,
                  color: "#ffebee",
                }}
              >
                {formatTime(timeLeft)}
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="primary"
              sx={{
                fontWeight: "bold",
                border: "1px solid rgba(255,255,255,0.3)",
                boxShadow: 2,
                px: 3,
              }}
            >
              終了
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
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
        {/* Left Pane (Always present if at least 1 panel visible) */}
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

        {/* Horizontal Resize Handle */}
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

        {/* Right Pane Container */}
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
            {/* Top Right Panel */}
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

            {/* Vertical Resize Handle */}
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

            {/* Bottom Right Panel */}
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
      </Box>
    </Box>
  );
}

export default App;
