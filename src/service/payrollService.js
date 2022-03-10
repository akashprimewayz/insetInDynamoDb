// Load the AWS SDK for Node.js
let constant = require('../constants/constant.js');
let service = require('../service/service.js');
let neritoUtils = require('../utill/neritoUtils.js');

let AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const s3 = new AWS.S3();

// Set the region
//const accessKeyId = process.env.accessKeyId
//const secretAccessKey = process.env.secretAccessKey
const region = process.env.region;
const payrolls_table = process.env.payrolls_table;
const config_table = process.env.config_table;

AWS.config.update(
    {
        //accessKeyId,
        //secretAccessKey,
        region
    }
);
// Create DynamoDB service object
const documentClient = new AWS.DynamoDB.DocumentClient();
let date = new Date();
let month = date.getMonth() + 1;
let year = date.getFullYear();
let monthYear = month + "-" + year;

module.exports = {
    insertDataIntoDb: async function (data, organization) {
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
                params.RequestItems[payrolls_table] = [];
                let SK = (organization.Id + "#" + monthYear).trim();
                itemData.forEach((item) => {
                    //Create unique id for payroll
                    let Id = ("PAYROLL#" + uuidv4()).trim();
                    params.RequestItems[payrolls_table].push({
                        PutRequest: {
                            Item: {
                                "Id": Id,
                                "SK": SK,
                                "CompanyId": organization.Id,
                                "Operation": "04",
                                "UserName": item['userName'],
                                "OriginAccount": organization.OriginAccount,
                                "Email": item['beneficiaryEmail'],
                                "DestinationAccount": neritoUtils.zeroAppenderOnLeft(item['destinationAccount'],constant.maxLength.DESTINATIONACCOUNT),
                                "RFC": organization.RFC,
                                "ImportAmount":neritoUtils.fixDecimalPlaces(item['importAmount']),
                                "ReferenceDate": neritoUtils.zeroAppenderOnLeft(item['reference'],constant.maxLength.REFERENCE),
                                "Description": item['description'],
                                "OriginCurrency": 1,
                                "DestinationCurrency": 1,
                                "IVA": "00000000000000",
                                "ApplicationDate": neritoUtils.formatDate(neritoUtils.dateconverter(item['applicationDate'])),
                                "PaymentInstructions": item['paymentInstructions'],
                                "Status": true,
                                "Month": month,
                                "Year": date.getFullYear(),
                                "DateModified": neritoUtils.formatDate(date),
                                "State": constant.freezeState.PENDING
                            }
                        }
                    });
                });
                // Push to DynamoDB in batches
                batchCount++;
                const result = await documentClient.batchWrite(params).promise();
                return result;
            })
        ).then((values) => {
            return values;
        }).catch(error => {
            console.error('Error: ', error);
            throw new Error(error);
        });
    },
    getPayrollDataByMonthAndYear: async function (orgId) {
        let Id = (orgId + "#" + monthYear).trim();
        const params = {
            TableName: payrolls_table,
            IndexName: 'list-payroll-index',
            KeyConditionExpression: '#SK = :SK',
            ExpressionAttributeNames: {
                "#SK": "SK",
            },
            ExpressionAttributeValues: {
                ":SK": Id,
            }
        };
        return await service.getAllData(params);
    },
    getPayrollCurrentMonthIdAndSK: async function (orgId) {
        let Id = (orgId + "#" + monthYear).trim();
        const params = {
            TableName: payrolls_table,
            IndexName: 'list-payroll-index',
            KeyConditionExpression: '#SK = :SK',
            FilterExpression: "#State = :StateError or #State = :StatePending",

            ProjectionExpression: "Id, SK",

            ExpressionAttributeNames: {
                "#SK": "SK",
                "#State": "State"
            },
            ExpressionAttributeValues: {
                ":SK": Id,
                ":StateError": 2,
                ":StatePending": 0
            }
        };
        return await service.query(params);
    },   
    getPayrollFreezeData: async function (orgId) {
        let Id = (orgId + "#" + monthYear).trim();

        const params = {
            TableName: payrolls_table,
            IndexName: 'list-payroll-index',
            KeyConditionExpression: '#SK = :SK',
            FilterExpression: "#Status=:Status",
            ExpressionAttributeNames: {
                "#SK": "SK",
                "#Status": "Status",
            },
            ExpressionAttributeValues: {
                ":SK": Id,
                ":Status": true
            },
        };
        return await service.query(params);
    },
    getConfigByType: async function (Type) {
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
        return await service.query(params).Items[0].Config;
    },
    updatePayroll: async function (Id, SK,freezeState) {
        let params = {
            TableName: payrolls_table,
            Key: {
                "Id": Id,
                "SK": SK
            },
            UpdateExpression: "set #State = :State",
            ExpressionAttributeNames: {
                "#State": "State"
            },
            ExpressionAttributeValues: {
                ":State": freezeState
            },
            ReturnValues: "UPDATED_NEW"
        };
        return await service.update(params);
    },
    deletePayrolls: async function (data) {
        return deletePayrolls(data);
    },    
};

 async function deletePayrolls(data) {
    const batches = [];
    const BATCH_SIZE = 25;
    data=data.Items;
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
            params.RequestItems[payrolls_table] = [];
            itemData.forEach((item) => {
                //Create param to save employee in batches into dynamoDB
                params.RequestItems[payrolls_table].push({
                    DeleteRequest: {
                        Key: {
                            "Id": item.Id,
                            "SK": item.SK
                        }
                    }
                });
            });
            // Push to DynamoDB in batches
            batchCount++;
            const result = await documentClient.batchWrite(params).promise();
            while (!neritoUtils.isEmpty(result.UnprocessedItems)) {
                const paramsUnprocessedItems = {
                    RequestItems: result.UnprocessedItems
                };
                try {
                    result = await documentClient.batchWrite(paramsUnprocessedItems);
                } catch (error) {
                    console.error("Error", error);
                }
            }
            return result;
        })
    ).then(async function (values) {
        return values;
    }).catch(error => {
        console.error('Error: ', error);
        throw new Error(error);
    });
}
