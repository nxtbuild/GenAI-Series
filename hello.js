import "dotenv/config";
import { OpenAI } from "openai";

const client = new OpenAI();

async function main() {
  // These api calls are stateless (Zero Shot) ye batana hai

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "user", content: "Hey gpt, My name is Santosh" },
      {
        role: "assistant",
        content: "Hello Santosh How can I assist you today?",
      },
      { role: "user", content: "What is my name?" },
    ],
  });

  console.log(response.choices[0].message.content);
}

main();
