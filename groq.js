import Groq from "groq-sdk";

// `check` now accepts an optional apiKey. In extension/service-worker
// environments, pass the key from `chrome.storage` rather than relying on
// `process.env`.
export async function check(statement, apiKey = process.env.GROQ_API_KEY) {
  if (!apiKey) {
    throw new Error(
      "No GROQ API key provided. Save your key in the extension options or pass it as the second argument to `check(statement, apiKey)`."
    );
  }

  const groq = new Groq({
    apiKey,
    dangerouslyAllowBrowser: true,
  });

  const completion = await groq.chat.completions.create({
    model: "groq/compound",
    messages: [
      {
        role: "system",
        content:
          "You are a fact-checker. Evaluate whether the given statement is true or false. arovide a brief response in 3 sentences or less. Do not use markdown. Afterwards, always insert the delimiter '-----'. Then list any sources used as links, separated with '---'.",
      },
      {
        role: "user",
        content: statement,
      },
    ],
  });

  return completion.choices[0]?.message?.content;
}

// Note: no top-level network calls on import. Callers should call `check`
// when they have an API key available (e.g. loaded from chrome.storage).
