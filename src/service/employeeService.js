// Load the AWS SDK for Node.js
let constant = require('../constants/constant.js');
let service = require('../service/service.js');
let api = require('../api/apiResourse');
let neritoUtils = require('../utill/neritoUtils.js');

let AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const s3 = new AWS.S3();

// Set the region
//const accessKeyId = process.env.accessKeyId
//const secretAccessKey = process.env.secretAccessKey
const region = process.env.region;
const employee_table = process.env.employee_table;
const config_table = process.env.config_table;
const x_api_key = process.env.x_api_key;

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
    insertDataIntoDb: async function (data, orgId) {

        const batches = [];
        const BATCH_SIZE = 25;

        while (data.length > 0) {
            batches.push(data.splice(0, BATCH_SIZE));
        }
        let batchCount = 0;
        let empList = [];
        // Save each batch
        return await Promise.all(
            batches.map(async (itemData) => {
                // Set up the params object for the DDB call
                const params = {
                    RequestItems: {}
                };
                params.RequestItems[employee_table] = [];

                let SK = (orgId + "#" + monthYear).trim();
                itemData.forEach((item) => {
                    //Create unique id for employee
                    let Id = ("EMP#" + uuidv4()).trim();
                    //Create list of employee to send to Nerito
                    let empJson = {};
                    empJson.employeeId = Id;
                    empJson.phoneNumber = item['phoneNumber'];
                    empJson.companyId = orgId;
                    empList.push(empJson);

                    //Create param to save employee in batches into dynamoDB
                    params.RequestItems[employee_table].push({
                        PutRequest: {
                            Item: {
                                "Id": Id,
                                "SK": SK,
                                "CompanyId": orgId,
                                "OperationType": "AC",
                                "PhoneNumber": item['phoneNumber'],
                                "Name": item['name'],
                                "Email": item['email'],
                                "Contact": item['contact'],
                                "RFC": item['rfc'],
                                "AccountType": item['typeAccount'],
                                "BankId": item['bankId'],
                                "AccountClabe": item['accountClabe'],
                                "Currency": "PESOS",
                                "Status": true,
                                "Month": month,
                                "Year": year,
                                "DateModified": neritoUtils.formatDate(date),
                                "State": constant.freezeState.PENDING
                            }
                        }
                    });
                });
                // Push to DynamoDB in batches
                batchCount++;
                let result = await documentClient.batchWrite(params).promise();
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
            })
        ).then(async function (values) {
            try {
                const result = await createEmployeeInNerito(empList);
                if (result.status == 200 && result.data.success) {
                    return values;
                } else {
                    await deleteEmpList(empList,orgId);
                    return null;
                }
            } catch (error) {
                try {
                    await deleteEmpList(empList,orgId);
                } catch (error) {
                    return null;
                }
                return null;
            }

        }).catch(error => {
            console.error('Error: ', error);
            throw new Error(error);
        });
    },
    getEmpDataByMonthAndYear: async function (orgId) {
        let Id = (orgId + "#" + monthYear).trim();

        const params = {
            TableName: employee_table,
            IndexName: 'ListEMP',
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
    getEmpCurrentMonthIdAndSK: async function (orgId) {
        let Id = (orgId + "#" + monthYear).trim();

        const params = {
            TableName: employee_table,
            IndexName: 'ListEMP',
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
        return await service.getAllData(params);
    },
    getEmpFreezeData: async function (orgId, month, year) {
        let Id = (orgId + "#" + monthYear).trim();

        const params = {
            TableName: employee_table,
            IndexName: 'ListEMP',
            KeyConditionExpression: '#SK = :SK',
            FilterExpression: "#Status=:Status",
            ProjectionExpression: "CompanyId, OperationType, #Name, RFC, PhoneNumber, Contact, Email,  AccountType, Currency, BankId, AccountClabe, Id, SK",

            ExpressionAttributeNames: {
                "#SK": "SK",
                "#Status": "Status",
                "#Name": "Name",
            },
            ExpressionAttributeValues: {
                ":SK": Id,
                ":Status": true
            },
        };
        return await service.query(params);
    },
    updateEmplyee: async function (Id, SK,freezeState) {
        let params = {
            TableName: employee_table,
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
        let result = await service.query(params);
        return result.Items[0].Config;
    },
    deleteEmployees: async function (data) {
        return deleteEmployees(data);
    }    
};

async function createEmployeeInNerito(data) {
    let axiosConfig = {
        headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            "Access-Control-Allow-Origin": "*",
            "x-api-key": x_api_key
        }
    };
    try {
        const response = await api.postApiClient(constant.apiCreateUserUrl, axiosConfig, data);
        //console.log("response", response);
        return response;
    } catch (err) {
        throw err;
    }
}

async function deleteEmployees(data) {
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
            params.RequestItems[employee_table] = [];
            itemData.forEach((item) => {
                //Create param to save employee in batches into dynamoDB
                params.RequestItems[employee_table].push({
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


async function deleteEmpList(empList, orgId) {
    let SK = (orgId + "#" + monthYear).trim();
    try {
        if (!neritoUtils.isEmpty(empList)) {
            let employees = empList.map(obj => {
                obj.Id = empList[obj.employeeId];
                obj.SK = SK;
                return obj;
            });
            await deleteEmployees(employees);
        }
    } catch (err) {
        console.error("Failed to delete employee list", err);
        throw err;
    }
}

