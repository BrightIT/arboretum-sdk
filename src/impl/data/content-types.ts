import { ArboretumClientCtx, SysIdT } from '../arboretum-client.impl';
import { ContentTypeT } from '../../clients/contentful-client/contentful-client';
import {
  validatePageContentType,
  validateRedirectContentType,
} from './helpers/validate-content-types';
import { arrayToMap } from '../../utils/array-to-map';
import { left } from '../../utils/fp-utils';

export type ContentTypesT = Map<
  SysIdT,
  Pick<ContentTypeT, 'sys'> & {
    fields: Map<SysIdT, ContentTypeT['fields'][number]>;
  }
>;

type ContentTypesR = {
  contentTypes: ContentTypesT;
  warnings?: Array<string>;
};

export const contentTypes = async (
  ctx: Pick<ArboretumClientCtx, 'clientApi' | 'options'>,
): Promise<ContentTypesR> => {
  const pageContentTypesIds = Object.keys(ctx.options.pageContentTypes);
  const redirectContentTypeIds = ctx.options.redirectContentType
    ? [ctx.options.redirectContentType.id]
    : [];
  const ids = [...pageContentTypesIds, ...redirectContentTypeIds];

  const { items } = await ctx.clientApi.getContentTypes({
    limit: ids.length,
    'sys.id[in]': ids.join(','),
  });

  const contentTypesMap = arrayToMap<ContentTypeT>(ct => ct.sys.id)(_ => _)(
    items,
  );

  const contentTypesMapSeed: ContentTypesR = {
    contentTypes: new Map(),
    warnings: undefined,
  };

  const pageContentTypesConfigs = Object.entries(
    ctx.options.pageContentTypes,
  ).map(([contentTypeId, config]) => ({
    type: 'page-content-type' as const,
    id: contentTypeId,
    ...config,
  }));

  const redirectContentTypeConfigs = ctx.options.redirectContentType
    ? [
        {
          type: 'redirect-content-type' as const,
          ...ctx.options.redirectContentType,
        },
      ]
    : [];

  const contentTypesConfigs = [
    ...pageContentTypesConfigs,
    ...redirectContentTypeConfigs,
  ];

  return Object.values(contentTypesConfigs).reduce(
    ({ contentTypes, warnings }, contentTypeConfig) => {
      const validateContentType =
        contentTypeConfig.type === 'redirect-content-type'
          ? validateRedirectContentType(contentTypeConfig)
          : validatePageContentType(contentTypeConfig);

      const matchingContentTypeDef = contentTypesMap.get(contentTypeConfig.id);

      const validatedContentType = matchingContentTypeDef
        ? validateContentType(matchingContentTypeDef)
        : left(`Failed to get content type with id: ${contentTypeConfig.id}.`);

      if (validatedContentType._tag === 'Right') {
        const fields = arrayToMap<ContentTypeT['fields'][number]>(f => f.id)(
          _ => _,
        )(validatedContentType.right.fields);

        contentTypes.set(contentTypeConfig.id, {
          sys: validatedContentType.right.sys,
          fields,
        });
      } else {
        const warning = validatedContentType.left;
        if (warnings) {
          warnings.push(warning);
        } else {
          warnings = [warning];
        }
      }

      return { contentTypes, warnings };
    },
    contentTypesMapSeed,
  );
};
