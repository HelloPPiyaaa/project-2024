const http = require("http");
const express = require("express");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const serviceAccountKey = require("./kku-blogging-firebase-adminsdk-blvad-4d6e110e4e.json");
const cookieParser = require("cookie-parser");
const admin = require("firebase-admin");
const { getAuth } = require("firebase-admin/auth");
const jwt = require("jsonwebtoken");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://kku-blogging-sv.onrender.com",
      "https://willowy-sundae-e9aa9e.netlify.app",
    ],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});
require("dotenv").config();

const port = process.env.PORT || 3001;
console.log("JWT_SECRET:", process.env.JWT_SECRET);

app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://kku-blogging-sv.onrender.com",
      "https://willowy-sundae-e9aa9e.netlify.app",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey),
});

app.use(cookieParser());
app.use(express.json());

const registerRouter = require("./routes/register");
const loginRouter = require("./routes/login");
const profileRouter = require("./routes/profile");
const AdminRegister = require("./routes/adminRegister");
const postRouter = require("./routes/post");
const AdminProfile = require("./routes/adminProfile");
const ForgotPassword = require("./routes/forgotPassword");
const chatRouter = require("./routes/chat");
const messageRouter = require("./routes/message");
const find = require("./routes/find");
const resetPasswordRouter = require("./routes/resetPassword");
const FollowUser = require("./routes/follow");
const notificationRouter = require("./routes/notifications");
const questionRouter = require("./routes/QuestionRoutes");
const reportRouter = require("./routes/reports");
const User = require("./models/user");
const BlogCreated = require("./routes/blog");
const Post = require("./models/blog");

app.use("/signup", registerRouter);
app.use("/signin", loginRouter);
app.use("/notifications", notificationRouter);
app.use("/register", registerRouter);
app.use("/login", loginRouter);
app.use("/profile", profileRouter);
app.use("/posts", postRouter);
app.use("/forgot-password", ForgotPassword);
app.use("/chats", chatRouter);
app.use("/messages", messageRouter);
app.use("/users", find);
app.use("/reset_password", resetPasswordRouter);
app.use("/follow", FollowUser);
app.use("/admin", AdminProfile);
app.use("/admin/register", AdminRegister);
app.use("/api/questions", questionRouter);
app.use("/api/report", reportRouter);
app.use("/create-blog", BlogCreated);

const generateUsername = async (email) => {
  const { nanoid } = await import("nanoid");
  let username = email.split("@")[0];

  const isUsernameNotUnique = await User.exists({ username }).then(
    (result) => result
  );

  if (isUsernameNotUnique) {
    username += nanoid().substring(0, 5);
  }

  return username;
};
const formDatatoSend = (user) => {
  const access_token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  return {
    access_token,
    userId: user._id,
    profile_picture: user.profile_picture,
    username: user.username,
    fullname: user.fullname,
  };
};
module.exports = formDatatoSend;

app.post("/google-auth", async (req, res) => {
  const { access_token } = req.body;

  if (!access_token) {
    return res.status(400).json({ error: "Token is required" });
  }

  try {
    // ตรวจสอบ ID Token
    const decodedUser = await getAuth().verifyIdToken(access_token);
    const { email, name, picture } = decodedUser;

    // ปรับขนาดรูปภาพ
    const profilePicture = picture.replace("s96-c", "s384-c");

    // ค้นหาผู้ใช้ในฐานข้อมูล
    let user = await User.findOne({ email }).select(
      "fullname username profile_picture google_auth"
    );

    if (user) {
      if (!user.google_auth) {
        return res.status(403).json({
          error:
            "อีเมลนี้ได้ลงทะเบียนโดยไม่ใช้ Google แล้ว กรุณาเข้าสู่ระบบด้วยรหัสผ่านเพื่อเข้าถึงบัญชี",
        });
      }
    } else {
      // สร้างผู้ใช้ใหม่
      const username = await generateUsername(email);

      user = new User({
        fullname: name,
        email,
        username,
        google_auth: true,
      });

      user = await user.save();
    }

    return res.status(200).json(formDatatoSend(user));
  } catch (err) {
    console.error("Authentication error:", err);
    // ตรวจสอบว่าเคยส่งการตอบกลับไปยังไคลเอนต์หรือยัง
    if (!res.headersSent) {
      return res.status(500).json({
        error:
          "ล้มเหลวในการรับรองความถูกต้องของคุณกับ Google ลองใช้บัญชี Google อื่น",
      });
    }
  }
});

// app.post("/get-upload-picture", upload.single("file"), (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: "No file uploaded" });
//     }

//     return res.status(200).json({
//       message: "File uploaded successfully",
//       filename: req.file.filename,
//     });
//   } catch (err) {
//     console.log(err.message);
//     return res.status(500).json({ error: err.message });
//   }
// });

app.post("/search-blogs", (req, res) => {
  const { tag, author, query, page, limit, eliminate_blog } = req.body;
  let findQuery = { tags: tag, draft: false };

  if (tag) {
    const lowerCaseTag = tag.toLowerCase();
    findQuery = {
      tags: lowerCaseTag,
      draft: false,
      blog_id: { $ne: eliminate_blog },
    };
  } else if (query) {
    findQuery = { draft: false, topic: new RegExp(query, "i") };
  } else if (author) {
    findQuery = { author, draft: false };
  }
  const maxLimit = limit ? limit : 2;

  Post.find(findQuery)
    .populate("author", "profile_picture username fullname -_id")
    .sort({ publishedAt: -1 })
    .select("blog_id topic des banner activity tags publishedAt -_id")
    .skip((page - 1) * maxLimit)
    .limit(maxLimit)
    .then((blogs) => {
      return res.status(200).json({ blogs });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});

app.post("/search-blogs-count", (req, res) => {
  const { tag, query, author } = req.body;
  let findQuery;

  if (tag) {
    const lowerCaseTag = tag.toLowerCase();
    findQuery = { tags: lowerCaseTag, draft: false };
  } else if (query) {
    findQuery = { draft: false, topic: new RegExp(query, "i") };
  } else if (author) {
    findQuery = { author, draft: false };
  }

  Post.countDocuments(findQuery)
    .then((count) => {
      return res.status(200).json({ totalDocs: count });
    })
    .catch((err) => {
      console.log(err.message);
      return res.status(500).json({ error: err.message });
    });
});

app.post("/search-users", (req, res) => {
  let { query } = req.body;

  User.find({ username: new RegExp(query, "i") })
    .limit(50)
    .select("fullname username profile_picture -_id")
    .then((users) => {
      return res.status(200).json({ users });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});

// Connect to MongoDB
mongoose
  .connect(process.env.ATLAS_URI)
  .then(() => {
    console.log("MongoDB connection established");
    // เริ่มต้นเซิร์ฟเวอร์ที่พอร์ต 3001
    server.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => console.log("MongoDB connection failed: ", error.message));

let onlineUsers = [];

io.on("connection", (socket) => {
  console.log("new connection", socket.id);

  socket.on("addNewUser", (userId) => {
    console.log("Received userId from client:", userId);
    !onlineUsers.some((user) => user.userId === userId) &&
      onlineUsers.push({ userId, socketId: socket.id });
    console.log("onlineUsers", onlineUsers);
    io.emit("getOnlineUsers", onlineUsers);
  });

  socket.on("sendMessage", (message) => {
    const user = onlineUsers.find(
      (user) => user.userId === message.recipientId
    );
    if (user) {
      io.to(user.socketId).emit("getMessage", message);
      io.to(user.socketId).emit("getNotification", {
        senderId: message.senderId,
        isRead: false,
        date: new Date(),
      });
    }
  });

  socket.on("disconnect", () => {
    onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
    io.emit("getOnlineUsers", onlineUsers);
  });
});
