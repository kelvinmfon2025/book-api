import { Request, Response, NextFunction } from 'express';
import AppError from '../errors/AppError';
import { IUser } from '../interfaces/user.interface'

function CheckRole(allowedRoles: string | string[]) {
    const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    return (req: Request, res: Response, next: NextFunction) => {
        const user = req.user as IUser;

        if (!user || !user.role) {
            return next(new AppError("User not authenticated or role not found.", 401));
        }

        if (!rolesArray.includes(user.role)) {
            return next(new AppError("You are not authorized to perform this action.", 403));
        }

        return next();
    };
}

export default CheckRole;