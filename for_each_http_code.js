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
    const statusCodeRegex = /(\d{3}) (?=\[32minfo)/;

    const timestampMatch = line.match(timestampRegex);
    const endpointMatch = line.match(endpointRegex);
    const statusCodeMatch = line.match(statusCodeRegex);

    if (timestampMatch && endpointMatch && statusCodeMatch) {
      const timestamp = new Date(timestampMatch[0]);
      const statusCode = parseInt(statusCodeMatch[1]);
      logEntries.push({ timestamp, statusCode });
    }
  }

  return logEntries;
}

// Function to count the number of API calls for each HTTP status code
function countApiCallsByStatusCode(logEntries) {
  const apiCallsByStatusCodeMap = new Map();

  for (const logEntry of logEntries) {
    const { statusCode } = logEntry;
    const currentCount = apiCallsByStatusCodeMap.get(statusCode) || 0;
    apiCallsByStatusCodeMap.set(statusCode, currentCount + 1);
  }

  return apiCallsByStatusCodeMap;
}

function main() {
    const filePaths = ['./api-dev-out.log', './api-prod-out.log', './prod-api-prod-out.log'];
  const logEntries = [];

  for (const filePath of filePaths) {
    const entries = readLogsFromFile(filePath);
    logEntries.push(...entries);
  }

  const apiCallsByStatusCode = countApiCallsByStatusCode(logEntries);

  // Create the table
  const table = new Table({
    head: ['HTTP Status Code', 'API Calls'],
    colWidths: [20, 15],
  });

  // Populate the table with API call counts for each status code
  for (const [statusCode, count] of apiCallsByStatusCode) {
    table.push([statusCode, count]);
  }

  // Print the table to the console
  console.log(table.toString());
}

main();
