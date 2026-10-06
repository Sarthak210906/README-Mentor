import { getRuntimeApiConfig } from './src/ai/aiService.js';

// Retrieve the actual key from server memory by inspecting server
async function test() {
  const confRes = await fetch('http://localhost:5050/api/status');
  console.log('Status:', await confRes.json());
}

test();
