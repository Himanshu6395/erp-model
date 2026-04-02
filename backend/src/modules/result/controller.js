const placeholder = (req, res) => {
  res.status(501).json({ success: false, message: "Use student result API" });
};

export const resultController = {
  placeholder,
};
