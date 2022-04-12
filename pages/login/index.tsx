import type { GetServerSideProps, NextPage } from 'next';
import { getSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/router';

export const getServerSideProps: GetServerSideProps = async ({ res, req }) => {
    const session = await getSession({ req });

    // If already logged in, redirects to Dashboard page
    if (session) {
        res.setHeader('location', '/dashboard');
        res.statusCode = 302;
        res.end();
    }

    return { props: {} };
};

const Login: NextPage = () => {
    const router = useRouter();

    return (
        <div>
            <h1>Login Page</h1>

            <button
                onClick={() => {
                    signIn('cognito');
                }}
            >
                Login
            </button>
        </div>
    );
};

export default Login;
