// Load the AWS SDK for Node.js
let AWS = require('aws-sdk');
const csvtojson = require('csvtojson');
let neritoUtils = require('./neritoUtils.js');

const { v4: uuidv4 } = require('uuid');
const s3 = new AWS.S3();
const csvHeaders = ["phoneNumber", "password", "firstName", "lastName", "email", "birthdate", "gender", "address", "state", "city", "rfc"];

// Set the region
//const accessKeyId = process.env.accessKeyId
//const secretAccessKey = process.env.secretAccessKey
const region = process.env.region
const bucket_name = process.env.bucket_name
const ddbTable = process.env.table

AWS.config.update(
    {
        //accessKeyId,
        //secretAccessKey,
        region
    }
);
// Create DynamoDB service object
const documentClient = new AWS.DynamoDB.DocumentClient();


module.exports = {

    isFileExist: async function (fileName) {
        const params = {
            Bucket: bucket_name,
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
            Bucket: bucket_name,
            Key: fileName
        };
        try {
            const stream = s3.getObject(params).createReadStream();
            const json = await csvtojson().fromStream(stream);
            return json;
        } catch (err) {
            console.log("Failed to upload file", err);
            throw new Error(err);
        }
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
                    console.log(element);
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
                let isBlankLine = neritoUtils.validateBlankrecord(json[i]);

                if (isBlankLine) {
                    errorType.push("BLK");
                    json[i].errorType = errorType;
                }
                let isInvalidLine = neritoUtils.validateInvalidRecord(json[i]);

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
                        break;
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

    insertDataIntoDb: async function (data, orgId) {

        const batches = [];
        const BATCH_SIZE = 25;

        while (data.length > 0) {
            batches.push(data.splice(0, BATCH_SIZE));
        }

        console.log('Batches: ', batches.length);

        let batchCount = 0;

        // Save each batch
        return await Promise.all(
            batches.map(async (itemData) => {
                // Set up the params object for the DDB call
                const params = {
                    RequestItems: {}
                };
                params.RequestItems[ddbTable] = [];

                itemData.forEach((item) => {
                    // Build params
                    // console.log(item)
                    let uniqueId = uuidv4();
                    params.RequestItems[ddbTable].push({
                        PutRequest: {
                            Item: {
                                "Id": orgId,
                                "SK": "EMP#" + uniqueId,
                                "PhoneNumber": item['phoneNumber'],
                                "Password": item['password'],
                                "FirstName": item['firstName'],
                                "LastName": item['lastName'],
                                "Email": item['email'],
                                "Birthdate": neritoUtils.formatDate(neritoUtils.stringToDate(item['birthdate'], "dd/MM/yyyy", "/")),
                                "Gender": item['gender'],
                                "Address": item['address'],
                                "State": item['state'],
                                "City": item['city'],
                                "RFC": item['rfc']
                            }
                        }
                    });
                });
                // Push to DynamoDB in batches
                batchCount++;
                console.log('Trying batch: ', batchCount);
                const result = await documentClient.batchWrite(params).promise();
                console.log(
                    'Success: ',
                    typeof result === 'string'
                        ? result.substr(0, 100)
                        : JSON.stringify(result).substr(0, 100)
                );
                return result;
            })
        ).then((values) => {
            return values;
        }).catch(error => {
            console.error('Error: ', error);
            throw new Error(error);
        });
    },
    getDatabyKey: async function (orgId) {
        const params = {
            TableName: ddbTable,
            KeyConditionExpression: '#Id = :Id and begins_with(#SK, :SK)',
            ExpressionAttributeNames: {
                "#Id": "Id",
                "#SK": 'SK'
            },
            ExpressionAttributeValues: {
                ":Id": orgId,
                ":SK": "EMP#"
            }
        };
        let result = await documentClient.query(params)
            .promise()
            .catch(error => {
                console.error('Error: ', error);
                throw new Error(error);
            });
        return result;
    },
    getFileDetailsById: async function (orgId, empId) {
        const params = {
            TableName: ddbTable,
            KeyConditionExpression: '#Id = :Id and #SK= :SK',
            ExpressionAttributeNames: {
                "#Id": "Id",
                "#SK": "SK"
            },
            ExpressionAttributeValues: {
                ":Id": orgId,
                ":SK": empId
            }
        };
        let result = await documentClient.query(params)
            .promise()
            .catch(error => {
                console.error('Error: ', error);
                throw new Error(error);
            });
        return result;
    },

    updateCsvDetails: async function (orgId, fileId) {
        console.log("in updateCsvDetails");
        let params = {
            TableName: ddbTable,
            Key: {
                "Id": orgId,
                "SK": fileId
            },
            UpdateExpression: "set CsvStatus = :CsvStatus",
            ExpressionAttributeValues: {
                ":CsvStatus": neritoUtils.csvStatus.COMPLETED
            },
            ReturnValues: "UPDATED_NEW"
        };
        let dbData;
        try {
            dbData = await documentClient.update(params, function (err, data) {
                if (err) {
                    console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
                    return false;
                }
            }).promise();
        } catch (error) {
            console.error("Something went wrong while adding data into Db", JSON.stringify(error, null, 2));
            return false
        }
        return dbData;
    }
};