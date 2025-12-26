// AnswerPanel.tsx
import React, { useState, useRef } from "react";
import { Box, Typography, Button, Stack } from "@mui/material";
import { Search, FindReplace, Undo, Redo } from "@mui/icons-material";
import { ColorSchemeType } from "../../type/type";

interface AnswerPanelProps {
  value: string;
  onChange: (value: string) => void;
  colorScheme?: ColorSchemeType;
}

export const AnswerPanel: React.FC<AnswerPanelProps> = ({
  value,
  onChange,
  colorScheme = "none",
}) => {
  // 定数定義
  const MAX_PAGES = 8;
  const LINES_PER_PAGE = 23;
  const MAX_CHARS_PER_LINE = 30; // 1行あたりの文字数

  // 計算される制限値
  const MAX_TOTAL_LINES = MAX_PAGES * LINES_PER_PAGE; // 184行
  const MAX_TOTAL_CHARS = MAX_TOTAL_LINES * MAX_CHARS_PER_LINE; // 5520文字

  const safeValue = value || "";
  const charCount = safeValue.length;

  // スタイル関連定数
  const lineHeight = 32;
  const fontSize = 16;
  const paddingLeft = 16;
  // 文字が入る幅 (左パディング + フォントサイズ * 文字数)
  const contentWidth = paddingLeft + fontSize * MAX_CHARS_PER_LINE;

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  /**
   * 現在のテキストが消費している「行数」を計算する関数
   */
  const calculateLineCount = (text: string): number => {
    const paragraphs = text.split("\n");

    return paragraphs.reduce((totalLines, p) => {
      if (p.length === 0) {
        return totalLines + 1;
      }
      return totalLines + Math.ceil(p.length / MAX_CHARS_PER_LINE);
    }, 0);
  };

  const currentLineCount = calculateLineCount(safeValue);

  const handleScroll = () => {
    if (textareaRef.current && gutterRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const getStyles = () => {
    switch (colorScheme) {
      case "yellow":
        return {
          mainBg: "#fffde7",
          gutterBg: "#fff9c4",
          text: "#000",
          border: "#e0e0e0",
          headerBg: "#f5f5f5",
          lineColor: "#e0e0e0",
        };
      case "blue":
        return {
          mainBg: "#e3f2fd",
          gutterBg: "#bbdefb",
          text: "#000",
          border: "#bbdefb",
          headerBg: "#f5f5f5",
          lineColor: "#bbdefb",
        };
      case "black":
        return {
          mainBg: "#121212",
          gutterBg: "#1e1e1e",
          text: "#fff",
          border: "#333",
          headerBg: "#424242",
          lineColor: "#333",
        };
      default:
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
    "& .MuiButton-startIcon": { mr: { xs: 0, md: 0.5 }, ml: 0 },
    "& .MuiButton-endIcon": { ml: { xs: 0, md: 0.5 }, mr: 0 },
    "& .MuiSvgIcon-root": { fontSize: 18 },
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    let newVal = e.target.value;

    // 半角→全角変換
    newVal = newVal.replace(/[!-~]/g, (s) =>
      String.fromCharCode(s.charCodeAt(0) + 0xfee0)
    );
    newVal = newVal.replace(/ /g, "\u3000");

    // 許可文字フィルタリング
    newVal = newVal.replace(
      /[^０-９Ａ-Ｚａ-ｚぁ-んァ-ヶー\u4E00-\u9FFF\u3005-\u3007\u3000\n、。！？「」『』・：；（）①-⑳⑴-⒇ⅰ-ⅿ]/g,
      ""
    );

    const isCharLimitOk = newVal.length <= MAX_TOTAL_CHARS;
    const isLineLimitOk = calculateLineCount(newVal) <= MAX_TOTAL_LINES;

    if (isCharLimitOk && isLineLimitOk) {
      onChange(newVal);
    }
  };

  const displayLines = safeValue.split("\n");

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        // ★修正1: ここを 100vh から 100% に変更
        // App.tsxで分割されたエリアの高さに合わせるためです
        height: "100%",
        width: "100%",
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
          flexShrink: 0, // ヘッダーが縮まないように設定
        }}
      >
        第１問
      </Box>

      <Box
        sx={{
          bgcolor: isDark ? styles.headerBg : "#f5f5f5",
          borderBottom: `1px solid ${isDark ? "#555" : "#e0e0e0"}`,
          color: isDark ? "#fff" : "inherit",
          px: 2,
          py: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 50,
          flexShrink: 0, // ツールバーが縮まないように設定
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
            color:
              currentLineCount >= MAX_TOTAL_LINES ||
              charCount >= MAX_TOTAL_CHARS
                ? "error.main"
                : "inherit",
          }}
        >
          {currentLineCount}/{MAX_TOTAL_LINES}行 &nbsp; {charCount}/
          {MAX_TOTAL_CHARS.toLocaleString()}文字 (空白含む)
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

      {/* 
         ★修正2: 構造の変更
         flex: 1 のコンテナ内に position: absolute のコンテナを配置します。
         これにより、テキストエリアの内容量に関わらず、親枠のサイズが固定されます。
      */}
      <Box sx={{ flex: 1, position: "relative", minHeight: 0 }}>
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
          }}
        >
          {/* 行番号表示エリア */}
          <Box
            ref={gutterRef}
            sx={{
              width: 48,
              height: "100%", // 親(absoluteコンテナ)の高さに一致
              bgcolor: styles.gutterBg,
              borderRight: `1px solid ${isDark ? "#333" : "#e0e0e0"}`,
              pt: "8px",
              pb: 2,
              textAlign: "right",
              overflow: "hidden", // 自身のスクロールバーは非表示
              userSelect: "none",
              flexShrink: 0,
            }}
          >
            {displayLines.map((_, i) => (
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
                {displayLines.length + i + 1}
              </Box>
            ))}
          </Box>

          {/* テキストエリア領域 */}
          <Box sx={{ flex: 1, height: "100%", position: "relative" }}>
            <textarea
              ref={textareaRef}
              onScroll={handleScroll}
              maxLength={MAX_TOTAL_CHARS}
              onChange={handleChange}
              style={{
                width: "100%",
                height: "100%", // 親(absoluteコンテナ)の高さに一致
                border: "none",
                paddingTop: "8px",
                paddingBottom: "8px",
                paddingLeft: `${paddingLeft}px`,
                paddingRight: `max(16px, calc(100% - ${contentWidth}px))`,
                margin: 0,
                fontFamily: "monospace",
                fontSize: `${fontSize}px`,
                lineHeight: `${lineHeight}px`,
                whiteSpace: "pre-wrap",
                overflowWrap: "break-word",
                backgroundImage: `linear-gradient(to bottom, transparent ${
                  lineHeight - 1
                }px, ${styles.lineColor} ${lineHeight - 1}px)`,
                backgroundSize: `100% ${lineHeight}px`,
                backgroundAttachment: "local",
                backgroundColor: styles.mainBg,
                color: styles.text,
                resize: "none",
                outline: "none",
                boxSizing: "border-box",
                overflowY: "scroll", // ここでスクロールバーを出す
              }}
              value={safeValue}
              placeholder="ここに解答を入力してください..."
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
