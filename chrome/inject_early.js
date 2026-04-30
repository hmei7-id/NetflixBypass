
(function () {
    if (window._flixBypassPatched) return;
    window._flixBypassPatched = true;

    var GRAPHQL_HOST = 'web.prod.cloud.netflix.com';

    // Words that appear in household verification responses/requests
    // but NOT in regular title/browse responses
    var HOUSEHOLD_MARKERS = [
        'household',
        'in-home',
        'inhome',
        'setlocationcontext',
        'householdstatus',
        'updatememberstate',
        'memberstatus'
    ];

    function containsHouseholdData(text) {
        if (!text) return false;
        var lower = text.toLowerCase();
        for (var i = 0; i < HOUSEHOLD_MARKERS.length; i++) {
            if (lower.indexOf(HOUSEHOLD_MARKERS[i]) !== -1) return true;
        }
        return false;
    }

    // --- Patch fetch: intercept responses ---
    var _origFetch = window.fetch;
    window.fetch = function (input, init) {
        var url = '';
        if (typeof input === 'string') url = input;
        else if (input && input.url) url = input.url;
        else if (input && input.href) url = input.href;

        if (url.indexOf(GRAPHQL_HOST + '/graphql') !== -1) {
            // First check if the REQUEST body indicates household query
            var reqBody = (init && init.body) ? init.body : '';
            if (typeof reqBody === 'string' && containsHouseholdData(reqBody)) {
                console.log('[NetlixBypass] Blocked household request (body match)');
                return Promise.reject(new TypeError('Failed to fetch'));
            }

            // Otherwise, let request through but intercept the RESPONSE
            return _origFetch.apply(this, arguments).then(function (response) {
                // Clone so we can read the body without consuming it
                var clone = response.clone();
                return clone.text().then(function (body) {
                    if (containsHouseholdData(body)) {
                        console.log('[FlixBypass] Stripped household data from response');
                        // Return empty successful response
                        return new Response('{"data":{}}', {
                            status: 200,
                            statusText: 'OK',
                            headers: { 'Content-Type': 'application/json' }
                        });
                    }
                    // Not household - return original response
                    return response;
                }).catch(function () {
                    return response;
                });
            });
        }
        return _origFetch.apply(this, arguments);
    };

    // --- Patch XMLHttpRequest ---
    var _origOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url) {
        this._flixUrl = typeof url === 'string' ? url : '';
        this._flixBody = '';
        return _origOpen.apply(this, arguments);
    };

    var _origSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function (body) {
        if (this._flixUrl && this._flixUrl.indexOf(GRAPHQL_HOST + '/graphql') !== -1) {
            this._flixBody = typeof body === 'string' ? body : '';

            // Block if request body contains household markers
            if (containsHouseholdData(this._flixBody)) {
                console.log('[NetlixBypass] Blocked household XHR (body match)');
                return; // silently drop
            }

            // For XHR, intercept the response via load event
            var self = this;

            var interceptor = function () {
                try {
                    var respText = self.responseText || '';
                    if (containsHouseholdData(respText)) {
                        console.log('[NetlixBypass] Stripped household data from XHR response');
                        Object.defineProperty(self, 'responseText', {
                            value: '{"data":{}}', writable: true, configurable: true
                        });
                        Object.defineProperty(self, 'response', {
                            value: '{"data":{}}', writable: true, configurable: true
                        });
                    }
                } catch (e) { }
            };

            this.addEventListener('load', interceptor, { once: true, capture: true });
        }
        return _origSend.apply(this, arguments);
    };

    console.log('[NetlixBypass] Response interception active (document.' + document.readyState + ')');
})();
