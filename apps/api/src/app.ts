import express, {
  json,
  urlencoded,
  Express,
  Request,
  Response,
  NextFunction,
} from 'express';
import cors from 'cors';
import { PORT } from './config';
import { AuthRouter } from './routers/auth.router';
import { redisClient } from './helpers/redis';
// import { SampleRouter } from './routers/sample.router';

export default class App {
  readonly app: Express;

  constructor() {
    this.app = express();
    this.configure();
    this.routes();
    this.handleError();
  }

  private configure(): void {
    this.app.use(cors());
    this.app.use(json());
    this.app.use(urlencoded({ extended: true }));
  }

  private routes(): void {
    // const sampleRouter = new SampleRouter();

    // this.app.get('/', (req: Request, res: Response) => {
    //   res.send(`Hello, Purwadhika Student !`);
    // });

    // this.app.use('/samples', sampleRouter.getRouter());

    const authRouter = new AuthRouter();

    this.app.use("/auth", authRouter.getRouter());
  }

  private handleError(): void {
    // not found
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      if (req.path.includes('/api/')) {
        res.status(404).send('Not found !');
      } else {
        next();
      }
    });

    // error
    this.app.use(
      (err: Error, req: Request, res: Response, next: NextFunction) => {
        if (req.path.includes('/api/')) {
          console.error('Error : ', err.stack);
          res.status(500).send('Error !');
        } else {
          next();
        }
      },
    );
  }

//   private handleError(): void {
//     this.app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
//         console.log("ERROR : ", err);
//         return res.status(500).send(err);            
//     })
// }


  public async start(): Promise<void> {
    await redisClient.connect();
    this.app.listen(PORT, () => {
      console.log(`  ➜  [API] Local:   http://localhost:${PORT}/`);
    });
  }
}
