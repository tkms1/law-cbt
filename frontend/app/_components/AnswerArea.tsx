import React, { useState } from "react";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Button,
  IconButton,
  Paper,
  TextField,
} from "@mui/material";
import {
  Search,
  KeyboardArrowUp,
  KeyboardArrowDown,
  Close,
} from "@mui/icons-material";

export const AnswerArea: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [text, setText] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const charCount = text.length;
  const lineCount = text.split("\n").length;

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
          bgcolor: "grey.200",
          borderBottom: 1,
          borderColor: "divider",
          display: "flex",
          alignItems: "flex-end",
          px: 1,
          pt: 1,
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
            },
          }}
        >
          <Tab
            label="第１問"
            sx={{
              bgcolor: activeTab === 0 ? "background.paper" : "transparent",
              borderTopLeftRadius: 4,
              borderTopRightRadius: 4,
              border: 1,
              borderColor: "transparent",
              ...(activeTab === 0 && {
                borderColor: "divider",
                borderBottomColor: "background.paper",
              }),
            }}
          />
          <Tab
            label="第２問"
            sx={{
              bgcolor: activeTab === 1 ? "background.paper" : "transparent",
              borderTopLeftRadius: 4,
              borderTopRightRadius: 4,
              border: 1,
              borderColor: "transparent",
              ...(activeTab === 1 && {
                borderColor: "divider",
                borderBottomColor: "background.paper",
              }),
            }}
          />
        </Tabs>
        <Box
          sx={{
            flex: 1,
            textAlign: "right",
            p: 1,
            color: "error.main",
            fontSize: 12,
            fontWeight: "bold",
          }}
        >
          残り時間： 00:00:00
        </Box>
      </Box>

      {/* Info Bar */}
      <Box
        sx={{
          bgcolor: "grey.100",
          borderBottom: 1,
          borderColor: "divider",
          px: 2,
          py: 0.5,
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Typography variant="caption" color="text.secondary">
          {lineCount}行 {charCount}/5,520文字 (空白含む)
        </Typography>
        <Button
          size="small"
          variant="outlined"
          startIcon={<Search sx={{ fontSize: 12 }} />}
          onClick={() => setSearchOpen(!searchOpen)}
          sx={{
            bgcolor: "grey.200",
            height: 24,
            fontSize: 11,
            color: "text.primary",
            borderColor: "grey.400",
          }}
        >
          検索
        </Button>
        <Button
          size="small"
          variant="outlined"
          sx={{
            bgcolor: "grey.200",
            height: 24,
            fontSize: 11,
            color: "text.primary",
            borderColor: "grey.400",
          }}
        >
          置換
        </Button>
        <Button
          size="small"
          variant="outlined"
          sx={{
            bgcolor: "grey.200",
            height: 24,
            fontSize: 11,
            color: "text.primary",
            borderColor: "grey.400",
          }}
        >
          元に戻す・やり直し
        </Button>
      </Box>

      {/* Search Bar Overlay */}
      {searchOpen && (
        <Paper
          elevation={2}
          sx={{
            bgcolor: "warning.light",
            p: 1,
            display: "flex",
            alignItems: "center",
            gap: 1,
            borderBottom: 1,
            borderColor: "warning.main",
          }}
        >
          <Typography
            variant="caption"
            sx={{ fontWeight: "bold", color: "text.primary" }}
          >
            検索
          </Typography>
          <TextField
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
            sx={{
              width: 160,
              "& .MuiInputBase-root": {
                height: 28,
                fontSize: 12,
                bgcolor: "white",
              },
            }}
          />
          <IconButton
            size="small"
            sx={{
              bgcolor: "white",
              border: 1,
              borderColor: "divider",
              padding: 0.5,
            }}
          >
            <KeyboardArrowUp sx={{ fontSize: 12 }} />
          </IconButton>
          <IconButton
            size="small"
            sx={{
              bgcolor: "white",
              border: 1,
              borderColor: "divider",
              padding: 0.5,
            }}
          >
            <KeyboardArrowDown sx={{ fontSize: 12 }} />
          </IconButton>
          <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
            {searchQuery ? "0箇所" : ""}
          </Typography>
          <Box sx={{ flex: 1 }} />
          <IconButton size="small" onClick={() => setSearchOpen(false)}>
            <Close sx={{ fontSize: 14 }} />
          </IconButton>
        </Paper>
      )}

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
              "linear-gradient(transparent 1.95rem, #eee 1.95rem, #eee 2rem)",
            backgroundSize: "100% 2rem",
            backgroundAttachment: "local",
          }}
          placeholder="ここに解答を入力してください..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </Box>
    </Box>
  );
};
