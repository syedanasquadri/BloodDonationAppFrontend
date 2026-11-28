export const BLOOD_GROUPS = [
  { label: "A+", value: "A_POSITIVE" },
  { label: "A-", value: "A_NEGATIVE" },
  { label: "B+", value: "B_POSITIVE" },
  { label: "B-", value: "B_NEGATIVE" },
  { label: "AB+", value: "AB_POSITIVE" },
  { label: "AB-", value: "AB_NEGATIVE" },
  { label: "O+", value: "O_POSITIVE" },
  { label: "O-", value: "O_NEGATIVE" },
] as const;

export type BloodGroup = (typeof BLOOD_GROUPS)[number]["value"];

export const COMPATIBLE_DONOR_GROUPS: Record<BloodGroup, readonly BloodGroup[]> =
  {
    O_NEGATIVE: ["O_NEGATIVE"],
    O_POSITIVE: ["O_POSITIVE", "O_NEGATIVE"],
    A_NEGATIVE: ["A_NEGATIVE", "O_NEGATIVE"],
    A_POSITIVE: ["A_POSITIVE", "A_NEGATIVE", "O_POSITIVE", "O_NEGATIVE"],
    B_NEGATIVE: ["B_NEGATIVE", "O_NEGATIVE"],
    B_POSITIVE: ["B_POSITIVE", "B_NEGATIVE", "O_POSITIVE", "O_NEGATIVE"],
    AB_NEGATIVE: ["AB_NEGATIVE", "A_NEGATIVE", "B_NEGATIVE", "O_NEGATIVE"],
    AB_POSITIVE: [
      "AB_POSITIVE",
      "AB_NEGATIVE",
      "A_POSITIVE",
      "A_NEGATIVE",
      "B_POSITIVE",
      "B_NEGATIVE",
      "O_POSITIVE",
      "O_NEGATIVE",
    ],
  };

export const getBloodGroupLabel = (value: string): string =>
  BLOOD_GROUPS.find((group) => group.value === value)?.label ?? value;

export const getCompatibleBloodGroupLabels = (
  recipientGroup: BloodGroup,
): string[] => COMPATIBLE_DONOR_GROUPS[recipientGroup].map(getBloodGroupLabel);
