import { RequestHandler } from "express";
import env from "../constant/env";

const getSessionReturnTo: RequestHandler = (req, res, next) => {
  const { returnTo } = req.query;

  if (returnTo) {
    req.session.returnTo = env.CLIENT_URL + returnTo;
  }

  next();
};

export default getSessionReturnTo;

// the query is from social login buttons in SocialSingin.tsx on the client side
// if req.session.returnTo is set, successReturnToOrRedirect will redirect to that url
