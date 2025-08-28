//------------------------------------------------------
main();

function main() {
    registeredStudentsdropDown = document.getElementById("registeredStudentsdropDown");
    const txtChatGpt = `Generate an end of course detailed but short report, using the criteria below for each student.`;
    document.getElementById("chatGptInstructions").innerText = txtChatGpt;
    data = getCourseDataFromLocalStorage();

    setupOptions();
    showRegisteredStudentsdropDown(); // from LocalStorage  
}

async function pasteStudentNames() {
    try {
        const text = await navigator.clipboard.readText();
        let names = text.split(/\r?\n/).map(name => name.trim()).filter(name => name.length > 0);

        let studentNames = names.map(name => {
            let nameParts = name.split(",");
            return nameParts.length > 1
                ? nameParts[1].trim() + " " + nameParts[0].trim()
                : nameParts[0].trim();
        });

        registeredStudentsdropDown.innerHTML = "<option>--type a name or paste list--</option>";
        for (let fullName of studentNames) {
            let op = document.createElement("option");
            op.innerText = fullName;
            registeredStudentsdropDown.appendChild(op);
        }
    } catch (err) {
        alert('Failed to read clipboard contents: ' + err);
    }
}

function typeStudent() {
    const index = registeredStudentsdropDown.selectedIndex;
    let name = registeredStudentsdropDown.options[index].text;
    if (name.startsWith("--")) return;
    const firstName = name.split(" ")[0]
    setValue("learner", firstName);
    registeredStudentsdropDown.options[index].style.color = "blue";
}

function showRegisteredStudentsdropDown() {
    registeredStudentsdropDown.innerHTML = "<option>--type a name or paste list--</option>";
    for (let stu of data) {
        let op = document.createElement("option");
        op.innerText = stu.name;
        registeredStudentsdropDown.appendChild(op);
    }
}

function isRegistered(newStuName) {
    let data = getCourseDataFromLocalStorage();
    for (let stu of data) {
        if (stu.name.toLowerCase() == newStuName.toLowerCase()) return true;
    }
    return false;
}

function savedClick() {
    const learnerName = getValue('learner').trim();
    if (learnerName.length == 0) {
        alert("Please enter the student's name")
        return;
    }
    if (isRegistered(learnerName)) {
        alert("Student name already registered!")
        return;
    }
    const fname = learnerName.charAt(0).toUpperCase() + learnerName.slice(1);

    let comments = getValue('comments').replace(/<name>/g, fname);

    let learner = {
        'name': learnerName,
        'comments': comments
    };
    for (const attr of radioNames) {
        learner[attr] = getValue(attr);
    }
    data.push(learner);
    setCourseData();
    resetForm();
    // showRegisteredStudentsdropDown();
    if(nameChanged){
        let opNewName = document.createElement("option");
        opNewName.innerText = learnerName;
        registeredStudentsdropDown.appendChild(opNewName);
        nameChanged = false;    
    }
}
//-------------------------------------------------------
function resetForm() {
    setValue('learner', '').focus();
    setValue('comments', '');

    document.querySelectorAll('select').forEach(item => {
        item.selectedIndex = 0;
    });
}

// set up the select option tags --------------------------
function setupOptions() {
    let options = document.getElementById("options");
    options.innerHTML = "";
    radioNames = getValue("radioNames").split(",");
    states = getValue("states").split(",");

    for (let i = 0; i < radioNames.length; i++) {
        let selectLabel = makeTag("span", radioNames[i] + ": ", options);
        let select = makeTag("select", "", options)
        let optionString = states.map(opt => `<option>${opt}</option>`).join('');
        select.innerHTML = optionString;
        select.id = radioNames[i];
        if ((i + 1) % 3 === 0)
            makeTag("hr", "", options);
    }
    setValue("start_date", new Date().toISOString().split('T')[0]);
}
//-------------------------------------------------------------------
function generateReports() {
    let report = getValue("chatGptInstructions") + "\n";
    report += `Insert "w/c ${getValue("start_date")} - ${getValue("course_title")} 
    at the start of each student report and after their name:${JSON.stringify(data)}`;

    navigator.clipboard.writeText(report)
        .then(() => alert("Copied to clipboard!"))
        .catch(err => alert("Failed to copy: " + err));
}

function txtNameChanged() {
    nameChanged = true;        
}
//-------------------------------- Utils ---------------
function getValue(optionID) {
    const op = document.getElementById(optionID);
    return op.value;
}

function setValue(optionID, newValue) {
    const op = document.getElementById(optionID);
    op.value = newValue;
    return op;
}

function makeTag(tagName, tagText, tagContainer, tagClass = "roundEdge") {
    let newTag = document.createElement(tagName);
    newTag.innerText = tagText;
    newTag.classList.add(tagClass);
    tagContainer.appendChild(newTag);
    return newTag;
}

function getCourseDataFromLocalStorage() {
    let x = localStorage.getItem('courseData');
    if (x === null)
        return [];
    else
        return JSON.parse(x);
}

function setCourseData() {
    localStorage.setItem('courseData', JSON.stringify(data));
}

function deleteCourseData() {
    if (confirm('Delete all Course data?')) {
        localStorage.removeItem('courseData');
        data = [];
        showRegisteredStudentsdropDown();
    }
}

