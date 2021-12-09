let service = require('./service.js');
let neritoUtils = require('./neritoUtils.js');
let csvValidator = require('./csvValidator.js');

async function insertEmployee(orgId, fileId) {
    try {
        let fileName;
        let isAllInserted = true;
        let csvJson;
        let csvFile;
        let date = new Date();

        try {
            let filedetails = await service.getFileDetailsById(orgId, fileId);
            if (filedetails == null) {
                console.error("CSV file details not found by fileId: " + fileId);
                return neritoUtils.errorResponseJson("NotFound", 400);
            }
            filedetails = JSON.parse(JSON.stringify(filedetails));
            filedetails = filedetails.Items[0];
            if (filedetails.CsvStatus != null && filedetails.CsvStatus.localeCompare(neritoUtils.csvStatus.PENDING) == 0) {
                fileName = filedetails.CsvName;
            } else {
                console.error("No CSV file found Pending By fileId: " + fileId);
                return neritoUtils.errorResponseJson("No CSV file found Pending By fileId: ", 400);
            }
        } catch (err) {
            console.error("CSV file details not found by fileId: " + fileId, err);
            return neritoUtils.errorResponseJson("CSV Details Not Found", 400);
        }
        try {
            let isFileExist = await service.isFileExist(fileName);
            if (!isFileExist) {
                console.error("CSV file not found with this Name: " + fileName);
                return neritoUtils.errorResponseJson("NotFound", 400);
            }
        } catch (err) {
            console.error("CSV file not found with this Name: " + fileName, err);
            return neritoUtils.errorResponseJson("Failed", 400);
        }
        try {
            csvFile = await service.readCsvFromS3(fileName);
            if (csvFile == null) {
                console.error("Empty CSV File Found : " + fileName);
                return neritoUtils.errorResponseJson("Empty", 400);
            }
        } catch (err) {
            console.error("Failed to Parse CSV File : " + fileName, err);
            return neritoUtils.errorResponseJson("Failed", 400);
        }
        try {
            const csvValidationData = await csvValidator.validateCsv(csvFile,orgId);
            if (csvValidationData == null || csvValidationData == undefined || csvValidationData.data == null || csvValidationData.data == undefined) {
                console.error("csvValidationData Error : " + fileName);
                return neritoUtils.errorResponseJson("Failed csvValidationData", 400);
            }
            if (csvValidationData.inValidMessages != null && csvValidationData.inValidMessages.length > 0) {
                console.error("csvValidationData Error : " + fileName, csvValidationData);
                return neritoUtils.errorResponseJson(csvValidationData, 400);
            }
            if (csvValidationData.data != null && csvValidationData.data.length < 10) {
                console.error("Row count is less than 10 : " + fileName);
                return neritoUtils.errorResponseJson("Row count is less than 10", 400);
            }
            csvJson = csvValidationData.data;
        } catch (err) {
            console.error("Failed to Parse CSV File : " + fileName, err);
            return neritoUtils.errorResponseJson("Failed csvValidationData", 400);
        }
        try {
            const result = await service.getEmpDataByMonthAndYear(orgId, date.getMonth() + 1, date.getFullYear());
            if (result != null && result != undefined && !isEmpty(result)) {
                let csvJson = JSON.parse(JSON.stringify(result));
                csvJson = csvJson.Items;
                if (csvJson != null && csvJson != undefined && !isEmpty(csvJson)) {
                    for (var i = 0; i < csvJson.length; i++) {
                        var obj = csvJson[i];
                        const result = await service.deleteRecordByIdAndSk(obj['Id'], obj['SK']);
                    }
                }
            }
        } catch (err) {
            console.error("Failed to insert data into db : " + fileName, err);
            return neritoUtils.errorResponseJson("Failed Insertion", 400);
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
                console.error("Failed to Insert Data in Db: " + fileName);
                return neritoUtils.errorResponseJson("Failed insertion", 400);
            }
        } catch (err) {
            console.error("Failed to insert data into db : " + fileName, err);
            return neritoUtils.errorResponseJson("Failed Insertion", 400);
        }

        try {
            const result = await service.updateCsvDetails(orgId, fileId);
            console.error("result", result)
        } catch (err) {
            console.error("Failed to fetch data from db : ", err);
            return neritoUtils.errorResponseJson("Failed Fetch", 400);
        }

        try {
            const result = await service.getEmpDataByMonthAndYear(orgId, date.getMonth() + 1, date.getFullYear());
            return neritoUtils.successResponseJson(result, 200);
        } catch (err) {
            console.error("Failed to fetch data from db : ", err);
            return neritoUtils.errorResponseJson("Failed Fetch", 400);
        }
    } catch (err) {
        console.error("Something went wrong", err);
        return neritoUtils.errorResponseJson("Failed Insertion", 400);
    }
}

function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}

module.exports = insertEmployee;