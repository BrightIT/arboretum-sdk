type EntriesQueryT = {
  limit?: number;
  skip?: number;
  content_type?: string;
  include?: number;
  select?: string;
  locale?: string;
  ["metadata.tags.sys.id[in]"]?: string;
  order?: string;
  [key: string]: any;
};

type ContentTypesQueryT = {
  limit: number;
  "sys.id[in]": string;
};

export type StatusT = "draft" | "published" | "changed" | "archived";

export type EntryT = {
  metadata?: {
    tags: Array<{
      sys: {
        id: string;
      };
    }>;
  };
  fields: { [localeCode: string]: any };
  sys: {
    id: string;
    archivedVersion?: number;
    version?: number;
    publishedVersion?: number;
    contentType: { sys: { id: string } };
    cmaOnlyStatus?: StatusT;
  };
};

export type EntryIdT = EntryT["sys"]["id"];

type TagsQueryT = {
  limit?: number;
  skip?: number;
  [key: string]: any;
};

export type TagT = {
  name: string;
  sys: {
    id: string;
  };
};

export type LocaleT = {
  code: string;
  name: string;
  default: boolean;
  fallbackCode: string | null;
};

export type ContentTypeT = {
  sys: { id: string };
  fields: Array<{
    id: string;
    name: string;
    localized: boolean;
    type: string;
    linkType?: string;
    items?: { type?: string; linkType?: string };
  }>;
};

export type GetLocalesResponseT = {
  skip: number;
  limit: number;
  total: number;
  items: Array<LocaleT>;
};

export type GetContentTypesResponseT = {
  skip: number;
  limit: number;
  total: number;
  items: Array<ContentTypeT>;
};

export type GetTagsResponseT = {
  skip: number;
  limit: number;
  total: number;
  items: Array<TagT>;
};

export type GetEntriesResponseT = {
  skip: number;
  limit: number;
  total: number;
  items: Array<EntryT>;
};

export type ContentfulClientT = {
  getLocales: () => Promise<GetLocalesResponseT>;

  getContentTypes: (
    query?: ContentTypesQueryT
  ) => Promise<GetContentTypesResponseT>;

  getTags: (query?: TagsQueryT) => Promise<GetTagsResponseT>;

  getEntries: (query?: EntriesQueryT) => Promise<GetEntriesResponseT>;
};
