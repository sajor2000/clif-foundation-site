import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ACCEPTED_UPLOAD_TYPES,
  MAX_UPLOAD_BYTES,
  uploadRejection,
} from "../../convex/lib/uploads.ts";

const MB = 1024 * 1024;

describe("uploadRejection", () => {
  it("accepts common board paperwork", () => {
    for (const type of [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv",
      "image/png",
      "image/jpeg",
    ]) {
      assert.equal(uploadRejection(2 * MB, type), null, type);
    }
  });

  it("ignores content-type parameters and case", () => {
    assert.equal(uploadRejection(MB, "Text/CSV; charset=utf-8"), null);
  });

  it("rejects empty and oversized files", () => {
    assert.match(uploadRejection(0, "application/pdf"), /empty/i);
    assert.equal(uploadRejection(MAX_UPLOAD_BYTES, "application/pdf"), null);
    assert.match(uploadRejection(MAX_UPLOAD_BYTES + 1, "application/pdf"), /larger than/i);
  });

  it("rejects executables, HTML and unknown types", () => {
    for (const type of ["application/x-msdownload", "text/html", "application/octet-stream", ""]) {
      assert.match(uploadRejection(MB, type), /not allowed/i, type);
    }
  });

  it("exposes an accept list for the file input", () => {
    assert.ok(ACCEPTED_UPLOAD_TYPES.includes(".pdf"));
    assert.ok(ACCEPTED_UPLOAD_TYPES.includes("application/pdf"));
  });
});
