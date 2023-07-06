import { Entry, Locale, Tag } from "contentful";

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
  fields: Entry<any>["fields"];
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

export type LocaleT = Pick<
  Locale,
  "code" | "default" | "fallbackCode" | "name"
>;

export type ContentTypeT = {
  sys: { id: string };
  fields: Array<{ id: string; name: string; localized: boolean, type: string, linkType?: string, items?: { type?: string, linkType?: string} }>;
};

export type ContentfulClientT = {
  getEntries: (query?: EntriesQueryT) => Promise<{
    skip: number;
    limit: number;
    total: number;
    items: Array<EntryT>;
  }>;

  getLocales: () => Promise<{
    skip: number;
    limit: number;
    total: number;
    items: Array<LocaleT>;
  }>;

  getContentTypes: (query?: ContentTypesQueryT) => Promise<{
    skip: number;
    limit: number;
    total: number;
    items: Array<ContentTypeT>;
  }>;

  getTags: (query?: TagsQueryT) => Promise<{
    skip: number;
    limit: number;
    total: number;
    items: Array<TagT>;
  }>;
};
