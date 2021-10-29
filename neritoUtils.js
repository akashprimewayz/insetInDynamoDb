let CSVFileValidator = require('csv-file-validator');
const emailRegex = /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;
const config = {
  headers: [
    {
      name: 'phoneNumber',
      inputName: 'phoneNumber',
      required: true,
      requiredError: function (headerName, rowNumber, columnNumber) {
        return `${headerName} is required in the ${rowNumber} row / ${columnNumber} column`
      }
    },
    {
      name: 'password',
      inputName: 'password',
      required: true,
      requiredError: function (headerName, rowNumber, columnNumber) {
        return `${headerName} is required in the ${rowNumber} row / ${columnNumber} column`
      }
    },
    {
      name: 'firstName',
      inputName: 'firstName',
      required: true,
      requiredError: function (headerName, rowNumber, columnNumber) {
        return `${headerName} is required in the ${rowNumber} row / ${columnNumber} column`
      }
    },
    {
      name: 'lastName',
      inputName: 'lastName',
      required: true,
      requiredError: function (headerName, rowNumber, columnNumber) {
        return `${headerName} is required in the ${rowNumber} row / ${columnNumber} column`
      },
    },
    {
      name: 'email',
      inputName: 'email',
      unique: true,
      uniqueError: function (headerName, rowNumber, columnNumber) {
        return `${headerName} is not unique in the ${rowNumber} row`
      },
      validate: function (email) {
        return isEmailValid(email)
      },
      validateError: function (headerName, rowNumber, columnNumber) {
        return `${headerName} is not valid in the ${rowNumber} row / ${columnNumber} column`
      }
    },
    {
      name: 'birthdate',
      inputName: 'birthdate',
      required: true,
      requiredError: function (headerName, rowNumber, columnNumber) {
        return `${headerName} is required in the ${rowNumber} row / ${columnNumber} column`
      }
    },
    {
      name: 'gender',
      inputName: 'gender',
      required: true,
      requiredError: function (headerName, rowNumber, columnNumber) {
        return `${headerName} is required in the ${rowNumber} row / ${columnNumber} column`
      }
    },
    {
      name: 'address',
      inputName: 'address',
      required: true,
      requiredError: function (headerName, rowNumber, columnNumber) {
        return `${headerName} is required in the ${rowNumber} row / ${columnNumber} column`
      }
    },
    {
      name: 'state',
      inputName: 'state',
      required: true,
      requiredError: function (headerName, rowNumber, columnNumber) {
        return `${headerName} is required in the ${rowNumber} row / ${columnNumber} column`
      }
    },
    {
      name: 'city',
      inputName: 'city',
      required: true,
      requiredError: function (headerName, rowNumber, columnNumber) {
        return `${headerName} is required in the ${rowNumber} row / ${columnNumber} column`
      }
    },
    {
      name: 'rfc',
      inputName: 'rfc',
      required: true,
      requiredError: function (headerName, rowNumber, columnNumber) {
        return `${headerName} is required in the ${rowNumber} row / ${columnNumber} column`
      },
      unique: true,
      uniqueError: function (headerName, rowNumber, columnNumber) {
        return `${headerName} is not unique in the ${rowNumber} row`
      },
    }
  ]
}

module.exports = {
  csvStatus: {
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

  stringToDate: function (_date, _format, _delimiter) {
    var formatLowerCase = _format.toLowerCase();
    var formatItems = formatLowerCase.split(_delimiter);
    var dateItems = _date.split(_delimiter);
    var monthIndex = formatItems.indexOf("mm");
    var dayIndex = formatItems.indexOf("dd");
    var yearIndex = formatItems.indexOf("yyyy");
    var month = parseInt(dateItems[monthIndex]);
    month -= 1;
    var formatedDate = new Date(dateItems[yearIndex], month, dateItems[dayIndex]);
    return formatedDate;
  },

  formatDate: function (date) {
    var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2)
      month = '0' + month;
    if (day.length < 2)
      day = '0' + day;

    return [year, month, day].join('-');
  },

  validateCsv: async function (data) {
    let csvDataResult;
    let csvJson = data.Body.toString('utf-8');

    await CSVFileValidator(csvJson, config)
      .then(csvData => {
        csvDataResult = csvData;
        return csvDataResult;
      })
      .catch(err => {
        console.error(err);
        return err;
      });
    return csvDataResult;
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
