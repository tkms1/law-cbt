import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  IconButton,
  Paper,
  Typography,
  Divider,
  Button,
  Menu,
  MenuItem,
  Popover,
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
  Delete,
  Circle,
} from "@mui/icons-material";
import { MOCK_QUESTIONS } from "../../constants";
import { ToolMode } from "../../types";

interface QuestionPanelProps {
  width: number;
}

interface ToolBtnProps {
  tool?: ToolMode;
  icon: React.ReactNode;
  color?: string;
  currentTool: ToolMode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const ToolBtn: React.FC<ToolBtnProps> = ({
  tool,
  icon,
  color,
  currentTool,
  onClick,
}) => (
  <IconButton
    size="small"
    onClick={onClick}
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

const MARKER_COLORS = [
  {
    name: "yellow",
    label: "黄",
    value: "rgba(255, 255, 0, 0.4)",
    code: "#facc15",
  },
  {
    name: "orange",
    label: "橙",
    value: "rgba(251, 146, 60, 0.4)",
    code: "#f97316",
  },
  {
    name: "green",
    label: "緑",
    value: "rgba(74, 222, 128, 0.4)",
    code: "#22c55e",
  },
  {
    name: "blue",
    label: "青",
    value: "rgba(96, 165, 250, 0.4)",
    code: "#3b82f6",
  },
  {
    name: "red",
    label: "赤",
    value: "rgba(248, 113, 113, 0.4)",
    code: "#ef4444",
  },
];

export const QuestionPanel: React.FC<QuestionPanelProps> = ({ width }) => {
  const [zoom, setZoom] = useState(100);
  const [currentTool, setCurrentTool] = useState<ToolMode>(ToolMode.SELECT);
  const [content, setContent] = useState(MOCK_QUESTIONS[0].content);

  // Marker State
  const [markerColor, setMarkerColor] = useState(MARKER_COLORS[0].value);
  const [colorMenuAnchor, setColorMenuAnchor] = useState<null | HTMLElement>(
    null
  );

  // Marker Edit/Delete State
  const [selectedMarkerElement, setSelectedMarkerElement] =
    useState<HTMLElement | null>(null);
  const [markerPopoverAnchor, setMarkerPopoverAnchor] =
    useState<null | HTMLElement>(null);

  const contentRef = useRef<HTMLDivElement>(null);

  const handleToolClick = (
    tool: ToolMode,
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    if (tool === ToolMode.MARKER && currentTool === ToolMode.MARKER) {
      // If clicking marker again, open color menu
      setColorMenuAnchor(event.currentTarget);
    } else {
      setCurrentTool(tool);
    }
  };

  const handleColorSelect = (colorValue: string) => {
    setMarkerColor(colorValue);
    setColorMenuAnchor(null);
  };

  const handleMouseUp = () => {
    if (currentTool !== ToolMode.MARKER) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed)
      return;

    const range = selection.getRangeAt(0);
    const container = contentRef.current;

    // Ensure selection is within the content area
    if (!container || !container.contains(range.commonAncestorContainer))
      return;

    try {
      // Create highlight span
      const span = document.createElement("span");
      span.style.backgroundColor = markerColor;
      span.setAttribute("data-marker", "true");
      span.style.cursor = "pointer";

      // Surround contents
      range.surroundContents(span);
      selection.removeAllRanges();

      // Update internal state content
      setContent(container.innerHTML);
    } catch (e) {
      console.warn(
        "Could not highlight selection. Selection might cross block boundaries."
      );
      // In a real app, complex range handling would be needed here.
    }
  };

  const handleContentClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    // Check if clicked element is a marker
    if (
      target.tagName === "SPAN" &&
      target.getAttribute("data-marker") === "true"
    ) {
      // Open popover to delete/edit
      setSelectedMarkerElement(target);
      setMarkerPopoverAnchor(target);
      e.stopPropagation();
    }
  };

  const handleDeleteMarker = () => {
    if (selectedMarkerElement && contentRef.current) {
      const parent = selectedMarkerElement.parentNode;
      if (parent) {
        // Unwrap the span
        while (selectedMarkerElement.firstChild) {
          parent.insertBefore(
            selectedMarkerElement.firstChild,
            selectedMarkerElement
          );
        }
        parent.removeChild(selectedMarkerElement);

        // Update state
        setContent(contentRef.current.innerHTML);
      }
    }
    setMarkerPopoverAnchor(null);
    setSelectedMarkerElement(null);
  };

  // Determine active marker color for icon display
  const activeColorObj =
    MARKER_COLORS.find((c) => c.value === markerColor) || MARKER_COLORS[0];

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        bgcolor: "background.default",
        borderRight: 1,
        borderColor: "divider",
        position: "relative",
      }}
    >
      {/* Header Info Bar */}
      <Box
        sx={{
          bgcolor: "background.paper",
          borderBottom: 1,
          borderColor: "divider",
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 1,
          flexShrink: 0,
        }}
      >
        <Typography variant="caption" sx={{ fontWeight: "bold" }}>
          第１問
        </Typography>
        <Typography variant="caption" color="text.secondary">
          0/184行 0/5,520文字 (空白含む)
        </Typography>
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <Button
            size="small"
            variant="outlined"
            sx={{
              px: 1,
              py: 0,
              minWidth: 0,
              height: 24,
              fontSize: "10px",
              borderColor: "grey.300",
              color: "text.primary",
            }}
          >
            検索
          </Button>
          <Button
            size="small"
            variant="outlined"
            sx={{
              px: 1,
              py: 0,
              minWidth: 0,
              height: 24,
              fontSize: "10px",
              borderColor: "grey.300",
              color: "text.primary",
            }}
          >
            置換
          </Button>
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          flex: 1,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Left Vertical Toolbar */}
        <Paper
          elevation={0}
          sx={{
            width: 40,
            bgcolor: "grey.50",
            borderRight: 1,
            borderColor: "divider",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            py: 1,
            overflowY: "auto",
            flexShrink: 0,
            zIndex: 10,
          }}
        >
          <ToolBtn
            tool={ToolMode.SELECT}
            icon={<NearMe sx={{ fontSize: 18 }} />}
            currentTool={currentTool}
            onClick={(e) => handleToolClick(ToolMode.SELECT, e)}
          />
          <ToolBtn
            tool={ToolMode.HAND}
            icon={<PanTool sx={{ fontSize: 18 }} />}
            currentTool={currentTool}
            onClick={(e) => handleToolClick(ToolMode.HAND, e)}
          />

          <Divider sx={{ width: "60%", my: 0.5 }} />

          {/* Marker Tool with Dynamic Color Icon */}
          <ToolBtn
            tool={ToolMode.MARKER}
            icon={
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  bgcolor: activeColorObj.code,
                  borderRadius: "2px",
                  transform: "rotate(-45deg)",
                  border: "1px solid rgba(0,0,0,0.1)",
                }}
              />
            }
            currentTool={currentTool}
            onClick={(e) => handleToolClick(ToolMode.MARKER, e)}
          />

          <ToolBtn
            tool={ToolMode.PEN}
            icon={<Create sx={{ fontSize: 18 }} />}
            currentTool={currentTool}
            onClick={(e) => handleToolClick(ToolMode.PEN, e)}
          />
          <ToolBtn
            tool={ToolMode.TEXT}
            icon={<TextFields sx={{ fontSize: 18 }} />}
            currentTool={currentTool}
            onClick={(e) => handleToolClick(ToolMode.TEXT, e)}
          />
          <ToolBtn
            tool={ToolMode.SHAPE}
            icon={<Category sx={{ fontSize: 18 }} />}
            currentTool={currentTool}
            onClick={(e) => handleToolClick(ToolMode.SHAPE, e)}
          />

          <Divider sx={{ width: "60%", my: 0.5 }} />

          <ToolBtn
            icon={<FormatListBulleted sx={{ fontSize: 18 }} />}
            currentTool={currentTool}
            onClick={() => {}}
          />

          <Box
            sx={{
              bgcolor: "grey.200",
              borderRadius: 1,
              p: 0.5,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              my: 0.5,
            }}
          >
            <IconButton
              size="small"
              onClick={() => setZoom((z) => Math.min(z + 10, 200))}
              sx={{ p: 0.5 }}
            >
              <ZoomIn sx={{ fontSize: 16 }} />
            </IconButton>
            <Typography variant="caption" sx={{ fontSize: "9px" }}>
              {zoom}%
            </Typography>
            <IconButton
              size="small"
              onClick={() => setZoom((z) => Math.max(z - 10, 50))}
              sx={{ p: 0.5 }}
            >
              <ZoomOut sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>

          <ToolBtn
            icon={<Height sx={{ fontSize: 18 }} />}
            currentTool={currentTool}
            onClick={() => {}}
          />

          <Divider sx={{ width: "60%", my: 0.5 }} />

          {/* Pagination */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 0.5,
              mb: 1,
            }}
          >
            <Box
              sx={{
                width: 24,
                height: 24,
                bgcolor: "grey.700",
                color: "white",
                borderRadius: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                fontWeight: "bold",
              }}
            >
              1
            </Box>
            <Box
              sx={{
                width: 24,
                height: 24,
                bgcolor: "grey.400",
                color: "white",
                borderRadius: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                fontWeight: "bold",
              }}
            >
              4
            </Box>
          </Box>

          <Divider sx={{ width: "60%", my: 0.5 }} />

          <ToolBtn
            icon={<VerticalAlignTop sx={{ fontSize: 18 }} />}
            currentTool={currentTool}
            onClick={() => {}}
          />
          <ToolBtn
            icon={<VerticalAlignBottom sx={{ fontSize: 18 }} />}
            currentTool={currentTool}
            onClick={() => {}}
          />
          <ToolBtn
            icon={<MenuBook sx={{ fontSize: 18 }} />}
            currentTool={currentTool}
            onClick={() => {}}
          />

          <Box
            sx={{ mt: "auto", pb: 1, display: "flex", flexDirection: "column" }}
          >
            <ToolBtn
              icon={<RotateLeft sx={{ fontSize: 18 }} />}
              currentTool={currentTool}
              onClick={() => {}}
            />
            <ToolBtn
              icon={<RotateRight sx={{ fontSize: 18 }} />}
              currentTool={currentTool}
              onClick={() => {}}
            />
          </Box>
        </Paper>

        {/* Content Area */}
        <Box
          sx={{
            flex: 1,
            overflow: "auto",
            bgcolor: "grey.200",
            p: 3,
            position: "relative",
            cursor: currentTool === ToolMode.MARKER ? "text" : "default",
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
              marginBottom: `${(zoom - 100) * 8}px`,
              // Ensure spans created by highlighter are visible
              "& .marker-highlight": {
                mixBlendMode: "multiply",
              },
            }}
            ref={contentRef}
            onMouseUp={handleMouseUp}
            onClick={handleContentClick}
          >
            <div dangerouslySetInnerHTML={{ __html: content }} />
          </Paper>
        </Box>
      </Box>

      {/* Color Selection Menu */}
      <Menu
        anchorEl={colorMenuAnchor}
        open={Boolean(colorMenuAnchor)}
        onClose={() => setColorMenuAnchor(null)}
        anchorOrigin={{
          vertical: "center",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "center",
          horizontal: "left",
        }}
      >
        {MARKER_COLORS.map((c) => (
          <MenuItem
            key={c.name}
            onClick={() => handleColorSelect(c.value)}
            sx={{ py: 1, px: 2, gap: 1 }}
            selected={markerColor === c.value}
          >
            <Circle sx={{ color: c.code, fontSize: 16 }} />
            <Typography variant="body2">{c.label}</Typography>
          </MenuItem>
        ))}
      </Menu>

      {/* Marker Edit Popover */}
      <Popover
        open={Boolean(markerPopoverAnchor)}
        anchorEl={markerPopoverAnchor}
        onClose={() => setMarkerPopoverAnchor(null)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <Box sx={{ p: 1, display: "flex", gap: 1 }}>
          <Button
            size="small"
            color="error"
            startIcon={<Delete fontSize="small" />}
            onClick={handleDeleteMarker}
          >
            削除
          </Button>
          {/* We could add color changing here too if needed */}
        </Box>
      </Popover>
    </Box>
  );
};
