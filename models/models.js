const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const { Schema, model } = mongoose;
const mongoosePaginate = require("mongoose-paginate-v2");
const mongooseAggregatePaginate = require("mongoose-aggregate-paginate-v2");
const mongoosastic = require("mongoosastic");
// npm install https://<GITHUB_ACCESS_TOKEN>@github.com/nospipi/getaways-projects-common-files.git
// require("getaways-projects-common-files/models/models.js");
// npm install https://github.com/nospipi/getaways-projects-common-files

//-------------------------------------------------------------------------------

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
    mobileLogStatus: {
      type: Boolean,
      default: false,
    },
    loggedDevices: Array,
    expoPushTokens: [String],
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
    id_number: String,
    web_app_user_preferences: {
      notifications: {
        type: Object,
        default: {
          shown: {
            new_booking: true,
            booking_changed_date: true,
            booking_cancelled: true,
            client_confirmed: true,
            client_updated_location: true,
          },
        },
      },
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
  type: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    required: true,
  },
  gps_tracker_uid: String,
  position: {
    latitude: Number,
    longitude: Number,
    speed: Number,
    heading: Number,
    updated_at: Date,
  },
  upcoming_scheduled_service: {
    type: [
      {
        date: String,
        time: String,
        workshop: String,
        planned_repairs: [String],
      },
    ],
    default: [],
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
  pinned: { type: Boolean, default: false },
  author: { type: String, required: true },
});

announcementSchema.plugin(mongoosePaginate);

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

const meetingPointSchema = new Schema(
  {
    name: { type: String, default: "" },
    address: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
    google_maps_url: { type: String },
    instructions: { type: String },
    img_url: { type: String },
  },
  {
    minimize: false,
  }
);

const productsSchema = new Schema(
  {
    title: { type: String, required: true },
    type: { type: String },
    product_code: { type: String, default: "" },
    bokun_product_code: { type: String, default: "" },
    location: {
      type: {
        address: String,
        latitude: Number,
        longitude: Number,
      },
    },
    meeting_point_id: { type: String },
    img_url: { type: String },
    product_images: { type: [String] },
    activity_level: { type: String },
    additional_info: { type: [String] },
    special_instructions: { type: [String] },
    highlights: { type: [String] },
    platform_product_name: { type: String },
    product_description: { type: String },
    time_slots: { type: [String], required: true },
    pricing_options: { type: [String], required: true },
    compatible_billing_codes: { type: Array, required: true }, // all corresponding billing ids
    crewGroups: { type: Array, default: [] },
    crewRoles: { type: Array, default: [] },
    isPrivate: { type: Boolean, required: true },
    isGuided: { type: Boolean, required: true },
    pickupIncluded: { type: Boolean, required: true },
    review_link: { type: String },
  },
  {
    minimize: false,
  }
);

const channelsSchema = new Schema({
  title: { type: String, required: true },
});

const bookingSchema = new Schema(
  {
    ref: { type: String, default: "" }, //regiondo  === items[0].external_id
    order_number: { type: String, default: "" }, //regiondo  === order_number
    booking_date: { type: String }, //regiondo  === created_at format to date
    date: { type: String }, //regiondo  === event_date_time
    product: { type: Object }, // lookup product_id in products collection
    product_time_slot: { type: String }, //regiondo  === event_date_time format to time
    name: { type: String, default: "" }, //for scheduleTask,for not breaking mobile app !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    count: { type: Number, default: 1 }, //for scheduleTask,for not breaking mobile app !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    client_name: { type: String }, //  contact_data.first_name + contact_data.last_name
    client_email: { type: String, default: "" }, // contact_data.email
    client_phone: { type: String, default: "" }, // contact_data.telephone
    tickets: { type: Object, default: {} }, // items
    billing_codes: { type: Array, default: [] }, // -
    client_location: { type: String, default: "" }, // -
    pickup_location: meetingPointSchema, // -
    pickup_time: { type: String, default: "" }, // -
    channel: { type: Object, default: {} }, // -
    client_messaged: { type: Boolean, default: false }, // -
    client_response_status: { type: String, default: "PENDING" }, // -
    notes: { type: String, default: "" }, // -
    notes_list: { type: Array, default: [] }, // -
    group: { type: Number, default: 1 }, // -
    amended: { type: Boolean, default: false }, // -
    cancelled: { type: Boolean, default: false }, // -
    planned: { type: Boolean, default: false }, // -
    billed: { type: Boolean, default: false }, // -
    total_paid: { type: Number, default: 0.0 },
    updated_at: { type: Array }, // -
    email_history: { type: Array, default: [] }, // -
    task_id: { type: String }, // -
    tour_group_id: { type: String }, // -
  },
  {
    minimize: false,
    //allows to save empty objects in db
  }
);
bookingSchema.plugin(mongoosastic);
bookingSchema.plugin(mongoosePaginate);

const tourGroupSchema = new Schema({
  product: String,
  date: String,
  time: String,
  bookings: [{ type: Schema.Types.ObjectId, ref: 'booking' }], //need to be populated 
  task: String,
  notes: String,
  notes_list: { type: Array, default: [] }, // -
  guide: { type: String, default: "unassigned" },
  guide_confirmation: String,
  assignees: {
    type: [{
      role: String, //role schema id
      id: String, //user schema id
      seen: { type: Boolean, default: false },
      comments: [{
        text: String,
        date: String,
        author: String,
      },]
    }], default: []
  },
  vehicle_id: String, //vehicle schema id
  index: {
    type: Number,
    default: 1,
  },
});

//tourGroupSchema.plugin(mongooseAggregatePaginate);
tourGroupSchema.plugin(mongoosePaginate);

const messageSchema = new Schema({
  date: { type: String },
  body: { type: String },
  isDeleted: { type: Boolean, default: false },
  isPublic: { type: Boolean, default: false },
});

const taskGuestSchema = new Schema({
  name: { type: String, default: "" },
  count: { type: Number, default: 1 },
  booking_id: { type: String, default: "" },
  messages: {
    type: [messageSchema],
    default: [],
  },
});

const pickupSchema = new Schema({
  meeting_point: String,
  time: String,
  details: String,
  lat: Number,
  lon: Number,
  distance_to_vehicle: Object,
  guests: [taskGuestSchema],
});

const userDayScheduleSchema = new Schema(
  {
    date: { type: String },
    user: { type: String, required: true },
    isDayOff: { type: Boolean, default: false },
    isLeave: { type: Boolean, default: false },
    isSeen: { type: Boolean, default: false },
    isSeenBy: { type: Array, default: [] }, // to be deprecated
    tasks: [{ type: String }], // to be deprecated
    tourGroups: [{ type: Array, default: [] }], // to be deprecated
    comments: [
      {
        text: String,
        date: String,
        user: String,
      },
    ],
  },
  {
    minimize: false,
  }
);

userDayScheduleSchema.plugin(mongoosePaginate);
userDayScheduleSchema.plugin(mongooseAggregatePaginate);

const notificationSchema = new Schema({
  title: { type: String, required: true },
  body: String,
  date: { type: Date, default: Date.now },
  data: {
    type: Object,
    default: {
      type: { type: String, default: "" },
    },
  },
});
notificationSchema.plugin(mongoosePaginate);

const PwaPushSubscriptionSchema = new mongoose.Schema({
  endpoint: String,
  keys: {
    p256dh: String,
    auth: String,
  },
});

const scheduleTaskSchema = new Schema(
  {
    activity: { type: Object, required: true },
    date: { type: Date, required: true },
    crew: Object,
    vehicle: Object,
    pickups: [pickupSchema],
    details: String,
    author: { type: Object, required: true },
    vehicle_position: Array,
  },
  {
    minimize: false,
    //allows to save empty objects in db
  }
);

scheduleTaskSchema.plugin(mongoosePaginate);
scheduleTaskSchema.plugin(mongooseAggregatePaginate);

const dayScheduleSchema = new Schema(
  {
    tour_group_id: { type: String }, // schema tour_group _id || "day_off", contains date,vehicle information
    assignees: {
      type: [{
        id: String,
        comments: [{
          text: String,
          date: String,
          author: String,
        },]
      }], default: []
    },// schema user _id
    is_seen_by: { type: [String], default: [] },
  },
  {
    minimize: false,
  }
);

dayScheduleSchema.plugin(mongoosePaginate);
dayScheduleSchema.plugin(mongooseAggregatePaginate);

const todoSchema = new Schema({
  body: { type: String, required: true },
  date: { type: String, required: true },
  author: { type: String, required: true },
  completedBy: { type: String, default: null },
});
todoSchema.plugin(mongoosePaginate);

const appVersionSchema = new Schema({
  version: { type: String, required: true },
  date: { type: Date, default: Date.now },
  release_notes: { type: String, required: true },
  shouldBeForcedUpdate: { type: Boolean, required: true },
  ios: Boolean,
  android: Boolean,
});

const g4sTrackingSessionCredentialsSchema = new Schema({
  username: String,
  password: String,
  UserIdGuid: String,
  SessionId: String,
});

const portalUserActionSchema = new Schema({
  date_time: { type: Date, default: Date.now },
  user_action: String,
});

const portalUserSessionSchema = new Schema({
  date_time: { type: Date, default: Date.now },
  booking_ref: String,
  booking_date: String,
  client_name: String,
  product_title: String,
  session_actions: { type: [portalUserActionSchema], default: [] },
  device_info: Object,
  sessionDurationInSeconds: Number,
});
portalUserSessionSchema.plugin(mongoosePaginate);

const vehicleServiceLogEntrySchema = new Schema({
  vehicle_id: String,
  assignee: String,
  workshop: String,
  date: String,
  odometer: String,
  cost: String,
  repairs: [String],
  notes: String,
});
vehicleServiceLogEntrySchema.plugin(mongoosePaginate);

const BokunTestSchema = new Schema({
  data: {
    type: Object,
  },
  ref: { type: String, default: "" },
  order_number: { type: String, default: "" },
  booking_date: { type: String },
  date: { type: String },
  product: { type: Object },
  product_time_slot: { type: String },
  name: { type: String, default: "" },
  count: { type: Number, default: 1 },
  client_name: { type: String },
  client_email: { type: String, default: "" },
  client_phone: { type: String, default: "" },
  tickets: { type: Object, default: {} },
  billing_codes: { type: Array, default: [] },
  client_location: { type: String, default: "" },
  pickup_location: meetingPointSchema,
  pickup_time: { type: String, default: "" },
  channel: { type: Object, default: {} },
  client_messaged: { type: Boolean, default: false },
  client_response_status: { type: String, default: "PENDING" },
  notes: { type: String, default: "" },
  group: { type: Number, default: 1 },
  indexInGroup: { type: Number, default: 1 },
  amended: { type: Boolean, default: false },
  cancelled: { type: Boolean, default: false },
  planned: { type: Boolean, default: false },
  billed: { type: Boolean, default: false },
  total_paid: { type: Number, default: 0.0 },
  updated_at: { type: Array },
  email_history: { type: Array, default: [] },
  task_id: { type: String },
});

//--------------------------------------------------------------

module.exports = {
  UserModel: model("user", userSchema),
  ActivityModel: model("activity", activitySchema),
  VehicleModel: model("vehicle", vehicleSchema),
  BalanceModel: model("balance_transaction", balanceSchema),
  AnnouncementModel: model("announcement", announcementSchema),
  ScheduleTaskModel: model("schedule_task", scheduleTaskSchema),
  UserDayScheduleModel: model("user_day_schedule", userDayScheduleSchema),
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
  TourGroupModel: model("tour_group", tourGroupSchema),
  ChannelModel: model("channel", channelsSchema),
  MeetingPointModel: model("meeting_point", meetingPointSchema),
  PickupModel: model("pickup", pickupSchema),
  TodoModel: model("todo", todoSchema),
  NotificationModel: model("notification", notificationSchema),
  PwaPushSubscriptionModel: model(
    "pwa_push_subscription",
    PwaPushSubscriptionSchema
  ),
  G4STrackingSessionCredentialsModel: model(
    "g4s_tracking_session_credentials",
    g4sTrackingSessionCredentialsSchema
  ),
  PortalUserSessionModel: model("portal_user_session", portalUserSessionSchema),
  VehicleServiceLogEntryModel: model(
    "vehicle_service_log_entry",
    vehicleServiceLogEntrySchema
  ),
  BokunTestModel: model("bokun_test", BokunTestSchema),
};
