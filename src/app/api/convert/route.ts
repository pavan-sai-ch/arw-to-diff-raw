import { execSync } from "child_process";
import { existsSync, readFileSync, unlinkSync, readdirSync } from "fs";
import { writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join, basename, extname } from "path";
import { NextRequest, NextResponse } from "next/server";
import archiver from "archiver";
import { Readable } from "stream";

const DNG_CONVERTER_PATH =
  "/Applications/Adobe DNG Converter.app/Contents/MacOS/Adobe DNG Converter";

function getAvailableTool(): "dng-converter" | "dcraw" | null {
  if (existsSync(DNG_CONVERTER_PATH)) return "dng-converter";
  try {
    execSync("which dcraw", { stdio: "ignore" });
    return "dcraw";
  } catch {
    return null;
  }
}

function convertFile(
  inputPath: string,
  tool: "dng-converter" | "dcraw"
): { outputPath: string; ext: string } {
  const dir = tmpdir();
  const name = basename(inputPath, extname(inputPath));

  if (tool === "dng-converter") {
    execSync(
      `"${DNG_CONVERTER_PATH}" -c "${inputPath}" -d "${dir}"`,
      { stdio: "pipe", timeout: 120_000 }
    );
    const outputPath = join(dir, `${name}.dng`);
    return { outputPath, ext: "dng" };
  } else {
    // dcraw: -T = TIFF, -4 = 16-bit linear, -6 = 16-bit, -w = camera white balance
    execSync(`dcraw -T -4 -6 -w "${inputPath}"`, {
      stdio: "pipe",
      timeout: 120_000,
      cwd: dir,
    });
    const outputPath = join(dir, `${name}.tiff`);
    return { outputPath, ext: "tiff" };
  }
}

export async function POST(req: NextRequest) {
  const tool = getAvailableTool();

  if (!tool) {
    return NextResponse.json(
      { error: "No conversion tool found. Install Adobe DNG Converter or dcraw." },
      { status: 500 }
    );
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const files = formData.getAll("files") as File[];
  if (!files.length) {
    return NextResponse.json({ error: "No files provided" }, { status: 400 });
  }

  const inputPaths: string[] = [];
  const outputPaths: { path: string; name: string; ext: string }[] = [];
  const errors: { name: string; message: string }[] = [];

  try {
    // Write uploads to temp dir
    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const inputPath = join(tmpdir(), `arw_in_${Date.now()}_${file.name}`);
      await writeFile(inputPath, Buffer.from(bytes));
      inputPaths.push(inputPath);
    }

    // Convert each file
    for (let i = 0; i < inputPaths.length; i++) {
      const file = files[i];
      try {
        const { outputPath, ext } = convertFile(inputPaths[i], tool);
        const outName = basename(file.name, extname(file.name)) + "." + ext;
        outputPaths.push({ path: outputPath, name: outName, ext });
      } catch (err) {
        errors.push({
          name: file.name,
          message: err instanceof Error ? err.message : String(err),
        });
      }
    }

    if (!outputPaths.length) {
      return NextResponse.json(
        { error: "All conversions failed", details: errors },
        { status: 500 }
      );
    }

    // Single file → stream directly
    if (outputPaths.length === 1) {
      const { path, name } = outputPaths[0];
      const data = readFileSync(path);
      const mimeType =
        outputPaths[0].ext === "dng" ? "image/x-adobe-dng" : "image/tiff";

      return new NextResponse(data, {
        headers: {
          "Content-Type": mimeType,
          "Content-Disposition": `attachment; filename="${name}"`,
          "Content-Length": String(data.byteLength),
        },
      });
    }

    // Multiple files → ZIP
    const archive = archiver("zip", { zlib: { level: 0 } }); // level 0 = store only, no compression
    for (const { path, name } of outputPaths) {
      archive.file(path, { name });
    }
    archive.finalize();

    const chunks: Buffer[] = [];
    for await (const chunk of archive) {
      chunks.push(chunk as Buffer);
    }
    const zipBuffer = Buffer.concat(chunks);

    return new NextResponse(zipBuffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="converted.zip"`,
        "Content-Length": String(zipBuffer.byteLength),
      },
    });
  } finally {
    // Cleanup temp files
    for (const p of [...inputPaths, ...outputPaths.map((o) => o.path)]) {
      try {
        if (existsSync(p)) unlinkSync(p);
      } catch {}
    }
  }
}
