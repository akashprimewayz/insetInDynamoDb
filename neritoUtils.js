// Load the AWS SDK for Node.js
let AWS = require('aws-sdk');
const csvtojson = require('csvtojson');
const { v4: uuidv4 } = require('uuid')
const s3 = new AWS.S3();
const csvHeaders = ["phoneNumber", "password", "firstName", "lastName", "email", "birthdate", "gender", "address", "state", "city", "rfc"];
const emailRegex = /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;

// Set the region
AWS.config.update({ region: 'us-east-2' });

// Create DynamoDB service object
const documentClient = new AWS.DynamoDB.DocumentClient();


module.exports = {

    isFileExist: async function (fileName) {
        const params = {
            Bucket: 'employee-csv/temp',
            Key: fileName
        };
        const exists = await s3
            .headObject(params)
            .promise()
            .then(
                () => true,
                err => {
                    if (err.code === 'NotFound') {
                        return false;
                    }
                    throw err;
                }
            );
        return exists;
    },

    readCsvFromS3: async function (fileName) {
        const params = {
            Bucket: 'employee-csv/temp',
            Key: fileName
        };
        try {
            const stream = s3.getObject(params).createReadStream();
            const json = await csvtojson().fromStream(stream);
            return json;
        } catch (err) {
            console.log("Failed to upload file", err);
            throw new Error(err);
        };
    },


    validateCSV: function (json) {
        console.log(json);
        let errorresponse = [];
        let rows = [];
        let isError = false;
        try {
            let jsonHeader = Object.keys(json[0]);
            csvHeaders.forEach(element => {
                if (!jsonHeader.includes(element)) {
                    rows.push(element);
                    console.log(element)
                }
            });

            if (rows.length != 0) {
                let error = {};
                let errorJson = {};
                errorJson.header = "Please add these header";
                errorJson.headers = rows;
                error.Error = errorJson;
                console.log(error);
                return error;
            }

            if (json.length < 1) {
                let error = {};
                let errorJson = {};
                errorJson.rowCount = "CSV file should contain at least 10 record";
                error.Error = errorJson;
                console.log(error);
                return error;
            }

            for (let i = 0; i < json.length; i++) {
                let errorType = [];
                let isBlankLine = validateBlankrecord(json[i]);

                if (isBlankLine) {
                    errorType.push("BLK");
                    json[i].errorType = errorType;
                }
                let isInvalidLine = validateInvalidRecord(json[i]);

                if (isInvalidLine) {
                    errorType.push("INV");
                    json[i].errorType = errorType;
                }
                let isDuplicateLine = false;

                for (let j = i + 1; j < json.length; j++) {
                    if (json[i]['email'].localeCompare(json[j]['email']) == 0) {
                        errorType.push("DUP");
                        json[i].errorType = errorType;
                        isDuplicateLine = true;
                    }
                }
                if (isBlankLine || isInvalidLine || isDuplicateLine) {
                    json[i].lineNumber = i + 1;
                    errorresponse.push(json[i]);
                    isError = true;
                }
            }
            if (isError) {
                return errorresponse;
            } else {
                return null;
            }
        } catch (err) {
            console.log("Failed to upload file", err);
            return null;
        }
    },

    insertDataIntoDb: async function (data) {
        const ddbTable = 'Organizations'

        const batches = []
        const BATCH_SIZE = 25

        while (data.length > 0) {
            batches.push(data.splice(0, BATCH_SIZE))
        }

        console.log('Batches: ', batches.length)

        let batchCount = 0

        // Save each batch
        return await Promise.all(
            batches.map(async (itemData) => {
                // Set up the params object for the DDB call
                const params = {
                    RequestItems: {}
                }
                params.RequestItems[ddbTable] = []

                itemData.forEach((item) => {
                    // Build params
                    // console.log(item)
                    let uniqueId = uuidv4();
                    params.RequestItems[ddbTable].push({
                        PutRequest: {
                            Item: {
                                "Id": "ORG#" + uniqueId,
                                "SK": "EMP#" + uniqueId,
                                "PhoneNumber": item['phoneNumber'],
                                "Password": item['password'],
                                "FirstName": item['firstName'],
                                "LastName": item['lastName'],
                                "Email": item['email'],
                                "Birthdate": item['birthdate'],
                                "Gender": item['gender'],
                                "Address": item['address'],
                                "State": item['state'],
                                "City": item['city'],
                                "Rfc": item['rfc']
                            }
                        }
                    })
                })
                // Push to DynamoDB in batches
                batchCount++
                console.log('Trying batch: ', batchCount)
                const result = await documentClient.batchWrite(params).promise()
                console.log(
                    'Success: ',
                    typeof result === 'string'
                        ? result.substr(0, 100)
                        : JSON.stringify(result).substr(0, 100)
                )
                return result;
            })
        ).then((values) => {
            return values;
        }).catch(error => {
            console.error('Error: ', error);
            throw new Error(error);
        });
    }
};
function validateBlankrecord(jsonObj) {
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
}

function validateInvalidRecord(jsonObj) {
    let isError = false;

    if (jsonObj != null && !isEmailValid(jsonObj.email)) {
        console.log("Invalid1")
        isError = true;
    }
    let reg = new RegExp('^[0-9]+$');
    if (jsonObj != null && !reg.test(jsonObj.phoneNumber)) {
        console.log("Invalid2")
        isError = true;
    }

    return isError;
}

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
