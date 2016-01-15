var lastCommandSent;

function setupCommands() {
    loadCommands();
    var s = document.getElementById("commands-select");
    for (var j = 0; j < commands.length; j++) {
        var o = document.createElement("OPTION");
        o.value = commands[j].commandName;
        o.id = "commands-select-" + commands[j].commandName;
        o.innerHTML = commands[j].commandName;

        s.appendChild(o);
    }
}

function setupHttpMethods() {
    var methods = ["GET", "POST", "DELETE"];

    var s = document.getElementById("methods-select");
    for (var j = 0; j < methods.length; j++) {
        var o = document.createElement("OPTION");
        o.value = methods[j];
        o.innerHTML = methods[j];
        s.appendChild(o);
        o.selected = true;
    }
}

function setup()
{
    setupCommands();
    setupHttpMethods();
    loadResponseCodeMap();

    // Defaults to newSession command
    document.getElementById("commands-select-newSession").selected = true;
    updateCommand();
}

function quickCommand(cmd)
{
    var strOption = "commands-select-" + cmd;
    document.getElementById(strOption).selected = true;
    updateCommand();
}

function replaceIdsInPath(str, selectType, tokenToReplace) {
    var s = document.getElementById(selectType);
    var index = -1;
    if (s.size == 1) {
        index = 0;
    }
    else {
        index = s.selectedIndex;
    }

    if (index >= 0) {
        var sessionId = document.getElementById(selectType).childNodes[index].value;
        str = str.replace(tokenToReplace, sessionId);
    }

    return str;
}

function checkForIds(str)
{
    str = replaceIdsInPath(str, "session-select", "SESSION_ID");
    str = replaceIdsInPath(str, "element-select", "ELEMENT_ID");
    return str;
}

function updateCommand() {
    var s = document.getElementById("commands-select");

    for (var i = 0; i < commands.length; i++) {
        if (commands[i].commandName == s.options[s.selectedIndex].value) {
            document.getElementById("methods-select").value = commands[i].method;
            document.getElementById("path").value = checkForIds(commands[i].path);

            if (commands[i].requestBody != "") {
                try {
                    var jsonObj = JSON.parse(commands[i].requestBody);
                    var jsonString = JSON.stringify(jsonObj, null, 4);
                    document.getElementById("content-area").value = checkForIds(jsonString);
                }
                catch (err) {
                    logError(err.message);
                }
            }
            else {
                document.getElementById("content-area").value = "";
            }
            break;
        }
    }
}

function formatJSON() {
    try {
        var t = document.getElementById("content-area");
        var jsonObj = JSON.parse(t.value);
        var jsonString = JSON.stringify(jsonObj, null, 4);
        t.value = jsonString;
    }
    catch (err) {
        logError(err.message);
    }
}

function logRequest(method, url, requestBody) {
    var lRequest = "<div class=\"bg-info\">" + "<p>" + getTimeString() + "- Request " + method + " " + url + "</p>";
    if (requestBody != "")
    {
        try
        {
            var jsonObj = JSON.parse(requestBody);
            var jsonString = JSON.stringify(jsonObj, null, 4);
            lRequest += "<pre>" + jsonString + "</pre>";
        }
        catch (err)
        {
            logError(err.message);
        }
    }
    lRequest += "</div>";

    var d = document.createElement("div");
    d.class = "loq-request";
    d.innerHTML = lRequest;

    var l = document.getElementById("log-contents");
    l.insertBefore(d, l.firstChild);
}

function logResponse(status, contentBody) {
    var lResponse = "<div class=\"bg-success\">" + "<p>" + getTimeString() + "- Response " + status + "</p>";
    if (contentBody != "") {
        try {
            var jsonObj = JSON.parse(contentBody);
            if ((lastCommandSent == "screenshot" || lastCommandSent == "getElementScreenshot") && status == 200) {
                var imgBase64 = jsonObj.value;
                jsonObj.value = "<img src='data:image/png;base64," + imgBase64 + "' />";
            }

            lResponse += "<p>Response code " + jsonObj.status + " indicates: " + responseCodeMap.get(jsonObj.status) + "</p>"

            var jsonString = JSON.stringify(jsonObj, null, 4);

            lResponse += "<pre>" + jsonString + "</pre>";
        }
        catch (err) {
            // The content is not JSON
            lResponse += "<pre>" + contentBody + "</pre>";
        }
    }
    lResponse += "</div>";

    var d = document.createElement("div");
    d.class = "loq-response";
    d.innerHTML = lResponse;

    var l = document.getElementById("log-contents");
    l.insertBefore(d, l.firstChild);
}

function logError(errMsg) {
    var lError = "<div class=\"bg-danger\">" + "<p>" + getTimeString() + "-" + errMsg + "</p></div>";
    var d = document.createElement("div");
    d.class = "log-error";
    d.innerHTML = lError;

    var l = document.getElementById("log-contents");
    l.insertBefore(d, l.firstChild);
}

function clearLog() {
    document.getElementById("log-contents").innerHTML = "";
}

function clearElements() {
    document.getElementById("element-select").innerHTML = "";
}

function clearAll() {
    clearElements();
    clearLog();
}

function addSessionId(sessionId) {
    var o = document.createElement("option");
    o.value = sessionId;
    o.innerHTML = sessionId;

    var s = document.getElementById("session-select");
    s.appendChild(o);
    s.size = s.length;
    s.selectedIndex = s.length - 1;
}

function addElementId(elementId) {
    var o = document.createElement("option");
    o.value = elementId;
    o.innerHTML = elementId;

    var s = document.getElementById("element-select");
    s.appendChild(o);
    s.size = s.length;
    s.selectedIndex = s.length - 1;
}

function processResponse(xmlhttp) {
    logResponse(xmlhttp.status, xmlhttp.responseText);

    if (xmlhttp.status == 200)
    {
        try
        {
            var jsonObj = JSON.parse(xmlhttp.responseText);
            if (lastCommandSent == "newSession")
            {
                var sessionId = jsonObj.sessionId;
                if (sessionId != "")
                {
                    addSessionId(sessionId);
                }
            }
            else if (lastCommandSent == "findElement" 
			|| lastCommandSent == "findElementFrom" 
			|| lastCommandSent == "getActiveElement")
            {
                var elementId = jsonObj.value.ELEMENT;
                if (elementId != "")
                {
                    addElementId(elementId);
                }
            }
			else if (lastCommandSent == "findElements" || lastCommandSent == "findElementsFrom")
			{
				var elemArray = jsonObj.value;
				for (var i = 0; i < elemArray.length; i++)
				{
					addElementId(elemArray[i].ELEMENT);
				}
			}
            lastCommandSent = "";
        }
        catch (err)
        {
            logError(err.message);
        }
        
    }
}

function sendRequest() {
    var portNumber = document.getElementById("port").value;
    if (portNumber > 1024 && portNumber <= 65531) {
        var path = document.getElementById("path").value;
        var host = "http://localhost";
        if (document.getElementById("host").value) {
            host = document.getElementById("host").value;
        }
        var url = host + ":" + portNumber + path;
        var requestBody = document.getElementById("content-area").value;
        var method = document.getElementById("methods-select").value;
        logRequest(method, url, requestBody);

        lastCommandSent = document.getElementById("commands-select").value;

        var xmlhttp = new XMLHttpRequest();

        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4) {
                processResponse(xmlhttp);
            }
        }

        xmlhttp.open(method, url, true);
        if (requestBody == "") {
            xmlhttp.send();
        }
        else {
            xmlhttp.send(requestBody);
        }
    }
    else {
        logError("Port " + portNumber + " is not valid. Try another port number.")
    }
}
