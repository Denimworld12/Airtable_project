import { Router } from "express";
import { getAirtableAuthUrl, airtableCallback } from "../controllers/auth.controller.js";

const router = Router();

router.route("/auth/airtable/url").get(getAirtableAuthUrl);
router.route("/auth/airtable/callback").get(airtableCallback);

export default router;
