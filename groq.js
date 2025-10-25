import Groq from "groq-sdk";

export async function factCheck(statement, apiKey) {
  if (!apiKey) {
    throw new Error(
      "No GROQ API key provided."
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
          "You are a fact-checker. Evaluate whether the given statement is true or false. Provide a brief response in 3 sentences or less. Do not use markdown. Afterwards, always insert the delimiter '^^^^^'. Then list any sources used as links, separated with '^^^'.",
      },
      {
        role: "user",
        content: statement,
      },
    ],
  });

  return completion.choices[0]?.message?.content;
}
