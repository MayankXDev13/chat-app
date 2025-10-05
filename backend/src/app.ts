import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { authRoutes } from "./routes/auth.route";
import { messageRoutes } from "./routes/message.route";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(morgan("dev"));
app.use(cookieParser());
app.use(compression());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

export default app