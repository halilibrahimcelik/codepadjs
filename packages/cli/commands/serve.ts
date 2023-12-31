import path from "path";
import { Command } from "commander";
import { serveLocalAPI } from "@codepadjs/local-api";

const isProduction = process.env.NODE_ENV === "production";

export const serveCommand = new Command()
  .command("serve [filename]")
  .description("Open a file for editing")
  .option("-p, --port <number>", "port to run server on", "4005")
  .action(async (filename = "codepad.js", options: { port: string }) => {
    try {
      const directory = path.join(process.cwd(), path.dirname(filename));
      await serveLocalAPI(
        parseInt(options.port),
        path.basename(filename),
        directory,
        !isProduction
      );
      console.log(`
    🎉 🎉 🎉 🎉 🎉 🎉 🎉 🎉 🎉 🎉 🎉 🎉 🎉 

    Congratilations! You have successfully opened the file for editing.
     
    In order to  opened ${filename}  please navigate to below link  to edit the file ⬇ ⬇ ⬇ 
      `);
      console.log(
        "\x1b[1m\x1b[34m%s\x1b[0m",
        `
    http://localhost:${options.port}

        `
      );
    } catch (error: any) {
      if (error?.code === "EADDRINUSE") {
        console.error("Port is in use. Try running on a different port. ");
      } else {
        console.log("Heres the problem =>", error?.message);
      }
      process.exit(1); //force exit
    }
  });
