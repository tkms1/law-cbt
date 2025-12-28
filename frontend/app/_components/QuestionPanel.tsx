// QuestionPanel.tsx
import React, {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import {
  NearMe,
  PanTool,
  Create,
  TextFields,
  Category,
  ZoomIn,
  ZoomOut,
  Delete,
  Circle,
  UploadFile,
  FormatListBulleted,
  Height,
  CloudUpload,
} from "@mui/icons-material";
import { ToolMode } from "../../type/type";
import type { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist";

// --- 型定義 ---
interface RenderTask {
  promise: Promise<void>;
  cancel(): void;
}

interface PdfTextItem {
  str: string;
  transform: number[];
  width: number;
  height: number;
  dir: string;
}

function isPdfTextItem(item: unknown): item is PdfTextItem {
  if (typeof item !== "object" || item === null) return false;
  const candidate = item as { str?: unknown; transform?: unknown };
  return (
    typeof candidate.str === "string" && Array.isArray(candidate.transform)
  );
}

interface QuestionPanelProps {
  width: number;
  onPdfLoaded?: () => void;
  // ▼ 追加: 初期表示用のPDFデータと、変更通知用のコールバック
  initialPdfData?: ArrayBuffer | null;
  onPdfChange?: (data: ArrayBuffer) => void;
}

export interface QuestionPanelRef {
  getPdfData: () => ArrayBuffer | null;
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

// --- PdfPageコンポーネント ---
const PdfPage = React.memo(
  ({ page, scale }: { page: PDFPageProxy; scale: number }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [textItems, setTextItems] = useState<PdfTextItem[]>([]);
    const [viewportHeight, setViewportHeight] = useState(0);
    const renderTaskRef = useRef<RenderTask | null>(null);

    useEffect(() => {
      const renderPage = async () => {
        const viewport = page.getViewport({ scale });
        setViewportHeight(viewport.height);
        const canvas = canvasRef.current;
        if (canvas) {
          const context = canvas.getContext("2d");
          if (context) {
            const outputScale = window.devicePixelRatio || 1;
            canvas.width = Math.floor(viewport.width * outputScale);
            canvas.height = Math.floor(viewport.height * outputScale);
            canvas.style.width = `${Math.floor(viewport.width)}px`;
            canvas.style.height = `${Math.floor(viewport.height)}px`;
            const transform =
              outputScale !== 1
                ? [outputScale, 0, 0, outputScale, 0, 0]
                : undefined;
            if (renderTaskRef.current) renderTaskRef.current.cancel();
            const renderContext = {
              canvasContext: context,
              canvas: canvas,
              viewport: viewport,
              transform: transform,
            };
            renderTaskRef.current = page.render(renderContext);
            try {
              await renderTaskRef.current.promise;
            } catch (e) {
              /* キャンセル時は無視 */
            }
          }
        }
        try {
          const textContent = await page.getTextContent();
          const items = textContent.items.filter(
            (item) => isPdfTextItem(item) && item.str.trim().length > 0
          ) as PdfTextItem[];
          setTextItems(items);
        } catch (e) {
          console.error(e);
        }
      };
      renderPage();
      return () => {
        if (renderTaskRef.current) renderTaskRef.current.cancel();
      };
    }, [page, scale]);

    return (
      <div
        className="pdf-page-container"
        style={{
          position: "relative",
          marginBottom: "20px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
          backgroundColor: "white",
          width: "fit-content",
          margin: "0 auto 40px auto",
        }}
      >
        <canvas ref={canvasRef} style={{ display: "block" }} />
        <div
          className="textLayer"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            overflow: "hidden",
            lineHeight: "1.0",
            zIndex: 1,
          }}
        >
          {textItems.map((item, index) => {
            const tx = item.transform;
            const left = tx[4] * scale;
            const fontSize = Math.sqrt(tx[0] * tx[0] + tx[1] * tx[1]) * scale;
            const top = viewportHeight - tx[5] * scale - fontSize * 0.8;
            return (
              <span
                key={index}
                style={{
                  position: "absolute",
                  left: `${left}px`,
                  top: `${top}px`,
                  fontSize: `${fontSize}px`,
                  fontFamily: "sans-serif",
                  transform: `scaleX(${1})`,
                  whiteSpace: "pre",
                  cursor: "text",
                  color: "transparent",
                }}
              >
                {item.str}
              </span>
            );
          })}
        </div>
      </div>
    );
  }
);
PdfPage.displayName = "PdfPage";

// --- QuestionPanel 本体 ---

export const QuestionPanel = forwardRef<QuestionPanelRef, QuestionPanelProps>(
  ({ width, onPdfLoaded, initialPdfData, onPdfChange }, ref) => {
    const [zoom, setZoom] = useState(100);
    const [currentTool, setCurrentTool] = useState<ToolMode>(ToolMode.SELECT);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [pdfDocument, setPdfDocument] = useState<PDFDocumentProxy | null>(
      null
    );
    const [pages, setPages] = useState<PDFPageProxy[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingFile, setPendingFile] = useState<File | null>(null);

    const [rawPdfData, setRawPdfData] = useState<ArrayBuffer | null>(null);

    const [markerColor, setMarkerColor] = useState(MARKER_COLORS[0].value);
    const [colorMenuAnchor, setColorMenuAnchor] = useState<null | HTMLElement>(
      null
    );
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [selectedMarkerElement, setSelectedMarkerElement] =
      useState<HTMLElement | null>(null);
    const [markerPopoverAnchor, setMarkerPopoverAnchor] =
      useState<null | HTMLElement>(null);
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    // ★追加: 読み込み済みフラグ（無限ループ防止）
    const loadedInitialRef = useRef(false);

    useEffect(() => {
      const styleId = "pdf-text-layer-style";
      if (!document.getElementById(styleId)) {
        const style = document.createElement("style");
        style.id = styleId;
        style.innerHTML = `.textLayer ::selection { background: rgba(0, 0, 255, 0.2); color: transparent; } .marker-highlight { mix-blend-mode: multiply; cursor: pointer; }`;
        document.head.appendChild(style);
      }
    }, []);

    useImperativeHandle(ref, () => ({
      getPdfData: () => rawPdfData,
    }));

    // --- 共通: バッファからPDFをロードする処理 ---
    const loadPdfFromBuffer = async (arrayBuffer: ArrayBuffer) => {
      setIsLoading(true);
      setPages([]);
      setPdfDocument(null);
      // ここで rawPdfData をセット
      setRawPdfData(arrayBuffer);

      try {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

        // PDF.js は転送時にバッファを使用不能にすることがあるためコピーを使う
        const loadingTask = pdfjsLib.getDocument({
          data: arrayBuffer.slice(0),
          cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/cmaps/`,
          cMapPacked: true,
        });

        const pdf = await loadingTask.promise;
        setPdfDocument(pdf);
        const loadedPages: PDFPageProxy[] = [];
        for (let i = 1; i <= pdf.numPages; i++)
          loadedPages.push(await pdf.getPage(i));
        setPages(loadedPages);
        if (onPdfLoaded) onPdfLoaded();
      } catch (error) {
        console.error("PDF Load Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // --- ★追加: 初期データ(復元データ)の読み込み監視 ---
    useEffect(() => {
      if (initialPdfData && !loadedInitialRef.current && !rawPdfData) {
        loadedInitialRef.current = true;
        loadPdfFromBuffer(initialPdfData);
      }
    }, [initialPdfData, rawPdfData]);

    // --- ファイル操作関連 ---
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      if (file.type !== "application/pdf") {
        alert("PDF only");
        return;
      }
      setPendingFile(file);
      setConfirmOpen(true);
      event.target.value = "";
    };

    const processPdfFile = async () => {
      if (!pendingFile) return;
      setConfirmOpen(false);

      try {
        const arrayBuffer = await pendingFile.arrayBuffer();

        // 親コンポーネントへ通知 (IndexedDB保存用)
        if (onPdfChange) {
          onPdfChange(arrayBuffer);
        }

        // 表示
        await loadPdfFromBuffer(arrayBuffer);
      } catch (error) {
        console.error(error);
        alert("Load failed");
      } finally {
        setPendingFile(null);
      }
    };

    const handleDialogClose = () => {
      setConfirmOpen(false);
      setPendingFile(null);
    };
    const triggerFileUpload = () => {
      fileInputRef.current?.click();
    };

    // --- ツール・マーカー関連 ---
    const handleToolClick = (
      tool: ToolMode,
      event: React.MouseEvent<HTMLButtonElement>
    ) => {
      if (tool === ToolMode.MARKER && currentTool === ToolMode.MARKER)
        setColorMenuAnchor(event.currentTarget);
      else setCurrentTool(tool);
    };
    const handleColorSelect = (colorValue: string) => {
      setMarkerColor(colorValue);
      setColorMenuAnchor(null);
    };

    const handleContentClick = (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        (target.tagName === "SPAN" &&
          target.getAttribute("data-marker") === "true") ||
        target.closest('[data-marker="true"]')
      ) {
        const el = target.closest('[data-marker="true"]') as HTMLElement;
        setSelectedMarkerElement(el);
        setMarkerPopoverAnchor(el);
        setSelectedGroupId(el.getAttribute("data-group-id"));
        e.stopPropagation();
      }
    };

    const handleDeleteMarker = () => {
      if (containerRef.current && selectedGroupId) {
        const markers = containerRef.current.querySelectorAll(
          `span[data-group-id="${selectedGroupId}"]`
        );
        markers.forEach((marker) => {
          const parent = marker.parentNode;
          if (parent) {
            while (marker.firstChild)
              parent.insertBefore(marker.firstChild, marker);
            parent.removeChild(marker);
          }
        });
      }
      setMarkerPopoverAnchor(null);
      setSelectedMarkerElement(null);
      setSelectedGroupId(null);
    };

    const activeColorObj =
      MARKER_COLORS.find((c) => c.value === markerColor) || MARKER_COLORS[0];

    const handlePreventCopy = (e: React.ClipboardEvent | React.UIEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "c" || e.key === "x")) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    // --- ドラッグ＆ドロップ ---
    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer.types && e.dataTransfer.types.includes("Files")) {
        setIsDragging(true);
      }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = "copy";
      if (!isDragging) setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.currentTarget.contains(e.relatedTarget as Node)) {
        return;
      }
      setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const file = e.dataTransfer.files?.[0];
      if (!file) return;

      if (file.type !== "application/pdf") {
        alert("PDFファイルのみ読み込めます");
        return;
      }
      setPendingFile(file);
      setConfirmOpen(true);
    };

    const handleMouseUp = () => {
      // マーカー処理（省略）
    };

    return (
      <Box
        onCopy={handlePreventCopy}
        onCut={handlePreventCopy}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          width: "100%",
          bgcolor: "background.default",
          borderRight: 1,
          borderColor: "divider",
          position: "relative",
          outline: "none",
        }}
      >
        {isDragging && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 9999,
              bgcolor: "rgba(25, 118, 210, 0.15)",
              backdropFilter: "blur(4px)",
              border: "3px dashed #1976d2",
              m: 1,
              borderRadius: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            <CloudUpload sx={{ fontSize: 80, color: "#1976d2", mb: 2 }} />
            <Typography variant="h4" color="primary" fontWeight="bold">
              PDFをここにドロップ
            </Typography>
          </Box>
        )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          style={{ display: "none" }}
          accept="application/pdf"
        />

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
            {isLoading ? "読み込み中..." : "第１問"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            PDFモード (Canvas)
          </Typography>
          <Box sx={{ display: "flex", gap: 0.5 }}>
            <Button
              size="small"
              variant="contained"
              startIcon={<UploadFile />}
              onClick={triggerFileUpload}
              disabled={isLoading}
              sx={{ px: 1, py: 0, minWidth: 0, height: 24, fontSize: "10px" }}
            >
              PDF読込
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
                onClick={() => setZoom((z) => Math.min(z + 20, 300))}
                sx={{ p: 0.5 }}
              >
                <ZoomIn sx={{ fontSize: 16 }} />
              </IconButton>
              <Typography variant="caption" sx={{ fontSize: "9px" }}>
                {Math.round(zoom)}%
              </Typography>
              <IconButton
                size="small"
                onClick={() => setZoom((z) => Math.max(z - 20, 50))}
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
          </Paper>

          <Box
            sx={{
              flex: 1,
              overflow: "auto",
              bgcolor: "grey.200",
              p: 3,
              position: "relative",
              cursor: currentTool === ToolMode.MARKER ? "text" : "default",
              display: pages.length === 0 ? "flex" : "block",
              alignItems: "center",
              justifyContent: "center",
            }}
            onMouseUp={handleMouseUp}
          >
            <div
              ref={containerRef}
              onClick={handleContentClick}
              style={{
                width: pages.length === 0 ? "100%" : "auto",
              }}
            >
              {pages.length > 0 ? (
                pages.map((page, index) => (
                  <PdfPage key={index} page={page} scale={zoom / 100} />
                ))
              ) : (
                <Box
                  sx={{
                    maxWidth: 500,
                    mx: "auto",
                    textAlign: "center",
                    p: 4,
                    border: "2px dashed #bdbdbd",
                    borderRadius: 2,
                    bgcolor: "white",
                    color: "text.secondary",
                    cursor: "pointer",
                    "&:hover": {
                      bgcolor: "#f5f5f5",
                      borderColor: "#1976d2",
                    },
                  }}
                  onClick={triggerFileUpload}
                >
                  <CloudUpload
                    sx={{ fontSize: 48, mb: 1, color: "action.active" }}
                  />
                  <Typography variant="h6" gutterBottom>
                    PDFを読み込む
                  </Typography>
                  <Typography variant="body2">
                    ボタンをクリックするか、
                    <br />
                    PDFをここにドラッグ＆ドロップしてください。
                  </Typography>
                </Box>
              )}
            </div>
          </Box>
        </Box>

        <Menu
          anchorEl={colorMenuAnchor}
          open={Boolean(colorMenuAnchor)}
          onClose={() => setColorMenuAnchor(null)}
          anchorOrigin={{ vertical: "center", horizontal: "right" }}
          transformOrigin={{ vertical: "center", horizontal: "left" }}
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
        <Popover
          open={Boolean(markerPopoverAnchor)}
          anchorEl={markerPopoverAnchor}
          onClose={() => setMarkerPopoverAnchor(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          transformOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Box sx={{ p: 1 }}>
            <Button
              size="small"
              color="error"
              startIcon={<Delete fontSize="small" />}
              onClick={handleDeleteMarker}
            >
              削除
            </Button>
          </Box>
        </Popover>
        <Dialog open={confirmOpen} onClose={handleDialogClose}>
          <DialogTitle>PDFの読み込み確認</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {pendingFile && `「${pendingFile.name}」を読み込んで試験を開始しますか？`}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose} color="inherit">
              キャンセル
            </Button>
            <Button onClick={processPdfFile} autoFocus variant="contained">
              読み込む
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }
);
QuestionPanel.displayName = "QuestionPanel";
