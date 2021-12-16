// Load the AWS SDK for Node.js
let employee = require('./employee.js');
let neritoUtils = require('./neritoUtils.js');
let freezeController = require('./freezeController.js');

exports.handler = async function (event, ctx, callback) {
    let orgId, fileId, action;

    let queryJSON = JSON.parse(JSON.stringify(event.queryStringParameters));
    let json = JSON.parse(event.body);

    if (neritoUtils.isEmpty(queryJSON) || neritoUtils.isEmpty(queryJSON['action'])) {
        return neritoUtils.errorResponseJson("Action is not defined", 400);
    }

    if (neritoUtils.isEmpty(json)) {
        return neritoUtils.errorResponseJson("Body is not Defined", 400);
    }

    action = queryJSON['action'];
    orgId = json['orgId'];
    fileId = json['fileId'];

    if (neritoUtils.isEmpty(json['orgId'])) {
        return neritoUtils.errorResponseJson("orgId Not Found", 400);
    }

    if (action.localeCompare(neritoUtils.action.INSERT) == 0) {
        if (neritoUtils.isEmpty(fileId)) {
            return neritoUtils.errorResponseJson("fileId Not Found", 400);
        }
        try {
            const result = await employee(orgId, fileId);
            return result;
        } catch (err) {
            console.error("Something went wrong", err);
            return neritoUtils.errorResponseJson(err, 400);
        }
    } else if (action.localeCompare(neritoUtils.action.FREEZE) == 0) {
        try {
            const result = await freezeController(orgId);
            return result;
        } catch (err) {
            console.error("Something went wrong", err);
            return neritoUtils.errorResponseJson(err, 400);
        }
    } else {
        return neritoUtils.errorResponseJson("Preferred Action Is Not Defined", 400);
    }
};
