// _components/MemoPad.tsx
import React, { useState } from "react";
import { Paper, Box, TextField, Button, ButtonGroup } from "@mui/material";
import {
  ViewSidebar, // 左右配置用のアイコン（回転させて使用）
  Fullscreen, // 全画面用
} from "@mui/icons-material";

interface MemoPadProps {
  onClose: () => void;
  value: string;
  onChange: (value: string) => void;
}

type LayoutMode = "left" | "right" | "full";

export const MemoPad: React.FC<MemoPadProps> = ({
  onClose,
  value,
  onChange,
}) => {
  // 表示モードの状態管理（デフォルトは右配置）
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("right");

  // モードに応じたスタイルを決定する関数
  const getPaperStyles = () => {
    const baseStyles = {
      position: "absolute" as const,
      top: 64, // ヘッダーの高さ分下げる
      height: "calc(100% - 64px)", // ヘッダー分を引いた高さ
      zIndex: 1200,
      display: "flex",
      flexDirection: "column" as const,
      borderRadius: 0,
      border: "1px solid rgba(0,0,0,0.12)",
      transition: "all 0.2s ease", // 配置変更時のアニメーション
    };

    switch (layoutMode) {
      case "left":
        return {
          ...baseStyles,
          left: 0,
          right: "auto",
          width: 400, // 左配置時の幅（少し広めに設定）
          borderRight: "1px solid rgba(0,0,0,0.12)",
          borderLeft: "none",
        };
      case "full":
        return {
          ...baseStyles,
          left: 0,
          right: 0,
          width: "100%", // 全画面
        };
      case "right":
      default:
        return {
          ...baseStyles,
          left: "auto",
          right: 0,
          width: 400, // 右配置時の幅
          borderLeft: "1px solid rgba(0,0,0,0.12)",
          borderRight: "none",
        };
    }
  };

  // 共通のボタンスタイル（マニュアルのダークグレーのボタン風）
  const modeButtonStyle = {
    bgcolor: "#455a64", // ブルーグレー（マニュアルに近い色）
    color: "#fff",
    fontSize: "0.75rem",
    padding: "4px 10px",
    "&:hover": {
      bgcolor: "#37474f",
    },
    display: "flex",
    flexDirection: "column" as const,
    lineHeight: 1.2,
    minWidth: 60,
    textTransform: "none" as const,
  };

  return (
    <Paper elevation={4} sx={getPaperStyles()}>
      {/* ツールバーエリア（マニュアルP15のデザインを再現） */}
      <Box
        sx={{
          p: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between", // 左寄せと右寄せに分割
          bgcolor: "#fff", // マニュアルに合わせて白背景
          borderBottom: "1px solid rgba(0,0,0,0.12)",
          minHeight: 50,
        }}
      >
        {/* 配置切り替えボタン群 */}
        <ButtonGroup variant="contained" sx={{ boxShadow: "none", gap: 1 }}>
          <Button
            sx={modeButtonStyle}
            onClick={() => setLayoutMode("left")}
            startIcon={
              <ViewSidebar sx={{ transform: "rotate(180deg)", mb: 0.5 }} />
            }
          >
            左配置
          </Button>

          <Button
            sx={modeButtonStyle}
            onClick={() => setLayoutMode("full")}
            startIcon={<Fullscreen sx={{ mb: 0.5 }} />}
          >
            全画面
          </Button>

          <Button
            sx={modeButtonStyle}
            onClick={() => setLayoutMode("right")}
            startIcon={<ViewSidebar sx={{ mb: 0.5 }} />}
          >
            右配置
          </Button>
        </ButtonGroup>

        {/* 閉じるボタン（マニュアルの青いボタン） */}
        <Button
          variant="contained"
          onClick={onClose}
          sx={{
            bgcolor: "#1976d2", // 明るめの青
            fontWeight: "bold",
            minWidth: 80,
            boxShadow: 2,
            "&:hover": {
              bgcolor: "#1565c0",
            },
          }}
        >
          閉じる
        </Button>
      </Box>

      {/* テキスト入力エリア */}
      <Box sx={{ flexGrow: 1, p: 2 }}>
        <TextField
          multiline
          fullWidth
          variant="standard"
          placeholder="ここにメモを入力..."
          InputProps={{ disableUnderline: true }}
          sx={{
            height: "100%",
            overflow: "auto",
            "& .MuiInputBase-root": {
              alignItems: "flex-start", // テキスト開始位置を左上に
              height: "100%",
              fontSize: "1rem",
              lineHeight: 1.6,
            },
          }}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </Box>
    </Paper>
  );
};
