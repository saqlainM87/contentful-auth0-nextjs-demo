import { NextApiRequest, NextApiResponse } from 'next';

// Logout handler to logout from the provider as well
const logoutHandler = (req: NextApiRequest, res: NextApiResponse) => {
    res.redirect(
        `${process.env.COGNITO_DOMAIN}/logout?client_id=${process.env.COGNITO_CLIENT_ID}&logout_uri=${process.env.COGNITO_LOGOUT_URI}`
    );
};

export default logoutHandler;
