sap.ui.define([
	'sap/ui/core/Core',
	"exed/com/quotamanagerskp/controller/BaseController",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessagePopover",
	"sap/m/MessageItem",
	"sap/m/MessageBox",
	"sap/ui/core/message/ControlMessageProcessor",
	"sap/ui/core/message/Message"
], function (Core, BaseController, Filter, FilterOperator, JSONModel, MessagePopover, MessageItem, MessageBox, ControlMessageProcessor,
	Message) {
	"use strict";
	var zuserid;
	var kunnr;
	var skp;

	return BaseController.extend("exed.com.quotamanagerskp.controller.Solicitar", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf exed.com.quotamanagerskp.view.Solicitar
		 */
		onInit: function () {
			this.getRouter().getRoute("Solicitar").attachPatternMatched(this._onObjectMatched, this);
			this.oSemanticPage = this.byId("mySemanticPage");
			this.oEditAction = this.byId("editAction");
			this.oSemanticPage.setModel(this.oModel);
		},

		_onObjectMatched: function (oEvent) {

			//var skup = JSON.parse(atob(oEvent.getParameter("arguments").Skup));
			//skp = JSON.parse(atob(oEvent.getParameter("arguments").Skup));
			skp = oEvent.getParameter("arguments").ZzbrAtpskp;
			kunnr = oEvent.getParameter("arguments").kunnr;
			var skup = oEvent.getParameter("arguments").ZzbrAtpskp;
			zuserid = oEvent.getParameter("arguments").zuserid;
			this.bindatela(skup, zuserid);
		},

		bindatela: function (iSkup, izuserid) {
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

		_onBindingChange: function (oEvent) {

			//	this.cotamaster();

			var oView = this.getView(),
				oElementBinding = oView.getElementBinding();

			// No data for the binding
			if (!oElementBinding.getBoundContext()) {
				this.getRouter().getTargets().display("detailObjectNotFound");
				// if object could not be found, the selection in the master list
				// does not make sense anymore.
				this.getOwnerComponent().oListSelector.clearMasterListSelection();
				return;

			}

			var sPath = oElementBinding.getPath(),
				oResourceBundle = this.getResourceBundle(),
				oObject = oView.getModel().getObject(sPath),
				oViewModel = this.getModel();

			this.getOwnerComponent().oListSelector.selectAListItem(sPath);

			this.header();
		},
		
		header: function() {
			  var that = this;
				var olist4 = new sap.ui.model.json.JSONModel();
			var slist4 = "/here/goes/your/serviceurl/cota_gcSet/?$filter=Kunnr eq '" + kunnr + "' and ZzbrAtpskp eq '" + skp + "' and Kunn2 eq '" + zuserid + "' ";
			olist4.loadData(slist4, null, false, "GET", false, false, null);
			var rlist4 = olist4.oData.d.results;

			for (var i = 0; i < rlist4.length; i++) {
				var client = rlist4[i].Kunnr + " - " + rlist4[i].KunnrName + " - " + rlist4[i].Ort01 + " - " + rlist4[i].Regio;
				that.byId("oli40").setText(client);
				that.byId("oli41").setText(rlist4[i].ZzbrAtpskp);
				that.byId("oli43").setText(rlist4[i].Zplvendalivre);
				that.byId("_IDEGen_text0").setText(rlist4[i].Kunn2Name); 
			}

			
			
		},
		
	
		validaConteudo: function () {
			var tabela = this.getView().byId("mclist1");
			var length = tabela.getItems().length;
			var nome;
			var valor;
			var valida;

			for (var i = 0; i < length; i++) {
				nome = tabela.getItems()[i].getCells()[0].getProperty("text");
				valor = tabela.getItems()[i].getCells()[3].getProperty("value");
				valor = parseFloat(valor, 2);

				if (isNaN(valor) || valor == 0) {
					valida = 0;

				} else {
					valida = 1;
					return valida;
				}

			}

			return valida;

		},

		onLiveChange: function (oValue) {
			/* var tabela = this.getView();*/
			var newValue = oValue.mParameters.value;

			var id = oValue.mParameters.id;

			while (newValue.indexOf(",") !== -1) {
				newValue = newValue.replace(",", ".");
			}

			var num = isNaN(newValue);

			if (num === true) {
				this.byId(id).setValueState("Error");
			} else {
				this.byId(id).setValueState("None");
				this.byId(id).setValue(newValue);
			}

			/*if (newValue.includes(",")) {
				oValue.oSource.setValueState(sap.ui.core.ValueState.Error);

			} else {
				oValue.oSource.setValueState(sap.ui.core.ValueState.None);
			}

			if (newValue.includes("-")) {
				oValue.oSource.setValueState(sap.ui.core.ValueState.Error);

			} else {
				oValue.oSource.setValueState(sap.ui.core.ValueState.None);

			}*/

		},
		
			onPressResumoSolicitacao: function () {
			var mclist1 = this.getView().byId("mclist1");
			var length = mclist1.getItems().length;
			var arraySolicitar = this.buscarArraySolicitar();
			var lengthArray = arraySolicitar.length;
			var nome;
			var valor;
			var nomeArray;
			var valida;
			var sai;

			var messagem = " Campo quantidade está vázio !";
			var messagemError = "Entrada inválida";
			var validaconteudo = this.validaConteudo();
			var saldo;
			var arraySaldo;
			var vError;

			arraySolicitar.pop();
			lengthArray = 0;

			if (validaconteudo == 0) {
				sap.m.MessageBox.error(messagem, {
					actions: [sap.m.MessageBox.Action.CLOSE],
					onClose: function (sAction) {}

				});
				return;
			}

			/*fim*/

			if (length == 0) {
				sap.m.MessageBox.error("Não há gestor para solicitar", {
					actions: [sap.m.MessageBox.Action.CLOSE],
					onClose: function (sAction) {}
				});
				return;
			}

			for (var i = 0; i < length; i++) {
				nome = mclist1.getItems()[i].getCells()[0].getProperty("text");
				valor = mclist1.getItems()[i].getCells()[3].getProperty("value");
				vError = mclist1.getItems()[i].getCells()[3].getProperty("valueState");
				/*Inicio*/
				saldo = mclist1.getItems()[i].getCells()[1].getProperty("text");;
		/*		arraySaldo = saldo.split(":");
				saldo = arraySaldo[1];
				saldo = saldo.trim();*/
				saldo = parseFloat(saldo, 2);

				if (vError == "Error") {
					sap.m.MessageBox.error(messagemError, {
						actions: [sap.m.MessageBox.Action.CLOSE],
						onClose: function (sAction) {}
					});
					return;
				}

				//  Valor zero

				valor = parseFloat(valor).toFixed(3);

				if (valor === "0" || valor === "0.00" || valor === "0.000" || valor === "0.0" || valor === "0." || valor === ".0" || valor ===
					"-0" || valor < 0) {
					sap.m.MessageBox.error("Informe um valor maior que zero !", {
						actions: [sap.m.MessageBox.Action.CLOSE],
						onClose: function (sAction) {}
					});

					mclist1.getItems()[i].getCells()[3].setProperty("valueState", "Error");

					return;
				} else {
					mclist1.getItems()[i].getCells()[3].setProperty("valueState", "None");
				}

				//Saldo  Menor
				if (valor > saldo) {
					sap.m.MessageBox.error("Saldo menor do que o valor remanejado.", {
						actions: [sap.m.MessageBox.Action.CLOSE],
						onClose: function (sAction) {}
					});

					mclist1.getItems()[i].getCells()[3].setProperty("valueState", "Error");

					return;
				} else {
					mclist1.getItems()[i].getCells()[3].setProperty("valueState", "None");
				}
				/*Fim*/

				if (lengthArray !== 0) {

					for (var j = 0; j < lengthArray; j++) {
						nomeArray = arraySolicitar[j].nome;
						valida = this.validaNome(nomeArray, nome);
						if (valida === 1) {
							sai = "1";
						}
						if (sai === 0) {
							lengthArray.push({
								nome: nome,
								valor: valor
							});
						} else {
							for (var K = 0; K < lengthArray; K++) {
								nomeArray = arraySolicitar[K].nome;
								if (nomeArray === nome) {
									arraySolicitar[K].valor = valor;
								}
							}
						}
					}

				} else {
					arraySolicitar.push({
						nome: nome,
						valor: valor
					});
				}
			}
			this.igualaArrayVolume(arraySolicitar);

			var textkunnr =  kunnr; //this.getView().byId("textkunnr").getText();
			var zbrAtpskp = skp;   // this.getView().byId("textskup").getText();
			this.getRouter().navTo("ResumoSolicitar", {
				kunnr: textkunnr,
				ZzbrAtpskp: btoa(JSON.stringify(zbrAtpskp)),
				Zuserid: zuserid
			});
		},

		validaNome: function (inomeArray, inome) {
			if (inomeArray === inome) {
				return 1;
			} else {
				return 0;
			}
		},

		onSearch: function (oEvent) {
			var valor = oEvent.getParameter("query");

			if (valor) {
				var skup = this.getView().byId("ObjectListItemOrt01").getNumber();
				var filter = new sap.ui.model.Filter("ZzbrAtpskp", sap.ui.model.FilterOperator.EQ, skup);
				var filter1 = new sap.ui.model.Filter("Kunn2Name", sap.ui.model.FilterOperator.EQ, valor);
				var filter2 = new sap.ui.model.Filter("Zuserid", sap.ui.model.FilterOperator.EQ, zuserid);
				var list = this.getView().byId("mclist1");
				list.getBinding("items").filter([filter, filter1, filter2]);
			} else {
				this.executaFiltro();
			}
		},


		onCloseDetailPress: function () {
			this.getModel("appView").setProperty("/actionButtonsInfo/midColumn/fullScreen", false);
			// No item should be selected on master after detail page is closed
			this.getOwnerComponent().oListSelector.clearMasterListSelection();
			this.getRouter().navTo("master");
		}

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf exed.com.quotamanagerskp.view.Solicitar
		 */
		//	onExit: function() {
		//
		//	}

	});

});