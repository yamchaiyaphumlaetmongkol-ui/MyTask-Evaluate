/**
 * ClickUp API v2 — เรียกฝั่ง server เท่านั้น
 * ต้องตั้งค่าใน .env: CLICKUP_API_TOKEN, CLICKUP_TEAM_ID (ถ้าไม่ใส่จะใช้ team แรก)
 */

export type ClickUpMember = {
  id: string;
  username: string;
  email: string | null;
  profilePicture: string | null;
  initials: string | null;
  color: string | null;
};

function token(): string {
  const t = process.env.CLICKUP_API_TOKEN?.trim();
  if (!t) throw new Error("ไม่พบ CLICKUP_API_TOKEN ใน .env");
  return t;
}

async function clickupFetch<T>(path: string): Promise<T> {
  const res = await fetch(`https://api.clickup.com/api/v2${path}`, {
    headers: { Authorization: token() },
    next: { revalidate: 0 },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`ClickUp API ${res.status}: ${body.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}

async function resolveTeamId(): Promise<string> {
  const fromEnv = process.env.CLICKUP_TEAM_ID?.trim();
  if (fromEnv) return fromEnv;

  const data = await clickupFetch<{ teams: Array<{ id: string; name: string }> }>(
    "/team",
  );
  const team = data.teams?.[0];
  if (!team) throw new Error("ไม่พบ team ใน ClickUp");
  return String(team.id);
}

type ClickUpTeamUserRow = {
  user: {
    id: number;
    username: string;
    email?: string;
    profilePicture?: string | null;
    initials?: string;
    color?: string;
  };
};

/** ดึงสมาชิกทีมจาก ClickUp */
export async function fetchClickUpMembers(): Promise<ClickUpMember[]> {
  const teamId = await resolveTeamId();
  const data = await clickupFetch<{ team: { members: Array<ClickUpTeamUserRow> } }>(
    `/team/${teamId}`,
  );
  const members = data.team?.members ?? [];

  return members.map((m) => ({
    id: String(m.user.id),
    username: m.user.username ?? "",
    email: m.user.email ?? null,
    profilePicture: m.user.profilePicture ?? null,
    initials: m.user.initials ?? null,
    color: m.user.color ?? null,
  }));
}
