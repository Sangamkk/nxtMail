
const { google } = require("googleapis");
const OAuth = require("../config/google");

const createClient = tokens => {
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  client.setCredentials(tokens);
  return client;
};

exports.getAuthUrl = () => OAuth.generateAuthUrl({
  access_type: "offline",
  scope: ["https://www.googleapis.com/auth/gmail.readonly"],
  prompt: "consent"
});

exports.getTokens = code => OAuth.getToken(code);

exports.getProfile = async tokens => {
  const gmail = google.gmail({
    version: "v1", auth: createClient(tokens)
  });
  const { data } = await gmail.users.getProfile({ userId: "me" });
  return data.emailAddress;
};

exports.getEmails = async tokens => {
  const gmail = google.gmail({
    version: "v1", auth: createClient(tokens)
  });
  const { data } = await gmail.users.messages.list({
    userId: "me", maxResults: 10
  });

  return Promise.all((data.messages || []).map(async ({ id }) => {
    const { data: msg } = await gmail.users.messages.get({
      userId: "me", id, format: "metadata",
      metadataHeaders: ["From", "Subject", "Date"]
    });
    const headers = msg.payload.headers || [];
    const get = name => headers.find(
      h => h.name.toLowerCase() === name.toLowerCase()
    )?.value;

    return {
      id, from: get("From"), subject: get("Subject"),
      date: get("Date"), snippet: msg.snippet
    };
  }));
};
