import React, { memo } from "react";
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
import { ToolbarButton } from "./ToolbarButton"; // パスは環境に合わせて調整してください
import { PanelType } from "../../types"; // パスは環境に合わせて調整してください

interface HeaderProps {
  timeLeft: number;
  showMemo: boolean;
  onToggleMemo: () => void;
  visiblePanels: PanelType[];
  onTogglePanel: (type: PanelType) => void;
  onSwapPanels: () => void;
}

export const Header: React.FC<HeaderProps> = memo(
  ({
    timeLeft,
    showMemo,
    onToggleMemo,
    visiblePanels,
    onTogglePanel,
    onSwapPanels,
  }) => {
    // 時間フォーマット関数（ヘッダー内でのみ使用するためここに移動）
    const formatTime = (seconds: number) => {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = seconds % 60;
      return `${h.toString().padStart(2, "0")}:${m
        .toString()
        .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    const isVisible = (type: PanelType) => visiblePanels.includes(type);

    return (
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
              onClick={onToggleMemo}
              active={showMemo}
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
              onClick={() => onTogglePanel(PanelType.QUESTION)}
            />
            <ToolbarButton
              icon={<Balance sx={{ fontSize: 20 }} />}
              label="法文"
              active={isVisible(PanelType.LAW)}
              onClick={() => onTogglePanel(PanelType.LAW)}
            />
            <ToolbarButton
              icon={<Create sx={{ fontSize: 20 }} />}
              label="答案"
              active={isVisible(PanelType.ANSWER)}
              onClick={() => onTogglePanel(PanelType.ANSWER)}
            />

            <ToolbarButton
              icon={<SwapHoriz sx={{ fontSize: 20 }} />}
              label="入替え"
              onClick={onSwapPanels}
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
    );
  }
);

Header.displayName = "Header";
