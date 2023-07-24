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
            const timestamp = new Date(timestampMatch[0]);
            const endpoint = endpointMatch[1];
            logEntries.push({ timestamp, endpoint });
        }
    }

    return logEntries;
}

// Function to create time series data and count API calls on a per-minute basis
function countApiCallsPerMinute(logEntries) {
    const apiCallsPerMinuteMap = new Map();

    for (const logEntry of logEntries) {
        const { timestamp, endpoint } = logEntry;
        const minuteTimestamp = new Date(timestamp.getFullYear(), timestamp.getMonth(), timestamp.getDate(), timestamp.getHours(), timestamp.getMinutes(), 0, 0).getTime();

        const currentCount = apiCallsPerMinuteMap.get(minuteTimestamp) || 0;
        apiCallsPerMinuteMap.set(minuteTimestamp, currentCount + 1);
    }

    return apiCallsPerMinuteMap;
}

function main() {
    const filePaths = ['./api-dev-out.log', './api-prod-out.log', './prod-api-prod-out.log'];
    const logEntries = [];

    for (const filePath of filePaths) {
        const entries = readLogsFromFile(filePath);
        logEntries.push(...entries);
    }

    const apiCallsPerMinute = countApiCallsPerMinute(logEntries);

    // Create the table
    const table = new Table({
        head: ['Minute', 'API Calls'],
        colWidths: [30, 15],
    });

    // Populate the table with per-minute API call counts
    for (const [timestamp, count] of apiCallsPerMinute) {
        const minute = new Date(timestamp).toISOString().slice(0, 16);
        table.push([minute, count]);
    }

    // Print the table to the console
    console.log(table.toString());
}

main();
