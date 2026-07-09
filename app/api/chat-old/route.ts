import { openai } from "@ai-sdk/openai";
import { streamText, UIMessage, convertToModelMessages, tool, stepCountIs } from "ai";
import z from "zod";

export async function POST(request: Request) {
  const { messages }: { messages: UIMessage[] } = await request.json();
  const modelMessages = await convertToModelMessages(messages);

  const result = await streamText({
    model: openai("gpt-4o"),
    messages: modelMessages,
    stopWhen: stepCountIs(3),
    tools: {
      weather: tool({
        description: "Get the weather in a location (fahrenheit)",
        inputSchema: z.object({
          location: z.string().describe("The location to get the weather for"),
        }),
        execute: async ({ location }) => {
          const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${process.env.OPEN_WEATHER_MAP_API_KEY}&units=imperial`,
          );
          if (!response.ok)
            throw new Error(`Weather API error: ${response.status}`);
          const data = await response.json();
          return {
            location,
            temperature: data.main.temp,
          };
        },  
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}
