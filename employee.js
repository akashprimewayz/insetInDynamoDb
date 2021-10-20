let neritoUtils = require('./neritoUtils.js');

async function insertEmployee(fileName) {

    try {
        let isAllInserted = true;
        let csvJson;
        try {
            let isFileExist = await neritoUtils.isFileExist(fileName);
            if (!isFileExist) {
                console.log("CSV file not found with this Name: " + fileName);
                return errorResponseJson("NotFound", 400);
            }
        } catch (err) {
            console.log("CSV file not found with this Name: " + fileName, err);
            return errorResponseJson("Failed", 400);
        }

        try {
            csvJson = await neritoUtils.readCsvFromS3(fileName);
            if (csvJson == null) {
                console.log("Empty CSV File Found : " + fileName);
                return errorResponseJson("Empty", 400);
            }
        } catch (err) {
            console.log("Failed to Parse CSV File : " + fileName, err);
            return errorResponseJson("Failed", 400);
        }

        try {
            const errorJson = await neritoUtils.validateCSV(csvJson);
            if (errorJson != null) {
                console.log("Validation Error : " + fileName);
                return errorResponseJson(errorJson, 400);

            }
        } catch (err) {
            console.log("Failed to Parse CSV File : " + fileName, err);
            return errorResponseJson("Failed Validation", 400);
        }

        try {
            const result = await neritoUtils.insertDataIntoDb(csvJson);
            if (result != null && result != undefined && !isEmpty(result)) {
                let csvJson = JSON.parse(JSON.stringify(result));
                for (let i = 0; i < csvJson.length; i++) {
                    var obj = csvJson[i];
                    if (!obj.hasOwnProperty("UnprocessedItems")) {
                        isAllInserted = false;
                    }
                }
            }
            if (!isAllInserted) {
                console.log("Failed to Insert Data in Db: " + fileName);
                return errorResponseJson("Failed insertion", 400);

            }
        } catch (err) {
            console.log("Failed to insert data into db : " + fileName, err);
            return errorResponseJson("Failed Insertion", 400);
        }

        let response = {
            message: 'Successfully Inserted',
        };
        return SuccessResponseJson(response, 200);
    } catch (err) {
        console.log("Failed to insert data into db : " + fileName, err);
        return errorResponseJson("Failed Insertion", 402);
    }
}

function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}

function errorResponseJson(message, code) {
    let error = {};
    let Error = {};
    Error.Errors = message;
    error.isBase64Encoded = false;
    error.statusCode = code;
    error.body = JSON.stringify(Error);
    console.log(error);
    return error;
}

function SuccessResponseJson(message, code) {
    let error = {};
    let Error = {};
    Error.Success = message;
    error.isBase64Encoded = false;
    error.statusCode = code;
    error.body = JSON.stringify(Error);
    console.log(error);
    return error;
}

module.exports = insertEmployee;