
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

exports.getAuthUrl = (state) => OAuth.generateAuthUrl({
  access_type: "offline",
  scope: ["https://www.googleapis.com/auth/gmail.modify"],
  prompt: "consent",
  state
});

exports.getTokens = code => OAuth.getToken(code);

exports.getProfile = async tokens => {
  const gmail = google.gmail({
    version: "v1", auth: createClient(tokens)
  });
  const { data } = await gmail.users.getProfile({ userId: "me" });
  return data.emailAddress;
};

const getGmail = tokens => google.gmail({
  version: "v1",
  auth: createClient(tokens)
});

exports.trashEmail = async (tokens, id) => {
  const { data } = await getGmail(tokens).users.messages.trash({
    userId: "me", id
  });
  return data;
};

exports.restoreEmail = async (tokens, id) => {
  const { data } = await getGmail(tokens).users.messages.untrash({
    userId: "me", id
  });
  return data;
};

exports.deleteEmail = async (tokens, id) => {
  await getGmail(tokens).users.messages.delete({
    userId: "me", id
  });
};

exports.getInboxMail = async tokens => {
  const gmail = google.gmail({
    version: "v1", auth: createClient(tokens)
  });

  const { data } = await gmail.users.messages.list({
    userId: "me", labelIds: ["INBOX"], maxResults: 10
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

    const labelIds = msg.labelIds || [];

    return {
      id, from: get("From"), subject: get("Subject"),
      date: get("Date"), snippet: msg.snippet,
      labelIds, starred: labelIds.includes("STARRED")
    };
  }));
};

exports.getTrashMail = async tokens => {
  const gmail = google.gmail({
    version: "v1", auth: createClient(tokens)
  });

  const { data } = await gmail.users.messages.list({
    userId: "me", labelIds: ["TRASH"], maxResults: 10
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

exports.getStarredMail = async tokens => {
  const gmail = google.gmail({
    version: "v1", auth: createClient(tokens)
  });

  const { data } = await gmail.users.messages.list({
    userId: "me", q: "is:starred", maxResults: 10
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

    const labelIds = msg.labelIds || [];

    return {
      id, from: get("From"), subject: get("Subject"),
      date: get("Date"), snippet: msg.snippet,
      labelIds, starred: labelIds.includes("STARRED")
    };
  }));
};

exports.starEmail = async (tokens, id) => {
  const gmail = google.gmail({
    version: "v1", auth: createClient(tokens)
  });

  return gmail.users.messages.modify({
    userId: "me",
    id,
    requestBody: { addLabelIds: ["STARRED"] }
  });
};

exports.unstarEmail = async (tokens, id) => {
  const gmail = google.gmail({
    version: "v1", auth: createClient(tokens)
  });

  return gmail.users.messages.modify({
    userId: "me",
    id,
    requestBody: { removeLabelIds: ["STARRED"] }
  });
};

exports.snoozeEmail = async (tokens, id) => {
  const gmail = google.gmail({
    version: "v1",
    auth: createClient(tokens)
  });

  await gmail.users.messages.modify({
    userId: "me",
    id,
    requestBody: {
      removeLabelIds: ["INBOX"]
    }
  });
};

exports.unsnoozeEmail = async (tokens, id) => {
  const gmail = google.gmail({
    version: "v1",
    auth: createClient(tokens)
  });

  await gmail.users.messages.modify({
    userId: "me",
    id,
    requestBody: {
      addLabelIds: ["INBOX"]
    }
  });
};

exports.getSentMail = async tokens => {
  const gmail = google.gmail({
    version: "v1",
    auth: createClient(tokens)
  });

  const { data } = await gmail.users.messages.list({
    userId: "me",
    labelIds: ["SENT"],
    maxResults: 10
  });

  return Promise.all((data.messages || []).map(async ({ id }) => {
    const { data: msg } = await gmail.users.messages.get({
      userId: "me",
      id,
      format: "metadata",
      metadataHeaders: ["From", "To", "Subject", "Date"]
    });

    const headers = msg.payload.headers || [];
    const get = name =>
      headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value;

    return {
      id,
      from: get("From"),
      to: get("To"),
      subject: get("Subject"),
      date: get("Date"),
      snippet: msg.snippet,
      labelIds: msg.labelIds || []
    };
  }));
};