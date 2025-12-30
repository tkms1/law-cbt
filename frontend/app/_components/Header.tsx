"use client";
import React, { memo, useState } from "react";
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  TextField,
} from "@mui/material";
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
  Check,
} from "@mui/icons-material";
import { ToolbarButton } from "./ToolbarButton";
import { PanelType, ColorSchemeType } from "../../type/type";

interface HeaderProps {
  timeLeft: number;
  showMemo: boolean;
  onToggleMemo: () => void;
  visiblePanels: PanelType[];
  onTogglePanel: (type: PanelType) => void;
  onSwapPanels: () => void;
  colorScheme: ColorSchemeType;
  onChangeColorScheme: (scheme: ColorSchemeType) => void;
  onFinish: () => void;
  onTimeChange: (seconds: number) => void;
  isExamActive: boolean;
}

export const Header: React.FC<HeaderProps> = memo(
  ({
    timeLeft,
    showMemo,
    onToggleMemo,
    visiblePanels,
    onTogglePanel,
    onSwapPanels,
    colorScheme,
    onChangeColorScheme,
    onFinish,
    onTimeChange,
    isExamActive,
  }) => {
    // --- 時間変更用のState ---
    const [isEditingTime, setIsEditingTime] = useState(false);
    const [editValue, setEditValue] = useState("");

    // 時間フォーマット関数 (HH:MM:SS)
    const formatTime = (seconds: number) => {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = seconds % 60;
      return `${h.toString().padStart(2, "0")}:${m
        .toString()
        .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    const isVisible = (type: PanelType) => visiblePanels.includes(type);

    // 配色メニュー用のState
    const [paletteAnchorEl, setPaletteAnchorEl] = useState<null | HTMLElement>(
      null
    );
    const isPaletteOpen = Boolean(paletteAnchorEl);

    const handlePaletteClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      setPaletteAnchorEl(event.currentTarget);
    };

    const handlePaletteClose = () => {
      setPaletteAnchorEl(null);
    };

    const handleColorSelect = (scheme: ColorSchemeType) => {
      onChangeColorScheme(scheme);
      handlePaletteClose();
    };

    const handleTimeClick = () => {
      if (isExamActive) return;
      setEditValue(formatTime(timeLeft));
      setIsEditingTime(true);
    };

    // --- ★追加: 入力値の制御 ---
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let val = e.target.value;

      // 1. 全角英数記号を半角に変換
      // (全角文字コードから 0xFEE0 を引くと半角になります)
      val = val.replace(/[！-～]/g, (char) =>
        String.fromCharCode(char.charCodeAt(0) - 0xfee0)
      );

      // 2. 数字とコロン(:)以外を削除
      val = val.replace(/[^0-9:]/g, "");

      setEditValue(val);
    };

    const handleTimeSave = () => {
      const parts = editValue.split(":").map((part) => parseInt(part, 10));
      let newSeconds = 0;
      let valid = true;

      // 数値チェック (handleInputChangeで制限していますが念のため)
      if (parts.some((num) => isNaN(num))) {
        valid = false;
      } else {
        if (parts.length === 3) {
          // HH:MM:SS
          newSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
        } else if (parts.length === 2) {
          // MM:SS
          newSeconds = parts[0] * 60 + parts[1];
        } else if (parts.length === 1) {
          // 秒のみ
          newSeconds = parts[0];
        } else {
          valid = false;
        }
      }

      if (valid && newSeconds >= 0) {
        onTimeChange(newSeconds);
      }
      setIsEditingTime(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleTimeSave();
      } else if (e.key === "Escape") {
        setIsEditingTime(false);
      }
    };

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
              司法試験等CBTシステム
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
              onClick={handlePaletteClick}
              active={isPaletteOpen}
            />
            <ToolbarButton
              icon={<HelpOutline sx={{ fontSize: 18 }} />}
              label="使い方"
            />
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {/* Right Side: 残り時間と終了ボタン */}
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
                {isExamActive
                  ? "残り時間 (試験中は変更不可)"
                  : "残り時間 (クリックで変更)"}
              </Typography>

              {isEditingTime ? (
                <TextField
                  variant="standard"
                  size="small"
                  autoFocus
                  value={editValue}
                  // ★変更: ここで入力制限処理を呼び出す
                  onChange={handleInputChange}
                  onBlur={handleTimeSave}
                  onKeyDown={handleKeyDown}
                  placeholder="00:00:00"
                  slotProps={{
                    input: {
                      disableUnderline: true,
                    },
                  }}
                  sx={{
                    bgcolor: "white",
                    borderRadius: 1,
                    width: "120px",
                    input: {
                      padding: "4px 8px",
                      fontSize: "1.25rem",
                      fontWeight: "bold",
                      fontFamily: "monospace",
                      textAlign: "center",
                      color: "#333",
                    },
                  }}
                />
              ) : (
                <Typography
                  variant="h6"
                  onClick={handleTimeClick}
                  sx={{
                    fontFamily: "monospace",
                    fontWeight: "bold",
                    lineHeight: 1,
                    color: isExamActive ? "#ccc" : "#ffebee",
                    cursor: isExamActive ? "default" : "pointer",
                    "&:hover": {
                      textDecoration: isExamActive ? "none" : "underline",
                      color: isExamActive ? "#ccc" : "#fff",
                    },
                  }}
                >
                  {formatTime(timeLeft)}
                </Typography>
              )}
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
              onClick={onFinish}
            >
              終了
            </Button>
          </Box>
        </Toolbar>

        <Menu
          anchorEl={paletteAnchorEl}
          open={isPaletteOpen}
          onClose={handlePaletteClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          transformOrigin={{ vertical: "top", horizontal: "left" }}
        >
          <MenuItem onClick={() => handleColorSelect("none")}>
            <ListItemIcon>
              {colorScheme === "none" && <Check fontSize="small" />}
            </ListItemIcon>
            <ListItemText>なし</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleColorSelect("yellow")}>
            <ListItemIcon>
              {colorScheme === "yellow" && <Check fontSize="small" />}
            </ListItemIcon>
            <ListItemText>黄背景</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleColorSelect("blue")}>
            <ListItemIcon>
              {colorScheme === "blue" && <Check fontSize="small" />}
            </ListItemIcon>
            <ListItemText>青背景</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleColorSelect("black")}>
            <ListItemIcon>
              {colorScheme === "black" && <Check fontSize="small" />}
            </ListItemIcon>
            <ListItemText>黒背景</ListItemText>
          </MenuItem>
        </Menu>
      </AppBar>
    );
  }
);

Header.displayName = "Header";
