import {
  ContentTypeT,
  EntryT,
  LocaleT,
  StatusT,
  TagT,
} from "./clients/contentful-client/contentful-client";
import { CachedDataT, MetadataT, SysIdT } from "./impl/arboretum-client.impl";
import { Either } from "./utils/fp-utils";

export type ArboretumClientOptions = {
  data?: CachedDataT;
  eagerly?: boolean;
  pageRelations?: "parent-to-children" | "child-to-parent";
  includeEntryStatus?: boolean;
};

export type ArboretumClientContentfulConfigOptionsT = {
  pageContentTypes: {
    [id: SysIdT]: {
      slugFieldId: string;
      titleFieldId?: string;
      childPagesFieldId?: string;
      parentPageFieldId?: string;
      select?: Array<string>;
    };
  };
  redirectContentType?: {
    id: string;
    titleFieldId?: string;
    pageFieldId: string;
    pathFieldId: string;
    typeFieldId: string;
  };
  homePageTagId?: string;
};

export type ContentfulEnvironmentAPI = {
  getEntries: (query?: any) => Promise<ContentfulCollection<EntryT>>;
  getPublishedEntries: (query?: any) => Promise<ContentfulCollection<EntryT>>;
  getLocales: () => Promise<ContentfulCollection<LocaleT>>;
  getContentTypes: (query?: any) => Promise<ContentfulCollection<ContentTypeT>>;
  getTags: (query?: any) => Promise<ContentfulCollection<TagT>>;
};

export type ArboretumClientConfigFromCmaT = {
  type: "cma-client";
  preview: boolean;
  contentful: {
    client: ContentfulEnvironmentAPI;
    options: ArboretumClientContentfulConfigOptionsT;
  };
  options?: ArboretumClientOptions;
};

type ContentfulCollection<T> = {
  total: number;
  skip: number;
  limit: number;
  items: Array<T>;
};

export type ContentfulClientApi = {
  withAllLocales?: ContentfulClientApi;
  getEntries: (query?: any) => Promise<ContentfulCollection<EntryT>>;
  getLocales: () => Promise<ContentfulCollection<LocaleT>>;
  getContentTypes: (query?: any) => Promise<ContentfulCollection<ContentTypeT>>;
  getTags: (query?: any) => Promise<ContentfulCollection<TagT>>;
};

export type ArboretumClientConfigFromCdaT = {
  type: "cda-client";
  preview: boolean;
  contentful: {
    client: ContentfulClientApi;
    options: ArboretumClientContentfulConfigOptionsT;
  };
  options?: Pick<
    ArboretumClientOptions,
    "data" | "eagerly" | "pageRelations"
  >;
};

export type CreateClientParams = {
  space: string;
  accessToken: string;
  environment?: string;
  host: string;
  retryOnError?: boolean;
  timeout?: number;
  retryLimit?: number;
};

export type ArboretumClientConfigFromCdaParamsT = {
  type: "cda-client-params";
  preview: boolean;
  contentful: Omit<CreateClientParams, "host"> & {
    options: ArboretumClientContentfulConfigOptionsT;
  };
  hosts?: {
    preview: string;
    published: string;
  } | undefined;
  options?: Pick<
    ArboretumClientOptions,
    "data" | "eagerly" | "pageRelations"
  >;
};

export type ArboretumClientConfigT =
  | ArboretumClientConfigFromCmaT
  | ArboretumClientConfigFromCdaT
  | ArboretumClientConfigFromCdaParamsT;

type ArboretumPageBaseT = {
  id: string;
  localeCode: string;
  path: string;
  title?: string;
  cmaOnlyStatus?: StatusT;
  metadata?: MetadataT;
};

export type ArboretumRedirectT = ArboretumPageBaseT & {
  type: "redirect";
  pageId: string;
};

export type ArboretumAliasT = ArboretumPageBaseT & {
  type: "alias";
  pageId: string;
};

export type ArboretumPageT = ArboretumPageBaseT & {
  type: "page";
  contentTypeId: string;
  slug: string;
  totalDirectChildrenCount: number;
  children?: Array<ArboretumPageNodeT>;
  ancestors?: Array<Omit<ArboretumPageT, "children" | "ancestors">>;
  additionalFields?: { [key: string]: any };
};

export type OrphanedArboretumPageT = Omit<
  ArboretumPageT,
  "path" | "totalDirectChildrenCount" | "ancestors" | "children"
>;

export type OrphanedArboretumPageSearchResultT = OrphanedArboretumPageT & {
  searchScore: number;
};

export type ArboretumPageNodeT =
  | ArboretumPageT
  | ArboretumRedirectT
  | ArboretumAliasT;

export type ArboretumPageSearchResultNodeT = ArboretumPageNodeT & {
  searchScore: number;
};

export type OptionsT = { withChildren?: boolean; withAncestors?: boolean };

export type ArboretumClientOptionsT = Pick<
  ArboretumClientContentfulConfigOptionsT,
  "pageContentTypes" | "redirectContentType"
> &
  Pick<ArboretumClientOptions, "includeEntryStatus" | "pageRelations">;

export type ArboretumClientT = {
  homePage: (
    localeCode: string,
    options?: OptionsT
  ) => Either<string, ArboretumPageT>;
  pageByPath: (
    path: string,
    options?: OptionsT
  ) => Either<string, ArboretumPageNodeT>;
  pagesByPaths: (
    paths: Array<string>,
    options?: OptionsT
  ) => Array<Either<string, ArboretumPageNodeT>>;
  pageById: (
    localeCode: string,
    id: string,
    options?: OptionsT
  ) => Either<string, ArboretumPageNodeT>;
  pagesByIds: (
    localeCode: string,
    ids: Array<string>,
    options?: OptionsT
  ) => Array<Either<string, ArboretumPageNodeT>>;
  pagesByTagId: (
    localeCode: string,
    tagId: string,
    options?: OptionsT
  ) => Either<string, Array<ArboretumPageNodeT>>;
  pages: (
    options?: OptionsT & { limit?: number; skip?: number; localeCode?: string }
  ) => Either<string, Array<ArboretumPageNodeT>>;
  locales: () => Array<LocaleT>;
  regenerate: () => Promise<{ status: "OK"; warnings?: Array<string> }>;
  search: (
    phrase: string,
    localeCode?: string,
    limit?: number
  ) => Array<ArboretumPageSearchResultNodeT>;
  status: () => {
    lastUpdatedAt: string;
    pagesCount: number;
    localesCount: number;
    contentful: ArboretumClientOptionsT;
    regenerationInProgress: boolean;
  };
  cachedData: () => CachedDataT;
  orphanedPages: (options?: {
    limit?: number;
    skip?: number;
    localeCode?: string;
  }) => Either<string, Array<OrphanedArboretumPageT>>;
  searchOrphanedPages: (
    phrase: string,
    localeCode?: string,
    limit?: number
  ) => Array<OrphanedArboretumPageSearchResultT>;
};
