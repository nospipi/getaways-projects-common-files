const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const { Schema, model } = mongoose;
const mongoosePaginate = require("mongoose-paginate-v2");
const mongoosastic = require("mongoosastic");

const activitySchema = new Schema({
  type: {
    type: String,
    required: [true, "Activity type is required"],
    unique: true,
    uniqueCaseInsensitive: true,
  },
  platform_product_name: {
    type: String,
  },
  product_id: {
    type: String,
  },
  crewGroups: {
    type: Array,
    required: true,
  },
  crewRoles: {
    type: Array,
    required: true,
  },
});
activitySchema.plugin(uniqueValidator, {
  message: "{PATH} {VALUE} already exists.",
});

const groupSchema = new Schema({
  title: {
    type: String,
    required: true,
    unique: true,
    uniqueCaseInsensitive: true,
  },
});

groupSchema.plugin(uniqueValidator, {
  message: "{PATH} {VALUE} already exists.",
});

const roleSchema = new Schema({
  title: {
    type: String,
    required: true,
    unique: true,
    uniqueCaseInsensitive: true,
  },
});

roleSchema.plugin(uniqueValidator, {
  message: "{PATH} {VALUE} already exists.",
});

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      uniqueCaseInsensitive: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      uniqueCaseInsensitive: true,
      match: [/^\S*$/, "Username cannot contain spaces"],
    },
    password: {
      type: String,
      required: true,
    },
    loggedDevices: Array,
    groups: {
      type: Array,
      required: true,
    },
    roles: {
      type: Array,
      required: true,
    },
    contact: {
      tel: String,
      email: String,
    },
    isAdmin: Boolean,
    isModerator: Boolean,
    permissions: Object,
  },
  {
    minimize: false,
    //allows to save empty objects in db
  }
);
userSchema.plugin(uniqueValidator, {
  message: "{PATH} {VALUE} already exists.",
}); //https://www.npmjs.com/package/mongoose-unique-validator

const scheduleTaskSchema = new Schema(
  {
    activity: { type: Object, required: true },
    date: { type: Date, required: true },
    crew: Object,
    vehicle: Object,
    pickups: Array,
    details: String,
    author: { type: Object, required: true },
  },
  {
    minimize: false,
    //allows to save empty objects in db
  }
);

const frequentMeetingPointSchema = new Schema({
  name: String,
  frequency: Number,
});

const balanceSchema = new Schema({
  user: {
    name: { type: String, required: true },
    id: { type: String, required: true },
  },
  date: { type: Date, required: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, required: true },
  receiptUrl: { type: String },
});

const vehicleSchema = new Schema({
  plate: {
    type: String,
    required: true,
    unique: true,
    uniqueCaseInsensitive: true,
  },
});
vehicleSchema.plugin(uniqueValidator, {
  message: "{PATH} {VALUE} already exists.",
});

const announcementSchema = new Schema({
  title: { type: String, required: true },
  body: {
    type: String,
    required: [true, "You cannot publish an empty announcement"],
    minlength: [10, "Announcements must have more than 10 characters"],
  },
  date: { type: Date, default: Date.now },
  critical: { type: Boolean, required: true },
});

const bugReportSchema = new Schema({
  body: {
    type: String,
    required: [true, "You cannot publish an empty bug report"],
  },
  user: Object,
  date: { type: Date, default: Date.now },
});

const requestSchema = new Schema({
  requestedBy: { type: Object, required: true },
  handledBy: { type: Object, default: null },
  title: { type: String, required: true },
  messages: {
    type: [
      {
        type: {
          postedBy: { type: Object, required: true },
          date: { type: Date, default: Date.now },
          body: { type: String, required: true },
        },
        required: true,
      },
    ],
    required: [true, "You cannot submit an empty request"],
    validate: [
      (value) => value.length > 0,
      "You cannot submit an empty request",
    ],
  },
  closed: { type: Boolean, default: false },
  granted: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
});

const productsSchema = new Schema(
  {
    title: { type: String, required: true },
    product_code: { type: String, required: true },
    coordinates: { type: Object },
    address: { type: String },
    img_url: { type: String },
    platform_product_name: { type: String },
    product_description: { type: String },
    time_slots: { type: Array, required: true },
    pricing_options: { type: Array, required: true },
    compatible_billing_codes: { type: Array, required: true }, // all corresponding billing ids
    crewGroups: { type: Array, default: [] },
    crewRoles: { type: Array, default: [] },
  },
  {
    minimize: false,
  }
);

const meetingPointSchema = new Schema({
  name: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
});

const bookingSchema = new Schema(
  {
    ref: { type: String, default: "" }, //regiondo  === items[0].external_id
    booking_date: { type: String, required: true }, //regiondo  === created_at format to date
    date: { type: String, required: true }, //regiondo  === event_date_time
    product: { type: Object, required: true }, // lookup product_id in products collection
    product_time_slot: { type: String, required: true }, //regiondo  === event_date_time format to time
    client_name: { type: String, required: true }, //  contact_data.first_name + contact_data.last_name
    client_email: { type: String, default: "" }, // contact_data.email
    client_phone: { type: String, default: "" }, // contact_data.telephone
    tickets: { type: Object, default: {} }, // items
    billing_codes: { type: Array, default: [] }, // -
    client_location: { type: String, default: "" }, // -
    pickup_location: meetingPointSchema, // -
    pickup_time: { type: String, default: "" }, // -
    source: { type: String, required: true }, //
    client_messaged: { type: Boolean, default: false }, // -
    client_response_status: { type: String, default: "PENDING" }, // -
    notes: { type: String, default: "" }, // -
    group: { type: Number, default: 1 }, // -
    indexInGroup: { type: Number, default: 1 }, // -
    amended: { type: Boolean, default: false }, // -
    cancelled: { type: Boolean, default: false }, // -
    planned: { type: Boolean, default: false }, // -
    billed: { type: Boolean, default: false }, // -
    updated_at: { type: Array, required: true }, // -
  },
  {
    minimize: false,
    //allows to save empty objects in db
  }
);
bookingSchema.plugin(mongoosastic);
bookingSchema.plugin(mongoosePaginate);

const todoSchema = new Schema({
  body: { type: String, required: true },
  date: { type: String, required: true },
  author: { type: String, required: true },
  completedBy: { type: String, default: null },
});
todoSchema.plugin(mongoosePaginate);

const channelsSchema = new Schema({
  title: { type: String, required: true },
});

const appVersionSchema = new Schema({
  version: { type: String, required: true },
  date: { type: Date, default: Date.now },
  release_notes: { type: String, required: true },
  shouldBeForcedUpdate: { type: Boolean, required: true },
  ios: Boolean,
  android: Boolean,
});

module.exports = {
  UserModel: model("user", userSchema),
  ActivityModel: model("activity", activitySchema),
  VehicleModel: model("vehicle", vehicleSchema),
  BalanceModel: model("balance_transaction", balanceSchema),
  AnnouncementModel: model("announcement", announcementSchema),
  ScheduleTaskModel: model("schedule_task", scheduleTaskSchema),
  FrequentMeetingPointModel: model(
    "frequent_meeting_point",
    frequentMeetingPointSchema
  ),
  BugReportModel: model("bug_report", bugReportSchema),
  AppVersionModel: model("app_version", appVersionSchema),
  GroupModel: model("group", groupSchema),
  RoleModel: model("role", roleSchema),
  RequestModel: model("request", requestSchema),
  ProductsModel: model("products", productsSchema),
  BookingModel: model("booking", bookingSchema),
  ChannelModel: model("channel", channelsSchema),
  MeetingPointModel: model("meeting_point", meetingPointSchema),
  TodoModel: model("todo", todoSchema),
};
