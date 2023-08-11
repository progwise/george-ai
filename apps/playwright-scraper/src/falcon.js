import { HuggingFaceInference } from "langchain/llms/hf";
// Create an instance of the HuggingFaceInference class
const model = new HuggingFaceInference({
    model: "tiiuae/falcon-7b-instruct",
    apiKey: "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", // Replace with your actual Huggingface API key
});
// Make API calls using the methods of the HuggingFaceInference class
const res = await model.call("YOUR_INPUT");
console.log(res);
