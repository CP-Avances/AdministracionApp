"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutotaskApiKey = void 0;
function AutotaskApiKey(req, res, next) {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || apiKey !== process.env.AUTOTASK_API_KEY) {
        return res.status(401).jsonp({
            message: 'No autorizado.'
        });
    }
    next();
}
exports.AutotaskApiKey = AutotaskApiKey;
