const placeholder = (req, res) => {
  res.status(501).json({ success: false, message: "Use student fees API" });
};

export const feesController = {
  placeholder,
};
