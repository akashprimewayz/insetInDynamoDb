// Load the AWS SDK for Node.js
let employee = require('./employee.js');
let neritoUtils = require('./neritoUtils.js');

exports.handler = async function (event, ctx, callback) {
    let json = JSON.parse(event.body);
    let fileName;
    let orgId;

    if (json != null && json['fileName'] == null) {
        return neritoUtils.errorResponseJson("FileName Not Found", 400);
    }

    if (json != null && json['orgId'] == null) {
        return neritoUtils.errorResponseJson("orgId Not Found", 400);
    }

    fileName = json['fileName'];
    orgId = json['orgId'];
    try {
        if (fileName != null && orgId!=null) {
            const result = await employee(fileName,orgId);
            return result;
        } else {
            console.log("CSV File Name Or orgId Not Found : " + fileName);
            return neritoUtils.errorResponseJson("FileName Or orgId Not Found", 400);
        }
    } catch (err) {
        console.log("Failed to upload file", err);
        return neritoUtils.errorResponseJson(err, 400);
    }
};
