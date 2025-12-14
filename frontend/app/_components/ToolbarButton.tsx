import React from "react";
import { Button, Typography, Box } from "@mui/material";

interface ToolbarButtonProps {
  icon: React.ReactNode;
  label?: string;
  onClick?: () => void;
  active?: boolean;
  className?: string;
  color?: string; // Hex color for custom background
  subLabel?: string;
}

export const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  icon,
  label,
  onClick,
  active,
  color,
  subLabel,
}) => {
  return (
    <Button
      onClick={onClick}
      variant={active ? "contained" : "text"}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minWidth: "3.5rem",
        height: "100%",
        padding: "4px 8px",
        borderRadius: 0,
        color: active ? "white" : "white",
        backgroundColor: active ? "primary.dark" : color || "transparent",
        borderRight: "1px solid rgba(255,255,255,0.2)",
        "&:hover": {
          backgroundColor: active ? "primary.dark" : "rgba(255,255,255,0.1)",
        },
      }}
    >
      <Box sx={{ mb: 0.5, display: "flex" }}>{icon}</Box>
      {label && (
        <Typography variant="caption" sx={{ lineHeight: 1, fontSize: "10px" }}>
          {label}
        </Typography>
      )}
      {subLabel && (
        <Typography
          variant="caption"
          sx={{ lineHeight: 1, fontSize: "9px", opacity: 0.8 }}
        >
          {subLabel}
        </Typography>
      )}
    </Button>
  );
};
