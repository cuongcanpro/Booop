
/**
 * The secret string used to encrypt data in PaymentLib.UserData
 */
var KEY_ENCRYPT = 'xxxxxx';

/**
 * Payment Global Configuration Object
 * @typedef {Object} PaymentConfig
 * @property {string} host Payment Global API's Host. Contact khoand2 to get Live Host.
 * @property {string} secret_key (c) Payment Global API secret key. Contact khoand2.
 * @property {int} product_id (c) Product ID. Contact khoand2.
 * @property {string} language  a two-letter (ISO 639-1) code
 * @property {string} currency a three-letter (ISO 4217) code
 * @property {int} platform 1: iOS, 2: android, 3: web
 * @property {string} redirect_url unusage
 * @property {string} callback_url unusage
 * @property {boolean} usePaymentUI use paymentUI
 * @property {object} localize localized text (PaymentUI)
 */

/**
 * @namespace PaymentConfig
 */
var PaymentConfig = {
    env: "dev", // "dev" or "live"

    host: 'https://sb-pay-global-api.service.zingplay.com',
    secret_key: 'domino_s@3RVY!UeiG9B',
    product_id: 50427,

    language: 'vn',
    country: 'id', // mm, ph, th, ar, br
    currency: 'IDR', // MMK, PHP, THB , ARS, BRL
    platform: 2, // 1: iOS, 2: android, 3: web
    redirect_url: null, // optional
    callback_url: null, // optional

    usePaymentUI: true,
    localize: {}
}

if (!PaymentConfig.host.endsWith('/')) PaymentConfig.host += '/';

PaymentConfig.localize.VI = {
    TITLE_INPUT_PHONENUMBER:"Type Your Phone Number",
    TITLE_BTN_OK:"OK",
    TITLE_BTN_CANCEL:"Cancel",
    TAP_TO_INPUT:"Touch to input",
    INPUT_WARNING:"Please fill in required information!",
    TITLE_INPUT_GIFT_CARD: "Redeem your Gift Card",
    LABEL_CARD_NO: "Series Number",
    LABEL_PIN_CODE: "Pin Code",
    TITLE_INPUT_OTP: "To complete your purchase, enter the OTP code and click 'Confirm'",

    CONFIRM_TEXT:"Confirm",
    CHOOSE_CARRIER_TEXT:"Choose The Operator",
    CHOOSE_BANK_TEXT:"Choose The Bank",
    CONFIRM_PURCHASE_SMS:"To complete your purchase, Choose The Operator",
    SIM_POST_PAID:"Postpaid SIM",
    SIM_PRE_PAID:"Prepaid SIM",

    NOTIFY_RE_ENTER_OTP:"Enter error! Please re-enter the OTP",

    TRANS_PROCESS_TEXT:"Processing Transaction",
    TRANS_SUCCESS_TEXT:"Successfull Transaction",
    ACTION_FAILED:"Error during processing!",
    ACTION_FAILED_INACTIVED_CHANNEL:"Payment Channel is not supported or under maintenance.",
    ACTION_FAILED_INACTIVED_BANK:"Chosen Bank is not supported or under maintenance.",
    ACTION_FAILED_INVALID_OTP:"Invalid OTP",
    ACTION_FAILED_INVALID_GIFT_CARD: "Invalid Card Number or Pin Code",
    ACTION_FAILED_USED_GIFT_CARD: "GiftCard had been used.",
    ACTION_FAILED_INVALID_CREDIT_CARD:"Invalid card",
    ACTION_FAILED_CARD_OVER_LIMIT:"Daily transaction limit exceeded",
    ACTION_FAILED_INVALID_PHONE:"Invalid phone number",

    ACTION_FAILED_OVER_REQUEST:"Please try again after 5 mintutes",
    ACTION_FAILED_MAINTAIN:"The Operator under maintain. Please try again later!",

    CHOOSE_CREDITCARD_TEXT: "Choose The CreditCard",
    TITLE_INPUT_CARD_INFO: "Credit Card",
    LABEL_CREDITCARD_NAME: "Name",
    LABEL_CREDITCARD_NUMBER: "Card Number",
    LABEL_CREDITCARD_DATE: "Due Date",
    LABEL_CREDITCARD_CVV: "CVV",

    LABEL_USER_NAME: "Name", 
    LABEL_USER_EMAIL: "Email", 
    LABEL_USER_PHONE_NUMBER: "Phone Number", 
    LABEL_USER_DOCUMENT: "Document",
};

PaymentConfig.localize.EN = {
    TITLE_INPUT_PHONENUMBER:"Type Your Phone Number",
    TITLE_BTN_OK:"OK",
    TITLE_BTN_CANCEL:"Cancel",
    TAP_TO_INPUT:"Touch to input",
    INPUT_WARNING:"Please fill in required information!",
    TITLE_INPUT_GIFT_CARD: "Redeem your Gift Card",
    LABEL_CARD_NO: "Series Number",
    LABEL_PIN_CODE: "Pin Code",
    TITLE_INPUT_OTP: "To complete your purchase, enter the OTP code and click 'Confirm'",

    CONFIRM_TEXT:"Confirm",
    CHOOSE_CARRIER_TEXT:"Choose The Operator",
    CHOOSE_BANK_TEXT:"Choose The Bank",
    CONFIRM_PURCHASE_SMS:"To complete your purchase, Choose The Operator",
    SIM_POST_PAID:"Postpaid SIM",
    SIM_PRE_PAID:"Prepaid SIM",
    
    NOTIFY_RE_ENTER_OTP:"Enter error! Please re-enter the OTP",

    TRANS_PROCESS_TEXT:"Processing Transaction",
    TRANS_SUCCESS_TEXT:"Successfull Transaction",
    ACTION_FAILED:"Error during processing!",
    ACTION_FAILED_INACTIVED_CHANNEL:"Payment Channel is not supported or under maintenance.",
    ACTION_FAILED_INACTIVED_BANK:"Chosen Bank is not supported or under maintenance.",
    ACTION_FAILED_INVALID_OTP:"Invalid OTP",
    ACTION_FAILED_INVALID_GIFT_CARD: "Invalid Card Number or Pin Code",
    ACTION_FAILED_USED_GIFT_CARD: "GiftCard had been used.",
    ACTION_FAILED_INVALID_CREDIT_CARD:"Invalid card",
    ACTION_FAILED_CARD_OVER_LIMIT:"Daily transaction limit exceeded",
    ACTION_FAILED_INVALID_PHONE:"Invalid phone number",
    ACTION_FAILED_OVER_REQUEST:"Please try again after 5 mintutes",
    ACTION_FAILED_MAINTAIN:"The Operator under maintain. Please try again later!",

    CHOOSE_CREDITCARD_TEXT: "Choose The CreditCard",
    TITLE_INPUT_CARD_INFO: "Credit Card",
    LABEL_CREDITCARD_NAME: "Name",
    LABEL_CREDITCARD_NUMBER: "Card Number",
    LABEL_CREDITCARD_DATE: "Due Date",
    LABEL_CREDITCARD_CVV: "CVV",

    LABEL_USER_NAME: "Name", 
    LABEL_USER_EMAIL: "Email", 
    LABEL_USER_PHONE_NUMBER: "Phone Number", 
    LABEL_USER_DOCUMENT: "Document",
};
