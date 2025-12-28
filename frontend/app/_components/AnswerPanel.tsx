import React, { useState, useRef } from "react";
import { Box, Typography, Button, Stack } from "@mui/material";
import { Search, FindReplace, Undo, Redo } from "@mui/icons-material";
import { ColorSchemeType } from "../../type/type";

interface AnswerPanelProps {
  value: string;
  onChange: (value: string) => void;
  colorScheme?: ColorSchemeType;
  // ★ 試験中フラグ
  isExamActive?: boolean;
}

export const AnswerPanel: React.FC<AnswerPanelProps> = ({
  value,
  onChange,
  colorScheme = "none",
  isExamActive = false,
}) => {
  // 定数定義
  const MAX_PAGES = 8;
  const LINES_PER_PAGE = 23;
  const MAX_CHARS_PER_LINE = 30;

  const MAX_TOTAL_LINES = MAX_PAGES * LINES_PER_PAGE;
  const MAX_TOTAL_CHARS = MAX_TOTAL_LINES * MAX_CHARS_PER_LINE;

  const safeValue = value || "";
  const charCount = safeValue.length;

  const isComposing = useRef(false);

  const lineHeight = 32;
  const fontSize = 16;
  const paddingLeft = 16;
  const contentWidth = paddingLeft + fontSize * MAX_CHARS_PER_LINE;

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  const calculateLineCount = (text: string): number => {
    const paragraphs = text.split("\n");
    return paragraphs.reduce((totalLines, p) => {
      if (p.length === 0) return totalLines + 1;
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

  // 試験中でなければ背景を少し暗くする（読み取り専用感）
  const currentBgColor = isExamActive
    ? styles.mainBg
    : isDark
    ? "#333"
    : "#f5f5f5";

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
    "&:hover": { bgcolor: "#546e7a" },
    "&.Mui-disabled": { bgcolor: "#cfd8dc", color: "#90a4ae" },
    "& .MuiButton-startIcon": { mr: { xs: 0, md: 0.5 }, ml: 0 },
    "& .MuiButton-endIcon": { ml: { xs: 0, md: 0.5 }, mr: 0 },
    "& .MuiSvgIcon-root": { fontSize: 18 },
  };

  const processInput = (inputValue: string) => {
    let newVal = inputValue;
    newVal = newVal.replace(/[!-~]/g, (s) =>
      String.fromCharCode(s.charCodeAt(0) + 0xfee0)
    );
    newVal = newVal.replace(/ /g, "\u3000");
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

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isComposing.current) {
      onChange(e.target.value);
      return;
    }
    processInput(e.target.value);
  };

  const displayLines = safeValue.split("\n");

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
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
          flexShrink: 0,
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
          flexShrink: 0,
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
          {/* 試験中でない場合、ツールボタンも無効化 */}
          <Button
            startIcon={<Search />}
            sx={toolButtonStyle}
            disabled={!isExamActive}
          >
            <Box
              component="span"
              sx={{ display: { xs: "none", md: "inline" } }}
            >
              検索
            </Box>
          </Button>
          <Button
            startIcon={<FindReplace />}
            sx={toolButtonStyle}
            disabled={!isExamActive}
          >
            <Box
              component="span"
              sx={{ display: { xs: "none", md: "inline" } }}
            >
              置換
            </Box>
          </Button>
          <Box sx={{ width: 8 }} />
          <Button
            startIcon={<Undo />}
            sx={toolButtonStyle}
            disabled={!isExamActive}
          >
            <Box
              component="span"
              sx={{ display: { xs: "none", md: "inline" } }}
            >
              元に戻す
            </Box>
          </Button>
          <Button
            endIcon={<Redo />}
            sx={toolButtonStyle}
            disabled={!isExamActive}
          >
            <Box
              component="span"
              sx={{ display: { xs: "none", md: "inline" } }}
            >
              やり直し
            </Box>
          </Button>
        </Stack>
      </Box>

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
          {/* 行番号 */}
          <Box
            ref={gutterRef}
            sx={{
              width: 48,
              height: "100%",
              bgcolor: isExamActive ? styles.gutterBg : currentBgColor,
              borderRight: `1px solid ${isDark ? "#333" : "#e0e0e0"}`,
              pt: "8px",
              pb: 2,
              textAlign: "right",
              overflow: "hidden",
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
                  color: isExamActive ? "#ff80ab" : "grey.500",
                  pr: 1,
                  fontFamily: "monospace",
                }}
              >
                {i + 1}
              </Box>
            ))}
          </Box>

          {/* テキストエリア */}
          <Box sx={{ flex: 1, height: "100%", position: "relative" }}>
            <textarea
              ref={textareaRef}
              onScroll={handleScroll}
              maxLength={MAX_TOTAL_CHARS}
              onChange={handleChange}
              // ★ 読み取り専用設定
              readOnly={!isExamActive}
              placeholder={
                isExamActive
                  ? "ここに解答を入力してください..."
                  : "問題(PDF)を読み込むと試験が開始され、入力可能になります。"
              }
              style={{
                width: "100%",
                height: "100%",
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
                // 背景罫線の表示（試験中のみ）
                backgroundImage: isExamActive
                  ? `linear-gradient(to bottom, transparent ${
                      lineHeight - 1
                    }px, ${styles.lineColor} ${lineHeight - 1}px)`
                  : "none",
                backgroundSize: `100% ${lineHeight}px`,
                backgroundAttachment: "local",
                backgroundColor: currentBgColor,
                color: isExamActive ? styles.text : "text.disabled",
                resize: "none",
                outline: "none",
                boxSizing: "border-box",
                overflowY: "scroll",
                cursor: isExamActive ? "text" : "not-allowed",
              }}
              value={safeValue}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
