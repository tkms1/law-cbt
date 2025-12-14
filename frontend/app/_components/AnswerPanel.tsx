import React, { useState, useRef } from "react";
import { Box, Typography, Button, Stack } from "@mui/material";
import { Search, FindReplace, Undo, Redo } from "@mui/icons-material";

interface AnswerPanelProps {
  value: string;
  onChange: (value: string) => void;
}

export const AnswerPanel: React.FC<AnswerPanelProps> = ({
  value,
  onChange,
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

  // ★修正したボタンスタイル
  const toolButtonStyle = {
    bgcolor: "#607d8b",
    color: "#fff",
    fontSize: "12px",
    fontWeight: "bold",
    height: 32,
    minWidth: "36px", // ボタンの最小幅を少し確保

    // パディング: 文字なし(xs)は狭く、文字あり(md)は広く
    px: { xs: 1, md: 2 },

    borderRadius: 1,
    boxShadow: "0px 2px 4px rgba(0,0,0,0.2)",
    textTransform: "none",
    "&:hover": {
      bgcolor: "#546e7a",
    },

    // Start Icon (左アイコン) のマージン制御
    "& .MuiButton-startIcon": {
      mr: { xs: 0, md: 0.5 }, // 文字がない時はマージン0
      ml: 0,
    },

    // End Icon (右アイコン) のマージン制御
    "& .MuiButton-endIcon": {
      ml: { xs: 0, md: 0.5 }, // 文字がない時はマージン0
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
        bgcolor: "#fff",
        border: "1px solid #ccc",
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
          bgcolor: "#f5f5f5",
          borderBottom: "1px solid #e0e0e0",
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

          {/* endIconを使ったボタン */}
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
            bgcolor: "#fff",
            borderRight: "1px solid #e0e0e0",
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
              backgroundImage: `linear-gradient(to bottom, transparent ${
                lineHeight - 1
              }px, #e0e0e0 ${lineHeight - 1}px)`,
              backgroundSize: `100% ${lineHeight}px`,
              backgroundAttachment: "local",
              resize: "none",
              outline: "none",
              boxSizing: "border-box",
              color: "#333",
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
