import { connect } from 'mongoose';
import { config } from 'dotenv';
import SheetData from './controllers/SheetData';

const bootstrap = async () => {
  config();

  const stdin = process.openStdin();

  try {
    await connect(process.env.DB_CONNECTION_STRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const promptOptions = () => {
      console.log('1. sync\n2. send mail\n3. status\n4. rollback');
    };

    let send = false;
    promptOptions();
    stdin.addListener('data', async (d) => {
      if (send) {
        await SheetData.sendMail(Number(d.toString().trim()));
        send = false;
        d = -1;
      }
      switch (Number(d.toString().trim())) {
        case 1:
          await SheetData.get();
          break;
        case 2:
          console.log('\n Number of Mail: ');
          send = true;
          break;
        case 3:
          await SheetData.status();
          break;
        case 4:
          await SheetData.rollback();
        default:
          break;
      }
      if (!send) promptOptions();
    });

    // console.log('Process Started.');

    // await SheetData.get();
    // await SheetData.sendMail(5);
    // await SheetData.status();
    // await SheetData.rollback();
  } catch (err) {
    console.log(err);
  }
};

bootstrap();
