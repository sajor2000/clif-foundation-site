import raw from "@/data/board-members.json";

type RawMember = {
  id: string;
  display_order: number;
  roster_name: string;
  name_with_credentials: string;
  affiliations: string[];
  foundation_role: string;
  bio: string;
  image_alt: string;
  images: { webp: string };
};

export type BoardMember = {
  id: string;
  displayOrder: number;
  name: string;
  nameWithCredentials: string;
  role: string;
  affiliation: string;
  bio: string;
  imageSrc: string;
  imageAlt: string;
};

function toMember(row: RawMember): BoardMember {
  const filename = row.images.webp.replace(/^headshots\//, "");
  return {
    id: row.id,
    displayOrder: row.display_order,
    name: row.roster_name,
    nameWithCredentials: row.name_with_credentials,
    role: row.foundation_role,
    affiliation: row.affiliations[0] ?? "",
    bio: row.bio,
    imageSrc: `/board/headshots/${filename}`,
    imageAlt: row.image_alt,
  };
}

export const BOARD_MEMBERS: BoardMember[] = (raw as RawMember[])
  .map(toMember)
  .sort((a, b) => a.displayOrder - b.displayOrder);

export const BOARD_OFFICERS = BOARD_MEMBERS.filter((m) =>
  m.role === "President" || m.role === "Secretary" || m.role === "Treasurer",
);

export const BOARD_DIRECTORS = BOARD_MEMBERS.filter(
  (m) => m.role === "Director",
);
