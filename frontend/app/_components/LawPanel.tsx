import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
} from "react";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ListItem,
  Divider,
  Chip,
} from "@mui/material";
import {
  Search,
  ChevronLeft,
  Bookmark,
  ArrowForward,
  Article,
  ExpandLess,
  ExpandMore,
  StickyNote2,
  Close,
} from "@mui/icons-material";
import { accordionItems, ButtonItem } from "../../constants";
import { LawData } from "@/type/LawDataZod";
import TopMain from "./TopMain";
import { ColorSchemeType } from "../../type/type";

// --- 型定義 ---
interface StickyNote {
  id: string; // DOM ID (例: Article-12-Paragraph-1-Item-1)
  lawId: string; // 法令ID (例: 018)
  lawName: string; // 法令名 (例: 民法)
  label: string; // 表示ラベル (例: 第12条 第1項 第1号)
  text: string; // テキストの保存データ
  createdAt: number; // ソート用
}

// --- 定数定義 ---
const STORAGE_KEY_STICKY = "cbt_sticky_notes";
const STORAGE_KEY_LAST_LAW_ID = "cbt_last_law_id";
const STORAGE_KEY_LAST_LAW_NAME = "cbt_last_law_name";

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

// 付箋IDから表示用ラベルを解析するヘルパー
const parseStickyLabel = (id: string): string => {
  // 1. 見出し (Caption)
  const captionMatch = id.match(/^Article-(.+?)-Caption$/);
  if (captionMatch) {
    return `第${captionMatch[1]}条 (見出し)`;
  }

  // 2. 号 (Item)
  const itemMatch = id.match(/^Article-(.+?)-Paragraph-(.+?)-Item-(.+?)$/);
  if (itemMatch) {
    return `第${itemMatch[1]}条 第${itemMatch[2]}項 第${itemMatch[3]}号`;
  }

  // 3. 項 (Paragraph)
  const paragraphMatch = id.match(/^Article-(.+?)-Paragraph-(.+?)$/);
  if (paragraphMatch)
    return `第${paragraphMatch[1]}条 第${paragraphMatch[2]}項`;

  // 4. 条文タイトル (Article)
  const articleMatch = id.match(/^Article-(.+?)$/);
  if (articleMatch) return `第${articleMatch[1]}条`;

  // 5. 附則 (SupplProvision)
  const supplMatch = id.match(/^(.+?)-Paragraph-(.+?)$/);
  if (supplMatch) return `附則(${supplMatch[1]}) 第${supplMatch[2]}項`;

  return id;
};

// DOM IDの生成ロジック（スクロール先特定用）
const getDomIdFromStickyId = (id: string): string => {
  // 1. 見出し
  const captionMatch = id.match(/^Article-(.+?)-Caption$/);
  if (captionMatch) {
    return `top-article-${captionMatch[1]}-caption`;
  }

  // 2. 号 (Item)
  const itemMatch = id.match(/^Article-(.+?)-Paragraph-(.+?)-Item-(.+?)$/);
  if (itemMatch) {
    return `${itemMatch[1]}-paragraph-${itemMatch[2]}-item-${itemMatch[3]}`;
  }

  // 3. 項
  const paragraphMatch = id.match(/^Article-(.+?)-Paragraph-(.+?)$/);
  if (paragraphMatch)
    return `${paragraphMatch[1]}-paragraph-${paragraphMatch[2]}`;

  // 4. 条文タイトル
  const articleMatch = id.match(/^Article-(.+?)$/);
  if (articleMatch) return `top-article-${articleMatch[1]}`;

  // 5. 附則
  const supplMatch = id.match(/^(.+?)-Paragraph-(.+?)$/);
  if (supplMatch) return `${supplMatch[1]}-paragraph-${supplMatch[2]}`;

  return "";
};

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
  isExamActive?: boolean;
}

export const LawPanel: React.FC<LawPanelProps> = ({
  colorScheme = "none",
  isExamActive = false,
}) => {
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [isResizing, setIsResizing] = useState(false);
  const [showToc, setShowToc] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // ★ 修正1: useStateの初期値でlocalStorageから読み込む
  const [selectedLawId, setSelectedLawId] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(STORAGE_KEY_LAST_LAW_ID) || "018";
    }
    return "018";
  });

  const [selectedLawName, setSelectedLawName] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(STORAGE_KEY_LAST_LAW_NAME) || "民法";
    }
    return "民法";
  });

  const [lawData, setLawData] = useState<LawData>();
  const [tocSearchQuery, setTocSearchQuery] = useState("");
  const [articleNum, setArticleNum] = useState("");
  const [branchNum, setBranchNum] = useState("");

  const [openCategories, setOpenCategories] = useState<{
    [key: string]: boolean;
  }>({
    民事系科目: true,
  });

  // 付箋データ
  const [stickyNotes, setStickyNotes] = useState<StickyNote[]>([]);
  // ロード完了フラグ
  const [isStickyLoaded, setIsStickyLoaded] = useState(false);

  const [isStickyListOpen, setIsStickyListOpen] = useState(false);

  // スクロール待機用ID
  const [pendingScrollId, setPendingScrollId] = useState<string | null>(null);

  const styles = getColorStyles(colorScheme);
  const isDark = colorScheme === "black";

  // ★ 修正2: 法令データ取得関数を useCallback で定義 (useEffectで呼ぶため)
  const fetchLawData = useCallback(async (lawId: string) => {
    setLawData(undefined); // ローディング状態を作るために一旦クリア
    try {
      // const res = await fetch(`https://law-cbt.vercel.app/api?lawId=${lawId}`);
      // const res = await fetch(
      //   `https://ghdadlyzbc.execute-api.ap-northeast-1.amazonaws.com/node?lawId=${lawId}`
      // );
      const res = await fetch(`http://localhost:3000/api?lawId=${lawId}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      setLawData(json);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  }, []);

  // ★ 修正3: マウント時に復元されたIDでデータを取得し、サイドバーを開く
  useEffect(() => {
    // 1. データ取得
    fetchLawData(selectedLawId);

    // 2. サイドバーの該当カテゴリを開く
    for (const category of accordionItems) {
      const found = category.buttons.find(
        (b) => b.link.replace(/^\//, "") === selectedLawId
      );
      if (found) {
        setOpenCategories((prev) => ({
          ...prev,
          [category.summary]: true,
        }));
        break;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 初回のみ実行

  // ★ 修正4: 法令が変更されたら localStorage に保存
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LAST_LAW_ID, selectedLawId);
    localStorage.setItem(STORAGE_KEY_LAST_LAW_NAME, selectedLawName);
  }, [selectedLawId, selectedLawName]);

  // LocalStorageから付箋をロード (マウント時のみ)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_STICKY);
      if (saved) {
        setStickyNotes(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load sticky notes", e);
    } finally {
      setIsStickyLoaded(true);
    }
  }, []);

  // LocalStorageへ付箋を保存 (変更時)
  useEffect(() => {
    if (isStickyLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY_STICKY, JSON.stringify(stickyNotes));
      } catch (e) {
        console.error("Failed to save sticky notes", e);
      }
    }
  }, [stickyNotes, isStickyLoaded]);

  // --- リサイズ機能 ---
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

  const handleToggleCategory = (categoryTitle: string) => {
    setOpenCategories((prev) => ({
      ...prev,
      [categoryTitle]: !prev[categoryTitle],
    }));
  };

  // 現在表示中の法令に紐づく付箋IDセット
  const currentLawStickyIds = useMemo(() => {
    const ids = new Set<string>();
    stickyNotes.forEach((note) => {
      if (note.lawId === selectedLawId) {
        ids.add(note.id);
      }
    });
    return ids;
  }, [stickyNotes, selectedLawId]);

  // 付箋のトグル処理
  const handleToggleSticky = useCallback(
    (id: string) => {
      if (!isExamActive) return;

      setStickyNotes((prev) => {
        const exists = prev.find(
          (n) => n.id === id && n.lawId === selectedLawId
        );

        if (exists) {
          // 削除
          return prev.filter(
            (n) => !(n.id === id && n.lawId === selectedLawId)
          );
        } else {
          // 追加: DOMからテキストを取得
          const domId = getDomIdFromStickyId(id);
          let textContent = "（テキストを取得できませんでした）";

          if (contentRef.current && domId) {
            const targetElement = contentRef.current.querySelector(
              `[id='${domId}']`
            );
            if (targetElement && targetElement.textContent) {
              textContent = targetElement.textContent
                .replace(/\s+/g, " ")
                .trim();
            }
          }

          const newNote: StickyNote = {
            id,
            lawId: selectedLawId,
            lawName: selectedLawName,
            label: parseStickyLabel(id),
            text: textContent,
            createdAt: Date.now(),
          };
          return [...prev, newNote];
        }
      });
    },
    [selectedLawId, selectedLawName, isExamActive]
  );

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
      setSelectedLawName(lawName);
      await fetchLawData(lawId);
    }
  };

  // リトライ機能付きのスクロール関数
  const attemptScrollToElement = (domId: string, maxRetries = 10) => {
    let retryCount = 0;

    const checkAndScroll = () => {
      if (!contentRef.current) return;
      const targetElement = contentRef.current.querySelector(`[id='${domId}']`);

      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
      } else if (retryCount < maxRetries) {
        retryCount++;
        setTimeout(checkAndScroll, 100);
      }
    };

    checkAndScroll();
  };

  // 付箋一覧からのジャンプ処理
  const handleJumpToSticky = async (note: StickyNote) => {
    setIsStickyListOpen(false);
    const domId = getDomIdFromStickyId(note.id);

    if (note.lawId !== selectedLawId) {
      setSelectedLawId(note.lawId);
      setSelectedLawName(note.lawName);
      setPendingScrollId(domId);
      await fetchLawData(note.lawId);
    } else {
      // 同一法令内の場合
      attemptScrollToElement(domId);
    }
  };

  // 自動スクロール (useEffect)
  useEffect(() => {
    if (!pendingScrollId || !lawData) return;

    let retries = 0;
    const maxRetries = 20; // 20回 * 100ms = 最大2秒待機
    let timeoutId: NodeJS.Timeout;

    const scrollLoop = () => {
      if (!contentRef.current) return;

      const target = contentRef.current.querySelector(
        `[id='${pendingScrollId}']`
      );

      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
        setPendingScrollId(null); // 成功したらクリア
      } else if (retries < maxRetries) {
        retries++;
        timeoutId = setTimeout(scrollLoop, 100); // まだ見つからなければ待機
      } else {
        // タイムアウト
        setPendingScrollId(null);
      }
    };

    scrollLoop();

    return () => clearTimeout(timeoutId);
  }, [lawData, pendingScrollId]);

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
          bgcolor: colorScheme === "none" ? "grey.100" : styles.subBg,
          borderBottom: 1,
          borderColor: styles.border,
          display: "flex",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
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
            onClick={() => setIsStickyListOpen(true)}
            disabled={!isExamActive}
            sx={{
              bgcolor: "#b45309",
              "&:hover": { bgcolor: "#92400e" },
              "&.Mui-disabled": {
                bgcolor: "action.disabledBackground",
                color: "action.disabled",
              },
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

      {/* Main Content */}
      <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {showToc && (
          <Box
            sx={{
              width: sidebarWidth,
              transition: isResizing ? "none" : "width 0.2s",
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

        <Box
          ref={contentRef}
          sx={{
            flex: 1,
            overflowY: "auto",
            bgcolor: styles.bg,
            color: styles.text,
          }}
        >
          {isResizing && (
            <Box sx={{ position: "absolute", inset: 0, zIndex: 100 }} />
          )}
          {lawData && (
            <TopMain
              data={lawData}
              stickyNotes={currentLawStickyIds}
              onToggleSticky={handleToggleSticky}
              colorScheme={colorScheme}
            />
          )}
        </Box>
      </Box>

      {/* Sticky List Dialog */}
      <Dialog
        open={isStickyListOpen}
        onClose={() => setIsStickyListOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle
          sx={{ fontWeight: "bold", borderBottom: 1, borderColor: "divider" }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <StickyNote2 color="primary" />
            付箋一覧
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          {stickyNotes.length === 0 ? (
            <Box p={4} textAlign="center" color="text.secondary">
              <Typography>付箋は登録されていません。</Typography>
            </Box>
          ) : (
            <List>
              {stickyNotes.map((note, index) => (
                <React.Fragment key={`${note.lawId}-${note.id}`}>
                  {index > 0 && <Divider component="li" />}
                  <ListItem
                    disablePadding
                    secondaryAction={
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => {
                          setStickyNotes((prev) =>
                            prev.filter(
                              (n) =>
                                !(n.id === note.id && n.lawId === note.lawId)
                            )
                          );
                        }}
                        sx={{ mr: 0.5, color: "grey.500" }}
                      >
                        <Close />
                      </IconButton>
                    }
                  >
                    <ListItemButton
                      onClick={() => handleJumpToSticky(note)}
                      sx={{
                        py: 1.5,
                        pr: 7,
                        alignItems: "flex-start",
                        flexDirection: "column",
                      }}
                    >
                      <Chip
                        label={note.lawName}
                        size="small"
                        color={
                          note.lawId === selectedLawId ? "primary" : "default"
                        }
                        variant={
                          note.lawId === selectedLawId ? "filled" : "outlined"
                        }
                        sx={{ mb: 0.5, height: 20, fontSize: 10 }}
                      />

                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          width: "100%",
                          mb: 0.5,
                        }}
                      >
                        <Typography
                          variant="subtitle1"
                          fontWeight="bold"
                          sx={{ flex: 1 }}
                        >
                          {note.label}
                        </Typography>
                      </Box>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          fontSize: 12,
                        }}
                      >
                        {note.text}
                      </Typography>

                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          mt: 1,
                          alignSelf: "flex-end",
                          opacity: 0.7,
                        }}
                      >
                        <Typography variant="caption" sx={{ mr: 0.5 }}>
                          へ移動
                        </Typography>
                        <ArrowForward fontSize="small" />
                      </Box>
                    </ListItemButton>
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsStickyListOpen(false)} color="inherit">
            閉じる
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
