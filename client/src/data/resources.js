// Hardcoded list mirroring the Figma "Resource / Location" dropdown.
// TODO(module-a): replace with `GET /api/resources` once Module A ships.
export const RESOURCES = [
  { id: "res-a101", label: "Lecture Hall A101 — Block A, Floor 1" },
  { id: "res-a201", label: "Lecture Hall A201 — Block A, Floor 2" },
  { id: "res-b301", label: "Computer Lab B301 — Block B, Floor 3" },
  { id: "res-b302", label: "Science Lab B302 — Block B, Floor 3" },
  { id: "res-c201", label: "Boardroom C201 — Block C, Floor 2" },
];

export const findResourceById = (id) => RESOURCES.find((r) => r.id === id);

export const findResourceLabel = (id) => findResourceById(id)?.label || id || "—";
