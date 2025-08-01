const bcrypt = require("bcryptjs");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const hashedPassword = await bcrypt.hash("FINAcle2000//", 10);
    const hashedPasswordMungu = await bcrypt.hash("UGXXX missing", 10);
    const hashedPasswordRonald = await bcrypt.hash("Xerxes@48172!", 10);
    const hashedPasswordSiran = await bcrypt.hash("FINAcle2000//", 10);

    return queryInterface.bulkInsert("Users", [
      {
        firstName: "Gidi",
        lastName: "Sadara",
        email: "gidis@nrmec.co.ug",
        password: hashedPassword,
        ninNumber: "SA123456789",
        phoneNumber: "+256773599715",
        role: "SuperAdmin",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        firstName: "Ronald",
        lastName: "Ozelle",
        email: "ronaldmjakisa@nrmec.co.ug",
        password: hashedPasswordRonald,
        ninNumber: "CM970871059X1A",
        phoneNumber: "+256786856095",
        role: "SuperAdmin",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        firstName: "Siran",
        lastName: "Bagamba",
        email: "siranb@nrmec.co.ug",
        password: hashedPasswordSiran,
        ninNumber: "UGXXX missing",
        phoneNumber: "0702103748",
        role: "SuperAdmin",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete(
      "Users",
      { email: "scarletweira@gmail.com" },
      {}
    );
  },
};

// npx sequelize-cli db:seed:all
// npx sequelize-cli db:migrate

// docker compose up -d
// docker exec -it node-backend npm run db:seed
// docker exec -it node-backend npm run db:migrate

