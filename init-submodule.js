const { execSync } = require("child_process");
const { readFileSync } = require("fs");
const { join } = require("path");

const { GITHUB_ACCESS_TOKEN } = process.env;

const gitmodules = readFileSync(join(__dirname, ".gitmodules"), "utf8");

const SUBMODULE_PATH = "app-common";
const SUBMODULE_GITHUB = "github.com/ribeirolabs/app-common";

if (!GITHUB_ACCESS_TOKEN) {
  throw new Error("Error: GITHUB_ACCESS_TOKEN is empty");
}

const output = execSync(`
  set -e
  git submodule status --recursive
`).toString();

const COMMIT = output.slice(1).replace(/\s+.+\n$/g, ""); //get rid of the suffix

execSync(`
  set -e
  rm -rf tmp || true
  mkdir tmp
  cd tmp
  git init
  git remote add origin https://${GITHUB_ACCESS_TOKEN}@${SUBMODULE_GITHUB}
  git fetch --depth=1 origin ${COMMIT}
  git checkout ${COMMIT}
  cd ..
  rm -rf tmp/.git
  mv tmp/* ${SUBMODULE_PATH}/
  rm -rf tmp
`);
