"use strict";
/*global setImmediate: true*/

var base = require("xbase"),
	fs = require("fs"),
	glob = require("glob"),
	diffUtil = require("xutil").diff,
	httpUtil = require("xutil").http,
	path = require("path"),
	tiptoe = require("tiptoe");

tiptoe(
	function getJSON()
	{
		httpUtil.get("http://heroesjson.com/json/heroes.json", this.parallel());
		fs.readFile(path.join(__dirname, "..", "web", "json", "heroes.json"), {encoding : "utf8"}, this.parallel());
	},
	function compare(oldJSON, newJSON)
	{
		var oldData = JSON.parse(oldJSON[0]).mutate(function(hero, result) { result[hero.id] = hero; return result; }, {});
		var newData = JSON.parse(newJSON).mutate(function(hero, result) { result[hero.id] = hero; return result; }, {});

		Object.keys(newData).subtract(Object.keys(oldData)).forEach(function(newKey) { base.info("New hero: %s", newKey); delete newData[newKey]; });

		var result = diffUtil.diff(oldData, newData, {compareArraysDirectly:true, arrayKey : "id"});
		if(result)
			console.log(result);

		this();
	},
	function finish(err)
	{
		if(err)
		{
			base.error(err.stack);
			base.error(err);
			process.exit(1);
		}

		process.exit(0);
	}
);
