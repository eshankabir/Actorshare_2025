const ws = require('ws')
const { spawn } = require('child_process');
const wss = new ws.Server({ port: '3000'})

const clientFileStates = new Map();

wss.on('connection', ws => {
    console.log('Client connected');

    clientFileStates.set(ws, {
        fileName: null,
        csvBuffer: []
    })

    ws.on('message', async message => {
        const clientState = clientFileStates.get(ws);

        if (typeof message === 'string') {
            if (message.startsWith('csvFile:')) {
                clientState.fileName = message.substring('csvFile:'.length);
                clientState.csvBuffer = [];
                console.log(`Recieving file: ${clientState.fileName} from ${ws._socket.remoteAddress}`);
                ws.send(JSON.stringify({ status: 'info', message: `Ready to recieve file`}));
            } else if (message === 'end') {
                console.log(`End of file '${clientState.fileName}' received.`);

                if (clientState.csvBuffer.length === 0) {
                    ws.send(JSON.stringify({ status: 'error', message: 'Recieved "end" but no file data sent.'}));
                    return;
                }

                const fullBinaryData = Buffer.concat(clientState.csvBuffer);

                const csvContent = fullBinaryData.toString('utf8');

                const pythonProcess = spawn('conda', ['run', '-n', 'base', 'python', 'findLoops.py'])

                let pythonOutput = '';
                let pythonError = '';

                pythonProcess.stdout.on('data', (data) => {
                    pythonOutput += data.toString();
                });

                pythonProcess.stderr.on('data', (data) => {
                    pythonError += data.toString();
                    console.error(`Python stderr`);
                });

                pythonProcess.on('close', (code) => {
                    if (code === 0) {
                        try {
                            const result = JSON.parse(pythonOutput);
                            ws.send(JSON.stringify(result));
                            console.log(`Algorithm result sent.`);
                        } catch (e) {
                            console.error(`Failed to parse Python output as JSON.`);
                            ws.send(JSON.stringify({status: 'error', message: 'Failed to parse Python output.', raw_output: pythonOutput, parse_error: e.message }));
                        }
                    } else {
                        ws.send(JSON.stringify({status: 'error', message: `Python script failed.`}));
                    }
                });

                pythonProcess.stdin.write(csvContent);
                pythonProcess.stdin.end();

                clientState.fileName = null;
                clientState.csvBuffer = [];
            } else {
                console.log(`Recieved unknown text message.`);
                ws.send(JSON.stringify({ status: 'info', message: `Recieved: ${message}`}));
            }
        } else if (message instanceof Buffer) {
            if (clientState.fileName) {
                clientState.csvBuffer.push(message);
            } else {
                console.warn(`Recieved unexpected binary data`);
                ws.send(JSON.stringify({ status: 'error', message: 'Received unexpected binary data, please send message first'}))
            }
        } else {
            console.warn(`Recieved unknown message type`);
            ws.send(JSON.stringify({ status: 'error', message: 'Recieved unknown message type.'}));
        }
    });
});

/*
server.on('connection', socket => {
    socket.on('message', message => {
        const b = Buffer.from(message)
        console.log(b.toString())
        socket.send(`${message}`)
    })
})*/