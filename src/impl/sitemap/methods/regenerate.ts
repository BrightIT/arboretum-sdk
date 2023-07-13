import { ArboretumClientT } from '../../../arboretum-client';
import { ArboretumClientCtx } from '../../arboretum-client.impl';
import { sitemapData } from '../../data/sitemap-data';

export const regenerate =
  (ctx: ArboretumClientCtx): ArboretumClientT['regenerate'] =>
  async () => {
    ctx.regenerationInProgress = true;
    const dataE = await sitemapData(ctx).finally(() => {
      ctx.regenerationInProgress = false;
    });
    if (dataE._tag === 'Right') {
      ctx.sitemap = new Map();
      ctx.pagesByTagId = new Map();
      ctx.lastUpdatedAt = new Date().toISOString();
      ctx.data = dataE.right.data;
      return { status: 'OK', warnings: dataE.right.warnings };
    } else {
      throw new Error(dataE.left.join('\n'));
    }
  };
