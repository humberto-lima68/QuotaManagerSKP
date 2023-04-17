sap.ui.define([
	"exed/com/quotamanagerskp/controller/BaseController", "sap/m/DialogType", "sap/ui/core/ValueState", "sap/m/Dialog", "sap/m/Button",
	"sap/m/ButtonType",
	"sap/m/Text", "sap/ui/model/json/JSONModel"
], function (BaseController, DialogType, ValueState, Dialog, Button, ButtonType, Text, JSONModel) {
	"use strict";

	var globalKunnr;
	var globalSkup;
	var globalMaster;
	var globalMasterNew;
	var zuserid;
	var oBusyDialog = new sap.m.BusyDialog();

	return BaseController.extend("exed.com.quotamanagerskp.controller.ResumoCarteira", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf mcs.view.ResumoCarteira
		 */
		onInit: function () {

			this.getRouter().getRoute("ResumoCarteira").attachPatternMatched(this._onObjectMatched, this);

		},

		_onObjectMatched: function (oEvent) {

			this.getView().setModel(sap.ui.getCore().getModel("ResumoCarteira"), "ResumoCarteira");

			// MATCH DE TELA, CARREGANDO INFO DE CAMPOS 
			var kunnr = oEvent.getParameter("arguments").Kunnr;
			//var skup = oEvent.getParameter("arguments").Skup;
			var skup = JSON.parse(atob(oEvent.getParameter("arguments").Skup));
			zuserid = oEvent.getParameter("arguments").Zuserid;
			//			this.getView().byId("idTitleDependentes1").setText(" Resumo " + "(" + zuserid + ")");

			var master = oEvent.getParameter("arguments").BrMaster;
			var masterNew = oEvent.getParameter("arguments").BrMasterNew;

			// this.getView().byId("oi055").setText(master);
			// this.getView().byId("oi056").setText(masterNew);

			globalMaster = master;
			globalMasterNew = masterNew;

			globalSkup = skup;
			//	globalKunnr = kunnr;
			this.bindatela(skup, zuserid);
		},

		executaFiltro: function () {
			//	var zsaldozero = "X";
			var filter = new sap.ui.model.Filter("ZzbrAtpskp", sap.ui.model.FilterOperator.EQ, globalSkup);
			//	var filter1 = new sap.ui.model.Filter("Kunnr", sap.ui.model.FilterOperator.EQ, globalKunnr);
			//	var filter2 = new sap.ui.model.Filter("Zsaldozero", sap.ui.model.FilterOperator.EQ, zsaldozero);
			var filter3 = new sap.ui.model.Filter("Zuserid", sap.ui.model.FilterOperator.EQ, zuserid);
			var table = this.getView().byId("tableResumo");
			//table.getBinding("items").filter([filter, filter3]);
		},

		bindatela: function (iSkup, izuserid) {

			this.getModel().metadataLoaded().then(function () {
					this.getView().byId("_IDEGen_text0").setText(izuserid);
				var sObjectPath = this.getModel().createKey("cota_gcskuSet", {
					ZzbrAtpskp: iSkup,
					Zuserid: izuserid
				});
				this._bindView("/" + sObjectPath);
			}.bind(this));
		},

		onCloseDetailPress: function () {
			this.getModel("appView").setProperty("/actionButtonsInfo/midColumn/fullScreen", false);
			// No item should be selected on master after detail page is closed
			this.getOwnerComponent().oListSelector.clearMasterListSelection();
			this.getRouter().navTo("master");
		},
		
		onPressResumo: function () {

			if (!this.oInfoMessageDialog) {
				this.oInfoMessageDialog = new Dialog({
					type: DialogType.Message,
					//	id: "dialogConfirmaResumo",
					title: "Quota Relocation",
					showTitle: "false",
					state: ValueState.Information,
					content: new Text({
						text: "Confirm Quota Relocation?"
					}),
					beginButton: new Button({
						text: "Cancel",
						//		id: "botaoCancelarDialog2",
						class: "botaoCancelarDialog",
						press: function () {
							this.oInfoMessageDialog.close();
						}.bind(this)
					}),
					endButton: new Button({
						text: "Confirmation",
						//		id: "botaoConfirmarDialog2",
						press: function () {
							this.oInfoMessageDialog.close();
							oBusyDialog.open(0);

							this.cotaMaster();

						}.bind(this)
					}),
					afterClose: function () {

						//this.oInfoMessageDialog.close();
					}
				});
			}

			this.oInfoMessageDialog.open();
		},

		calculaTotal: function () {
			var tabelaResumo = this.getView().byId("tableResumo");
			var length = tabelaResumo.getItems().length;
			var total = 0;
			total = parseFloat(total, 2);
			var valor = 0;
			var id;

			for (var i = 0; i < length; i++) {
				id = tabelaResumo.getItems()[i].getCells()[2].getId();
				valor = this.getView().byId(id).getValue();
				valor = parseFloat(valor, 2);
				if (valor) {
					total = total + valor;
				}
			}

			total = parseFloat(total).toFixed(3);
			total = total + " Tons";
			this.getView().byId("idTotal").setText(total);
		},

		onSave: function () {
			this.gravaArray();
			this.onCancela();
			this.calculaTotal();
		},

		gravaArray: function () {
			var tabela = this.getView().byId("tableResumo");
			var length = tabela.getItems().length;
			var nome;
			var valor;
			var arrayVolume = this.buscarArrayVolume();
			var lengthArray = arrayVolume.length;
			var nomeArray;
			var valida;
			var sai = 0;
			/*Valida Valores inicio
			 */
			var messagem = " Campo quantidade está vázio !";
			var validaconteudo = this.validaConteudo();
			var saldo;
			var arraySaldo;

			if (validaconteudo == 0) {
				sap.m.MessageBox.error(messagem, {
					actions: ["OK", sap.m.MessageBox.Action.CLOSE],
					onClose: function (sAction) {}

				});

			}

			/*Valida Valores fim
			 */

			for (var i = 0; i < length; i++) {
				nome = tabela.getItems()[i].getCells()[0].getProperty("title");
				valor = tabela.getItems()[i].getCells()[2].getProperty("value");
				/*Inicio*/
				saldo = tabela.getItems()[i].getCells()[1].getProperty("text");

				arraySaldo = saldo.split(":");
				saldo = arraySaldo[1];
				saldo = saldo.trim();
				saldo = parseFloat(saldo, 2);

				if (valor > saldo) {
					sap.m.MessageBox.error("Saldo menor do que o valor remanejado.", {
						actions: ["OK", sap.m.MessageBox.Action.CLOSE],
						onClose: function (sAction) {}

					});

					tabela.getItems()[i].getCells()[2].setProperty("valueState", "Error");

					return;
				} else {
					tabela.getItems()[i].getCells()[2].setProperty("valueState", "None");
				}

				if (lengthArray !== 0) {

					for (var j = 0; j < lengthArray; j++) {
						nomeArray = arrayVolume[j].nome;
						valida = this.validaNome(nomeArray, nome);
						if (valida === 1) {
							sai = "1";
						}
					}
					if (sai === 0) {
						arrayVolume.push({
							nome: nome,
							valor: valor
						});
					} else {
						for (var K = 0; K < lengthArray; K++) {
							nomeArray = arrayVolume[K].nome;
							if (nomeArray === nome) {
								arrayVolume[K].valor = valor;
							}
						}
					}
				} else {
					arrayVolume.push({
						nome: nome,
						valor: valor
					});
				}
			}

			this.igualaArrayVolume(arrayVolume);
		},

		validaNome: function (inomeArray, inome) {
			if (inomeArray === inome) {
				return 1;
			} else {
				return 0;
			}
		},

		sucesso: function () {
			this.enviaEcc();

		},

		cotaMaster: function () {
			this.remanejaCotaMaster();
		},

		chamaSucesso: function () {
			//	var kunnr = this.getView().byId("textclientesolcitante").getText();
			//  var skup = this.getView().byId("textskup").getText();
		 
 
			oBusyDialog.close();
			this.getRouter().navTo("RemanejamentoSucesso", {
				Skup: btoa(JSON.stringify(globalSkup)),
				Zuserid: zuserid,
				BrMaster: globalMaster,
				BrMasterNew: globalMasterNew
			}, true);

		},

		onVoltar: function () {
			this.getRouter().navTo("Remanejar", {
				Skup: btoa(JSON.stringify(globalSkup)),
				Kunnr: globalKunnr,
				Zuserid: zuserid
			}, true);
		},

		atualizaEccApo: function () {
			var oModel = this.getView().getModel();
			var chave = this.getView().byId("chave").getText();
			var Key = "/remanejarSet(Zgcsolicitante='" + chave + "')";
			/*	var Key = "/transferenciagcSet(Zgcsolicitante='" + chave + "')";*/
			var pktsolicitante = this.getView().byId("textpktsolicitante").getText();
			var clientesolicitante = this.getView().byId("textclientesolcitante").getText();
			var oEntry = {};
			var retorno;
			var that = this;

			oEntry = {};
			oEntry.Zuserid = zuserid;
			oEntry.ZpktSolicitante = pktsolicitante;
			oEntry.ZkunnrSolicitante = clientesolicitante;

			oModel.update(Key, oEntry, {
				success: function (oData, oResponse) {

					if (oResponse.statusCode == 204) {
						that.chamaSucesso();
					}

					retorno = 0;
				},
				error: function (oError) {
					var erro = oError;
					erro = erro.responseText;
					var erro2 = JSON.parse(erro);
					var messagem = erro2.error.message.value;
					sap.m.MessageBox.error(messagem, {
						actions: ["OK", sap.m.MessageBox.Action.CLOSE],
						onClose: function (sAction) {}
					});

					oBusyDialog.close();
					retorno = 1;
					return retorno;

				}

			});

		},

		validaConteudo: function () {
			var lista = this.getView().byId("tableResumo");
			var length = lista.getItems().length;
			var nome;
			var valor;
			var valida;

			for (var i = 0; i < length; i++) {
				nome = lista.getItems()[i].getCells()[3].getProperty("title");
				valor = lista.getItems()[i].getCells()[2].getProperty("value");

				if (valor == 0) {
					valida = 0;
				} else {
					valida = 1;
					return valida;
				}

			}

			return valida;

		},

		enviaEcc: function () {
			//	var oModel = this.getView().getModel();
			var sServiceUrl = "/sap/opu/odata/sap/ZGW_APO_COTA_SRV/";
			var oModel = new sap.ui.model.odata.ODataModel(sServiceUrl, true);

			//		var chave = this.getView().byId("chave").getText();
			/*	var Key = "/remanejar_carteiraSet(Zgcsolicitante='" + chave + "')";*/
			//		var Key = "/transferenciagcSet(Zgcsolicitante='" + chave + "')";
			//		var pktsolicitante = this.getView().byId("textpktsolicitante").getText();
			//		var clientesolicitante = this.getView().byId("textclientesolcitante").getText();
			//		var oEntry = {};
			var retorno;
			var oUpdate = {};
			var items = this.getView().getModel("ResumoCarteira").getData();
			var length = items.length;

			oModel.setUseBatch(true);
			var that = this;
			var saldoatp = 0;
			var consumo = 0;
			var backlog = 0;
			var novoatp = 0;
			var brdisponivel = 0;
			var frcst = 0;
			var qtd = 0;

			for (var i = 0; i < length; i++) {

				if (retorno == 1) {
					break;
				}

				oUpdate = {};
				oUpdate.Kunnr = items[i].Kunnr;
				oUpdate.Zuserid = zuserid;
				oUpdate.ZzbrAtpskp = globalSkup;
				novoatp = parseFloat(items[i].SaldoATP);
				backlog = parseFloat(items[i].Backlog);
				consumo = parseFloat(items[i].Consumo);
				brdisponivel = parseFloat(items[i].BrDisponivel);
				frcst = parseFloat(items[i].Frcst);

				//  saldoatp = (consumo - backlog + brdisponivel + novoatp);
				saldoatp = (frcst + novoatp);

				qtd = parseFloat(saldoatp).toFixed(3);
				oUpdate.BrQtdsolicitada = qtd;
				oUpdate.Saldoatpnovo = items[i].SaldoATPnovo;
				oUpdate.Saldoatpantigo = items[i].BrDisponivel;
				oUpdate.Uom = "Ton";

				oModel.create("/remanejasaldoatpSet", oUpdate, {
					method: "POST",
					success: function (oData, response) {
						//var oMessage = JSON.parse(response.headers["sap-message"]);
						//  MessageToast.show("Itens atualizados com sucesso");
						oBusyDialog.close();
						that.chamaSucesso();
						/*	if (response.statusCode == 201) {

								that.chamaSucesso();
							}*/

						retorno = 0;

					}.bind(this),

					error: function (oError) {
						//MessageToast.show(oError);
						var erro = oError;
						erro = erro.response.body;
						var erro2 = JSON.parse(erro);
						var messagem = erro2.error.message.value;
						sap.m.MessageBox.error(messagem, {
							actions: ["OK"],

							onClose: function (sAction) {}

						});
						retorno = 1;
						oBusyDialog.close();
						return retorno;

					}.bind(this),
				});

				oModel.submitChanges({
					success: function (data, response) {
						//To do        
					},
					error: function (e) {
						//To do       
					}
				});

			}

		},

		remanejaCotaMaster: function () {
			var that = this;
			that.chamaSucesso();
     
			// var oModel = this.getView().getModel();

			// var chave = globalSkup;
			// var Key = "/remanejacotamasterSet(ZzbrAtpskp='" + chave + "')";
			// var oEntry = {};
			// var retorno;
			// var that = this;
			// var qtd;
			// var qtdold;

			// if (isNaN(globalMasterNew)) {} else {
			// 	if (globalMasterNew > 0) {
			// 		oEntry = {};
			// 		oEntry.ZzbrAtpskp = globalSkup;
			// 		qtd = globalMasterNew - globalMaster;
			// 		qtd = parseFloat(qtd).toFixed(3);
			// 		qtdold = parseFloat(globalMaster).toFixed(3);
			// 		oEntry.Zquantidade = qtd;
			// 		oEntry.Zquantidadeold = qtdold;

			// 		oModel.update(Key, oEntry, {
			// 			method: "POST",
			// 			success: function (oData, oResponse) {

			// 				that.sucesso();

			// 				// if (oResponse.statusCode == 204) {

			// 				// 	oBusyDialog.close();
			// 				// }

			// 				retorno = 0;
			// 			},
			// 			error: function (oError) {
			// 				var erro = oError;
			// 				erro = erro.responseText;
			// 				var erro2 = JSON.parse(erro);
			// 				var messagem = erro2.error.message.value;
			// 				oBusyDialog.close();
			// 				sap.m.MessageBox.error(messagem, {
			// 					actions: [sap.m.MessageBox.Action.CLOSE],
			// 					onClose: function (sAction) {}
			// 				});
			// 				retorno = 1;
			// 				return retorno;

			// 			}
			// 		});

			// 	} else {
			// 		that.sucesso();
			// 	}
			// }

		},

		_onBindingChange: function () {

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
				sObjectId = oObject.Kunnr,
				sObjectName = oObject.KunnrName,
				oViewModel = this.getModel();

			this.getOwnerComponent().oListSelector.selectAListItem(sPath);

			oViewModel.setProperty("/saveAsTileTitle", oResourceBundle.getText("shareSaveTileAppTitle", [sObjectName]));
			oViewModel.setProperty("/shareOnJamTitle", sObjectName);
			oViewModel.setProperty("/shareSendEmailSubject",
				oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
			oViewModel.setProperty("/shareSendEmailMessage",
				oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));

			this.executaFiltro();
		},

		_bindView: function (sObjectPath, iSkup) {
			// Set busy indicator during view binding
			var oViewModel = this.getModel();
			// If the view was not bound yet its not busy, only if the binding requests data it is set to busy again
			oViewModel.setProperty("/busy", false);

			this.getView().bindElement({
				path: sObjectPath,
				events: {
					change: this._onBindingChange.bind(this, iSkup),
					dataRequested: function () {
						oViewModel.setProperty("/busy", true);
					},
					dataReceived: function () {
						oViewModel.setProperty("/busy", false);
					}
				}
			});
		},

	});

});