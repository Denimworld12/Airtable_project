import mongoose from "mongoose";

const conditionSchema = new mongoose.Schema({
    questionKey: {
        type: String,
        required: true
    },
    operator: {
        type: String,
        enum: ["equals", "notEquals", "contains"],
        required: true
    },
    value: {
        type: mongoose.Schema.Types.Mixed
    },



});

const conditionalRulesSchema = new mongoose.Schema({
    logic: {
        type: String,
        enum: ["AND", "OR"],
        default: "AND"
    },
    conditions: {
        type: [conditionSchema],
        default: []
    },
});

const questionSchema = new mongoose.Schema({
    questionKey: {
        type: String,
        required: true
    },


    airtableFieldId: {
        type: String,
        required: true
    },
    label: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    required: {
        type: Boolean,
        default: false
    },
    options: {
        type: [String],
        default: []
    },

    conditionalRules: {
        type: conditionalRulesSchema,
        default: null
    },
});

const formSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "airtableuser",
        required: true
    },
    name: {
        type: String,
        required: true
    },
    airtableBaseId: {
        type: String,
        required: true
    },
    airtableTableId: {
        type: String,
        required: true
    },
    questions: {
        type: [questionSchema],
        default: []
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

const Form = mongoose.model("form", formSchema);
export default Form;
