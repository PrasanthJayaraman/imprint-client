var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var assignSchema = new Schema({
    id: {
        type: Schema.Types.ObjectId
    },
    name: {
        type: String
    },
    photo: {
        type: String
    }
}, {
    _id: false
});

var leaveSchema = new Schema({
    title: {
        type: String
    },
    type: {
        type: String,
        enum: ['Sick Leave', 'Casual Leave', 'Privilege leave', 'Other']
    },
    modified: {
        type: Date
    },
    created: {
        type: Date
    },
    start: {
        type: Date
    },
    end: {
        type: Date
    },
    days: {
        type: String
    },
    status: {
        type: String,
        enum: ['Approved', 'Declined']
    },
    comments: {
        type: String
    },
    approvedBy: assignSchema,
    appliedBy: assignSchema,
    description: {
        type: String
    }
}, {
    collection: "leave"
});

leaveSchema.statics.checkExistingLeaves = function (id, callback) {
    this.find({
        'appliedBy.id': id,
        'status': {
            $ne: 'Declined'
        }
    }, callback);
}

module.exports = Leave = mongoose.model("Leave", leaveSchema);