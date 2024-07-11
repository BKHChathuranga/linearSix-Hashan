const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");

app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "public/views"));
app.set("view engine", "html");
app.engine("html", require("ejs").renderFile);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.render("index.html");
});

app.post("/", async (req, res) => {
  const calendarId = req.body.calendarId;
  const timeMin = new Date(req.body.timeMin).toISOString();
  const timeMax = new Date(req.body.timeMax).toISOString();
  const timeZone = "Asia/Colombo";
  const groupExpansionMax = 10;
  const calendarExpansionMax = 10;

  const fs = require("fs").promises;
  const { google } = require("googleapis");

  const SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"];
  const TOKEN_PATH = path.join(process.cwd(), "token.json");
  const CREDENTIALS_PATH = path.join(process.cwd(), "credentials.json");

  async function loadSavedCredentialsIfExist() {
    try {
      const content = await fs.readFile(TOKEN_PATH);
      const credentials = JSON.parse(content);
      return google.auth.fromJSON(credentials);
    } catch (err) {
      console.error("Error loading saved credentials:", err);
      return null;
    }
  }

  async function saveCredentials(client) {
    try {
      const content = await fs.readFile(CREDENTIALS_PATH);
      const keys = JSON.parse(content);
      const key = keys.installed || keys.web;
      const payload = JSON.stringify({
        type: "authorized_user",
        client_id: key.client_id,
        client_secret: key.client_secret,
        refresh_token: client.credentials.refresh_token,
      });
      await fs.writeFile(TOKEN_PATH, payload);
    } catch (err) {
      console.error("Error saving credentials:", err);
    }
  }

  async function authorize() {
    let client = await loadSavedCredentialsIfExist();
    if (client) {
      return client;
    }
    try {
      const { authenticate } = require("@google-cloud/local-auth");
      client = await authenticate({
        scopes: SCOPES,
        keyfilePath: CREDENTIALS_PATH,
      });
      if (client.credentials) {
        await saveCredentials(client);
      }
      return client;
    } catch (err) {
      console.error("Error during authentication:", err);
      throw err;
    }
  }

  async function getFreeBusy(auth) {
    const calendar = google.calendar({ version: "v3", auth });
    try {
      const response = await calendar.freebusy.query({
        requestBody: {
          timeMin: timeMin,
          timeMax: timeMax,
          timeZone: timeZone,
          groupExpansionMax: groupExpansionMax,
          calendarExpansionMax: calendarExpansionMax,
          items: [{ id: calendarId }],
        },
      });

      console.log("API response:", response.data);

      const busyIntervals = response.data.calendars[calendarId].busy;
      return busyIntervals;

    } catch (err) {
      console.error(
        "Error fetching free/busy intervals:",
        err.response ? err.response.data : err.message
      );

      throw err;
    }
  }

  try {
    const auth = await authorize();
    const busyIntervals = await getFreeBusy(auth);
    res.render("events.html", { busyIntervals: busyIntervals });
  } catch (error) {
    console.error("Error in main flow:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(3000, () => {
  console.log("Server on port 3000");
});
