"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type TeamProfileInput = {
  name: string;
  role: string;
  image?: string | null;
  facebookUrl?: string;
  linkedinUrl?: string;
  instagramUrl?: string;
  sortOrder?: number;
  published?: boolean;
};

async function requireStaff() {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  return session;
}

function cleanUrl(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function clean(input: TeamProfileInput) {
  return {
    name: input.name.trim(),
    role: input.role.trim(),
    image: input.image?.trim() || null,
    facebookUrl: cleanUrl(input.facebookUrl),
    linkedinUrl: cleanUrl(input.linkedinUrl),
    instagramUrl: cleanUrl(input.instagramUrl),
    sortOrder: Number.isFinite(input.sortOrder) ? Math.max(0, Math.floor(input.sortOrder!)) : 0,
    published: input.published ?? true,
  };
}

function revalidateTeam() {
  revalidatePath("/dashboard/team");
  revalidatePath("/team");
}

export async function getTeamProfiles() {
  await requireStaff();
  return prisma.teamProfile.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
}

export async function createTeamProfile(data: TeamProfileInput) {
  await requireStaff();
  if (!data.name.trim()) throw new Error("Name is required");
  if (!data.role.trim()) throw new Error("Role is required");

  const profile = await prisma.teamProfile.create({ data: clean(data) });
  revalidateTeam();
  return profile;
}

export async function updateTeamProfile(id: string, data: TeamProfileInput) {
  await requireStaff();
  if (!data.name.trim()) throw new Error("Name is required");
  if (!data.role.trim()) throw new Error("Role is required");

  const profile = await prisma.teamProfile.update({
    where: { id },
    data: clean(data),
  });
  revalidateTeam();
  return profile;
}

export async function deleteTeamProfile(id: string) {
  await requireStaff();
  await prisma.teamProfile.delete({ where: { id } });
  revalidateTeam();
}

export async function toggleTeamProfilePublished(id: string, published: boolean) {
  await requireStaff();
  await prisma.teamProfile.update({ where: { id }, data: { published } });
  revalidateTeam();
}
