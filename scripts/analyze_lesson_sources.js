/**
 * Diagnostic Script: Analyze Location of 601 lessonFile References
 *
 * Scans all roadmaps/*.json files for lessonFile paths and checks whether they exist:
 * 1. In current filesystem
 * 2. In git history
 * 3. On git branches
 * 4. Nowhere (unwritten / external content)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROADMAPS_DIR = path.join(__dirname, '../roadmaps');

function analyzeLessonSources() {
  const files = fs.readdirSync(ROADMAPS_DIR).filter(f => f.endsWith('.json'));

  const courseStats = {};
  let totalRefs = 0;
  let existFsCount = 0;
  let existGitHistoryCount = 0;
  let existBranchCount = 0;
  let existNowhereCount = 0;

  let branches = [];
  try {
    const bOut = execSync('git branch -a', { encoding: 'utf8' });
    branches = bOut.split('\n').map(b => b.replace(/^[\*\s]+/, '').trim()).filter(Boolean);
  } catch (e) {}

  files.forEach(f => {
    const roadmapPath = path.join(ROADMAPS_DIR, f);
    const data = JSON.parse(fs.readFileSync(roadmapPath, 'utf8'));
    const seq = data.sequence || [];

    const courseRefs = [];
    seq.forEach(item => {
      if (item.lessonFile) {
        courseRefs.push(item.lessonFile);
      }
    });

    if (courseRefs.length > 0) {
      totalRefs += courseRefs.length;
      let fsFound = 0;
      let historyFound = 0;
      let branchFound = 0;
      let nowhereFound = 0;

      courseRefs.forEach(lf => {
        if (fs.existsSync(lf) || fs.existsSync(path.join(__dirname, '..', lf))) {
          fsFound++;
          existFsCount++;
          return;
        }

        try {
          const histOut = execSync(`git log --all --oneline -- "${lf}"`, { encoding: 'utf8' });
          if (histOut && histOut.trim().length > 0) {
            historyFound++;
            existGitHistoryCount++;
            return;
          }
        } catch (e) {}

        let foundOnBranch = false;
        for (const branch of branches) {
          try {
            execSync(`git cat-file -e "${branch}:${lf}"`, { stdio: 'ignore' });
            foundOnBranch = true;
            break;
          } catch (e) {}
        }

        if (foundOnBranch) {
          branchFound++;
          existBranchCount++;
        } else {
          nowhereFound++;
          existNowhereCount++;
        }
      });

      courseStats[f] = {
        totalRefs: courseRefs.length,
        inFs: fsFound,
        inGitHistory: historyFound,
        inBranches: branchFound,
        nowhere: nowhereFound
      };
    }
  });

  console.log('=== LESSON FILE LOCATION REPORT ===');
  console.log(`Total lessonFile references across all roadmaps: ${totalRefs}`);
  console.log(`- Existing in current working tree: ${existFsCount}`);
  console.log(`- Existing in git commit history: ${existGitHistoryCount}`);
  console.log(`- Existing on unmerged git branches: ${existBranchCount}`);
  console.log(`- Existing nowhere (planned / unwritten assets): ${existNowhereCount}`);

  console.log('\n=== COUNTS PER COURSE ===');
  console.table(courseStats);
}

if (require.main === module) {
  analyzeLessonSources();
}

module.exports = { analyzeLessonSources };
