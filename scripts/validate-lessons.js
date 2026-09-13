const fs = require("fs");
const path = require("path");
const Ajv = require("ajv");
const draft07 = require("ajv/dist/refs/json-schema-draft-07.json");

const ajv = new Ajv({ allErrors: true });

const schema = JSON.parse(fs.readFileSync("schemas/lesson.schema.json", "utf8"));
const validate = ajv.compile(schema);

function getJsonFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getJsonFiles(filePath));
    } else if (file.endsWith(".json") && !file.startsWith("_")) {
      results.push(filePath);
    }
  });
  return results;
}

const files = getJsonFiles("lessons");
console.log(`Validating ${files.length} json files in lessons/...`);
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
  console.error(`Lesson validation failed for ${failed} file(s).`);
  process.exit(1);
} else {
  console.log(`Successfully validated ${files.length} lesson files.`);
}
