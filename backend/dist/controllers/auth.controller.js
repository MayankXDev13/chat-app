"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const user_model_1 = __importDefault(require("../models/user.model"));
const generateToken_1 = require("../utils/generateToken");
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }
    const existingUser = yield user_model_1.default.find({ email });
    if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
    }
    const hanshedPassword = yield bcryptjs_1.default.hash(password, 10);
    try {
        const user = yield user_model_1.default.create({
            username: username,
            email: email,
            password: hanshedPassword,
        });
        res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            token: (0, generateToken_1.generateToken)(user._id.toString()),
        });
    }
    catch (error) {
        res.status(400).json({
            message: "failed to create user",
            error: error.message,
        });
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }
    try {
        const user = yield user_model_1.default.findOne({ email });
        if (user && (yield bcryptjs_1.default.compare(password, user.password))) {
            return res.status(200).json({
                _id: user._id,
                username: user.username,
                email: user.email,
                token: (0, generateToken_1.generateToken)(user._id.toString()),
            });
        }
    }
    catch (error) {
        res.status(400).json({
            message: "failed to login",
            error: error.message,
        });
    }
});
exports.login = login;
