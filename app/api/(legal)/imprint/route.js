import fs from "fs";
import path from "path";

export async function GET() {
  const filePath = path.join(process.cwd(), 'imprint.html');

  try {
    let htmlContent = fs.readFileSync(filePath, "utf8");
    htmlContent = htmlContent.replaceAll(new RegExp("<!--(.|s)*?-->", "g"), ""); // see https://regexr.com/ to explore what this regex does; it hides comments from being exposed
    return new Response(JSON.stringify({ content: htmlContent }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch {
    return new Response(
      JSON.stringify({ error: "Fehler beim Laden des Impressums" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
