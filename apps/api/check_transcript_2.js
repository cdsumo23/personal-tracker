const fs = require('fs');
const readline = require('readline');

async function search() {
  const fileStream = fs.createReadStream('C:\\Users\\CSumo\\.gemini\\antigravity\\brain\\18be8a34-0297-4ee9-aa43-e22111c841d1\\.system_generated\\logs\\transcript.jsonl');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    if (line.includes('"source":"USER_EXPLICIT"')) {
      const obj = JSON.parse(line);
      console.log(`Step ${obj.step_index}: ${obj.content || ''}`);
      if (obj.tool_calls) {
        console.log(`Tool Calls: ${JSON.stringify(obj.tool_calls)}`);
      }
    }
  }
}

search();
