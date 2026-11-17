#!/usr/bin/env node
/**
 * Validation script for CEFR JSON data in cefr/data/.
 *
 * Checks:
 * 1. Validates levels.json, scales.json, descriptors.json, themes.json, functions.json
 *    against JSON schemas in cefr/schemas/.
 * 2. Checks descriptor ID uniqueness and that every descriptor.scale exists in scales.json.
 * 3. Checks that every entry in scale.levels has a matching descriptor ID (<scale.id>-<levelCode>),
 *    and vice versa.
 * 4. Checks that every scale listed in cefr/data/toolkit.json oral_assessment_criteria and
 *    written_assessment_criteria exists in scales.json.
 * 5. Fails if any level value anywhere in cefr/data/*.json equals "A0" or "A0-A1".
 */

const fs = require('fs');
const path = require('path');
const Ajv2020 = require('ajv/dist/2020');

const ROOT_DIR = path.resolve(__dirname, '..');
const CEFR_DATA_DIR = path.join(ROOT_DIR, 'cefr', 'data');
const CEFR_SCHEMAS_DIR = path.join(ROOT_DIR, 'cefr', 'schemas');

const ajv = new Ajv2020({ allErrors: true });

let errors = [];

function logError(msg) {
  errors.push(msg);
  console.error(`ERROR: ${msg}`);
}

function loadJson(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    logError(`Failed to read/parse JSON at ${filePath}: ${err.message}`);
    return null;
  }
}

// 1. Schema Validations
const schemaFiles = [
  { dataFile: 'levels.json', schemaFile: 'levels.schema.json' },
  { dataFile: 'scales.json', schemaFile: 'scales.schema.json' },
  { dataFile: 'descriptors.json', schemaFile: 'descriptors.schema.json' },
  { dataFile: 'themes.json', schemaFile: 'themes.schema.json' },
  { dataFile: 'functions.json', schemaFile: 'functions.schema.json' }
];

const loadedData = {};

for (const { dataFile, schemaFile } of schemaFiles) {
  const dataPath = path.join(CEFR_DATA_DIR, dataFile);
  const schemaPath = path.join(CEFR_SCHEMAS_DIR, schemaFile);

  const data = loadJson(dataPath);
  const schema = loadJson(schemaPath);

  if (data !== null) {
    loadedData[dataFile] = data;
  }

  if (data !== null && schema !== null) {
    const validate = ajv.compile(schema);
    const valid = validate(data);
    if (!valid) {
      logError(`Schema validation failed for ${dataFile} against ${schemaFile}: ${ajv.errorsText(validate.errors)}`);
    }
  }
}

const levelsData = loadedData['levels.json'] || loadJson(path.join(CEFR_DATA_DIR, 'levels.json'));
const scalesData = loadedData['scales.json'] || loadJson(path.join(CEFR_DATA_DIR, 'scales.json'));
const descriptorsData = loadedData['descriptors.json'] || loadJson(path.join(CEFR_DATA_DIR, 'descriptors.json'));
const toolkitData = loadJson(path.join(CEFR_DATA_DIR, 'toolkit.json'));

// 2. Descriptor IDs uniqueness & scale existence
if (descriptorsData && scalesData) {
  const scaleIds = new Set(scalesData.map((s) => s.id));
  const seenDescriptorIds = new Set();

  for (const descriptor of descriptorsData) {
    if (seenDescriptorIds.has(descriptor.id)) {
      logError(`Duplicate descriptor id found: ${descriptor.id}`);
    } else {
      seenDescriptorIds.add(descriptor.id);
    }

    if (!scaleIds.has(descriptor.scale)) {
      logError(`Descriptor ${descriptor.id} references non-existent scale: ${descriptor.scale}`);
    }
  }

  // 3. Scale.levels matching descriptors and vice versa
  const descriptorIdSet = new Set(descriptorsData.map((d) => d.id));
  const expectedDescriptorIds = new Set();

  for (const scale of scalesData) {
    if (Array.isArray(scale.levels)) {
      for (const levelCode of scale.levels) {
        const expectedId = `${scale.id}-${levelCode}`;
        expectedDescriptorIds.add(expectedId);
        if (!descriptorIdSet.has(expectedId)) {
          logError(`Scale ${scale.id} expects descriptor ${expectedId} for level '${levelCode}', but it does not exist in descriptors.json`);
        }
      }
    }
  }

  for (const descId of descriptorIdSet) {
    if (!expectedDescriptorIds.has(descId)) {
      logError(`Descriptor ${descId} exists in descriptors.json but is not listed in any scale's levels array in scales.json`);
    }
  }
}

// 4. Toolkit assessment criteria scale existence
if (toolkitData && scalesData) {
  const scaleIds = new Set(scalesData.map((s) => s.id));

  const checkCriteria = (criteriaArray, criteriaName) => {
    if (!Array.isArray(criteriaArray)) return;
    for (const item of criteriaArray) {
      if (Array.isArray(item.scales)) {
        for (const sId of item.scales) {
          if (!scaleIds.has(sId)) {
            logError(`toolkit.json ${criteriaName} item '${item.criterion}' references non-existent scale: ${sId}`);
          }
        }
      }
    }
  };

  checkCriteria(toolkitData.oral_assessment_criteria, 'oral_assessment_criteria');
  checkCriteria(toolkitData.written_assessment_criteria, 'written_assessment_criteria');
}

// 5. Fail if any level value anywhere equals "A0" or "A0-A1"
const allDataFiles = fs.readdirSync(CEFR_DATA_DIR).filter((f) => f.endsWith('.json'));

function checkForForbiddenLevels(val, filePath, currentPath = '') {
  if (val === null || val === undefined) return;

  if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
    if (currentPath.endsWith('.level') || currentPath.split('.').pop() === 'level') {
      if (val === 'A0' || val === 'A0-A1') {
        logError(`Forbidden level value '${val}' found in ${path.relative(ROOT_DIR, filePath)} at ${currentPath}`);
      }
    } else if (val === 'A0' || val === 'A0-A1') {
      logError(`Forbidden value '${val}' found in ${path.relative(ROOT_DIR, filePath)} at ${currentPath}`);
    }
  } else if (Array.isArray(val)) {
    val.forEach((item, index) => {
      checkForForbiddenLevels(item, filePath, `${currentPath}[${index}]`);
    });
  } else if (typeof val === 'object') {
    for (const key of Object.keys(val)) {
      checkForForbiddenLevels(val[key], filePath, currentPath ? `${currentPath}.${key}` : key);
    }
  }
}

for (const dataFile of allDataFiles) {
  const filePath = path.join(CEFR_DATA_DIR, dataFile);
  const jsonContent = loadJson(filePath);
  if (jsonContent !== null) {
    checkForForbiddenLevels(jsonContent, filePath);
  }
}

// Summary & Exit
if (errors.length > 0) {
  console.error(`\nCEFR validation FAILED with ${errors.length} error(s).`);
  process.exit(1);
} else {
  console.log('CEFR validation passed successfully. All schemas and relational checks are valid.');
  process.exit(0);
}
