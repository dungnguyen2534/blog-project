import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import User from "../models/user";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const existingUser = await User.findOne({ username })
        .select("+email +password")
        .exec();

      // if user not found => return
      // if user found, but no password, that means this user already signed up with social account => return
      if (!existingUser || !existingUser.password) {
        return done(null, false);
      }

      if (!(await bcrypt.compare(password, existingUser.password))) {
        return done(null, false);
      }

      const user = existingUser.toObject();
      delete user.password;
      return done(null, user);
    } catch (error) {
      done(error);
    }
  })
);

// store user id in the session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// attach user to req.user
passport.deserializeUser(async (id: string, done) => {
  done(null, { _id: new mongoose.Types.ObjectId(id) });
});
