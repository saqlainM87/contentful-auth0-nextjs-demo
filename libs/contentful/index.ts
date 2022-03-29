import contentful, { ClientAPI, createClient } from 'contentful-management';
import {
    ContentfulClientApi,
    createClient as createCDAClient,
} from 'contentful';
class Contentful {
    private static PERSONAL_ACCESS_TOKEN =
        process.env.NEXT_PUBLIC_CONTENTFUL_PERSONAL_ACCESS_TOKEN || '';
    private static CDA_ACCESS_TOKEN =
        process.env.NEXT_PUBLIC_CONTENTFUL_CDA_ACCESS_TOKEN || '';
    private static CLIENT?: ClientAPI;
    private static CDA_CLIENT?: ContentfulClientApi;
    private static INSTANCE?: Contentful;
    private static SPACE_ID = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID || '';
    private environment?: contentful.Environment;

    private constructor() {
        this.setEnvironment();
    }

    public static createInstance = (): Contentful => {
        if (Contentful.INSTANCE) {
            return Contentful.INSTANCE;
        }

        try {
            Contentful.CLIENT = createClient({
                // This is the access token for this space. Normally you get the token in the Contentful web app
                accessToken: Contentful.PERSONAL_ACCESS_TOKEN,
            });
            Contentful.CDA_CLIENT = createCDAClient({
                accessToken: Contentful.CDA_ACCESS_TOKEN,
                space: Contentful.SPACE_ID,
                environment: 'develop',
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
            const space = await Contentful.CLIENT.getSpace(Contentful.SPACE_ID);
            const environment = await space.getEnvironment(
                environmentId || 'develop'
            );

            this.environment = environment;

            return this.environment;
        }
    };

    public getEntries = async (query?: contentful.QueryOptions) => {
        const entries = await Contentful.CDA_CLIENT?.getEntries({
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

    public updateEntry = async (
        entryId: string,
        fieldToUpdate: string,
        data: any
    ) => {
        const environment = this.environment ?? (await this.setEnvironment());
        const entry = await environment?.getEntry(entryId);

        if (entry) {
            const existingData = entry.fields?.[fieldToUpdate]?.['en-US'] ?? [];

            // Update existing data
            entry.fields = {
                ...entry.fields,
                [fieldToUpdate]: {
                    ['en-US']: [...existingData, data],
                },
            };
        }

        const updatedEntry = await entry?.update();

        if (updatedEntry) {
            return await updatedEntry.publish();
        }
    };

    public get currentEnvironment(): contentful.Environment | undefined {
        return this.environment;
    }
}

export const contentfulInstance = Contentful.createInstance();
