let service = require('../service/service.js');
let neritoUtils = require('../utill/neritoUtils.js');
const csvjson = require('csvjson');
let constant = require('../constants/constant.js');
let employeeService = require('../service/employeeService.js');
let payrollService = require('../service/payrollService.js');


async function freezeEmployee(orgId, action) {
    let csvJson, freezeBucket, result, fullFileName;

    try {
        let date = new Date();
        let month = date.getMonth(); // returns 0 - 11

        let freezeFolder = constant.transferTo.BNK;
        let organization = await service.getOrgDataById(orgId);
        if (!neritoUtils.isEmpty(organization) && !neritoUtils.isEmpty(organization.Items[0])) {
            organization = organization.Items[0];
            if (organization.TransferTo.localeCompare(constant.transferTo.WLT) == 0) {
                freezeFolder = constant.transferTo.WLT;
            }
        }
        if (action.localeCompare(constant.action.FREEZE) == 0) {
            freezeBucket = constant.freezeBucket.PAYROLL_OUTPUT + "/IN/" + orgId;
            result = await employeeService.getEmpFreezeData(orgId);
            fullFileName = constant.freezeBucket.PAYROLL_OUTPUT + "-" + Date.now() + ".txt";

        } else if (action.localeCompare(constant.action.FREEZE_PAYROLL) == 0) {
            freezeBucket = constant.freezeBucket.ACCOUNT_OUTPUT + "/IN/" + orgId;
            result = await payrollService.getPayrollFreezeData(orgId);
            fullFileName = constant.freezeBucket.ACCOUNT_OUTPUT + "-" + Date.now()+ ".txt";

        }
        if (!neritoUtils.isEmpty(result)) {
            csvJson = JSON.parse(JSON.stringify(result));
            csvJson = csvJson.Items;
            const csvData = csvjson.toCSV(csvJson, { headers: 'key', delimiter   : "    "});

            const isFileUploaded = await service.putObjectOnS3(fullFileName, csvData, freezeBucket);
            if (!isFileUploaded) {
                console.error("Error while uploading file: " + fullFileName);
                throw "Something went wrong";
            }
            let response = {
                orgId: orgId,
                status: 'Successfully freezed',
                fileName: fullFileName
            };

            return neritoUtils.successResponseJson(response, 200);
        }
    } catch (err) {
        console.error("Failed to upload data on S3 : ", err);
        return neritoUtils.errorResponseJson(err, 500);
    }

}
module.exports = freezeEmployee;