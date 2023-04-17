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
	var globaltotal;
	var globalsoma;

	return BaseController.extend("exed.com.quotamanagerskp.controller.Remanejar", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf mcs.view.Remanejar
		 */
		onInit: function () {

			this.getRouter().getRoute("Remanejar").attachPatternMatched(this._onObjectMatched, this);
			this.oSemanticPage = this.byId("mySemanticPage");
			this.oEditAction = this.byId("editAction");
			this.oSemanticPage.setModel(this.oModel);
		},

		_onObjectMatched: function (oEvent) {
			// MATCH DE TELA, CARREGANDO INFO DE CAMPOS DO SERVICO DE ORDEM DE VENDA

			var skup = JSON.parse(atob(oEvent.getParameter("arguments").Skup));
			skp = JSON.parse(atob(oEvent.getParameter("arguments").Skup));
			zuserid = oEvent.getParameter("arguments").Zuserid;

			//	this.getView().byId("idTitleDependentes").setText(" Saldo de Cota - SKP" + "(" + zuserid + ")");

			this.bindatela(skup, zuserid);

			var sObjectId = JSON.parse(atob(oEvent.getParameter("arguments").Skup));
			var valor = sObjectId;
			var zsaldozero = "X";
			var zoperacao = "5";
			var filter = new sap.ui.model.Filter("ZzbrAtpskp", sap.ui.model.FilterOperator.EQ, valor);
			var filter3 = new sap.ui.model.Filter("Zsaldozero", sap.ui.model.FilterOperator.EQ, zsaldozero);
			var filter4 = new sap.ui.model.Filter("Zuserid", sap.ui.model.FilterOperator.EQ, zuserid);
			var filter5 = new sap.ui.model.Filter("Zoperacao", sap.ui.model.FilterOperator.EQ, zoperacao);

			//		var list = this.getView().byId("list");
			//		list.getBinding("items").filter([filter, filter4, filter3, filter5]);

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
				//	sObjectId = oObject.Kunnr,
				//	sObjectName = oObject.KunnrName,
				oViewModel = this.getModel();

			this.getOwnerComponent().oListSelector.selectAListItem(sPath);

			this.cotamaster();
			this.clearInputList();

		},

		cotamaster: function () {

			var that = this;
			//	var sServiceUrl = "/sap/opu/odata/sap/ZGW_APO_COTA_SRV/";
			// var sServiceUrl = "/here/goes/your/serviceurl/";
			// var oModel = new sap.ui.model.odata.ODataModel(sServiceUrl, true);
			// var aFilters = [];

			// aFilters.push(new sap.ui.model.Filter("ZzbrAtpskp", sap.ui.model.FilterOperator.EQ, skp));

			// var key = this.getModel().createKey("cotamasterskpSet", {
			// 	Zuserid: zuserid,
			// 	ZzbrAtpskp: skp
			// });

			// //var key = "/cotamasterskpSet" + "(Zuserid='" + zuserid + "',ZzbrAtpskp='" + skp + "')";

			// var parametro = {
			// 	filters: aFilters,
			// 	success: function (oData, oResponse) {
			// 		that.byId("oli43").setNumber(oData.Brdisponivel);
			// 		that.byId("oli44").setNumber(oData.Brmaster);
			// 		that.byId("oli45").setNumber(oData.Brquota);
			// 		that.byId("oli46").setNumber(oData.Brdisponivel);
			// 		that.byId("oli48").setNumber(oData.Brquota);
			// 		that.byId("qtdeMst").setValue("");
			// 	},
			// 	error: function (oError) {}
			// };

			//		 oModel.read(key, parametro);

			//**/ Carrega Modelo Shipment 
			var olist4 = new sap.ui.model.json.JSONModel();
			var slist4 = "/here/goes/your/serviceurl/cotamasterskpSet/?$filter=Zuserid eq '" + zuserid + "' and ZzbrAtpskp eq '" + skp + "' ";
			olist4.loadData(slist4, null, false, "GET", false, false, null);
			var rlist4 = olist4.oData.d.results;

			for (var i = 0; i < rlist4.length; i++) {
				that.byId("oli43").setText(rlist4[i].Brdisponivel);
				that.byId("oli44").setText(rlist4[i].Brmaster);
				that.byId("oli45").setText(rlist4[i].Brquota);
				that.byId("oli46").setText(rlist4[i].Brdisponivel);
				that.byId("oli48").setText(rlist4[i].Brquota);
				that.byId("_IDEGen_text0").setText(rlist4[i].Zuserid);
				that.byId("qtdeMst").setText(rlist4[i].Brmaster);
                this.getView().byId("oli49").setProperty("state", "None");
				this.getView().byId("oli49").setProperty("text", "");
				this.getView().byId("oli49").setProperty("icon", "");
			}

		},

		formatterNum: function (num) {
			return (1);
		},

		clearInputList: function () {
			var table = this.getView().byId("list");
			var length = table.getItems().length;
			for (var i = 0; i < length; i++) {

				table.getItems()[i].getCells()[3].setValue("");
			}
		},

		getSaldo: function () {
			var table = this.getView().byId("list");
			var length;
			var cmaster = 0;
			cmaster = parseFloat(cmaster, 3);
			var master = 0;
			master = parseFloat(master,3);
			var atp = 0;
			atp = parseFloat(atp,3);
			var valor;
			valor = parseFloat(valor,3);
			var chg = 0;
			chg = parseFloat(chg);
			var total = 0;
			total = parseFloat(total);

			// var list4 = this.getView().byId("list4");
			// length = list4.getItems().length;
			// for (var x = 0; x < length; x++) {
			// 	if (x === 1) {
			// 		master = list4.getItems()[1].getContent()[0].getProperty("value");
			// 		master = parseFloat(master);
			// 	}

			// }

			master = this.getView().byId("qtdeMst").getText();

			// var list3 = this.getView().byId("list3");
			// length = list3.getItems().length;
			// for (var y = 0; y < length; y++) {
			// 	if (y === 2) {
			// 		total = list3.getItems()[y].getProperty("number");
			// 	}
			// 	if (y === 1) {
			// 		cmaster = list3.getItems()[y].getProperty("number");
			// 	}
			// }

			cmaster = this.getView().byId("oli44").getText();
			total = this.getView().byId("oli45").getText();

			var valor1 = 0;
			valor1 = parseFloat(valor1, 3);
			length = table.getItems().length;
			for (var i = 0; i < length; i++) {
				valor1 = table.getItems()[i].getCells()[2].getProperty("text");
				//chg = table.getItems()[i].getCells()[3].getProperty("value");
				chg = table.getItems()[i].getCells()[3]._getInputValue();
				//	valor1 = parseFloat(valor1).toFixed(3);
				chg = parseFloat(chg, 3);

				if (isNaN(chg)) {
					chg = 0;
					parseFloat(chg, 3);
				}
				valor1 = valor1.replace(",", ".");
				valor1 = parseFloat(valor1,3) ;
				atp = atp + valor1 + chg;

			}
			return [atp, master, total, cmaster];
		},

		validaConteudo: function () {
			var tabela = this.getView().byId("list");
			var length = tabela.getItems().length;
			var nome;
			var valor;
			var atp;
			var valida;

			for (var i = 0; i < length; i++) {
				nome = tabela.getItems()[i].getCells()[0].getProperty("text");
				valor = tabela.getItems()[i].getCells()[3].getProperty("value");
				atp = tabela.getItems()[i].getCells()[2].getProperty("text");
				atp = parseFloat(atp, 2);
				valor = parseFloat(valor, 2);

				if (valor > atp) {
					valida = 1;
				}

				if (isNaN(valor) || valor == 0) {
					valida = 0;

				} else {
					valida = 1;
					return valida;
				}

			}

			return valida;

		},

		handleLineItemPress: function (oEvent) {

			var kunnr = oEvent.getSource().getBindingContext().getProperty("Kunnr")
			var textskp = oEvent.getSource().getBindingContext().getProperty("ZzbrAtpskp")

			this.getRouter().navTo("Solicitar", {
				kunnr: kunnr,
				//	ZzbrAtpskp: btoa(JSON.stringify(textskp)),
				ZzbrAtpskp: textskp,
				zuserid: zuserid
			}, true);

		},

		onLiveChange: function (oValue) {

			var newValue = oValue.mParameters.value;
			var id = oValue.mParameters.id;

			while (newValue.indexOf(",") !== -1) {
				newValue = newValue.replace(",", ".");
			}

			var num = isNaN(newValue);
			if (num === true) {
				this.getView().byId("oli49").setProperty("state", "Error");
				this.getView().byId("oli49").setProperty("text", "Wrong Balance");
				this.getView().byId("oli49").setProperty("icon", "sap-icon://error");
			} else {
				this.getView().byId("oli49").setProperty("state", "None");
				this.getView().byId("oli49").setProperty("text", "");
				this.getView().byId("oli49").setProperty("icon", "");
			}

			var soma = 0;
			var total = 0;
			var atp = 0;
			var master = 0;
			var cmaster = 0;
			var vr = [];

			vr = this.getSaldo();
			master = parseFloat(vr[1]);
			atp = parseFloat(vr[0]);
			soma = parseFloat(vr[2]);
			cmaster = parseFloat(vr[3]);

			if (isNaN(master) || master == 0) {
				master = 0;
			}

			if (isNaN(cmaster) || cmaster == 0) {
				cmaster = 0;
			}

			newValue = parseFloat(newValue,3); 
			total = ( master + atp );

			this.getView().byId("oli46").setText(parseFloat(atp).toFixed(3));
			this.getView().byId("oli48").setText(parseFloat(total).toFixed(3));

			if (soma != total) {

				this.getView().byId("oli49").setProperty("state", "Error");
				this.getView().byId("oli49").setProperty("text", "Wrong Balance");
				this.getView().byId("oli49").setProperty("icon", "sap-icon://error");
			} else {

				this.getView().byId("oli49").setProperty("state", "None");
				this.getView().byId("oli49").setProperty("text", "");
				this.getView().byId("oli49").setProperty("icon", "");
			}

		},

		onLiveChange1: function (oValue) {
			/* var tabela = this.getView();*/
			var newValue = oValue.mParameters.value;
			var id = oValue.mParameters.id;

			while (newValue.indexOf(",") !== -1) {
				newValue = newValue.replace(",", ".");
			}

			var num = isNaN(newValue);
			if (num === true) {

				//oValue.oSource.setValueState(sap.ui.core.ValueState.Error);
				this.byId(id).setValueState("Error");
			} else {
				//oValue.oSource.setValueState(sap.ui.core.ValueState.None);
				this.byId(id).setValueState("None");
				this.byId(id).setValue(newValue);
				this.ValorDigitado = newValue;
			}

			var soma = 0;
			var total = 0;
			var atp = 0;
			var master = 0;
			var cmaster = 0;

			var vr = [];

			vr = this.getSaldo();
			master = parseFloat(vr[1]);
			atp = parseFloat(vr[0]);
			soma = parseFloat(vr[2]);
			cmaster = parseFloat(vr[3]);

			if (isNaN(master) || master == 0) {
				master = 0;
			}

			if (isNaN(cmaster) || cmaster == 0) {
				cmaster = 0;
			}

			total = (cmaster + master + atp);

			this.byId("oli46").setNumber(parseFloat(atp).toFixed(3));
			this.byId("oli48").setNumber(parseFloat(total).toFixed(3));

			if (soma != total) {
				this.getView().byId("oli49").setProperty("state", "Error");
				this.getView().byId("oli49").setProperty("text", "Wrong Balance");
				this.getView().byId("oli49").setProperty("icon", "sap-icon://error");
			} else {
				this.getView().byId("oli49").setProperty("state", "None");
				this.getView().byId("oli49").setProperty("text", "");
				this.getView().byId("oli49").setProperty("icon", "");
			}

		},

		onPressResumocarteira: function () {

			var tabela = this.getView().byId("list");
			var length = tabela.getItems().length;
			var nome;
			var code;
			var valor;
			var arrayVolume = this.buscarArrayVolume();
			var lengthArray = arrayVolume.length;
			var nomeArray;
			var valida;
			var sai = 0;
			var messagem = " Campo quantidade está vázio !";
			var messagemError = "Entrada inválida";
			var messageCMaster = "Quantidade negativo na Cota Master";
			var validaconteudo = this.validaConteudo();
			var saldo;
			var atpnovo;
			var brdisponivel;
			var backlog;
			var arraySaldo;
			var vError;
			var consumo;
			var frcst;

			arrayVolume.pop();
			lengthArray = 0;

			/* Cota master negativo*/

			if (parseFloat(this.getView().byId("qtdeMst").getText()).toFixed(3) < 0) {
				sap.m.MessageBox.error(messageCMaster, {
					actions: [sap.m.MessageBox.Action.CLOSE],
					onClose: function (sAction) {}

				});
				return;
			}

			if (validaconteudo == 0) {
				sap.m.MessageBox.error(messagem, {
					actions: [sap.m.MessageBox.Action.CLOSE],
					onClose: function (sAction) {}

				});
				return;
			}

			if (length == 0) {
				sap.m.MessageBox.error("Não há clientes para remanejar", {
					actions: [sap.m.MessageBox.Action.CLOSE],
					onClose: function (sAction) {}
				});
				return;
			}

			arrayVolume = [];
			var oModel = new JSONModel();

			var oArrayRemessaMassa = [];

			for (var i = 0; i < length; i++) {

				var oDataRemessaMassa = {
					KunnrName: "",
					Kunnr: "",
					BrDisponivel: 0,
					SaldoATP: 0,
					SaldoATPnovo: 0,
					Consumo: 0,
					Frcst: 0,
					Backlog: 0,
					BindingContext: {}
				};

				nome = tabela.getItems()[i].getCells()[0].getProperty("text");
				code = tabela.getItems()[i].getCells()[0].getProperty("title");
				valor = tabela.getItems()[i].getCells()[3].getProperty("value");
				//	vError = tabela.getItems()[i].getCells()[5].getProperty("valueState");
				saldo = tabela.getItems()[i].getCells()[2].getProperty("text");
				//		consumo = tabela.getItems()[i].getCells()[7].getProperty("text");
				//			frcst = tabela.getItems()[i].getCells()[6].getProperty("text");
						brdisponivel = tabela.getItems()[i].getCells()[2].getProperty("text");
				//				backlog = tabela.getItems()[i].getCells()[8].getProperty("text");
				atpnovo = (parseFloat(brdisponivel) + parseFloat(valor));
				atpnovo = parseFloat(atpnovo).toFixed(3);
				/*	arraySaldo = saldo.split(":");
					saldo = arraySaldo[1];
					saldo = saldo.trim();*/
				saldo = parseFloat(saldo, 2);
				frcst = parseFloat(frcst);
				consumo = parseFloat(consumo);

				if (vError == "Error") {
					sap.m.MessageBox.error(messagemError, {
						actions: [sap.m.MessageBox.Action.CLOSE],
						onClose: function (sAction) {}
					});
					return;
				}

				// Valor zero Total - 
				globalsoma = parseFloat(this.getView().byId("oli45").getText());
				globaltotal = parseFloat(this.getView().byId("oli48").getText());

				if (globalsoma != globaltotal) {
					sap.m.MessageBox.error("A soma total diferente ( " + parseFloat(globalsoma).toFixed(3) + " <> " + parseFloat(globaltotal).toFixed(
						3) + " )", {
						actions: [sap.m.MessageBox.Action.CLOSE],
						onClose: function (sAction) {}
					});

					this.getView().byId("oli49").setProperty("state", "Error");;

					return;
				} else {
					this.getView().byId("oli49").setProperty("state", "None");
				}

				//  Valor zero

				valor = parseFloat(valor).toFixed(3);
				brdisponivel = parseFloat(brdisponivel, 3);
				var validaATP = 0;
				//	var valorreal = valor * -1;
				if (!isNaN(valor)) {
					valor = parseFloat(valor, 3);
					validaATP = parseFloat(validaATP, 3);
					validaATP = (brdisponivel + valor);
					if (validaATP < 0.000) {
						sap.m.MessageBox.error("Saldo ATP menor do que o valor remanejado.", {
							actions: [sap.m.MessageBox.Action.CLOSE],
							onClose: function (sAction) {}
						});

						//		tabela.getItems()[i].getCells()[4].setProperty("valueState", "Error");

						return;
					} else {
						//		tabela.getItems()[i].getCells()[4].setProperty("valueState", "None");
					}
				}

				/*if (valor === "0" || valor === "0.00" || valor === "0.000" || valor === "0.0" || valor === "0." || valor === ".0" || valor ===
					"-0" || valor < 0) {
					sap.m.MessageBox.error("Informe um valor maior que zero !", {
						actions: [sap.m.MessageBox.Action.CLOSE],
						onClose: function (sAction) {}
					});

					tabela.getItems()[i].getCells()[5].setProperty("valueState", "Error");

					return;
				} else {
					tabela.getItems()[i].getCells()[5].setProperty("valueState", "None");
				}*/

				if (lengthArray !== 0) {

					for (var j = 0; j < lengthArray; j++) {
						nomeArray = arrayVolume[j].nome;
						valida = this.validaNome(nomeArray, nome);
						if (valida === 1) {
							sai = "1";
						}
					}
					if (sai === 0) {
						if (valor !== "NaN") {
							arrayVolume.push({
								nome: nome,
								code: code,
								valor: valor,
								frcst: frcst,
								consumo: consumo,
								backlog: backlog
							});

							oDataRemessaMassa.KunnrName = nome;
							oDataRemessaMassa.Kunnr = code;
							oDataRemessaMassa.BrDisponivel = parseFloat(brdisponivel).toFixed(3);
							oDataRemessaMassa.SaldoATP = parseFloat(valor).toFixed(3);
							oDataRemessaMassa.SaldoATPnovo = atpnovo;
							oDataRemessaMassa.Consumo = consumo;
							oDataRemessaMassa.Frcst = frcst;
							oDataRemessaMassa.Backlog = backlog;
							oArrayRemessaMassa.push(oDataRemessaMassa);
						}
					} else {
						for (var K = 0; K < lengthArray; K++) {
							nomeArray = arrayVolume[K].nome;
							if (nomeArray === nome) {
								arrayVolume[K].valor = valor;
							}
						}
					}
				} else {
					if (valor !== "NaN") {
						arrayVolume.push({
							nome: nome,
							code: code,
							valor: valor,
							frcst: frcst,
							consumo: consumo
						});

						oDataRemessaMassa.KunnrName = nome;
						oDataRemessaMassa.Kunnr = code;
						oDataRemessaMassa.BrDisponivel = parseFloat(brdisponivel).toFixed(3);
						oDataRemessaMassa.SaldoATP = parseFloat(valor).toFixed(3);
						oDataRemessaMassa.SaldoATPnovo = atpnovo;
						oDataRemessaMassa.Consumo = consumo;
						oDataRemessaMassa.Frcst = frcst;
						oDataRemessaMassa.Backlog = backlog;
						oArrayRemessaMassa.push(oDataRemessaMassa);
					}
				}
			}

			// Cota Master			
			var cotaMaster = [];
			cotaMaster = this.getSaldo();
			var Master = cotaMaster[3];
			var MasterNew = 0;
			MasterNew = parseFloat(cotaMaster[1]).toFixed(3);
			var masteratual;
			masteratual = parseFloat(cotaMaster[3]) + parseFloat(cotaMaster[1]);
			this.igualaArrayVolume(arrayVolume);

			var skup = skp; // this.getView().byId("textskup").getText();

			oModel.setData(oArrayRemessaMassa);
			sap.ui.getCore().setModel(oModel, "ResumoCarteira");

			this.getRouter().navTo("ResumoCarteira", {
				Skup: btoa(JSON.stringify(skup)),
				Zuserid: zuserid,
				BrMaster: Master,
				BrMasterNew: parseFloat(masteratual).toFixed(3)
			}, true);
		},

		validaNome: function (inomeArray, inome) {
			if (inomeArray === inome) {
				return 1;
			} else {
				return 0;
			}
		},

		onEdit: function () {
			this.showFooter(true);
			this.oEditAction.setVisible(false);
		},

		showFooter: function (bShow) {
			this.oSemanticPage.setShowFooter(bShow);
		},

		onCloseDetailPress: function () {
			this.getModel("appView").setProperty("/actionButtonsInfo/midColumn/fullScreen", false);
			// No item should be selected on master after detail page is closed
			this.getOwnerComponent().oListSelector.clearMasterListSelection();
			this.getRouter().navTo("master");
		},

		onSearch: function (oEvent) {
			var valor = oEvent.getParameter("query");
			var skup =  skp ; //this.getView().byId("textskup").getText();

			var zsaldozero = "X";
			var zoperacao = "5";

			if (valor) {
				var filter2 = new sap.ui.model.Filter("ZzbrAtpskp", sap.ui.model.FilterOperator.EQ, skup);
				var filter = new sap.ui.model.Filter("Zsearch", sap.ui.model.FilterOperator.EQ, valor);
				var filter3 = new sap.ui.model.Filter("Zuserid", sap.ui.model.FilterOperator.EQ, zuserid);
				var filter4 = new sap.ui.model.Filter("Zoperacao", sap.ui.model.FilterOperator.EQ, zoperacao);
				var filter5 = new sap.ui.model.Filter("Zsaldozero", sap.ui.model.FilterOperator.EQ, zsaldozero);
				var list = this.getView().byId("list");
				list.getBinding("items").filter([filter, filter2, filter3, filter4, filter5]);
			} else {
				this.executaFiltro(skup, zuserid);
			}
		},

		executaFiltro: function (iSkup, izuserid) {
			var valor = iSkup;
			var filter = new sap.ui.model.Filter("ZzbrAtpskp", sap.ui.model.FilterOperator.EQ, valor);
			var filter1 = new sap.ui.model.Filter("Zuserid", sap.ui.model.FilterOperator.EQ, izuserid);
			var list = this.getView().byId("list");
			list.getBinding("items").filter([filter, filter1]);

		},

		onVoltar: function () {
			this.getRouter().navTo("object", {
				objectId: zuserid
			}, true);
		}

	});

});