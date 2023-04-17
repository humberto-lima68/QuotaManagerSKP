sap.ui.define([
	"exed/com/quotamanagerskp/controller/BaseController", "sap/m/DialogType", "sap/ui/core/ValueState", "sap/m/Dialog", "sap/m/Button",
	"sap/m/ButtonType",
	"sap/m/Text"
], function (BaseController, DialogType, ValueState, Dialog, Button, ButtonType, Text) {
	"use strict";

	var chave = '999999999';
	var kunnr;
	var ZzbrAtpskp;
	var zuserid;
	var oBusyDialog = new sap.m.BusyDialog();

	return BaseController.extend("exed.com.quotamanagerskp.controller.ResumoSolicitar", {

		onInit: function () {
			this.getRouter().getRoute("ResumoSolicitar").attachPatternMatched(this._onObjectMatched, this);
		},

		_onObjectMatched: function (oEvent) {
			// MATCH DE TELA, CARREGANDO INFO DE CAMPOS DO SERVICO DE ORDEM DE VENDA
			kunnr = oEvent.getParameter("arguments").kunnr;
			ZzbrAtpskp = oEvent.getParameter("arguments").ZzbrAtpskp;
			ZzbrAtpskp = JSON.parse(atob(oEvent.getParameter("arguments").ZzbrAtpskp));
			zuserid = oEvent.getParameter("arguments").Zuserid;
			//			this.getView().byId("idTitleDependentes4").setText(  " Resumo " + "(" + zuserid + ")");
			this.bindatela(kunnr, ZzbrAtpskp, zuserid);
		},

		bindatela: function (iKunnr, IzbrAtpskp, izuserid) {
			this.getView().byId("_IDEGen_text0").setText(izuserid);
			this.getModel().metadataLoaded().then(function () {
				var sObjectPath = this.getModel().createKey("cota_gcSet", {
					Kunnr: iKunnr,
					ZzbrAtpskp: IzbrAtpskp,
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
			var ZzbrAtpskp = this.getView().byId("textskp").getText();
		 //   var ZzbrAtpskp = this.getView().byId("oli45").getText();
			this.executaFiltro(ZzbrAtpskp);
		},
		executaFiltro: function (iZzbrAtpskp) {
			var valor = iZzbrAtpskp;
			var filter = new sap.ui.model.Filter("ZzbrAtpskp", sap.ui.model.FilterOperator.EQ, valor);
			var filter1 = new sap.ui.model.Filter("Zuserid", sap.ui.model.FilterOperator.EQ, zuserid);
			var list = this.getView().byId("listResumo");
			list.getBinding("items").filter([filter, filter1]);
		},

		onModelContextChange: function () {
			this.buscaInfoSolicitar();
			this.calculaTotal();
		},

		buscaInfoSolicitar: function () {
			var tabelaResumo = this.getView().byId("listResumo");
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

		onEdit: function () {
			var tabelaResumo = this.getView().byId("listResumo");
			var length = tabelaResumo.getItems().length;
			var id;
			//var idDisponivel;

			for (var i = 0; i < length; i++) {
				id = tabelaResumo.getItems()[i].getCells()[1].getId();
				//idDisponivel = tabelaResumo.getItems()[i].getCells()[1].getId();
				this.getView().byId(id).setEditable(true);
				//this.getView().byId(idDisponivel).setVisible(true);
			}

			this.getView().byId("buttonCancel").setVisible(true);
			this.getView().byId("buttonEdit").setVisible(false);
			this.getView().byId("buttonSave").setVisible(true);
			//this.getView().byId("idColumnSaldo").setVisible(true);

			this.calculaTotal();
		},

		onCancela: function () {
			var tabelaResumo = this.getView().byId("listResumo");
			var length = tabelaResumo.getItems().length;
			var id;
			var idDisponivel;

			for (var i = 0; i < length; i++) {
				id = tabelaResumo.getItems()[i].getCells()[1].getId();
				this.getView().byId(id).setEditable(false);
			}

			this.getView().byId("buttonCancel").setVisible(false);
			this.getView().byId("buttonEdit").setVisible(true);
			this.getView().byId("buttonSave").setVisible(false);
		},

		onCloseDetailPress: function () {
			this.getModel("appView").setProperty("/actionButtonsInfo/midColumn/fullScreen", false);
			// No item should be selected on master after detail page is closed
			this.getOwnerComponent().oListSelector.clearMasterListSelection();
			this.getRouter().navTo("master");
		},

		onPressResumo: function () {
			var test;
			if (!test) {
				/*	this.oInfoMessageDialog = new Dialog({*/
				test = new Dialog({
					type: DialogType.Message,
					//id: "dialogConfirmaResumo3",
					title: "Quota Request",
					showTitle: "false",
					state: ValueState.Information,
					content: new Text({
						text: "Confirm Quota Request ?"
					}),
					beginButton: new Button({
						text: "Cancel",
						//	id: "botaoCancelarDialog3",
						class: "botaoCancelarDialog",
						press: function () {
							/*this.oInfoMessageDialog.close();*/
							test.close();
						}.bind(this)
					}),
					endButton: new Button({
						text: "Confirm",
						//	id: "botaoConfirmarDialog3",
						press: function () {
							/*this.oInfoMessageDialog.close();*/
							test.close();
							oBusyDialog.open(0);
							this.sucesso();
							
						}.bind(this)
					}),
					afterClose: function () {
						//	this.oInfoMessageDialog.close();
						/*	this.oInfoMessageDialog.destroy();*/
						test = "";

					}
				});
			}

			/*this.oInfoMessageDialog.open();*/
			test.open();

		},

		calculaTotal: function () {
			var tabelaResumo = this.getView().byId("listResumo");
			var length = tabelaResumo.getItems().length;
			var total = 0;
			total = parseFloat(total);
			var valor;
			var id;

			for (var i = 0; i < length; i++) {
				id = tabelaResumo.getItems()[i].getCells()[1].getId();
				valor = this.getView().byId(id).getValue();
				valor = parseFloat(valor);

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

		validaConteudo: function () {
			var tabela = this.getView().byId("listResumo");
			var length = tabela.getItems().length;
			var nome;
			var valor;
			var valida;

			for (var i = 0; i < length; i++) {
				nome = tabela.getItems()[i].getCells()[0].getProperty("title");
				valor = tabela.getItems()[i].getCells()[1].getProperty("value");

				if (valor == 0) {
					valida = 0;
				} else {
					valida = 1;
					return valida;
				}

			}

			return valida;

		},

		gravaArray: function () {
			var tabela = this.getView().byId("listResumo");
			var length = tabela.getItems().length;
			var nome;
			var valor;
			var arrayVolume = this.buscarArraySolicitar();
			var lengthArray = arrayVolume.length;
			var nomeArray;
			var valida;
			var sai = 0;
			/*Valida Valores inicio
			 */
			var messagem = " Quantity field is empty !";
			var validaconteudo = this.validaConteudo();
			var saldo;
			var arraySaldo;

			if (validaconteudo == 0) {
				sap.m.MessageBox.error(messagem, {
					actions: ["OK", sap.m.MessageBox.Action.CLOSE],
					onClose: function (sAction) {}

				});
				return;
			}

			/*Valida Valores fim
			 */

			for (var i = 0; i < length; i++) {
				nome = tabela.getItems()[i].getCells()[0].getProperty("title");
				valor = tabela.getItems()[i].getCells()[1].getProperty("value");

				/*Inicio*/
				saldo = tabela.getItems()[i].getCells()[1].getProperty("placeholder");

				arraySaldo = saldo.split(":");
				saldo = arraySaldo[1];
				saldo = saldo.trim();
				saldo = parseFloat(saldo, 2);

				if (valor > saldo) {
					sap.m.MessageBox.error("Saldo menor do que o valor remanejado.", {
						actions: ["OK", sap.m.MessageBox.Action.CLOSE],
						onClose: function (sAction) {}
					});

					tabela.getItems()[i].getCells()[1].setProperty("valueState", "Error");

					return;
				} else {
					tabela.getItems()[i].getCells()[1].setProperty("valueState", "None");
				}

				/*Fim*/

				if (lengthArray !== 0) {

					for (var j = 0; j < lengthArray; j++) {
						nomeArray = arrayVolume[j].nome;
						valida = this.validaNome(nomeArray, nome);
						if (valida === 1) {
							sai = "1";
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
					}
				} else {
					arrayVolume.push({
						nome: nome,
						valor: valor
					});
				}
			}

			this.igualaArraySolicitar(arrayVolume);
		},

		validaNome: function (inomeArray, inome) {
			if (inomeArray === inome) {
				return 1;
			} else {
				return 0;
			}
		},

		sucesso: function () {
			//this.enviaEcc();
			oBusyDialog.close();
			var that = this;
			
			that.getRouter().navTo("SolicitarSucesso", {
				kunnr: kunnr,
				Chave: chave,
				ZzbrAtpskp: btoa(JSON.stringify(ZzbrAtpskp)),
				Zuserid: zuserid
			});

		},

		onVoltar: function () {
			var Kunnr = this.getView().byId("Kunnr").getText();
			var textskup = this.getView().byId("textskup").getText();
			this.getRouter().navTo("Solicitar", {
				kunnr: Kunnr,
				ZzbrAtpskp: btoa(JSON.stringify(textskup)),
				zuserid: zuserid
			}, true);

		},

		enviaEcc: function () {
			var oModel = this.getView().getModel();
			var Key;
			var oEntry = {};
			var retorno;
			var lista = this.getView().byId("listResumo");
			var length = lista.getItems().length;
			var aItems = lista.getItems();
			var that = this;

			for (var i = 0; i < length; i++) {

				if (lista.getItems()[i].getCells()[1].getProperty("value") !== "") {
					Key = "/solicita_cotaSet(Zchave='" + chave + "',Zgcdoador='" + lista.getItems()[i].getCells()[2].getProperty("text") + "')";
					oEntry = {};
					oEntry.ZzbrAtpskp = oModel.getProperty("ZzbrAtpskp", aItems[i].getBindingContext());
					oEntry.Kunn2 = this.getView().byId("Kunn2").getText();
					oEntry.Uom = this.getView().byId("Uom").getText();
					oEntry.BrQtdsolicitada = lista.getItems()[i].getCells()[1].getProperty("value");
					oEntry.Zqtddoada = "";
					oEntry.Status = "S";
					oEntry.Kunn2Name = this.getView().byId("Kunn2Name").getText();
					oEntry.ZgcdoadorName = lista.getItems()[i].getCells()[0].getProperty("title");
					oEntry.NameSkup = "";
					oEntry.Kunnr = this.getView().byId("Kunnr").getText();
					oEntry.BrAtppkt = this.getView().byId("textBrpkt").getText();

					oModel.update(Key, oEntry, {
						success: function (oData, oResponse) {
							if (oResponse.statusCode === 204) {
								if (oResponse.statusCode === 204) {
									oBusyDialog.close();
									that.getRouter().navTo("SolicitarSucesso", {
										kunnr: kunnr,
										Chave: chave,
										ZzbrAtpskp: btoa(JSON.stringify(ZzbrAtpskp)),
										Zuserid: zuserid
									});
								}
							}
						},
						error: function (oError) {
							oBusyDialog.close();
							var erro = oError;
							erro = erro.responseText;
							var erro2 = JSON.parse(erro);
							var messagem = erro2.error.message.value;
							sap.m.MessageBox.error(messagem, {
								actions: ["OK", sap.m.MessageBox.Action.CLOSE],
								onClose: function (sAction) {}
							});
							return;
						}
					});
				}
			}

		}

	});

});