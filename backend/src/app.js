const  express=  require("express");
const morgan = require("morgan");
const cors = require("cors");
const leaseRoutes = require("./routes/lease.routes.js");

// Initialize Express app
const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST"],
}));

app.use(express.json());
app.use(morgan("dev"));

app.use("/api/lease", leaseRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

module.exports = app;