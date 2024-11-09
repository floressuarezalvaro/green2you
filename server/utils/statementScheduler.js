const moment = require("moment-timezone");
const Client = require("../models/clientModel");
const createStatement =
  require("../controllers/statementsController").createStatement;
const { sendStatementByEmail } = require("../utils/emailHandler");

const monthlyStatements = async () => {
  const today = moment().date();
  console.log("Today is:", today);

  try {
    const clients = await Client.find({ clientStatementCreateDate: today });

    for (const client of clients) {
      const clientId = client._id;

      if (client.clientAutoCreateStatementsEnabled === true) {
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

        let createdStatement;
        const req = { body: statementData };
        const res = {
          status: (statusCode) => ({
            json: (data) => {
              createdStatement = data;
              return createdStatement;
            },
          }),
        };

        await createStatement(req, res);

        if (createdStatement) {
          if (client.clientAutoEmailStatementsEnabled === true) {
            await sendStatementByEmail(
              client.clientEmail,
              createdStatement._id
            );
          }
        } else {
          console.log("Statement creation failed for client:", clientId);
        }
      }
    }
  } catch (error) {
    console.error("Error generating or sending monthly statements:", error);
  }
};

module.exports = monthlyStatements;
