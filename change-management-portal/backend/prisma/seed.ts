import { PrismaClient, ChangeType, ChangeStatus, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "ChangeMe123!";

async function upsertUser(email: string, name: string, role: Role, department: string) {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  return prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, name, role, department, passwordHash },
  });
}

async function main() {
  const admin = await upsertUser("admin@bank.example", "Alex Admin", Role.ADMIN, "IT Governance");
  const changeManager = await upsertUser(
    "change.manager@bank.example",
    "Casey Change-Manager",
    Role.CHANGE_MANAGER,
    "IT Service Management"
  );
  const requester = await upsertUser("requester@bank.example", "Riley Requester", Role.REQUESTER, "Core Banking");
  const implementer = await upsertUser(
    "implementer@bank.example",
    "Iris Implementer",
    Role.IMPLEMENTER,
    "Infrastructure"
  );
  await upsertUser("cab1@bank.example", "Cameron CAB", Role.CAB_MEMBER, "Risk & Compliance");
  await upsertUser("cab2@bank.example", "Drew CAB", Role.CAB_MEMBER, "Security");
  await upsertUser("auditor@bank.example", "Avery Auditor", Role.AUDITOR, "Internal Audit");

  const existing = await prisma.changeRequest.findFirst({
    where: { reference: "CHG-2026-00001" },
  });

  if (!existing) {
    await prisma.changeRequest.create({
      data: {
        reference: "CHG-2026-00001",
        title: "Upgrade core banking database cluster to PostgreSQL 16",
        description: "Rolling upgrade of the primary/replica PostgreSQL cluster backing the core ledger service.",
        justification: "Current version reaches end of vendor support next quarter.",
        type: ChangeType.NORMAL,
        status: ChangeStatus.SCHEDULED,
        requesterId: requester.id,
        changeManagerId: changeManager.id,
        implementerId: implementer.id,
        systemsAffected: ["core-ledger-db", "reporting-replica"],
        plannedStart: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        plannedEnd: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
        implementationPlan: "Blue/green upgrade via logical replication failover.",
        testPlan: "Run full regression suite against staging replica post-upgrade.",
        backoutPlan: "Fail back to original primary; replication lag monitored throughout.",
        riskLevel: "HIGH",
        riskScore: 18,
        submittedAt: new Date(),
      },
    });
  }

  console.log("Seed complete. Demo users share password:", DEMO_PASSWORD);
  console.log({ admin: admin.email, changeManager: changeManager.email, requester: requester.email });
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
