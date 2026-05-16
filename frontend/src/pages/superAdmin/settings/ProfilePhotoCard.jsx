import { useCallback, useRef } from "react";
import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import { CameraAltOutlined, DeleteOutline } from "@mui/icons-material";
import ErpUserAvatar from "../../../components/common/ErpUserAvatar";

export default function ProfilePhotoCard({ name, email, avatarUrl, onChange }) {
  const inputRef = useRef(null);

  const readFile = useCallback(
    (file) => {
      if (!file || !file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = () => onChange(String(reader.result || ""));
      reader.readAsDataURL(file);
    },
    [onChange]
  );

  const onDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    readFile(file);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.5, sm: 3 },
        borderRadius: 2.5,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
    >
      <Box
        sx={{
          position: "relative",
          mb: 2,
          "&:hover .upload-overlay": { opacity: 1 },
        }}
      >
        <ErpUserAvatar
          src={avatarUrl}
          name={name}
          email={email}
          size={120}
          sx={{ width: 120, height: 120, fontSize: "2rem", borderWidth: 3 }}
        />
        <Box
          className="upload-overlay"
          onClick={() => inputRef.current?.click()}
          sx={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            bgcolor: "rgba(15,23,42,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: 0,
            transition: "opacity 0.2s ease",
            cursor: "pointer",
            color: "#fff",
          }}
        >
          <CameraAltOutlined sx={{ fontSize: 32 }} />
        </Box>
        <input
          ref={inputRef}
          hidden
          type="file"
          accept="image/*"
          onChange={(e) => readFile(e.target.files?.[0])}
        />
      </Box>

      <Typography variant="subtitle2" fontWeight={600}>
        Profile photo
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, mb: 2, maxWidth: 200 }}>
        JPG or PNG. Drag and drop or use the buttons below.
      </Typography>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1} width="100%" sx={{ maxWidth: 280 }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<CameraAltOutlined />}
          onClick={() => inputRef.current?.click()}
          sx={{
            minHeight: 44,
            borderRadius: "12px",
            background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
            fontWeight: 600,
          }}
        >
          Upload
        </Button>
        {avatarUrl ? (
          <Button
            fullWidth
            variant="outlined"
            color="inherit"
            startIcon={<DeleteOutline />}
            onClick={() => onChange("")}
            sx={{ minHeight: 44, borderRadius: "12px", fontWeight: 600, borderColor: "divider" }}
          >
            Remove
          </Button>
        ) : null}
      </Stack>
    </Paper>
  );
}
