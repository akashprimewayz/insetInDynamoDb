let neritoUtils = require('../utill/neritoUtils.js');
let constant = require('../constants/constant.js');
let CSVFileValidator = require('csv-file-validator');

const config = {
    headers: [
        {
            name: 'userName',
            inputName: 'userName',
            required: true,
            requiredError: function (headerName, rowNumber, columnNumber) {
                return `${rowNumber},  ${headerName} is required in the ${columnNumber} column`;
            },
            unique: false,
            uniqueError: function (headerName, rowNumber) {
                return `${rowNumber},  ${headerName} is not unique`;
            },
            validate: function (userName) {
                return isValidMaxLength("userName", userName);
            },
            validateError: function (headerName, rowNumber, columnNumber) {
                return `${rowNumber},  ${headerName} is not valid in the ${columnNumber} column`;
            }
        },
        {
            name: 'destinationAccount',
            inputName: 'destinationAccount',
            required: true,
            requiredError: function (headerName, rowNumber, columnNumber) {
                return `${rowNumber},  ${headerName} is required in the ${columnNumber} column`;
            },
            unique: true,
            uniqueError: function (headerName, rowNumber) {
                return `${rowNumber},  ${headerName} is not unique`;
            },
            validate: function (destinationAccount) {
                return isValidMaxLengthNumber("destinationAccount", destinationAccount);
            },
            validateError: function (headerName, rowNumber, columnNumber) {
                return `${rowNumber},  ${headerName} is not valid in the ${columnNumber} column`;
            }
        },
        {
            name: 'importAmount',
            inputName: 'importAmount',
            required: true,
            requiredError: function (headerName, rowNumber, columnNumber) {
                return `${rowNumber},  ${headerName} is required in the ${columnNumber} column`;
            },
            unique: false,
            uniqueError: function (headerName, rowNumber) {
                return `${rowNumber},  ${headerName} is not unique`;
            },
            validate: function (importAmount) {
                return isValidMaxLengthNumber("importAmount", importAmount);
            },
            validateError: function (headerName, rowNumber, columnNumber) {
                return `${rowNumber},  ${headerName} is not valid in the ${columnNumber} column`;
            }
        },
        {
            name: 'reference',
            inputName: 'reference',
            required: true,
            requiredError: function (headerName, rowNumber, columnNumber) {
                return `${rowNumber},  ${headerName} is required in the ${columnNumber} column`;
            },
            unique: false,
            uniqueError: function (headerName, rowNumber) {
                return `${rowNumber},  ${headerName} is not unique`;
            },
            validate: function (reference) {
                return isDateValid(reference);
            },
            validateError: function (headerName, rowNumber, columnNumber) {
                return `${rowNumber},  ${headerName} is not valid in the ${columnNumber} column`;
            }
        },
        {
            name: 'description',
            inputName: 'description',
            required: true,
            requiredError: function (headerName, rowNumber, columnNumber) {
                return `${rowNumber},  ${headerName} is required in the ${columnNumber} column`;
            },
            unique: false,
            uniqueError: function (headerName, rowNumber) {
                return `${rowNumber},  ${headerName} is not unique`;
            },
            validate: function (description) {
                return isValidMaxLength("description", description);
            },
            validateError: function (headerName, rowNumber, columnNumber) {
                return `${rowNumber},  ${headerName} is not valid in the ${columnNumber} column`;
            }
        },
        {
            name: 'iva',
            inputName: 'iva',
            required: true,
            requiredError: function (headerName, rowNumber, columnNumber) {
                return `${rowNumber},  ${headerName} is required in the ${columnNumber} column`;
            },
            unique: false,
            uniqueError: function (headerName, rowNumber) {
                return `${rowNumber},  ${headerName} is not unique`;
            },
            validate: function (iva) {
                return isValidMaxLengthNumber("IVA", iva);
            },
            validateError: function (headerName, rowNumber, columnNumber) {
                return `${rowNumber},  ${headerName} is not valid in the ${columnNumber} column`;
            }
        },
        {
            name: 'beneficiaryEmail',
            inputName: 'beneficiaryEmail',
            required: true,
            requiredError: function (headerName, rowNumber, columnNumber) {
                return `${rowNumber},  ${headerName} is required in the ${columnNumber} column`;
            },
            unique: true,
            uniqueError: function (headerName, rowNumber) {
                return `${rowNumber},  ${headerName} is not unique`;
            },
            validate: function (beneficiaryEmail) {
                return isEmailValid(beneficiaryEmail);
            },
            validateError: function (headerName, rowNumber, columnNumber) {
                return `${rowNumber},  ${headerName} is not valid in the ${columnNumber} column`;
            }
        },
        {
            name: 'applicationDate',
            inputName: 'applicationDate',
            required: true,
            requiredError: function (headerName, rowNumber, columnNumber) {
                return `${rowNumber},  ${headerName} is required in the ${columnNumber} column`;
            },
            unique: false,
            uniqueError: function (headerName, rowNumber) {
                return `${rowNumber},  ${headerName} is not unique`;
            },
            validate: function (applicationDate) {
                return isDateValid(applicationDate);
            },
            validateError: function (headerName, rowNumber, columnNumber) {
                return `${rowNumber},  ${headerName} is not valid in the ${columnNumber} column`;
            }
        },
        {
            name: 'paymentInstructions',
            inputName: 'paymentInstructions',
            required: true,
            requiredError: function (headerName, rowNumber, columnNumber) {
                return `${rowNumber},  ${headerName} is required in the ${columnNumber} column`;
            },
            unique: false,
            uniqueError: function (headerName, rowNumber) {
                return `${rowNumber},  ${headerName} is not unique`;
            },
            validate: function (paymentInstructions) {
                return isValidMaxLength("paymentInstructions", paymentInstructions);
            },
            validateError: function (headerName, rowNumber, columnNumber) {
                return `${rowNumber},  ${headerName} is not valid in the ${columnNumber} column`;
            }
        }
    ]
};

module.exports = {
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
    if (neritoUtils.isEmpty(email)) {
        return false;
    }
    if (email.length > constant.maxLength.EMAIL) {
        return false;
    }
    var valid = constant.emailRegex.test(email);
    if (!valid) {
        return false;
    }
    return true;
}

function isDateValid(date) {
    if (neritoUtils.isEmpty(date)) {
        return false;
    }
    if (date.length > constant.maxLength.REFERENCE) {
        return false;
    }
    if (!neritoUtils.isValidDate(date)) {
        return false;
    }
    return true;
}
function isValidMaxLength(headerName, value) {
    if (neritoUtils.isEmpty(value)) {
        return false;
    }
    headerName = headerName.toUpperCase().trim();
    if (value.length > constant.maxLength[headerName]) {
        return false;
    }
    return true;
}
function isValidMaxLengthNumber(headerName, value) {
    if (neritoUtils.isEmpty(value) || isNaN(value)) {
        return false;
    }
    let isValid = true;
    headerName = headerName.toUpperCase().trim();
    if (value.length > constant.maxLength[headerName]) {
        return false;
    }
    return true;
}