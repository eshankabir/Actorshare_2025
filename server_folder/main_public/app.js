const socket = new WebSocket('ws://localhost:3000/main')
let hasFile = false;
const deviceList = document.getElementById('device_list');

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

device_names.forEach( device => {
    const listItem = document.createElement('li');
    listItem.textContent = device.name;
    deviceList.appendChild(listItem);
})

/*
function renderList() {
    document.getElementById('device_list').innerHTML = device_names.map((device) => {
        return `<li>${ device.name }`
    }).join('');
}
*/

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


function handleCsvFile(file) {
    Papa.parse(file, {
        skipEmptyLines: true,

        complete : csv => {
            var table = document.getElementById("roles");
            table.innerHTML = "";

            var thead = table.createTHead();
            var tr = thead.insertRow();
            for (let cell of csv.data[0]) {
                let td = tr.insertCell();
                td.innerHTML = cell;
            }

            var tbody = table.createTBody();
            for (let i=1; i<csv.data.length; i++) {
                let row = csv.data[i],
                    tr = tbody.insertRow();
                tr.classList.add('role-row');
                for (let cell of row) {
                    let td = tr.insertCell();
                    td.innerHTML = cell;
                }
            }

            const rows = document.querySelectorAll(".role-row");

            for(let i = 0; i < rows.length; i++) {
                const role = rows[i].querySelector("td:first-child").textContent;

                if (role.includes("FN")) {rows[i].classList.add("femme-noir"); }
                else if (role.includes("Wiz")) {rows[i].classList.add("wiz"); }
                else if (role.includes("RTC")) {rows[i].classList.add("cyclone"); }
                else if (role.includes("IN")) {rows[i].classList.add("indecent"); }
                else if (role.includes("ML")) {rows[i].classList.add("machinal"); }
                else if (role.includes("AL")) {rows[i].classList.add("alive"); }
                else if (role.includes("RT")) {rows[i].classList.add("r-town"); }
                else if (role.includes("OAB")) {rows[i].classList.add("bandit"); }
                else if (role.includes("JC")) {rows[i].classList.add("caesar"); }
                else if (role.includes("CUSS NT")) {rows[i].classList.add("night-of-the-show"); }
                else if (role.includes("CUSS")) {rows[i].classList.add("cuss-general"); }

                rows[i].querySelector("td:first-child").classList.add("role-column");  
            }

            runPythonScript(file);
        }
    })
}

function runPythonScript(input) {
    $.ajax({
        type: "POST",
        url: "/findLoops.py",
        data: { param: input },
        success: callbackFunc
    });  
}
    

    

//function callbackFunc(response) {
//    console.log(response);
//}

