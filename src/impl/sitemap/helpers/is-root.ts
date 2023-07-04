import { PageT } from "../../arboretum-client.impl";

export const isRoot = (page: Pick<PageT, "parent">): boolean => !page.parent;
