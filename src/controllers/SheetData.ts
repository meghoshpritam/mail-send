import { config } from 'dotenv';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { find } from 'lodash';
import Registers, { Register } from '../entities/Register';
import { createTransport } from 'nodemailer';
import { writeFile, readFileSync, readFile } from 'fs';

config();

class SheetData {
  public static get = async () => {
    interface Mails {
      email: string;
      name: string;
      status: boolean;
    }

    const dbMails: Register[] = (await Registers.find({}).select('name email status').exec()) || [];

    let mails: Mails[] = [...dbMails];

    try {
      console.log('Start fetching data from google sheets');

      const doc = new GoogleSpreadsheet(process.env.SHEET_ID);

      await doc.useServiceAccountAuth({
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      });

      await doc.loadInfo();

      const formResponse = doc.sheetsByIndex[0];

      const ResponseRows = await formResponse.getRows();

      ResponseRows.forEach((row) => {
        if (!find(mails, { email: row['Email Id'] })) {
          mails = [
            ...mails,
            {
              email: row['Email Id'],
              name: row['Name of the participant(With Salutation Dr/Mr/Ms/Mrs)'],
              status: false,
            },
          ];
        }
      });

      console.log('All data fetched from google sheet.');
      console.log('Start sync with db.');

      let newReg: Mails[] = [];

      mails.forEach((data) => {
        if (!find(dbMails, { email: data.email })) {
          newReg = [...newReg, { name: data.name, email: data.email, status: data.status }];
        }
      });

      if (newReg.length !== 0) await Registers.collection.insertMany(newReg);

      console.log('sync completed');
      SheetData.status();
    } catch (err) {
      console.log('error 1: ', err);
    }
  };
  public static sendMail = async (total: number = 0) => {
    console.log('Start process of sending mail.');

    const text = readFileSync(__dirname + '/' + '../template/mail.txt');
    const html = readFileSync(__dirname + '/' + '../template/mail.html');
    const subject = `Thanks for registration`;

    try {
      const totalRegistration = await Registers.countDocuments({});
      const mails: Register[] = await Registers.find({ status: false });

      console.log(`Total registration: ${totalRegistration}`);
      console.log(`Number of mail: ${totalRegistration - mails.length}`);
      console.log(`Un-send mail: ${mails.length}`);

      const transporter = createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_ID,
          pass: process.env.PASSWORD,
        },
      });

      if (total > 500) {
        console.log('Max limit 500!');
        return;
      }

      let mailIds = '';
      let queries = [];
      let lim = total > mails.length ? mails.length : total;
      for (let idx = 0; idx < lim; idx++) {
        mailIds += `${mails[idx].email}${idx + 1 === lim ? '' : ', '}`;
        queries = [...queries, mails[idx]._id];
      }

      if (lim > 0) {
        console.log(mailIds);
        await transporter.sendMail({
          from: process.env.EMAIL_ID,
          to: mailIds,
          subject,
          text,
          html,
        });

        writeFile(
          __dirname + '/../storage/lastUsed.json',
          JSON.stringify({ ids: [...queries] }),
          (err) => {
            if (err) {
              console.log('Error 4:', err);
            }
          }
        );

        await Registers.updateMany({ _id: { $in: queries } }, { $set: { status: true } }).exec();
      }
      console.log('Process Completed');
    } catch (err) {
      console.log('error 2: ', err);
    }
  };
  public static status = async () => {
    try {
      const total = await Registers.countDocuments({});
      const unSend = await Registers.countDocuments({ status: false });
      console.log(`Total Registration: ${total}`);
      console.log(`Total Mail send: ${total - unSend}`);
      console.log(`Pending mail: ${unSend}`);
    } catch (err) {
      console.log('Error 3:', err);
    }
  };
  public static rollback = async () => {
    readFile(__dirname + '/../storage/lastUsed.json', async (err, data) => {
      if (err) {
        console.log('Error 5:', err);
        return;
      }
      const lastUsedIds = JSON.parse(data.toString())?.ids;

      await Registers.updateMany({ _id: { $in: lastUsedIds } }, { $set: { status: true } }).exec();

      writeFile(__dirname + '/../storage/lastUsed.json', JSON.stringify({ ids: [] }), (err) => {
        if (err) {
          console.log('Error 6:', err);
        }
      });

      console.log('rollback completed.');
    });
  };
}

export default SheetData;
