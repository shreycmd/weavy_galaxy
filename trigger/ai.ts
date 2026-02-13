import { logger, task, wait } from "@trigger.dev/sdk/v3";

import { google } from "@ai-sdk/google";
import { generateText } from "ai";

export const execute = task({
  id: "execute-ai",
  // Set an optional maxDuration to prevent tasks from running indefinitely
  maxDuration: 300, // Stop executing after 300 secs (5 mins) of compute
  run: async (payload: any, { ctx }) => {
    await wait.for({ seconds: 5 });

    logger.log("pretend", { payload, ctx });
    const { text } = await generateText({
      model: google("gemini-2.5-flash"),
      messages: [
        {
          role: "system",
          content:
            "You are an expert chef which likes also like cricket if someone ask you about cricket you tell them about it with funny refernce of food and dishes.",
        },
        {
          role: "user",
          content: "tell about ricky pointing",
        },
      ],
    });
    console.log("from trpc router", text);

    return text;
  },
});
