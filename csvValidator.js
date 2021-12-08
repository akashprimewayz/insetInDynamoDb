let service = require('./service.js');
let neritoUtils = require('./neritoUtils.js');

let CSVFileValidator = require('csv-file-validator');
const emailRegex = /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;
const phoneNumberRegex = /^\+?([0-9]{2})\)?[-. ]?([0-9]{2})[-. ]?([0-9]{4})[-. ]?([0-9]{4})$/;

let typeAccountConfig;
let bankIdConfig;

const config = {
    headers: [
        {
            name: 'phoneNumber',
            inputName: 'phoneNumber',
            required: true,
            requiredError: function (headerName, rowNumber, columnNumber) {
                return `${rowNumber},  ${headerName} is required in the ${columnNumber} column`;
            },
            validate: function (phoneNumber) {
                return isPhoneNumberValid(phoneNumber)
            },

            validateError: function (headerName, rowNumber, columnNumber) {
                return `${rowNumber},  ${headerName} is not valid in the ${columnNumber} column`;
            }
        },
        {
            name: 'name',
            inputName: 'name',
            required: true,
            requiredError: function (headerName, rowNumber, columnNumber) {
                return `${rowNumber},  ${headerName} is required in the ${columnNumber} column`;
            },
            validate: function (phoneNumber) {
                return isPhoneNumberValid(phoneNumber)
            },
            validateError: function (headerName, rowNumber, columnNumber) {
                return `${rowNumber},  ${headerName} is not valid in the ${columnNumber} column`;
            }            
        },
        {
            name: 'email',
            inputName: 'email',
            required: true,
            requiredError: function (headerName, rowNumber, columnNumber) {
                return `${rowNumber},  ${headerName} is required in the ${columnNumber} column`;
            },
            unique: true,
            uniqueError: function (headerName, rowNumber, columnNumber) {
                return `${rowNumber},  ${headerName} is not unique in the ${columnNumber} column`;
            },
            validate: function (email) {
                return isEmailValid(email)
            },
            validateError: function (headerName, rowNumber, columnNumber) {
                return `${rowNumber},  ${headerName} is not valid in the ${columnNumber} column`;
            }
        },
        {
            name: 'contact',
            inputName: 'contact',
            required: true,
            requiredError: function (headerName, rowNumber, columnNumber) {
                return `${rowNumber},  ${headerName} is required in the ${columnNumber} column`;
            }
        },
        {
            name: 'rfc',
            inputName: 'rfc',
            required: true,
            requiredError: function (headerName, rowNumber, columnNumber) {
                return `${rowNumber},  ${headerName} is required in the ${columnNumber} column`;
            },
            unique: true,
            uniqueError: function (headerName, rowNumber, columnNumber) {
                return `${rowNumber},  ${headerName} is not unique in the ${columnNumber} column`;
            },
        },
        {
            name: 'typeAccount',
            inputName: 'typeAccount',
            required: false,
            requiredError: function (headerName, rowNumber, columnNumber) {
                return `${rowNumber},  ${headerName} is required in the ${columnNumber} column`;
            },
            validate: function (typeAccount) {
                return isTypeAccountValid(typeAccount)
            },
            validateError: function (headerName, rowNumber, columnNumber) {
                return `${rowNumber},  ${headerName} is not valid in the ${columnNumber} column`;
            }
        },
        {
            name: 'bankId',
            inputName: 'bankId',
            required: false,
            requiredError: function (headerName, rowNumber, columnNumber) {
                return `${rowNumber},  ${headerName} is required in the ${columnNumber} column`;
            },
            validate: function (bankId) {
                return isBankIdValid(bankId)
            },
            validateError: function (headerName, rowNumber, columnNumber) {
                return `${rowNumber},  ${headerName} is not valid in the ${columnNumber} column`;
            }
        },
        {
            name: 'accountClabe',
            inputName: 'accountClabe',
            required: false,
            requiredError: function (headerName, rowNumber, columnNumber) {
                return `${rowNumber},  ${headerName} is required in the ${columnNumber} column`;
            }
        },
    ]
}

module.exports = {
    validateCsv: async function (data) {

        let csvDataResult;

        typeAccountConfig = await service.getBankConfigByType("account_type");
        bankIdConfig = await service.getBankConfigByType("bank_id");

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

function isTypeAccountValid(type_account) {

    let isValid = false;
    if (!type_account || typeAccountConfig == null || typeAccountConfig == undefined) {
        return isValid;
    }
    let result = JSON.parse(typeAccountConfig);
    if (result == null || result == undefined) {
        return isValid;
    }
    let ids = Object.keys(result);
    if (ids.length > 0 && ids.indexOf(type_account) >= 0) {
        isValid = true;
    }

    return isValid;
}

function isBankIdValid(bank_id) {

    let isValid = false;
    if (!bank_id || bankIdConfig == null || bankIdConfig == undefined) {
        return isValid;
    }
    let result = JSON.parse(bankIdConfig);
    if (result == null || result == undefined) {
        return isValid;
    }
    let ids = Object.keys(result);
    if (ids.length > 0 && ids.indexOf(bank_id) >= 0) {
        isValid = true;
    }

    return isValid;
}

function isPhoneNumberValid(phoneNumber) {
    if (!phoneNumber) {
        return false;
    }
    if (phoneNumber.length > 20) {
        return false;
    }
    var valid = phoneNumberRegex.test(phoneNumber);
    if (!valid) {
        return false;
    }
    return true;
}