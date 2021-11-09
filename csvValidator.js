let service = require('./service.js');
let neritoUtils = require('./neritoUtils.js');

let CSVFileValidator = require('csv-file-validator');
const emailRegex = /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;
let typeAccountConfig;
let bankIdConfig;

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
            },
            validate: function (birthdate) {
                return neritoUtils.isValidDate(birthdate)
            },
            validateError: function (headerName, rowNumber, columnNumber) {
                return `${headerName} is not valid in the ${rowNumber} row / ${columnNumber} column`
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
        },
        {
            name: 'typeAccount',
            inputName: 'typeAccount',
            required: true,
            requiredError: function (headerName, rowNumber, columnNumber) {
                return `${headerName} is required in the ${rowNumber} row / ${columnNumber} column`
            },
            validate: function (typeAccount) {
                return isTypeAccountValid(typeAccount)
            },
            validateError: function (headerName, rowNumber, columnNumber) {
                return `${headerName} is not valid in the ${rowNumber} row / ${columnNumber} column`
            }
        },
        {
            name: 'bankId',
            inputName: 'bankId',
            required: true,
            requiredError: function (headerName, rowNumber, columnNumber) {
                return `${headerName} is required in the ${rowNumber} row / ${columnNumber} column`
            },
            validate: function (bankId) {
                return isBankIdValid(bankId)
            },
            validateError: function (headerName, rowNumber, columnNumber) {
                return `${headerName} is not valid in the ${rowNumber} row / ${columnNumber} column`
            }
        },
        {
            name: 'accountClabe',
            inputName: 'accountClabe',
            required: true,
            requiredError: function (headerName, rowNumber, columnNumber) {
                return `${headerName} is required in the ${rowNumber} row / ${columnNumber} column`
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