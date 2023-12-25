// create-html.js

const createHtml = (user) => {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: 'Arial', sans-serif;
            background-color: #f4f4f4;
            color: #333;
            text-align: center;
            margin: 20px;
          }
  
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }
  
          h1 {
            color: #007bff;
          }
  
          p {
            line-height: 1.6;
          }
  
          a {
            display: inline-block;
            margin-top: 15px;
            padding: 10px 20px;
            background-color: #007bff;
            color: #fff;
            text-decoration: none;
            border-radius: 5px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Hello ${user.username},</h1>
          <p>Please activate your account by clicking the following link:</p>
          <a href="${process.env.SITE_ADDRESS}/auth/activate/${user.username}/${user.activation_token}" target="_blank">Activate Account</a>
        </div>
      </body>
      </html>
    `;
  };
  
  module.exports = createHtml;
  