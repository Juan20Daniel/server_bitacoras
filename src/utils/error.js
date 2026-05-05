const errors = {
    //mysql errors
    ER_DUP_ENTRY:{code:"ER_DUP_ENTRY", status:409},

    //server errors
    VALIDATION_ERR: {code:"VALIDATION_ERROR", status:400},
    AUTH_ERR: {code:"AUTHENTICATION_ERROR", status:401},
    UNAUTORIZED_ERR: {code:'UNAUTORIZED_ERR', status:401},
    ACCESS_ERR:  {code:"ACCESS_ERROR", status:403},
    NOT_FOUND_ERR: {code:"NOT_FOUND_ERROR", status:404},
    RANGE_ERR: {code:"RANGE_ERR", status:400},
    SERVER_ERR: {code:"SERVER_ERROR", status:500},
    UNKNOWN_ER: {code:"UNKNOWN", status:500},
    EXPIRATION_ERROR: {code:"EXPIRATION_ERROR", status:504},
    TIMEOUT_ERR: {code:"TIMEOUT_ERROR", status:504},

}

class handleError extends Error {
  constructor(message, error) {
    super(message);
    this.errorCode = errors[error].code??'UNKNOWN_ER';
    this.status = errors[error].status;
    this.isOperational = true;
  }
}

module.exports = {
  errors,
  handleError,
};