import { RequestHandler } from "express";
import UserModel from "../models/user";
import bcrypt from "bcrypt";
import { SignupBody } from "../validation/users";
import createHttpError from "http-errors";

export const signup: RequestHandler<
  unknown,
  unknown,
  SignupBody,
  unknown
> = async (req, res, next) => {
  try {
    const { username, email, password: rawPassword } = req.body;

    const existedUsername = await UserModel.exists({ username });

    if (existedUsername) {
      return res.status(409).json({ message: "Username already taken" });
    }

    // handle existed email later when implementing email verification

    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const result = await UserModel.create({
      email,
      username,
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

export const signout: RequestHandler = (req, res) => {
  req.logout((err) => {
    if (err) throw err;
    res.sendStatus(200);
  });
};

export const getUser: RequestHandler = async (req, res, next) => {
  const { username } = req.params;
  try {
    const user = await UserModel.findOne({ username }).select("+email").exec();

    if (!user) throw createHttpError(404, "User not found");

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const getAuthenticatedUser: RequestHandler = async (req, res, next) => {
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
