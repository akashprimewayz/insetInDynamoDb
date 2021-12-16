module.exports = {
  months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],

  csvStatus: {
    PENDING: 'PENDING',
    COMPLETED: 'COMPLETED',
    FAILED: 'FAILED'
  },
  action: {
    INSERT: 'INSERT',
    FREEZE: 'FREEZE'
  },
  successResponseJson: async function (message, code) {
    let response = {};
    let responseBody = {};
    responseBody.Success = message;
    response.isBase64Encoded = false;
    response.statusCode = code;
    response.headers = {
      "X-Requested-With": '*',
      "Access-Control-Allow-Headers": 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,x-requested-with',
      "Access-Control-Allow-Origin": '*',
      "Access-Control-Allow-Methods": 'POST,GET,OPTIONS,PUT'
    },
      response.body = JSON.stringify(responseBody);
    console.log(response);
    return response;
  },

  errorResponseJson: async function (message, code) {
    let response = {};
    let responseBody = {};
    responseBody.Errors = message;
    response.isBase64Encoded = false;
    response.headers = {
      "X-Requested-With": '*',
      "Access-Control-Allow-Headers": 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,x-requested-with',
      "Access-Control-Allow-Origin": '*',
      "Access-Control-Allow-Methods": 'POST,GET,OPTIONS,PUT'
    },
      response.statusCode = code;
    response.body = JSON.stringify(responseBody);
    console.log(response);
    return response;
  },
  dateconverter: function (date) {
    var matches = /^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/.exec(date);
    if (matches == null) return false;
    var m = matches[2] - 1;
    var d = matches[1];
    var y = matches[3];
    var composedDate = new Date(y, m, d);
    return composedDate;
  },
  isValidDate: function (date) {
    var matches = /^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/.exec(date);
    if (matches == null) return false;
    var m = matches[2] - 1;
    var d = matches[1];
    var y = matches[3];
    var composedDate = new Date(y, m, d);
    return composedDate.getDate() == d &&
      composedDate.getMonth() == m &&
      composedDate.getFullYear() == y;
  },
  stringToDate: function (_date, _format, _delimiter) {
    var formatLowerCase = _format.toLowerCase();
    var formatItems = formatLowerCase.split(_delimiter);
    var dateItems = _date.split(_delimiter);
    var monthIndex = formatItems.indexOf("mm");
    var dayIndex = formatItems.indexOf("dd");
    var yearIndex = formatItems.indexOf("yyyy");
    var month = parseInt(dateItems[monthIndex]);
    month -= 1;
    var formatedDate = new Date(dateItems[yearIndex], month, dateItems[dayIndex]);
    return formatedDate;
  },

  formatDate: function (date) {
    var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2)
      month = '0' + month;
    if (day.length < 2)
      day = '0' + day;

    return [year, month, day].join('-');
  },
  isEmpty: function (obj) {
    return isEmpty(obj);
  }
}
function isEmpty(obj) {
  return obj === null || obj === undefined || Object.keys(obj).length === 0;
}