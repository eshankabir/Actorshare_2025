const socket = new WebSocket('ws://localhost:3000/main')
let hasFile = false;

const device_names = [
    { name: 'Helen' },
    { name: 'Wren' },
    { name: 'Is' }, 
];

const fileInput = document.getElementById("csvFile");

fileInput.addEventListener("change", function() {
    const file = fileInput.files[0];
    if (file && file.type === "text/csv") {
        alert("CSV file has been selected: " + file.name);
        hasFile = true;
        handleCsvFile(file);
    } else {
        alert("Please select a CSV file.");
    }
});

function renderList() {
    document.getElementById('device_list').innerHTML = device_names.map((device) => {
        return `<li>${ device.name }`
    }).join('');
}

document.getElementById('runAlgorithm').addEventListener('click', function() {
    if (hasFile) {
        const spawn = require("child_process").spawn;
        const pythonProcess = spawn('python', ["./findLoops.py", arg1]);

        pythonProcess.stdout.on('data', (data) => {

        })
    } else {
        alert("No file found.");
    }
})


/*
function runPythonScript(input) {
    $.ajax({
        type: "POST",
        url: "/findLoops.py",
        data: { param: input },
        success: callbackFunc
    });  
}*/

function handleCsvFile(file) {
    runPythonScript(file);
}

//function callbackFunc(response) {
//    console.log(response);
//}

renderList();
