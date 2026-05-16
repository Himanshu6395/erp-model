import { useState } from "react";

import {

  Box,

  Button,

  Card,

  CardContent,

  CircularProgress,

  FormControl,

  FormHelperText,

  Grid,

  IconButton,

  InputAdornment,

  InputLabel,

  LinearProgress,

  MenuItem,

  Select,

  Stack,

  TextField,

  Typography,

} from "@mui/material";

import { Eye, EyeOff } from "lucide-react";



const fieldSx = {

  "& .MuiOutlinedInput-root": {

    minHeight: 56,

    borderRadius: "14px",

    bgcolor: "background.paper",

    "& fieldset": { borderColor: "rgba(15,23,42,0.12)" },

    "&:hover fieldset": { borderColor: "rgba(15,23,42,0.22)" },

    "&.Mui-focused fieldset": { borderColor: "primary.main", borderWidth: 2 },

  },

  "& .MuiInputLabel-root": { fontWeight: 500 },

};



export function SettingsSectionCard({ title, subtitle, children, actions }) {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 2.5,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        boxShadow: "0 1px 3px rgba(15,23,42,0.05), 0 8px 24px -12px rgba(15,23,42,0.08)",
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, sm: 3, md: 3.5 } }}>
        <Stack spacing={3}>
          <Box sx={{ pb: 0.5, borderBottom: "1px solid", borderColor: "divider" }}>
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: "1.0625rem", letterSpacing: "-0.01em" }}>
              {title}
            </Typography>
            {subtitle ? (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.55 }}>
                {subtitle}
              </Typography>
            ) : null}
          </Box>
          <Stack spacing={3}>{children}</Stack>
          {actions ? (
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              sx={{
                pt: 2,
                mt: 0.5,
                borderTop: "1px solid",
                borderColor: "divider",
                "& .MuiButton-root": { minHeight: 48, borderRadius: "12px", px: 3 },
              }}
            >
              {actions}
            </Stack>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}



export function SettingsGridItem({ xs = 12, sm = 6, md = 4, children }) {
  return (
    <Grid size={{ xs, sm, md }}>
      {children}
    </Grid>
  );
}



export function SettingsTextField(props) {

  return <TextField fullWidth sx={fieldSx} {...props} />;

}



export function SettingsSelect({ label, options, value, onChange, helperText }) {

  return (

    <FormControl fullWidth sx={fieldSx}>

      <InputLabel>{label}</InputLabel>

      <Select label={label} value={value} onChange={onChange}>

        {options.map((opt) => (

          <MenuItem key={opt.value ?? opt} value={opt.value ?? opt}>

            {opt.label ?? opt}

          </MenuItem>

        ))}

      </Select>

      {helperText ? <FormHelperText>{helperText}</FormHelperText> : null}

    </FormControl>

  );

}



export function ColorField({ label, value, onChange }) {

  return (

    <Stack spacing={1}>

      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "text.primary" }}>

        {label}

      </Typography>

      <Stack direction="row" spacing={1.5} alignItems="center">

        <Box

          component="input"

          type="color"

          value={value}

          onChange={(e) => onChange(e.target.value)}

          sx={{

            width: 56,

            height: 56,

            p: 0.5,

            border: "1px solid",

            borderColor: "divider",

            borderRadius: "14px",

            cursor: "pointer",

            bgcolor: "background.paper",

            flexShrink: 0,

          }}

        />

        <SettingsTextField value={value} onChange={(e) => onChange(e.target.value)} placeholder="#000000" />

      </Stack>

    </Stack>

  );

}



export function PasswordField({ label, value, onChange, error, helperText }) {

  const [show, setShow] = useState(false);

  return (

    <TextField

      fullWidth

      sx={fieldSx}

      type={show ? "text" : "password"}

      label={label}

      value={value}

      onChange={onChange}

      error={Boolean(error)}

      helperText={helperText}

      InputProps={{

        endAdornment: (

          <InputAdornment position="end">

            <IconButton size="small" onClick={() => setShow((s) => !s)} edge="end" aria-label={show ? "Hide" : "Show"}>

              {show ? <EyeOff size={18} /> : <Eye size={18} />}

            </IconButton>

          </InputAdornment>

        ),

      }}

    />

  );

}



export function getPasswordStrength(password) {

  if (!password) return { score: 0, label: "", color: "grey.400" };

  let score = 0;

  if (password.length >= 8) score += 25;

  if (/[A-Z]/.test(password)) score += 25;

  if (/[a-z]/.test(password)) score += 25;

  if (/[0-9]/.test(password)) score += 15;

  if (/[^A-Za-z0-9]/.test(password)) score += 10;

  if (score < 50) return { score, label: "Weak", color: "error.main" };

  if (score < 75) return { score, label: "Fair", color: "warning.main" };

  return { score, label: "Strong", color: "success.main" };

}



export function PasswordStrengthBar({ password }) {

  const { score, label, color } = getPasswordStrength(password);

  if (!password) return null;

  return (

    <Box sx={{ mt: 1 }}>

      <LinearProgress variant="determinate" value={score} color={score >= 75 ? "success" : score >= 50 ? "warning" : "error"} />

      <Typography variant="caption" sx={{ color, mt: 0.5 }}>

        {label}

      </Typography>

    </Box>

  );

}



export function ImageUploadField({ label, value, onChange, accept = "image/*" }) {

  return (

    <Stack spacing={1.5}>

      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>

        {label}

      </Typography>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }}>

        {value ? (

          <Box

            component="img"

            src={value}

            alt="Preview"

            sx={{ width: 96, height: 96, borderRadius: "14px", objectFit: "cover", border: "1px solid", borderColor: "divider" }}

          />

        ) : (

          <Box

            sx={{

              width: 96,

              height: 96,

              borderRadius: "14px",

              bgcolor: "grey.50",

              border: "1px dashed",

              borderColor: "grey.300",

              display: "flex",

              alignItems: "center",

              justifyContent: "center",

            }}

          >

            <Typography variant="caption" color="text.secondary">

              No image

            </Typography>

          </Box>

        )}

        <Stack direction="row" spacing={1} flexWrap="wrap">

          <Button variant="outlined" component="label" sx={{ borderRadius: "12px", minHeight: 44 }}>

            Upload

            <input

              hidden

              type="file"

              accept={accept}

              onChange={(e) => {

                const file = e.target.files?.[0];

                if (!file) return;

                const reader = new FileReader();

                reader.onload = () => onChange(String(reader.result || ""));

                reader.readAsDataURL(file);

              }}

            />

          </Button>

          {value ? (

            <Button color="inherit" onClick={() => onChange("")} sx={{ borderRadius: "12px", minHeight: 44 }}>

              Remove

            </Button>

          ) : null}

        </Stack>

      </Stack>

    </Stack>

  );

}



export function SaveButton({ loading, children = "Save", ...props }) {

  return (

    <Button

      variant="contained"

      disabled={loading}

      startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}

      sx={{
        minWidth: { sm: 140 },
        minHeight: 48,
        borderRadius: "12px",
        fontWeight: 600,
        boxShadow: "0 4px 14px -4px rgba(37, 99, 235, 0.4)",
      }}
      {...props}

    >

      {children}

    </Button>

  );

}



export function SecondaryButton({ loading, children, ...props }) {
  return (
    <Button
      variant="outlined"
      color="inherit"
      disabled={loading}
      sx={{ minWidth: { sm: 140 }, minHeight: 48, borderRadius: "12px", fontWeight: 600, borderColor: "divider" }}
      {...props}
    >
      {children}
    </Button>
  );
}

