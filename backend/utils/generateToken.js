import jwt from "jsonwebtoken";

const genrateToken = (user) => {
  return jwt.sign(
    { id: user._id, isAdmin: user.isAdmin || false },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

export default genrateToken;
