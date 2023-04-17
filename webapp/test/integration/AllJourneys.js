// We cannot provide stable mock data out of the template.
// If you introduce mock data, by adding .json files in your webapp/localService/mockdata folder you have to provide the following minimum data:
// * At least 3 zapo_acessoSet in the list

sap.ui.define([
	"sap/ui/test/Opa5",
	"./arrangements/Startup",
	"./MasterJourney",
	"./NavigationJourney",
	"./NotFoundJourney"
], function (Opa5, Startup) {
	"use strict";

	Opa5.extendConfig({

		arrangements: new Startup(),
		viewNamespace: "exed.com.quotamanagerskp.view.",
		autoWait: true
	});
});
