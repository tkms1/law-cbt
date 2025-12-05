import React, { useState } from "react";
import {
  Box,
  IconButton,
  Paper,
  Typography,
  Divider,
  Button,
} from "@mui/material";
import {
  NearMe,
  PanTool,
  Create,
  TextFields,
  Category,
  FormatListBulleted,
  ZoomIn,
  ZoomOut,
  VerticalAlignTop,
  VerticalAlignBottom,
  Height,
  MenuBook,
  RotateLeft,
  RotateRight,
} from "@mui/icons-material";
import { MOCK_QUESTIONS } from "../../constants";
import { ToolMode } from "../../types";

interface QuestionAreaProps {
  isActive: boolean;
}

interface ToolBtnProps {
  tool?: ToolMode;
  icon: React.ReactNode;
  color?: string;
  currentTool: ToolMode;
  setCurrentTool: (tool: ToolMode) => void;
}

const ToolBtn: React.FC<ToolBtnProps> = ({
  tool,
  icon,
  color,
  currentTool,
  setCurrentTool,
}) => (
  <IconButton
    size="small"
    onClick={() => tool && setCurrentTool(tool)}
    sx={{
      my: 0.5,
      bgcolor: tool && tool === currentTool ? "action.selected" : "transparent",
      border:
        tool && tool === currentTool
          ? "1px solid #1976d2"
          : "1px solid transparent",
      color: color ? color : "text.secondary",
      "&:hover": { bgcolor: "action.hover" },
    }}
  >
    {icon}
  </IconButton>
);

export const QuestionArea: React.FC<QuestionAreaProps> = ({ isActive }) => {
  const [zoom, setZoom] = useState(100);
  const [currentTool, setCurrentTool] = useState<ToolMode>(ToolMode.SELECT);

  return (
    <Box
      sx={{
        display: "flex",
        height: "100%",
        width: "100%",
        bgcolor: "background.default",
        position: "relative",
      }}
    >
      {/* Left Vertical Toolbar */}
      <Paper
        elevation={0}
        sx={{
          width: 48,
          bgcolor: "grey.50",
          borderRight: 1,
          borderColor: "divider",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          py: 1,
          overflowY: "auto",
          flexShrink: 0,
        }}
      >
        <ToolBtn
          tool={ToolMode.SELECT}
          icon={<NearMe sx={{ fontSize: 18 }} />}
          currentTool={currentTool}
          setCurrentTool={setCurrentTool}
        />
        <ToolBtn
          tool={ToolMode.HAND}
          icon={<PanTool sx={{ fontSize: 18 }} />}
          currentTool={currentTool}
          setCurrentTool={setCurrentTool}
        />

        <Divider sx={{ width: "60%", my: 1 }} />

        <ToolBtn
          tool={ToolMode.MARKER}
          icon={
            <Box
              sx={{
                width: 16,
                height: 16,
                bgcolor: "orange",
                borderRadius: "2px",
                transform: "rotate(-45deg)",
              }}
            />
          }
          currentTool={currentTool}
          setCurrentTool={setCurrentTool}
        />
        <ToolBtn
          tool={ToolMode.PEN}
          icon={<Create sx={{ fontSize: 18 }} />}
          currentTool={currentTool}
          setCurrentTool={setCurrentTool}
        />
        <ToolBtn
          tool={ToolMode.TEXT}
          icon={<TextFields sx={{ fontSize: 18 }} />}
          currentTool={currentTool}
          setCurrentTool={setCurrentTool}
        />
        <ToolBtn
          tool={ToolMode.SHAPE}
          icon={<Category sx={{ fontSize: 18 }} />}
          currentTool={currentTool}
          setCurrentTool={setCurrentTool}
        />

        <Divider sx={{ width: "60%", my: 1 }} />

        <ToolBtn
          icon={<FormatListBulleted sx={{ fontSize: 18 }} />}
          currentTool={currentTool}
          setCurrentTool={setCurrentTool}
        />

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            bgcolor: "grey.200",
            borderRadius: 1,
            p: 0.5,
            my: 1,
          }}
        >
          <IconButton
            size="small"
            onClick={() => setZoom((z) => Math.min(z + 10, 200))}
          >
            <ZoomIn sx={{ fontSize: 16 }} />
          </IconButton>
          <Typography variant="caption" sx={{ fontFamily: "monospace" }}>
            {zoom}%
          </Typography>
          <IconButton
            size="small"
            onClick={() => setZoom((z) => Math.max(z - 10, 50))}
          >
            <ZoomOut sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>

        <ToolBtn
          icon={<Height sx={{ fontSize: 18 }} />}
          currentTool={currentTool}
          setCurrentTool={setCurrentTool}
        />

        <Divider sx={{ width: "60%", my: 1 }} />

        {/* Page Nav */}
        <Box
          sx={{
            width: 32,
            height: 32,
            bgcolor: "grey.700",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 1,
            mb: 0.5,
            fontSize: 14,
            fontWeight: "bold",
          }}
        >
          1
        </Box>
        <Box
          sx={{
            width: 32,
            height: 32,
            bgcolor: "grey.400",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 1,
            mb: 1,
            fontSize: 14,
            fontWeight: "bold",
          }}
        >
          4
        </Box>

        <Divider sx={{ width: "60%", my: 1 }} />

        <ToolBtn
          icon={<VerticalAlignTop sx={{ fontSize: 18 }} />}
          currentTool={currentTool}
          setCurrentTool={setCurrentTool}
        />
        <ToolBtn
          icon={<VerticalAlignBottom sx={{ fontSize: 18 }} />}
          currentTool={currentTool}
          setCurrentTool={setCurrentTool}
        />
        <ToolBtn
          icon={<MenuBook sx={{ fontSize: 18 }} />}
          currentTool={currentTool}
          setCurrentTool={setCurrentTool}
        />

        <Box
          sx={{
            mt: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 1,
            pb: 1,
          }}
        >
          <ToolBtn
            icon={<RotateLeft sx={{ fontSize: 18 }} />}
            currentTool={currentTool}
            setCurrentTool={setCurrentTool}
          />
          <ToolBtn
            icon={<RotateRight sx={{ fontSize: 18 }} />}
            currentTool={currentTool}
            setCurrentTool={setCurrentTool}
          />
        </Box>
      </Paper>

      {/* Content Area */}
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          bgcolor: "grey.100",
          p: 2,
          position: "relative",
        }}
      >
        <Paper
          elevation={3}
          sx={{
            mx: "auto",
            minHeight: "100%",
            p: 4,
            width: "100%",
            maxWidth: 800,
            transform: `scale(${zoom / 100})`,
            transformOrigin: "top left",
            marginBottom: `${(zoom - 100) * 5}px`,
          }}
        >
          <div
            dangerouslySetInnerHTML={{ __html: MOCK_QUESTIONS[0].content }}
          />
        </Paper>
      </Box>

      {/* Header Bar within panel */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 48,
          right: 0,
          height: 32,
          bgcolor: "background.paper",
          borderBottom: 1,
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
        }}
      >
        <Typography variant="caption" color="text.secondary">
          第１問
        </Typography>
        <Typography variant="caption" color="text.secondary">
          0/184行 0/5,520文字 (空白含む)
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            sx={{ py: 0, px: 1, minWidth: 0, height: 24, fontSize: "10px" }}
          >
            検索
          </Button>
          <Button
            size="small"
            variant="outlined"
            sx={{ py: 0, px: 1, minWidth: 0, height: 24, fontSize: "10px" }}
          >
            置換
          </Button>
        </Box>
      </Box>
    </Box>
  );
};
