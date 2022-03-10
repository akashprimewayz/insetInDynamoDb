module.exports = {
  months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  emailRegex: /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/,
  phoneNumberRegex: /^\+?([0-9]{2})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/,

  // API END POINT
  apiCreateUserUrl: "https://11qb46r9hb.execute-api.us-west-2.amazonaws.com/dev/api/post/createUser",
  csvStatus: {
    PENDING: 'PENDING',
    COMPLETED: 'COMPLETED',
    FAILED: 'FAILED'
  },

  freezeState: {
    PENDING: 0,
    SUCCESS: 1,
    Error: 2
  },
  action: {
    INSERT: 'INSERT',
    FREEZE: 'FREEZE',
    FREEZE_RESPONSE: 'FREEZE_RESPONSE',
    FREEZE_PAYROLL: 'FREEZE_PAYROLL',
    PAYROLL_INSERT: 'PAYROLL_INSERT'
  },
  transferTo: {
    BNK: 'BNK',
    WLT: 'WLT'
  },
  freezeBucket: {
    ACCOUNT_OUTPUT: 'AC',
    PAYROLL_OUTPUT: 'PP'
  },
  config: {
    ACCOUNT_TYPE: 'ACCOUNT_TYPE',
    BANK_ID: 'BANK_ID',
    OPERATION: 'OPERATION'
  },
  maxLength: {
    COMPANYID: 13,
    PHONENUMBER: 16,
    OPERATIONTYPE: 2,
    CURRENCY: 7,
    NAME: 60,
    EMAIL: 39,
    CONTACT: 20,
    RFC: 13,
    TYPEACCOUNT: 3,
    BANKID: 4,
    ACCOUNTCLABE: 18,
    USERNAME: 13,
    ORIGINACCOUNT: 20,
    DESTINATIONACCOUNT: 20,
    IMPORTAMOUNT: 14,
    REFERENCE: 10,
    DESCRIPTION: 30,
    IVA: 14,
    APPLICATIONDATE: 8,
    PAYMENTINSTRUCTIONS: 70
  }
};
