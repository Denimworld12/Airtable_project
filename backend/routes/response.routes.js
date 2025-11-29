import { Router } from "express";
import { submitResponse, listResponses } from "../controllers/response.controller.js";

const router = Router();

router.route("/forms/:formId/submit").post(submitResponse);
router.route("/forms/:formId/responses").get(listResponses);

export default router;
