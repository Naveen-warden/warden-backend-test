"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const seed_data_1 = require("./seed.data");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log(`Seeding ${seed_data_1.propertiesData.length} properties...`);
    await prisma.property.deleteMany(); // idempotent
    await prisma.property.createMany({ data: seed_data_1.propertiesData });
    console.log("Done.");
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
