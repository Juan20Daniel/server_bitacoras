const errorCodes = {
    //mysql errors
    ER_DUP_ENTRY:{code:"ER_DUP_ENTRY", status:409},

    //server errors
    VALIDATION_ERR: {code:"VALIDATION_ERROR", status:400},
    AUTH_ERR: {code:"AUTHENTICATION_ERROR", status:401},
    UNAUTORIZED_ERR: {code:'UNAUTORIZED_ERR', status:401},
    ACCESS_ERR:  {code:"ACCESS_ERROR", status:403},
    NOT_FOUND_ERR: {code:"NOT_FOUND_ERROR", status:404},
    SERVER_ERR: {code:"SERVER_ERROR", status:500},
    UNKNOWN_ER: {code:"UNKNOWN", status:500},
    EXPIRATION_ERROR: {code:"EXPIRATION_ERROR", status:504},
    TIMEOUT_ERR: {code:"TIMEOUT_ERROR", status:504},

}

const errorCode = (error) => {
  if (error.original?.code?.startsWith('ER_')) {
    return errorCodes[error.original?.code];
  }

  if (error.code?.startsWith('ER_')) {
    return errorCodes[error.code];
  }

  if (error.code?.startsWith('E')) {
    return errorCodes[error.code];
  }
  
  return errorCodes[error]??errorCodes.UNKNOWN_ER;
}

class handleError extends Error {
  constructor(message, error) {
    super(message);
    this.errorCode = errorCode(error).code??'UNKNOWN_ER';
    this.status = errorCode(error).status;
    this.isOperational = true;
  }
}

module.exports = {
  errorCodes,
  handleError,
  errorCode
};