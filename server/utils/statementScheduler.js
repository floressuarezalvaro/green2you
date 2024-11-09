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

        const req = { body: statementData };
        const res = {
          status: (statusCode) => ({
            json: (data) => data._id,
          }),
        };

        const createdStatement = await createStatement(req, res);

        if (
          client.clientAutoEmailStatementsEnabled === true &&
          createdStatement
        ) {
          await sendStatementByEmail(client.clientEmail, createdStatement._id);
        }
      }
    }
  } catch (error) {
    console.error("Error generating monthly statements:", error);
  }
};

module.exports = monthlyStatements;
