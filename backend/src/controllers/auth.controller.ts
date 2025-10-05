import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/user.model";
import { generateToken } from "../utils/generateToken";

export const register = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const existingUser = await User.find({ email });

  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hanshedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await User.create({
      username: username,
      email: email,
      password: hanshedPassword,
    });

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token: generateToken(user._id.toString()),
    });
  } catch (error: any) {
    res.status(400).json({
      message: "failed to create user",
      error: error.message,
    });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      return res.status(200).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token: generateToken(user._id.toString()),
      });
    }
  } catch (error: any) {
    res.status(400).json({
      message: "failed to login",
      error: error.message,
    });
  }
};
