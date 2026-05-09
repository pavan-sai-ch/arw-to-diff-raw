import { execSync } from "child_process";
import { NextResponse } from "next/server";

const DNG_CONVERTER_PATH =
  "/Applications/Adobe DNG Converter.app/Contents/MacOS/Adobe DNG Converter";

function commandExists(cmd: string): boolean {
  try {
    execSync(`which ${cmd}`, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function dngConverterExists(): boolean {
  try {
    const { existsSync } = require("fs");
    return existsSync(DNG_CONVERTER_PATH);
  } catch {
    return false;
  }
}

export async function GET() {
  const hasDngConverter = dngConverterExists();
  const hasDcraw = commandExists("dcraw");

  if (hasDngConverter) {
    return NextResponse.json({
      tool: "dng-converter",
      label: "Adobe DNG Converter",
      outputFormat: "dng",
      status: "ready",
    });
  }

  if (hasDcraw) {
    return NextResponse.json({
      tool: "dcraw",
      label: "dcraw",
      outputFormat: "tiff",
      status: "ready",
    });
  }

  return NextResponse.json({
    tool: null,
    label: null,
    outputFormat: null,
    status: "missing",
  });
}
