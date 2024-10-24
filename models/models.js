const mongoose = require("mongoose")
const uniqueValidator = require("mongoose-unique-validator")
const { Schema, model } = mongoose
const _ = require("lodash")
const mongoosePaginate = require("mongoose-paginate-v2")
const mongooseAggregatePaginate = require("mongoose-aggregate-paginate-v2")
const mongoosastic = require("mongoosastic")
const moment = require("moment")
const deepDiff = require("deep-diff").diff
// npm install https://<GITHUB_ACCESS_TOKEN>@github.com/nospipi/getaways-projects-common-files.git
// require("getaways-projects-common-files/models/models.js");
// npm install https://github.com/nospipi/getaways-projects-common-files

// Function to recursively get all changed values
const getAllChangedValues = (changes, path = "") => {
  return changes.reduce((acc, change) => {
    const fullPath = path
      ? `${path}.${change.path.join(".")}`
      : change.path.join(".")
    if (change.kind === "E") {
      acc.push({
        path: fullPath,
        before: change.lhs,
        after: change.rhs,
      })
    } else if (change.kind === "A") {
      const nestedChanges = getAllChangedValues(change.item, fullPath)
      acc = acc.concat(nestedChanges)
    }
    return acc
  }, [])
}

//-------------------------------------------------------------------------------

const fileSchema = new Schema({
  name: String, // The original file name
  data: String, // Base64-encoded binary data
  contentType: String, // MIME type (e.g., image/jpeg, application/pdf)
})

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
})
activitySchema.plugin(uniqueValidator, {
  message: "{PATH} {VALUE} already exists.",
})

const groupSchema = new Schema({
  title: {
    type: String,
    required: true,
    unique: true,
    uniqueCaseInsensitive: true,
  },
})

groupSchema.plugin(uniqueValidator, {
  message: "{PATH} {VALUE} already exists.",
})

const roleSchema = new Schema({
  title: {
    type: String,
    required: true,
    unique: true,
    uniqueCaseInsensitive: true,
  },
})

roleSchema.plugin(uniqueValidator, {
  message: "{PATH} {VALUE} already exists.",
})

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
    afm_number: String,
    amka_number: String,
    driver_license_number: String,
    guide_reg_number: String,
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
    onOfficeDuty: Boolean,
    isEmergencyContact: Boolean,
    permissions: Object,
    shouldReceiveAnnouncements: Boolean,
  },
  {
    minimize: false,
    //allows to save empty objects in db
  }
)
userSchema.plugin(uniqueValidator, {
  message: "{PATH} {VALUE} already exists.",
}) //https://www.npmjs.com/package/mongoose-unique-validator

const frequentMeetingPointSchema = new Schema({
  name: String,
  frequency: Number,
})

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
})

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
  max_capacity: Number,
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
  platform_entry_required: {
    type: Boolean,
    required: true,
  },
})
vehicleSchema.plugin(uniqueValidator, {
  message: "{PATH} {VALUE} already exists.",
})

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
})

announcementSchema.plugin(mongoosePaginate)

const bugReportSchema = new Schema({
  body: {
    type: String,
    required: [true, "You cannot publish an empty bug report"],
  },
  user: String,
  date: { type: Date, default: Date.now },
})

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
})

const meetingPointSchema = new Schema(
  {
    name: { type: String, default: "" },
    address: { type: String, default: "" },
    latitude: { type: String, default: "" },
    longitude: { type: String, default: "" },
    google_maps_url: { type: String, default: "" },
    instructions: { type: String, default: "" },
    img_url: { type: String, default: "" },
  },
  {
    minimize: false,
  }
)

// const productsSchema = new Schema(
//   {
//     index: { type: Number, default: 0 },
//     title: {
//       type: String,
//       unique: true,
//       uniqueCaseInsensitive: true,
//       default: "",
//     },
//     options: {
//       type: [
//         {
//           title: { type: String },
//           bokun_code: { type: String },
//           is_private: { type: Boolean },
//           is_guided: { type: Boolean },
//           pickup_included: { type: Boolean },
//           requires_vehicle: { type: Boolean },
//           requires_platform_entry: { type: Boolean },
//           meeting_point_id: { type: String },
//         },
//       ],
//       default: [],
//     },
//     platform_product_name: {
//       type: String,
//       unique: true,
//       uniqueCaseInsensitive: true,
//       default: "",
//     },
//     bokun_product_code: {
//       type: String,
//       default: "",
//       unique: true,
//       uniqueCaseInsensitive: true,
//     },
//     location: {
//       type: {
//         address: { type: String },
//         latitude: { type: Number },
//         longitude: { type: Number },
//       },
//       default: {
//         address: "",
//         latitude: 37.9856983598462,
//         longitude: 23.719086989263594,
//       },
//     },
//     meeting_point_id: { type: String, default: "" },
//     slug: { type: String, default: "" },
//     product_images: { type: [String], default: [] },
//     product_pictures: {
//       type: [
//         {
//           id: { type: String },
//           url: { type: String },
//           caption: { type: String },
//           alt: { type: String },
//           description: { type: String },
//         },
//       ],
//       default: [],
//     },
//     guide_assignment_identifier: { type: String, default: "" },
//     activity_level: { type: String, default: "" },
//     additional_info: { type: [String], default: [] },
//     special_instructions: { type: [String], default: [] },
//     highlights: { type: [String], default: [] },
//     product_short_description: { type: String, default: "" },
//     product_full_description: { type: String, default: "" },
//     inclusions: { type: [String], default: [] },
//     exclusions: { type: [String], default: [] },
//     time_slots: { type: [String], default: [] },
//     time_slots_with_range: {
//       type: [
//         {
//           time_slot: { type: String },
//           isDefaultPickupTime: { type: Boolean },
//           label: { type: String },
//           bokun_start_time_id: { type: String },
//         },
//       ],
//       default: [],
//     },
//     pricing_options: { type: [String], default: [] },
//     destinations: { type: [String], default: [] },
//     tour_types: { type: [String], default: [] },
//     tour_duration: { type: String, default: "" },
//     tour_duration_type: { type: String, default: "" },
//     tour_categories: { type: [String], default: [] },
//     compatible_billing_codes: { type: [String], default: [] },
//     crewGroups: { type: [String], default: [] },
//     crewRoles: { type: [String], default: [] },
//     isPrivate: { type: Boolean, default: false },
//     isGuided: { type: Boolean, default: false },
//     pickupIncluded: { type: Boolean, default: false },
//     review_link: { type: String, default: "" },
//     affiliate_link: { type: String, default: "" },
//     isPublished: { type: Boolean, default: false },
//     market_price: { type: Number, default: 0 },
//     isCompleted: { type: Boolean, default: false },
//   },
//   {
//     minimize: false,
//   }
// )

// const productsSchema = new Schema(
//   {
//     index: { type: Number, required: true },
//     title: {
//       type: String,
//       required: true,
//       unique: true,
//       uniqueCaseInsensitive: true,
//     },
//     options: {
//       type: [
//         {
//           title: { type: String, required: true },
//           bokun_code: { type: String, required: true },
//           is_private: { type: Boolean, required: true },
//           is_guided: { type: Boolean, required: true },
//           pickup_included: { type: Boolean, required: true },
//           requires_vehicle: { type: Boolean, required: true },
//           requires_platform_entry: { type: Boolean, required: true },
//           meeting_point_id: { type: String },
//         },
//       ],
//     },
//     platform_product_name: {
//       required: true,
//       type: String,
//       unique: true,
//       uniqueCaseInsensitive: true,
//     },
//     bokun_product_code: {
//       type: String,
//       default: "",
//       unique: true,
//       uniqueCaseInsensitive: true,
//     },
//     location: {
//       type: {
//         address: String,
//         latitude: Number,
//         longitude: Number,
//       },
//     },
//     meeting_point_id: { type: String },
//     slug: { type: String },
//     product_images: { type: [String] },
//     product_pictures: {
//       type: [
//         {
//           url: String,
//           caption: String,
//           alt: String,
//           description: String,
//         },
//       ],
//     },
//     guide_assignment_identifier: { type: String },
//     activity_level: { type: String },
//     additional_info: { type: [String] },
//     special_instructions: { type: [String] },
//     highlights: { type: [String] },
//     product_short_description: { type: String },
//     product_full_description: { type: String },
//     inclusions: { type: [String] },
//     exclusions: { type: [String] },
//     time_slots: { type: [String], required: true },
//     time_slots_with_range: {
//       type: [
//         {
//           time_slot: String,
//           isDefaultPickupTime: Boolean,
//           label: String,
//           bokun_start_time_id: String,
//         },
//       ],
//     },
//     pricing_options: { type: [String], required: true },
//     destinations: { type: [String], required: true },
//     tour_types: { type: [String], required: true },
//     tour_duration: { type: String, required: true },
//     tour_duration_type: { type: String },
//     tour_categories: { type: [String], required: true },
//     compatible_billing_codes: { type: Array },
//     crewGroups: { type: [String], default: [] },
//     crewRoles: { type: [String], default: [] },
//     isPrivate: { type: Boolean, required: true },

//     isGuided: { type: Boolean, required: true },
//     pickupIncluded: { type: Boolean, required: true },
//     review_link: { type: String },
//     affiliate_link: { type: String },
//     isPublished: { type: Boolean, required: true },
//     market_price: { type: Number, required: true },
//   },
//   {
//     minimize: false,
//   }
// );

const productsSchema = new Schema(
  {
    index: { type: Number, default: null },
    title: {
      type: String,
      unique: true,
      uniqueCaseInsensitive: true,
      default: null,
    },
    options: {
      type: [
        {
          title: { type: String },
          bokun_code: { type: String },
          is_private: { type: Boolean },
          is_guided: { type: Boolean },
          pickup_included: { type: Boolean },
          requires_vehicle: { type: Boolean },
          requires_platform_entry: { type: Boolean },
          description: { type: String },
          meeting_point_id: { type: String },
        },
      ],
      default: null,
    },
    platform_product_name: {
      type: String,
      unique: true,
      uniqueCaseInsensitive: true,
      default: null,
    },
    bokun_product_code: {
      type: String,
      default: null,
      unique: true,
      uniqueCaseInsensitive: true,
    },
    location: {
      type: {
        address: { type: String },
        latitude: { type: Number },
        longitude: { type: Number },
      },
      default: {
        address: null,
        latitude: null,
        longitude: null,
      },
    },
    meeting_point_id: { type: String, default: null },
    slug: { type: String, default: null },
    product_images: { type: [String], default: null },
    product_pictures: {
      type: [
        {
          id: { type: String },
          url: { type: String },
          caption: { type: String },
          alt: { type: String },
          description: { type: String },
        },
      ],
      default: null,
    },
    guide_assignment_identifier: { type: String, default: null },
    activity_level: { type: String, default: null },
    additional_info: { type: [String], default: null },
    special_instructions: { type: [String], default: null },
    highlights: { type: [String], default: null },
    product_short_description: { type: String, default: null },
    product_full_description: { type: String, default: null },
    inclusions: { type: [String], default: null },
    exclusions: { type: [String], default: null },
    time_slots: { type: [String], default: null },
    time_slots_with_range: {
      type: [
        {
          time_slot: { type: String },
          isDefaultPickupTime: { type: Boolean },
          label: { type: String },
          bokun_start_time_id: { type: String },
        },
      ],
      default: null,
    },
    pricing_options: { type: [String], default: null },
    destinations: { type: [String], default: null },
    tour_types: { type: [String], default: null },
    tour_duration: { type: String, default: null },
    tour_duration_type: { type: String, default: null },
    tour_categories: { type: [String], default: null },
    compatible_billing_codes: { type: [String], default: null },
    crewGroups: { type: [String], default: null },
    crewRoles: { type: [String], default: null },
    isPrivate: { type: Boolean, default: null },
    isGuided: { type: Boolean, default: null },
    pickupIncluded: { type: Boolean, default: null },
    review_link: { type: String, default: null },
    affiliate_link: { type: String, default: null },
    isPublished: { type: Boolean, default: null },
    market_price: { type: Number, default: null },
    isAvailableInPlan: { type: Boolean, default: null },
    isCompleted: { type: Boolean, default: null },
  },
  {
    minimize: false,
  }
)

// productsSchema.plugin(uniqueValidator, {
//   message: "{PATH} {VALUE} already exists.",
// }) //https://www.npmjs.com/package/mongoose-unique-validator

// Pre-save middleware to set the slug based on platform_product_name
productsSchema.pre("save", function (next) {
  if (this.platform_product_name) {
    this.slug = _.kebabCase(this.platform_product_name)
  }
  next()
})

productsSchema.pre("findByIdAndUpdate", function (next) {
  if (this.platform_product_name) {
    this.slug = _.kebabCase(this.platform_product_name)
  }
  next()
})

const channelsSchema = new Schema({
  title: { type: String, required: true },
  commission_rate: { type: Number, required: true },
})

const bookingSchema = new Schema(
  {
    ref: { type: String, default: "" },
    order_number: { type: String, default: "" },
    product_id: { type: String, default: "" },
    option_id: { type: String, default: "" },
    channel_id: { type: String, default: "" },
    start_time_id: { type: String, default: "" }, //to inform tour group builder
    product_time_slot: { type: String },
    booking_date: { type: String },
    date: { type: String },
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
    client_messaged: { type: Boolean, default: false },
    client_response_status: { type: String, default: "PENDING" },
    notes: { type: String, default: "" },
    notes_list: { type: Array, default: [] },
    group: { type: Number, default: 1 },
    cancelled: { type: Boolean, default: false },
    planned: { type: Boolean, default: false },
    billed: { type: Boolean, default: false },
    total_paid: { type: Number, default: 0.0 },
    updated_at: { type: Array },
    email_history: { type: Array, default: [] },
    task_id: { type: String },
    tour_group_id: { type: String },
  },
  {
    minimize: false,
    //allows to save empty objects in db
  }
)
bookingSchema.plugin(mongoosastic)
bookingSchema.plugin(mongoosePaginate)

bookingSchema.pre("findOneAndUpdate", async function (next) {
  console.log("PRE MIDDLEWARE IN BOOKING SCHEMA")
  try {
    const initialValues = this.getQuery()
    const old = await this.model.findOne(initialValues).lean() // Using lean() to get plain JavaScript object
    delete old.__v
    delete old._id
    //delete old.pickup_location._id;
    if (old.pickup_location && old.pickup_location._id) {
      delete old.pickup_location._id
    }
    delete old.updated_at
    delete old.email_history

    const updatedValues = this.getUpdate()
    const updatedValuesWithExclusions = Object.keys(updatedValues).reduce(
      (obj, key) => {
        if (key !== "__v" && key !== "_id" && key !== "updated_at") {
          obj[key] = updatedValues[key]
        }
        return obj
      },
      {}
    )

    const differences = deepDiff(old, updatedValuesWithExclusions)

    if (differences) {
      const changes = differences.map((diff) => ({
        path: diff.path.join("."),
        before: diff.lhs,
        after: diff.rhs,
      }))
      const filter = [
        "pickup_location.__v",
        "pickup_location._id",
        "pickup_location",
      ]
      const filteredChanges = changes.filter(
        (change) => !filter.includes(change.path)
      )

      if (Array.isArray(updatedValues.updated_at)) {
        const lastUpdated = updatedValues.updated_at.slice(-1)[0]
        lastUpdated.changes = filteredChanges
      }
    }

    next()
  } catch (err) {
    console.log("ERROR FROM PRE MIDDLEWARE IN BOOKING SCHEMA", err)
    next(err)
  }
})

const tourGroupSchema = new Schema({
  product_id: String,
  product: String,
  option_id: String,
  start_time_id: String,
  date: String,
  time: String,
  bookings: [{ type: Schema.Types.ObjectId, ref: "booking" }], //need to be populated
  task_id: String,
  notes: String,
  notes_list: { type: Array, default: [] }, // -
  visible_in_planner: { type: Boolean, default: true },
  guide_id: String,
  guide_uds_id: String,
  guide_confirmation: String,
  guide_details: String,
  guides_asked: Array,
  guide_email_sent: Boolean,
  vehicle_id: String,
  index: {
    type: Number,
    default: 1,
  },
  vehicle_platform_entry: String,
})

//TODO temporary //unset product when is fixed in all apps
tourGroupSchema.pre("save", function (next) {
  if (this.product_id && !this.product) {
    this.product = this.product_id
  }
  next()
})

tourGroupSchema.plugin(mongoosePaginate)
tourGroupSchema.plugin(mongooseAggregatePaginate)

const userDayScheduleSchema = new Schema(
  {
    date: { type: String },
    user: { type: String, required: true },
    tourGroups: {
      type: [
        {
          role: String, //role schema id
          id: String, //tourGroups schema id
          details: String,
        },
      ],
      default: [],
    },
    isDayOff: { type: Boolean, default: false },
    isLeave: { type: Boolean, default: false },
    isSeen: { type: Boolean, default: false },
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
)

userDayScheduleSchema.plugin(mongoosePaginate)
userDayScheduleSchema.plugin(mongooseAggregatePaginate)

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
})
notificationSchema.plugin(mongoosePaginate)

const PwaPushSubscriptionSchema = new mongoose.Schema({
  endpoint: String,
  keys: {
    p256dh: String,
    auth: String,
  },
})

const taskGuestSchema = new Schema({
  name: { type: String, default: "" },
  count: { type: Number, default: 1 },
})

const pickupSchema = new Schema({
  meeting_point: String,
  time: String,
  details: String,
  lat: String,
  lon: String,
  guests: [taskGuestSchema],
})

const scheduleTaskSchema = new Schema(
  {
    activity: { type: Object, required: true },
    date: { type: Date, required: true },
    crew: Object,
    vehicle: Object,
    pickups: [pickupSchema],
    details: String,
    author: { type: Object, required: true },
  },
  {
    minimize: false,
    //allows to save empty objects in db
  }
)

scheduleTaskSchema.plugin(mongoosePaginate)
scheduleTaskSchema.plugin(mongooseAggregatePaginate)

const taskSchema = new Schema(
  {
    product: { type: String, required: true },
    option_id: { type: String, required: true },
    date: { type: String, required: true },
    assignees: Array,
    vehicle_id: String,
    pickups: [pickupSchema],
    details: String,
    tour_group_id: String,
    author_id: { type: String, required: true },
  },
  {
    minimize: false,
    //allows to save empty objects in db
  }
)

taskSchema.plugin(mongoosePaginate)
taskSchema.plugin(mongooseAggregatePaginate)

const todoSchema = new Schema({
  body: { type: String, required: true },
  date: { type: String, required: true },
  author: { type: String, required: true },
  completedBy: { type: String, default: null },
})
todoSchema.plugin(mongoosePaginate)

const noteSchema = new Schema({
  body: { type: String, required: true },
  date: {
    type: String,
    default: () => moment().format("YYYY-MM-DD"),
  },
  author_id: { type: String, required: true },
  pinned: { type: Boolean, default: false },
  public: { type: Boolean, default: false },
  done: { type: Boolean, default: false },
})
noteSchema.plugin(mongoosePaginate)
noteSchema.plugin(mongooseAggregatePaginate)

const calendarNoteSchema = new Schema({
  body: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  date: String,
  author_id: { type: String, required: true },
  public: { type: Boolean, default: false },
})
calendarNoteSchema.plugin(mongoosePaginate)
calendarNoteSchema.plugin(mongooseAggregatePaginate)

const appVersionSchema = new Schema({
  version: { type: String, required: true },
  date: { type: Date, default: Date.now },
  release_notes: { type: String, required: true },
  shouldBeForcedUpdate: { type: Boolean, required: true },
  ios: Boolean,
  android: Boolean,
})

const g4sTrackingSessionCredentialsSchema = new Schema({
  username: String,
  password: String,
  UserIdGuid: String,
  SessionId: String,
})

const portalUserActionSchema = new Schema({
  date_time: { type: Date, default: Date.now },
  user_action: String,
})

const portalUserSessionSchema = new Schema({
  date_time: { type: Date, default: Date.now },
  booking_ref: String,
  booking_date: String,
  client_name: String,
  client_phone: String,
  product_title: String,
  session_actions: { type: [portalUserActionSchema], default: [] },
  device_info: Object,
  sessionDurationInSeconds: Number,
})
portalUserSessionSchema.plugin(mongoosePaginate)
portalUserSessionSchema.plugin(mongooseAggregatePaginate)

const vehicleServiceLogEntrySchema = new Schema({
  vehicle_id: String,
  assignee: String,
  workshop: String,
  date: String,
  odometer: String,
  cost: String,
  repairs: [String],
  notes: String,
})
vehicleServiceLogEntrySchema.plugin(mongoosePaginate)

const bokunDataSchema = new Schema({
  action: String,
  ref: String,
  data: {
    type: Schema.Types.Mixed, // Allows any data type
  },
  date: {
    type: String,
    default: moment().format("YYYY-MM-DD HH:mm:ss"),
  },
})

const messageDraftSchema = new Schema({
  title: String,
  body: String,
})

const ticketsAvailabilitySchema = new Schema({
  place: String,
  placedate: String,
  id: String,
  slots: [
    {
      zone: String,
      id: String,
      avail: String,
    },
  ],
})

ticketsAvailabilitySchema.pre("save", function (next) {
  this.id = this.place + this.placedate
  next()
})

const availabilityToolVisitorSchema = new Schema({
  ip: String,
  city: String,
  country: String,
  latitude: String,
  longitude: String,
  region: String,
  timestamp: String,
})

//------------------------- TEST FOR BALANCE FEATURE ----------------------------

const walletSchema = new Schema(
  {
    title: { type: String, required: true },
    user: { type: String, required: true },
    balance: { type: Number, required: true },
  },
  { timestamps: true }
)

const categorySchema = new Schema(
  {
    title: { type: String, required: true },
    user: { type: String, required: true },
  },
  { timestamps: true }
)

const transactionSchema = new Schema(
  {
    wallet: { type: Schema.Types.ObjectId, ref: "wallet", required: true },
    category: { type: Schema.Types.ObjectId, ref: "category", required: true },
    user: { type: String, required: true },
    amount: { type: Number, required: true },
    date: {
      type: String,
      default: moment().format("YYYY-MM-DD"),
      required: true,
    },
    description: { type: String, required: true },
  },
  { timestamps: true }
)

transactionSchema.pre("save", async function (next) {
  try {
    const wallet = await mongoose.model("wallet").findById(this.wallet)
    if (!wallet) {
      throw new Error("Wallet not found")
    }

    // Accumulate the wallet's balance
    wallet.balance += this.amount

    // Save the updated wallet
    await wallet.save()

    next()
  } catch (error) {
    next(error)
  }
})

//--------------------------------------------------------------

module.exports = {
  FileModel: model("file", fileSchema),
  UserModel: model("user", userSchema),
  ActivityModel: model("activity", activitySchema),
  VehicleModel: model("vehicle", vehicleSchema),
  BalanceModel: model("balance_transaction", balanceSchema),
  AnnouncementModel: model("announcement", announcementSchema),
  TaskModel: model("task", taskSchema),
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
  NoteModel: model("note", noteSchema),
  CalendarNoteModel: model("calendar_note", calendarNoteSchema),
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
  BokunDataModel: model("bokun_data", bokunDataSchema),
  MessageDraftModel: model("message_draft", messageDraftSchema),
  TicketsAvailabilityModel: model(
    "tickets_availability",
    ticketsAvailabilitySchema
  ),
  AvailabilityToolVisitorModel: model(
    "availability_tool_visitor",
    availabilityToolVisitorSchema
  ),
  WalletModel: model("wallet", walletSchema),
  CategoryModel: model("category", categorySchema),
  TransactionModel: model("transaction", transactionSchema),
}
