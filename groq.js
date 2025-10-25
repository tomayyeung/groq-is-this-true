import Groq from "groq-sdk";

export async function factCheck(statement, apiKey, currentUrl) {
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
          `You are a fact-checker. Evaluate whether the given statement is true or false. Provide a brief response in 3 sentences or less. Do not use sources from the site ${currentUrl}. Do not use markdown. If you didn't find any sources agreeing or disagreeing with the statement, then just give me the brief response. If you found sources, then insert the sources after your brief response. Separate the brief response and the list of sources with the delimiter '^^^^^'. Separate sources with '^^^'. Sources should just be links, don't include any other text.`,
      },
      {
        role: "user",
        content: statement,
      },
    ],
  });

  return completion.choices[0]?.message?.content;
}
