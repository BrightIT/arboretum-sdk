import { getAllEntriesRecursively } from "./get-all-entries-recursively";
import {
  mockedContentfulEntriesClientApi,
  mockedEntrySysId,
} from "./__mocks__/mocked-contentful-entries-client-api";
const testContentTypeId = "test";

describe(getAllEntriesRecursively, () => {
  test("Handle case where there are no entries", async () => {
    const entries = await getAllEntriesRecursively(
      mockedContentfulEntriesClientApi(testContentTypeId, 0),
      "cda-client",
      testContentTypeId,
      0,
      [],
      undefined,
      [],
      10
    );
    expect(entries.length).toBe(0);
  });

  test("Handle case where entries can be fetched with single request ", async () => {
    const total = 10;
    const entries = await getAllEntriesRecursively(
      mockedContentfulEntriesClientApi(testContentTypeId, total),
      "cda-client",
      testContentTypeId,
      0,
      [],
      undefined,
      [],
      10
    );
    const entriesIds = entries.map((e) => e.sys.id);
    const expectedEntriesIds = [...Array(total).keys()].map((_, idx) =>
      mockedEntrySysId(testContentTypeId, idx)
    );
    expect(entriesIds).toEqual(expectedEntriesIds);
  });

  test("Handle case where entries must be fetched with multiple requests ", async () => {
    const total = 101;
    const entries = await getAllEntriesRecursively(
      mockedContentfulEntriesClientApi(testContentTypeId, total),
      "cda-client",
      testContentTypeId,
      0,
      [],
      undefined,
      [],
      10
    );
    const entriesIds = entries.map((e) => e.sys.id);
    const expectedEntriesIds = [...Array(total).keys()].map((_, idx) =>
      mockedEntrySysId(testContentTypeId, idx)
    );
    expect(entriesIds).toEqual(expectedEntriesIds);
  });
});
