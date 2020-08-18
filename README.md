# :e-mail: Mail Send 



Send mail manually to the register users, if you have a google form and after submit the form you want to send a mail then google script allow to send 100 mail via Gmail per day. So this project help you to fetch the mails from google sheet and then send the mail to the registered users. :warning: https://support.google.com/mail/answer/22839?hl=en check the limitation of Gmail.

## Includes

- [Mongoose](https://mongoosejs.com/)
- [Typescript](https://www.typescriptlang.org/)
- [Nodemailer](https://nodemailer.com/about/)

## Get Started

- ### make sure you have [node.js](https://nodejs.org/en/) install in your system `v12 is preferred`
- ### clone repo

```bash
git clone https://github.com/meghoshpritam/mail-send.git
```

-  ### go to the repo

```bash
cd courses-client
```
- Rename the `sample.env` file to `.env` file and fill the details. You have to get the google sheet API secret. and add the google sheet API service email with google sheets.

- For Gmail make sure your two step verification is turn off and enable Less secure app access by going to the this URL: [lesssecureapps](https://myaccount.google.com/lesssecureapps)

- Inside the `src/template` folder create two file name `mail.html` contain the mail body in html format and `mail.txt` file contain the text format of mail body it display if the mail client don't support the html.

- For changing the subject of the mail change the subject in `src/controllers/SheetData.ts` at `line no:75` `const subject = 'Thanks for registration';` 

- For more information about nodemailer check the  [nodemailer documentation](https://nodemailer.com/usage/)

- ### install dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

- ### start the project

```bash
npm start
# or
yarn start
# or
pnpm start
```

- ### Run and provide the options to the CLI

```bash
>>> pnpm start

> mail-send@1.0.0 start C:\Users\Computer\Desktop\Projetcs\mail-send
> set debug=* && ts-node-dev --respawn --transpile-only ./src/app.ts

Using ts-node version 8.10.2, typescript version 3.9.7
(node:15340) DeprecationWarning: collection.ensureIndex is deprecated. Use createIndexes instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
1. sync
2. send mail
3. status
4. rollback
```