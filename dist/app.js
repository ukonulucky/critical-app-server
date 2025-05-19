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
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const express_handlebars_1 = require("express-handlebars");
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const dbConnect_1 = __importDefault(require("./config/dbConnect"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const request_ip_1 = __importDefault(require("request-ip"));
const geoip_lite_1 = __importDefault(require("geoip-lite"));
const useragent_1 = __importDefault(require("useragent"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
/* middle wares */
const corsOptions = {
    origin: "*",
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    credentials: true, // Enable credentials (cookies, authorization headers, etc.)
};
// Middleware to get IP
app.use(request_ip_1.default.mw());
/* set static files location */
app.use(express_1.default.static(path_1.default.join(__dirname, "public")));
/* view engine setting */
app.engine("hbs", (0, express_handlebars_1.engine)({
    extname: '.hbs',
    defaultLayout: false // <- disables layout
})); // instruct express to use engine as the remplating engine for any file ending in .hbs
app.set("view engine", "hbs"); // instruct the view engine to search for any file ending with hbs to render to the screeen
app.set("views", path_1.default.join(__dirname, "views")); // instruct express to search for the views folder at path ./views
//Middleware
app.use((0, cors_1.default)(corsOptions));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
// limts the number of api call from a giving browser 
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
});
app.use(limiter);
// Routes
/* app.use("/api/v1/admin", adminRouter) */
app.use("/api/v1/user", userRoutes_1.default);
app.use("/api/v1/admin", adminRoutes_1.default);
/* for home route */
app.get("/emailVerify", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.render("emailVerification");
}));
app.get("/test", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send("server running");
}));
app.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.render("accountVerification", {
        userName: "Samuel",
        companyName: "Online banking",
        link: "https://ukonuluckyportfolio.vercel.app/",
    });
}));
/* TwilloPhoneOtpSender()  */
app.post('/api/user-info', (req, res) => {
    // Get IP address
    console.log("user info", req.body);
    const ip = req.clientIp || '';
    // Get location info from IP
    const geo = geoip_lite_1.default.lookup(ip);
    // Get user-agent info
    const ua = useragent_1.default.parse(req.headers['user-agent'] || '');
    // Build response
    const userInfo = {
        ip,
        location: {
            city: (geo === null || geo === void 0 ? void 0 : geo.city) || null,
            region: (geo === null || geo === void 0 ? void 0 : geo.region) || null,
            country: (geo === null || geo === void 0 ? void 0 : geo.country) || null,
            ll: (geo === null || geo === void 0 ? void 0 : geo.ll) || [],
        },
        device: {
            browser: ua.family,
            os: ua.os.toString(),
            device: ua.device.toString(),
        },
    };
    res.json(userInfo);
});
app.use((req, res, next) => {
    res.status(404).json({
        message: "route not found"
    });
});
/* handling all errors */
app.use((err, req, res, next) => {
    const errorMessage = err.message;
    // the stack property tells what area in the application the error happenz
    const stack = err.stack;
    res.status(500).json({
        message: errorMessage,
        stack
    });
});
app.listen(PORT, () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, dbConnect_1.default)();
        console.log("DB connect and server running on port " + PORT);
    }
    catch (error) {
        console.log("Failed to start server " + error.message);
        process.exit();
    }
}));
