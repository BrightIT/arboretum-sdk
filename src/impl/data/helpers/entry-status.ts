import {
  EntryT,
  StatusT,
} from "../../../clients/contentful-client/contentful-client";

// https://www.contentful.com/developers/docs/tutorials/general/determine-entry-asset-state/
export const entryStatus = (
  sys: Pick<EntryT["sys"], "archivedVersion" | "version" | "publishedVersion">
): StatusT | undefined => {
  if (!sys) {
    return;
  } else if (!!sys.publishedVersion && sys.version === sys.publishedVersion + 1)
    return "published";
  else if (!sys.publishedVersion) return "draft";
  else if (
    !!sys.publishedVersion &&
    sys.version &&
    sys.version >= sys.publishedVersion + 2
  )
    return "changed";
  else if (!!sys.archivedVersion) return "archived";
  else {
    return;
  }
};
