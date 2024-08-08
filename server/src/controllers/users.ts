import { RequestHandler } from "express";
import UserModel from "../models/user";
import bcrypt from "bcrypt";

interface SignupBody {
  username: string;
  email: string;
  password: string;
}

export const signup: RequestHandler<
  unknown,
  unknown,
  SignupBody,
  unknown
> = async (req, res, next) => {
  try {
    const { username, email, password: rawPassword } = req.body;

    const existedUsername = await UserModel.exists({ username }).collation({
      locale: "en",
      strength: 2,
    }); // case-insensitive search, e.g. "John" and "john" are the same

    if (existedUsername) {
      return res.status(409).json({ message: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const result = await UserModel.create({
      email,
      username,
      name: username, // default name is username, user can change it later
      password: hashedPassword,
    });

    // turn to plain object to remove sensitive data before sending to client
    const newUser = result.toObject();
    delete newUser.password;

    res.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
};
