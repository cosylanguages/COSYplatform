const fs = require("fs");
const path = require("path");
const Ajv = require("ajv");

const ajv = new Ajv({ allErrors: true });
const schema = JSON.parse(fs.readFileSync("curriculums/_schema/curriculum.schema.json", "utf8"));
const validate = ajv.compile(schema);

function getJsonFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory() && file !== "_schema" && file !== "_archive") {
      results = results.concat(getJsonFiles(filePath));
    } else if (file.endsWith(".json") && !file.startsWith("_") && dir !== "curriculums") {
      results.push(filePath);
    }
  });
  return results;
}

const files = getJsonFiles("curriculums");
console.log(`Validating ${files.length} json files in curriculums/...`);
let failed = 0;

files.forEach(file => {
  try {
    const content = JSON.parse(fs.readFileSync(file, "utf8"));
    const valid = validate(content);
    if (!valid) {
      console.error(`Validation error in ${file}:`, validate.errors);
      failed++;
    }
  } catch (err) {
    console.error(`Failed to parse or validate ${file}:`, err.message);
    failed++;
  }
});

if (failed > 0) {
  console.error(`Validation failed for ${failed} file(s).`);
  process.exit(1);
} else {
  console.log(`Successfully validated ${files.length} curriculum files.`);
}
