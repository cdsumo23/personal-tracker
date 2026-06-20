const fs = require('fs');
const readline = require('readline');

async function search() {
  const fileStream = fs.createReadStream('C:\\Users\\CSumo\\.gemini\\antigravity\\brain\\18be8a34-0297-4ee9-aa43-e22111c841d1\\.system_generated\\logs\\transcript.jsonl');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    if (line.includes('DATABASE_URL') || line.includes('postgresql') || line.includes('password')) {
      console.log(line.substring(0, 1000)); // Print matching lines (up to 1000 chars)
    }
  }
}

search();
