
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

//Trash

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

//Star

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

//Snooze

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

//Sent

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

exports.sendEmail = async (tokens, { to, subject, body }) => {
  const gmail = google.gmail({
    version: "v1",
    auth: createClient(tokens)
  });

  const message = [
    `To: ${to}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: base64",
    "",
    Buffer.from(body, "utf8").toString("base64")
  ].join("\r\n");

  const raw = Buffer.from(message, "utf8").toString("base64url");

  const { data } = await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw }
  });

  return { id: data.id, threadId: data.threadId };
};

//Draft
const createRawMessage = ({ to, subject, body }) => {
  const message = [
    ...(to ? [`To: ${to}`] : []),
    `Subject: ${subject || ""}`,
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="UTF-8"',
    "",
    body || ""
  ].join("\r\n");

  return Buffer.from(message, "utf8").toString("base64url");
};

exports.createDraft = async (tokens, { to, subject, body }) => {
  const gmail = google.gmail({
    version: "v1",
    auth: createClient(tokens)
  });

  const { data } = await gmail.users.drafts.create({
    userId: "me",
    requestBody: {
      message: { raw: createRawMessage({ to, subject, body }) }
    }
  });

  return { id: data.id, messageId: data.message?.id };
};

exports.getDrafts = async tokens => {
  const gmail = google.gmail({
    version: "v1",
    auth: createClient(tokens)
  });

  const { data } = await gmail.users.drafts.list({
    userId: "me",
    maxResults: 100
  });

  return Promise.all((data.drafts || []).map(async draft => {
    const { data: result } = await gmail.users.drafts.get({
      userId: "me",
      id: draft.id,
      format: "full"
    });

    const msg = result.message;
    const headers = msg.payload.headers || [];
    const get = name =>
      headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value;

    return {
      id: result.id,
      messageId: msg.id,
      to: get("To") || "",
      subject: get("Subject") || "",
      snippet: msg.snippet || "",
      body: getDraftBody(msg.payload)
    };
  }));
};

const getDraftBody = payload => {
  if (payload.body?.data) {
    return Buffer.from(payload.body.data, "base64url").toString("utf8");
  }

  for (const part of payload.parts || []) {
    const body = getDraftBody(part);
    if (body) return body;
  }

  return "";
};

exports.deleteDraft = async (tokens, id) => {
  const gmail = google.gmail({
    version: "v1",
    auth: createClient(tokens)
  });

  await gmail.users.drafts.delete({
    userId: "me",
    id
  });
};

//Email-Details

const getBody = payload => {
  if (payload.mimeType === "text/plain" && payload.body?.data)
    return Buffer.from(payload.body.data, "base64url").toString("utf8");

  for (const part of payload.parts || []) {
    const body = getBody(part);
    if (body) return body;
  }

  if (payload.body?.data)
    return Buffer.from(payload.body.data, "base64url").toString("utf8");

  return "";
};

//Important

exports.getInboxMailForImportant = async tokens => {
  const gmail = google.gmail({
    version: "v1",
    auth: createClient(tokens)
  });

  const { data } = await gmail.users.messages.list({
    userId: "me",
    labelIds: ["INBOX"],
    maxResults: 10
  });

  return Promise.all((data.messages || []).map(async ({ id }) => {
    const { data: msg } = await gmail.users.messages.get({
      userId: "me",
      id,
      format: "full"
    });

    const headers = msg.payload.headers || [];
    const get = name => headers.find(
      h => h.name.toLowerCase() === name.toLowerCase()
    )?.value || "";

    return {
      id,
      from: get("From"),
      subject: get("Subject") || "(No subject)",
      content: getBody(msg.payload) || msg.snippet || "",
      time: get("Date")
    };
  }));
};

//AllMail

exports.getAllMail = async tokens => {
  const gmail = google.gmail({
    version: "v1",
    auth: createClient(tokens)
  });

  let messages = [];
  let pageToken;

  do {
    const { data } = await gmail.users.messages.list({
      userId: "me",
      q: "-in:trash -in:spam",
      maxResults: 100,
      pageToken
    });

    messages.push(...(data.messages || []));
    pageToken = data.nextPageToken;
  } while (pageToken && messages.length < 100);

  return Promise.all(messages.map(async ({ id }) => {
    const { data: msg } = await gmail.users.messages.get({
      userId: "me",
      id,
      format: "metadata",
      metadataHeaders: ["From", "Subject", "Date"]
    });

    const headers = msg.payload.headers || [];
    const get = name => headers.find(
      h => h.name.toLowerCase() === name.toLowerCase()
    )?.value || "";

    return {
      id,
      from: get("From") || "Unknown sender",
      subject: get("Subject") || "(No subject)",
      date: get("Date"),
      snippet: msg.snippet,
      labelIds: msg.labelIds || [],
      starred: (msg.labelIds || []).includes("STARRED")
    };
  }));
};

//Archive

exports.archiveEmail = async (tokens, id) => {
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
