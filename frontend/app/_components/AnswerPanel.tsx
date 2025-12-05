import React, { useState } from "react";
import { Box, Tabs, Tab, Typography, Button, ButtonGroup } from "@mui/material";
import { Search, FindReplace, Undo, Redo } from "@mui/icons-material";

interface AnswerPanelProps {
  value: string;
  onChange: (value: string) => void;
}

export const AnswerPanel: React.FC<AnswerPanelProps> = ({
  value,
  onChange,
}) => {
  const [activeTab, setActiveTab] = useState(0);

  // Handle case where value might be undefined initially
  const safeValue = value || "";
  const lineCount = safeValue ? safeValue.split("\n").length : 0;
  const charCount = safeValue.length;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        bgcolor: "background.paper",
        position: "relative",
      }}
    >
      {/* Tabs */}
      <Box
        sx={{
          bgcolor: "grey.100",
          borderBottom: 1,
          borderColor: "divider",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          px: 0.5,
          pt: 0.5,
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="standard"
          sx={{
            minHeight: 32,
            "& .MuiTab-root": {
              minHeight: 32,
              py: 0,
              fontSize: 12,
              fontWeight: "bold",
              textTransform: "none",
              borderTopLeftRadius: 4,
              borderTopRightRadius: 4,
              border: 1,
              borderColor: "transparent",
              mr: 0.5,
            },
            "& .Mui-selected": {
              bgcolor: "background.paper",
              borderColor: "divider",
              borderBottomColor: "background.paper",
              color: "primary.main",
            },
            "& .MuiTabs-indicator": { display: "none" },
          }}
        >
          <Tab label="第１問" />
          <Tab label="第２問" />
        </Tabs>
        <Typography
          variant="caption"
          sx={{
            pb: 1,
            pr: 1,
            color: "error.main",
            fontWeight: "bold",
          }}
        >
          残り時間： 00:00:00
        </Typography>
      </Box>

      {/* Info Bar */}
      <Box
        sx={{
          bgcolor: "grey.50",
          borderBottom: 1,
          borderColor: "divider",
          px: 1,
          py: 0.5,
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: 1,
          height: 36,
        }}
      >
        <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
          {lineCount}/184行 {charCount}/5,520文字 (空白含む)
        </Typography>

        <Box sx={{ height: 16, width: 1, bgcolor: "divider", mx: 0.5 }} />

        <Button
          size="small"
          variant="outlined"
          startIcon={<Search sx={{ fontSize: 14 }} />}
          sx={{
            bgcolor: "white",
            height: 24,
            fontSize: 11,
            color: "text.primary",
            borderColor: "grey.300",
            minWidth: "auto",
            px: 1,
          }}
        >
          検索
        </Button>
        <Button
          size="small"
          variant="outlined"
          startIcon={<FindReplace sx={{ fontSize: 14 }} />}
          sx={{
            bgcolor: "white",
            height: 24,
            fontSize: 11,
            color: "text.primary",
            borderColor: "grey.300",
            minWidth: "auto",
            px: 1,
          }}
        >
          置換
        </Button>

        <ButtonGroup
          size="small"
          variant="outlined"
          sx={{ bgcolor: "white", height: 24 }}
        >
          <Button
            startIcon={<Undo sx={{ fontSize: 14 }} />}
            sx={{
              borderColor: "grey.300",
              color: "text.primary",
              fontSize: 11,
              px: 1,
            }}
          >
            元に戻す
          </Button>
          <Button
            endIcon={<Redo sx={{ fontSize: 14 }} />}
            sx={{
              borderColor: "grey.300",
              color: "text.primary",
              fontSize: 11,
              px: 1,
            }}
          >
            やり直し
          </Button>
        </ButtonGroup>
      </Box>

      {/* Editor */}
      <Box sx={{ flex: 1, p: 2, position: "relative", overflow: "hidden" }}>
        <Box
          sx={{
            position: "absolute",
            top: 8,
            left: "50%",
            transform: "translateX(-50%)",
            px: 2,
            py: 0.5,
            border: 1,
            borderColor: "error.light",
            color: "error.main",
            fontWeight: "bold",
            bgcolor: "rgba(255,255,255,0.9)",
            zIndex: 10,
            pointerEvents: "none",
            fontSize: 12,
            borderRadius: 10,
          }}
        >
          答案作成エリア
        </Box>
        <textarea
          style={{
            width: "100%",
            height: "100%",
            border: "1px solid #ccc",
            padding: "16px",
            fontFamily: "monospace",
            fontSize: "14px",
            lineHeight: "2rem",
            resize: "none",
            outline: "none",
            backgroundImage:
              "linear-gradient(transparent 1.95rem, #f3f4f6 1.95rem, #f3f4f6 2rem)",
            backgroundSize: "100% 2rem",
            backgroundAttachment: "local",
          }}
          placeholder="ここに解答を入力してください..."
          value={safeValue}
          onChange={(e) => onChange(e.target.value)}
        />
      </Box>
    </Box>
  );
};
