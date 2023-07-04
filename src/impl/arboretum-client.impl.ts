import {
  ArboretumClientConfigFromCdaParamsT,
  ArboretumClientConfigFromCdaT,
  ArboretumClientConfigFromCmaT,
  ArboretumClientContentfulConfigOptionsT,
  ArboretumClientConfigT,
  ArboretumClientT,
  ArboretumClientOptions,
} from '../arboretum-client';
import {
  ContentfulClientT,
  StatusT,
} from '../clients/contentful-client/contentful-client';
import { createContentfulClient } from '../clients/contentful-client/impl/contentful-client-impl';
import { sitemapData, SitemapDataT } from './data/sitemap-data';
import { pageById } from './sitemap/methods/page-by-id';
import { pageByPath } from './sitemap/methods/page-by-path';
import { pagesByTagId } from './sitemap/methods/pages-by-tag-id';
import { pagesByIds } from './sitemap/methods/pages-by-ids';
import { pagesByPaths } from './sitemap/methods/pages-by-paths';
import { regenerate } from './sitemap/methods/regenerate';
import { search } from './sitemap/methods/search';
import { status } from './sitemap/methods/status';
import { Either, right } from '../utils/fp-utils';
import { pages } from './sitemap/methods/pages';
import { buildSitemapEagerly } from './sitemap/helpers/build-sitemap-eagerly';
import { cachedData } from './sitemap/methods/cached-data';
import { buildPagesByTagEagerly } from './sitemap/helpers/build-pages-by-tag-eagerly';

const pageTagIdPrefix = 'page';
const pageHomeTagId = `${pageTagIdPrefix}Home`;
const localeTagIdPrefix = `locale`;

export type LocaleCodeT = string;
export type SysIdT = string;
export type MetadataT = { tags: Array<{ sys: { id: string } }> };
export type PageT = {
  type: 'page';
  sys: {
    id: string;
    cmaOnlyStatus?: StatusT;
  };
  metadata?: MetadataT;
  parent: { sys: { id: string } } | undefined;
  path: string;
  slug: string;
  title?: string;
  childPages: Array<{ sys: { id: string } }>;
};
export type RedirectT = {
  sys: {
    id: string;
    cmaOnlyStatus?: StatusT;
  };
  parent: { sys: { id: string } };
  metadata?: MetadataT;
  path: string;
  title?: string;
  type: 'redirect' | 'alias';
  page: { sys: { id: string } };
};
export type RedirectIdT = RedirectT['sys']['id'];
export type RedirectPathT = RedirectT['path'];
export type PageIdT = (PageT | RedirectT)['sys']['id'];
export type PagePathT = (PageT | RedirectT)['path'];
export type TagIdT = string;
export type LocalizedSitemapT = {
  root: { sys: { id: string } };
  sitemap: Map<PageIdT, PageT | RedirectT>;
  pageIdByPath: Map<PagePathT, PageIdT>;
};
export type SitemapT = Map<LocaleCodeT, Either<string, LocalizedSitemapT>>;

export type PagesByTagIdV = Either<
  string,
  Map<TagIdT, Array<{ sys: { id: SysIdT } }>>
>;
export type PagesByTagIdT = Map<LocaleCodeT, PagesByTagIdV>;

export type CachedDataT = Pick<
  ArboretumClientCtx,
  'data' | 'pagesByTagId' | 'sitemap'
>;

export type ArboretumClientCtx = {
  preview: boolean;
  contentfulClientType: ArboretumClientConfigT['type'];
  lastUpdatedAt: string;
  clientApi: ContentfulClientT;
  cmaPreviewClientApi?: ContentfulClientT;
  options: Pick<
    ArboretumClientContentfulConfigOptionsT,
    'pageContentTypes' | 'redirectContentType'
  > &
    Pick<ArboretumClientOptions, 'includeEntryStatus'>;
  data: SitemapDataT;
  sitemap: SitemapT;
  pagesByTagId: PagesByTagIdT;
  localeTagIdPrefix: string;
  pageTagIdPrefix: string;
  pageHomeTagId: string;
};

const arboretumConfigOptions = (
  config: ArboretumClientConfigT,
): Promise<ArboretumClientContentfulConfigOptionsT> => {
  const configType = config.type;
  switch (config.type) {
    case 'cda-client': {
      return Promise.resolve(config.contentful.options);
    }
    case 'cda-client-params': {
      return Promise.resolve(config.contentful.options);
    }
    case 'cma-client': {
      return Promise.resolve(config.contentful.options);
    }
    default: {
      throw new Error(`Invalid config type ("${configType}").`);
    }
  }
};

export const createArboretumClient = async (
  config: ArboretumClientConfigT,
): Promise<{ client: ArboretumClientT; warnings?: Array<string> }> => {
  const clientApi = createContentfulClient(config);
  const cmaPreviewClientApi =
    config.type === 'cma-client'
      ? createContentfulClient({ ...config, preview: true })
      : undefined;

  const includeEntryStatus =
    config.type === 'cma-client' ? !!config.options?.includeEntryStatus : false;
  const options = await arboretumConfigOptions(config);

  const sitemapDataCtx: Pick<
    ArboretumClientCtx,
    | 'clientApi'
    | 'options'
    | 'localeTagIdPrefix'
    | 'pageHomeTagId'
    | 'contentfulClientType'
    | 'pageTagIdPrefix'
    | 'cmaPreviewClientApi'
    | 'preview'
  > = {
    preview: config.preview,
    clientApi,
    options: { ...options, includeEntryStatus },
    localeTagIdPrefix,
    pageHomeTagId: options.homePageTagId || pageHomeTagId,
    contentfulClientType: config.type,
    pageTagIdPrefix,
    cmaPreviewClientApi,
  };

  const dataE = config.options?.data
    ? right({ data: config.options?.data.data, warnings: undefined })
    : await sitemapData(sitemapDataCtx);
  if (dataE._tag === 'Right') {
    const c = {
      ...sitemapDataCtx,
      data: dataE.right.data,
    };
    const sitemap = config.options?.data
      ? config.options.data.sitemap
      : config.options?.eagerly
      ? buildSitemapEagerly(c, dataE.right.data.locales)
      : new Map();
    const pagesByTagIdRecord = config.options?.data
      ? config.options.data.pagesByTagId
      : config.options?.eagerly
      ? buildPagesByTagEagerly({ ...c, sitemap }, dataE.right.data.locales)
      : new Map();
    const ctx: ArboretumClientCtx = {
      ...c,
      data: dataE.right.data,
      sitemap,

      pagesByTagId: pagesByTagIdRecord,
      lastUpdatedAt: new Date().toISOString(),
    };
    return {
      client: {
        pageByPath: pageByPath(ctx),
        pagesByPaths: pagesByPaths(ctx),
        pageById: pageById(ctx),
        pagesByIds: pagesByIds(ctx),
        pagesByTagId: pagesByTagId(ctx),
        locales: () => [...ctx.data.locales.values()],
        pages: pages(ctx),
        regenerate: regenerate(ctx),
        search: search(ctx),
        status: status(ctx),
        cachedData: cachedData(ctx),
      },
      warnings: dataE.right.warnings,
    };
  } else {
    throw new Error(dataE.left.join('\n'));
  }
};

export const createArboretumClientFromCdaClient = (
  config: Pick<
    ArboretumClientConfigFromCdaT,
    'contentful' | 'preview' | 'options'
  >,
) => createArboretumClient({ ...config, type: 'cda-client' });

export const createArboretumClientFromCdaParams = (
  config: Pick<
    ArboretumClientConfigFromCdaParamsT,
    'contentful' | 'preview' | 'options'
  >,
) => createArboretumClient({ ...config, type: 'cda-client-params' });

export const createArboretumClientFromCma = (
  config: Pick<
    ArboretumClientConfigFromCmaT,
    'contentful' | 'preview' | 'options'
  >,
) => createArboretumClient({ ...config, type: 'cma-client' });
