import { Avatar } from "@mui/material";

function getInitials(name, email) {
  const source = (name || email || "U").trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

export default function ErpUserAvatar({
  src,
  name,
  email,
  size = 40,
  sx,
  className,
  ...props
}) {
  const initials = getInitials(name, email);

  return (
    <Avatar
      src={src || undefined}
      alt={name || "User"}
      className={className}
      sx={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        fontWeight: 700,
        bgcolor: "primary.main",
        border: "2px solid",
        borderColor: "rgba(255,255,255,0.9)",
        boxShadow: "0 2px 8px rgba(15,23,42,0.12)",
        ...sx,
      }}
      {...props}
    >
      {!src ? initials : null}
    </Avatar>
  );
}
