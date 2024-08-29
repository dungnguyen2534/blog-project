import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import User from "../models/user";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import env from "../env";

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

passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: env.SERVER_URL + "/auth/oauth2/redirect/google",
      scope: ["profile"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const existingUser = await User.findOne({
          googleId: profile.id,
        }).exec();

        if (existingUser) {
          return done(null, existingUser);
        }

        const newUser = await User.create({
          googleId: profile.id,
          profilePicPath: profile.photos?.[0].value,
        });

        done(null, newUser);
      } catch (error) {
        done(error);
      }
    }
  )
);

// store user id in the session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// attach user to req.user
passport.deserializeUser(async (id: string, done) => {
  done(null, { _id: new mongoose.Types.ObjectId(id) });
});
