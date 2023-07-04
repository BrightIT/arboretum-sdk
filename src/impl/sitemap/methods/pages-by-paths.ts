import { ArboretumClientT } from '../../../arboretum-client';
import { ArboretumClientCtx } from '../../arboretum-client.impl';
import { pageByPath } from './page-by-path';

export const pagesByPaths =
  (
    ctx: Pick<
      ArboretumClientCtx,
      'data' | 'sitemap' | 'options' | 'pageHomeTagId'
    >,
  ): ArboretumClientT['pagesByPaths'] =>
  (paths, options) =>
    paths.map(path => pageByPath(ctx)(path, options));
