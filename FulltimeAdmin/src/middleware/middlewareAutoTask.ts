import { Request, Response, NextFunction } from 'express';

export function AutotaskApiKey(req: Request, res: Response, next: NextFunction) {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey || apiKey !== process.env.AUTOTASK_API_KEY) {
        return res.status(401).jsonp({
            message: 'No autorizado.'
        });
    }

    next();
}