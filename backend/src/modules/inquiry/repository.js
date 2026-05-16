import mongoose from "mongoose";
import Inquiry from "../../models/Inquiry.js";

export const inquiryRepository = {
  create: (doc) => Inquiry.create(doc),
  findById: ({ schoolId, id }) =>
    Inquiry.findOne({ _id: id, schoolId })
      .populate("assignedTeacherId", "firstName lastName userId phone")
      .populate({ path: "assignedTeacherId", populate: { path: "userId", select: "name email" } })
      .populate("interestedClassId", "name section"),
  findMany: (filter, opts = {}) => {
    const { skip = 0, limit = 20, sort = { createdAt: -1 } } = opts;
    return Inquiry.find(filter)
      .populate("assignedTeacherId", "firstName lastName userId")
      .populate({ path: "assignedTeacherId", populate: { path: "userId", select: "name email" } })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();
  },
  count: (filter) => Inquiry.countDocuments(filter),
  updateById: ({ schoolId, id, payload }) =>
    Inquiry.findOneAndUpdate({ _id: id, schoolId }, payload, { new: true })
      .populate("assignedTeacherId", "firstName lastName userId")
      .populate({ path: "assignedTeacherId", populate: { path: "userId", select: "name email" } })
      .populate("interestedClassId", "name section"),
  deleteById: ({ schoolId, id }) => Inquiry.findOneAndDelete({ _id: id, schoolId }),
  aggregate: (pipeline) => Inquiry.aggregate(pipeline),
};

export default inquiryRepository;
