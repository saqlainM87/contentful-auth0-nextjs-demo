import type { NextPage } from 'next';
import { useUser } from '@auth0/nextjs-auth0';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';

import { contentfulInstance as contentful } from '../../libs/contentful';
import { Entry } from 'contentful-management';

const Dashboard: NextPage = () => {
    const { user, error, isLoading } = useUser();
    const router = useRouter();
    const [foods, setFoods] = useState<any[]>([]);
    const [foodToAdd, setFoodToAdd] = useState('');

    const getFoodsData = useCallback(async () => {
        try {
            const entries: any = await contentful.getEntries({
                content_type: 'user',
                'fields.id': user?.sub,
            });

            if (entries) {
                setFoods(entries.items?.[0]?.fields?.favoriteFoods);
            }
        } catch (error) {
            //
        }
    }, [user?.sub]);

    useEffect(() => {
        if (user) {
            getFoodsData();
        }
    }, [getFoodsData, user]);

    const handleAdd = async () => {
        try {
            let foodEntry: Entry | undefined;
            let newUserEntry: Entry | undefined;

            const userEntries = await contentful.getEntries({
                content_type: 'user',
                'fields.id': user?.sub,
            });

            if (!userEntries?.items?.length) {
                newUserEntry = await contentful.createEntry('user', {
                    fields: {
                        name: {
                            'en-US': user?.nickname,
                        },
                        id: {
                            'en-US': user?.sub,
                        },
                    },
                });
            }

            const foodEntries = await contentful.getEntries({
                content_type: 'food',
                'fields.foodName': foodToAdd,
            });

            if (!foodEntries?.items.length) {
                foodEntry = await contentful.createEntry('food', {
                    fields: {
                        foodName: {
                            'en-US': foodToAdd,
                        },
                    },
                });
            }

            const patchedUserEntry = await contentful.updateEntry(
                userEntries?.items?.[0]?.sys?.id || newUserEntry?.sys.id || '',
                'favoriteFoods',
                {
                    sys: {
                        type: 'Link',
                        linkType: 'Entry',
                        id: foodEntries?.items[0]?.sys.id || foodEntry?.sys.id,
                    },
                }
            );

            if (patchedUserEntry) {
                setFoodToAdd('');
                getFoodsData();
            }
        } catch (error) {
            console.error(error);
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
                    {foods?.length > 0 ? (
                        foods.map((food) => (
                            <li key={food?.sys?.id}>
                                <span>
                                    {food?.fields?.foodName}
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
