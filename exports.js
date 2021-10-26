// Load the AWS SDK for Node.js
let employee = require('./employee.js');
let neritoUtils = require('./neritoUtils.js');

exports.handler = async function (event, ctx, callback) {
    let json = JSON.parse(event.body);
    let fileName;
    if (json != null && json['fileName'] != null) {
        fileName = json['fileName'];
    }
    try {
        if (fileName != null) {
            const result = await employee(fileName);
            return result;
        } else {
            console.log("CSV File Name Not Found : " + fileName);
            return neritoUtils.errorResponseJson("FileName Not Found", 400);
        }
    } catch (err) {
        console.log("Failed to upload file", err);
        return neritoUtils.errorResponseJson(err, 400);
    }
};
