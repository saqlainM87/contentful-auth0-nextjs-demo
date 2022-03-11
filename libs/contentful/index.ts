import contentful, { createClient } from 'contentful-management';

const personalAccessToken =
    process.env.NEXT_PUBLIC_CONTENTFUL_PERSONAL_ACCESS_TOKEN || '';
const spaceId = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID || '';

const client = createClient({
    // This is the access token for this space. Normally you get the token in the Contentful web app
    accessToken: personalAccessToken,
});

const getEnvironment = async (): Promise<contentful.Environment> => {
    const space = await client.getSpace(spaceId);
    const environment = await space.getEnvironment('master');

    return environment;
};

export const getEntries = async (query?: contentful.QueryOptions) => {
    const environment = await getEnvironment();
    const entries = await environment.getEntries({
        ...query,
    });

    return entries;
};
