sap.ui.define([
	"exed/com/quotamanagerskp/controller/BaseController"
], function (BaseController) {
	"use strict";

	var globalKunnr;
	var globalSkup;
	var globalMaster;
	var globalMasterNew;
	var zuserid;

	return BaseController.extend("exed.com.quotamanagerskp.controller.RemanejamentoSucesso", {

		onInit: function () {

			//	this.montaModel();
			this.getRouter().getRoute("RemanejamentoSucesso").attachPatternMatched(this._onObjectMatched, this);

		},

		_onObjectMatched: function (oEvent) {

			this.getView().setModel(sap.ui.getCore().getModel("ResumoCarteira"), "ResumoCarteira");

			var kunnr = oEvent.getParameter("arguments").Kunnr;
			globalKunnr = kunnr;
			//  var skup = oEvent.getParameter("arguments").Skup;
			var skup = JSON.parse(atob(oEvent.getParameter("arguments").Skup));
			zuserid = oEvent.getParameter("arguments").Zuserid;
			globalMaster = oEvent.getParameter("arguments").BrMaster;
			globalMasterNew = oEvent.getParameter("arguments").BrMasterNew;

			globalSkup = skup;

			if (isNaN(globalMasterNew)) {
				globalMasterNew = 0;
				globalMasterNew = parseFloat(globalMasterNew).toFixed(3);

			}

			this.bindatela(skup, zuserid);

		},

		montaModel: function () {

			var lista = this.retornaLista();
			var modelo = {};
			var sucesso = [];
			var total = 0;

			for (var i = 0; i < lista.length; i++) {
				sucesso.push({
					KunnrName: lista[i].KunnrName,
					Ort01: lista[i].Ort01,
					Regio: lista[i].Regio,
					Qtde: lista[i].Qtde,
					Kunnr: lista[i].Kunnr
				});
			}

			modelo = {
				sucesso: sucesso
			};

			var newModel = new sap.ui.model.json.JSONModel();
			newModel.setData(modelo);
			this.byId("listSucesso").setModel(newModel);

		},

		bindatela: function (iSkup, izuserid) {
			this.getView().byId("_IDEGen_text0").setText(izuserid);
			this.getModel().metadataLoaded().then(function () {
				var sObjectPath = this.getModel().createKey("cota_gcskuSet", {
					ZzbrAtpskp: iSkup,
					Zuserid: izuserid
				});
				this._bindView("/" + sObjectPath);
			}.bind(this));
		},

		_bindView: function (sObjectPath) {
			// Set busy indicator during view binding
			var oViewModel = this.getModel();
			// If the view was not bound yet its not busy, only if the binding requests data it is set to busy again
			oViewModel.setProperty("/busy", false);

			this.getView().bindElement({
				path: sObjectPath,
				events: {
					change: this._onBindingChange.bind(this),
					dataRequested: function () {
						oViewModel.setProperty("/busy", true);
					},
					dataReceived: function () {
						oViewModel.setProperty("/busy", false);
					}
				}
			});

		},

		_onBindingChange: function () {

			//	this.montaModel();
			var sRootPath = jQuery.sap.getModulePath("mcs");
			var sImagePath = sRootPath + "/icone/sucesso.png";
			//		var sImagePathSeta = sRootPath + "/icone/seta2.png";
			this.getView().byId("idimgSucesso").setSrc(sImagePath);
			//		this.getView().byId("idimgSetasucesso").setSrc(sImagePathSeta);

		},

		onCloseDetailPress: function () {
			this.getModel("appView").setProperty("/actionButtonsInfo/midColumn/fullScreen", false);
			// No item should be selected on master after detail page is closed
			this.getOwnerComponent().oListSelector.clearMasterListSelection();
			this.getRouter().navTo("master");
		},

		onReturn: function () {
			this.getRouter().navTo("master");
			/*	this.getRouter().navTo("Remanejar", {
				Skup: btoa(JSON.stringify(globalSkup)),
				Zuserid: zuserid
			}, true);*/
		},

		onVoltar: function () {
			this.onReturn();

		}

	});

});