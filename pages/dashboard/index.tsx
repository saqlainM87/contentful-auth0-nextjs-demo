import type { NextPage, GetServerSideProps } from 'next';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Entry } from 'contentful-management';
import { signOut, getSession } from 'next-auth/react';
import { Session } from 'next-auth';

import { contentfulInstance as contentful } from '../../libs/contentful';

interface DashboardProps {
    loadedSession?: Session | null;
}

export const getServerSideProps: GetServerSideProps<DashboardProps> = async ({
    req,
    res,
}) => {
    const session = await getSession({ req });

    // If not logged in, redirects to Login page
    if (!session) {
        res.setHeader('location', '/login');
        res.statusCode = 302;
        res.end();

        return { props: {} };
    }

    return {
        props: {
            loadedSession: session,
        },
    };
};

const Dashboard: NextPage<DashboardProps> = ({ loadedSession }) => {
    const [foods, setFoods] = useState<any[]>([]);
    const [foodToAdd, setFoodToAdd] = useState('');
    const [isEnglish, setIsEnglish] = useState(true);

    const user = loadedSession?.user;
    const userSub = (user as any)?.sub;

    const getFoodsData = useCallback(
        async (isEnglish?: boolean) => {
            try {
                const entries: any = await contentful.getEntries({
                    content_type: 'user',
                    'fields.id': userSub,
                    locale: !isEnglish ? 'bn-BD' : 'en-US',
                    limit: 1,
                    skip: 0,
                });

                if (entries) {
                    setFoods(entries.items?.[0]?.fields?.favoriteFoods);
                }
            } catch (error) {
                //
            }
        },
        [userSub]
    );

    useEffect(() => {
        if (user) {
            getFoodsData(isEnglish);
        }
    }, [getFoodsData, user, isEnglish]);

    const handleAdd = async () => {
        try {
            let foodEntry: Entry | undefined;
            let newUserEntry: Entry | undefined;

            const userEntries = await contentful.getEntries({
                content_type: 'user',
                'fields.id': userSub,
            });

            if (!userEntries?.items?.length) {
                newUserEntry = await contentful.createEntry('user', {
                    fields: {
                        name: {
                            'en-US': user?.name,
                        },
                        id: {
                            'en-US': userSub,
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
                            'bn-BD': `${foodToAdd}বাংলা`,
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
                getFoodsData(isEnglish);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleRemove = (entryId: string) => async () => {
        try {
            const environment = await contentful.currentEnvironment;

            if (environment) {
                const userEntries = await environment.getEntries({
                    content_type: 'user',
                    'fields.id': userSub,
                });
                const entryToUpdate = userEntries?.items[0];

                if (entryToUpdate) {
                    const existingData: any[] =
                        entryToUpdate?.fields?.favoriteFoods?.['en-US'] ?? [];
                    const updatedData = existingData.filter(
                        (data) => data.sys?.id !== entryId
                    );

                    entryToUpdate.fields = {
                        ...entryToUpdate.fields,
                        favoriteFoods: {
                            'en-US': updatedData,
                        },
                    };

                    const updatedEntry = await entryToUpdate.update();

                    if (updatedEntry) {
                        await updatedEntry.publish();

                        getFoodsData(isEnglish);
                    }
                }
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (user) {
        return (
            <div>
                <div style={{ marginBottom: '2rem' }}>
                    <h2>Name: {user.name}</h2>
                    <p>Email: {user.email}</p>
                    <button
                        onClick={() => {
                            setIsEnglish((state) => !state);
                        }}
                        style={{ marginLeft: 'auto' }}
                    >
                        {isEnglish ? 'বাংলা' : 'English'}
                    </button>
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

                <button
                    onClick={() =>
                        signOut({
                            callbackUrl: '/api/auth/logout',
                        })
                    }
                    style={{ marginTop: '2rem' }}
                >
                    Logout
                </button>
            </div>
        );
    }

    return null;
};

export default Dashboard;
