import { Request, Response } from 'express';
import { DAOResponse } from './../util/globals';
import UsersDAO from './../dao/user';
import { check, sanitize, validationResult } from 'express-validator';


// export async function login(req: Request, res: Response): Promise<void> {
//     const userID = req.body.email || req.body.username;
//     const password = req.body.password;
// }

export const logout = async (req: Request, res: Response): Promise<Response> => {

    await check('sessionId').isJWT().run(req);
    const errors = validationResult(req);

    if (!errors.isEmpty())
        return res.status(400).json({ error: errors });

    const response: DAOResponse = await UsersDAO.logoutUser(req.body.sessionId);
    if (response.error)
        return res.status(400).json({ success: false, error: response.error });
    else
        return res.status(200).json({ success: true, details: response.response });
};

export const signup = async (req: Request, res: Response): Promise<Response> => {
    await check('username', 'Username must be atleast 3 characters.').isLength({ min: 3 }).run(req);
    await check('name', 'Name is required.').exists().run(req);
    await check('email', 'Email is not valid').isEmail().run(req);
    await check('password', 'Password must be atleast 8 characters long with minimum of 1 uppercase, 1 lowercase, 1 numeric and 1 alphanumeric character.').isStrongPassword().run(req);
    await sanitize('email').normalizeEmail({ gmail_remove_dots: false }).run(req);

    const errors = validationResult(req);

    if (!errors.isEmpty())
        return res.status(400).json({ error: errors });

    const response: DAOResponse = await UsersDAO.addUser(req.body.username, req.body.name, req.body.email, req.body.password);
    if (response.error)
        return res.status(400).json({ success: false, error: response.error });
    else
        return res.status(200).json({ success: true, details: response.response });
};

export const getUser = async (req: Request, res: Response): Promise<Response> => {
    await check('username', 'Username is required.').isLength({min: 3}).run(req);

    const errors = validationResult(req);

    if (!errors.isEmpty())
        return res.status(400).json({ error: errors });

    const response: DAOResponse = await UsersDAO.getUser(req.body.username);
    if (response.error)
        return res.status(400).json({ success: false, error: response.error });
    else
        return res.status(400).json({ success: true, details: response.response });
};


// export const updateProfile = async (req: Request, res: Response): Promise<Response> => {
// };

// export const postUpdatePassword = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
// };

export const deleteAccount = async (req: Request, res: Response): Promise<Response> => {
    await check('email', 'Email is not valid').isEmail().run(req);
    await check('password', 'Password must be atleast 8 characters long with minimum of 1 uppercase, 1 lowercase, 1 numeric and 1 alphanumeric character.').isStrongPassword().run(req);
    await sanitize('email').normalizeEmail({ gmail_remove_dots: false }).run(req);

    const errors = validationResult(req);

    if (!errors.isEmpty())
        return res.status(400).json({ error: errors });

    const response: DAOResponse = await UsersDAO.deleteUser(req.body.email, req.body.password);

    if (response.error)
        return res.status(400).json({ success: false, error: response.error });
    else
        return res.status(200).json({ success: true, details: response.response });
};
