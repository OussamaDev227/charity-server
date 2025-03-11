const express = require("express");
const cors = require("cors");
const path = require("path");
const membersRouter = require("./routes/members");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  res.send("Backend is live!");
});
app.use("/api/members", membersRouter);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
