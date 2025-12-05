import React, { useState } from "react";
import { Box, Paper, Typography, IconButton } from "@mui/material";
import {
  VerticalSplit,
  ViewSidebar,
  Fullscreen,
  Close,
} from "@mui/icons-material";

interface MemoPadProps {
  onClose: () => void;
}

export const MemoPad: React.FC<MemoPadProps> = ({ onClose }) => {
  const [position, setPosition] = useState<"left" | "right" | "full">("right");
  const [content, setContent] = useState("");

  const getStyle = () => {
    switch (position) {
      case "left":
        return { left: 0, top: 64, bottom: 0, width: "33%" };
      case "right":
        return { right: 0, top: 64, bottom: 0, width: "33%" };
      case "full":
        return { inset: 0, top: 64, zIndex: 1300 };
    }
  };

  return (
    <Paper
      elevation={8}
      sx={{
        position: "fixed",
        display: "flex",
        flexDirection: "column",
        zIndex: 1200,
        transition: "all 0.3s",
        border: 2,
        borderColor: "primary.main",
        ...getStyle(),
      }}
    >
      <Box
        sx={{
          bgcolor: "primary.main",
          color: "primary.contrastText",
          px: 1,
          py: 0.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
          メモ
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              display: "flex",
              bgcolor: "primary.dark",
              borderRadius: 1,
              mr: 1,
            }}
          >
            <IconButton
              size="small"
              onClick={() => setPosition("left")}
              sx={{
                color: "white",
                p: 0.5,
                bgcolor: position === "left" ? "primary.light" : "transparent",
                borderRadius: 0.5,
              }}
            >
              <ViewSidebar sx={{ fontSize: 14, transform: "scaleX(-1)" }} />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => setPosition("full")}
              sx={{
                color: "white",
                p: 0.5,
                bgcolor: position === "full" ? "primary.light" : "transparent",
                borderRadius: 0.5,
              }}
            >
              <Fullscreen sx={{ fontSize: 14 }} />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => setPosition("right")}
              sx={{
                color: "white",
                p: 0.5,
                bgcolor: position === "right" ? "primary.light" : "transparent",
                borderRadius: 0.5,
              }}
            >
              <ViewSidebar sx={{ fontSize: 14 }} />
            </IconButton>
          </Box>
          <IconButton
            size="small"
            onClick={onClose}
            sx={{
              bgcolor: "error.main",
              color: "white",
              px: 1,
              py: 0.2,
              borderRadius: 1,
              fontSize: 10,
              "&:hover": { bgcolor: "error.dark" },
              width: "auto",
            }}
          >
            <Typography variant="caption" fontWeight="bold">
              閉じる
            </Typography>
          </IconButton>
        </Box>
      </Box>
      <textarea
        style={{
          flex: 1,
          padding: "16px",
          resize: "none",
          outline: "none",
          fontFamily: "monospace",
          fontSize: "14px",
          backgroundColor: "#fff9c4", // Light yellow
          border: "none",
        }}
        placeholder="メモを入力してください..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
    </Paper>
  );
};
