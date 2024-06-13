/**
 * @typedef {Object} PMTransRequest
 * @property {number} product_code - The product code. (Type: number, maxLength: 32, required: true)
 * @property {string} username - The username. (Type: string, maxLength: 32, required: true)
 * @property {number} uid - The user ID. (Type: number, maxLength: 32, required: true)
 * @property {number} amount - The transaction amount. (Type: number, maxLength: 32, required: true)
 * @property {number} channel_code - The channel code. (Type: number, maxLength: 32, required: true)
 * @property {string} country_code - The country code. (Type: string, maxLength: 8, required: true)
 * @property {string} currency - The currency. (Type: string, maxLength: 8)
 * @property {string} user_ip - The user's IP address. (Type: string, maxLength: 32)
 * @property {string} client_ip - The client's IP address. (Type: string, maxLength: 32)
 * @property {string} order_description - The order description. (Type: string, maxLength: 512)
 * @property {string} embed_data - Embedded data for verification. (Type: string, maxLength: 512, required: true)
 * @property {string} redirect_url - The redirect URL. (Type: string, maxLength: 512)
 * @property {string} callback_url - The callback URL. (Type: string, maxLength: 512)
 * @property {string} user_info - User information in JSON format. (Type: string, maxLength: 512)
 * @property {string} offer_code - The offer code. (Type: string, maxLength: 50)
 * @property {string} add_info - Additional information. (Type: string, maxLength: 512)
 * @property {number} platform - The platform (1: iOS, 2: Android, 3: Web). (Type: number, maxLength: 32, required: true)
 */

/**
 * @typedef {Object} PMTransResponse
 * @property {string} transaction_code - ZPS transid.
 * @property {number} status - Detail.
 * @property {number} payment_flow - Refer payment flow, tuỳ theo payment flow client sẽ xử lý tiếp.
 * @property {string} redirect_url - Nếu payment flow =2 hoặc 7, mở trang theo url này.
 * @property {string} short_code - Payment flow =1--> gởi tới đầu số này.
 * @property {string} sms_body - Payment flow =1 , soạn tin nhắn theo cú pháp này.
 * @property {string} partner_trans_id - Partner transaction ID.
 * @property {string} qr_code - Tuỳ theo payment flow.
 * @property {Object} channel_message - Hướng dẫn cụ thể để user thực hiện.
 * @property {PaymentError} error
 */

/**
 * @typedef {Object} PMListResponse
 * @property {number} request_id - Random PMC request ID (use to debug).
 * @property {number} result - success | fail
 * @property {ChannelConfig[]} list_channel - 
 */

/**
 * @typedef {Object} PaymentError
 * @property {string} type - Error Type
 * @property {string} description - Error description
 * @property {string} response - (Optional) Raw Response added by PaymentLib, not from API
 */

/**
 * Callback when finish request payment API
 * @callback PaymentAPICallback
 * @param {object} response - API response body
 * @param {object} request - API request body
 */

/**
 * Callback when finish request API create payment transaction 
 * @callback PMTransAPICallback
 * @param {PMTransRequest} response - API response body
 * @param {PMTransResponse} request - API request body
 */

/**
 * @typedef ChannelConfig
 * @property {string} name - channel Name
 * @property {number} channel_code - Channel ID
 * @property {number} channel_group_id
 * @property {string} group_name - "DCB/SMS",
 * @property {array} values_range - [5000,10000,20000,50000,100000,200000,500000]
 * @property {number} payment_flow - 
 * @property {string[]|null} user_info - Needed data when create transaction
 * @property {int} channel_status - 1: Active | 0: De-Active | -1: Maintain | 0: Disabled
 * @property {string} description - 
 */

/**
 * @typedef GroupConfig
 * @property {string} name - group Name
 * @property {string[]} list_channel - list channel ID of group
 */

/**
 * @typedef CreditCard
 * @property {string} card_number The credit card number (14-19 digits, must pass the Luhn algorithm).
 * @property {string} card_name The cardholder name, as written in the credit card.
 * @property {string} card_due_date The credit card valid thru date (formatted as mm/yyyy).
 * @property {string} card_cvv The Card Verification Value (CVV) (3-4 digits).
 */

/**
 * Callback when finish selecting Payment Channel
 * @callback SelectPMChannelCallback
 * @param {string} action - action "OK" or "Cancel"
 * @param {int} channelCode - payment channel code
 */

/**
 * Callback when finish selecting Payment Channel
 * @callback SelectBankCallback
 * @param {string} action - action "OK" or "Cancel"
 * @param {string} bankCode - bankcode
 */

/**
 * Callback when finish input  form
 * @callback inputUserDataCallback
 * @param {string} action - action "OK" or "Cancel"
 * @param {object} userData - bankcode
 * @param {string} userData.card_no - (optional) (card) series no
 * @param {string} userData.pin_code - (optional) (card) pin code
 * 
 * @param {string} userData.document - (optional) latam user document
 * @param {string} userData.email - (optional) latam user email
 * @param {string} userData.document - (optional) latam user document
 */

/**
 * Callback when finish input  form
 * @callback inputCreditCardCallback
 * @param {string} action - action "OK" or "Cancel"
 * @param {CreditCard} cardInfo - bankcode
 */

