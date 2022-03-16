let service = require('../service/service.js');
let neritoUtils = require('../utill/neritoUtils.js');
const csvjson = require('csvjson');
let constant = require('../constants/constant.js');
let employeeService = require('../service/employeeService.js');
let payrollService = require('../service/payrollService.js');

const freeze_temp_bucket = process.env.freeze_temp_bucket;
const payrollDisbursementFilesBucket = process.env.payrollDisbursementFilesBucket;
const payrollDisbursementFilesBucketRegion = process.env.payrollDisbursementFilesBucketRegion;
const payrollNeritoBucketRegion = process.env.payrollNeritoBucketRegion;

async function freezeEmployee(orgId, action) {
    let csvJson, options, freezeBucket, freezeTempBucket, result, fullFileName, orgDetails, strDate, strCount;
    let jsonArray = [];
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

            options = {
                headers: 'none',
                delimiter: "    "
            };
            freezeBucket = payrollDisbursementFilesBucket + "/" + constant.freezeBucket.ACCOUNT_OUTPUT + "/IN/" + orgId;
            freezeTempBucket = freeze_temp_bucket + "/" + constant.freezeBucket.ACCOUNT_OUTPUT + "/IN/" + orgId;

            result = await employeeService.getEmpFreezeData(orgId);
            fullFileName = constant.freezeBucket.ACCOUNT_OUTPUT + "-" + Date.now() + ".txt";
            if (!neritoUtils.isEmpty(result)) {
                csvJson = JSON.parse(JSON.stringify(result));
                csvJson = csvJson.Items;
                let json = {};
                json.A_CompanyId = neritoUtils.spacesAppenderOnRight(organization.Id, constant.maxLength.COMPANYID);
                json.B_OperationType = neritoUtils.spacesAppenderOnRight("AR", constant.maxLength.OPERATIONTYPE);
                json.C_Name = neritoUtils.spacesAppenderOnRight(organization.OrgName, constant.maxLength.NAME);
                json.D_RFC = neritoUtils.spacesAppenderOnRight(organization.RFC, constant.maxLength.RFC);
                json.E_PhoneNumber = neritoUtils.spacesAppenderOnRight("", constant.maxLength.PHONENUMBER);
                json.F_Contact = neritoUtils.spacesAppenderOnRight("", constant.maxLength.CONTACT);
                json.G_Email = neritoUtils.spacesAppenderOnRight(organization.Email, constant.maxLength.EMAIL);
                json.H_AccountType = neritoUtils.spacesAppenderOnRight("000", constant.maxLength.TYPEACCOUNT);
                json.I_Currency = neritoUtils.spacesAppenderOnRight("", constant.maxLength.CURRENCY);
                json.J_BankId = neritoUtils.spacesAppenderOnRight("", constant.maxLength.BANKID);
                json.K_AccountClabe = neritoUtils.spacesAppenderOnRight("X", constant.maxLength.ACCOUNTCLABE);
                jsonArray.push(json);

                csvJson.forEach(element => {
                    let json = {};
                    json.A_CompanyId = neritoUtils.spacesAppenderOnRight(element.CompanyId, constant.maxLength.COMPANYID);
                    json.B_OperationType = neritoUtils.spacesAppenderOnRight(element.OperationType, constant.maxLength.OPERATIONTYPE);
                    json.C_Name = neritoUtils.spacesAppenderOnRight(element.Name, constant.maxLength.NAME);
                    json.D_RFC = neritoUtils.spacesAppenderOnRight(element.RFC, constant.maxLength.RFC);
                    json.E_PhoneNumber = neritoUtils.spacesAppenderOnRight(element.PhoneNumber, constant.maxLength.PHONENUMBER);
                    json.F_Contact = neritoUtils.spacesAppenderOnRight(element.Contact, constant.maxLength.CONTACT);
                    json.G_Email = neritoUtils.spacesAppenderOnRight(element.Email, constant.maxLength.EMAIL);
                    json.H_AccountType = neritoUtils.spacesAppenderOnRight(element.AccountType, constant.maxLength.TYPEACCOUNT);
                    json.I_Currency = neritoUtils.spacesAppenderOnRight(element.Currency, constant.maxLength.CURRENCY);
                    json.J_BankId = neritoUtils.spacesAppenderOnRight(element.BankId, constant.maxLength.BANKID);
                    json.K_AccountClabe = neritoUtils.spacesAppenderOnRight(element.AccountClabe, constant.maxLength.ACCOUNTCLABE);
                    jsonArray.push(json);

                });
            }
        } else if (action.localeCompare(constant.action.FREEZE_PAYROLL) == 0) {
            try {
                let orgList = await service.getDatabyIdAndSK("NERITO#af427acc-b8f7-4455-ab4b-4f61042896f4","METADATA#af427acc-b8f7-4455-ab4b-4f61042896f4");
                orgDetails = orgList.Items[0];
            } catch (err) {
                console.error("CSV file details not found by fileId: ", err);
                throw "Something went wrong";
            }
            if (!neritoUtils.isEmpty(orgDetails)) {
                let payrollFile = orgDetails.PayrollFile;
                if (!neritoUtils.isEmpty(payrollFile)) {
                    payrollFile = payrollFile.substring(8, 17);
                    strCount = payrollFile.substring(6, 9);
                    strDate = payrollFile.substring(0, 6);
                }
            }

            options = {
                headers: 'none',
                delimiter: ","
            };
            freezeBucket = payrollDisbursementFilesBucket + "/" + constant.freezeBucket.PAYROLL_OUTPUT + "/IN/" + orgId;
            freezeTempBucket = freeze_temp_bucket + "/" + constant.freezeBucket.PAYROLL_OUTPUT + "/IN/" + orgId;

            result = await payrollService.getPayrollFreezeData(orgId);
            let count = "001";

            if (!neritoUtils.isEmpty(strDate) && strDate.localeCompare(neritoUtils.dateFormatter(date)) == 0) {
                strCount = parseInt(strCount);
                strCount++;
                count = strCount.toString().padStart(3, '0');
            }
            fullFileName = constant.freezeBucket.PAYROLL_OUTPUT + "391235" + neritoUtils.dateFormatter(date) + count + ".txt";

            if (!neritoUtils.isEmpty(result)) {
                csvJson = JSON.parse(JSON.stringify(result));
                csvJson = csvJson.Items;
                csvJson.forEach(element => {
                    let json = {};
                    json.A_Operation = neritoUtils.spacesAppenderOnRight(element.Operation, constant.maxLength.OPERATIONTYPE);
                    json.B_UserName = neritoUtils.spacesAppenderOnRight(element.UserName, constant.maxLength.USERNAME);
                    json.C_OriginAccount = neritoUtils.zeroAppenderOnLeft(element.OriginAccount, constant.maxLength.ORIGINACCOUNT);
                    json.D_DestinationAccount = neritoUtils.zeroAppenderOnLeft(element.DestinationAccount, constant.maxLength.DESTINATIONACCOUNT);
                    json.E_ImportAmount = neritoUtils.fixDecimalPlaces(element.ImportAmount, constant.maxLength.IMPORTAMOUNT);
                    json.F_ReferenceDate = neritoUtils.zeroAppenderOnLeft(element.ReferenceDate, constant.maxLength.REFERENCE);
                    json.G_Description = neritoUtils.spacesAppenderOnRight(element.Description, constant.maxLength.DESCRIPTION);
                    json.H_OriginCurrency = element.OriginCurrency;
                    json.I_DestinationCurrency = element.DestinationCurrency;
                    json.J_RFC = neritoUtils.spacesAppenderOnRight(organization.RFC, constant.maxLength.RFC);
                    json.K_IVA = neritoUtils.spacesAppenderOnRight(element.IVA, constant.maxLength.IVA);
                    json.L_BeneficiaryEmail = neritoUtils.spacesAppenderOnRight(element.Email, constant.maxLength.EMAIL);
                    json.M_ApplicationDate = neritoUtils.spacesAppenderOnRight(element.ApplicationDate.replace(/-/g, ''), constant.maxLength.APPLICATIONDATE);
                    json.N_PaymentInstructions = neritoUtils.spacesAppenderOnRight(element.UserName, constant.maxLength.PAYMENTINSTRUCTIONS);
                    jsonArray.push(json);
                });
            }
        }
        if (!neritoUtils.isEmpty(jsonArray)) {
            // Write bucket to temp folder for maintaing the row number to map bank response
            const tempCsvData = csvjson.toCSV(csvJson, { headers: 'key' });
            const isTempFileUploaded = await service.putObjectOnS3(fullFileName, tempCsvData, freezeTempBucket, payrollNeritoBucketRegion);


            let csvData = csvjson.toCSV(jsonArray, options);
            csvData = csvData.replace(/\r?\n/, "");
            if (action.localeCompare(constant.action.FREEZE_PAYROLL) == 0) {
                csvData = csvData.replace(/,/g, '');
                try {
                    const result = await service.updatePayrollFileDetails(fullFileName);
                } catch (err) {
                    console.error("Failed to update payroll file on server : ", err);
                    throw "Something went wrong";
                }
            }

            const isFileUploaded = await service.putObjectOnS3(fullFileName, csvData, freezeBucket, payrollDisbursementFilesBucketRegion);

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