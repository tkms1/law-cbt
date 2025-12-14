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

// --- ユーティリティ (変更なし) ---
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

export const LawPanel: React.FC = () => {
  // --- 幅管理用 ---
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [isResizing, setIsResizing] = useState(false); // リサイズ中かどうかのフラグ
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

  // --- リサイズ機能の実装 (修正版) ---
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // 親要素への伝播を防ぐ
    setIsResizing(true);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!containerRef.current) return;

    // コンテナ（LawPanel全体）の左端の位置を取得
    const rect = containerRef.current.getBoundingClientRect();

    // マウスのX座標 - コンテナの左端 = サイドバーの幅
    const relativeX = e.clientX - rect.left;

    // 最小幅 150px, 最大幅 600px に制限
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
        const res = await fetch(
          `https://law-cbt.vercel.app/api?lawId=${lawId}`
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
      if (targetElement instanceof HTMLElement) {
        // (省略: ハイライト処理)
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleJumpToArticle();
  };

  return (
    <Box
      ref={containerRef} // ここにRefを設定して座標計算の基準にする
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        bgcolor: "background.paper",
        borderRight: 1,
        borderColor: "divider",
      }}
    >
      {/* Top Search Bar */}
      <Box
        sx={{
          height: 44,
          bgcolor: "grey.100",
          borderBottom: 1,
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        {/* 左側：目次検索エリア */}
        <Box
          sx={{
            // リサイズ中はtransitionを切ってスムーズにする
            width: showToc ? sidebarWidth : "auto",
            transition: isResizing ? "none" : "width 0.2s",
            display: "flex",
            alignItems: "center",
            height: "100%",
            borderRight: 1,
            borderColor: "divider",
            px: 1,
            boxSizing: "border-box",
            overflow: "hidden", // 幅が狭まったときの中身の制御
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
                    <Search sx={{ fontSize: 16 }} />
                  </InputAdornment>
                ),
                sx: { height: 32, fontSize: 13, bgcolor: "white" },
              }}
              sx={{ flex: 1, mr: 1, minWidth: 0 }} // minWidth: 0 で縮小時に崩れないように
            />
          )}

          <IconButton
            size="small"
            onClick={() => setShowToc(!showToc)}
            sx={{
              border: 1,
              borderColor: "divider",
              bgcolor: "white",
              borderRadius: 1,
              width: 32,
              height: 32,
              flexShrink: 0,
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
          {/* (以前と同じ中身) */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Typography
              variant="caption"
              sx={{ fontWeight: "bold", color: "text.secondary", mr: 0.5 }}
            >
              条文
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                bgcolor: "white",
                border: 1,
                borderColor: "divider",
                borderRadius: 1,
                px: 1,
                height: 32,
              }}
            >
              <Typography variant="caption" color="text.secondary">
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
                  borderBottom: "1px solid #ddd",
                  outline: "none",
                  fontSize: 12,
                  margin: "0 4px",
                }}
              />
              <Typography variant="caption" color="text.secondary">
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
                  borderBottom: "1px solid #ddd",
                  outline: "none",
                  fontSize: 12,
                  margin: "0 4px",
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
              // リサイズ中はカクつき防止のためにtransitionを無効化
              transition: isResizing ? "none" : "width 0.2s",
              bgcolor: "grey.50",
              overflowY: "auto",
              flexShrink: 0,
            }}
          >
            <List dense disablePadding>
              {/* アコーディオンの中身（変更なし） */}
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
                        bgcolor: "grey.200",
                        borderBottom: 1,
                        borderColor: "divider",
                        "&:hover": { bgcolor: "grey.300" },
                      }}
                    >
                      {isOpen ? (
                        <ExpandLess
                          sx={{ fontSize: 16, mr: 1, color: "text.secondary" }}
                        />
                      ) : (
                        <ExpandMore
                          sx={{ fontSize: 16, mr: 1, color: "text.secondary" }}
                        />
                      )}
                      <ListItemText
                        primary={category.summary}
                        primaryTypographyProps={{
                          fontSize: 12,
                          fontWeight: "bold",
                          color: "text.primary",
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
                                borderColor: "divider",
                                py: 0.8,
                                "&.Mui-selected": {
                                  bgcolor: "primary.light",
                                  color: "primary.contrastText",
                                  "&:hover": { bgcolor: "primary.main" },
                                },
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

        {/* --- リサイズハンドル (App.tsxと同じスタイル) --- */}
        {showToc && (
          <Box
            onMouseDown={handleMouseDown}
            sx={{
              width: 6, // つかみやすい幅
              cursor: "col-resize",
              bgcolor: "grey.300", // App.tsxのボーダー色に合わせる
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              transition: "background-color 0.2s",
              "&:hover": {
                bgcolor: "primary.light", // ホバー時に色を変える
              },
              flexShrink: 0,
              zIndex: 10,
              position: "relative",
            }}
          >
            {/* 中央の小さな飾り（グリップ） */}
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
            flex: 1, overflowY: "auto",
            // p: 3,
            bgcolor: "background.paper"
          }}
        >
          {/* iframeなどが来る場合にリサイズイベントを吸われないためのカバー */}
          {isResizing && (
            <Box sx={{ position: "absolute", inset: 0, zIndex: 100 }} />
          )}
          {lawData && <TopMain data={lawData} />}
        </Box>
      </Box>
    </Box>
  );
};
