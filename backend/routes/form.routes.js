import { Router } from "express";
import { createForm, getForm, listForms, listAirtableBases, listAirtableFields, listAirtableTables } from "../controllers/form.controller.js";

const router = Router();

router.route("/forms/airtable/bases").get(listAirtableBases);
router.route("/forms/airtable/tables").get(listAirtableTables);
router.route("/forms/airtable/fields").get(listAirtableFields);

router.route("/forms").post(createForm).get(listForms);
router.route("/forms/:formId").get(getForm);

export default router;
