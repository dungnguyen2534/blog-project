import express from "express";
import { search } from "../controllers/search.controller";

// prefix: /search
const router = express.Router();

router.post("/", search);

export default router;
