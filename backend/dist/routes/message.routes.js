"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const message_controller_1 = require("../controllers/message.controller");
const auth_middlewares_1 = require("../middlewares/auth.middlewares");
const router = express_1.default.Router();
router.post("/", auth_middlewares_1.protect, message_controller_1.getMessages);
router.post("/:receiver", auth_middlewares_1.protect, message_controller_1.sendMessage);
exports.default = router;
