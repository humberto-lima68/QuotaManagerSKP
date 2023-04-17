sap.ui.define([
	"exed/com/quotamanagerskp/controller/BaseController",
], function (BaseController) {
	"use strict";
	var chave;
	var kunnr;
	var ZzbrAtpskp;
	var zuserid;

	return BaseController.extend("exed.com.quotamanagerskp.controller.SolicitarSucesso", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf mc.view.SolicitarSucesso
		 */
		onInit: function () {
			var sRootPath = jQuery.sap.getModulePath("mc");
			var sImagePath = sRootPath + "/icone/sucesso.png";
			var sImagePathSeta = sRootPath + "/icone/seta2.png";

			this.getRouter().getRoute("SolicitarSucesso").attachPatternMatched(this._onObjectMatched, this);

		},

		_onObjectMatched: function (oEvent) {
			kunnr = oEvent.getParameter("arguments").kunnr;
			//	ZzbrAtpskp = oEvent.getParameter("arguments").ZzbrAtpskp;
			ZzbrAtpskp = JSON.parse(atob(oEvent.getParameter("arguments").ZzbrAtpskp));
			chave = oEvent.getParameter("arguments").Chave;
			zuserid = oEvent.getParameter("arguments").Zuserid;
			this.bindatela();
		},

		bindatela: function () {
			this.getModel().metadataLoaded().then(function () {
				var sObjectPath = this.getModel().createKey("cota_gcSet", {
					Kunnr: kunnr,
					ZzbrAtpskp: ZzbrAtpskp,
					Zuserid: zuserid
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

		executaFiltro: function () {
			var filter = new sap.ui.model.Filter("ZzbrAtpskp", sap.ui.model.FilterOperator.EQ, ZzbrAtpskp);
			var filter1 = new sap.ui.model.Filter("Zuserid", sap.ui.model.FilterOperator.EQ, zuserid);
			var list = this.getView().byId("listResumo");
			list.getBinding("items").filter([filter, filter1]);
		},

		_onBindingChange: function () {
			this.executaFiltro();
		},

		buscaInfoRemanejar: function () {
			var tabelaResumo = this.getView().byId("listResumo1");
			var length = tabelaResumo.getItems().length;
			var nomeResumo;
			var valorResumo;
			var nomeTabelaResumo;
			var idVolume;
			var arrayVolume = this.buscarArraySolicitar();
			var lengthArray = arrayVolume.length;

			for (var i = 0; i < lengthArray; i++) {
				nomeResumo = "";
				valorResumo = "";
				nomeResumo = arrayVolume[i].nome;
				valorResumo = arrayVolume[i].valor;
				valorResumo = parseFloat(valorResumo).toFixed(3);

				if (isNaN(valorResumo)) {
					valorResumo = "";
				}

				for (var j = 0; j < length; j++) {
					nomeTabelaResumo = "";
					nomeTabelaResumo = tabelaResumo.getItems()[j].getCells()[0].getProperty("title");
					if (nomeTabelaResumo === nomeResumo) {
						idVolume = "";
						idVolume = tabelaResumo.getItems()[j].getCells()[1].getId();
						this.getView().byId(idVolume).setValue(valorResumo);
					}
				}
			}
		},

		calculaTotal: function () {
			var tabelaResumo = this.getView().byId("listResumo1");
			var length = tabelaResumo.getItems().length;
			var total = 0;
			total = parseFloat(total, 2);
			var valor;
			var id;

			for (var i = 0; i < length; i++) {
				id = tabelaResumo.getItems()[i].getCells()[1].getId();
				valor = this.getView().byId(id).getValue();
				valor = parseFloat(valor, 2);
				if (valor) {
					total = total + valor;
				}

			}

			total = parseFloat(total).toFixed(3);
			total = total + " Tons";
			this.getView().byId("idTotal").setText(total);
			this.getView().byId("ObjectListItemSucessoZzbrAtpskp").setNumber(total);
		},

		onVoltar: function () {
			this.getRouter().navTo("master");
		},


		onCloseDetailPress: function () {
			this.getModel("appView").setProperty("/actionButtonsInfo/midColumn/fullScreen", false);
			// No item should be selected on master after detail page is closed
			this.getOwnerComponent().oListSelector.clearMasterListSelection();
			this.getRouter().navTo("master");
		},

		onModelContextChange: function () {
			this.buscaInfoRemanejar();
			this.calculaTotal();
		},

	});

});