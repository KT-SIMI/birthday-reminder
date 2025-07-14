const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRouter = require('./routes/userRouter')
const session = require('express-session');
const MongoStore = require('connect-mongo')
const clientRouter = require('./routes/clientRouter');
const { auth } = require('./middleware/auth');
require("dotenv").config();


(async () => {
  try {
    mongoose.connect(process.env.MONGO_URL, {
      serverSelectionTimeoutMS: 25000,
    });
    console.log(`DB connected`);
  } catch (err) {
    console.log("DB error :::::::", err);
    process.exit(1);
  }
})();

const app = express();

const sessOption = {
  secret: process.env.SESSION_SECRET,
  proxy: true,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.ENV === "prod",
    sameSite: process.env.ENV === "prod" ? "none" : "",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  },
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_STORE,
    ttl: 14 * 24 * 60 * 60, // 14 days
    autoRemove: "native",
  }),
};


const allowedOrigins = [
  "http://localhost:3330",
  "http://localhost:5373",
  "https://birthday-reminder-092d.onrender.com",
  "https://birthday-reminder-client-x6r8.onrender.com"
];

const corsOptions = {
  origin: function (origin, callback) {
    console.log(origin)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  methods: "POST, GET, DELETE, PUT, OPTIONS, PATCH",
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(cors(corsOptions))
app.use(session(sessOption))

app.use((req, res, next) => {
  // console.log("Request Headers:", req.headers);
  console.log(`Incoming request: ${req.method} ${req.url}`);
  // console.log("Session Data:", req.session.token);
  next();
});


app.get("/", (req, res) => {
  res.send("API is up!");
});

app.use("/api", userRouter)
app.use("/api/client", auth, clientRouter)

app.use((err, req, res, next) => {
  console.error(err); // Log for debugging

  const statusCode = err.status || 500;
  const message = err.msg || err.response?.data?.message || err.response?.data?.error || err.message || "Something went wrong";


  res.status(statusCode).json({
    status: "error",
    msg: message,
  });
});

const port = 3330

app.listen(port, "0.0.0.0", () => {
  console.log(`Server started on port ${port}`)
})