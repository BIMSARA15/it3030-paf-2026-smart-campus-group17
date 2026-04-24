import api from "./api";
import { getPreviewUser, isPreviewModeEnabled } from "./previewMode";

const PATH = "/api/tickets";
const PREVIEW_TICKETS_KEY = "smartcampus.previewTickets";

function nowIso(offsetMinutes = 0) {
  return new Date(Date.now() + offsetMinutes * 60 * 1000).toISOString();
}

function makePreviewTickets() {
  const previewUser = getPreviewUser() || {
    id: "preview-tech-1",
    name: "Mike Thompson",
    email: "tech1@northridge.edu",
  };

  return [
    {
      id: "preview-ticket-1",
      ticketCode: "TKT-101",
      title: "[HVAC] Lecture Hall A201 — Air conditioning leak",
      description: "Water is dripping from the ceiling vent near the projector and making the front row floor slippery.",
      status: "OPEN",
      priority: "HIGH",
      category: "HVAC",
      reportedByUserId: "student-01",
      reporterName: "Sarah Lee",
      assignedTechnicianId: previewUser.id,
      assignedTechnicianName: previewUser.name,
      resourceId: "res-a201",
      imageUrls: [],
      contactInfo: "sarah.lee@northridge.edu",
      resolutionNote: "",
      comments: [
        {
          commentId: "preview-comment-1",
          authorId: "student-01",
          authorRole: "STUDENT",
          message: "Leak started after the morning class ended.",
          createdAt: nowIso(-720),
        },
      ],
      createdAt: nowIso(-780),
      updatedAt: nowIso(-720),
    },
    {
      id: "preview-ticket-2",
      ticketCode: "TKT-102",
      title: "[IT EQUIPMENT] Computer Lab B301 — Projector not detected",
      description: "The instructor workstation cannot detect the projector over HDMI. Restarting did not help.",
      status: "IN_PROGRESS",
      priority: "MEDIUM",
      category: "IT_EQUIPMENT",
      reportedByUserId: "lecturer-01",
      reporterName: "Dr. Perera",
      assignedTechnicianId: previewUser.id,
      assignedTechnicianName: previewUser.name,
      resourceId: "res-b301",
      imageUrls: [],
      contactInfo: "Ext 2251",
      resolutionNote: "Testing spare HDMI cable and adapter.",
      comments: [
        {
          commentId: "preview-comment-2",
          authorId: previewUser.id,
          authorRole: "TECHNICIAN",
          message: "On site now. Checking cabling and display settings.",
          createdAt: nowIso(-210),
        },
      ],
      createdAt: nowIso(-300),
      updatedAt: nowIso(-210),
    },
    {
      id: "preview-ticket-3",
      ticketCode: "TKT-103",
      title: "[FURNITURE] Boardroom C201 — Broken chair wheel",
      description: "One chair near the window is missing a wheel and becomes unstable during meetings.",
      status: "RESOLVED",
      priority: "LOW",
      category: "FURNITURE",
      reportedByUserId: previewUser.id,
      reporterName: previewUser.name,
      assignedTechnicianId: previewUser.id,
      assignedTechnicianName: previewUser.name,
      resourceId: "res-c201",
      imageUrls: [],
      contactInfo: "tech1@northridge.edu",
      resolutionNote: "Replaced the damaged caster and tested chair movement.",
      comments: [
        {
          commentId: "preview-comment-3",
          authorId: previewUser.id,
          authorRole: "TECHNICIAN",
          message: "Replacement part installed and chair is stable again.",
          createdAt: nowIso(-1440),
        },
      ],
      createdAt: nowIso(-1560),
      updatedAt: nowIso(-1440),
    },
  ];
}

function readPreviewTickets() {
  if (typeof window === "undefined") return makePreviewTickets();

  try {
    const raw = window.localStorage.getItem(PREVIEW_TICKETS_KEY);
    if (!raw) {
      const seeded = makePreviewTickets();
      window.localStorage.setItem(PREVIEW_TICKETS_KEY, JSON.stringify(seeded));
      return seeded;
    }

    return JSON.parse(raw);
  } catch {
    return makePreviewTickets();
  }
}

function writePreviewTickets(tickets) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PREVIEW_TICKETS_KEY, JSON.stringify(tickets));
}

function clone(data) {
  return JSON.parse(JSON.stringify(data));
}

function withPreview(handler) {
  if (!isPreviewModeEnabled()) return null;
  return Promise.resolve(clone(handler()));
}

function nextPreviewCode(tickets) {
  const max = tickets.reduce((highest, ticket) => {
    const match = /TKT-(\d+)/.exec(ticket.ticketCode || "");
    return Math.max(highest, match ? Number(match[1]) : 0);
  }, 100);

  return `TKT-${String(max + 1).padStart(3, "0")}`;
}

/** Session user from Spring (includes Mongo `id` for ticket APIs). */
export const getAuthUserProfile = async () => {
  const { data } = await api.get("/api/auth/user");
  if (!data || typeof data !== "object" || data.requiresRegistration) return null;
  return data;
};

/** Create a new maintenance ticket. */
export const createTicket = async (ticketData) => {
  const previewResult = withPreview(() => {
    const previewUser = getPreviewUser();
    const tickets = readPreviewTickets();
    const createdAt = nowIso();
    const ticket = {
      id: `preview-ticket-${crypto.randomUUID?.() || Date.now()}`,
      ticketCode: nextPreviewCode(tickets),
      title: ticketData.title,
      description: ticketData.description,
      status: "OPEN",
      priority: ticketData.priority || "MEDIUM",
      category: ticketData.category || "OTHER",
      reportedByUserId: previewUser?.id || "preview-tech-1",
      reporterName: previewUser?.name || "Mike Thompson",
      assignedTechnicianId: previewUser?.id || "preview-tech-1",
      assignedTechnicianName: previewUser?.name || "Mike Thompson",
      resourceId: ticketData.resourceId || null,
      imageUrls: ticketData.imageUrls || [],
      comments: [],
      contactInfo: ticketData.contactInfo || "",
      resolutionNote: "",
      createdAt,
      updatedAt: createdAt,
    };

    writePreviewTickets([ticket, ...tickets]);
    return ticket;
  });
  if (previewResult) return previewResult;

  const { data } = await api.post(PATH, ticketData);
  return normalizeTicket(data);
};

/** List tickets reported by a specific user (used by My Tickets tab). */
export const getMyTickets = async (userId) => {
  const previewResult = withPreview(() => readPreviewTickets().filter((ticket) => ticket.reportedByUserId === userId));
  if (previewResult) return previewResult.map(normalizeTicket);

  const { data } = await api.get(`${PATH}/user/${userId}`);
  return Array.isArray(data) ? data.map(normalizeTicket) : data;
};

export const getTicketById = async (id) => {
  const previewResult = withPreview(() => readPreviewTickets().find((ticket) => ticket.id === id));
  if (previewResult) return normalizeTicket(previewResult);

  const { data } = await api.get(`${PATH}/${id}`);
  return normalizeTicket(data);
};

/** List tickets currently assigned to the given technician. */
export const getTechnicianTickets = async (techId) => {
  const previewResult = withPreview(() => readPreviewTickets().filter((ticket) => ticket.assignedTechnicianId === techId));
  if (previewResult) return previewResult.map(normalizeTicket);

  const { data } = await api.get(`${PATH}/technician/${techId}`);
  return Array.isArray(data) ? data.map(normalizeTicket) : data;
};

/** Admin-only — every ticket in the system. */
export const getAllTickets = async () => {
  const previewResult = withPreview(() => readPreviewTickets());
  if (previewResult) return previewResult.map(normalizeTicket);

  const { data } = await api.get(PATH);
  return Array.isArray(data) ? data.map(normalizeTicket) : data;
};

/**
 * Move a ticket forward in its lifecycle.
 * Backend enforces: OPEN -> IN_PROGRESS -> RESOLVED (+ REJECTED / CLOSED).
 */
export const updateTicketStatus = async (id, status, note) => {
  const previewResult = withPreview(() => {
    const previewUser = getPreviewUser();
    const tickets = readPreviewTickets();
    const updatedTickets = tickets.map((ticket) => {
      if (ticket.id !== id) return ticket;

      const updated = {
        ...ticket,
        status,
        updatedAt: nowIso(),
        resolutionNote: note || ticket.resolutionNote || "",
      };

      if (note) {
        updated.comments = [
          ...(ticket.comments || []),
          {
            commentId: `preview-comment-${crypto.randomUUID?.() || Date.now()}`,
            authorId: previewUser?.id || "preview-tech-1",
            authorRole: "TECHNICIAN",
            message: note,
            createdAt: updated.updatedAt,
          },
        ];
      }

      return updated;
    });

    writePreviewTickets(updatedTickets);
    return updatedTickets.find((ticket) => ticket.id === id);
  });
  if (previewResult) return previewResult;

  const { data } = await api.patch(`${PATH}/${id}/status`, { status, note });
  return normalizeTicket(data);
};

/** Convert Jackson LocalDateTime array or string to ISO string for the UI. */
function normalizeInstant(v) {
  if (v == null) return v;
  if (typeof v === "string") return v;
  if (Array.isArray(v) && v.length >= 3) {
    const [y, mo, d, h = 0, mi = 0, s = 0, nano = 0] = v;
    return new Date(y, mo - 1, d, h, mi, s, Math.floor(nano / 1e6)).toISOString();
  }
  return v;
}

function normalizeCommentDates(ticket) {
  if (!ticket?.comments?.length) return ticket;
  return {
    ...ticket,
    comments: ticket.comments.map((c) => ({
      ...c,
      createdAt: normalizeInstant(c.createdAt),
    })),
    updatedAt: normalizeInstant(ticket.updatedAt) ?? ticket.updatedAt,
  };
}

function normalizeTicket(ticket) {
  if (!ticket) return ticket;
  const withComments = normalizeCommentDates(ticket);
  return {
    ...withComments,
    createdAt: normalizeInstant(ticket.createdAt) ?? withComments.createdAt,
    updatedAt: normalizeInstant(ticket.updatedAt) ?? withComments.updatedAt,
  };
}

export const addComment = async (id, message) => {
  const previewResult = withPreview(() => {
    const previewUser = getPreviewUser();
    const tickets = readPreviewTickets();
    const updatedTickets = tickets.map((ticket) => {
      if (ticket.id !== id) return ticket;

      return {
        ...ticket,
        updatedAt: nowIso(),
        comments: [
          ...(ticket.comments || []),
          {
            commentId: `preview-comment-${crypto.randomUUID?.() || Date.now()}`,
            authorId: previewUser?.id || "preview-tech-1",
            authorRole: "TECHNICIAN",
            message,
            createdAt: nowIso(),
          },
        ],
      };
    });

    writePreviewTickets(updatedTickets);
    return updatedTickets.find((ticket) => ticket.id === id);
  });
  if (previewResult) return previewResult;

  const { data } = await api.post(`${PATH}/${id}/comments`, { message });
  return normalizeTicket(data);
};

/** Append image URLs to the gallery (max 3 total enforced by the backend). */
export const uploadTicketImages = async (id, imageUrls) => {
  const previewResult = withPreview(() => {
    const tickets = readPreviewTickets();
    const updatedTickets = tickets.map((ticket) => {
      if (ticket.id !== id) return ticket;
      return {
        ...ticket,
        updatedAt: nowIso(),
        imageUrls: [...(ticket.imageUrls || []), ...imageUrls].slice(0, 3),
      };
    });

    writePreviewTickets(updatedTickets);
    return updatedTickets.find((ticket) => ticket.id === id);
  });
  if (previewResult) return previewResult;

  const { data } = await api.post(`${PATH}/${id}/images`, { imageUrls });
  return data;
};

export const assignTechnician = async (id, technicianId) => {
  const previewResult = withPreview(() => {
    const tickets = readPreviewTickets();
    const previewUser = getPreviewUser();
    const updatedTickets = tickets.map((ticket) => {
      if (ticket.id !== id) return ticket;
      return {
        ...ticket,
        updatedAt: nowIso(),
        assignedTechnicianId: technicianId,
        assignedTechnicianName:
          technicianId === previewUser?.id ? previewUser.name : `Technician ${technicianId}`,
      };
    });

    writePreviewTickets(updatedTickets);
    return updatedTickets.find((ticket) => ticket.id === id);
  });
  if (previewResult) return previewResult;

  const { data } = await api.patch(`${PATH}/${id}/assign`, { technicianId });
  return data;
};

export const deleteTicket = async (id) => {
  const previewResult = withPreview(() => {
    const tickets = readPreviewTickets().filter((ticket) => ticket.id !== id);
    writePreviewTickets(tickets);
    return { success: true };
  });
  if (previewResult) return previewResult;

  const { data } = await api.delete(`${PATH}/${id}`);
  return data;
};
