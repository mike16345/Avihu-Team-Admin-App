import { ChildProcess, execFile } from "child_process";
import Logger from "electron-log";
import os from "os";

const processes: ChildProcess[] = [];

function getScriptPath(
  scriptName: "processOne" | "processTwo"
): string {
  const scriptPath =
    os.platform() === "win32"
      ? `${process.cwd()}/resources`
      : `${process.platform}-unpacked/resources`;

  return scriptPath;
}

export const initBackgroundProcesses = () => {
  Logger.info("Initializing background processes");
  ["processOne", "processTwo"].forEach((fileName) => {
    try {
      const childProcess = execFile(
        "python3",
        [getScriptPath(fileName as "processOne" | "processTwo")],
        (error, stdout, stderr) => {
          if (error) {
            Logger.error("Error executing the script:", error);
          }
          Logger.info("Standard Output:", stdout);
          Logger.error("Standard Error:", stderr);
        }
      );
      processes.push(childProcess);
    } catch (error) {
      Logger.error(error)
    }
  });
};

export const killBackgroundProcesses = () => {
  Logger.info("Killing background processes");
  while (processes.length != 0) {
    try {
      processes.forEach((proc, index) => {
        proc.kill();
        processes.splice(index, 1);
      });
    } catch (e) {
      Logger.error("Error killing process:", e);
    }
  }
};
