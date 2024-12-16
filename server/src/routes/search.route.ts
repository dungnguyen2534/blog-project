import express from "express";
import { quickSearch } from "../controllers/search.controller";

// prefix: /search
const router = express.Router();

router.post("/", quickSearch);

export default router;
