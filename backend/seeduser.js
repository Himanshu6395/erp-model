import User from "./model/user.js";     // <-- FIXED
import bcrypt from "bcryptjs";
import database from "./config/db.js";

const userRegister = async () => {
  try {
    await database();

    const hashpassword = await bcrypt.hash("123456", 10);

    const newuser = new User({
      name: "himanshu",
      email: "rajhimasnhu122kumar@gmial.com",
      password: hashpassword,   
      isAdmin: true
    });

    await newuser.save();
    console.log("User Registered ✔");
  } catch (error) {
    console.log("Error in User Registering ❌", error.message);
  }
};

userRegister();
