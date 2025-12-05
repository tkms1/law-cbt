import React, { useState } from "react";
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
} from "@mui/material";
import {
  Search,
  ChevronLeft,
  Bookmark,
  ArrowForward,
  Article,
} from "@mui/icons-material";
import { MOCK_LAWS } from "../../constants";

export const LawPanel: React.FC = () => {
  const [showToc, setShowToc] = useState(true);
  const [selectedLawId, setSelectedLawId] = useState("018");

  const activeLaw = MOCK_LAWS.find((l) => l.id === selectedLawId);

  return (
    <Box
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
          px: 1,
          gap: 1,
          flexShrink: 0,
        }}
      >
        <Box sx={{ position: "relative", flex: 1, maxWidth: 240 }}>
          <TextField
            placeholder="目次検索"
            variant="outlined"
            size="small"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ fontSize: 14 }} />
                </InputAdornment>
              ),
              sx: { height: 32, fontSize: 12, bgcolor: "white" },
            }}
          />
        </Box>

        <IconButton
          size="small"
          onClick={() => setShowToc(!showToc)}
          sx={{
            border: 1,
            borderColor: "divider",
            bgcolor: "white",
            borderRadius: 1,
          }}
        >
          <ChevronLeft
            sx={{
              fontSize: 16,
              transform: showToc ? "none" : "rotate(180deg)",
            }}
          />
        </IconButton>

        <Box sx={{ height: 24, width: 1, bgcolor: "divider", mx: 0.5 }} />

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Typography
            variant="caption"
            sx={{ fontWeight: "bold", color: "text.secondary", mr: 0.5 }}
          >
            目次
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

      {/* Main Content Split */}
      <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* TOC Sidebar */}
        {showToc && (
          <Box
            sx={{
              width: 260,
              bgcolor: "grey.50",
              borderRight: 1,
              borderColor: "divider",
              overflowY: "auto",
              flexShrink: 0,
            }}
          >
            <List dense disablePadding>
              {MOCK_LAWS.map((law) => (
                <ListItemButton
                  key={law.id}
                  selected={selectedLawId === law.id}
                  onClick={() => setSelectedLawId(law.id)}
                  sx={{
                    borderBottom: 1,
                    borderColor: "divider",
                    py: 1,
                    "&.Mui-selected": {
                      bgcolor: "primary.light",
                      color: "primary.contrastText",
                      "&:hover": { bgcolor: "primary.main" },
                    },
                  }}
                >
                  <Article sx={{ fontSize: 16, mr: 1, opacity: 0.7 }} />
                  <ListItemText
                    primary={law.title}
                    primaryTypographyProps={{
                      fontSize: 12,
                      lineHeight: 1.2,
                    }}
                  />
                </ListItemButton>
              ))}
            </List>
          </Box>
        )}

        {/* Text Area */}
        <Box
          sx={{ flex: 1, overflowY: "auto", p: 3, bgcolor: "background.paper" }}
        >
          {activeLaw ? (
            <Box>
              <Typography
                variant="h6"
                sx={{
                  borderBottom: 2,
                  borderColor: "text.primary",
                  pb: 1,
                  mb: 2,
                  fontSize: 16,
                  fontWeight: "bold",
                }}
              >
                {activeLaw.title}
              </Typography>
              <Box
                sx={{ fontSize: 14, lineHeight: 1.8 }}
                dangerouslySetInnerHTML={{ __html: activeLaw.content }}
              />
            </Box>
          ) : (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                color: "text.disabled",
              }}
            >
              法令を選択してください
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};
