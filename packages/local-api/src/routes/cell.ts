import express, { Request, Response } from "express";
import fs from "fs";
import path from "path";
interface Cell {
  id: string;
  content: string;
  type: "text" | "code";
}
interface LocalApiError {
  code: string;
}
export const createCellRouter = (filename: string, dir: string) => {
  const router = express.Router();
  router.use(express.json());
  const fullPath = path.join(dir, filename);

  router.get("/cells", (req: Request, res: Response) => {
    const isLocalApiError = (err: any): err is LocalApiError => {
      return typeof err.code === "string";
    };

    try {
      //Read the file
      const result = fs.readFileSync(fullPath, { encoding: "utf-8" });
      res.send(JSON.parse(result));
    } catch (error) {
      //Inspect the error, if the error says that the file doesnt exist
      //Add code to create a file and add default cells
      if (isLocalApiError(error)) {
        if (error.code === "ENOENT") {
          //we create a file and add default cells
          fs.writeFileSync(fullPath, "[]", "utf-8");
          res.send([]);
        }
      } else {
        throw error;
      }
    }

    //Parse a list of cells out of it
    //Send list of cells back to browser

    // res.send({ hi: "there" });
  });
  router.post("/cells", (req, res) => {
    //Take the list of cells from the request object
    //Serialize them
    const { cells }: { cells: Cell[] } = req.body;

    //Write the cells into the file
    try {
      fs.writeFileSync(fullPath, JSON.stringify(cells), "utf-8");
      res.send({ status: "ok" });
      console.log("Saved successfully");
    } catch (error) {
      if (error instanceof Error)
        res.status(500).send({ error: error.message });
      throw error;
    }
  });

  return router;
};
