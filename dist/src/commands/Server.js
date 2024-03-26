"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Validator = void 0;
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const ServerValidator_1 = __importDefault(require("../validators/ServerValidator"));
const GenerateServer = (args, rl) => {
    console.log(args);
};
exports.default = GenerateServer;
const Validator = ServerValidator_1.default;
exports.Validator = Validator;
