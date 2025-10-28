const moment = require("moment-timezone");
const Client = require("../models/clientModel");
const createStatement =
  require("../controllers/statementsController").createStatement;
const { sendStatementByEmail } = require("../utils/emailHandler");

const calculateStatementDates = (cycleDate) => {
  const now = moment.tz("America/Los_Angeles");
  const maxDaysInMonth = now.daysInMonth();

  const adjustedCycleDate = Math.min(cycleDate, maxDaysInMonth);

  const baseDate = now.clone().date(adjustedCycleDate);

  const isLastDayOfMonth = adjustedCycleDate === maxDaysInMonth;

  const issuedStartDate = isLastDayOfMonth
    ? baseDate.clone().startOf("month").toISOString()
    : baseDate
        .clone()
        .subtract(1, "month")
        .add(1, "day")
        .startOf("day")
        .toISOString();

  const issuedEndDate = baseDate.clone().endOf("day").toISOString();

  return { issuedStartDate, issuedEndDate };
};

const statementScheduler = async () => {
  const today = moment.tz("America/Los_Angeles").date();
  const maxDaysInMonth = moment().daysInMonth();

  console.log("Today is:", today);
  console.log("Max days in this month:", maxDaysInMonth);

  try {
    const query =
      today === maxDaysInMonth
        ? {
            $or: [
              { clientStatementCreateDate: today },
              { clientStatementCreateDate: { $gt: maxDaysInMonth } },
            ],
          }
        : { clientStatementCreateDate: today };

    const clients = await Client.find(query);

    await Promise.all(clients.map((client) => processClientStatement(client)));

    console.log("Monthly statements processing completed.");
  } catch (error) {
    console.error("Error generating or sending monthly statements:", error);
  }
};

const processClientStatement = async (client) => {
  if (!client.clientAutoCreateStatementsEnabled) return;

  try {
    const { issuedStartDate, issuedEndDate } = calculateStatementDates(
      client.clientCycleDate
    );

    const statementData = {
      clientId: client._id,
      issuedStartDate,
      issuedEndDate,
      creationMethod: "auto",
    };

    let createdStatement;
    const req = { body: statementData };
    const res = {
      status: (_statusCode) => ({
        json: (data) => {
          createdStatement = data;
          return createdStatement;
        },
      }),
    };

    await createStatement(req, res);

    if (createdStatement) {
      console.log(`Statement created for client ${client.clientEmail}`);
      if (client.clientAutoEmailStatementsEnabled) {
        await sendStatementByEmail(
          client.clientEmail,
          createdStatement._id,
          process.env.USER_ID
        );
      }
    } else {
      console.warn(`Statement creation failed for client ${client._id}`);
    }
  } catch (error) {
    console.error(`Error processing client ${client._id}:`, error);
  }
};

module.exports = statementScheduler;
