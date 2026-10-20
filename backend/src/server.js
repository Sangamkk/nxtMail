
require("dotenv").config();
require("./services/snoozeScheduler");
const app = require("./app");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`nxtMail backend running on port ${PORT}`);
});
