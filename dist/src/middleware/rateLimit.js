"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const Limiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000, //means 60 seconds
    limit: 100, //means 4 requests
    message: "Too many requests, please try again later",
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next, options) => {
        next();
        // don't need below code for now
        // console.log(`Rate limit exceeded for IP: ${req.ip}`);
        // res.status(options.statusCode).send(options.message);
    },
});
exports.default = Limiter;
