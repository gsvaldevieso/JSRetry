var JSRetry = {
	interval: 0,
	attempts: 0,
	error:   function() {},
	checker: function() {},
	success: function() {},
	timeout: function() {},

	try: function(configuration) {
		this.validateInput(configuration);
		this.startTry();
	},

	validateInput: function(configuration) {
		this.attempts = !configuration.attempts ? this.attempts : configuration.attempts;
		this.interval = !configuration.interval ? this.interval : configuration.interval;
		this.checker  = (typeof configuration.checker !== "function") ? function(){} : configuration.checker;
		this.success  = (typeof configuration.success !== "function") ? function(){} : configuration.success;
		this.error    = (typeof configuration.error   !== "function") ? function(){} : configuration.error;
		this.timeout  = (typeof configuration.timeout !== "function") ? function(){} : configuration.timeout;
	},

	startTry: function() {
		var handler = function(events, intervalHandler) {
			if (events.counter-- <= 0) {
				events.timeout();
				clearInterval(intervalHandler);
				return;
			}

			try {
				if (events.checker()) {
					events.success();
					clearInterval(intervalHandler);
				}
			} catch(e) {
				events.error(e);
				clearInterval(intervalHandler);
			}
		}

		var events = {
			checker: this.checker,
			success: this.success,
			timeout: this.timeout,
			counter: this.attempts,
			error: this.error
		};

		var intervalHandler = setInterval(function() { handler(events, intervalHandler); }, this.interval);
	}
};