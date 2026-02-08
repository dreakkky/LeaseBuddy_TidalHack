const app = require("./app");
const dotenv = require("dotenv");
dotenv.config();
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}. API key: ${process.env.FEATHERLESS_API_KEY? "✅" : "❌ (missing)"}`);
});

