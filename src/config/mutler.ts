import csv from "csv-parser";
import multer from "multer";
import fs from "fs";

export const readFile = (fileName: string) =>
  new Promise<any[]>((resolve, reject) => {
    const stream: any = [];

    fs.createReadStream(fileName)
      .pipe(csv())
      .on("data", (data) => {
        // const {  ...rest } = data;
      
        stream.push(data);
      })
      .on("end", () => {
        resolve(stream); 
      });
  });
 