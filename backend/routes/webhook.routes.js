import { Router } from "express";
import { airtableWebhook } from "../controllers/webhook.controller.js";

const router = Router();

router.route("/webhooks/airtable").post(airtableWebhook);

export default router;
