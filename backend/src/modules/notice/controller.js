const placeholder = (req, res) => {
  res.status(501).json({ success: false, message: "Use student notices API or school-admin create notice API" });
};

export const noticeController = {
  placeholder,
};
