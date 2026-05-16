import { useCallback, useId, useRef, useState } from "react";
import { Box, Button, CircularProgress, Stack, Typography } from "@mui/material";
import { CloudUpload, ImageIcon, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { ACCEPT_ATTR, processPlatformImage } from "./platformImageUpload";

export default function PlatformBrandingUpload({
  label,
  hint,
  value,
  onChange,
  size = 160,
  maxDim = 512,
  maxBytes = 2 * 1024 * 1024,
}) {
  const inputId = useId();
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleFile = useCallback(
    async (file) => {
      if (!file) return;
      setBusy(true);
      try {
        const dataUrl = await processPlatformImage(file, { maxDim, maxBytes });
        onChange(dataUrl);
        toast.success(`${label} ready — save settings to apply everywhere`);
      } catch (err) {
        toast.error(err.message || "Upload failed");
      } finally {
        setBusy(false);
        if (inputRef.current) inputRef.current.value = "";
      }
    },
    [label, maxBytes, maxDim, onChange]
  );

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const openPicker = () => {
    if (!busy) inputRef.current?.click();
  };

  return (
    <Stack spacing={1.25} sx={{ width: "100%" }}>
      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "text.primary" }}>
          {label}
        </Typography>
        {hint ? (
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25, lineHeight: 1.5 }}>
            {hint}
          </Typography>
        ) : null}
      </Box>

      <Box
        role="button"
        tabIndex={0}
        aria-label={`Upload ${label}`}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openPicker();
          }
        }}
        onClick={openPicker}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragOver(false);
        }}
        onDrop={onDrop}
        sx={{
          width: "100%",
          borderRadius: "16px",
          border: "2px dashed",
          borderColor: dragOver ? "primary.main" : "rgba(15,23,42,0.14)",
          bgcolor: dragOver ? "rgba(37,99,235,0.06)" : "grey.50",
          p: 2.5,
          cursor: busy ? "wait" : "pointer",
          transition: "border-color 0.2s, background-color 0.2s, box-shadow 0.2s",
          "&:hover": {
            borderColor: "primary.light",
            bgcolor: dragOver ? "rgba(37,99,235,0.06)" : "rgba(37,99,235,0.03)",
            boxShadow: "0 10px 28px -14px rgba(37,99,235,0.35)",
          },
        }}
      >
        <Stack spacing={2} alignItems="center">
          <Box
            sx={{
              width: "100%",
              maxWidth: size + 80,
              minHeight: size + 24,
              mx: "auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "14px",
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              p: 2,
              position: "relative",
            }}
          >
            {busy ? (
              <CircularProgress size={32} />
            ) : value ? (
              <Box
                component="img"
                src={value}
                alt={`${label} preview`}
                sx={{
                  width: size,
                  height: size,
                  maxWidth: "100%",
                  objectFit: "contain",
                  objectPosition: "center",
                  display: "block",
                }}
              />
            ) : (
              <Stack alignItems="center" spacing={1} sx={{ py: 2, color: "text.secondary" }}>
                <ImageIcon size={32} strokeWidth={1.5} />
                <Typography variant="caption" fontWeight={600}>
                  Drag & drop or click to upload
                </Typography>
                <Typography variant="caption" color="text.disabled">
                  PNG · JPG · SVG · WEBP
                </Typography>
              </Stack>
            )}
          </Box>

          <Stack
            direction="row"
            spacing={1}
            flexWrap="wrap"
            justifyContent="center"
            sx={{ width: "100%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="outlined"
              size="small"
              disabled={busy}
              startIcon={busy ? <CircularProgress size={14} /> : <CloudUpload size={16} />}
              onClick={(e) => {
                e.stopPropagation();
                openPicker();
              }}
              sx={{ borderRadius: "12px", minHeight: 44, textTransform: "none", fontWeight: 600, px: 2.5 }}
            >
              {value ? "Replace" : "Choose file"}
            </Button>
            {value ? (
              <Button
                size="small"
                color="error"
                variant="text"
                disabled={busy}
                startIcon={<Trash2 size={16} />}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange("");
                  if (inputRef.current) inputRef.current.value = "";
                }}
                sx={{ borderRadius: "12px", minHeight: 44, textTransform: "none", fontWeight: 600 }}
              >
                Remove
              </Button>
            ) : null}
          </Stack>
        </Stack>
      </Box>

      <input
        id={inputId}
        ref={inputRef}
        hidden
        type="file"
        accept={ACCEPT_ATTR}
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </Stack>
  );
}
