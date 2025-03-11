const express = require("express");
const cors = require("cors");
const path = require("path");
const membersRouter = require("./routes/members");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: "https://your-frontend.com",
    credentials: true,
  })
);
app.use(express.json());

app.use("/api/members", membersRouter);

app.use(express.static(path.join(__dirname, "../frontend/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
