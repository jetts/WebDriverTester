(function(){
	'use strict';

	var sessionId;
	var elementId;
	var lastCommandSent;
	var commands = [
		{
			commandName: 'acceptAlert',
			commandTitle: 'Accept Alert',
			method: 'POST',
			path: '/session/SESSION_ID/accept_alert',
			requestBody: '',
			description: 'JSON Wire Protocol: Accepts the currently displayed alert dialog. Usually, this is equivalent to clicking on the \'OK\' button in the dialog.'
		},
		{
			commandName: 'addCookie',
			commandTitle: 'Add Cookie',
			method: 'POST',
			path: '/session/SESSION_ID/cookie',
			requestBody: '\"cookie\":{\"name\":\"\", \"value\":\"\"}}',
			description: 'W3C: The Add Cookie command adds a single cookie to the cookie store associated with the active document\'s address'
		},
		{
			commandName: 'clear',
			commandTitle: 'Element Clear',
			method: 'POST',
			path: '/session/SESSION_ID/element/ELEMENT_ID/clear',
			requestBody: '',
			description: 'W3C: The Element Clear command scrolls into view a submittable element excluding buttons or editable elements, and then attempts to clear its value, checkedness, or text content.'
		},
		{
			commandName: 'click',
			commandTitle: 'Element Click',
			method: 'POST',
			path: '/session/SESSION_ID/element/ELEMENT_ID/click',
			requestBody: '',
			description: 'W3C: The Element Click command scrolls into view the element and then attempts to click the center of its visible area. In case the element is not displayed, an element not visible error is returned.'
		},
		{
			commandName: 'deleteCookie',
			commandTitle: 'Delete Cookie',
			method: 'DELETE',
			path: '/session/SESSION_ID/cookie/name',
			requestBody: '',
			description: 'W3C: The Delete Cookie command allows you to delete either a single cookie by parameter name, or all the cookies associated with the active document\'s address if name is undefined.'
		},
		{
			commandName: 'deleteCookies',
			commandTitle: 'Delete All Cookies',
			method: 'DELETE',
			path: '/session/SESSION_ID/cookie',
			requestBody: '',
			description: 'W3C: The Delete All Cookies command allows deletion of all cookies associated with the active documen\'s address'
		},
		{
			commandName: 'deleteLocalStorage',
			commandTitle: 'Delete Local Storage',
			method: 'DELETE',
			path: '/session/SESSION_ID/local_storage',
			requestBody: '',
			description: 'JSON Wire Protocol: Clear the storage.'
		},
		{
			commandName: 'deleteLocalStorageKey',
			commandTitle: 'Delete Local Storage Key',
			method: 'DELETE',
			path: '/session/SESSION_ID/session_storage/key/KEY_ID', // TODO: Add support for KEY_ID replacement
			requestBody: '',
			description: 'JSON Wire Protocol: Remove the storage item for the given key.'
		},
		{
			commandName: 'deleteSessionStorage',
			commandTitle: 'Delete Session Storage',
			method: 'DELETE',
			path: '/session/SESSION_ID/session_storage',
			requestBody: '',
			description: 'JSON Wire Protocol: Clear the storage.'
		},
		{
			commandName: 'deleteSessionStorageKey',
			commandTitle: 'Delete Session Storage Key',
			method: 'DELETE',
			path: '/session/SESSION_ID/session_storage/KEY_ID',
			requestBody: '',
			description: 'JSON Wire Protocol: Remove the storage item for the given key.'
		},
		{
			commandName: 'dismissAlert',
			commandTitle: 'Dismiss Alert',
			method: 'POST',
			path: '/session/SESSION_ID/dismiss_alert',
			requestBody: '',
			description: 'JSON Wire Protocol: Dismisses the currently displayed alert dialog. For confirm() and prompt() dialogs, this is equivalent to clicking the \'Cancel\' button. For alert() dialogs, this is equivalent to clicking the \'OK\' button.'
		},
		{
			commandName: 'executeScript',
			commandTitle: 'Execute Script',
			method: 'POST',
			path: '/session/SESSION_ID/execute',
			requestBody: '{\"script\": \"\",\"args\": []}',
			description: 'JSON Wire Protocol: Inject a snippet of JavaScript into the page for execution in the context of the currently selected frame. The executed script is assumed to be synchronous and the result of evaluating the script is returned to the client.'
		},
		{
			commandName: 'executeAsyncScript',
			commandTitle: 'Execute Async Script',
			method: 'POST',
			path: '/session/SESSION_ID/execute_async',
			requestBody: '{\"script\": \"arguments[1]([ document.getElementsByTagName(\'div\'), 1, \'fancy string\', 1.2, {objProp: 3}]);\",\"args\": [{\"first\":\"1st\", \"second\":\"2nd\", \"third\":\"3rd\"}]}',
			description: 'JSON Wire Protocol: Inject a snippet of JavaScript into the page for execution in the context of the currently selected frame. The executed script is assumed to be asynchronous and must signal that is done by invoking the provided callback, which is always provided as the final argument to the function. The value to this callback will be returned to the client.'
		},
		{
			commandName: 'findElement',
			commandTitle: 'Find Element',
			method: 'POST',
			path: '/session/SESSION_ID/element',
			requestBody: '{\"using\": \"id\",\"value\": \"\"}',
			description: 'JSON Wire Protocol: Search for an element on the page, starting from the document root. The located element will be returned as a WebElement JSON object. The table below lists the locator strategies that each server should support. Each locator must return the first matching element located in the DOM.'
		},
		{
			commandName: 'findElementFromElement',
			commandTitle: 'Find Element From Element',
			method: 'POST',
			path: '/session/SESSION_ID/element/ELEMENT_ID/element',
			requestBody: '{\"using\": \"id\",\"value\": \"\"}',
			description: 'JSON Wire Protocol: Search for an element on the page, starting from the identified element. The located element will be returned as a WebElement JSON object. The table below lists the locator strategies that each server should support. Each locator must return the first matching element located in the DOM.'
		},
		{
			commandName: 'findElements',
			commandTitle: 'Find Elements',
			method: 'POST',
			path: '/session/SESSION_ID/elements',
			requestBody: '{\"using\": \"id\",\"value\": \"\"}',
			description: 'JSON Wire Protocol: Search for multiple elements on the page, starting from the document root. The located elements will be returned as a WebElement JSON objects. The table below lists the locator strategies that each server should support. Elements should be returned in the order located in the DOM.'
		},
		{
			commandName: 'findElementsFromElement',
			commandTitle: 'Find Elements From Element',
			method: 'POST',
			path: '/session/SESSION_ID/element/ELEMENT_ID/elements',
			requestBody: '{\"using\": \"id\",\"value\": \"\"}',
			description: 'JSON Wire Protocol: Search for multiple elements on the page, starting from the identified element. The located elements will be returned as a WebElement JSON objects. The table below lists the locator strategies that each server should support. Elements should be returned in the order located in the DOM.'
		},
		{
			commandName: 'get',
			commandTitle: 'Get',
			method: 'POST',
			path: '/session/SESSION_ID/url',
			requestBody: '{\"url\":\"\"}',
			description: 'W3C: The Get command is used to cause the user agent to navigate the current top-level browsing context to a new location. From a user\'s point of view, it is as if they have entered a URL into the address bar of the browser\'s chrome.'
		},
		{
			commandName: 'getActiveElement',
			commandTitle: 'Get Active Element',
			method: 'GET',
			path: '/session/SESSION_ID/element/active',
			requestBody: '',
			description: 'W3C: The Get Active Element command returns the active element of the current browsing context\'s document element.'
		},
		{
			commandName: 'getAlertText',
			commandTitle: 'Get Alert Text',
			method: 'GET',
			path: '/session/SESSION_ID/alert_text',
			requestBody: '',
			description: 'JSON Wire Protocol: Gets the text of the currently displayed JavaScript alert(), confirm(), or prompt() dialog.'
		},
		{
			commandName: 'getCapabilities',
			commandTitle: 'Get Capabilities',
			method: 'GET',
			path: '/session/SESSION_ID',
			requestBody: '',
			description: 'JSON Wire Protocol: Retrieve the capabilities of the specified session.'
		},
		{
			commandName: 'getCookie',
			commandtitle: 'Get Cookie',
			method: 'GET',
			path: '/session/SESSION_ID/cookie/name',
			requestBody: '',
			description: 'W3C: The Get Cookie command returns all cookies associated with the address of the current browsing context’s active document.'
		},
		{
			commandName: 'getAllCookies',
			commandTitle: 'Get All Cookies',
			method: 'GET',
			path: '/session/SESSION_ID/cookie',
			requestBody: '',
			description: 'JSON Wire Protocol: Retrieve all cookies visible to the current page.'
		},
		{
			commandName: 'getElementCssValue',
			commandTitle: 'Get Element CSS Value',
			method: 'GET',
			path: '/session/SESSION_ID/element/ELEMENT_ID/css/propertyName',
			requestBody: '',
			description: 'W3C: The Get Element CSS Value command retrieves the computed value of the given CSS property of the given web element.'
		},
		{
			commandName: 'getCurrentUrl',
			commandTitle: 'Get Current URL',
			method: 'GET',
			path: '/session/SESSION_ID/url',
			requestBody: '',
			description: 'W3C: The Get Current URL command returns the URL of the current top-level browsing context.'
		},
		{
			commandName: 'getElementAttribute',
			commandTitle: 'Get Element Attribute',
			method: 'GET',
			path: '/session/SESSION_ID/element/ELEMENT_ID/attribute/name',
			requestBody: '',
			description: 'W3C: The Get Element Attribute command will return the attribute of a web element.'
		},
		{
			commandName: 'getElementEquals',
			commandTitle: 'Get Element Equals',
			method: 'GET',
			path: '/session/SESSION_ID/element/ELEMENT_ID/equals/OTHER_ELEMENT_ID', // TODO: Add support for OTHER_ELEMENT_ID
			requestBody: '',
			description: 'JSON Wire Protocol: Test if two element IDs refer to the same DOM element.'
		},
		{
			commandName: 'getElementRect',
			commandTitle: 'Get Element Rect',
			method: 'GET',
			path: '/session/SESSION_ID/element/ELEMENT_ID/rect',
			requestBody: '',
			description: 'W3C: The Get Element Rect command returns the dimensions and coordinates of the given web element.'
		},
        {
            commandName: 'takeElementScreenshot',
            commandTitle: 'Take Element Screenshot',
            method: 'GET',
            path: '/session/SESSION_ID/element/ELEMENT_ID/screenshot',
            requestBody: '',
            description: 'W3C: The Take Element Screenshot command takes a screenshot of the visible region encompassed by the bounding rectangle of an element. If given a parameter argument scroll that evaluates to false, the element will not be scrolled into view.'
        },
		{
			commandName: 'getElementSize',
			commandTitle: 'Get Element Size',
			method: 'GET',
			path: '/session/SESSION_ID/element/ELEMENT_ID/size',
			requestBody: '',
			description: 'JSON Wire Protocol: Determine an element\'s size in pixels. The size will be returned as a JSON object with width and height properties.'
		},
        {
            commandName: 'getElementTagName',
            commandTitle: 'Get Element Tag Name',
            method: 'GET',
            path: '/session/SESSION_ID/element/ELEMENT_ID/name',
            requestBody: '',
            description: 'W3C: The Get Element Tag Name command returns the qualified tag name name of the given web element.'
        },
        {
            commandName: 'getElementText',
            commandTitle: 'Get Element Text',
            method: 'GET',
            path: '/session/SESSION_ID/element/ELEMENT_ID/text',
            requestBody: '',
            description: 'JSON Wire Protocol: Returns the visible text for the element.'
        },
		{
			commandName: 'getElementLocation',
			commandTitle: 'Get Element Location',
			method: 'GET',
			path: '/session/SESSION_ID/element/ELEMENT_ID/location',
			requestBody: '',
			description: 'JSON Wire Protocol: Determine an element\'s location on the page. The point (0, 0) refers to the upper-left corner of the page. The element\'s coordinates are returned as a JSON object with x and y properties.'
		},
		{
			commandName: 'getElementLocationInView',
			commandTitle: 'Get Element Location In View',
			method: 'GET',
			path: '/session/SESSION_ID/element/ELEMENT_ID/location_in_view',
			requestBody: '',
			description: 'JSON Wire Protocol: Determine an element\'s location on the screen once it has been scrolled into view.'
		},
		{
			commandName: 'getLocalStorageKeys',
			commandTitle: 'Get Local Storage Keys',
			method: 'GET',
			path: '/session/SESSION_ID/local_storage',
			requestBody: '',
			description: 'JSON Wire Protocol: Get all keys of the storage.'
		},
		{
			commandName: 'getLocalStorageSize',
			commandTitle: 'Get Local Storage Size',
			method: 'GET',
			path: '/session/SESSION_ID/local_storage/size',
			requestBody: '',
			description: 'JSON Wire Protocol: Get the number of items in the storage.'
		},
		{
			commandName: 'getLocalStorageKey',
			commandTitle: 'Get Local Storage Key',
			method: 'GET',
			path: '/session/SESSION_ID/local_storage/key/KEY_ID',
			requestBody: '',
			description: 'JSON Wire Protocol: Get the storage item for the given key.'
		},
		{
			commandName: 'getPageSource',
			commandTitle: 'Get Page Source',
			method: 'GET',
			path: '/session/SESSION_ID/source',
			requestBody: '',
			description: 'W3C: The Get Page Source command returns a string serialisation of the DOM of the current browsing context active document.'
		},
		{
			commandName: 'getSessionStorageKeys',
			commandTitle: 'Get Session Storage Keys',
			method: 'GET',
			path: '/session/SESSION_ID/session_storage',
			requestBody: '',
			description: 'JSON Wire Protocol: Get all keys of the storage.'
		},
		{
			commandName: 'getSessionStorageSize',
			commandTitle: 'Get Session Storage Size',
			method: 'GET',
			path: '/session/SESSION_ID/session_storage/size',
			requestBody: '',
			description: 'JSON Wire Protocol: Get the number of items in the storage.'
		},
		{
			commandName: 'getSessionStorageKey',
			commandTitle: 'Get Session Storage Key',
			method: 'GET',
			path: 'session/SESSION_ID/session_storage/key/KEY_ID',
			requestBody: '',
			description: 'JSON Wire Protocol: Get the storage item for the given key.'
		},
        {
            commandName: 'getTitle',
            commandTitle: 'Get Title',
            method: 'GET',
            path: '/session/SESSION_ID/title',
            requestBody: '',
            description: 'W3C: The Get Title command returns the document title of the current top-level browsing context, equivalent to calling window.top.document.title.'
        },
		{
			commandName: 'getWindowHandle',
			commandTitle: 'Get Window Handle',
			method: 'GET',
			path: '/session/SESSION_ID/window_handle',
			requestBody: '',
			description: 'W3C: The Get Window Handle command returns the window handle for the current top-level browsing context. It can be used as an argument to Switch To Window.'
		},
		{
			commandName: 'getWindowHandles',
			commandTitle: 'Get Window Handles',
			method: 'GET',
			path: 'session/SESSION_ID/window_handles',
			requestBody: '',
			description: 'JSON Wire Protocol: Retrieve the list of all window handles available to the session.'
		},
		{
			commandName: 'getWindowPosition',
			commandTitle: 'Get Window Position',
			method: 'GET',
			path: '/session/SESSION_ID/window/WINDOW_ID/position',
			requestBody: '',
			description: 'JSON Wire Protocol: Get the position of the specified window. If the :windowHandle URL parameter is "current", the position of the currently active window will be returned.'
		},
		{
			commandName: 'getWindowSize',
			commandTitle: 'Get Window Size',
			method: 'GET',
			path: '/session/SESSION_ID/window/WINDOW_ID/size',
			requestBody: '',
			description: 'JSON Wire Protocol: Get the size of the specified window. If the :windowHandle URL parameter is "current", the size of the currently active window will be returned.'
		},
		{
			commandName: 'isElementDisplayed',
			commandTitle: 'Is Element Displayed',
			method: 'GET',
			path: '/session/SESSION_ID/element/ELEMENT_ID/displayed',
			requestBody: '',
			description: 'JSON Wire Protocol: Determine if an element is currently displayed.'
		},
		{
			commandName: 'isElementEnabled',
			commandTitle: 'Is Element Enabled',
			method: 'GET',
			path: '/session/SESSION_ID/element/ELEMENT_ID/enabled',
			requestBody: '',
			description: 'W3C: Is Element Enabled determines if the referenced element is enabled or not. This operation only makes sense on form controls.'
		},
		{
			commandName: 'isElementSelected',
			commandTitle: 'Is Element Selected',
			method: 'GET',
			path: '/session/SESSION_ID/element/ELEMENT_ID/selected',
			requestBody: '',
			description: 'W3C: Is Element Selected determines if the referenced element is selected or not. This operation only makes sense on input elements of the Checkbox- and Radio Button states, or option elements.'
		},
		{
			commandName: 'maximizeWindow',
			commandTitle: 'Maximize Window',
			method: 'POST',
			path: '/session/SESSION_ID/window/WINDOW_ID/maximize',
			requestBody: '',
			description: 'JSON Wire Protocol: Maximize the specified window if not already maximized. If the :windowHandle URL parameter is "current", the currently active window will be maximized.'
		},
		{
			commandName: 'moveTo',
			commandTitle: 'Move To',
			method: 'POST',
			path: '/session/SESSION_ID/moveto',
			requestBody: '{\"element\": \"ELEMENT_ID\",\"xoffset\": 0,\"yoffset\": 0}',
			description: 'JSON Wire Protocol: Move the mouse by an offset of the specificed element. If no element is specified, the move is relative to the current mouse cursor. If an element is provided but no offset, the mouse will be moved to the center of the element. If the element is not visible, it will be scrolled into view.'
		},
        {
            commandName: 'newSession',
            commandTitle: 'New Session',
            method: 'POST',
            path: '/session',
            requestBody: '{\"desiredCapabilities\":{},\"requiredCapabilities\":{}}',
            description: 'W3C: The New Session command creates a new WebDriver session with the endpoint node. If the maximum active sessions has been reached, that is if the endpoint node already has a current session, there is a problem processing the given capabilities, or the provisioning of a remote end is impossible, a session not created error is returned.'
        },
        {
            commandName: 'deleteSession',
            commandTitle: 'Delete Session',
            method: 'DELETE',
            path: '/session/SESSION_ID',
            requestBody: '',
            description: 'W3C: The Delete Session command closes any top-level browsing contexts associated with the current session, terminates the connection, and finally closes the current session.'
        },
        {
            commandName: 'takeScreenshot',
            commandTitle: 'Take Screenshot',
            method: 'GET',
            path: '/session/SESSION_ID/screenshot',
            requestBody: '',
            description: 'W3C: The Take Screenshot command takes a screenshot of the top-level browsing context’s viewport.'
        },
        {
            commandName: 'sendKeys',
            commandTitle: 'Send Keys',
            method: 'POST',
            path: '/session/SESSION_ID/element/ELEMENT_ID/value',
            requestBody: '{\"value\": [\"webdriver\"]}',
            description: 'JSON Wire Protocol: Send a sequence of key strokes to an element.'
        },
		{
			commandName: 'sendAlertText',
			commandTitle: 'Send Alert Text',
			method: 'POST',
			path: '/session/SESSION_ID/alert_text',
			requestBody: '{\"text\": \"\"}',
			description: 'JSON Wire Protocol: Sends keystrokes to a JavaScript prompt() dialog.'
		},
		{
			commandName: 'getSessions',
			commandTitle: 'Get Sessions',
			method: 'GET',
			path: '/sessions',
			requestBody: '',
			description: 'JSON Wire Protocol: Returns a list of the currently active sessions.'
		},
    ];
    
    /* Helper Functions */
    // toggle: true = sessionId, false = elementId
    var replaceIdInPath = function (str, tokenToReplace, toggle) {
        if (toggle && sessionId != null) {
            str = str.replace(tokenToReplace, sessionId);
        }
        else {
            if (elementId != null) {
                str = str.replace(tokenToReplace, elementId);
            }
        }
        return str;
    };
    
    var checkForIds = function (str) {
        str = replaceIdInPath(str, 'SESSION_ID', true);
        str = replaceIdInPath(str, 'ELEMENT_ID', false);
        return str;
    };
    
    var clearLog = function () {
        document.getElementById('log-contents').innerHTML = '';
    };
    
    var clearAll = function () {
        sessionId = '';
        elementId = '';
        clearLog();
    };
    
    var updateCommand = function () {
        var s = document.getElementById('commands-select');
    
        for (var i = 0; i < commands.length; i++) {
            if (commands[i].commandName === s.options[s.selectedIndex].value) {
                document.getElementById('methods-select').value = commands[i].method;
                document.getElementById('path').value = checkForIds(commands[i].path);
                document.getElementById('command-description').innerText = commands[i].description;

                if (commands[i].requestBody !== '') {
                    try {
                        var jsonObj = JSON.parse(commands[i].requestBody);
                        var jsonString = JSON.stringify(jsonObj, null, 4);
                        document.getElementById('content-area').value = checkForIds(jsonString);
                    }
                    catch (err) {
                        logError(err.message);
                    }
                }
                else {
                    document.getElementById('content-area').value = '';
                }
                break;
            }
        }
    };
    
    var getTimeString = function () {
        var currentdate = new Date();
        var datetime = currentdate.getDate() + '/'
                    + (currentdate.getMonth() + 1) + '/'
                    + currentdate.getFullYear() + ' '
                    + currentdate.getHours() + ':'
                    + currentdate.getMinutes() + ':'
                    + currentdate.getSeconds();
    
        return datetime;
    };
    
    var logRequest = function (method, url, requestBody) {
        var lRequest = '<div class=\'webdriver--info\'>' + '<p>' + getTimeString() + ' - Request ' + method + ' ' + url + '</p>';
        if (requestBody !== '')
        {
            try
            {
                var jsonObj = JSON.parse(requestBody);
                var jsonString = JSON.stringify(jsonObj, null, 4);
                lRequest += '<pre>' + jsonString + '</pre>';
            }
            catch (err)
            {
                logError(err.message);
            }
        }
        lRequest += '</div>';
    
        var d = document.createElement('div');
        d.class = 'loq-request';
        d.innerHTML = lRequest;
    
        var l = document.getElementById('log-contents');
        l.insertBefore(d, l.firstChild);
    };
    
    var logResponse = function (status, contentBody) {
        var lResponse = '<div class=\'webdriver--response\'>' + '<p>' + getTimeString() + ' - Response ' + status + '</p>';
        if (contentBody !== '') {
            try {
                var jsonObj = JSON.parse(contentBody);
                if ((lastCommandSent === 'screenshot' || lastCommandSent === 'getElementScreenshot') && status === 200) {
                    var imgBase64 = jsonObj.value;
                    jsonObj.value = '<img src=\'data:image/png;base64\,' + imgBase64 + '\' />';
                }
    
                var jsonString = JSON.stringify(jsonObj, null, 4);
    
                lResponse += '<pre>' + jsonString + '</pre>';
            }
            catch (err) {
                // The content is not JSON
                lResponse += '<pre>' + contentBody + '</pre>';
            }
        }
        lResponse += '</div>';
    
        var d = document.createElement('div');
        d.class = 'loq-response';
        d.innerHTML = lResponse;
    
        var l = document.getElementById('log-contents');
        l.insertBefore(d, l.firstChild);
    };
    
    var processResponse = function (xmlhttp) {
        logResponse(xmlhttp.status, xmlhttp.responseText);
    
        if (xmlhttp.status === 200)
        {
            try
            {
                var jsonObj = JSON.parse(xmlhttp.responseText);
                if (lastCommandSent === 'newSession')
                {
                    sessionId = jsonObj.sessionId;
                }
                if (lastCommandSent === 'findElement')
                {
                    elementId = jsonObj.value.ELEMENT;
                }
                lastCommandSent = '';
            }
            catch (err)
            {
                logError(err.message);
            }
            
        }
    };
    
     var sendRequest = function () {
        var host = document.getElementById('host').value;
        var port = document.getElementById('port').value;
        var path = document.getElementById('path').value;
        var url = host + ':' + port + path;
        var requestBody = document.getElementById('content-area').value;
        var method = document.getElementById('methods-select').value;
        logRequest(method, url, requestBody);
    
        lastCommandSent = document.getElementById('commands-select').value;
    
        var xmlhttp = new XMLHttpRequest();
    
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState === 4) {
                processResponse(xmlhttp);
            }
        };
    
        xmlhttp.open(method, url, true);
        if (requestBody === '') {
            xmlhttp.send();
        }
        else {
            xmlhttp.send(requestBody);
        }
    };
    
    var logError = function (errMsg) {
        var lError = '<div class=\'command-fail\'>' + '<p>' + getTimeString() + '-' + errMsg + '</p></div>';
        var d = document.createElement('div');
        d.class = 'log-error';
        d.innerHTML = lError;
    
        var l = document.getElementById('log-contents');
        l.insertBefore(d, l.firstChild);
    };
    
    /* Setup Commands */
    var setupCommands = function () {
        var s = document.getElementById('commands-select');
        for (var j = 0; j < commands.length; j++) {
            var o = document.createElement('OPTION');
            o.value = commands[j].commandName;
            o.id = 'commands-select-' + commands[j].commandName;
            o.innerHTML = commands[j].commandTitle;
    
            s.appendChild(o);
        }
    };
    
    /* Setup HTTP Methods */
    var setupHttpMethods = function () {
        var methods = ['GET', 'POST', 'DELETE'];
    
        var s = document.getElementById('methods-select');
        for (var j = 0; j < methods.length; j++) {
            var o = document.createElement('OPTION');
            o.value = methods[j];
            o.innerHTML = methods[j];
            s.appendChild(o);
            o.selected = true;
        }
    };
    
    /* Setup Event Listeners */
    var addSendRequestListener = function () {
        var sendRequestElement = document.getElementById('send-request');
        
        sendRequestElement.addEventListener('click', sendRequest);
    };
    
    var addCommandListener = function () {
        var updateCommandElement = document.getElementById('commands-select');
        
        updateCommandElement.addEventListener('change', updateCommand);
    };
    
    var addClearLogListener = function () {
        var clearLogElement = document.getElementById('clear-log');
        
        clearLogElement.addEventListener('click', clearLog);
    };
    
    var addClearAllListener = function () {
        var clearAllElement = document.getElementById('clear-all');
        
        clearAllElement.addEventListener('click', clearAll);
    };
    
    var setupEventListeners = function () {
        addSendRequestListener();
        addCommandListener();
        addClearLogListener();
        addClearAllListener();
    };
    
    /* Load Response Code Map */
    var responseCodeMap = new Map();
    
    var loadResponseCodeMap = function () {
        responseCodeMap.set(-1, 'Invalid');
        responseCodeMap.set(0, 'Success');
        responseCodeMap.set(6, 'NoSuchDriver');
        responseCodeMap.set(7, 'NoSuchElement');
        responseCodeMap.set(8, 'NoSuchFrame');
        responseCodeMap.set(9, 'UnknownCommand');
        responseCodeMap.set(10, 'StaleElementReference');
        responseCodeMap.set(11, 'ElementNotVisible');
        responseCodeMap.set(12, 'InvalidElementState');
        responseCodeMap.set(13, 'UnknownError');
        responseCodeMap.set(15, 'ElementIsNotSelectable');
        responseCodeMap.set(17, 'JavaScriptError');
        responseCodeMap.set(19, 'XPathLookupError');
        responseCodeMap.set(21, 'Timeout');
        responseCodeMap.set(23, 'NoSuchWindow');
        responseCodeMap.set(24, 'InvalidCookieDomain');
        responseCodeMap.set(25, 'UnableToSetCookie');
        responseCodeMap.set(26, 'UnexpectedAlertOpen');
        responseCodeMap.set(27, 'NoAlertOpenError');
        responseCodeMap.set(28, 'ScriptTimeout');
        responseCodeMap.set(29, 'InvalidElementCoordinates');
        responseCodeMap.set(30, 'IMENotAvailable');
        responseCodeMap.set(31, 'IMEEngineActivationFailed');
        responseCodeMap.set(32, 'InvalidSelector');
        responseCodeMap.set(33, 'SessionNotCreatedException');
        responseCodeMap.set(34, 'MoveTargetOutOfBounds');
        responseCodeMap.set(40, 'UnsupportedOperation');
        responseCodeMap.set(41, 'UnableToTakeScreenshot');
        responseCodeMap.set(42, 'NotImplemented');
        responseCodeMap.set(43, 'InvalidArgument');
    };
    
    window.onload = function setup() {
        setupCommands();
        setupHttpMethods();
        setupEventListeners();
        loadResponseCodeMap();
    
        // Defaults to newSession command
        document.getElementById('commands-select-newSession').selected = true;
        updateCommand();
    };
}());