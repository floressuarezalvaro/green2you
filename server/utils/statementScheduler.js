const moment = require("moment-timezone");
const Client = require("../models/clientModel");
const createStatement =
  require("../controllers/statementsController").createStatement;
const { sendStatementByEmail } = require("../utils/emailHandler");

const generateMonthlyStatements = async () => {
  const today = moment().date();
  console.log("Today is:", today);

  try {
    const clients = await Client.find({ clientCycleDate: today });

    for (const client of clients) {
      const clientId = client._id;
      const clientCycleDate = client.clientCycleDate;

      const issuedStartDate = moment
        .tz({ day: clientCycleDate + 1 }, "America/Los_Angeles")
        .subtract(1, "month")
        .startOf("day")
        .toISOString();

      const issuedEndDate = moment
        .tz({ day: clientCycleDate }, "America/Los_Angeles")
        .endOf("day")
        .toISOString();

      const statementData = {
        clientId,
        issuedStartDate,
        issuedEndDate,
        creationMethod: "auto",
      };

      const req = { body: statementData };
      const res = {
        status: (statusCode) => ({
          json: async (data) => {
            if (statusCode === 201) {
              if (client.clientAutoStatementsEnabled === true) {
                await sendStatementByEmail(client.clientEmail, data._id);
              }
            } else {
              console.error(
                `Error creating statement for client: ${client.clientName}`,
                data
              );
            }
          },
        }),
      };

      await createStatement(req, res);
    }
  } catch (error) {
    console.error("Error generating monthly statements:", error);
  }
};

module.exports = generateMonthlyStatements;
