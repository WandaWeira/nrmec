const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Election Management API",
      version: "1.0.0",
      description:
        "API documentation for managing regions, subregions, districts, constituencies, and more",
    },
    servers: [
      {
        url: "http://localhost:8000",
        description: "Local server",
      },
    ],
  },
  apis: ["./routes/*.js"], // Points to the API route files
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
