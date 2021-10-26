const emailRegex = /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;

module.exports = {
  empStatus : {
    PENDING: 'PENDING',
    COMPLETED: 'COMPLETED',
    FAILED: 'FAILED'
},
  successResponseJson: async function (message, code) {
    let error = {};
    let Error = {};
    Error.Success = message;
    error.isBase64Encoded = false;
    error.statusCode = code;
    error.headers = { 
	    "X-Requested-With": '*',
        "Access-Control-Allow-Headers": 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,x-requested-with',
        "Access-Control-Allow-Origin": '*',
        "Access-Control-Allow-Methods": 'POST,GET,OPTIONS,PUT'
    },
    error.body = JSON.stringify(Error);
    console.log(error);
    return error;
  },
  errorResponseJson: async function (message, code) {
    let error = {};
    let Error = {};
    Error.Errors = message;
    error.isBase64Encoded = false;
    error.headers = { 
	    "X-Requested-With": '*',
        "Access-Control-Allow-Headers": 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,x-requested-with',
        "Access-Control-Allow-Origin": '*',
        "Access-Control-Allow-Methods": 'POST,GET,OPTIONS,PUT'
    },
    error.statusCode = code;
    error.body = JSON.stringify(Error);
    console.log(error);
    return error;
  },
  validateBlankrecord: function (jsonObj) {
    let isError = false;

    if (jsonObj == null) {
      isError = true;
    }

    if (jsonObj.email == null) {
      isError = true;
    }

    if (jsonObj.firstName == null) {
      isError = true;
    }

    if (jsonObj.lastName == null) {
      isError = true;
    }

    if (jsonObj.password == null) {
      isError = true;
    }

    if (jsonObj.phoneNumber == null) {
      isError = true;
    }
    if (jsonObj.birthdate == null) {
      isError = true;
    }

    if (jsonObj.gender == null) {
      isError = true;
    }

    if (jsonObj.address == null) {
      isError = true;
    }

    if (jsonObj.state == null) {
      isError = true;
    }

    if (jsonObj.city == null) {
      isError = true;
    }

    if (jsonObj.rfc == null) {
      isError = true;
    }

    return isError;
  },

  validateInvalidRecord: function (jsonObj) {
    let isError = false;

    if (jsonObj != null && !isEmailValid(jsonObj.email)) {
      console.log("Invalid1");
      isError = true;
    }
    let reg = new RegExp('^[0-9]+$');
    if (jsonObj != null && !reg.test(jsonObj.phoneNumber)) {
      console.log("Invalid2");
      isError = true;
    }

    return isError;
  }
};

function isEmailValid(email) {
  if (!email) {
    return false;
  }

  if (email.length > 254) {
    return false;
  }
  var valid = emailRegex.test(email);
  if (!valid) {
    return false;
  }

  // Further checking of some things regex can't handle
  var parts = email.split("@");
  if (parts[0].length > 64) {
    return false;
  }

  var domainParts = parts[1].split(".");
  if (domainParts.some(function (part) { return part.length > 63; })) {
    return false;
  }

  return true;
}
