const PORT = process.env.PORT || 5000;
const express = require("express");
const cors = require("cors");
const path = require("path");
const membersRouter = require("./routes/members");

const app = express();
app.get("/", (req, res) => {
  res.send("Backend is live!");
});
app.use(
  cors({
    origin: "https://meraguen-charity-frontend.netlify.app/",
  })
);
// app.use((req, res) => {
//   res.status(404).send("Route not found");
// });
app.use(express.json());

app.use("/api/members", membersRouter);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
