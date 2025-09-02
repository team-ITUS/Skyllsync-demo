const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, '../logs/backend.log');

function getCallerInfo() {
  const stack = new Error().stack.split('\n');
  // stack[0] = Error
  // stack[1] = at logger...
  // stack[2] = at caller...
  const callerLine = stack[3] || stack[2] || '';
  const match = callerLine.match(/\((.*):(\d+):(\d+)\)/);
  if (match) {
    return { file: path.basename(match[1]), line: match[2] };
  }
  return { file: 'unknown', line: '0' };
}

function log(message, level = 'INFO', extra = null) {
  const { file, line } = getCallerInfo();
  const timestamp = new Date().toISOString();
  let logMsg = `[${timestamp}] [${level}] [${file}:${line}] ${message}`;
  if (extra) {
    logMsg += ` | ${JSON.stringify(extra)}`;
  }
  fs.appendFileSync(logFile, logMsg + '\n', { encoding: 'utf8' });
}

function warn(message, extra = null) {
  log(message, 'WARN', extra);
}

function error(message, extra = null) {
  log(message, 'ERROR', extra);
}

function info(message, extra = null) {
  log(message, 'INFO', extra);
}

module.exports = { log, warn, error, info };