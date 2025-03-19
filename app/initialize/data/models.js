export const types = [
  "Chat Models",
  "Text Models",
  "Code Models",
  "Image Models",
];

export const models = [
  {
    id: "gpt-4o",
    name: "gpt-4o",
    description:
      "The latest GPT-4 model with improved capabilities across reasoning, proficiency, and speed.",
    strengths:
      "Excellent at complex reasoning, creative content generation, and detailed conversations.",
    type: "Chat Models",
  },
  {
    id: "gpt-4-turbo",
    name: "gpt-4-turbo",
    description:
      "The most capable GPT-4 model optimized for chat at a lower cost.",
    strengths:
      "Excellent at complex reasoning, creative content generation, and detailed conversations.",
    type: "Chat Models",
  },
  {
    id: "gpt-4",
    name: "gpt-4",
    description:
      "GPT-4 is more capable than any GPT-3.5 model, able to do more complex tasks.",
    strengths:
      "Complex reasoning, domain expertise, creative content generation.",
    type: "Chat Models",
  },
  {
    id: "gpt-3.5-turbo",
    name: "gpt-3.5-turbo",
    description:
      "Most capable GPT-3.5 model optimized for chat at 1/10th the cost of text-davinci-003.",
    strengths: "Quick responses, cost-effective, good for most everyday tasks.",
    type: "Chat Models",
  },
  {
    id: "claude-3-opus",
    name: "claude-3-opus",
    description: "Anthropic's most powerful model for highly complex tasks.",
    strengths: "Reasoning, mathematics, coding, and creative writing.",
    type: "Chat Models",
  },
  {
    id: "claude-3-sonnet",
    name: "claude-3-sonnet",
    description: "Anthropic's balanced model for a wide range of tasks.",
    strengths:
      "Balanced performance across reasoning, coding, and creative tasks.",
    type: "Chat Models",
  },
  {
    id: "claude-3-haiku",
    name: "claude-3-haiku",
    description: "Anthropic's fastest and most compact model.",
    strengths:
      "Speed, cost-effectiveness, and good performance on straightforward tasks.",
    type: "Chat Models",
  },
  {
    id: "text-davinci-003",
    name: "text-davinci-003",
    description: "Most capable GPT-3 model for text generation.",
    strengths:
      "Complex intent, cause and effect, creative generation, search, summarization.",
    type: "Text Models",
  },
  {
    id: "code-davinci-002",
    name: "code-davinci-002",
    description: "Most capable Codex model for code generation.",
    strengths:
      "Translating natural language to code, completing code, fixing bugs.",
    type: "Code Models",
  },
  {
    id: "dall-e-3",
    name: "dall-e-3",
    description: "Most capable image generation model from OpenAI.",
    strengths: "Creating photorealistic images from text descriptions.",
    type: "Image Models",
  },
];
