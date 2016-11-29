/* global Module */

/* Magic Mirror
 * Module: Tado ThermoStats
 *
 * By Oliver Payne and David West
 * MIT Licensed.
 */

Module.register("tado",{

	// Default module config.
	defaults: {
		tado_username: "", // set in config/config.js 
		tado_password: "", // set in config/config.js
		tado_home_number: "", // set in config/config.js
		tado_zone_number: "", // // set in config/config.js
		units: config.units,
		updateInterval: 10 * 60 * 1000, // every 10 minutes
		animationSpeed: 1000,
		lang: config.language,
		initialLoadDelay: 0, // 0 seconds delay
		retryDelay: 2500,
		apiBase: "https://my.tado.com/api/v2/homes"

	},

	// Define required scripts.
	getScripts: function() {
		return ["moment.js"];
	},

	// Define required scripts.
	getStyles: function() {
		return ["tado.css", "https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"];
	},

	// Define required translations.
	getTranslations: function() {
		// The translations for the defaut modules are defined in the core translation files.
		// Therefor we can just return false. Otherwise we should have returned a dictionairy.
		// If you're trying to build yiur own module including translations, check out the documentation.
		return false;
	},

	// Define start sequence.
	start: function() {

		this.current_temperature = null,
		this.target_temperature = null,
		this.loaded = false;

		this.scheduleUpdate(this.config.initialLoadDelay);

		this.updateTimer = null;

	},

	// Override dom generator.
	getDom: function() {
		var wrapper = document.createElement("div");

		if (this.config.tado_username === "") {
			wrapper.innerHTML = "Please set the tado_username.";
			wrapper.className = "dimmed light small";
			return wrapper;
		}

		if (this.config.tado_password === "") {
			wrapper.innerHTML = "Please set the tado_password.";
			wrapper.className = "dimmed light small";
			return wrapper;
		}

		if (!this.loaded) {
			wrapper.innerHTML = this.translate('LOADING');
			wrapper.className = "dimmed light small";
			return wrapper;
		}

		//Log.info(this);

		wrapper.innerHTML = this.current_temperature + '&deg;C' + '&nbsp' + '/' + '&nbsp' + this.target_temperature + '&deg;C';
		return wrapper;
	},

	/* updateTado(compliments)
	 * Requests new data from tado.com.
	 * Calls processTado on succesfull response.
	 */
	updateTado: function() {
		var url = this.config.apiBase + "/" + this.config.tado_home_number + "/zones/" + this.config.tado_zone_number + "/state?username=" + this.config.tado_username +  "&password=" + this.config.tado_password;
		var self = this;
		var retry = true;

		var tadoRequest = new XMLHttpRequest();
		tadoRequest.open("GET", url, true);
		tadoRequest.onreadystatechange = function() {
			if (this.readyState === 4) {
				if (this.status === 200) {
					self.processTado(JSON.parse(this.response));
				} else if (this.status === 401) {
					self.updateDom(self.config.animationSpeed);

					Log.error(self.name + ": Incorrect credentials.");
					retry = false;
				} else {
					Log.error(self.name + ": Could not load.");
				}

				if (retry) {
					self.scheduleUpdate((self.loaded) ? -1 : self.config.retryDelay);
				}
			}
		};
		tadoRequest.send();
	},

	processTado: function(data) {

		if (! data) {
			return;
		}


		this.current_temperature = data.sensorDataPoints.insideTemperature.celsius;
		this.target_temperature = data.setting.temperature.celsius;

		this.loaded = true;
		this.updateDom(this.config.animationSpeed);
	},

	/* scheduleUpdate()
	 * Schedule next update.
	 *
	 * argument delay number - Milliseconds before next update. If empty, this.config.updateInterval is used.
	 */
	scheduleUpdate: function(delay) {
		var nextLoad = this.config.updateInterval;
		if (typeof delay !== "undefined" && delay >= 0) {
			nextLoad = delay;
		}

		var self = this;
		setTimeout(function() {
			self.updateTado();
		}, nextLoad);
	},

});
