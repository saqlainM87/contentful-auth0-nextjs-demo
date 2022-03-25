import type { NextPage } from 'next';
import { useUser } from '@auth0/nextjs-auth0';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';

import { contentfulInstance as contentful } from '../../libs/contentful';

const Dashboard: NextPage = () => {
    const { user, error, isLoading } = useUser();
    const router = useRouter();
    const [foods, setFoods] = useState<any[]>([]);
    const [foodToAdd, setFoodToAdd] = useState('');

    const getFoodsData = useCallback(async () => {
        try {
            const entries = await contentful.getEntries({
                content_type: 'favoriteFoods',
                'fields.userId': user?.sub,
            });

            if (entries) {
                setFoods(entries.items);
            }
        } catch (error) {
            //
        }
    }, [user?.sub]);

    useEffect(() => {
        if (user) {
            getFoodsData();
        }
    }, [getFoodsData, user, contentful]);

    const handleAdd = async () => {
        try {
            const entry = await contentful.createEntry('favoriteFoods', {
                fields: {
                    userId: {
                        'en-US': user?.sub,
                    },
                    foodName: {
                        'en-US': foodToAdd,
                    },
                },
            });

            if (entry) {
                setFoodToAdd('');
                getFoodsData();
            }
        } catch (error) {
            //
        }
    };

    const handleRemove = (entryId: string) => async () => {
        try {
            await contentful.removeEntry(entryId);

            getFoodsData();
        } catch (error) {
            //
        }
    };

    if (isLoading) return <div>Loading...</div>;

    if (error) return <div>{error.message}</div>;

    if (user) {
        return (
            <div>
                <div style={{ marginBottom: '2rem' }}>
                    <h2>Name: {user.nickname}</h2>
                    <p>Email: {user.email}</p>
                </div>

                <h3>Favorite Foods</h3>

                <div style={{ marginBottom: '1rem' }}>
                    <input
                        style={{ marginRight: '1rem' }}
                        placeholder="Food Name"
                        onChange={(hEvent) => setFoodToAdd(hEvent.target.value)}
                        value={foodToAdd}
                    />
                    <button onClick={handleAdd}>Add food to list</button>
                </div>

                <ul>
                    {foods.length > 0 ? (
                        foods.map((food) => (
                            <li key={food?.sys?.id}>
                                {console.log(food)}
                                <span>
                                    {food?.fields?.foodName?.['en-US']}
                                    <button
                                        onClick={handleRemove(food?.sys?.id)}
                                        style={{ marginLeft: '0.5rem' }}
                                    >
                                        &#128465;
                                    </button>
                                </span>
                            </li>
                        ))
                    ) : (
                        <p color="grey">No food found</p>
                    )}
                </ul>

                <button style={{ marginTop: '2rem' }}>
                    <Link href="/api/auth/logout">Logout</Link>
                </button>
            </div>
        );
    }

    router.replace('/login');

    return null;
};

export default Dashboard;
