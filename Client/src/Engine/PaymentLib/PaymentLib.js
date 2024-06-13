// var PaymentConfig = PaymentConfig || {}
// var PaymentUI = PaymentUI || {}

if (Object.keys(PaymentConfig).length == 0) throw new Error(" Cannot load PaymentConfig ");
if (Object.keys(PaymentUI).length == 0) throw new Error("Cannot load PaymentUI");

/**
 * Payment Global Library
 * @namespace PaymentLib
 */
var PaymentLib = {
    __VERSION__: "1.1.240304",

    loading_config: {
        channelConfig: false,
        bankList: false,
        latamCCApi: false
    },

    isProcessing: false,

    /**
     * a list of Payment Channel Configurations for a configured ProductID in the configured country, obtained from the 'GetChannelList' API.
     * @type {Object.<number, ChannelConfig>}
     * @memberof PaymentLib
     */
    channelConfigs: {},

    /**
     * a list of Payment Channel Group Configurations associated with Channel Configurations, obtained from the 'GetChannelList' API.
     * @type {Object.<number, GroupConfig>}
     * @memberof PaymentLib
     */
    channelGroupConfigs:{},

    /**
     * List of BankCode in VN (channel 1006)
     * @type {string[]}
     * @memberof PaymentLib
     */
    bankList: [],

    latamCreditCardConfig: {
        apiHost: "https://sandbox.ebanxpay.com", // qc
        apiKey: "test_pk_TyVqi8gjtrYLbdo-lDxJYQ",
        apiEndpoint: {
            get_token: '/ws/token',
            set_cvv: '/ws/token/setcvv'
        },
        listCreditcardCode: {
            ar: ["visa", "master", "amex", "diners", "elo", "hiper", "discover", "caixa","naranja","cabal"],
            br: ["visa", "master", "amex", "diners", "elo", "hiper", "discover"],
            mx: ["visa", "master", "amex", "diners", "elo", "hiper", "discover", "carnet"],
            co: ["visa", "master", "amex", "diners", "elo", "hiper", "discover"],
        }
    },

    CONSTANT: {
        endpoint: {
            get_payment_list: 'v1/products/payment/info',
            create_transaction: 'v1/transactions/create',
            verify_otp: 'v1/transactions/verifyOtp',
            get_list_bankcode: 'v1/products/payment/bankcode',
            get_latam_cc_api_config: 'v1/products/payment/latam_cc_api/info',
            simulate_finish: 'v1/transactions/simulateFinish'
        },
    
        api_url: {
            get_vn_bank_list: 'https://mobile.pay.zing.vn/zmpapi/banklistall?pmcID=51',
        },
    
        transaction_payload: {
            product_code:   { type: 'number', maxLength: 32, required: true },
            username:       { type: 'string', maxLength: 32, required: true },
            uid:            { type: 'number', maxLength: 32, required: true },
            amount:         { type: 'number', maxLength: 32, required: true },
            channel_code:   { type: 'number', maxLength: 32, required: true },
            country_code:   { type: 'string', maxLength: 8, required: true },
            currency:       { type: 'string', maxLength: 8 },
            user_ip:        { type: 'string', maxLength: 32 },
            client_ip:      { type: 'string', maxLength: 32 },
            order_description: { type: 'string', maxLength: 512 },
            embed_data:     { type: 'string', maxLength: 512, required: true },
            redirect_url:   { type: 'string', maxLength: 512 },
            callback_url:   { type: 'string', maxLength: 512 },
            user_info:      { type: 'string', maxLength: 512 },
            offer_code:     { type: 'string', maxLength: 50 },
            add_info:       { type: 'string', maxLength: 512 },
            platform:       { type: 'number', maxLength: 32, required: true }
        },

        PMC_RESPONSE_STATUS: {
            SUCCESS: 1,
            PROCESSING: 0,
            BINDING_PROCESSING: 2,
            INVALID_TOKEN: -1,
            INVALID_CONFIG: -2,
            INVALID_REQUEST_DATA: -3,
            DUPLICATED_TRANS_ID: -4,
            INACTIVED_CHANNEL: -5,
            CONNECTION_ERROR: -10,
            INVALID_CHANNEL_CODE: -11,
            COUNTRY_NOT_SUPPORT: -12,
            INVALID_AMOUNT: -13,
            INVALID_PHONE_NUMBER: -14,
            REQUEST_TIMEOUT: -15,
            INVALID_OTP: -20,
            UNAVAILABLE_PHONE_NUMBER: -21,
            EXCEEDED_PAYMENT_LIMIT: -22,
            INVALID_CREDIT_CARD_INFO: -23,
            INSUFFICIENT_BALANCE: -24,
            INVALID_GIFT_CARD: -25,
            USED_GIFT_CARD: -26,
            INACTIVED_BANK: -27,
            INTERNAL_SERVER_ERROR: -99,
            FAIL: -100,
        },
    
        ZORDER_BASE_UI: 10000,
        MAX_VERIFY_OTP_ATTEMPT: 3,

    },

    /**
     * Initialize Payment (Call this function once when the game starts):
     * - Send a `get_payment_list` API request to retrieve the List of Payment Channels.
     * - Send a `get_list_bankcode` API request to retrieve the List of VN Bankcodes (Optional; can be disabled or hardcode if PaymentUI is not used).
     * - Send a `get_latam_cc_api_config` API request to retrieve the Latam CreditCard API Config (flow 6) (Optional; can be hard-coded).
     */
    init: function(){
        this.requestGetPaymentList(function(){
            // 2023-12-05: bankListAPI, LatamCreditCardAPI are optional.
            this.loading_config.latamCCApi = true;
            this.loading_config.bankList = true;
            if (PaymentConfig.country == 'vn'){
                // this.loading_config.latamCCApi = true;
                this.requestGetVNBankList();
            } else if (['ar', 'br', 'co', 'mx'].indexOf(PaymentConfig.country.toLowerCase().trim()) > -1){
                // this.loading_config.bankList = true;
                this.requestGetLatamCreditCardConfig();
            } else{
                // this.loading_config.latamCCApi = true;
                // this.loading_config.bankList = true;
            }
        }.bind(this));

    },

    //#region UI Function

    /**
     * Displays the Payment Channel of the Group Channel Selection UI.
     * @method displayPaymentGroupSelection
     * @memberof PaymentLib
     * @toc PaymentLib.displayPaymentGroupSelection
     * @param {String|Number} groupName - The name or ID of the payment group to be displayed.
     * @param {SelectPMChannelCallback} callback callback function
     * @param {boolean} [showDisabledChannel=false] A flag to show disabled payment channels (default is false).
     */
    displayPaymentGroupSelection: function(groupName, callback, showDisabledChannel){
        var listChannel = [];
        if(PaymentLib.channelGroupConfigs[groupName]) listChannel = PaymentLib.channelGroupConfigs[groupName].list_channel
        else{
            for (var id in PaymentLib.channelGroupConfigs) {
                var groupConfig = PaymentLib.channelGroupConfigs[id];
                if (groupConfig.name == groupName){
                    listChannel = groupConfig.list_channel;
                    break;
                }
            }
        }
        
        return PaymentLib.displayPaymentChannelSelection(listChannel, callback, showDisabledChannel);
    },

    /**
     *  Displays the Payment Channel Selection UI.
     * @method displayPaymentChannelSelection
     * @memberof PaymentLib
     * @toc PaymentLib.displayPaymentChannelSelection
     * @param {number[]} listChannel a list of Payment Channel ID
     * @param {SelectPMChannelCallback} callback callback function
     * @param {boolean} [showDisabledChannel=false] A flag to show disabled payment channels (default is false).
     */
    displayPaymentChannelSelection: function(listChannel, callback, showDisabledChannel){
        listChannel = listChannel || []
        var listActivedChannel = []

        for (var index = 0; index < listChannel.length; index++) {
            var channel_code = listChannel[index];
            if (PaymentLib.channelConfigs[channel_code]){
                if (showDisabledChannel || PaymentLib.channelConfigs[channel_code].channel_status == 1)
                    listActivedChannel.push(channel_code)
            }
        }

        listActivedChannel = PaymentLib.__arrayUnique(listActivedChannel)

        PaymentUI.showPaymentChannelSelection(listActivedChannel, callback)
    },

    /**
     * Creates a Payment Transaction and displays a UI for the user to input any required user data if it is missing.
     * @param {string} userName - user name
     * @param {int} uid - user id
     * @param {int} amount - amount
     * @param {int} channelCode - payment channel code
     * @param {string} embedData - Product customization data used for verification when a transaction succeeds in order to prevent fraudulent
     * @param {object} [options] - optional data 
     * @param {string} [options.orderDescription] - the order description will be displayed during the payment process if supported by the partner.
     * @param {object} [options.userData] - Object contains required user data related to Payment Channel Code.
     * @param {string} [options.redirectURL] - URL to which the user will be redirected in case of payment fail or succeed.
     * @param {string} [options.callbackURL] - An optional callback URL for notifying payment status in case of payment succeed. If not provided, the default callback URL will be used.
     * @param {string} [options.offerCode] - unusage.
     * @param {string} [options.addInfo] - Additional information, unusage.
     * @param {string} [options.userIP] - user's IP address.
     * @param {string} [options.clientIP] - game client address.
     * @param {PMTransAPICallback} callback - callback function
     * @returns {void}
     */
    makePayment: function(userName, uid, amount, channelCode, embedData, options, callback){
        if (!PaymentLib.startProcessing()) return;

        var config = PaymentLib.channelConfigs[channelCode];          
        PaymentLib.log("MakePayment - ChannelConfig", channelCode, config);

        var required_user_info = config.user_info || [];
        var needed_user_info = [];
        var userData = options.userData || {}
        if (typeof userData == 'string') userData = JSON.parse(userData)
        for (var index = 0; index < required_user_info.length; index++) {
            if(!userData[required_user_info[index]]){
                needed_user_info.push(required_user_info[index]);
            }
        }

        if (needed_user_info.length == 0){
            return PaymentLib.requestCreateTransaction(userName, uid, amount, channelCode, embedData, options, callback)
        }

        if (!PaymentConfig.usePaymentUI){
            PaymentLib.log("Missing options.userData: " + needed_user_info.join(", "))
            PaymentLib.finishProcessing()
            return false;
        }

        switch (config.payment_flow) {
            case 1:
                if (needed_user_info.indexOf('phone_number') > -1){
                    PaymentLib.__showInputPhoneNumber(userName, uid, amount, channelCode, embedData, options, callback);
                }
                break;
            case 2:
                if (needed_user_info.indexOf('bank_code') > -1){

                    PaymentUI.showBankSelection(PaymentLib.bankList, function(action, bankCode){
                        PaymentLib.startProcessing();
                        PaymentUI.UIPaymentSelectBank.hideGui();
                        if (action=="OK"){
                            userData['bank_code'] = bankCode;
                            options.userData = JSON.stringify(userData);
                            return PaymentLib.requestCreateTransaction(userName, uid, amount, channelCode, embedData, options, callback)
                        }
                    });
                }
                break;
            case 3:
                if (needed_user_info.indexOf('phone_number') > -1){
                    PaymentLib.__showInputPhoneNumber(userName, uid, amount, channelCode, embedData, options, callback);
                }
                break;
            case 4:
                if (needed_user_info.indexOf('phone_number') > -1){
                    PaymentLib.__showInputPhoneNumber(userName, uid, amount, channelCode, embedData, options, callback);
                }
                break;
            case 5:
                PaymentUI.showGiftCardForm(needed_user_info, function(action, cardData){
                    if (action=="OK"){
                        if (!cardData.card_no || (needed_user_info.length > 1 && !cardData.pin_code)){
                            PaymentLib.log("Error: CardNo or PinCode must be not empty");
                            return;
                        }
                        PaymentLib.startProcessing();
                        userData['card_no'] = userData['card_no'] || cardData.card_no;
                        userData['pin_code'] = userData['pin_code'] || cardData.pin_code || "";
                        options.userData = JSON.stringify(userData);
                        return PaymentLib.requestCreateTransaction(userName, uid, amount, channelCode, embedData, options, callback)
                    }
                });
                break;
            case 6:
                if (userData.card_no){
                    PaymentLib.showInputUserInfo(needed_user_info, userName, uid, amount, channelCode, embedData, options, callback);
                } else {
                    PaymentLib.makeLatamCreditCardPayment(function(token){
                        PaymentUI.hideInputCreditCard();
                        PaymentUI.hideInputCreditCardCVV();
                        userData.card_no = token;
                        options.userData = userData;
                        PaymentLib.showInputUserInfo(needed_user_info, userName, uid, amount, channelCode, embedData, options, callback)
                    });
                }
                break;
            case 7:
                PaymentLib.showInputUserInfo(needed_user_info, userName, uid, amount, channelCode, embedData, options, callback)
                // var defaultValue = {};
                // for (var index = 0; index < needed_user_info.length; index++) {
                //     var fieldName = needed_user_info[index];
                //     var localCacheKey = "globalpayment_cache_"+channelCode+"_"+fieldName;
                //     defaultValue[fieldName] = PaymentLib.UserData.getStringFromKey(localCacheKey, "");
                // }

                // if (needed_user_info.length == 1 && needed_user_info[0] == 'phone_number'){
                //     showInputPhoneNumber(userName, uid, amount, channelCode, embedData, options, callback);
                //     break;
                // }

                // PaymentUI.showInputUserInfo(needed_user_info, defaultValue, function(action, inputData){
                //     for (var index = 0; index < needed_user_info.length; index++) {
                //         var fieldName = needed_user_info[index];
                //         var localCacheKey = "globalpayment_cache_"+channelCode+"_"+fieldName;
                //         if (inputData[fieldName]){
                //             PaymentLib.UserData.setStringFromKey(localCacheKey, inputData[fieldName]);
                //             userData[fieldName] = inputData[fieldName]
                //         } else {
                //             PaymentLib.log("MakePaymentFail: " + fieldName + " must be not empty.");
                //         }
                //     }
                //     PaymentLib.startProcessing();

                //     options.userData = JSON.stringify(userData);
                //     return PaymentLib.requestCreateTransaction(userName, uid, amount, channelCode, embedData, options, callback)
                // })
                break;
            default:
                PaymentLib.log("Unhandle UserData: ",channelCode, needed_user_info);
                break;
        }
        PaymentLib.finishProcessing()
    },

    showInputUserInfo: function(requiredUserInfo, userName, uid, amount, channelCode, embedData, options, callback){
        if (requiredUserInfo.length == 0) return PaymentLib.requestCreateTransaction(userName, uid, amount, channelCode, embedData, options, callback);

        PaymentUI.showInputUserInfo(requiredUserInfo, {}, function(action, userInfo){
            if (action != "OK") return;
            var userData = options.userData || {}
            if (typeof userData == 'string') userData = JSON.parse(userData)
            for (var name in userInfo){
                userData[name] = userInfo[name];
            }
            options.userData = JSON.stringify(userData);
            PaymentLib.log(options)
            PaymentUI.showProcessingUI();
            return PaymentLib.requestCreateTransaction(userName, uid, amount, channelCode, embedData, options, callback)
        })
    },

    makeLatamCreditCardPayment: function(callback){
        var listCard = PaymentLib.latamCreditCardConfig.listCreditcardCode[PaymentConfig.country];
        PaymentUI.showCreditCardSelection(listCard, function(action, cardType){
            if (action != "OK") return;
            if (listCard.indexOf(cardType) == -1) {
                PaymentLib.log("Invalid creditcard "+cardType);
                return;
            }

            var maskedCardNo = PaymentLib.UserData.getStringWithCrypt('globalpayment_cache_ebanx_'+cardType+"_masked_card_number", null);
            var cardToken = PaymentLib.UserData.getStringWithCrypt('globalpayment_cache_ebanx_'+cardType+"_token", null);
            if (!maskedCardNo || !cardToken){
                return PaymentLib.flowNewLatamCreditCard(cardType, callback);
            } else {
                return PaymentLib.flowRepayLatamCreditCard(cardType, maskedCardNo, cardToken, callback);
            }
        })
    },

    flowNewLatamCreditCard: function(cardType, callback){
        PaymentUI.showInputCreditCard(cardType, function(action, cardInfo){
            if (action != "OK") return;
            PaymentUI.showProcessingUI();
            // Request creditcard token
            PaymentLib.requestGetLatamCreditCardToken(cardType, cardInfo, function(response, request){
                PaymentUI.hideProcessingUI();
                if (!response){
                    PaymentUI.showMessageBox("ERROR", PaymentLib.getLocalize("ACTION_FAILED"))
                    return false;
                }
                if (response.status != "SUCCESS"){
                    PaymentLib.log("GetLatamCreditCardToken Fail", response);
                    PaymentUI.showMessageBox("ERROR", response.status_message)
                    return false;
                }
                var creditCardType = response.payment_type_code;
        
                // Save masked_card_number and card_token
                PaymentLib.UserData.setStringWithCrypt('globalpayment_cache_ebanx_'+creditCardType+"_masked_card_number", response.masked_card_number);
                PaymentLib.UserData.setStringWithCrypt('globalpayment_cache_ebanx_'+creditCardType+"_token", response.token);
                PaymentUI.showProcessingUI();
                PaymentLib.requestSetLatamCreditCardCVV(response.token, request.creditcard.card_cvv, function(response, request){
                    PaymentUI.hideProcessingUI();
                    if (!response){
                        PaymentUI.showMessageBox("ERROR", PaymentLib.getLocalize("ACTION_FAILED"))
                        return false;
                    }
                    if (response.status != "SUCCESS"){
                        PaymentUI.showMessageBox("ERROR", response.status_message)
                        PaymentLib.log("SetLatamCreditCardTokenCVV Fail", response);
                        return false;
                    }

                    callback(response.token);
                });

            })
        })
    },

    /**
     * If stored credit card token, 
     * @param {string} cardType latam credit card type
     * @param {string} markedCardNo marked card number
     * @param {string} cardToken credit card token
     * @param {function} callback 
     */
    flowRepayLatamCreditCard: function(cardType, markedCardNo, cardToken, callback){
        // if user want alter credit card info, then hide GUI and call flowNewLatamCreditCard.
        function alterCardInfo(){
            PaymentUI.UIPaymentInputCreditCardCVV.hideGui();
            PaymentLib.flowNewLatamCreditCard(cardType, callback);
        }
        PaymentUI.showInputCreditCardCVV(cardType, markedCardNo, alterCardInfo, function(action, cardCVV){
            PaymentUI.showProcessingUI();
            PaymentLib.requestSetLatamCreditCardCVV(cardToken, cardCVV, function(response, request){
                PaymentUI.hideProcessingUI();
                if (!response){
                    PaymentUI.showMessageBox("ERROR", PaymentLib.getLocalize("ACTION_FAILED"))
                    return false;
                }
                if (response.status != "SUCCESS"){
                    PaymentUI.showMessageBox("ERROR", response.status_message)
                    PaymentLib.log("SetLatamCreditCardTokenCVV Fail", response);
                    return false;
                }

                callback(cardToken);
            });
        })
    },

    /**
     * 
     * @param {object} response 
     * @param {string} response.status
     * @param {string} response.payment_type_code
     * @param {string} response.token 
     * @param {string} response.masked_card_number
     * @param {object} request
     * @param {CreditCard} request.creditcard
     * @returns {void}
     */
    handleGetLatamCreditCardToken: function(response, request, callback){
        if (!response){
            return false;
        }
        if (response.status != "SUCCESS"){
            PaymentLib.log("GetLatamCreditCardToken Fail", response);
            return false;
        }
        var creditCardType = response.payment_type_code;

        PaymentLib.UserData.setStringWithCrypt('globalpayment_cache_ebanx_'+creditCardType+"_masked_card_number", response.masked_card_number);
        PaymentLib.UserData.setStringWithCrypt('globalpayment_cache_ebanx_'+creditCardType+"_token", response.token);

        PaymentLib.requestSetLatamCreditCardCVV(response.token, request.creditcard.card_cvv, callback);

    },

    __showInputPhoneNumber: function(userName, uid, amount, channelCode, embedData, options, callback){
        var userData = options.userData || {}
        if (typeof userData == 'string') userData = JSON.parse(userData)

        var localCacheKey = "globalpayment_cache_"+channelCode+"_phone_number";
        var phoneNumber = PaymentLib.UserData.getStringFromKey(localCacheKey, "");
        PaymentUI.showInputPhoneNumber(phoneNumber, function(action, phoneNumber){
            PaymentLib.startProcessing();
            PaymentLib.UserData.setStringFromKey(localCacheKey,phoneNumber);
            userData['phone_number'] = phoneNumber;
            options.userData = JSON.stringify(userData);
            return PaymentLib.requestCreateTransaction(userName, uid, amount, channelCode, embedData, options, callback)
        })
    },

    /**
     * Handle Create Transaction Response use PaymentUI
     * @param {PMTransResponse} response 
     * @param {PMTransRequest} request
     * @returns {void}
     */
    handleCreateTransaction: function(response, request){
        PaymentLib.log('CreateTransactionResponse', response || "");

        if (!PaymentConfig.usePaymentUI){
            PaymentLib.finishProcessing();
            return;
        }

        if(!response || response.error){
            PaymentUI.showMessageBox("ERROR", PaymentLib.getLocalize('ACTION_FAILED'))
            PaymentLib.finishProcessing();
            return;
        }

        // handle API Error
        if (response.status < 0){
            var msgID = null;
            switch (response.status) {
                case PaymentLib.CONSTANT.PMC_RESPONSE_STATUS.INVALID_TOKEN: // -1
                case PaymentLib.CONSTANT.PMC_RESPONSE_STATUS.INVALID_CONFIG: // -2
                case PaymentLib.CONSTANT.PMC_RESPONSE_STATUS.INVALID_REQUEST_DATA: // -3
                case PaymentLib.CONSTANT.PMC_RESPONSE_STATUS.DUPLICATED_TRANS_ID: // -4
                case PaymentLib.CONSTANT.PMC_RESPONSE_STATUS.REQUEST_TIMEOUT: //-15
                case PaymentLib.CONSTANT.PMC_RESPONSE_STATUS.INTERNAL_SERVER_ERROR: // -99
                case PaymentLib.CONSTANT.PMC_RESPONSE_STATUS.FAIL: // -100
                    msgID = "ACTION_FAILED";
                    break;
                case PaymentLib.CONSTANT.PMC_RESPONSE_STATUS.INACTIVED_CHANNEL: // -5
                    msgID = "ACTION_FAILED_INACTIVED_CHANNEL";
                    break;
                case PaymentLib.CONSTANT.PMC_RESPONSE_STATUS.INVALID_PHONE_NUMBER:
                    msgID = "ACTION_FAILED_INVALID_PHONE";
                    break;
                case PaymentLib.CONSTANT.PMC_RESPONSE_STATUS.INVALID_GIFT_CARD:
                    msgID = "ACTION_FAILED_INVALID_GIFT_CARD";
                    break;
                case PaymentLib.CONSTANT.PMC_RESPONSE_STATUS.USED_GIFT_CARD:
                    msgID = "ACTION_FAILED_USED_GIFT_CARD";
                    break;
                case PaymentLib.CONSTANT.PMC_RESPONSE_STATUS.INACTIVED_BANK:
                    msgID = "ACTION_FAILED_INACTIVED_BANK";
                    break;
            }
            if (msgID != null){
                PaymentUI.showMessageBox('ERROR', PaymentLib.getLocalize(msgID));
                PaymentLib.finishProcessing();
                return;
            }
        }

        var flow = response.payment_flow == 0 ? PaymentLib.channelConfigs[request.channelCode].payment_flow : response.payment_flow;
        switch(flow){
            case 1:
                PaymentLib.flowSMSInstruction(response, request);
                break;
            case 2: // redirect
                PaymentLib.flowRedirect(response, request);
                break;
            case 3:
                PaymentLib.flowShowGuides(response, request);
                break;
            case 4:
                PaymentLib.flowVerifyOTP(response, request, 1);
                break;
            case 5:
                PaymentLib.flowGiftCard(response, request);
                break;
            case 6:
                break;
            case 7:
                PaymentLib.flowRedirect(response, request);
                break;
            case 8:
                PaymentLib.flowZalopayBinding(response, request)
                break;
            case 9:
                break;
            default:
                PaymentUI.showMessageBox('ERROR', PaymentLib.getLocalize('ACTION_FAILED'));
                break;
        }
        PaymentLib.finishProcessing();
    },
    
    
    /**
     * Handle Payment Flow 1 - SMS Instruction
     * @param {PMTransResponse} response
     * @param {PMTransRequest} request
     * @returns {void}
     */
    flowSMSInstruction: function(response, request){
        if (response.status >= 0){
            PaymentUI.showSMSInstruction(response.short_code, response.sms_body, request)
        } else if (response.status == PaymentLib.CONSTANT.PMC_RESPONSE_STATUS.INVALID_PHONE_NUMBER){
            PaymentUI.showMessageBox('ERROR', PaymentLib.getLocalize('ACTION_FAILED_INVALID_PHONE'));
        } else {
            PaymentUI.showMessageBox('ERROR', PaymentLib.getLocalize('ACTION_FAILED'));
        }
    },

    /**
     * Handle Payment Flow 2, 7 - Redirect WebView, App
     * @param {PMTransResponse} response
     * @param {PMTransRequest} request
     * @returns {void}
     */
    flowRedirect: function(response, request){
        if (response.status < 0)
            return PaymentUI.showMessageBox('ERROR', PaymentLib.getLocalize('ACTION_FAILED'));

        var redirect_url = response.redirect_url;
        var qr_code = response.qr_code;
        PaymentLib.log("Success, redirect to "+redirect_url);
        if (qr_code){
            PaymentUI.openZaloPayApp(qr_code, response);
        } else {
            PaymentUI.openWebView(redirect_url, response);
        }
    },

    /**
     * Handle Payment Flow 3 - Show Instruction
     * @param {PMTransResponse} response
     * @param {PMTransRequest} request
     * @returns {void}
     */
    flowShowGuides: function(response, request){
        var guides = response.channel_message;
        if (response.status < 0 || !guides)
            return PaymentUI.showMessageBox('ERROR', PaymentLib.getLocalize('ACTION_FAILED'));
        
        return PaymentUI.showMessageBox('SUCCESS', guides);
    },

    /**
     * Handle Payment Flow 4 - Displays a user interface for the user to enter an SMS OTP, sends a request to verify the OTP, and shows the transaction result.
     * @param {PMTransResponse} response
     * @param {PMTransRequest} request
     * @returns {void}
     */
    flowVerifyOTP: function(createTransResponse, createTransRequest, retry){
        if (createTransResponse.status < 0){
            if (createTransResponse.status == PaymentLib.CONSTANT.PMC_RESPONSE_STATUS.INVALID_PHONE_NUMBER)
                return PaymentUI.showMessageBox('ERROR', PaymentLib.getLocalize('ACTION_FAILED_INVALID_PHONE'));
            
            return PaymentUI.showMessageBox('ERROR', PaymentLib.getLocalize('ACTION_FAILED'));
        }

        PaymentUI.showInputOTP(function(action, otp){
            PaymentLib.startProcessing()
            PaymentLib.requestVerifyOTP(createTransResponse.transaction_code, otp, function(verifyOTPResponse, verifyOTPrequest){
                PaymentLib.log("VerifyOTPResponse", verifyOTPResponse);
                
                if (verifyOTPResponse.status == PaymentLib.CONSTANT.PMC_RESPONSE_STATUS.SUCCESS){
                    PaymentUI.showMessageBox("SUCCESS", PaymentLib.getLocalize('TRANS_SUCCESS_TEXT'));
                } else {
                    if (verifyOTPResponse.status == PaymentLib.CONSTANT.PMC_RESPONSE_STATUS.INVALID_OTP && retry < PaymentLib.CONSTANT.MAX_VERIFY_OTP_ATTEMPT){
                        var callback = function(){
                            PaymentLib.flowVerifyOTP(createTransResponse, createTransRequest, retry + 1);
                        }
                        PaymentUI.showMessageBox("ERROR", PaymentLib.getLocalize('NOTIFY_RE_ENTER_OTP') + " (retry#" + retry + ")", callback);
                    } else {
                        PaymentUI.showMessageBox("ERROR", PaymentLib.getLocalize('ACTION_FAILED_INVALID_OTP'));
                    }
                }
                PaymentLib.finishProcessing();

            })
        })
    },

    /**
     * Handle Payment Flow 5 - Show Transaction Status
     * @param {PMTransResponse} response
     * @param {PMTransRequest} request
     * @returns {void}
     */
    flowGiftCard: function(response, request){
        if (response.status == PaymentLib.CONSTANT.PMC_RESPONSE_STATUS.SUCCESS){
            PaymentUI.showMessageBox('SUCCESS', PaymentLib.getLocalize('TRANS_SUCCESS_TEXT'));
            PaymentUI.hideGiftCardForm();
        } else if (response.status == PaymentLib.CONSTANT.PMC_RESPONSE_STATUS.INVALID_CARD_INFO){
            PaymentUI.showMessageBox('SUCCESS', PaymentLib.getLocalize('ACTION_FAILED_INVALID_CARD'));
        } else if (response.status == PaymentLib.CONSTANT.PMC_RESPONSE_STATUS.USED_CARD_INFO){
            PaymentUI.showMessageBox('SUCCESS', PaymentLib.getLocalize('ACTION_FAILED_USED_GIFT_CARD'));
        } else {
            PaymentUI.showMessageBox('SUCCESS', PaymentLib.getLocalize('ACTION_FAILED'));
        }
    },

    /**
     * Handle Payment Flow 8 - Show QRCode or open Zalopay App
     * @param {PMTransResponse} response
     * @param {PMTransRequest} request
     * @returns {void}
     */
    flowZalopayBinding: function(response, request){
        if (response.status < 0)
            return PaymentUI.showMessageBox('ERROR', PaymentLib.getLocalize('ACTION_FAILED'));

        PaymentUI.openZaloPayApp(response.qr_code, response, request)
    },

    //#endregion

    //#region API Payment Core

    /**
     * Request 'CreateTransaction' API
     * @param {string} userName - user name
     * @param {int} uid - user id
     * @param {int} amount - amount
     * @param {int} channelCode - payment channel code
     * @param {string} embedData - Product customization data used for verification when a transaction succeeds in order to prevent fraudulent
     * @param {object} [options] - optional data 
     * @param {string} [options.orderDescription] - the order description will be displayed during the payment process if supported by the partner.
     * @param {object} [options.userData] - Object contains required user data related to Payment Channel Code.
     * @param {string} [options.redirectURL] - URL to which the user will be redirected in case of payment fail or succeed.
     * @param {string} [options.callbackURL] - An optional callback URL for notifying payment status in case of payment succeed. If not provided, the default callback URL will be used.
     * @param {string} [options.offerCode] - unusage.
     * @param {string} [options.addInfo] - Additional information, unusage.
     * @param {string} [options.userIP] - user's IP address.
     * @param {string} [options.clientIP] - game client address.
     * @param {PMTransAPICallback} callback - callback function
     * @returns {void}
     */
    requestCreateTransaction: function(userName, uid, amount, channelCode, embedData, options, callback){
        var body = {
            product_code: Number(PaymentConfig.product_id),
            username: userName,
            uid: uid,
            amount: Number(amount),
            channel_code: Number(channelCode),
            country_code: PaymentConfig.country,
            embed_data: embedData,
            currency: PaymentConfig.currency,
            platform: PaymentConfig.platform,

            user_info: options.userData || "{}",
            user_ip: options.userIP || "",
            client_ip: options.clientIP || "",
            order_descrition: options.orderDescription || "",
            redirect_url: options.redirectURL || PaymentConfig.redirect_url || "",
            callback_url: options.callbackURL || PaymentConfig.callback_url || "",
            add_info: options.addInfo || "",
        }

        if (typeof body.user_info == 'object') body.user_info = JSON.stringify(body.user_info);

        callback = callback || PaymentLib.handleCreateTransaction;

        if (!PaymentLib.__validateCreateTransactionBody(body)){
            callback({error: {code: -99999, type: "INVALID_BODY"}}, body);
            return;
        }

        var url = this.__get_payment_url('create_transaction');

        PaymentLib.log('CreateTransaction', url, body)

        PaymentLib.__requestPaymentCore('POST', url, body, callback)
    },

    
    /**
     * Validate the body of a transaction request
     * @param {PMTransRequest} body PMCTransactionRequest Payload
     * @returns {boolean}
     */
    __validateCreateTransactionBody: function(body){
        // Checks if the provided Channel Code exists in PaymentLib.channelConfigs and if the channel is currently active.
        if (!PaymentLib.channelConfigs[body.channel_code]){
            PaymentLib.log("Invalid " + body.channel_code)
            return false;
        }

        if (PaymentLib.channelConfigs[body.channel_code].channel_status != 1){
            PaymentLib.log("Channel " + body.channel_code + " is unavailable")
            return false;
        }
        
        // Checks the payload contains required parameters and their values are of the correct types.
        for (var param in PaymentLib.CONSTANT.transaction_payload) {
            var paramConfig = PaymentLib.CONSTANT.transaction_payload[param];
            if (paramConfig.require && PaymentLib.__empty(body[param])){
                PaymentLib.log(param + " must not be empty")
                return false;
            }
            if (body[param]){
                if (typeof body[param] != paramConfig.type){
                    PaymentLib.log(body[param] + " (" + param + ") must be " + paramConfig.type + ", " + typeof body[param] + " given")
                    return false;
                }
                if (paramConfig.type == 'string' && paramConfig.maxLength && body[param].length > paramConfig.maxLength){
                    PaymentLib.log("Error. The maximum length for a "+param+" value is " + paramConfig.maxLength)
                    return false;
                }
            }
        }

        // Checks the payload.user_info contains required user data.
        var config = PaymentLib.channelConfigs[body.channel_code];
        if (Array.isArray(config.user_info) && config.user_info.length > 0){
            for (var index = 0; index < config.user_info.length; index++) {
                var fieldName = config.user_info[index];
                var userData = JSON.parse(body.user_info)
                if (PaymentLib.__empty(userData[fieldName])){
                    PaymentLib.log("Invalid user_data: channel " + body.channel_code + " missing "+fieldName)
                    return false;
                }
            }
        }

        // Checks the payload.amount 
        if (!PaymentLib.__validateTransactionAmount(body.channel_code, body.amount)){
            return false;
        }

        return true;
    },

    /**
     * Validate amount of a transaction request
     * @param {number} channelCode payment channel code
     * @param {number} amount transaction amount
     * @returns {boolean}
     */
    __validateTransactionAmount: function(channelCode, amount){
        var config = PaymentLib.channelConfigs[channelCode] || [];
        var valueRange = config.values_range || [];
        if (PaymentLib.__empty(valueRange)) return true;
        for (var index = 0; index < valueRange.length; index++) {
            var range = valueRange[index];
            if (typeof range == 'string' && range.indexOf(':') !== -1){
                range = range.split(':');
                if (range.length !== 2) continue;
                if (Number(range[0]) <= amount && amount <= Number(range[1])) return true; 
            } else range = Number(range);
            if (typeof range == 'number' && amount == range) return true;

        }
        PaymentLib.log("Amount must be in the range " + valueRange.join(','));
        return false;
    },

    /**
     * PaymentFlow 4: Request 'VerifyOTP' API
     * @param {string} transactionCode Payment Transaction ID (PMTransResponse.transaction_code)
     * @param {string} otp User Input OTP
     * @param {PaymentAPICallback} callback callback function
     * @returns {void}
     */
    requestVerifyOTP: function(transactionCode, otp, callback){
        var data = {
            'transaction_code': transactionCode,
            'otp': otp
        }
        var url = this.__get_payment_url('verify_otp');
        PaymentLib.log('VerifyOTPBody', url, data)
        return this.__requestPaymentCore('POST', url, data, callback)
    },

    /**
     * Get Payment Config
     * @param {PaymentAPICallback} callback 
     */
    requestGetPaymentList: function(callback){
        PaymentLib.loading_config.channelConfig = false;
        var data = {
            'product_code': PaymentConfig.product_id,
            'country_code': PaymentConfig.country
        }
        var pmListCallback = function(response, request) {
            PaymentLib.handlePaymentList(response, request);
            if (callback) callback();
        }
        var url = this.__get_payment_url('get_payment_list') + '?' + PaymentLib.__encodeQueryData(data);
        PaymentLib.log('GetPaymentListBody', url, data)
        this.__requestPaymentCore('GET', url, data, pmListCallback)
    },

    /**
     * Get list VN bank code (channel 1006)
     * @param {PaymentAPICallback} callback 
     */
    requestGetVNBankList: function(callback){
        PaymentLib.loading_config.bankList = false;

        var data = {
            'product_code': PaymentConfig.product_id,
            'country_code': PaymentConfig.country
        }
        var pmVNBanklistCallback = function(response, request){
            PaymentLib.handleVNBankList(response, request);
            if (callback) callback();
        }
        var url = this.__get_payment_url('get_list_bankcode') + '?' + PaymentLib.__encodeQueryData(data);

        PaymentLib.log('GetVNBankList', url)
        this.__requestPaymentCore('GET', url, data, pmVNBanklistCallback)
    },

    requestSimulateFinish: function(transactionCode, callback){
        var data = {
            'transaction_code': transactionCode,
            'product_code': PaymentConfig.product_id,
            'status': 1
        }
        var url = this.__get_payment_url('simulate_finish');
        callback = callback || PaymentLib.handleSimulateFinish
        // PaymentLib.log('SimulateFinish', url, data)
        return this.__requestPaymentCore('POST', url, data, callback)
    },

    // deprecated
    requestGetVNBankList_FromPartner: function(callback){
        PaymentLib.loading_config.bankList = false;

        var pmVNBanklistCallback = function(response, request){
            PaymentLib.handleVNBankList(response, request);
            if (callback) callback();
        }
        var url = PaymentLib.CONSTANT.api_url.get_vn_bank_list;

        PaymentLib.__request('GET', url, {}, {}, pmVNBanklistCallback);
    },

    /**
     * Get Latam Credit Card Config (API host, endpoint, publickey, list creditcard code)
     * @param {PaymentAPICallback} callback 
     */
    requestGetLatamCreditCardConfig: function(callback){
        this.loading_config.latamCCApi = true;
        var data = {
            'product_code': PaymentConfig.product_id,
            'country_code': PaymentConfig.country
        }
        var pmGetLatamCCAPIConfigCallback = function(response, request){
            PaymentLib.handleLatamCCAPIConfig(response, request);
            if (callback) callback();
        }
        var url = this.__get_payment_url('get_latam_cc_api_config') + '?' + PaymentLib.__encodeQueryData(data);
        
        PaymentLib.log('GetLatamCreditCardConfig', url)
        this.__requestPaymentCore('GET', url, data, pmGetLatamCCAPIConfigCallback);
    },

    //#endregion

    //#region API Latam Credit Card

    /**
     * 
     * @param {string} creditCardType credit card code
     * @param {CreditCard} cardInfo 
     * @param {PaymentAPICallback} callback
     * @param {boolean} [requestSetCVV=true] requestSetCVV
     * @return {void}
     */
    requestGetLatamCreditCardToken: function(creditCardType, cardInfo, callback, requestSetCVV){
        requestSetCVV = requestSetCVV == undefined ? true : requestSetCVV;
        if (!PaymentLib.__validateCreditCard(cardInfo)){
            PaymentLib.log("Invalid credit card");
            return;
        }
        var body = {
            public_integration_key: PaymentLib.latamCreditCardConfig.apiKey,
            payment_type_code: creditCardType,
            country: PaymentConfig.country,
            creditcard: cardInfo
        };
        // Luu y: KHONG log + luu thong tin credit card cua user
        var url = PaymentLib.latamCreditCardConfig.apiHost + PaymentLib.latamCreditCardConfig.apiEndpoint.get_token;
        PaymentLib.log("Request get latam credit card token", url, body);
        PaymentLib.__request('POST', url, body, [], callback);
    },

    /**
     * 
     * @param {CreditCard} cardInfo 
     */
    __validateCreditCard: function(cardInfo){
        if (!cardInfo.card_number || !cardInfo.card_name || !cardInfo.card_due_date || !cardInfo.card_cvv){
            return false;
        }
        if (! /^(0[1-9]|1[0-2])\/\d{4}$/.test(cardInfo.card_due_date)){
            return false;
        }
        if (! /^\d{3,4}$/.test(cardInfo.card_cvv)){
            return false;
        }
        return true;
    },

    /**
     * 
     * @param {string} creditCardType credit card code
     * @param {CreditCard} cardInfo 
     */
    requestSetLatamCreditCardCVV: function(token, cardCVV, callback){
        var body = {
            public_integration_key: PaymentLib.latamCreditCardConfig.apiKey,
            token: token,
            card_cvv: cardCVV,
        }
        var url = PaymentLib.latamCreditCardConfig.apiHost + PaymentLib.latamCreditCardConfig.apiEndpoint.set_cvv;
        PaymentLib.log("Request set latam credit card cvv", url, body);
        PaymentLib.__request('POST', url, body, [], callback);
    },
    //#endregion

    //#region Handle API Response

    /**
     * 
     * @param {PMListResponse} response 
     * @returns {void}
     */
    handlePaymentList: function(response, request){
        if(!response || response.error){
            return PaymentLib.log('GetPaymentListError', response);
        }
        PaymentLib.log('GetPaymentListSuccess', response)

        PaymentLib.channelConfigs = {}
        var list_channel = response.list_channel || []
        for (var index = 0; index < list_channel.length; index++) {
            var config = list_channel[index];
            var group_id = config.channel_group_id;
            PaymentLib.channelConfigs[config.channel_code] = config;
            if (!PaymentLib.channelGroupConfigs[group_id]) PaymentLib.channelGroupConfigs[group_id] = { id: group_id, name: config.group_name, list_channel: [] };
            PaymentLib.channelGroupConfigs[group_id].list_channel.push(config.channel_code);
        }
        PaymentLib.loading_config.channelConfig = true;
    },

    handleVNBankList: function(response, request){
        PaymentLib.loading_config.bankList = true;
        if(!response || response.error){
            return PaymentLib.log('GetVNBankListError', response);
        }

        var bankList = response.bank_list || response.bankList || [];
        for (var index = 0; index < bankList.length; index++) {
            var bank = bankList[index];
            PaymentLib.bankList.push(bank.code)
        }
        return PaymentLib.log('GetVNBankListSuccess: '+ PaymentLib.bankList.length + " banks");
    },

    handleLatamCCAPIConfig: function(response, request){
        PaymentLib.loading_config.latamCCApi = true;
        if(!response || response.error || response.status != 1){
            return PaymentLib.log('GetLatamCCAPIConfigError', response);
        }

        PaymentLib.latamCreditCardConfig.apiHost = response.api_host;
        PaymentLib.latamCreditCardConfig.apiKey = response.public_key;
        
        return PaymentLib.log('GetLatamCCAPIConfigSuccess');
    },

    handleSimulateFinish: function(response, request){
        PaymentLib.log("SimulateFinishResponse", response)

        if(!response){
            PaymentUI.showMessageBox("ERROR", "Simulate Error")
        }

        if (response.error){
            PaymentUI.showMessageBox("ERROR", "Simulate Error: " + response.error.description)
            return
        }

        if(response.status == 1){
            PaymentUI.showMessageBox("SUCCESS", "Transaction " + request.transaction_code + " is successfull")
            return;
        } else {
            PaymentUI.showMessageBox("ERROR", "Simulate Error")
            return;
        }

    },
    
    //#endregion

    //#region PaymentLib Utils function

    /**
     * @param {...*} args One or more param
     */
    log: function(){
        var args = Array.prototype.slice.call(arguments);
  
        var formattedArgs = args.map(function(arg) {
            return typeof arg === 'object'?JSON.stringify(arg):arg;
        });
        var msg = formattedArgs.join(' | ')
        cc.log(PaymentLib.__getCurrentTimeFormat()+" | PaymentLib | "+msg)
    },
    /**
     * 
     * @param {string|undefined} name if undefined: get all localize
     * @returns {void}
     */
    getLocalize: function(name){
        var lang = (PaymentConfig.language || "EN").toUpperCase()
        var localize = PaymentConfig.localize[lang] || PaymentConfig.localize.EN;
        return (name==undefined?localize:localize[name]);
    },
    is_loaded: function(){
        for (var config in PaymentLib.loading_config) {
            if (!PaymentLib.loading_config[config]) return false;
        }
        return true;
    },
    startProcessing: function(){
        if (this.isProcessing) return false;
        this.isProcessing = true;
        if (PaymentConfig.usePaymentUI) PaymentUI.showProcessingUI();
        return true;
    },

    finishProcessing: function(){
        if (PaymentConfig.usePaymentUI) PaymentUI.hideProcessingUI();
        this.isProcessing = false;
    },
    //#endregion PaymentLib Utils function

    //#region private functions
    __generateToken: function(data){
        if (PaymentLib.__empty(data)) return "";
        var params = "";
        var allKeys = Object.keys(data).sort(function(a,b){return a.localeCompare(b)});
        for(var index in allKeys){
            params += data[allKeys[index]];
        }
        params += PaymentConfig.secret_key;
        var token = md5(params);
        return token;
    },

    __get_payment_url: function(endpoint){
        endpoint = PaymentLib.CONSTANT.endpoint[endpoint] || endpoint
        return PaymentConfig.host + endpoint;
    },

    __requestPaymentCore: function(method, url, data, callback){
        headers = {
            'Content-Type': "application/json",
            'Authorization': this.__generateToken(data)
        }
        if (method.toUpperCase() == 'GET') data = null;
        return this.__request(method, url, data, headers, callback);
    },

    __request: function(method, url, data, headers, callback){
        // var xhr = new XMLHttpRequest();
        method = method || 'POST'
        var xhr = cc.loader.getXMLHttpRequest();

        var json = data ? JSON.stringify(data) : "";
        xhr.open(method, url, false);
        if (headers)
            for (var headerName in headers) {
                if (headers[headerName])
                    xhr.setRequestHeader(headerName, headers[headerName])
            }
        xhr.send(json);

        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4){
                if (xhr.status == 200) {
                    try {
                        var response = JSON.parse(xhr.responseText);
                    } catch (error) {
                        var response = {error: { type: "REQUEST PAYMENTCORE: PARSE JSON EXCEPTION",
                            description: error.message,
                            response: xhr.response
                        }};
                    }
                    return callback(response, data);
                } else{
                    return callback({error: {
                        type: xhr.status + " RESPONSE",
                        description: xhr.statusText,
                        response: xhr.response
                    }}, data)
                }
            }
        };
    },
    //#endregion

    //#region Utils

    __getCurrentTimeFormat: function(){
        var now = new Date();
        var year = now.getFullYear();
        var month = now.getMonth() + 1;
        if (month < 10) month = '0' + month;
        var day = now.getDate();
        if (day < 10) day = '0' + day;
        var hours = now.getHours();
        if (hours < 10) hours = '0' + hours;
        var minutes = now.getMinutes();
        if (minutes < 10) minutes = '0' + minutes
        var seconds = now.getSeconds();
        if (seconds < 10) seconds = '0' + seconds;
        
        var formattedDateTime = year+"-"+month+"-"+day+" "+hours+":"+minutes+":"+seconds;
        return formattedDateTime;
    },

    __encodeQueryData: function(data) {
        var ret = [];
        for (var d in data)
            ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]));
        return ret.join('&');
    },

    __empty: function(arg){
        if (typeof arg != 'object') return !arg;
        if (Array.isArray(arg)) return !arg.length;
        for (var x in arg) { return false; }
        return true;
    },

    __arrayUnique: function(array) {
        return array.filter(function(value, index, array){
            return array.indexOf(value) === index;
        });
    },

    //#endregion
}

/**
 * @memberof PaymentLib
 * 
 */
PaymentLib.UserData = {
    getStringFromKey: function (key, defaultValue)
    {
        var val = cc.sys.localStorage.getItem(key);
        if(_.isNull(val)|| _.isNaN(val))
            return defaultValue;
        else
            return val;
    },

    setStringFromKey:function(key, value)
    {
        if(typeof value == "undefined") return;
        cc.sys.localStorage.setItem(key, value);
    },

    getNumberFromKey:function(key, defaultValue)
    {
        var val = cc.sys.localStorage.getItem(key);
        if(_.isNull(val)|| _.isNaN(val) || _.isEmpty(val))
            return defaultValue;
        else{
            return Number(val);
        }
    },

    setNumberFromKey:function(key, value)
    {
        cc.sys.localStorage.setItem(key, value);
    },

    getBoolFromKey:function(key, defaultValue)
    {
        var val = cc.sys.localStorage.getItem(key);
        if(_.isNull(val)|| _.isNaN(val) || _.isEmpty(val))
            return defaultValue;
        else
            return val == 1 ? true : false;
    },

    setBoolFromKey:function(key, value)
    {
        if(typeof value == "undefined") return;
        cc.sys.localStorage.setItem(key, value ? 1 : 0);
    },

    setStringWithCrypt:function(key, value)
    {
        if(typeof value == "undefined") return;
        var val = CryptoJS.AES.encrypt(value, KEY_ENCRYPT);
        cc.sys.localStorage.setItem(key, val.toString());
    },

    getStringWithCrypt:function(key, defaultValue){
        var val = cc.sys.localStorage.getItem(key);
        if(_.isNull(val)|| _.isNaN(val))
            return defaultValue;
        else
            return CryptoJS.AES.decrypt(val,KEY_ENCRYPT).toString(CryptoJS.enc.Utf8);
    }
};


