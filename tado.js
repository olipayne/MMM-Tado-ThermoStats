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
		tado_home_number: "", // only needs to be set if you have more than 1 home
		tado_zone_number: "1", // // only needs to be set if you have more than 1 zone
		home_icon: "home",
		units: config.units,
		updateInterval: 5 * 60 * 1000, // every 5 minutes
		animationSpeed: 1000,
		lang: config.language,
		initialLoadDelay: 0, // 0 seconds delay
		retryDelay: 2500,
		apiBase: "https://my.tado.com/api/v2"

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

		wrapper.innerHTML = '';
		if (this.config.home_icon != '') {
			wrapper.innerHTML += '<i class="fa fa-' + this.config.home_icon + '"></i> | ';
		}

		wrapper.innerHTML += this.current_temperature;
		if (this.config.units == 'metric') {
			var temp_symbol = 'C';
		} else {
			var temp_symbol = 'F';
		}

		wrapper.innerHTML += '&deg;' + temp_symbol + ' | ' + this.target_temperature + '&deg;' + temp_symbol;
		return wrapper;
	},

	/* updateTado(compliments)
	 * Requests new data from tado.com.
	 * Calls processTado on succesfull response.
	 */
	updateTado: function() {
		var self = this;
		var retry = true;
		// Let's see if we can intelligently find the home_id first.
		var me_url = this.config.apiBase + "/me?username=" + this.config.tado_username +  "&password=" + this.config.tado_password;
		var tadoHomeRequest = new XMLHttpRequest();
		tadoHomeRequest.open("GET", me_url, true);
		tadoHomeRequest.onreadystatechange = function() {
			if (this.readyState === 4) {
				if (this.status === 200) {
					var response = JSON.parse(this.response);
					var homes = response.homes;
					if (homes.length > 1) {
						Log.error('More than 1 home found, please set tado_home_number');
						retry = false;
						return false;
					} else {
						self.config.tado_home_number = homes[0].id;
						var url = self.config.apiBase + "/homes/" + self.config.tado_home_number + "/zones/" + self.config.tado_zone_number + "/state?username=" + self.config.tado_username +  "&password=" + self.config.tado_password;
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
					}
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
		tadoHomeRequest.send();
	},

	processTado: function(data) {

		if (! data) {
			return;
		}

		if (data.sensorDataPoints.insideTemperature) {

			if (this.config.units == 'metric') {
				this.current_temperature = data.sensorDataPoints.insideTemperature.celsius;
				this.target_temperature = data.setting.temperature.celsius;
			} else {
				this.current_temperature = data.sensorDataPoints.insideTemperature.fahrenheit;
				this.target_temperature = data.setting.temperature.fahrenheit;
			}

		this.current_temperature = (Math.round(this.current_temperature * 10) / 10).toFixed(1);
		this.target_temperature = (Math.round(this.target_temperature * 10) / 10).toFixed(1);

		} else {

			this.current_temperature = '-';
			this.target_temperature = '-';

		}

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
