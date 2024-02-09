"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const validatorjs_1 = __importDefault(require("validatorjs"));
const responseMiddleware_1 = __importDefault(require("../helper/responseMiddleware"));
validatorjs_1.default.registerAsync('exist', function (value, attribute, req, passes) {
    if (!attribute)
        throw new Error('Specify Requirements i.e fieldName: exist:table,column');
    //split table and column
    let attArr = attribute.split(",");
    if (attArr.length !== 2 && attArr.length !== 3)
        throw new Error(`Invalid format for validation rule on ${attribute}`);
    const { 0: table, 1: column, 2: id } = attArr;
    var query = {};
    query[column] = value;
    if (id !== undefined && Number(id) != 0)
        query['_id'] = { '$ne': id };
    if (value === undefined || value === "") {
        passes();
    }
    else {
        //@ts-ignore
        mongoose_1.default.models[table].findOne(query)
            .then((result) => {
            if (result) {
                passes(false, `${value} is Already Exist in ${table}.`); // return false if value exists
                return;
            }
            passes();
        });
    }
}, "message");
const validatorUtil = (body, rules, customMessages, callback) => {
    const validation = new validatorjs_1.default(body, rules, customMessages);
    validation.passes(() => callback(null, true));
    validation.fails(() => callback(validation.errors.errors, false));
};
const validatorUtilWithCallback = (rules, customMessages, req, res, next) => {
    const validation = new validatorjs_1.default(req.body, rules, customMessages);
    validation.passes(() => next());
    validation.fails(() => responseMiddleware_1.default.sendValidationError(res, validation.errors.errors));
    // validation.fails(() => res.status(422).send(validation.errors.errors));
};
const validatorUtilWithCallbackQuery = (rules, customMessages, req, res, next) => {
    const validation = new validatorjs_1.default(req.query, rules, customMessages);
    validation.passes(() => next());
    validation.fails(() => res.status(422).send(validation.errors.errors));
};
exports.default = {
    validatorUtil,
    validatorUtilWithCallbackQuery,
    validatorUtilWithCallback
};
