import * as path from "https://deno.land/std@0.57.0/path/mod.ts";
import { Command } from "https://deno.land/x/cliffy@v0.25.4/command/mod.ts";
import yaml from "https://esm.sh/yaml@2.1.3";

type Package = { matches: Array<{ trigger: string; replace: string }> };

await new Command()
  .name("generate-readme")
  .description("Generate README.md for the quotes espanso package.")
  .version("v0.1.0")
  .option("--template <template_path>", "The README.md template file to use.", {
    default: "./README-template.md",
  })
  .arguments("<folder:string>")
  .action(async ({ template }, folder) => {
    const data = await Deno.readTextFile(path.join(folder, "package.yml"));
    const parsedData = yaml.parse(data) as Package;
    const comments = [...(data.matchAll(/^\s*#\s*(.+)$/gm) ?? [])].map((
      [_match, group],
    ) => group);
    let result = "";

    for (let i = 0; i < comments.length; i++) {
      const comment = comments[i];
      const { trigger, replace } = parsedData.matches[i];
      result += `| ${trigger} | ${replace} | ${comment}\n`;
    }

    const templateText = await Deno.readTextFile(template);
    const readmePath = path.join(folder, "README.md");
    await Deno.writeTextFile(
      path.join(folder, "README.md"),
      templateText.replace("%usage%", result),
    );
    console.log(`Wrote ${readmePath}.`);
  })
  .parse(Deno.args);
