// Load the AWS SDK for Node.js
let employee = require('./employee.js');

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
            let error = {};
            let errorJson = {};
            errorJson.message = "FileName Not Found";
            error.Error = errorJson;
            console.log(error);
            return error;
        }
    } catch (err) {
        console.log("Failed to upload file", err);
        callback(new Error(JSON.stringify(err)));
    }
};
