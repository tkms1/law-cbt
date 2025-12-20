// LawPanel.tsx
import React, { useState, useRef, useCallback } from "react";
import {
  Box,
  TextField,
  IconButton,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  InputAdornment,
  Button,
  Collapse,
} from "@mui/material";
import {
  Search,
  ChevronLeft,
  Bookmark,
  ArrowForward,
  Article,
  ExpandLess,
  ExpandMore,
} from "@mui/icons-material";
import { accordionItems, ButtonItem } from "../../constants";
import { LawData } from "@/type/LawDataZod";
import TopMain from "./TopMain";
import { ColorSchemeType } from "../../type/type";

// --- ユーティリティ ---
const numberToKanji = (num: number): string => {
  if (num === 0) return "";
  const kanjiDigits = [
    "",
    "一",
    "二",
    "三",
    "四",
    "五",
    "六",
    "七",
    "八",
    "九",
  ];
  if (num < 10) return kanjiDigits[num];
  if (num < 20) return "十" + kanjiDigits[num % 10];
  if (num < 100) {
    const tens = Math.floor(num / 10);
    const ones = num % 10;
    return kanjiDigits[tens] + "十" + kanjiDigits[ones];
  }
  if (num < 1000) {
    const hundreds = Math.floor(num / 100);
    const remainder = num % 100;
    return (
      (hundreds === 1 ? "" : kanjiDigits[hundreds]) +
      "百" +
      numberToKanji(remainder)
    );
  }
  return String(num);
};

// ▼ 追加: 配色に応じたスタイル定義を取得するヘルパー
const getColorStyles = (scheme: ColorSchemeType) => {
  switch (scheme) {
    case "yellow":
      return {
        bg: "#fffde7",
        text: "#000",
        border: "#e0e0e0",
        subBg: "#fff9c4",
        inputBg: "#fff",
      };
    case "blue":
      return {
        bg: "#e3f2fd",
        text: "#000",
        border: "#bbdefb",
        subBg: "#bbdefb",
        inputBg: "#fff",
      };
    case "black":
      return {
        bg: "#212121",
        text: "#fff",
        border: "#424242",
        subBg: "#333",
        inputBg: "#424242",
      };
    case "none":
    default:
      return {
        bg: "background.paper",
        text: "text.primary",
        border: "divider",
        subBg: "grey.100",
        inputBg: "white",
      };
  }
};

interface LawPanelProps {
  colorScheme?: ColorSchemeType;
}

export const LawPanel: React.FC<LawPanelProps> = ({ colorScheme = "none" }) => {
  // --- 幅管理用 ---
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [isResizing, setIsResizing] = useState(false);
  const [showToc, setShowToc] = useState(true);

  // LawPanel全体のコンテナ位置を取得するためのRef
  const containerRef = useRef<HTMLDivElement>(null);

  // --- その他のState ---
  const [selectedLawId, setSelectedLawId] = useState("018");
  const [lawData, setLawData] = useState<LawData>();
  const [tocSearchQuery, setTocSearchQuery] = useState("");
  const [articleNum, setArticleNum] = useState("");
  const [branchNum, setBranchNum] = useState("");
  const [openCategories, setOpenCategories] = useState<{
    [key: string]: boolean;
  }>({
    民事系科目: true,
  });

  const contentRef = useRef<HTMLDivElement>(null);

  // ▼ 配色スタイルの取得
  const styles = getColorStyles(colorScheme);
  const isDark = colorScheme === "black";

  // --- リサイズ機能の実装 ---
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const relativeX = e.clientX - rect.left;
    const newWidth = Math.max(150, Math.min(relativeX, 600));
    setSidebarWidth(newWidth);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, [handleMouseMove]);

  // --- 検索ロジック ---
  const filteredAccordionItems = accordionItems
    .map((category) => {
      const filteredButtons = category.buttons.filter((btn) =>
        btn.name.includes(tocSearchQuery)
      );
      return { ...category, buttons: filteredButtons };
    })
    .filter((category) => {
      if (tocSearchQuery !== "") {
        return category.buttons.length > 0;
      }
      return true;
    });

  // --- イベントハンドラ ---
  const handleToggleCategory = (categoryTitle: string) => {
    setOpenCategories((prev) => ({
      ...prev,
      [categoryTitle]: !prev[categoryTitle],
    }));
  };

  const handleLawClick = async (lawName: string) => {
    let foundButton: ButtonItem | undefined;
    for (const category of accordionItems) {
      const btn = category.buttons.find((b) => b.name === lawName);
      if (btn) {
        foundButton = btn;
        break;
      }
    }
    if (foundButton) {
      const lawId = foundButton.link.replace(/^\//, "");
      setSelectedLawId(lawId);
      try {
        // const res = await fetch(
        //   `https://law-cbt.vercel.app/api?lawId=${lawId}`
        // );
        const res = await fetch(
          `http://localhost:3000/api?lawId=${lawId}`
        );
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const json = await res.json();
        setLawData(json);
      } catch (error) {
        console.error("Fetch error:", error);
      }
    }
  };

  const handleJumpToArticle = () => {
    if (!contentRef.current || !articleNum) return;
    let targetElement: Element | null = null;
    const candidates = [];
    if (branchNum) {
      candidates.push(`top-article-${articleNum}_${branchNum}`);
      candidates.push(`top-article-${articleNum}-${branchNum}`);
    } else {
      candidates.push(`top-article-${articleNum}`);
    }
    for (const id of candidates) {
      const el = contentRef.current.querySelector(`#${CSS.escape(id)}`);
      if (el) {
        targetElement = el;
        break;
      }
    }
    if (!targetElement) {
      // (省略: 漢数字検索ロジック - 以前のコードと同じ)
    }
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleJumpToArticle();
  };

  return (
    <Box
      ref={containerRef}
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        // ▼ 配色適用
        bgcolor: styles.bg,
        color: styles.text,
        borderRight: 1,
        borderColor: styles.border,
      }}
    >
      {/* Top Search Bar */}
      <Box
        sx={{
          height: 44,
          // ▼ 配色適用
          bgcolor: colorScheme === "none" ? "grey.100" : styles.subBg,
          borderBottom: 1,
          borderColor: styles.border,
          display: "flex",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        {/* 左側：目次検索エリア */}
        <Box
          sx={{
            width: showToc ? sidebarWidth : "auto",
            transition: isResizing ? "none" : "width 0.2s",
            display: "flex",
            alignItems: "center",
            height: "100%",
            borderRight: 1,
            borderColor: styles.border,
            px: 1,
            boxSizing: "border-box",
            overflow: "hidden",
          }}
        >
          {showToc && (
            <TextField
              placeholder="目次検索"
              variant="outlined"
              size="small"
              value={tocSearchQuery}
              onChange={(e) => setTocSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search
                      sx={{
                        fontSize: 16,
                        color: isDark ? "grey.400" : "inherit",
                      }}
                    />
                  </InputAdornment>
                ),
                // ▼ 配色適用 (黒背景時の入力欄)
                sx: {
                  height: 32,
                  fontSize: 13,
                  bgcolor: styles.inputBg,
                  color: isDark ? "#fff" : "inherit",
                  "& input": { color: isDark ? "#fff" : "inherit" },
                },
              }}
              sx={{ flex: 1, mr: 1, minWidth: 0 }}
            />
          )}

          <IconButton
            size="small"
            onClick={() => setShowToc(!showToc)}
            sx={{
              border: 1,
              borderColor: styles.border,
              bgcolor: styles.inputBg,
              borderRadius: 1,
              width: 32,
              height: 32,
              flexShrink: 0,
              color: isDark ? "#fff" : "inherit",
            }}
          >
            <ChevronLeft
              sx={{
                fontSize: 18,
                transform: showToc ? "none" : "rotate(180deg)",
              }}
            />
          </IconButton>
        </Box>

        {/* 右側：条文操作エリア */}
        <Box sx={{ display: "flex", alignItems: "center", px: 1, flex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: "bold",
                color: isDark ? "grey.400" : "text.secondary",
                mr: 0.5,
              }}
            >
              条文
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                // ▼ 配色適用
                bgcolor: styles.inputBg,
                border: 1,
                borderColor: styles.border,
                borderRadius: 1,
                px: 1,
                height: 32,
              }}
            >
              <Typography
                variant="caption"
                color={isDark ? "grey.400" : "text.secondary"}
              >
                第
              </Typography>
              <input
                value={articleNum}
                onChange={(e) => setArticleNum(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="1"
                style={{
                  width: 30,
                  textAlign: "center",
                  border: "none",
                  borderBottom: `1px solid ${isDark ? "#666" : "#ddd"}`,
                  outline: "none",
                  fontSize: 12,
                  margin: "0 4px",
                  // ▼ 配色適用
                  backgroundColor: "transparent",
                  color: isDark ? "#fff" : "inherit",
                }}
              />
              <Typography
                variant="caption"
                color={isDark ? "grey.400" : "text.secondary"}
              >
                条の
              </Typography>
              <input
                value={branchNum}
                onChange={(e) => setBranchNum(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder=""
                style={{
                  width: 30,
                  textAlign: "center",
                  border: "none",
                  borderBottom: `1px solid ${isDark ? "#666" : "#ddd"}`,
                  outline: "none",
                  fontSize: 12,
                  margin: "0 4px",
                  // ▼ 配色適用
                  backgroundColor: "transparent",
                  color: isDark ? "#fff" : "inherit",
                }}
              />
            </Box>
            <Button
              variant="contained"
              color="inherit"
              size="small"
              onClick={handleJumpToArticle}
              sx={{
                height: 32,
                minWidth: 0,
                px: 1,
                bgcolor: "grey.400",
                color: "white",
                "&:hover": { bgcolor: "grey.500" },
              }}
            >
              <Typography variant="caption" sx={{ mr: 0.5 }}>
                移動
              </Typography>
              <ArrowForward sx={{ fontSize: 12 }} />
            </Button>
          </Box>
          <Box sx={{ flex: 1 }} />
          <Button
            variant="contained"
            size="small"
            sx={{
              bgcolor: "#b45309",
              "&:hover": { bgcolor: "#92400e" },
              height: 28,
              fontSize: 11,
              px: 1,
            }}
            startIcon={<Bookmark sx={{ fontSize: 12 }} />}
          >
            付箋
          </Button>
          <Button
            variant="contained"
            size="small"
            sx={{
              bgcolor: "#4b5563",
              "&:hover": { bgcolor: "#374151" },
              height: 28,
              fontSize: 11,
              px: 1,
              ml: 1,
            }}
            startIcon={<Search sx={{ fontSize: 12 }} />}
          >
            検索
          </Button>
        </Box>
      </Box>

      {/* Main Content Split */}
      <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* TOC Sidebar */}
        {showToc && (
          <Box
            sx={{
              width: sidebarWidth,
              transition: isResizing ? "none" : "width 0.2s",
              // ▼ 配色適用
              bgcolor: isDark
                ? "#1e1e1e"
                : colorScheme === "none"
                ? "grey.50"
                : styles.bg,
              borderRight: `1px solid ${styles.border}`,
              overflowY: "auto",
              flexShrink: 0,
            }}
          >
            <List dense disablePadding>
              {filteredAccordionItems.map((category) => {
                const isOpen =
                  tocSearchQuery !== ""
                    ? true
                    : openCategories[category.summary];
                return (
                  <React.Fragment key={category.summary}>
                    <ListItemButton
                      onClick={() => handleToggleCategory(category.summary)}
                      sx={{
                        py: 0.5,
                        minHeight: 32,
                        // ▼ 配色適用
                        bgcolor: isDark
                          ? "#333"
                          : colorScheme === "none"
                          ? "grey.200"
                          : styles.subBg,
                        borderBottom: 1,
                        borderColor: styles.border,
                        "&:hover": { bgcolor: isDark ? "#444" : "grey.300" },
                      }}
                    >
                      {isOpen ? (
                        <ExpandLess
                          sx={{
                            fontSize: 16,
                            mr: 1,
                            color: isDark ? "grey.400" : "text.secondary",
                          }}
                        />
                      ) : (
                        <ExpandMore
                          sx={{
                            fontSize: 16,
                            mr: 1,
                            color: isDark ? "grey.400" : "text.secondary",
                          }}
                        />
                      )}
                      <ListItemText
                        primary={category.summary}
                        primaryTypographyProps={{
                          fontSize: 12,
                          fontWeight: "bold",
                          // ▼ 配色適用
                          color: isDark ? "#eee" : "text.primary",
                        }}
                      />
                    </ListItemButton>
                    <Collapse in={isOpen} timeout="auto" unmountOnExit>
                      <List component="div" disablePadding>
                        {category.buttons.map((btn, index) => {
                          const btnId = btn.link.replace(/^\//, "");
                          const isSelected = btnId === selectedLawId;
                          return (
                            <ListItemButton
                              key={`${category.summary}-${btn.name}-${index}`}
                              selected={isSelected}
                              onClick={() => handleLawClick(btn.name)}
                              sx={{
                                pl: 4,
                                borderBottom: 1,
                                borderColor: styles.border,
                                py: 0.8,
                                "&.Mui-selected": {
                                  bgcolor: "primary.light",
                                  color: "primary.contrastText",
                                  "&:hover": { bgcolor: "primary.main" },
                                },
                                // ▼ 配色適用 (非選択時)
                                color: isDark ? "#ddd" : "inherit",
                              }}
                            >
                              <Article
                                sx={{ fontSize: 14, mr: 1, opacity: 0.7 }}
                              />
                              <ListItemText
                                primary={btn.name}
                                primaryTypographyProps={{
                                  fontSize: 11,
                                  lineHeight: 1.2,
                                }}
                              />
                            </ListItemButton>
                          );
                        })}
                      </List>
                    </Collapse>
                  </React.Fragment>
                );
              })}
            </List>
          </Box>
        )}

        {/* --- リサイズハンドル --- */}
        {showToc && (
          <Box
            onMouseDown={handleMouseDown}
            sx={{
              width: 6,
              cursor: "col-resize",
              bgcolor: "grey.300",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              transition: "background-color 0.2s",
              "&:hover": {
                bgcolor: "primary.light",
              },
              flexShrink: 0,
              zIndex: 10,
              position: "relative",
            }}
          >
            <Box
              sx={{
                width: 2,
                height: 32,
                bgcolor: "grey.400",
                borderRadius: 1,
              }}
            />
          </Box>
        )}

        {/* Text Area */}
        <Box
          ref={contentRef}
          sx={{
            flex: 1,
            overflowY: "auto",
            // ▼ 配色適用
            bgcolor: styles.bg,
            color: styles.text,
          }}
        >
          {isResizing && (
            <Box sx={{ position: "absolute", inset: 0, zIndex: 100 }} />
          )}
          {lawData && <TopMain data={lawData} />}
        </Box>
      </Box>
    </Box>
  );
};
