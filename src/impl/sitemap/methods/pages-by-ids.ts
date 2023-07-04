import { ArboretumClientT } from '../../../arboretum-client';
import { ArboretumClientCtx } from '../../arboretum-client.impl';
import { pageById } from './page-by-id';

export const pagesByIds =
  (
    ctx: Pick<
      ArboretumClientCtx,
      'data' | 'sitemap' | 'options' | 'pageHomeTagId'
    >,
  ): ArboretumClientT['pagesByIds'] =>
  (localeCode, ids, options) =>
    ids.map(id => pageById(ctx)(localeCode, id, options));
