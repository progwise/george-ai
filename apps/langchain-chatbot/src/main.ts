import { doConversation } from './do-conversation';
import { SalesGPT } from './sales-gpt';
import { llm } from './setup'

import dotenv from 'dotenv'

dotenv.config()

console.log('This is langchain-chatbot - setup completed')

const config = {
  salesperson_name: "Ted Lasso",
  use_tools: true,
  product_catalog: "sample_product_catalog.txt",
};

export const sales_agent = await SalesGPT.from_llm(llm, false, config);

// init sales agent
await sales_agent.seed_agent();

await doConversation(sales_agent)
