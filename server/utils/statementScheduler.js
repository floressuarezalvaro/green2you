const moment = require("moment");
const Client = require("../models/clientModel");
const createStatement =
  require("../controllers/statementsController").createStatement;

const generateMonthlyStatements = async () => {
  const today = moment().date();
  console.log("Today is:", today);

  try {
    const clients = await Client.find({ clientCycleDate: today });

    clients.forEach(async (client) => {
      const clientId = client._id;
      const user_id = client.user_id;
      const clientCycleDate = client.clientCycleDate;

      // Set issuedStartDate to the clientCycleDate of the previous month
      const issuedStartDate = moment()
        .subtract(1, "month")
        .date(clientCycleDate)
        .startOf("day")
        .toISOString();
      // Set issuedEndDate to the clientCycleDate of the current month
      const issuedEndDate = moment()
        .date(clientCycleDate)
        .endOf("day")
        .toISOString();

      const statementData = {
        clientId,
        issuedStartDate,
        issuedEndDate,
        user_id,
      };

      const req = { body: statementData };
      const res = {
        status: (statusCode) => ({
          json: (data) => {
            if (statusCode === 201) {
              console.log(`Statement created for client: ${client.clientName}`);
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
    });
  } catch (error) {
    console.error("Error generating monthly statements:", error);
  }
};

module.exports = generateMonthlyStatements;
