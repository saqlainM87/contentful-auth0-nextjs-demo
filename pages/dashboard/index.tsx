import type { NextPage } from 'next';
import { useUser, UserProfile } from '@auth0/nextjs-auth0';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { getEntries } from '../../libs/contentful';

const Dashboard: NextPage = () => {
    const { user, error, isLoading } = useUser();
    const router = useRouter();
    const [foods, setFoods] = useState<any[]>([]);

    useEffect(() => {
        const getFoodsData = async () => {
            const entries = await getEntries({
                content_type: 'favoriteFoods',
                'fields.userId': user?.sub,
            });

            if (entries) {
                setFoods(entries.items);
            }
        };

        if (user) {
            getFoodsData();
        }
    }, [user]);

    if (isLoading) return <div>Loading...</div>;

    if (error) return <div>{error.message}</div>;

    if (user) {
        return (
            <div>
                <h2>{user.name}</h2>
                <p>{user.email}</p>
                <p>{user.sub}</p>

                <h3>Favorite Foods</h3>

                <ul>
                    {foods.map((food) => (
                        <li key={food?.sys?.id}>
                            <h4>{food?.fields?.foodName?.['en-US']}</h4>
                        </li>
                    ))}
                </ul>

                <button>
                    <Link href="/api/auth/logout">Logout</Link>
                </button>
            </div>
        );
    }

    router.push('/login');

    return null;
};

export default Dashboard;
