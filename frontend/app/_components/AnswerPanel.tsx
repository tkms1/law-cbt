// AnswerPanel.tsx
import React, { useState, useRef } from "react";
import { Box, Typography, Button, Stack } from "@mui/material";
import { Search, FindReplace, Undo, Redo } from "@mui/icons-material";
import { ColorSchemeType } from "../../type/type";

interface AnswerPanelProps {
  value: string;
  onChange: (value: string) => void;
  // ▼ 追加: 配色プロップス
  colorScheme?: ColorSchemeType;
}

export const AnswerPanel: React.FC<AnswerPanelProps> = ({
  value,
  onChange,
  colorScheme = "none",
}) => {
  const safeValue = value || "";
  const lines = safeValue.split("\n");
  const lineCount = lines.length;
  const charCount = safeValue.length;

  const lineHeight = 32;
  const fontSize = 16;

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (textareaRef.current && gutterRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  // ▼ 追加: 配色スタイルの取得ロジック
  const getStyles = () => {
    switch (colorScheme) {
      case "yellow":
        return {
          mainBg: "#fffde7", // 薄い黄色
          gutterBg: "#fff9c4", // 少し濃い黄色
          text: "#000",
          border: "#e0e0e0",
          headerBg: "#f5f5f5",
          lineColor: "#e0e0e0",
        };
      case "blue":
        return {
          mainBg: "#e3f2fd", // 薄い青
          gutterBg: "#bbdefb",
          text: "#000",
          border: "#bbdefb",
          headerBg: "#f5f5f5",
          lineColor: "#bbdefb",
        };
      case "black":
        return {
          mainBg: "#121212", // 黒
          gutterBg: "#1e1e1e", // ダークグレー
          text: "#fff",
          border: "#333",
          headerBg: "#424242",
          lineColor: "#333",
        };
      default: // none
        return {
          mainBg: "#fff",
          gutterBg: "#fff",
          text: "#333",
          border: "#ccc",
          headerBg: "#f5f5f5",
          lineColor: "#e0e0e0",
        };
    }
  };

  const styles = getStyles();
  const isDark = colorScheme === "black";

  // ★修正したボタンスタイル
  const toolButtonStyle = {
    bgcolor: "#607d8b",
    color: "#fff",
    fontSize: "12px",
    fontWeight: "bold",
    height: 32,
    minWidth: "36px",
    px: { xs: 1, md: 2 },
    borderRadius: 1,
    boxShadow: "0px 2px 4px rgba(0,0,0,0.2)",
    textTransform: "none",
    "&:hover": {
      bgcolor: "#546e7a",
    },
    "& .MuiButton-startIcon": {
      mr: { xs: 0, md: 0.5 },
      ml: 0,
    },
    "& .MuiButton-endIcon": {
      ml: { xs: 0, md: 0.5 },
      mr: 0,
    },
    "& .MuiSvgIcon-root": { fontSize: 18 },
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100%",
        // ▼ 配色適用
        bgcolor: styles.mainBg,
        border: `1px solid ${styles.border}`,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          bgcolor: "#3f51b5",
          color: "white",
          py: 1,
          textAlign: "center",
          fontWeight: "bold",
          fontSize: "1rem",
        }}
      >
        第１問
      </Box>

      <Box
        sx={{
          // ▼ 配色適用
          bgcolor: isDark ? styles.headerBg : "#f5f5f5",
          borderBottom: `1px solid ${isDark ? "#555" : "#e0e0e0"}`,
          color: isDark ? "#fff" : "inherit",
          px: 2,
          py: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 50,
        }}
      >
        <Typography variant="subtitle1" fontWeight="bold" sx={{ minWidth: 80 }}>
          第１問
        </Typography>

        <Typography
          variant="body2"
          sx={{
            fontSize: "13px",
            fontWeight: 500,
            display: { xs: "none", lg: "inline" },
          }}
        >
          {lineCount}/184行 &nbsp; {charCount}/5,520文字 (空白含む)
        </Typography>

        <Stack direction="row" spacing={1}>
          <Button startIcon={<Search />} sx={toolButtonStyle}>
            <Box
              component="span"
              sx={{ display: { xs: "none", md: "inline" } }}
            >
              検索
            </Box>
          </Button>
          <Button startIcon={<FindReplace />} sx={toolButtonStyle}>
            <Box
              component="span"
              sx={{ display: { xs: "none", md: "inline" } }}
            >
              置換
            </Box>
          </Button>

          <Box sx={{ width: 8 }} />

          <Button startIcon={<Undo />} sx={toolButtonStyle}>
            <Box
              component="span"
              sx={{ display: { xs: "none", md: "inline" } }}
            >
              元に戻す
            </Box>
          </Button>

          <Button endIcon={<Redo />} sx={toolButtonStyle}>
            <Box
              component="span"
              sx={{ display: { xs: "none", md: "inline" } }}
            >
              やり直し
            </Box>
          </Button>
        </Stack>
      </Box>

      <Box
        sx={{
          flex: 1,
          display: "flex",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          ref={gutterRef}
          sx={{
            width: 48,
            // ▼ 配色適用
            bgcolor: styles.gutterBg,
            borderRight: `1px solid ${isDark ? "#333" : "#e0e0e0"}`,
            pt: "8px",
            pb: 2,
            textAlign: "right",
            overflow: "hidden",
            userSelect: "none",
            flexShrink: 0,
          }}
        >
          {lines.map((_, i) => (
            <Box
              key={i}
              sx={{
                height: `${lineHeight}px`,
                lineHeight: `${lineHeight}px`,
                fontSize: "10px",
                color: "#ff80ab",
                pr: 1,
                fontFamily: "monospace",
              }}
            >
              {i + 1}
            </Box>
          ))}
          {Array.from({ length: 50 }).map((_, i) => (
            <Box
              key={`extra-${i}`}
              sx={{
                height: `${lineHeight}px`,
                lineHeight: `${lineHeight}px`,
                fontSize: "10px",
                color: "#ff80ab",
                pr: 1,
                fontFamily: "monospace",
                opacity: 0.3,
              }}
            >
              {lines.length + i + 1}
            </Box>
          ))}
        </Box>

        <Box sx={{ flex: 1, position: "relative", height: "100%" }}>
          <textarea
            ref={textareaRef}
            onScroll={handleScroll}
            style={{
              width: "100%",
              height: "100%",
              border: "none",
              padding: "8px 16px",
              margin: 0,
              fontFamily: "monospace",
              fontSize: `${fontSize}px`,
              lineHeight: `${lineHeight}px`,
              // ▼ 配色適用 (罫線の描画)
              backgroundImage: `linear-gradient(to bottom, transparent ${
                lineHeight - 1
              }px, ${styles.lineColor} ${lineHeight - 1}px)`,
              backgroundSize: `100% ${lineHeight}px`,
              backgroundAttachment: "local",
              // ▼ 配色適用 (背景色・文字色)
              backgroundColor: styles.mainBg,
              color: styles.text,
              resize: "none",
              outline: "none",
              boxSizing: "border-box",
            }}
            value={safeValue}
            onChange={(e) => onChange(e.target.value)}
            placeholder="ここに解答を入力してください..."
            wrap="off"
          />
        </Box>
      </Box>
    </Box>
  );
};
