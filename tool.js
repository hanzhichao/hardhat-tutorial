const fs = require('fs');

let rawdata = fs.readFileSync('output.json');
let result = JSON.parse(rawdata);
let data = '';
for (let i = 0; i < result.result.structLogs.length; i++) {
    let line = JSON.stringify(result.result.structLogs[i]);
    data = data + line +'\n';
}
fs.writeFileSync('trace.jsonl', data);