const placeholder = (req, res) => {
  res.status(501).json({ success: false, message: "Use student attendance API" });
};

export const attendanceController = {
  placeholder,
};
