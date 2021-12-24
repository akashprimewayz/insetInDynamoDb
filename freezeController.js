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
        if (!neritoUtils.isEmpty(result)) {
            csvJson = JSON.parse(JSON.stringify(result));
            csvJson = csvJson.Items;
            const csvData = csvjson.toCSV(csvJson, { headers: 'key' });

            let freezeFolder = neritoUtils.transferTo.BNK;
            let organization = await service.getOrgDataById(orgId);
            if (!neritoUtils.isEmpty(organization) && !neritoUtils.isEmpty(organization.Items[0])) {
                organization = organization.Items[0];
                if (organization.TransferTo.localeCompare(neritoUtils.transferTo.WLT) == 0) {
                    freezeFolder = neritoUtils.transferTo.WLT;
                }
            }

            let fullFileName = orgId + "_" + neritoUtils.months[month] + "_FREEZE.csv";

            const isFileUploaded = await service.putObjectOnS3(fullFileName, csvData,freezeFolder);
            if (!isFileUploaded) {
                console.error("Error while uploading file: " + fullFileName);
                return neritoUtils.errorResponseJson("UploadFailed", 400);
            }
           let response = {
                orgId: orgId,
                status: 'Successfully freezed',
                fileName: fullFileName
            };

            return neritoUtils.successResponseJson(response, 200);
        }
    } catch (err) {
        console.error("Failed to upload data on S3 : " , err);
        return neritoUtils.errorResponseJson("Failed Upload", 400);
    }
}
module.exports = freezeEmployee;