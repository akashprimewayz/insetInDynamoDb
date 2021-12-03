// Load the AWS SDK for Node.js
let employee = require('./employee.js');
let neritoUtils = require('./neritoUtils.js');
let freezeController = require('./freezeController.js');

exports.handler = async function (event, ctx, callback) {
    let orgId, fileId, action;

    let queryJSON = JSON.parse(JSON.stringify(event.queryStringParameters));
    let json = JSON.parse(event.body);

    if (queryJSON == null || queryJSON == undefined || queryJSON['action'] == null || queryJSON['action'] == null) {
        return neritoUtils.errorResponseJson("Action is not defined", 400);
    }
    orgId = json['orgId'];
    fileId = json['fileId'];
    action = queryJSON['action'];

    if (action != null && action == 'INSERT') {
        if (json == null) {
            return neritoUtils.errorResponseJson("Body is not Defined", 400);
        }

        if (json != null && json['orgId'] == null) {
            return neritoUtils.errorResponseJson("orgId Not Found", 400);
        }

        if (json != null && json['fileId'] == null) {
            return neritoUtils.errorResponseJson("fileId Not Found", 400);
        }


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

    } else if (action == 'FREEZE') {
        try {
            if (orgId != null) {
                const result = await freezeController(orgId);
                return result;
            } else {
                console.error("OrgId Not Found ");
                return neritoUtils.errorResponseJson("OrgId Not Found", 400);
            }
        } catch (err) {
            console.error("Something went wrong", err);
            return neritoUtils.errorResponseJson(err, 400);
        }
    } else {
        return neritoUtils.errorResponseJson("Preferred Action Is Not Defined", 400);
    }
};
