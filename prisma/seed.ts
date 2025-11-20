import { PrismaClient } from "../lib/generated/prisma";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seed...");

  // Create default admin user
  const adminEmail = "admin@temple.com";
  const adminPassword = "admin123"; // Change this in production!

  // Check if admin already exists
  const existingAdmin = await prisma.admin_users.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log("✅ Admin user already exists");
  } else {
    const passwordHash = await hash(adminPassword, 10);
    const adminId = `admin_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    
    const admin = await prisma.admin_users.create({
      data: {
        id: adminId,
        email: adminEmail,
        passwordHash,
        role: "admin",
      },
    });

    console.log("✅ Created admin user:", {
      email: admin.email,
      role: admin.role,
    });
    console.log("\n⚠️  Default credentials:");
    console.log("   Email:", adminEmail);
    console.log("   Password:", adminPassword);
    console.log("   Please change the password after first login!\n");
  }

  // Create initial slot configurations for the next 7 days
  console.log("\n📅 Creating initial slot configurations...");
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Define default time slots (9 AM to 5 PM, hourly slots)
  const timeSlots = [
    { startTime: "09:00", endTime: "10:00", capacity: 50 },
    { startTime: "10:00", endTime: "11:00", capacity: 50 },
    { startTime: "11:00", endTime: "12:00", capacity: 50 },
    { startTime: "12:00", endTime: "13:00", capacity: 40 }, // Lunch time - reduced capacity
    { startTime: "13:00", endTime: "14:00", capacity: 50 },
    { startTime: "14:00", endTime: "15:00", capacity: 50 },
    { startTime: "15:00", endTime: "16:00", capacity: 50 },
    { startTime: "16:00", endTime: "17:00", capacity: 50 },
  ];

  let slotsCreated = 0;
  let slotsSkipped = 0;

  // Create slots for the next 7 days
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const slotDate = new Date(today);
    slotDate.setDate(today.getDate() + dayOffset);

    for (const slot of timeSlots) {
      // Check if slot already exists
      const existingSlot = await prisma.slots.findFirst({
        where: {
          date: slotDate,
          startTime: slot.startTime,
          endTime: slot.endTime,
        },
      });

      if (existingSlot) {
        slotsSkipped++;
        continue;
      }

      // Create the slot
      const slotId = `slot_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      await prisma.slots.create({
        data: {
          id: slotId,
          date: slotDate,
          startTime: slot.startTime,
          endTime: slot.endTime,
          capacity: slot.capacity,
          bookedCount: 0,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      slotsCreated++;
    }
  }

  console.log(`✅ Created ${slotsCreated} new slots`);
  if (slotsSkipped > 0) {
    console.log(`ℹ️  Skipped ${slotsSkipped} existing slots`);
  }

  console.log("\n✅ Seed completed successfully!");
  console.log("\n📋 Summary:");
  console.log(`   - Admin users: 1`);
  console.log(`   - Time slots created: ${slotsCreated}`);
  console.log(`   - Date range: ${today.toLocaleDateString()} to ${new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString()}`);
  console.log("\n💡 Next steps:");
  console.log("   1. Log in to admin dashboard at /admin/login");
  console.log("   2. Change the default admin password");
  console.log("   3. Adjust slot configurations as needed");
  console.log("   4. Start accepting bookings!\n");
}

main()
  .catch((e) => {
    console.error("Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
