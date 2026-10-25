import type { LabChallenge } from "./types";

const routeSegmentPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isValidChallengeRouteSegment(
  value: unknown,
): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= 64 &&
    routeSegmentPattern.test(value)
  );
}

export function getChallengePath(
  challenge: Pick<LabChallenge, "track" | "slug">,
): string {
  if (
    !isValidChallengeRouteSegment(challenge.track) ||
    !isValidChallengeRouteSegment(challenge.slug)
  ) {
    throw new Error("Cannot build a path for an invalid challenge route.");
  }
  return `/lab/${challenge.track}/${challenge.slug}`;
}
