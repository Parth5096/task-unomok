const fs = require('fs');
const Table = require('cli-table3');

// Function to read logs from the file and convert them into structured objects
function readLogsFromFile(filePath) {
  const logData = fs.readFileSync(filePath, 'utf-8');
  const logLines = logData.split('\n');
  const logEntries = [];

  for (const line of logLines) {
    const timestampRegex = /\d{4}-\d{2}-\d{2} \d{2}:\d{2}/;
    const endpointRegex = /Running webapp API on Port (\d+)/;

    const timestampMatch = line.match(timestampRegex);
    const endpointMatch = line.match(endpointRegex);

    if (timestampMatch && endpointMatch) {
      const endpoint = endpointMatch[1];
      logEntries.push(endpoint);
    }
  }

  return logEntries;
}

// Function to count the number of times each endpoint is called
function countEndpointCalls(logEntries) {
  const endpointCountMap = new Map();

  for (const endpoint of logEntries) {
    const currentCount = endpointCountMap.get(endpoint) || 0;
    endpointCountMap.set(endpoint, currentCount + 1);
  }

  return endpointCountMap;
}

function main() {
  const filePaths = ['./api-dev-out.log', './api-prod-out.log', './prod-api-prod-out.log'];
  const logEntries = [];

  for (const filePath of filePaths) {
    const entries = readLogsFromFile(filePath);
    logEntries.push(...entries);
  }

  const endpointCounts = countEndpointCalls(logEntries);

  // Create the table
  const table = new Table({
    head: ['Endpoint', 'Count'],
    colWidths: [40, 10],
  });

  // Populate the table with endpoint counts
  for (const [endpoint, count] of endpointCounts) {
    table.push([endpoint, count]);
  }

  // Print the table to the console
  console.log(table.toString());
}

main();
