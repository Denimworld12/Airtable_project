import axios from "axios";
import Form from "../models/Form.model.js";
import ResponseModel from "../models/Response.model.js";
import AirtableUser from "../models/User.model.js";

function validateAnswers(form, answers) {
  const errors = [];
  for (const q of form.questions) {
    const val = answers[q.questionKey];
    if (q.required) {
      if (val === undefined || val === null || val === "") {
        errors.push({ questionKey: q.questionKey, message: "required" });
        continue;
      }
    }
    if (q.type === "single_select") {
      if (val && !q.options.includes(val)) errors.push({ questionKey: q.questionKey, message: "invalid option" });
    }
    if (q.type === "multi_select") {
      if (val && !Array.isArray(val)) errors.push({ questionKey: q.questionKey, message: "must be array" });
      else if (val) {
        for (const v of val) if (!q.options.includes(v)) errors.push({ questionKey: q.questionKey, message: "invalid option" });
      }
    }
  }
  return errors;
}

export const submitResponse = async (req, res) => {
  try {
    const { formId } = req.params;
    const { answers, airtableUserId } = req.body;
    if (!answers) return res.status(400).json({ message: "answers missing" });

    const form = await Form.findById(formId);
    if (!form) return res.status(404).json({ message: "form not found" });

    // validate
    const validation = validateAnswers(form, answers);
    if (validation.length > 0) return res.status(400).json({ message: "validation failed", errors: validation });
    const user = await AirtableUser.findById(airtableUserId);
    if (!user) return res.status(400).json({ message: "airtable user not found" });

    const fieldsForAirtable = {};
    for (const q of form.questions) {
      const answer = answers[q.questionKey];
      if (answer === undefined) continue;
      const fieldName = q.label || q.airtableFieldId;
      if (q.type === "attachment") {
        const attachments = Array.isArray(answer) ? answer.map(u => ({ url: u })) : [{ url: answer }];
        fieldsForAirtable[fieldName] = attachments;
      } else if (q.type === "multi_select") {
        fieldsForAirtable[fieldName] = answer;
      } else {
        fieldsForAirtable[fieldName] = answer;
      }
    }

    const createUrl = `https://api.airtable.com/v0/${form.airtableBaseId}/${encodeURIComponent(form.airtableTableId)}`;
    const createResp = await axios.post(
      createUrl,
      { fields: fieldsForAirtable },
      { headers: { Authorization: `Bearer ${user.accessToken}`, "Content-Type": "application/json" } }
    );

    const airtableRecordId = createResp.data?.id || null;

    const responseDoc = new ResponseModel({
      formId: form._id,
      airtableRecordId,
      answers,
    });
    await responseDoc.save();

    return res.status(200).json({ message: "saved", response: responseDoc });
  } catch (error) {
    return res.status(500).json({ message: error.response?.data || error.message });
  }
};


export const listResponses = async (req, res) => {
  try {
    const { formId } = req.params;
    const responses = await ResponseModel.find({ formId }).sort({ createdAt: -1 });
    return res.json({ responses });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
