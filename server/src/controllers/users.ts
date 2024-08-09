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
    });

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

    const newUser = result.toObject();
    delete newUser.password;

    // req.login provided by passport, login after signup
    req.login(newUser, (err) => {
      if (err) throw err;
      res.status(201).json(newUser);
    });
  } catch (error) {
    next(error);
  }
};

export const getAuthenticUser: RequestHandler = async (req, res, next) => {
  const authenticatedUser = req.user;

  try {
    if (!authenticatedUser) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await UserModel.findById(authenticatedUser._id)
      .select("+email")
      .exec();

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const signout: RequestHandler = (req, res) => {
  //not async so don't need to use next, the err will automatically forward to the error handler

  req.logout((err) => {
    if (err) throw err;
    res.sendStatus(200);
  });
};
