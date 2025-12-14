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
  Height,
  Delete,
  Circle,
  UploadFile,
} from "@mui/icons-material";
import { MOCK_QUESTIONS } from "../../constants";
import { ToolMode } from "../../types";

// 【重要】トップレベルでの pdfjs-dist のインポートと設定は削除しました。
// これによりサーバーサイドでの実行エラー(DOMMatrix undefined)を防ぎます。

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

  // PDF読み込み状態
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const contentRef = useRef<HTMLDivElement>(null);

  // --- PDF アップロード処理 (修正版) ---
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("PDFファイルを選択してください。");
      return;
    }

    setIsLoading(true);

    try {
      // 動的インポート
      const pdfjsLib = await import("pdfjs-dist");

      // 【修正】Workerの設定
      // 1. httpsを指定
      // 2. cdnjsではなくnpmパッケージ構造と一致するunpkgを使用
      // 3. .min.js ではなく .min.mjs (ES Module) を指定
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

      const arrayBuffer = await file.arrayBuffer();

      // 日本語フォント等が含まれるPDFの文字化けを防ぐための標準フォント設定（オプション）
      const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer,
        cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/cmaps/`,
        cMapPacked: true,
      });

      const pdf = await loadingTask.promise;

      let fullHtml = "";

      // ---------------------------------------------------------
      // handleFileUpload 関数内の forループ部分を以下のように修正してください
      // ---------------------------------------------------------

      // 全ページをループしてテキストを抽出
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();

        let pageText = "";
        let lastY = -1;

        // 追加: X座標計算用の変数
        let lastX = 0;
        let lastWidth = 0;

        let lastStr = "";
        // -----------------------------------------------------------
        // テキスト抽出ループ (修正版：行間が広いPDF対応)
        // -----------------------------------------------------------

        // -----------------------------------------------------------
        // テキスト抽出ループ (修正版：見出し対応・窮屈さ解消)
        // -----------------------------------------------------------

        // -----------------------------------------------------------
        // テキスト抽出ループ (修正版：X座標計算による空白再現)
        // -----------------------------------------------------------

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        textContent.items.forEach((item: any) => {
          const str = item.str;
          const currentY = item.transform[5]; // Y座標
          const currentX = item.transform[4]; // X座標
          const fontSize = item.transform[0]; // フォントサイズ
          const itemWidth = item.width || 0; // 文字の幅

          // 最初のアイテム
          if (lastY === -1) {
            pageText += str;
          } else {
            const diffY = Math.abs(currentY - lastY);

            // --- 行が変わったかどうかの判定 ---
            const isNewLine = diffY > fontSize * 0.5;

            if (isNewLine) {
              // ... (前回までの改行ロジック) ...

              // 1. 空行判定 (閾値2.0倍)
              const hasBlankLine = diffY > fontSize * 2.0;
              // 2. 文末判定
              const isSentenceEnd = /[。！？!?\]】）〕]$/.test(lastStr.trim());
              // 3. 見出し開始判定
              const isHeaderStart = /^[〔【\[]/.test(str.trim());
              // 4. ページ番号判定
              const isPageNumber = /^- \d+ -$/.test(str.trim());

              if (isPageNumber) {
                pageText +=
                  "<br/><div style='text-align:center; font-size:0.8em;'>" +
                  str +
                  "</div>";
              } else if (hasBlankLine || isHeaderStart) {
                pageText += "<br/><br/>" + str;
              } else if (isSentenceEnd) {
                pageText += "<br/>" + str;
              } else {
                pageText += str;
              }
            } else {
              // --- 【ここが今回の修正ポイント】同じ行内での水平方向の隙間埋め ---

              // 前の文字の「右端」の座標を計算
              const endOfLastItem = lastX + lastWidth;
              // 現在の文字の「左端」との距離 (ギャップ)
              const gap = currentX - endOfLastItem;

              // ギャップが「フォントサイズの20%」より大きい場合、空白があるとみなす
              // (PDFの座標ズレを考慮して少し余裕を持たせる)
              if (gap > fontSize * 0.2) {
                // 埋めるべきスペースの数を概算 (スペース1つあたりフォントの0.4倍幅と仮定)
                const spaceCount = Math.floor(gap / (fontSize * 0.4));

                if (spaceCount > 0) {
                  // HTMLの &nbsp; (改行されないスペース) を挿入して隙間を作る
                  pageText += "&nbsp;".repeat(spaceCount);
                }
              }

              pageText += str;
            }
          }

          // 座標と文字情報を更新
          lastY = currentY;
          lastX = currentX;
          lastWidth = itemWidth;
          lastStr = str;
        });
        // -----------------------------------------------------------
        // -----------------------------------------------------------
        // -----------------------------------------------------------

        // ページごとにコンテナで囲む
        fullHtml += `
          <div class="pdf-page" style="margin-bottom: 32px; padding: 16px; background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <div style="margin-bottom: 8px; font-size: 0.8em; color: gray;">Page ${i}</div>
            <div style="line-height: 1.8; text-align: justify;">${
              pageText || "<br/>"
            }</div>
          </div>
        `;
      }

      setContent(fullHtml);
    } catch (error) {
      console.error("PDF parsing error:", error);
      alert(
        "PDFの読み込みに失敗しました。\n詳細: " +
          (error instanceof Error ? error.message : String(error))
      );
    } finally {
      setIsLoading(false);
      // Inputをリセット
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };
  // ---------------------------

  const handleToolClick = (
    tool: ToolMode,
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    if (tool === ToolMode.MARKER && currentTool === ToolMode.MARKER) {
      setColorMenuAnchor(event.currentTarget);
    } else {
      setCurrentTool(tool);
    }
  };

  const handleColorSelect = (colorValue: string) => {
    setMarkerColor(colorValue);
    setColorMenuAnchor(null);
  };

  const getTextNodesInRange = (range: Range): Text[] => {
    const textNodes: Text[] = [];
    const root = range.commonAncestorContainer;

    if (root.nodeType === Node.TEXT_NODE) {
      textNodes.push(root as Text);
      return textNodes;
    }

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => {
        if (range.intersectsNode(node)) {
          return NodeFilter.FILTER_ACCEPT;
        }
        return NodeFilter.FILTER_REJECT;
      },
    });

    let currentNode = walker.nextNode();
    while (currentNode) {
      textNodes.push(currentNode as Text);
      currentNode = walker.nextNode();
    }
    return textNodes;
  };

  const handleMouseUp = () => {
    if (currentTool !== ToolMode.MARKER) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed)
      return;

    const range = selection.getRangeAt(0);
    const container = contentRef.current;

    if (!container || !container.contains(range.commonAncestorContainer))
      return;

    try {
      const groupId = `marker-group-${Date.now()}-${Math.floor(
        Math.random() * 10000
      )}`;

      const textNodes = getTextNodesInRange(range);

      textNodes.forEach((textNode) => {
        const subRange = document.createRange();
        subRange.selectNodeContents(textNode);

        if (textNode === range.startContainer) {
          subRange.setStart(textNode, range.startOffset);
        }
        if (textNode === range.endContainer) {
          subRange.setEnd(textNode, range.endOffset);
        }

        if (!subRange.collapsed) {
          const span = document.createElement("span");
          span.style.backgroundColor = markerColor;
          span.setAttribute("data-marker", "true");
          span.setAttribute("data-group-id", groupId);
          span.style.cursor = "pointer";
          span.className = "marker-highlight";

          try {
            subRange.surroundContents(span);
          } catch (e) {
            console.warn("Skipping a node due to structure complexity");
          }
        }
      });

      selection.removeAllRanges();

      if (container) {
        setContent(container.innerHTML);
      }
    } catch (e) {
      console.warn("Highlight failed:", e);
    }
  };

  const handleContentClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.tagName === "SPAN" &&
      target.getAttribute("data-marker") === "true"
    ) {
      setSelectedMarkerElement(target);
      setMarkerPopoverAnchor(target);
      const groupId = target.getAttribute("data-group-id");
      setSelectedGroupId(groupId);
      e.stopPropagation();
    }
  };

  const handleDeleteMarker = () => {
    const container = contentRef.current;
    if (container && selectedGroupId) {
      const markers = container.querySelectorAll(
        `span[data-group-id="${selectedGroupId}"]`
      );
      markers.forEach((marker) => {
        const parent = marker.parentNode;
        if (parent) {
          while (marker.firstChild) {
            parent.insertBefore(marker.firstChild, marker);
          }
          parent.removeChild(marker);
        }
      });
      container.normalize();
      setContent(container.innerHTML);
    }
    setMarkerPopoverAnchor(null);
    setSelectedMarkerElement(null);
    setSelectedGroupId(null);
  };

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
      {/* 隠し input 要素 */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        style={{ display: "none" }}
        accept="application/pdf"
      />

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
          {isLoading ? "読み込み中..." : "第１問"}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          PDFモード
        </Typography>
        <Box sx={{ display: "flex", gap: 0.5 }}>
          {/* PDFアップロードボタン */}
          <Button
            size="small"
            variant="contained"
            startIcon={<UploadFile />}
            onClick={triggerFileUpload}
            disabled={isLoading}
            sx={{
              px: 1,
              py: 0,
              minWidth: 0,
              height: 24,
              fontSize: "10px",
            }}
          >
            PDF読込
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
            検索
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
              "& .pdf-page": {
                fontFamily: "sans-serif",
              },
              "& .marker-highlight": {
                mixBlendMode: "multiply",
              },
            }}
            onMouseUp={handleMouseUp}
            onClick={handleContentClick}
          >
            {isLoading ? (
              <Typography color="text.secondary" align="center" sx={{ mt: 4 }}>
                PDFを解析中...
              </Typography>
            ) : (
              <div
                ref={contentRef}
                dangerouslySetInnerHTML={{ __html: content }}
                style={{ outline: "none", minHeight: "100%" }}
              />
            )}
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
        </Box>
      </Popover>
    </Box>
  );
};
