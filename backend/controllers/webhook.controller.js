import ResponseModel from "../models/Response.model.js";

export const airtableWebhook = async (req, res) => {
  try {
    const body = req.body;
    
    const events = body?.records || (body ? [body] : []);
    for (const ev of events) {
      const recordId = ev.id || ev.recordId || ev.record?.id;
      const eventType = ev.type || body.type || ev.event || ev.action;
      if (!recordId) continue;
      if (eventType === "deleted" || eventType === "record.deleted") {
        await ResponseModel.updateOne({ airtableRecordId: recordId }, { $set: { deletedInAirtable: true } });
      } else {
       
        const fields = ev.fields || ev.record?.fields || null;
        if (fields) {
          const resp = await ResponseModel.findOne({ airtableRecordId: recordId });
          if (resp) {
            resp.answers = { ...resp.answers, airtable_sync: fields };
            resp.updatedAt = new Date();
            await resp.save();
          }
        }
      }
    }
    return res.status(200).json({ message: "ok" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


