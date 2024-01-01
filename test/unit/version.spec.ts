import { getVersionTags } from "../../src/version.js";
import { expect } from "@infra-blocks/test";

describe("version", () => {
  describe(getVersionTags.name, function () {
    it("should work for a version of 1.2.3 and a release type of patch", function () {
      const currentVersion = "1.2.3";
      const releaseType = "patch";

      expect(getVersionTags({ currentVersion, releaseType })).to.deep.equals([
        "v1",
        "v1.2",
        "v1.2.4",
      ]);
    });
    it("should work for a version of 1.2.3 and a release type of minor", function () {
      const currentVersion = "1.2.3";
      const releaseType = "minor";

      expect(getVersionTags({ currentVersion, releaseType })).to.deep.equals([
        "v1",
        "v1.3",
        "v1.3.0",
      ]);
    });
    it("should work for a version of 1.2.3 and a release type of major", function () {
      const currentVersion = "1.2.3";
      const releaseType = "major";

      expect(getVersionTags({ currentVersion, releaseType })).to.deep.equals([
        "v2",
        "v2.0",
        "v2.0.0",
      ]);
    });
  });
});
