const PORT = process.env.PORT || 5000;
const express = require("express");
const cors = require("cors");
const path = require("path");
const membersRouter = require("./routes/members");

const app = express();
app.get("/", (req, res) => {
  res.send("Backend is live!");
});
const allowedOrigins = [
  "https://meraguen-charity-frontend.netlify.app", // Production
  "http://localhost:3000", // Local development
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);
// app.use((req, res) => {
//   res.status(404).send("Route not found");
// });
app.use(express.json());

app.use("/api/members", membersRouter);
app.get("/api/members", (req, res) => {
  // Example logic
  res.json({ members: [], yearlyExtra: 0 });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
