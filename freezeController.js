let service = require('./service.js');
let neritoUtils = require('./neritoUtils.js');
let csvValidator = require('./csvValidator.js');
const csvjson = require('csvjson');

async function freezeEmployee(orgId) {
    let csvJson
    try {
        let date = new Date();
        let month = date.getMonth(); // returns 0 - 11
        const result = await service.getEmpFreezeData(orgId, date.getMonth() + 1, date.getFullYear());
        if (result != null && result != undefined && !isEmpty(result)) {
            csvJson = JSON.parse(JSON.stringify(result));
            csvJson = csvJson.Items;
            const csvData = csvjson.toCSV(csvJson, { headers: 'key' });

            let fileName = orgId + "_" + neritoUtils.months[month]+"_FREEZE";
            // Determine file extension
            let fullFileName = `${fileName}.csv`;
            const isFileUploaded = await service.putObjectOnS3(fullFileName, csvData);
            if (!isFileUploaded) {
                console.log("Error while uploading file: " + fullFileName);
                return neritoUtils.errorResponseJson("UploadFailed", 400);
            }
            response = {
                orgId: orgId,
                status: 'Successfully uploaded',
                fileName: fullFileName
            };
    
            return neritoUtils.successResponseJson(response, 200);
        }
    } catch (err) {
        console.error("Failed to upload data on S3 : " + fileName, err);
        return neritoUtils.errorResponseJson("Failed Upload", 400);
    }
}

function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}

module.exports = freezeEmployee;