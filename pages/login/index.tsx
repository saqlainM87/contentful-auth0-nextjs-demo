import type { NextPage } from 'next';
import Link from 'next/link';

const Login: NextPage = () => {
    return (
        <div>
            <h1>Login Page</h1>
            <button>
                <Link href="/api/auth/login">Login</Link>
            </button>
        </div>
    );
};

export default Login;
