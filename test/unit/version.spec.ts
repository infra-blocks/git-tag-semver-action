import { parseVersion } from "../../src/version.js";
import { expect } from "@infra-blocks/test";

describe("version", () => {
  describe(parseVersion.name, function () {
    it("should work for patch", function () {
      expect(parseVersion("patch")).to.equal("patch");
    });
    it("should work for minor", function () {
      expect(parseVersion("minor")).to.equal("minor");
    });
    it("should work for major", function () {
      expect(parseVersion("major")).to.equal("major");
    });
    it("should throw for anything else", function () {
      expect(() => parseVersion("no version")).to.throw();
    });
  });
});
