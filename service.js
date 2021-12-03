// Load the AWS SDK for Node.js
let AWS = require('aws-sdk');
let neritoUtils = require('./neritoUtils.js');
const { v4: uuidv4 } = require('uuid');

const s3 = new AWS.S3();

// Set the region
//const accessKeyId = process.env.accessKeyId
//const secretAccessKey = process.env.secretAccessKey
const region = process.env.region
const bucket_name = process.env.bucket_name
const payroll_output_bucket_name = process.env.payroll_output_bucket_name
const organization_table = process.env.organization_table
const config_table = process.env.config_table

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
            const data = await s3.getObject(params).promise();
            return data;
        } catch (err) {
            console.error("Failed to get file from S3", err);
            throw new Error(err);
        }
    },
    putObjectOnS3: async function (fullFileName, fileContent) {

        let isUploaded = false;
        // Upload the file to S3
        var bucketParams = {};
        bucketParams.Bucket = payroll_output_bucket_name;
        bucketParams.Key = fullFileName;
        bucketParams.Body = fileContent;
        try {
            let putObjectPromise = await s3.putObject(bucketParams, function (err, data) {
                if (err) {
                    console.error("unable to upload file:" + fullFileName + "  ", JSON.stringify(err, null, 2));
                    return isUploaded;
                }
                if (data) {
                    isUploaded = true;
                    return isUploaded;
                }
            }).promise();
        } catch (err) {
            console.log("Something went wrong while uploading object on s3", err);
            isUploaded = false;
            return isUploaded;
        }
        return isUploaded;
    },
    insertDataIntoDb: async function (data, orgId) {
        console.log("datadatadatadatadata", data)
        const batches = [];
        const BATCH_SIZE = 25;

        while (data.length > 0) {
            batches.push(data.splice(0, BATCH_SIZE));
        }
        let batchCount = 0;

        // Save each batch
        return await Promise.all(
            batches.map(async (itemData) => {
                // Set up the params object for the DDB call
                const params = {
                    RequestItems: {}
                };
                params.RequestItems[organization_table] = [];
                let date = new Date();
                let month = date.getMonth() + 1;
                itemData.forEach((item) => {
                    // Build params
                    // console.error(item)
                    let uniqueId = uuidv4();
                    params.RequestItems[organization_table].push({
                        PutRequest: {
                            Item: {
                                "Id": orgId,
                                "SK": "EMP#" + uniqueId,
                                "PhoneNumber": item['phoneNumber'],
                                "Password": item['password'],
                                "FirstName": item['firstName'],
                                "LastName": item['lastName'],
                                "Email": item['email'],
                                "Birthdate": neritoUtils.formatDate(neritoUtils.dateconverter(item['birthdate'])),
                                "Gender": item['gender'],
                                "Address": item['address'],
                                "State": item['state'],
                                "City": item['city'],
                                "RFC": item['rfc'],
                                "AccountType": item['typeAccount'],
                                "BankId": item['bankId'],
                                "AccountClabe": item['accountClabe'],
                                "Status": true,
                                "Month": month,
                                "Year": date.getFullYear()
                            }
                        }
                    });
                });
                // Push to DynamoDB in batches
                batchCount++;
                console.log('Trying batch: ', batchCount);
                const result = await documentClient.batchWrite(params).promise();
                console.error(
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
            TableName: organization_table,
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
    getEmployeeDataByMonth: async function (orgId) {
        const params = {
            TableName: organization_table,
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
            TableName: organization_table,
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

    getEmpDataByMonthAndYear: async function (orgId, month, year) {
        const params = {
            TableName: organization_table,
            KeyConditionExpression: '#Id = :Id and begins_with(#SK, :SK)',
            FilterExpression: "#Month = :Month and #Year=:Year",

            ExpressionAttributeNames: {
                "#Id": "Id",
                "#SK": "SK",
                "#Year": "Year",
                "#Month": "Month"

            },
            ExpressionAttributeValues: {
                ":Id": orgId,
                ":SK": "EMP#",
                ":Year": year,
                ":Month": month
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
    getEmpFreezeData: async function (orgId, month, year) {
        const params = {
            TableName: organization_table,
            KeyConditionExpression: '#Id = :Id and begins_with(#SK, :SK)',
            FilterExpression: "#Month = :Month and #Year=:Year and #Status=:Status",
            ProjectionExpression: "AccountClabe, AccountType, AccountUsers, Address, BankId, Birthdate, City, Email, FirstName, LastName, Gender, Password, PhoneNumber, RFC, #State",

            ExpressionAttributeNames: {
                "#Id": "Id",
                "#SK": "SK",
                "#Year": "Year",
                "#Month": "Month",
                "#Status": "Status",
                "#State": "State",                
            },
            ExpressionAttributeValues: {
                ":Id": orgId,
                ":SK": "EMP#",
                ":Year": year,
                ":Month": month,
                ":Status": true
            },
        };
        let result = await documentClient.query(params)
            .promise()
            .catch(error => {
                console.error('Error: ', error);
                throw new Error(error);
            });
        return result;
    },
    deleteRecordByIdAndSk: async function (Id, SK) {
        const params = {
            TableName: organization_table,
            Key: {
                Id: Id,
                SK: SK
            },
        };
        let result = await documentClient.delete(params)
            .promise()
            .catch(error => {
                console.error('Error: ', error);
                throw new Error(error);
            });
        return result;
    },
    updateCsvDetails: async function (orgId, fileId) {
        console.error("in updateCsvDetails");
        let params = {
            TableName: organization_table,
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
    },
    getBankConfigByType: async function (Type) {
        const params = {
            TableName: config_table,
            KeyConditionExpression: '#Type = :Type',
            ExpressionAttributeNames: {
                "#Type": "Type"
            },
            ExpressionAttributeValues: {
                ":Type": Type
            }
        };
        let result = await documentClient.query(params)
            .promise()
            .catch(error => {
                console.error('Error: ', error);
                throw new Error(error);
            });
        return result.Items[0].Config;
    },
};