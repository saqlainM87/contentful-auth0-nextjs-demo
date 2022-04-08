import type { GetServerSideProps, NextPage } from 'next';
import Link from 'next/link';
import { getSession, signIn } from 'next-auth/react';

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
    return (
        <div>
            <h1>Login Page</h1>
            <button onClick={() => signIn()}>
                <Link href="">Login</Link>
            </button>
        </div>
    );
};

export default Login;
