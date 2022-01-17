let service = require('./service.js');
let neritoUtils = require('./neritoUtils.js');

let CSVFileValidator = require('csv-file-validator');
const emailRegex = /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;
const phoneNumberRegex = /^\+?([0-9]{2})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;

let typeAccountConfig;
let bankIdConfig;
let config = {};

const headers = [
    {
        name: 'phoneNumber',
        inputName: 'phoneNumber',
        required: false,
        requiredError: function (headerName, rowNumber, columnNumber) {
            return `${rowNumber},  ${headerName} is required in the ${columnNumber} column`;
        },
        unique: false,
        uniqueError: function (headerName, rowNumber) {
            return `${rowNumber},  ${headerName} is not unique`;
        },
        validate: function (phoneNumber) {
            return isPhoneNumberValid(phoneNumber);
        },
        validateError: function (headerName, rowNumber, columnNumber) {
            return `${rowNumber},  ${headerName} is not valid in the ${columnNumber} column`;
        }
    },
    {
        name: 'name',
        inputName: 'name',
        required: false,
        requiredError: function (headerName, rowNumber, columnNumber) {
            return `${rowNumber},  ${headerName} is required in the ${columnNumber} column`;
        },
        unique: false,
        uniqueError: function (headerName, rowNumber) {
            return `${rowNumber},  ${headerName} is not unique`;
        },
        validate: function (name) {
            return isValidMaxLength("name", name);
        },
        validateError: function (headerName, rowNumber, columnNumber) {
            return `${rowNumber},  ${headerName} is not valid in the ${columnNumber} column`;
        }
    },
    {
        name: 'email',
        inputName: 'email',
        required: false,
        requiredError: function (headerName, rowNumber, columnNumber) {
            return `${rowNumber},  ${headerName} is required in the ${columnNumber} column`;
        },
        unique: false,
        uniqueError: function (headerName, rowNumber) {
            return `${rowNumber},  ${headerName} is not unique`;
        },
        validate: function (email) {
            return isEmailValid(email);
        },
        validateError: function (headerName, rowNumber, columnNumber) {
            return `${rowNumber},  ${headerName} is not valid in the ${columnNumber} column`;
        }
    },
    {
        name: 'contact',
        inputName: 'contact',
        required: false,
        requiredError: function (headerName, rowNumber, columnNumber) {
            return `${rowNumber},  ${headerName} is required in the ${columnNumber} column`;
        },
        unique: false,
        uniqueError: function (headerName, rowNumber) {
            return `${rowNumber},  ${headerName} is not unique`;
        },
        validate: function (contact) {
            return isValidMaxLength("contact", contact);
        },
        validateError: function (headerName, rowNumber, columnNumber) {
            return `${rowNumber},  ${headerName} is not valid in the ${columnNumber} column`;
        }
    },
    {
        name: 'rfc',
        inputName: 'rfc',
        required: false,
        requiredError: function (headerName, rowNumber, columnNumber) {
            return `${rowNumber},  ${headerName} is required in the ${columnNumber} column`;
        },
        unique: false,
        uniqueError: function (headerName, rowNumber) {
            return `${rowNumber},  ${headerName} is not unique`;
        },
        validate: function (rfc) {
            return isValidMaxLength("rfc", rfc);
        },
        validateError: function (headerName, rowNumber, columnNumber) {
            return `${rowNumber},  ${headerName} is not valid in the ${columnNumber} column`;
        }
    },
    {
        name: 'typeAccount',
        inputName: 'typeAccount',
        required: false,
        requiredError: function (headerName, rowNumber, columnNumber) {
            return `${rowNumber},  ${headerName} is required in the ${columnNumber} column`;
        },
        unique: false,
        uniqueError: function (headerName, rowNumber) {
            return `${rowNumber},  ${headerName} is not unique`;
        },
        validate: function (typeAccount) {
            return isTypeAccountValid(typeAccount);
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
        unique: false,
        uniqueError: function (headerName, rowNumber) {
            return `${rowNumber},  ${headerName} is not unique`;
        },
        validate: function (bankId) {
            return isBankIdValid(bankId);
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
        },
        unique: false,
        uniqueError: function (headerName, rowNumber) {
            return `${rowNumber},  ${headerName} is not unique`;
        },
        validate: function (accountClabe) {
            return isValidMaxLength("accountClabe", accountClabe);
        },
        validateError: function (headerName, rowNumber, columnNumber) {
            return `${rowNumber},  ${headerName} is not valid in the ${columnNumber} column`;
        }
    },
];


module.exports = {
    validateCsv: async function (data, orgId) {
        let csvDataResult;
        let validationJson = await service.getOrgDataById(orgId);
        if (!neritoUtils.isEmpty(validationJson) && !neritoUtils.isEmpty(validationJson.Items) && !neritoUtils.isEmpty(validationJson.Items[0]) && !neritoUtils.isEmpty(validationJson.Items[0].FileValidation)) {
            validationJson = validationJson.Items[0].FileValidation;
            validationJson = JSON.parse(JSON.stringify(validationJson));
            let ConfigMap = headers.map(obj => {
                obj.required = validationJson[obj.name]['required'];
                obj.unique = validationJson[obj.name]['unique'];
                return obj;
            });
            config.headers = ConfigMap;
        } else {
            config.headers = headers;
        }

        typeAccountConfig = await service.getBankConfigByType(neritoUtils.config.ACCOUNT_TYPE);
        bankIdConfig = await service.getBankConfigByType(neritoUtils.config.BANK_ID);

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
    if (neritoUtils.isEmpty(email)) {
        return true;
    }
    if (email.length > neritoUtils.maxLength.EMAIL) {
        return false;
    }
    var valid = emailRegex.test(email);
    if (!valid) {
        return false;
    }
    return true;
}

function isTypeAccountValid(type_account) {
    if (neritoUtils.isEmpty(type_account)) {
        return true;
    }
    let isValid = false;
    if (type_account.length > neritoUtils.maxLength.TYPEACCOUNT) {
        return isValid;
    }
    if (neritoUtils.isEmpty(typeAccountConfig)) {
        return isValid;
    }
    let result = JSON.parse(JSON.stringify(typeAccountConfig));
    if (neritoUtils.isEmpty(result)) {
        return isValid;
    }
    let ids = Object.keys(result);
    if (ids.length > 0 && ids.indexOf(type_account) >= 0) {
        isValid = true;
    }

    return isValid;
}

function isBankIdValid(bank_id) {
    if (neritoUtils.isEmpty(bank_id)) {
        return true;
    }
    let isValid = false;
    if (bank_id.length > neritoUtils.maxLength.BANKID) {
        return isValid;
    }
    if (neritoUtils.isEmpty(bankIdConfig)) {
        return isValid;
    }
    let result = JSON.parse(JSON.stringify(bankIdConfig));

    if (neritoUtils.isEmpty(result)) {
        return isValid;
    }
    let ids = Object.keys(result);
    if (ids.length > 0 && ids.indexOf(bank_id) >= 0) {
        isValid = true;
    }

    return isValid;
}

function isPhoneNumberValid(phoneNumber) {
    if (neritoUtils.isEmpty(phoneNumber)) {
        return true;
    } else if (phoneNumber.length != neritoUtils.maxLength.PHONENUMBER) {
        return false;
    } else if (!phoneNumberRegex.test(phoneNumber)) {
        return false;
    } else {
        return true;
    }
}

function isValidMaxLength(headerName, value) {
    let isValid = true;
    headerName = headerName.toUpperCase().trim();
    if (value.length > neritoUtils.maxLength[headerName]) {
        isValid = false;
    }
    return isValid;
}