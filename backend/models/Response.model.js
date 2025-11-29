import mongoose from "mongoose";

const responseSchema = new mongoose.Schema({
    formId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "form",
        required: true
    },
    airtableRecordId: { 
        type: String,
         default: null
         },
    answers: {
         type: mongoose.Schema.Types.Mixed,
          required: true 
        },
    deletedInAirtable: { 
        type: Boolean, 
        default: false
     },
    createdAt: { 
        type: Date,
         default: Date.now 
        },
    updatedAt: { 
        type: Date,
         default: Date.now 
        },
});

const Response = mongoose.model("response", responseSchema);
export default Response;
