import { ContentfulClientApi, createClient } from "contentful";
import { ArboretumClientConfigT } from "../../../arboretum-client";
import { ContentfulClientT } from "../contentful-client";

export const createContentfulClient = (
  config: ArboretumClientConfigT
): ContentfulClientT => {
  const configType = config.type;
  const clientFromCda = (client: ContentfulClientApi) => ({
    getEntries: client.getEntries,
    getLocales: client.getLocales,
    getContentTypes: client.getContentTypes,
    getTags: client.getTags,
  });

  switch (config.type) {
    case "cda-client": {
      return clientFromCda(config.contentful.client);
    }
    case "cda-client-params": {
      const previewHostOrUndefined = config.preview
        ? "preview.contentful.com"
        : undefined;
      const clientApi = createClient({
        ...config.contentful,
        host: previewHostOrUndefined,
      });
      return clientFromCda(clientApi);
    }
    case "cma-client": {
      const { client } = config.contentful;
      return {
        getEntries: (query) =>
          config.preview
            ? client.getEntries(query)
            : client.getPublishedEntries(query),
        getLocales: () => client.getLocales(),
        getContentTypes: (query) => client.getContentTypes(query),
        getTags: (query) => client.getTags(query),
      };
    }
    default: {
      const _: never = config;
      throw new Error(`Invalid config type ("${configType}").`);
    }
  }
};
