import { SalesGPT } from "./sales-gpt";
import * as readline from 'node:readline/promises';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

export async function doConversation(sales_agent: SalesGPT) {
  console.log(' ===== ')
  console.log('starting the conversation...')

  let stageResponse = await sales_agent.determine_conversation_stage();
  console.log(stageResponse);

  let stepResponse = await sales_agent.step();

  while(true) {
    const answer = await rl.question(stageResponse, {
      // signal: AbortSignal.timeout(10_000) // 10s timeout
    });
    await sales_agent.human_step(
      // 'I am well, how are you? I would like to learn more about your mattresses.'
      answer
    );

    stageResponse = await sales_agent.determine_conversation_stage();
    console.log(stageResponse);

    stepResponse = await sales_agent.step();
    console.log(stepResponse);

  }

}