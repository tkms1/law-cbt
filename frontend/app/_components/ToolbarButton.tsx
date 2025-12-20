import React from "react";
import { Button, Box, Typography } from "@mui/material";

interface ToolbarButtonProps {
  icon: React.ReactNode;
  label: string;
  subLabel?: string;
  active?: boolean;
  color?: string;
  // ▼ 修正箇所: onClickでイベント情報を受け取れるように型定義を変更しました
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  icon,
  label,
  subLabel,
  active,
  color,
  onClick,
}) => {
  return (
    <Button
      // ButtonコンポーネントのonClickイベントをそのまま渡します
      onClick={onClick}
      sx={{
        minWidth: 48,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        color: active ? "white" : "rgba(255,255,255,0.7)",
        bgcolor: active ? "rgba(255,255,255,0.1)" : "transparent",
        borderRadius: 0,
        px: 1,
        borderBottom: active ? "3px solid #f50057" : "3px solid transparent",
        textTransform: "none",
        "&:hover": {
          bgcolor: "rgba(255,255,255,0.1)",
          color: "white",
        },
      }}
    >
      <Box sx={{ color: color || "inherit", display: "flex", mb: 0.5 }}>
        {icon}
      </Box>
      <Typography
        variant="caption"
        sx={{
          fontSize: "10px",
          lineHeight: 1.1,
          textAlign: "center",
          opacity: active ? 1 : 0.9,
        }}
      >
        {label}
        {subLabel && (
          <>
            <br />
            {subLabel}
          </>
        )}
      </Typography>
    </Button>
  );
};
