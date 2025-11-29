import axios from "axios";
import Form from "../models/Form.model.js";
import AirtableUser from "../models/User.model.js";
// import { shouldShowQuestion } from "../conditional.js";

/**
 * Helper to call Airtable metadata endpoints:
 * GET /meta/bases and GET /meta/bases/{baseId}/tables and fetch fields
 */
async function airtableFetch(url, token) {
  const r = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
  return r.data;
}

const SUPPORTED_TYPES = {
  "singleLineText": "short_text",
  "multilineText": "long_text",
  "singleSelect": "single_select",
  "multipleSelects": "multi_select",
  "attachment": "attachment",
};

/**
 * GET /forms/airtable/bases
 * query: userId (app DB user id)
 */
export const listAirtableBases = async (req, res) => {
  const { userId } = req.query;
  try {
    const user = await AirtableUser.findById(userId);
    if (!user) return res.status(400).json({ message: "user not found" });
    const data = await airtableFetch("https://api.airtable.com/v0/meta/bases", user.accessToken);
    // return simplified list
    const bases = data.bases?.map(b => ({ id: b.id, name: b.name })) || [];
    return res.json({ bases });
  } catch (error) {
    return res.status(500).json({ message: error.response?.data || error.message });
  }
};

/**
 * GET /forms/airtable/tables?baseId=...
 */
export const listAirtableTables = async (req, res) => {
  const { userId, baseId } = req.query;
  try {
    const user = await AirtableUser.findById(userId);
    if (!user) return res.status(400).json({ message: "user not found" });
    const data = await airtableFetch(`https://api.airtable.com/v0/meta/bases/${baseId}/tables`, user.accessToken);
    const tables = data.tables?.map(t => ({ id: t.id, name: t.name })) || [];
    return res.json({ tables });
  } catch (error) {
    return res.status(500).json({ message: error.response?.data || error.message });
  }
};

/**
 * GET /forms/airtable/fields?baseId=&tableId=
 * returns only supported fields
 */
export const listAirtableFields = async (req, res) => {
  const { userId, baseId, tableId } = req.query;
  try {
    const user = await AirtableUser.findById(userId);
    if (!user) return res.status(400).json({ message: "user not found" });

    const data = await airtableFetch(`https://api.airtable.com/v0/meta/bases/${baseId}/tables/${tableId}/fields`, user.accessToken);
    const fields = (data?.fields || []).map(f => {
      const typeKey = f.type;
      const mapped = SUPPORTED_TYPES[typeKey];
      return {
        id: f.id,
        name: f.name,
        type: mapped || "unsupported",
        rawType: typeKey,
        options: f?.options?.choices?.map(c => c.name) || [],
      };
    }).filter(f => f.type !== "unsupported");

    return res.json({ fields });
  } catch (error) {
    return res.status(500).json({ message: error.response?.data || error.message });
  }
};


export const createForm = async (req, res) => {
  try {
    const { owner, name, airtableBaseId, airtableTableId, questions } = req.body;
    if (!owner || !name || !airtableBaseId || !airtableTableId) return res.status(400).json({ message: "missing fields" });

    // validate question types and questionKey uniqueness
    const keys = new Set();
    for (const q of questions) {
      if (!q.questionKey || !q.airtableFieldId || !q.label || !q.type) return res.status(400).json({ message: "question missing fields" });
      if (keys.has(q.questionKey)) return res.status(400).json({ message: "duplicate questionKey" });
      keys.add(q.questionKey);
      if (!["short_text", "long_text", "single_select", "multi_select", "attachment"].includes(q.type)) {
        return res.status(400).json({ message: `unsupported question type ${q.type}` });
      }
    }

    const form = new (await import("../models/Form.model.js")).default({
      owner,
      name,
      airtableBaseId,
      airtableTableId,
      questions,
    });
    await form.save();
    return res.status(200).json({ message: "form created", form });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getForm = async (req, res) => {
  try {
    const { formId } = req.params;
    const form = await Form.findById(formId).populate("owner", "name email userId");
    if (!form) return res.status(404).json({ message: "form not found" });
    return res.json({ form });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const listForms = async (req, res) => {
  try {
    const { owner } = req.query;
    if (!owner) return res.status(400).json({ message: "owner required" });
    const forms = await Form.find({ owner });
    return res.json({ forms });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
