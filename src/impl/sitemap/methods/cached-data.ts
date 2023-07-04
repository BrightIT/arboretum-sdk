import { ArboretumClientT } from '../../../arboretum-client';
import { ArboretumClientCtx } from '../../arboretum-client.impl';

export const cachedData =
  (
    ctx: Pick<ArboretumClientCtx, 'data' | 'sitemap' | 'pagesByTagId'>,
  ): ArboretumClientT['cachedData'] =>
  () => ({
    data: ctx.data,
    sitemap: ctx.sitemap,
    pagesByTagId: ctx.pagesByTagId,
  });
