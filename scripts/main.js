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


var commands;

// This list is in alphabetical order by commandName
function loadCommands()
{
    commands = [];
    commands.push({ commandName: "acceptAlert", method: "POST", path: "/session/SESSION_ID/accept_alert", requestBody: "" });
    commands.push({ commandName: "addCookie", method: "POST", path: "/session/SESSION_ID/cookie", requestBody: "{\"cookie\":{\"name\":\"myCookie\", \"value\":\"C is for COOKIE!!\"}}" });
    commands.push({ commandName: "clear", method: "POST", path: "/session/SESSION_ID/element/ELEMENT_ID/clear", requestBody: "" });
    commands.push({ commandName: "click", method: "POST", path: "/session/SESSION_ID/element/ELEMENT_ID/click", requestBody: "" });
    commands.push({ commandName: "deleteCookie", method: "DELETE", path: "/session/SESSION_ID/cookie/myCookie", requestBody: "" });
    commands.push({ commandName: "deleteCookies", method: "DELETE", path: "/session/SESSION_ID/cookie", requestBody: "" });
    commands.push({ commandName: "deleteLocalStorage", method: "DELETE", path: "/session/SESSION_ID/local_storage", requestBody: "" });
    commands.push({ commandName: "deleteLocalStorageKey", method: "DELETE", path: "/session/:sessionId/session_storage/key/:key", requestBody: "" });
    commands.push({ commandName: "deleteSessionStorage", method: "DELETE", path: "/session/SESSION_ID/session_storage", requestBody: "" });
    commands.push({ commandName: "deleteSessionStorageKey", method: "DELETE", path: "/session/:sessionId/session_storage/key/:key", requestBody: "" });   
    commands.push({ commandName: "dismissAlert", method: "POST", path: "/session/SESSION_ID/dismiss_alert", requestBody: "" });
    commands.push({ commandName: "executeScript", method: "POST", path: "/session/SESSION_ID/execute", requestBody: "{\"script\": \"return arguments[0].second;\",\"args\": [{\"first\":\"1st\", \"second\":\"2nd\", \"third\":\"3rd\"}]}" });
    commands.push({ commandName: "executeScriptAsync", method: "POST", path: "/session/SESSION_ID/execute_async",
        requestBody: "{\"script\": \"arguments[1]([ document.getElementsByTagName('div'), 1, 'fancy string', 1.2, {objProp: 3}]);\",\"args\": [{\"first\":\"1st\", \"second\":\"2nd\", \"third\":\"3rd\"}]}" });
    commands.push({ commandName: "findElement", method: "POST", path: "/session/SESSION_ID/element", requestBody: "{\"using\": \"id\",\"value\": \"clickAnchorElement\"}" });
    commands.push({ commandName: "findElementFrom", method: "POST", path: "/session/SESSION_ID/element/ELEMENT_ID/element", requestBody: "{\"using\": \"id\",\"value\": \"clickAnchorElement\"}" });
    commands.push({ commandName: "findElements", method: "POST", path: "/session/SESSION_ID/elements", requestBody: "{\"using\": \"id\",\"value\": \"clickAnchorElement\"}" });
    commands.push({ commandName: "findElementsFrom", method: "POST", path: "/session/SESSION_ID/element/ELEMENT_ID/elements", requestBody: "{\"using\": \"id\",\"value\": \"clickAnchorElement\"}" });
    commands.push({ commandName: "get", method: "POST", path: "/session/SESSION_ID/url", requestBody: "{\"url\":\"http://www.bing.com\"}" });
    commands.push({ commandName: "getActiveElement", method: "GET", path: "/session/SESSION_ID/element/active", requestBody: "" });
    commands.push({ commandName: "getAlertText", method: "GET", path: "/session/SESSION_ID/alert_text", requestBody: "" });
    commands.push({ commandName: "getCapabilities", method: "GET", path: "/session/SESSION_ID", requestBody: "" });
    commands.push({ commandName: "getCookie", method: "GET", path: "/session/SESSION_ID/cookie/myCookie", requestBody: "" });
    commands.push({ commandName: "getCookies", method: "GET", path: "/session/SESSION_ID/cookie", requestBody: "" });
    commands.push({ commandName: "getCssValue", method: "GET", path: "/session/SESSION_ID/element/ELEMENT_ID/css/:propertyName", requestBody: "" });
    commands.push({ commandName: "getCurrentUrl", method: "GET", path: "/session/SESSION_ID/url", requestBody: "" });
    commands.push({ commandName: "getElementAttribute", method: "GET", path: "/session/SESSION_ID/element/ELEMENT_ID/attribute/innerHTML", requestBody: "" });
    commands.push({ commandName: "getElementEquals", method: "GET", path: "/session/SESSION_ID/element/ELEMENT_ID/equals/OTHER_ELEMENT_ID", requestBody: "" });
    commands.push({ commandName: "getElementRect", method: "GET", path: "/session/SESSION_ID/element/ELEMENT_ID/rect", requestBody: "" });
    commands.push({ commandName: "getElementScreenshot", method: "GET", path: "/session/SESSION_ID/element/ELEMENT_ID/screenshot", requestBody: "" });
    commands.push({ commandName: "getElementSize", method: "GET", path: "/session/SESSION_ID/element/ELEMENT_ID/size", requestBody: "" });
    commands.push({ commandName: "getElementTagName", method: "GET", path: "/session/SESSION_ID/element/ELEMENT_ID/name", requestBody: "" });
    commands.push({ commandName: "getElementText", method: "GET", path: "/session/SESSION_ID/element/ELEMENT_ID/text", requestBody: "" });
    commands.push({ commandName: "getLocation", method: "GET", path: "/session/SESSION_ID/element/ELEMENT_ID/location", requestBody: "" });
    commands.push({ commandName: "getLocationInView", method: "GET", path: "/session/SESSION_ID/element/ELEMENT_ID/location_in_view", requestBody: "" });
    commands.push({ commandName: "getLocalStorageKeys", method: "GET", path: "/session/SESSION_ID/local_storage", requestBody: "" });
    commands.push({ commandName: "getLocalStorageSize", method: "GET", path: "/session/:sessionId/local_storage/size", requestBody: "" });
    commands.push({ commandName: "getLocalStorageKey", method: "GET", path: "/session/:sessionId/local_storage/key/:key", requestBody: "" });
    commands.push({ commandName: "getPageSource", method: "GET", path: "/session/SESSION_ID/source", requestBody: "" });
    commands.push({ commandName: "getSessionStorageKeys", method: "GET", path: "/session/SESSION_ID/session_storage", requestBody: "" });
    commands.push({ commandName: "getSessionStorageSize", method: "GET", path: "/session/:sessionId/session_storage/size", requestBody: "" });
    commands.push({ commandName: "getSessionStorageKey", method: "GET", path: "/session/:sessionId/session_storage/key/:key", requestBody: "" });
    commands.push({ commandName: "getTitle", method: "GET", path: "/session/SESSION_ID/title", requestBody: "" });
    commands.push({ commandName: "getWindowHandle", method: "GET", path: "/session/SESSION_ID/window_handle", requestBody: "" });
    commands.push({ commandName: "getWindowHandles", method: "GET", path: "/session/SESSION_ID/window_handles", requestBody: "" });
    commands.push({ commandName: "getWindowPosition", method: "GET", path: "/session/SESSION_ID/window/current/position", requestBody: "" });
    commands.push({ commandName: "getWindowSize", method: "GET", path: "/session/SESSION_ID/window/current/size", requestBody: "" });
    commands.push({ commandName: "isDisplayed", method: "GET", path: "/session/SESSION_ID/element/ELEMENT_ID/displayed", requestBody: "" });
    commands.push({ commandName: "isEnabled", method: "GET", path: "/session/SESSION_ID/element/ELEMENT_ID/enabled", requestBody: "" });
    commands.push({ commandName: "isSelected", method: "GET", path: "/session/SESSION_ID/element/ELEMENT_ID/selected", requestBody: "" });
    commands.push({ commandName: "maximizeWindow", method: "POST", path: "/session/SESSION_ID/window/current/maximize", requestBody: "" });
    commands.push({ commandName: "moveto", method: "POST", path: "/session/SESSION_ID/moveto", requestBody: "{\"element\": \"ELEMENT_ID\",\"xoffset\": 0,\"yoffset\": 0}" });
    commands.push({ commandName: "newSession", method: "POST", path: "/session", requestBody: "{\"desiredCapabilities\":{ \"browserName\":\"<browserName>\", \"browserVersion\":\"<browserVersion>\", \"platformName\":\"Windows NT\", \"platformVersion\":\"10\"},\"requiredCapabilities\":{}}" });
    commands.push({ commandName: "quit", method: "DELETE", path: "/session/SESSION_ID", requestBody: "" });
    commands.push({ commandName: "screenshot", method: "GET", path: "/session/SESSION_ID/screenshot", requestBody: "" });
    commands.push({ commandName: "sendKeys", method: "POST", path: "/session/SESSION_ID/element/ELEMENT_ID/value", requestBody: "{\"value\": [\"a\", \"b\", \"c\"]}" });
    commands.push({ commandName: "sendKeysToPrompt", method: "POST", path: "/session/SESSION_ID/alert_text", requestBody: "{\"text\": \"cheese\"}" });
    commands.push({ commandName: "sessions", method: "GET", path: "/sessions", requestBody: "" });
    commands.push({ commandName: "setLocalStorageKey", method: "POST", path: "/session/SESSION_ID/local_storage", requestBody: "{key: \"a\", value: \"b\"}" });
    commands.push({ commandName: "setSessionStorageKey", method: "POST", path: "/session/SESSION_ID/session_storage", requestBody: "{key: \"a\", value: \"b\"}" });
    commands.push({ commandName: "setWindowPosition", method: "POST", path: "/session/SESSION_ID/window/current/position", requestBody: "{\"x\": 100, \"y\": 100}" });
    commands.push({ commandName: "setWindowSize", method: "POST", path: "/session/SESSION_ID/window/current/size", requestBody: "{\"width\": 500, \"height\": 500}" });
    commands.push({ commandName: "switchToWindow", method: "POST", path: "/session/SESSION_ID/window", requestBody: "{\"handle\":\"\"}" });
    commands.push({ commandName: "status", method: "GET", path: "/status", requestBody: "" });
    commands.push({ commandName: "submitForm", method: "POST", path: "/session/SESSION_ID/element/ELEMENT_ID/submit", requestBody: "" });
    commands.push({ commandName: "timeoutsImplicitWait", method: "POST", path: "/session/SESSION_ID/timeouts/implicit_wait", requestBody: "{\"ms\":5000}" });
    commands.push({ commandName: "timeouts", method: "POST", path: "/session/SESSION_ID/timeouts", requestBody: "{\"type\": \"script\", \"ms\": 30000 }" });
}

function getTimeString() {
    var currentdate = new Date();
    var datetime = currentdate.getDate() + "/"
                + (currentdate.getMonth() + 1) + "/"
                + currentdate.getFullYear() + " "
                + currentdate.getHours() + ":"
                + currentdate.getMinutes() + ":"
                + currentdate.getSeconds();

    return datetime;
}

var responseCodeMap = new Map();
function loadResponseCodeMap() {
    responseCodeMap.set(-1, "Invalid");
    responseCodeMap.set(0, "Success");
    responseCodeMap.set(6, "NoSuchDriver");
    responseCodeMap.set(7, "NoSuchElement");
    responseCodeMap.set(8, "NoSuchFrame");
    responseCodeMap.set(9, "UnknownCommand");
    responseCodeMap.set(10, "StaleElementReference");
    responseCodeMap.set(11, "ElementNotVisible");
    responseCodeMap.set(12, "InvalidElementState");
    responseCodeMap.set(13, "UnknownError");
    responseCodeMap.set(15, "ElementIsNotSelectable");
    responseCodeMap.set(17, "JavaScriptError");
    responseCodeMap.set(19, "XPathLookupError");
    responseCodeMap.set(21, "Timeout");
    responseCodeMap.set(23, "NoSuchWindow");
    responseCodeMap.set(24, "InvalidCookieDomain");
    responseCodeMap.set(25, "UnableToSetCookie");
    responseCodeMap.set(26, "UnexpectedAlertOpen");
    responseCodeMap.set(27, "NoAlertOpenError");
    responseCodeMap.set(28, "ScriptTimeout");
    responseCodeMap.set(29, "InvalidElementCoordinates");
    responseCodeMap.set(30, "IMENotAvailable");
    responseCodeMap.set(31, "IMEEngineActivationFailed");
    responseCodeMap.set(32, "InvalidSelector");
    responseCodeMap.set(33, "SessionNotCreatedException");
    responseCodeMap.set(34, "MoveTargetOutOfBounds");
    responseCodeMap.set(40, "UnsupportedOperation");
    responseCodeMap.set(41, "UnableToTakeScreenshot");
    responseCodeMap.set(42, "NotImplemented");
    responseCodeMap.set(43, "InvalidArgument");
}
