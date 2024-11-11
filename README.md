# Green2You - Billing Streamliner
This application is designed to help streamline billing processes, offering an efficient and user-friendly interface for managing invoices, statements, and payments. It was created to simplify and automate repetitive billing tasks.

### Table of Contents
1. [Features](##features)
2. [Technologies Used](##technologies-used)
3. [Installation](##installation)
4. [Usage](##usage)
5. [Environment Variables](##environment-variables)
6. [Contributing](##contributing)
7. [License](##license)

## Features
- Invoice Management: Easily create, edit, and track invoices.
- Automated Billing Statements: Generate PDF statements automatically based on customizable billing cycles.
- Payment Tracking: Keep track of payments and outstanding balances.
- User-Friendly Dashboard: View and manage all billing activities in one place.
- Email Notifications: Automatically notify clients of due invoices or statements.

## Technologies Used
- Frontend: React, HTML, CSS
- Backend: Node.js, Express
- Database: MongoDB
- Authentication: JWT tokens
- Environment Management: dotenv

## Installation
1. Clone the Repository:
    ```bash
    # bash
    git clone https://github.com/floressuarezalvaro/green2you.git
    ```

2. Install Dependencies:
    ```bash
    # bash
    npm install
    ```
3. Database Setup:
   <br> Make sure MongoDB is installed and running.

4. Environment Variables:
   <br> Create .env.development and .env.production files in the server directory with the following configuration:
      
      ```plaintext
      PORT=<your_port>
      MONGO_URI=<your_mongo_database_uri>
      JWTSECRET=<your_jwt_secret_key>
      EMAIL_USER=<your_email_for_notifications>
      EMAIL_PASS=<your_email_password>
      API_KEY=<your_api_key>
      FRONTEND_URL=<your_frontend_url>
      ```

6. Run the Application:
    ``` bash
    # bash
    npm run dev   # For development
    npm start     # For production
    ```

## Usage
- Register or log in to access your dashboard.
- Create new invoices, statements, or record payments.
- View summaries and client billing history.
- Configure email notifications for automated billing reminders.

## Contributing
Contributions are welcome! Please fork this repository, make your changes, and submit a pull request.

## License
Distributed under the MIT License.
