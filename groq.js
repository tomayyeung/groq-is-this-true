import Groq from "groq-sdk";
const groq = new Groq();

async function check(statement) {
  const completion = await groq.chat.completions.create({
    model: "groq/compound",
    messages: [
      {
        role: "system",
        content: "You are a fact-checker. Evaluate whether the given statement is true or false. Provide a brief response in 3 sentences or less. Indicate what other reliable sources say about this claim - whether they agree or disagree with the statement.",
      },
      {
        role: "user",
        content: statement,
      },
    ],
  });
  return completion.choices[0]?.message?.content;
}

async function main() {
  const statement = "The Eiffel Tower is located in Berlin.";
  console.log("Checking statement:", statement);
  const result = await check(statement);
  console.log("Fact-check result:", result);
}

main().catch(console.error);
