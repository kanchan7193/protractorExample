var app = angular.module('reportingApp', []);

//<editor-fold desc="global helpers">

var isValueAnArray = function (val) {
    return Array.isArray(val);
};

var getSpec = function (str) {
    var describes = str.split('|');
    return describes[describes.length - 1];
};
var checkIfShouldDisplaySpecName = function (prevItem, item) {
    if (!prevItem) {
        item.displaySpecName = true;
    } else if (getSpec(item.description) !== getSpec(prevItem.description)) {
        item.displaySpecName = true;
    }
};

var getParent = function (str) {
    var arr = str.split('|');
    str = "";
    for (var i = arr.length - 2; i > 0; i--) {
        str += arr[i] + " > ";
    }
    return str.slice(0, -3);
};

var getShortDescription = function (str) {
    return str.split('|')[0];
};

var countLogMessages = function (item) {
    if ((!item.logWarnings || !item.logErrors) && item.browserLogs && item.browserLogs.length > 0) {
        item.logWarnings = 0;
        item.logErrors = 0;
        for (var logNumber = 0; logNumber < item.browserLogs.length; logNumber++) {
            var logEntry = item.browserLogs[logNumber];
            if (logEntry.level === 'SEVERE') {
                item.logErrors++;
            }
            if (logEntry.level === 'WARNING') {
                item.logWarnings++;
            }
        }
    }
};

var convertTimestamp = function (timestamp) {
    var d = new Date(timestamp),
        yyyy = d.getFullYear(),
        mm = ('0' + (d.getMonth() + 1)).slice(-2),
        dd = ('0' + d.getDate()).slice(-2),
        hh = d.getHours(),
        h = hh,
        min = ('0' + d.getMinutes()).slice(-2),
        ampm = 'AM',
        time;

    if (hh > 12) {
        h = hh - 12;
        ampm = 'PM';
    } else if (hh === 12) {
        h = 12;
        ampm = 'PM';
    } else if (hh === 0) {
        h = 12;
    }

    // ie: 2013-02-18, 8:35 AM
    time = yyyy + '-' + mm + '-' + dd + ', ' + h + ':' + min + ' ' + ampm;

    return time;
};

var defaultSortFunction = function sortFunction(a, b) {
    if (a.sessionId < b.sessionId) {
        return -1;
    } else if (a.sessionId > b.sessionId) {
        return 1;
    }

    if (a.timestamp < b.timestamp) {
        return -1;
    } else if (a.timestamp > b.timestamp) {
        return 1;
    }

    return 0;
};

//</editor-fold>

app.controller('ScreenshotReportController', ['$scope', '$http', 'TitleService', function ($scope, $http, titleService) {
    var that = this;
    var clientDefaults = {};

    $scope.searchSettings = Object.assign({
        description: '',
        allselected: true,
        passed: true,
        failed: true,
        pending: true,
        withLog: true
    }, clientDefaults.searchSettings || {}); // enable customisation of search settings on first page hit

    this.warningTime = 1400;
    this.dangerTime = 1900;
    this.totalDurationFormat = clientDefaults.totalDurationFormat;
    this.showTotalDurationIn = clientDefaults.showTotalDurationIn;

    var initialColumnSettings = clientDefaults.columnSettings; // enable customisation of visible columns on first page hit
    if (initialColumnSettings) {
        if (initialColumnSettings.displayTime !== undefined) {
            // initial settings have be inverted because the html bindings are inverted (e.g. !ctrl.displayTime)
            this.displayTime = !initialColumnSettings.displayTime;
        }
        if (initialColumnSettings.displayBrowser !== undefined) {
            this.displayBrowser = !initialColumnSettings.displayBrowser; // same as above
        }
        if (initialColumnSettings.displaySessionId !== undefined) {
            this.displaySessionId = !initialColumnSettings.displaySessionId; // same as above
        }
        if (initialColumnSettings.displayOS !== undefined) {
            this.displayOS = !initialColumnSettings.displayOS; // same as above
        }
        if (initialColumnSettings.inlineScreenshots !== undefined) {
            this.inlineScreenshots = initialColumnSettings.inlineScreenshots; // this setting does not have to be inverted
        } else {
            this.inlineScreenshots = false;
        }
        if (initialColumnSettings.warningTime) {
            this.warningTime = initialColumnSettings.warningTime;
        }
        if (initialColumnSettings.dangerTime) {
            this.dangerTime = initialColumnSettings.dangerTime;
        }
    }


    this.chooseAllTypes = function () {
        var value = true;
        $scope.searchSettings.allselected = !$scope.searchSettings.allselected;
        if (!$scope.searchSettings.allselected) {
            value = false;
        }

        $scope.searchSettings.passed = value;
        $scope.searchSettings.failed = value;
        $scope.searchSettings.pending = value;
        $scope.searchSettings.withLog = value;
    };

    this.isValueAnArray = function (val) {
        return isValueAnArray(val);
    };

    this.getParent = function (str) {
        return getParent(str);
    };

    this.getSpec = function (str) {
        return getSpec(str);
    };

    this.getShortDescription = function (str) {
        return getShortDescription(str);
    };
    this.hasNextScreenshot = function (index) {
        var old = index;
        return old !== this.getNextScreenshotIdx(index);
    };

    this.hasPreviousScreenshot = function (index) {
        var old = index;
        return old !== this.getPreviousScreenshotIdx(index);
    };
    this.getNextScreenshotIdx = function (index) {
        var next = index;
        var hit = false;
        while (next + 2 < this.results.length) {
            next++;
            if (this.results[next].screenShotFile && !this.results[next].pending) {
                hit = true;
                break;
            }
        }
        return hit ? next : index;
    };

    this.getPreviousScreenshotIdx = function (index) {
        var prev = index;
        var hit = false;
        while (prev > 0) {
            prev--;
            if (this.results[prev].screenShotFile && !this.results[prev].pending) {
                hit = true;
                break;
            }
        }
        return hit ? prev : index;
    };

    this.convertTimestamp = convertTimestamp;


    this.round = function (number, roundVal) {
        return (parseFloat(number) / 1000).toFixed(roundVal);
    };


    this.passCount = function () {
        var passCount = 0;
        for (var i in this.results) {
            var result = this.results[i];
            if (result.passed) {
                passCount++;
            }
        }
        return passCount;
    };


    this.pendingCount = function () {
        var pendingCount = 0;
        for (var i in this.results) {
            var result = this.results[i];
            if (result.pending) {
                pendingCount++;
            }
        }
        return pendingCount;
    };

    this.failCount = function () {
        var failCount = 0;
        for (var i in this.results) {
            var result = this.results[i];
            if (!result.passed && !result.pending) {
                failCount++;
            }
        }
        return failCount;
    };

    this.totalDuration = function () {
        var sum = 0;
        for (var i in this.results) {
            var result = this.results[i];
            if (result.duration) {
                sum += result.duration;
            }
        }
        return sum;
    };

    this.passPerc = function () {
        return (this.passCount() / this.totalCount()) * 100;
    };
    this.pendingPerc = function () {
        return (this.pendingCount() / this.totalCount()) * 100;
    };
    this.failPerc = function () {
        return (this.failCount() / this.totalCount()) * 100;
    };
    this.totalCount = function () {
        return this.passCount() + this.failCount() + this.pendingCount();
    };


    var results = [
    {
        "description": "should have a title|Protractor Demo App",
        "passed": true,
        "pending": false,
        "os": "linux",
        "sessionId": "64dd596b095e61ec98bdbd1995eb3ec8",
        "instanceId": 21110,
        "browser": {
            "name": "chrome",
            "version": "79.0.3945.79"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://juliemr.github.io/favicon.ico - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1576697389545,
                "type": ""
            }
        ],
        "screenShotFile": "007b00aa-0070-00a3-0091-002a005700d2.png",
        "timestamp": 1576697389533,
        "duration": 142
    },
    {
        "description": "should add two numbers|Protractor Demo App",
        "passed": true,
        "pending": false,
        "os": "linux",
        "sessionId": "64dd596b095e61ec98bdbd1995eb3ec8",
        "instanceId": 21110,
        "browser": {
            "name": "chrome",
            "version": "79.0.3945.79"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00eb0011-000c-004c-00b4-005700060070.png",
        "timestamp": 1576697390528,
        "duration": 2668
    },
    {
        "description": "should deduct second number|Protractor Demo App",
        "passed": true,
        "pending": false,
        "os": "linux",
        "sessionId": "64dd596b095e61ec98bdbd1995eb3ec8",
        "instanceId": 21110,
        "browser": {
            "name": "chrome",
            "version": "79.0.3945.79"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00cb00e4-00db-0092-00f5-009200d800ef.png",
        "timestamp": 1576697393350,
        "duration": 2312
    },
    {
        "description": "should multiply numbers|Protractor Demo App",
        "passed": true,
        "pending": false,
        "os": "linux",
        "sessionId": "64dd596b095e61ec98bdbd1995eb3ec8",
        "instanceId": 21110,
        "browser": {
            "name": "chrome",
            "version": "79.0.3945.79"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "004f00dc-000b-006e-00ce-006d00200039.png",
        "timestamp": 1576697395850,
        "duration": 2367
    },
    {
        "description": "should divide numbers|Protractor Demo App",
        "passed": true,
        "pending": false,
        "os": "linux",
        "sessionId": "64dd596b095e61ec98bdbd1995eb3ec8",
        "instanceId": 21110,
        "browser": {
            "name": "chrome",
            "version": "79.0.3945.79"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "0050007a-006d-00aa-00bf-007800a600fc.png",
        "timestamp": 1576697398368,
        "duration": 2383
    },
    {
        "description": "should have a title|Protractor Demo App",
        "passed": true,
        "pending": false,
        "os": "linux",
        "sessionId": "64dd596b095e61ec98bdbd1995eb3ec8",
        "instanceId": 21110,
        "browser": {
            "name": "chrome",
            "version": "79.0.3945.79"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00ad00b1-002e-003e-002d-00be00c10093.png",
        "timestamp": 1576697401245,
        "duration": 32
    },
    {
        "description": "should add two numbers|Protractor Demo App",
        "passed": true,
        "pending": false,
        "os": "linux",
        "sessionId": "64dd596b095e61ec98bdbd1995eb3ec8",
        "instanceId": 21110,
        "browser": {
            "name": "chrome",
            "version": "79.0.3945.79"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00f700cb-0010-0077-0067-007700f600b3.png",
        "timestamp": 1576697401412,
        "duration": 2381
    },
    {
        "description": "should deduct second number|Protractor Demo App",
        "passed": true,
        "pending": false,
        "os": "linux",
        "sessionId": "64dd596b095e61ec98bdbd1995eb3ec8",
        "instanceId": 21110,
        "browser": {
            "name": "chrome",
            "version": "79.0.3945.79"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00c300ae-00b5-003a-00a7-007f000200ba.png",
        "timestamp": 1576697403955,
        "duration": 2314
    },
    {
        "description": "should multiply numbers|Protractor Demo App",
        "passed": true,
        "pending": false,
        "os": "linux",
        "sessionId": "64dd596b095e61ec98bdbd1995eb3ec8",
        "instanceId": 21110,
        "browser": {
            "name": "chrome",
            "version": "79.0.3945.79"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00030094-00cf-007f-00ae-00c8002a001c.png",
        "timestamp": 1576697406484,
        "duration": 2352
    },
    {
        "description": "should divide numbers|Protractor Demo App",
        "passed": true,
        "pending": false,
        "os": "linux",
        "sessionId": "64dd596b095e61ec98bdbd1995eb3ec8",
        "instanceId": 21110,
        "browser": {
            "name": "chrome",
            "version": "79.0.3945.79"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "003f005d-00eb-0055-00e3-00fd000a0026.png",
        "timestamp": 1576697409235,
        "duration": 2372
    },
    {
        "description": "Login|Automation App",
        "passed": true,
        "pending": false,
        "os": "linux",
        "sessionId": "64dd596b095e61ec98bdbd1995eb3ec8",
        "instanceId": 21110,
        "browser": {
            "name": "chrome",
            "version": "79.0.3945.79"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "WARNING",
                "message": "http://www.way2automation.com/angularjs-protractor/registeration/#/login - A cookie associated with a cross-site resource at http://widget-mediator.zopim.com/ was set without the `SameSite` attribute. A future release of Chrome will only deliver cookies with cross-site requests if they are set with `SameSite=None` and `Secure`. You can review cookies in developer tools under Application>Storage>Cookies and see more details at https://www.chromestatus.com/feature/5088147346030592 and https://www.chromestatus.com/feature/5633521622188032.",
                "timestamp": 1576697414471,
                "type": ""
            }
        ],
        "screenShotFile": "002700fe-0073-0082-0047-00a400350063.png",
        "timestamp": 1576697412958,
        "duration": 3068
    },
    {
        "description": "should have a title|Protractor Demo App",
        "passed": true,
        "pending": false,
        "os": "linux",
        "sessionId": "ae72e05fc4978fa3d689e5c9864691f7",
        "instanceId": 22384,
        "browser": {
            "name": "chrome",
            "version": "79.0.3945.79"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://juliemr.github.io/favicon.ico - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1576699129261,
                "type": ""
            }
        ],
        "screenShotFile": "00d500b9-007f-000a-0005-003100200014.png",
        "timestamp": 1576699129267,
        "duration": 43
    },
    {
        "description": "should add two numbers|Protractor Demo App",
        "passed": true,
        "pending": false,
        "os": "linux",
        "sessionId": "ae72e05fc4978fa3d689e5c9864691f7",
        "instanceId": 22384,
        "browser": {
            "name": "chrome",
            "version": "79.0.3945.79"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00fb0031-00a2-00b4-0019-0035008c00bd.png",
        "timestamp": 1576699129514,
        "duration": 2387
    },
    {
        "description": "should deduct second number|Protractor Demo App",
        "passed": true,
        "pending": false,
        "os": "linux",
        "sessionId": "ae72e05fc4978fa3d689e5c9864691f7",
        "instanceId": 22384,
        "browser": {
            "name": "chrome",
            "version": "79.0.3945.79"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00c50028-0036-007e-0010-0059008c007c.png",
        "timestamp": 1576699132055,
        "duration": 2456
    },
    {
        "description": "should multiply numbers|Protractor Demo App",
        "passed": true,
        "pending": false,
        "os": "linux",
        "sessionId": "ae72e05fc4978fa3d689e5c9864691f7",
        "instanceId": 22384,
        "browser": {
            "name": "chrome",
            "version": "79.0.3945.79"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "002e00ae-0008-0027-0074-00bd00f70026.png",
        "timestamp": 1576699134689,
        "duration": 2322
    },
    {
        "description": "should divide numbers|Protractor Demo App",
        "passed": true,
        "pending": false,
        "os": "linux",
        "sessionId": "ae72e05fc4978fa3d689e5c9864691f7",
        "instanceId": 22384,
        "browser": {
            "name": "chrome",
            "version": "79.0.3945.79"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "0040007a-0058-00fb-00b5-007800ab00c4.png",
        "timestamp": 1576699137157,
        "duration": 2379
    },
    {
        "description": "should have a title|Protractor Demo App",
        "passed": true,
        "pending": false,
        "os": "linux",
        "sessionId": "ae72e05fc4978fa3d689e5c9864691f7",
        "instanceId": 22384,
        "browser": {
            "name": "chrome",
            "version": "79.0.3945.79"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00940001-000f-00dc-0074-009f0023004d.png",
        "timestamp": 1576699140068,
        "duration": 34
    },
    {
        "description": "should add two numbers|Protractor Demo App",
        "passed": true,
        "pending": false,
        "os": "linux",
        "sessionId": "ae72e05fc4978fa3d689e5c9864691f7",
        "instanceId": 22384,
        "browser": {
            "name": "chrome",
            "version": "79.0.3945.79"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "0020003d-000c-0082-0070-00a400780050.png",
        "timestamp": 1576699140257,
        "duration": 2325
    },
    {
        "description": "should deduct second number|Protractor Demo App",
        "passed": true,
        "pending": false,
        "os": "linux",
        "sessionId": "ae72e05fc4978fa3d689e5c9864691f7",
        "instanceId": 22384,
        "browser": {
            "name": "chrome",
            "version": "79.0.3945.79"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00b70011-00c9-00b5-0041-004500180005.png",
        "timestamp": 1576699142728,
        "duration": 2327
    },
    {
        "description": "should multiply numbers|Protractor Demo App",
        "passed": true,
        "pending": false,
        "os": "linux",
        "sessionId": "ae72e05fc4978fa3d689e5c9864691f7",
        "instanceId": 22384,
        "browser": {
            "name": "chrome",
            "version": "79.0.3945.79"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "008c0012-0015-008f-0080-00e700020018.png",
        "timestamp": 1576699145183,
        "duration": 2344
    },
    {
        "description": "should divide numbers|Protractor Demo App",
        "passed": true,
        "pending": false,
        "os": "linux",
        "sessionId": "ae72e05fc4978fa3d689e5c9864691f7",
        "instanceId": 22384,
        "browser": {
            "name": "chrome",
            "version": "79.0.3945.79"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00c80020-00cc-003d-00e5-0070006f003e.png",
        "timestamp": 1576699147670,
        "duration": 2369
    },
    {
        "description": "Login|Automation App",
        "passed": true,
        "pending": false,
        "os": "linux",
        "sessionId": "ae72e05fc4978fa3d689e5c9864691f7",
        "instanceId": 22384,
        "browser": {
            "name": "chrome",
            "version": "79.0.3945.79"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "WARNING",
                "message": "http://www.way2automation.com/angularjs-protractor/registeration/#/ - A cookie associated with a cross-site resource at http://widget-mediator.zopim.com/ was set without the `SameSite` attribute. A future release of Chrome will only deliver cookies with cross-site requests if they are set with `SameSite=None` and `Secure`. You can review cookies in developer tools under Application>Storage>Cookies and see more details at https://www.chromestatus.com/feature/5088147346030592 and https://www.chromestatus.com/feature/5633521622188032.",
                "timestamp": 1576699155433,
                "type": ""
            }
        ],
        "screenShotFile": "006a0033-00c5-0032-0095-0020002a0027.png",
        "timestamp": 1576699152842,
        "duration": 2894
    },
    {
        "description": "Login|Automation App",
        "passed": true,
        "pending": false,
        "os": "linux",
        "sessionId": "ae72e05fc4978fa3d689e5c9864691f7",
        "instanceId": 22384,
        "browser": {
            "name": "chrome",
            "version": "79.0.3945.79"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "004c004f-0059-002a-0047-00900042001c.png",
        "timestamp": 1576699156808,
        "duration": 1958
    },
    {
        "description": "should have a title|Protractor Demo App",
        "passed": true,
        "pending": false,
        "os": "linux",
        "sessionId": "918d842c413b3a66fd12ca8e8d622854",
        "instanceId": 23179,
        "browser": {
            "name": "chrome",
            "version": "79.0.3945.79"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://juliemr.github.io/favicon.ico - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1576700281084,
                "type": ""
            }
        ],
        "screenShotFile": "00440098-003d-0045-002a-006f00d200ce.png",
        "timestamp": 1576700281197,
        "duration": 45
    },
    {
        "description": "should add two numbers|Protractor Demo App",
        "passed": true,
        "pending": false,
        "os": "linux",
        "sessionId": "918d842c413b3a66fd12ca8e8d622854",
        "instanceId": 23179,
        "browser": {
            "name": "chrome",
            "version": "79.0.3945.79"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00e500fb-0064-003f-002d-003700700020.png",
        "timestamp": 1576700281400,
        "duration": 2397
    },
    {
        "description": "should deduct second number|Protractor Demo App",
        "passed": true,
        "pending": false,
        "os": "linux",
        "sessionId": "918d842c413b3a66fd12ca8e8d622854",
        "instanceId": 23179,
        "browser": {
            "name": "chrome",
            "version": "79.0.3945.79"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00e800c1-009d-00c0-0016-007800560081.png",
        "timestamp": 1576700283944,
        "duration": 2337
    },
    {
        "description": "should multiply numbers|Protractor Demo App",
        "passed": true,
        "pending": false,
        "os": "linux",
        "sessionId": "918d842c413b3a66fd12ca8e8d622854",
        "instanceId": 23179,
        "browser": {
            "name": "chrome",
            "version": "79.0.3945.79"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "007f00d3-0001-00de-00c3-001e00a800f1.png",
        "timestamp": 1576700286428,
        "duration": 2334
    },
    {
        "description": "should divide numbers|Protractor Demo App",
        "passed": true,
        "pending": false,
        "os": "linux",
        "sessionId": "918d842c413b3a66fd12ca8e8d622854",
        "instanceId": 23179,
        "browser": {
            "name": "chrome",
            "version": "79.0.3945.79"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "0016008f-008b-005f-0027-0082006d00f5.png",
        "timestamp": 1576700288979,
        "duration": 2390
    },
    {
        "description": "should have a title|Protractor Demo App",
        "passed": true,
        "pending": false,
        "os": "linux",
        "sessionId": "918d842c413b3a66fd12ca8e8d622854",
        "instanceId": 23179,
        "browser": {
            "name": "chrome",
            "version": "79.0.3945.79"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "009900c0-00c2-001a-0040-00b100e3004e.png",
        "timestamp": 1576700291865,
        "duration": 35
    },
    {
        "description": "should add two numbers|Protractor Demo App",
        "passed": true,
        "pending": false,
        "os": "linux",
        "sessionId": "918d842c413b3a66fd12ca8e8d622854",
        "instanceId": 23179,
        "browser": {
            "name": "chrome",
            "version": "79.0.3945.79"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "001e00a0-000a-0038-001d-00ed006400b5.png",
        "timestamp": 1576700292064,
        "duration": 2397
    },
    {
        "description": "should deduct second number|Protractor Demo App",
        "passed": true,
        "pending": false,
        "os": "linux",
        "sessionId": "918d842c413b3a66fd12ca8e8d622854",
        "instanceId": 23179,
        "browser": {
            "name": "chrome",
            "version": "79.0.3945.79"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00c7007b-0007-0050-00af-000500c7008d.png",
        "timestamp": 1576700294601,
        "duration": 2361
    },
    {
        "description": "should multiply numbers|Protractor Demo App",
        "passed": true,
        "pending": false,
        "os": "linux",
        "sessionId": "918d842c413b3a66fd12ca8e8d622854",
        "instanceId": 23179,
        "browser": {
            "name": "chrome",
            "version": "79.0.3945.79"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "001100e1-00e4-0061-00b0-00c60001007a.png",
        "timestamp": 1576700297102,
        "duration": 2382
    },
    {
        "description": "should divide numbers|Protractor Demo App",
        "passed": true,
        "pending": false,
        "os": "linux",
        "sessionId": "918d842c413b3a66fd12ca8e8d622854",
        "instanceId": 23179,
        "browser": {
            "name": "chrome",
            "version": "79.0.3945.79"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00ca002f-00e2-008c-0037-002900360029.png",
        "timestamp": 1576700299639,
        "duration": 2386
    },
    {
        "description": "Login|Registration Page",
        "passed": true,
        "pending": false,
        "os": "linux",
        "sessionId": "918d842c413b3a66fd12ca8e8d622854",
        "instanceId": 23179,
        "browser": {
            "name": "chrome",
            "version": "79.0.3945.79"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "WARNING",
                "message": "http://www.way2automation.com/angularjs-protractor/registeration/#/login - A cookie associated with a cross-site resource at http://widget-mediator.zopim.com/ was set without the `SameSite` attribute. A future release of Chrome will only deliver cookies with cross-site requests if they are set with `SameSite=None` and `Secure`. You can review cookies in developer tools under Application>Storage>Cookies and see more details at https://www.chromestatus.com/feature/5088147346030592 and https://www.chromestatus.com/feature/5633521622188032.",
                "timestamp": 1576700305765,
                "type": ""
            }
        ],
        "screenShotFile": "005000ab-007c-0028-0007-00a7001300f0.png",
        "timestamp": 1576700303751,
        "duration": 2903
    },
    {
        "description": "encountered a declaration exception|Registration Page",
        "passed": false,
        "pending": false,
        "os": "linux",
        "sessionId": "918d842c413b3a66fd12ca8e8d622854",
        "instanceId": 23179,
        "browser": {
            "name": "chrome",
            "version": "79.0.3945.79"
        },
        "message": [
            "TypeError: rp is not a constructor"
        ],
        "trace": [
            "TypeError: rp is not a constructor\n    at Suite.<anonymous> (/home/kamalesh/day1/specs/spec4.js:4:14)\n    at addSpecsToSuite (/home/kamalesh/day1/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:1107:25)\n    at Env.describe (/home/kamalesh/day1/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:1074:7)\n    at describe (/home/kamalesh/day1/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4399:18)\n    at Object.<anonymous> (/home/kamalesh/day1/specs/spec4.js:3:1)\n    at Module._compile (module.js:652:30)\n    at Object.Module._extensions..js (module.js:663:10)\n    at Module.load (module.js:565:32)\n    at tryModuleLoad (module.js:505:12)\n    at Function.Module._load (module.js:497:3)"
        ],
        "browserLogs": [],
        "screenShotFile": "00da00f3-0042-00bb-0024-00210056008e.png",
        "timestamp": 1576700306794,
        "duration": 6
    }
];

    this.sortSpecs = function () {
        this.results = results.sort(function sortFunction(a, b) {
    if (a.sessionId < b.sessionId) return -1;else if (a.sessionId > b.sessionId) return 1;

    if (a.timestamp < b.timestamp) return -1;else if (a.timestamp > b.timestamp) return 1;

    return 0;
});

    };

    this.setTitle = function () {
        var title = $('.report-title').text();
        titleService.setTitle(title);
    };

    // is run after all test data has been prepared/loaded
    this.afterLoadingJobs = function () {
        this.sortSpecs();
        this.setTitle();
    };

    this.loadResultsViaAjax = function () {

        $http({
            url: './combined.json',
            method: 'GET'
        }).then(function (response) {
                var data = null;
                if (response && response.data) {
                    if (typeof response.data === 'object') {
                        data = response.data;
                    } else if (response.data[0] === '"') { //detect super escaped file (from circular json)
                        data = CircularJSON.parse(response.data); //the file is escaped in a weird way (with circular json)
                    } else {
                        data = JSON.parse(response.data);
                    }
                }
                if (data) {
                    results = data;
                    that.afterLoadingJobs();
                }
            },
            function (error) {
                console.error(error);
            });
    };


    if (clientDefaults.useAjax) {
        this.loadResultsViaAjax();
    } else {
        this.afterLoadingJobs();
    }

}]);

app.filter('bySearchSettings', function () {
    return function (items, searchSettings) {
        var filtered = [];
        if (!items) {
            return filtered; // to avoid crashing in where results might be empty
        }
        var prevItem = null;

        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            item.displaySpecName = false;

            var isHit = false; //is set to true if any of the search criteria matched
            countLogMessages(item); // modifies item contents

            var hasLog = searchSettings.withLog && item.browserLogs && item.browserLogs.length > 0;
            if (searchSettings.description === '' ||
                (item.description && item.description.toLowerCase().indexOf(searchSettings.description.toLowerCase()) > -1)) {

                if (searchSettings.passed && item.passed || hasLog) {
                    isHit = true;
                } else if (searchSettings.failed && !item.passed && !item.pending || hasLog) {
                    isHit = true;
                } else if (searchSettings.pending && item.pending || hasLog) {
                    isHit = true;
                }
            }
            if (isHit) {
                checkIfShouldDisplaySpecName(prevItem, item);

                filtered.push(item);
                prevItem = item;
            }
        }

        return filtered;
    };
});

//formats millseconds to h m s
app.filter('timeFormat', function () {
    return function (tr, fmt) {
        if(tr == null){
            return "NaN";
        }

        switch (fmt) {
            case 'h':
                var h = tr / 1000 / 60 / 60;
                return "".concat(h.toFixed(2)).concat("h");
            case 'm':
                var m = tr / 1000 / 60;
                return "".concat(m.toFixed(2)).concat("min");
            case 's' :
                var s = tr / 1000;
                return "".concat(s.toFixed(2)).concat("s");
            case 'hm':
            case 'h:m':
                var hmMt = tr / 1000 / 60;
                var hmHr = Math.trunc(hmMt / 60);
                var hmMr = hmMt - (hmHr * 60);
                if (fmt === 'h:m') {
                    return "".concat(hmHr).concat(":").concat(hmMr < 10 ? "0" : "").concat(Math.round(hmMr));
                }
                return "".concat(hmHr).concat("h ").concat(hmMr.toFixed(2)).concat("min");
            case 'hms':
            case 'h:m:s':
                var hmsS = tr / 1000;
                var hmsHr = Math.trunc(hmsS / 60 / 60);
                var hmsM = hmsS / 60;
                var hmsMr = Math.trunc(hmsM - hmsHr * 60);
                var hmsSo = hmsS - (hmsHr * 60 * 60) - (hmsMr*60);
                if (fmt === 'h:m:s') {
                    return "".concat(hmsHr).concat(":").concat(hmsMr < 10 ? "0" : "").concat(hmsMr).concat(":").concat(hmsSo < 10 ? "0" : "").concat(Math.round(hmsSo));
                }
                return "".concat(hmsHr).concat("h ").concat(hmsMr).concat("min ").concat(hmsSo.toFixed(2)).concat("s");
            case 'ms':
                var msS = tr / 1000;
                var msMr = Math.trunc(msS / 60);
                var msMs = msS - (msMr * 60);
                return "".concat(msMr).concat("min ").concat(msMs.toFixed(2)).concat("s");
        }

        return tr;
    };
});


function PbrStackModalController($scope, $rootScope) {
    var ctrl = this;
    ctrl.rootScope = $rootScope;
    ctrl.getParent = getParent;
    ctrl.getShortDescription = getShortDescription;
    ctrl.convertTimestamp = convertTimestamp;
    ctrl.isValueAnArray = isValueAnArray;
    ctrl.toggleSmartStackTraceHighlight = function () {
        var inv = !ctrl.rootScope.showSmartStackTraceHighlight;
        ctrl.rootScope.showSmartStackTraceHighlight = inv;
    };
    ctrl.applySmartHighlight = function (line) {
        if ($rootScope.showSmartStackTraceHighlight) {
            if (line.indexOf('node_modules') > -1) {
                return 'greyout';
            }
            if (line.indexOf('  at ') === -1) {
                return '';
            }

            return 'highlight';
        }
        return '';
    };
}


app.component('pbrStackModal', {
    templateUrl: "pbr-stack-modal.html",
    bindings: {
        index: '=',
        data: '='
    },
    controller: PbrStackModalController
});

function PbrScreenshotModalController($scope, $rootScope) {
    var ctrl = this;
    ctrl.rootScope = $rootScope;
    ctrl.getParent = getParent;
    ctrl.getShortDescription = getShortDescription;

    /**
     * Updates which modal is selected.
     */
    this.updateSelectedModal = function (event, index) {
        var key = event.key; //try to use non-deprecated key first https://developer.mozilla.org/de/docs/Web/API/KeyboardEvent/keyCode
        if (key == null) {
            var keyMap = {
                37: 'ArrowLeft',
                39: 'ArrowRight'
            };
            key = keyMap[event.keyCode]; //fallback to keycode
        }
        if (key === "ArrowLeft" && this.hasPrevious) {
            this.showHideModal(index, this.previous);
        } else if (key === "ArrowRight" && this.hasNext) {
            this.showHideModal(index, this.next);
        }
    };

    /**
     * Hides the modal with the #oldIndex and shows the modal with the #newIndex.
     */
    this.showHideModal = function (oldIndex, newIndex) {
        const modalName = '#imageModal';
        $(modalName + oldIndex).modal("hide");
        $(modalName + newIndex).modal("show");
    };

}

app.component('pbrScreenshotModal', {
    templateUrl: "pbr-screenshot-modal.html",
    bindings: {
        index: '=',
        data: '=',
        next: '=',
        previous: '=',
        hasNext: '=',
        hasPrevious: '='
    },
    controller: PbrScreenshotModalController
});

app.factory('TitleService', ['$document', function ($document) {
    return {
        setTitle: function (title) {
            $document[0].title = title;
        }
    };
}]);


app.run(
    function ($rootScope, $templateCache) {
        //make sure this option is on by default
        $rootScope.showSmartStackTraceHighlight = true;
        
  $templateCache.put('pbr-screenshot-modal.html',
    '<div class="modal" id="imageModal{{$ctrl.index}}" tabindex="-1" role="dialog"\n' +
    '     aria-labelledby="imageModalLabel{{$ctrl.index}}" ng-keydown="$ctrl.updateSelectedModal($event,$ctrl.index)">\n' +
    '    <div class="modal-dialog modal-lg m-screenhot-modal" role="document">\n' +
    '        <div class="modal-content">\n' +
    '            <div class="modal-header">\n' +
    '                <button type="button" class="close" data-dismiss="modal" aria-label="Close">\n' +
    '                    <span aria-hidden="true">&times;</span>\n' +
    '                </button>\n' +
    '                <h6 class="modal-title" id="imageModalLabelP{{$ctrl.index}}">\n' +
    '                    {{$ctrl.getParent($ctrl.data.description)}}</h6>\n' +
    '                <h5 class="modal-title" id="imageModalLabel{{$ctrl.index}}">\n' +
    '                    {{$ctrl.getShortDescription($ctrl.data.description)}}</h5>\n' +
    '            </div>\n' +
    '            <div class="modal-body">\n' +
    '                <img class="screenshotImage" ng-src="{{$ctrl.data.screenShotFile}}">\n' +
    '            </div>\n' +
    '            <div class="modal-footer">\n' +
    '                <div class="pull-left">\n' +
    '                    <button ng-disabled="!$ctrl.hasPrevious" class="btn btn-default btn-previous" data-dismiss="modal"\n' +
    '                            data-toggle="modal" data-target="#imageModal{{$ctrl.previous}}">\n' +
    '                        Prev\n' +
    '                    </button>\n' +
    '                    <button ng-disabled="!$ctrl.hasNext" class="btn btn-default btn-next"\n' +
    '                            data-dismiss="modal" data-toggle="modal"\n' +
    '                            data-target="#imageModal{{$ctrl.next}}">\n' +
    '                        Next\n' +
    '                    </button>\n' +
    '                </div>\n' +
    '                <a class="btn btn-primary" href="{{$ctrl.data.screenShotFile}}" target="_blank">\n' +
    '                    Open Image in New Tab\n' +
    '                    <span class="glyphicon glyphicon-new-window" aria-hidden="true"></span>\n' +
    '                </a>\n' +
    '                <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>\n' +
    '            </div>\n' +
    '        </div>\n' +
    '    </div>\n' +
    '</div>\n' +
     ''
  );

  $templateCache.put('pbr-stack-modal.html',
    '<div class="modal" id="modal{{$ctrl.index}}" tabindex="-1" role="dialog"\n' +
    '     aria-labelledby="stackModalLabel{{$ctrl.index}}">\n' +
    '    <div class="modal-dialog modal-lg m-stack-modal" role="document">\n' +
    '        <div class="modal-content">\n' +
    '            <div class="modal-header">\n' +
    '                <button type="button" class="close" data-dismiss="modal" aria-label="Close">\n' +
    '                    <span aria-hidden="true">&times;</span>\n' +
    '                </button>\n' +
    '                <h6 class="modal-title" id="stackModalLabelP{{$ctrl.index}}">\n' +
    '                    {{$ctrl.getParent($ctrl.data.description)}}</h6>\n' +
    '                <h5 class="modal-title" id="stackModalLabel{{$ctrl.index}}">\n' +
    '                    {{$ctrl.getShortDescription($ctrl.data.description)}}</h5>\n' +
    '            </div>\n' +
    '            <div class="modal-body">\n' +
    '                <div ng-if="$ctrl.data.trace.length > 0">\n' +
    '                    <div ng-if="$ctrl.isValueAnArray($ctrl.data.trace)">\n' +
    '                        <pre class="logContainer" ng-repeat="trace in $ctrl.data.trace track by $index"><div ng-class="$ctrl.applySmartHighlight(line)" ng-repeat="line in trace.split(\'\\n\') track by $index">{{line}}</div></pre>\n' +
    '                    </div>\n' +
    '                    <div ng-if="!$ctrl.isValueAnArray($ctrl.data.trace)">\n' +
    '                        <pre class="logContainer"><div ng-class="$ctrl.applySmartHighlight(line)" ng-repeat="line in $ctrl.data.trace.split(\'\\n\') track by $index">{{line}}</div></pre>\n' +
    '                    </div>\n' +
    '                </div>\n' +
    '                <div ng-if="$ctrl.data.browserLogs.length > 0">\n' +
    '                    <h5 class="modal-title">\n' +
    '                        Browser logs:\n' +
    '                    </h5>\n' +
    '                    <pre class="logContainer"><div class="browserLogItem"\n' +
    '                                                   ng-repeat="logError in $ctrl.data.browserLogs track by $index"><div><span class="label browserLogLabel label-default"\n' +
    '                                                                                                                             ng-class="{\'label-danger\': logError.level===\'SEVERE\', \'label-warning\': logError.level===\'WARNING\'}">{{logError.level}}</span><span class="label label-default">{{$ctrl.convertTimestamp(logError.timestamp)}}</span><div ng-repeat="messageLine in logError.message.split(\'\\\\n\') track by $index">{{ messageLine }}</div></div></div></pre>\n' +
    '                </div>\n' +
    '            </div>\n' +
    '            <div class="modal-footer">\n' +
    '                <button class="btn btn-default"\n' +
    '                        ng-class="{active: $ctrl.rootScope.showSmartStackTraceHighlight}"\n' +
    '                        ng-click="$ctrl.toggleSmartStackTraceHighlight()">\n' +
    '                    <span class="glyphicon glyphicon-education black"></span> Smart Stack Trace\n' +
    '                </button>\n' +
    '                <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>\n' +
    '            </div>\n' +
    '        </div>\n' +
    '    </div>\n' +
    '</div>\n' +
     ''
  );

    });
