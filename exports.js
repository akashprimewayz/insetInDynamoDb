// Load the AWS SDK for Node.js
let employee = require('./employee.js');
let neritoUtils = require('./neritoUtils.js');

exports.handler = async function (event, ctx, callback) {
    let json = JSON.parse(event.body);
    let orgId, fileId;

    if (json != null && json['orgId'] == null) {
        return neritoUtils.errorResponseJson("orgId Not Found", 400);
    }

    if (json != null && json['fileId'] == null) {
        return neritoUtils.errorResponseJson("fileId Not Found", 400);
    }

    orgId = json['orgId'];
    fileId = json['fileId'];

    try {
        if (orgId != null) {
            const result = await employee(orgId, fileId);
            return result;
        } else {
            console.error("OrgId Not Found : " + fileId);
            return neritoUtils.errorResponseJson("OrgId Not Found", 400);
        }
    } catch (err) {
        console.error("Something went wrong", err);
        return neritoUtils.errorResponseJson(err, 400);
    }
};
