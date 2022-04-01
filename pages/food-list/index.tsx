import { useUser } from '@auth0/nextjs-auth0';
import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';

import { contentfulInstance as contentful } from '../../libs/contentful';

const LIMIT = 2;

const FoodList: NextPage = () => {
    const [page, setPage] = useState(0);
    const { user, error, isLoading } = useUser();
    const [isEnglish, setIsEnglish] = useState(true);
    const [foods, setFoods] = useState<any[]>([]);
    const [totalItemCount, setTotalItemCount] = useState<number | null>(null);
    const router = useRouter();

    const getFoodsData = useCallback(
        async (page: number, isEnglish?: boolean) => {
            try {
                const entries: any = await contentful.getEntries({
                    content_type: 'food',
                    locale: !isEnglish ? 'bn-BD' : 'en-US',
                    limit: LIMIT,
                    skip: page * LIMIT,
                });

                if (entries) {
                    setFoods(entries.items);
                    setTotalItemCount(entries.total);
                }
            } catch (error) {
                //
            }
        },
        []
    );

    useEffect(() => {
        getFoodsData(page, isEnglish);
    }, [getFoodsData, isEnglish, page]);

    const handlePaginateBackward = () => {
        if (page > 0) {
            setPage((page) => page - 1);
        }
    };

    const handlePaginateForward = () => {
        setPage((page) => page + 1);
    };

    if (isLoading) return <div>Loading...</div>;

    if (error) return <div>{error.message}</div>;

    if (user) {
        return (
            <div>
                <div style={{ marginBottom: '2rem' }}></div>
                <h3>All the listed foods</h3>

                <div style={{ marginBottom: '1rem' }}>
                    <button
                        onClick={() => {
                            setIsEnglish((state) => !state);
                        }}
                        style={{ marginLeft: 'auto' }}
                    >
                        {isEnglish ? 'বাংলা' : 'English'}
                    </button>
                </div>

                <ul>
                    {foods?.length > 0 ? (
                        foods.map((food) => (
                            <li key={food?.sys?.id}>
                                <span>
                                    {food?.fields?.foodName}
                                    <button
                                        // onClick={handleRemove(food?.sys?.id)}
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
                    onClick={handlePaginateBackward}
                    style={{ marginRight: '1rem' }}
                    disabled={page === 0}
                >
                    {'<'}
                </button>
                {page + 1}
                <button
                    style={{ marginLeft: '1rem' }}
                    onClick={handlePaginateForward}
                    disabled={(page + 1) * LIMIT >= Number(totalItemCount)}
                >
                    {'>'}
                </button>
                <br />
                <button style={{ marginTop: '2rem' }}>
                    <Link href="/api/auth/logout">Logout</Link>
                </button>
            </div>
        );
    }

    router.replace('/login');

    return null;
};

export default FoodList;
