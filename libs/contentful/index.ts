import contentful, { ClientAPI, createClient } from 'contentful-management';

class Contentful {
    private static PERSONAL_ACCESS_TOKEN =
        process.env.NEXT_PUBLIC_CONTENTFUL_PERSONAL_ACCESS_TOKEN || '';
    private static CLIENT?: ClientAPI;
    private static INSTANCE?: Contentful;
    private spaceId = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID || '';
    private environment?: contentful.Environment;

    private constructor() {}

    public static createInstance = (): Contentful => {
        if (Contentful.INSTANCE) {
            return Contentful.INSTANCE;
        }

        try {
            Contentful.CLIENT = createClient({
                // This is the access token for this space. Normally you get the token in the Contentful web app
                accessToken: Contentful.PERSONAL_ACCESS_TOKEN,
            });

            Contentful.INSTANCE = new Contentful();
        } catch (error) {
            console.error(error);
        }

        return Contentful.INSTANCE!;
    };

    public setEnvironment = async (
        environmentId?: string
    ): Promise<contentful.Environment | void> => {
        if (Contentful.CLIENT) {
            const space = await Contentful.CLIENT.getSpace(this.spaceId);
            const environment = await space.getEnvironment(
                environmentId || 'develop'
            );

            this.environment = environment;

            return this.environment;
        }
    };

    public getEntries = async (query?: contentful.QueryOptions) => {
        const environment = this.environment ?? (await this.setEnvironment());
        const entries = await environment?.getEntries({
            ...query,
        });

        return entries;
    };

    public createEntry = async (
        contentTypeId: string,
        data: Omit<contentful.EntryProps<contentful.KeyValueMap>, 'sys'>
    ) => {
        const environment = this.environment ?? (await this.setEnvironment());
        const newEntry = await environment?.createEntry(contentTypeId, data);
        const publishedEntry = await newEntry?.publish();

        return publishedEntry;
    };

    public removeEntry = async (entryId: string) => {
        const environment = this.environment ?? (await this.setEnvironment());
        const entry = await environment?.getEntry(entryId);
        const unpublishedEntry = await entry?.unpublish();

        return unpublishedEntry?.delete();
    };
}

export const contentfulInstance = Contentful.createInstance();
