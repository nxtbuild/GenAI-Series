import "dotenv/config";
import { OpenAI } from "openai";
import axios from "axios";
import { exec } from "child_process";

async function getWeatherData(cityname = "") {
  const url = `https://wttr.in/${cityname.toLowerCase()}?format=%C+%t`;
  const { data } = await axios.get(url, { responseType: "text" });
  return `The current waether of ${cityname} is ${data}`;
}

async function getGitHUbUserInfo(username = "") {
  const url = `https://api.github.com/users/${username.toLowerCase()}`;
  const { data } = await axios.get(url);

  return JSON.stringify({
    login: data.login,
    id: data.id,
    name: data.name,
    blog: data.blog,
    location: data.location,
    bio: data.bio,
    twitter_username: data.twitter_username,
    public_repos: data.public_repos,
  });
}

async function executeCommand(cmd = "") {
  return new Promise((res, rej) => {
    exec(cmd, (error, data) => {
      if (error) {
        return res(`Error running command ${error}`);
      } else {
        res(data);
      }
    });
  });
}

const TOOL_MAP = {
  getWeatherData: getWeatherData,
  getGitHUbUserInfo: getGitHUbUserInfo,
  executeCommand: executeCommand,
};

const client = new OpenAI();

async function main() {
  const systemPrompt = `
    
    You are an AI assistent who works on START, THINK, and OUTPUT format.
    For a given user query first think and breakdown the problem into sub problems.
    Your should always keep thinking and thinking before giving the actual output.

    Also, before outputing the final result to user you must check once if everything is correct.
    You also have list of available tools tha you can call based on the user query.

    For every tool call that you make, wait for the OBSERVATION from the tool which is the response from the toll that you called.

    Available tools:
     - getWeatherData(citname): This tool takes a city name as input and returns the current weather of that city.
    - getGitHUbUserInfo(username:string): Return the public info about the github user using github api.
    - executeCommand(command:string): Takes a linux / unix command as arg and executes the command on user's machine and return the output.

    Rules:
        - Strictly follow the output JSON format.
        - Always follow the output in squence that is START, THINK, and OUTPUT.
        - Always perfomr only one step at time and wait for other step.
        - Always make sure to do multiple steps of thinking before giveing out output.
        - For every tool call always wait for the OBSERVE which contains the output from tool that you called.

    OUTPUT JSON FORMAT:
    { "step": "START | THINK | OBSERVE | OUTPUT", "content": "string" }


    Example:
    User: Hey, can you tell me waether of Delhi?
    ASSISTANT:{"step":"START","content":"The user is interested in knowing the current weather of Delhi."}
    ASSISTANT:{"step":"THINK","content":"Let me see if there is any available tool for this query."}
    ASSISTANT:{"step":"THINK","content":"I see that therer is a tool available getWeatherData which returns current waether data.   "}
    ASSISTANT:{"step":"THINK","content":"I need to call getWeatherData for city Delhi to get waeyher details."}
    ASSISTANT:{"step":"TOOL","input":"Delhi", "tool_name":"getWeatherData"}
    DEVELOPER:{"step":"OBSERVE","content":"The weather of delhi is cloudy with 30 degree celcius."}
    ASSISTANT:{"step":"OUTPUT","content":"Grate, I got the weather of Delhi. The current weather of Delhi is cloudy with 30 degree celcius."}
    `;

  const messages = [
    {
      role: "system",
      content: systemPrompt,
    },
    {
      role: "user",
      content:
        "Hey, create a folder todos_app and create a simple working todo application using html, css and javascript.",
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

    if (parsedContent.step == "START") {
      console.log("🔥", parsedContent.content);
      continue;
    }

    if (parsedContent.step === "THINK") {
      console.log(`\t🧠`, parsedContent.content);
      continue;
    }

    if (parsedContent.step === "TOOL") {
      const toolToCall = parsedContent.tool_name;

      if (!TOOL_MAP[toolToCall]) {
        messages.push({
          role: "developer",
          content: `There is no such tool as ${toolToCall}`,
        });
        continue;
      }

      const responseFromTool = await TOOL_MAP[toolToCall](parsedContent.input);
      console.log(
        `🔨: ${toolToCall}(${parsedContent.input})=`,
        responseFromTool,
      );

      messages.push({
        role: "developer",
        content: JSON.stringify({ step: "OBSERVE", content: responseFromTool }),
      });
      continue;
    }
    if (parsedContent.step === "OUTPUT") {
      console.log(`🤖`, parsedContent.content);
      break;
    }
  }

  console.log("Done.......");
}

main();
