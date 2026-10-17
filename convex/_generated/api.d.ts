/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as board from "../board.js";
import type * as coi from "../coi.js";
import type * as compliance from "../compliance.js";
import type * as documents from "../documents.js";
import type * as form990 from "../form990.js";
import type * as lib_access from "../lib/access.js";
import type * as lib_audit from "../lib/audit.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_compliance from "../lib/compliance.js";
import type * as lib_directors from "../lib/directors.js";
import type * as lib_minutes from "../lib/minutes.js";
import type * as lib_quorum from "../lib/quorum.js";
import type * as lib_tally from "../lib/tally.js";
import type * as lib_uploads from "../lib/uploads.js";
import type * as meetings from "../meetings.js";
import type * as motions from "../motions.js";
import type * as policies from "../policies.js";
import type * as reporting from "../reporting.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  board: typeof board;
  coi: typeof coi;
  compliance: typeof compliance;
  documents: typeof documents;
  form990: typeof form990;
  "lib/access": typeof lib_access;
  "lib/audit": typeof lib_audit;
  "lib/auth": typeof lib_auth;
  "lib/compliance": typeof lib_compliance;
  "lib/directors": typeof lib_directors;
  "lib/minutes": typeof lib_minutes;
  "lib/quorum": typeof lib_quorum;
  "lib/tally": typeof lib_tally;
  "lib/uploads": typeof lib_uploads;
  meetings: typeof meetings;
  motions: typeof motions;
  policies: typeof policies;
  reporting: typeof reporting;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
