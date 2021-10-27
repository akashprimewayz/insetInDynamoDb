let service = require('./service.js');
let neritoUtils = require('./neritoUtils.js');

async function insertEmployee(fileName, orgId) {

    try {
        let isAllInserted = true;
        let csvJson;
        try {
            let isFileExist = await service.isFileExist(fileName);
            if (!isFileExist) {
                console.log("CSV file not found with this Name: " + fileName);
                return neritoUtils.errorResponseJson("NotFound", 400);
            }
        } catch (err) {
            console.log("CSV file not found with this Name: " + fileName, err);
            return neritoUtils.errorResponseJson("Failed", 400);
        }

        try {
            csvJson = await service.readCsvFromS3(fileName);
            if (csvJson == null) {
                console.log("Empty CSV File Found : " + fileName);
                return neritoUtils.errorResponseJson("Empty", 400);
            }
        } catch (err) {
            console.log("Failed to Parse CSV File : " + fileName, err);
            return neritoUtils.errorResponseJson("Failed", 400);
        }

        try {
            const errorJson = service.validateCSV(csvJson);
            if (errorJson != null) {
                console.log("Validation Error : " + fileName);
                return neritoUtils.errorResponseJson(errorJson, 400);

            }
        } catch (err) {
            console.log("Failed to Parse CSV File : " + fileName, err);
            return neritoUtils.errorResponseJson("Failed Validation", 400);
        }

        try {
            const result = await service.insertDataIntoDb(csvJson, orgId);
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
                return neritoUtils.errorResponseJson("Failed insertion", 400);

            }
        } catch (err) {
            console.log("Failed to insert data into db : " + fileName, err);
            return neritoUtils.errorResponseJson("Failed Insertion", 400);
        }

        try {
            const result = await service.getDatabyKey(orgId);
            return neritoUtils.successResponseJson(result, 200);
        } catch (err) {
            console.log("Failed to fetch data from db : ", err);
            return neritoUtils.errorResponseJson("Failed Fetch", 400);
        }
    } catch (err) {
        console.log("Something went wrong : " + fileName, err);
        return neritoUtils.errorResponseJson("Failed Insertion", 400);
    }
}

function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}

module.exports = insertEmployee;