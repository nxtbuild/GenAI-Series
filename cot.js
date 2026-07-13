import "dotenv/config";
import { OpenAI } from "openai";

const client = new OpenAI();

async function main() {
  const systemPrompt = `

        Your are an AI assistant who work on START, THIK, EVALUATE and OUTPUT format.
        For a given user quesry first think and breakdown tha promblem into sub problems.
        You should always keep thinking and thinking before giving tha actual output.
        Also, before ouputting the final result to user must check once if everything is correct.

        Rules:
         - Strictly follow th output JSON format.
         - Always follow the output in sequence that is START, THINK, EVALUATE and OUTPUT.
         - After every think, there is going to be a EVALUATE step that is preformed manually by some and you ned to wait for other steps.
         - Always make sure to do multiple steps of thing before giving the final output.
         
         
         OUTPUT JSON FORMAT:
       { "step": "START | THINK | EVALUATE | OUTPUT", "content": "string" }
        Example:
         User Query: can you solve 3 + 4 * 10 - 4 * 3
         ASSISTANT:
         {
          "step": "START",
          "content":"The user wants me to solve 3 + 4 * 10 - 4 * 3 maths problem "
         }

        ASSISTANT:
         {
          "step": "THINK",
          "content":"This is typicaly math problem where I need to follow the BODMAS rule. 
          I will first solve the multiplication and then addition and subtraction."
         }

         
        ASSISTANT:
         {
          "step": "EVALUATE",
          "content":"Alrght, Going good."
         }

           ASSISTANT:
         {
          "step": "THINK",
          "content":"Lets breakdown the problem step by step "
         }
            
        ASSISTANT:
         {
          "step": "EVALUATE",
          "content":"Alrght, Going good."
         }

           ASSISTANT:
         {
          "step": "THINK",
          "content":"As a BODMAS, first lets soolve all multiplecation and division. "
         }
            
          ASSISTANT:
         {
          "step": "EVALUATE",
          "content":"Alrght, Going good."
         }
             ASSISTANT:
         {
          "step": "THINK",
          "content":"So, first we need  to solve 4*10 that is 40 "
         }
           
         ASSISTANT:
         {
          "step": "EVALUATE",
          "content":"Alrght, Going good."
         }
    ASSISTANT:
         {
          "step": "THINK",
          "content":"Great, now the question loos like 3 + 40 -4 * 3"
         }
           ASSISTANT:
         {
          "step": "EVALUATE",
          "content":"Alrght, Going good."
         }
          ASSISTANT:
         {
          "step": "THINK",
          "content":"Now, I can see one more multiplecation to be done that4*3=12"
         }
          ASSISTANT:
         {
          "step": "EVALUATE",
          "content":"Alrght, Going good."
         }
           ASSISTANT:
         {
          "step": "THINK",
          "content":"Great, now the equestion loos like 3 + 40 - 12"
         }
           ASSISTANT:
         {
          "step": "EVALUATE",
          "content":"Alrght, Going good."
         }
            ASSISTANT:
         {
          "step": "THINK",
          "content":"As we have done all the multiplecation and division, now we can do addition and subtraction from left to right. So, first we will do 3 + 40 = 43"
         }
           ASSISTANT:
         {
          "step": "EVALUATE",
          "content":"Alrght, Going good."
         }
              ASSISTANT:
         {
          "step": "THINK",
          "content":"So, first we will do 3 + 40 = 43"
         }
           ASSISTANT:
         {
          "step": "EVALUATE",
          "content":"Alrght, Going good."
         }
              ASSISTANT:
         {
          "step": "THINK",
          "content":"New equation looks like 43 - 12 = 31"
         }
            ASSISTANT:
         {
          "step": "EVALUATE",
          "content":"Alrght, Going good."
         }
            ASSISTANT:
         {
          "step": "THINK",
          "content":"Great, now we have the final answer that is 31"
         }
            ASSISTANT:
         {
          "step": "EVALUATE",
          "content":"Alrght, Going good."
         }
           ASSISTANT:
         {
          "step": "OUTPUT",
          "content":"3 + 4 * 10-4 * 3 = 31"
         }
`;

  const messages = [
    {
      role: "system",
      content: systemPrompt,
    },
    {
      role: "user",
      content: "Write a code in JS to find a prime number as fast as possible",
    },
  ];

  while (true) {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages,
      response_format: {
        type: "json_object",
      },
    });

    const rawContent = response.choices[0].message.content;
    const parsedContent = JSON.parse(rawContent);

    messages.push({
      role: "assistant",
      content: JSON.stringify(parsedContent),
    });

    if (parsedContent.step === "START") {
      console.log(
        "START step completed. Proceeding to THINK step...",
        parsedContent.content,
      );
      continue;
    }

    if (parsedContent.step === "THINK") {
      console.log(
        "THINK step completed. Proceeding to EVALUATE step...",
        parsedContent.content,
      );

      // LLM as Judge

      messages.push({
        role: "developer",
        content: JSON.stringify({
          step: "EVALUATE",
          content: "Nice work, keep going with the next THINK step.",
        }),
      });

      continue;
    }

    if (parsedContent.step === "OUTPUT") {
      console.log("OUTPUT step completed.", parsedContent.content);
      break;
    }

    console.log("DONE.....");
  }
}

main();
