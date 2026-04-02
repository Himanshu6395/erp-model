const placeholder = (req, res) => {
  res.status(501).json({ success: false, message: "Use student assignments API" });
};

export const assignmentController = {
  placeholder,
};
