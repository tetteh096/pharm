"use server";

import { prisma } from "@/lib/prisma";

export type PublicTeamProfile = {
  id: string;
  name: string;
  role: string;
  image: string | null;
  facebookUrl: string | null;
  linkedinUrl: string | null;
  instagramUrl: string | null;
};

export async function getPublicTeamProfiles(): Promise<PublicTeamProfile[]> {
  return prisma.teamProfile.findMany({
    where: { published: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      name: true,
      role: true,
      image: true,
      facebookUrl: true,
      linkedinUrl: true,
      instagramUrl: true,
    },
  });
}
