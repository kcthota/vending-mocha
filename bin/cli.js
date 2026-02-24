#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import inquirer from 'inquirer';
import chalk from 'chalk';
import figlet from 'figlet';
import { Command } from 'commander';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));

const IGNORE_FILES = [
    'node_modules',
    '.git',
    '.github',
    'dist',
    'docs',
    'bin',
    'package-lock.json',
    '.DS_Store',
    'LICENSE'
];

function getAsciiArt() {
    const cup = `
  ( (
   ) )
.______.
|      |]
\\      /
 \`----'
    `;

    // 1. Generate Plain Text
    const vending = figlet.textSync('Vending', { horizontalLayout: 'full' });
    const mocha = figlet.textSync('Mocha', { horizontalLayout: 'full' });

    // 2. Prepare Lines
    const vendingLines = vending.split('\n');
    const mochaLines = mocha.split('\n');
    const cupLines = cup.split('\n').filter(line => line.trim().length > 0);

    // 3. Calculate Layout Dimensions
    const mochaWidth = Math.max(...mochaLines.map(line => line.length));

    // Combine Mocha + Cup logic to find total max width
    // We need to see how wide the bottom section (Mocha + Cup) is vs the top section (Vending)

    // Bottom Section Width
    let maxBottomWidth = 0;
    const bottomHeight = Math.max(mochaLines.length, cupLines.length);
    for (let i = 0; i < bottomHeight; i++) {
        const mLen = (mochaLines[i] || '').length;
        const cLen = (cupLines[i] || '').length;
        // Mocha + 3 spaces + Cup
        const lineLen = Math.max(mLen, mochaWidth) + 3 + cLen;
        if (lineLen > maxBottomWidth) maxBottomWidth = lineLen;
    }

    // Top Section Width
    const maxTopWidth = Math.max(...vendingLines.map(line => line.length));

    // Overall Max Width
    const contentWidth = Math.max(maxTopWidth, maxBottomWidth);

    // 4. Construct Art with Border
    const lines = [];

    // Top Border
    // Width = contentWidth + 2 spaces padding on each side = contentWidth + 4 ?
    // Let's stick to the design: │  Content  │ (2 spaces padding)
    // So inner width = contentWidth + 4.
    // Border line length = contentWidth + 4.

    const borderLine = '─'.repeat(contentWidth + 4);
    lines.push(chalk.cyan('╭' + borderLine + '╮'));

    // Helper to push a bordered line
    const pushLine = (str, strLength) => {
        const padding = ' '.repeat(contentWidth - strLength);
        // We manually construct the line: │  <str> <padding>  │
        // But <str> might contain ANSI codes, so we need to be careful not to count them in length, 
        // which is why we pass strLength explicitly.
        lines.push(chalk.cyan('│  ') + str + padding + chalk.cyan('  │'));
    };

    // Render Vending (Top)
    for (const line of vendingLines) {
        pushLine(chalk.cyan(line), line.length);
    }

    // Gap? The user art in previous turn didn't have a gap, but it looks better with one maybe? 
    // The previous output didn't have a huge gap. Let's not add extra vertical gap to keep it compact unless needed.
    // Actually, let's add one empty line for separation if it looks cramped. 
    // Figlet art usually has some whitespace. Let's mimic the test_border.js which didn't verify vertical spacing explicitly but looked okay.
    // I'll skip explicit vertical gap to match previous compactness, unless I see reason to add it.

    // Render Mocha + Cup (Bottom)
    for (let i = 0; i < bottomHeight; i++) {
        const mLine = mochaLines[i] || '';
        const cLine = cupLines[i] || '';

        // Pad mocha part to mochaWidth
        const mPad = ' '.repeat(mochaWidth - mLine.length);

        const combinedStr = chalk.cyan(mLine) + mPad + '   ' + chalk.yellow(cLine);
        const combinedLen = mochaWidth + 3 + cLine.length;

        pushLine(combinedStr, combinedLen);
    }

    // Bottom Border
    lines.push(chalk.cyan('╰' + borderLine + '╯'));
    lines.push(''); // Final newline

    return lines.join('\n');
}

function copyRecursiveSync(src, dest, destRoot) {
    const exists = fs.existsSync(src);
    const stats = exists && fs.statSync(src);
    const isDirectory = exists && stats.isDirectory();
    const basename = path.basename(src);

    if (IGNORE_FILES.includes(basename)) {
        return;
    }

    // Prevent infinite recursion if destination is inside source
    if (destRoot && path.resolve(src) === path.resolve(destRoot)) {
        return;
    }

    if (isDirectory) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest);
        }

        fs.readdirSync(src).forEach((childItemName) => {
            copyRecursiveSync(
                path.join(src, childItemName),
                path.join(dest, childItemName),
                destRoot
            );
        });
    } else {
        fs.copyFileSync(src, dest);
    }
}

function updatePackageJson(projectDir, config) {
    const pkgPath = path.join(projectDir, 'package.json');
    if (fs.existsSync(pkgPath)) {
        try {
            const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
            pkg.name = config.projectName;
            pkg.version = '0.0.0';
            pkg.description = config.description || `My new blog built with vending-mocha`;
            pkg.license = 'Unknown';

            // Remove the bin entry so the new project doesn't try to be a CLI itself
            if (pkg.bin) {
                delete pkg.bin;
            }

            // Remove CLI-specific dependencies from the new project
            if (pkg.dependencies) {
                delete pkg.dependencies['figlet'];
                delete pkg.dependencies['inquirer'];
                delete pkg.dependencies['chalk'];
                delete pkg.dependencies['commander'];
            }

            fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
        } catch (e) {
            console.warn(chalk.yellow('Failed to update package.json:', e.message));
        }
    }
}

async function handleNew(projectName, options) {
    console.clear();
    console.log(getAsciiArt());

    // Interactive Prompts
    const questions = [];

    if (!projectName) {
        questions.push({
            type: 'input',
            name: 'projectName',
            message: 'What is the name of your new project?',
            default: 'my-vending-mocha-blog',
            validate: (input) => {
                if (/^([a-z0-9\-\_\.]+)$/.test(input)) return true;
                return 'Project name may only include letters, numbers, underscores and hashes.';
            }
        });
    }

    const answers = await inquirer.prompt(questions);

    // Merge args and answers
    const config = {
        projectName: projectName || answers.projectName,
    };

    const currentDir = process.cwd();
    const projectDir = path.join(currentDir, config.projectName);
    const templateDir = path.join(__dirname, '..');

    if (fs.existsSync(projectDir)) {
        console.error(chalk.red(`Directory ${config.projectName} already exists.`));
        process.exit(1);
    }

    console.log(chalk.blue(`\nCreating new project in ${projectDir}...\n`));

    try {
        // 1. Copy files
        const spinner = { start: () => console.log(chalk.gray('Copying template files...')), succeed: () => console.log(chalk.green('✔ Files copied')) }; // Simple mock spinner
        spinner.start();
        copyRecursiveSync(templateDir, projectDir, projectDir);
        spinner.succeed();

        // 2. Update config
        console.log(chalk.gray('Updating configuration...'));
        updatePackageJson(projectDir, config);
        console.log(chalk.green('✔ package.json updated'));

        // 3. Create .gitignore (since npm pack ignores it)
        const gitignorePath = path.join(projectDir, '.gitignore');
        if (!fs.existsSync(gitignorePath)) {
            const gitignoreContent = `# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
docs
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
`;
            fs.writeFileSync(gitignorePath, gitignoreContent);
            console.log(chalk.green('✔ .gitignore created'));
        }

        console.log(chalk.green(`\nSuccess! Created ${config.projectName} at ${projectDir}`));
        console.log('\nInside that directory, you can run:');
        console.log(chalk.cyan(`  cd ${config.projectName}`));
        console.log(chalk.cyan('  npm install'));
        console.log(chalk.cyan('  npm run dev'));
        console.log('\nHappy blogging!');

    } catch (error) {
        console.error(chalk.red('Failed to create project:', error));
        process.exit(1);
    }
}

async function handleUpgrade() {
    console.clear();
    console.log(getAsciiArt());

    const currentDir = process.cwd();
    const templateDir = path.join(__dirname, '..');

    // 1. Verify it is a vending-mocha project
    const siteConfigPath = path.join(currentDir, 'src', 'site.config.ts');
    const localPkgPath = path.join(currentDir, 'package.json');

    if (!fs.existsSync(siteConfigPath) || !fs.existsSync(localPkgPath)) {
        console.error(chalk.red('Error: Current directory does not appear to be a vending-mocha project.'));
        console.error(chalk.yellow('Ensure you are in the root of your project (containing package.json and src/site.config.ts).'));
        process.exit(1);
    }

    console.log(chalk.yellow('WARNING: This will overwrite project files to the latest version of vending-mocha.'));
    console.log(chalk.yellow('Your content (posts/, projects/, life/) and configuration (src/site.config.ts) will be preserved.'));
    console.log(chalk.yellow('Please ensure you have committed your changes before proceeding.'));

    const { proceed } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'proceed',
            message: 'Are you sure you want to upgrade?',
            default: false
        }
    ]);

    if (!proceed) {
        console.log(chalk.blue('Upgrade cancelled.'));
        process.exit(0);
    }

    console.log(chalk.blue('\nUpgrading project...\n'));

    try {
        // 2. Copy files with exclusions
        const upgradeIgnore = [
            ...IGNORE_FILES,
            'posts',
            'projects',
            'src/site.config.ts', // Important: Preserve config
            'package.json'        // We handle this separately
        ];

        function copyUpgradeSync(src, dest) {
            const basename = path.basename(src);
            const relPath = path.relative(templateDir, src);

            if (upgradeIgnore.includes(basename) || upgradeIgnore.includes(relPath)) {
                return;
            }

            // Also ignore if it is exactly the file we want to skip (normalized)
            if (relPath === 'src/site.config.ts') return;

            // Prevent infinite recursion: if src is the current directory (destination), skip it
            if (path.resolve(src) === path.resolve(currentDir)) {
                return;
            }

            const exists = fs.existsSync(src);
            const stats = exists && fs.statSync(src);
            const isDirectory = exists && stats.isDirectory();

            if (isDirectory) {
                if (!fs.existsSync(dest)) {
                    fs.mkdirSync(dest);
                }
                fs.readdirSync(src).forEach((child) => {
                    copyUpgradeSync(path.join(src, child), path.join(dest, child));
                });
            } else {
                fs.copyFileSync(src, dest);
            }
        }

        const spinner = { start: () => console.log(chalk.gray('Updating core files...')), succeed: () => console.log(chalk.green('✔ Core files updated')) };
        spinner.start();
        copyUpgradeSync(templateDir, currentDir);
        spinner.succeed();

        // 2.5 Merge site.config.ts
        try {
            const userConfigPath = path.join(currentDir, 'src', 'site.config.ts');
            const templateConfigPath = path.join(templateDir, 'src', 'site.config.ts');

            if (fs.existsSync(userConfigPath) && fs.existsSync(templateConfigPath)) {
                console.log(chalk.gray('Merging src/site.config.ts...'));
                const templateConfigRaw = fs.readFileSync(templateConfigPath, 'utf8');
                const tplMatch = templateConfigRaw.match(/([\s\S]*?)(export\s+const\s+siteConfig\s*=\s*)(\{[\s\S]*\});?\s*$/);

                const userConfigRaw = fs.readFileSync(userConfigPath, 'utf8');
                const userMatch = userConfigRaw.match(/([\s\S]*?)(export\s+const\s+siteConfig\s*=\s*)(\{[\s\S]*\});?\s*$/);

                if (tplMatch && userMatch) {
                    const templateConfig = eval('(' + tplMatch[3] + ')');
                    const userPrefix = userMatch[1] + userMatch[2];
                    const userConfig = eval('(' + userMatch[3] + ')');

                    function mergeConfigs(target, source) {
                        for (const key in source) {
                            if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                                if (!target[key] || typeof target[key] !== 'object') {
                                    target[key] = {};
                                }
                                mergeConfigs(target[key], source[key]);
                            } else if (target[key] === undefined) {
                                target[key] = source[key];
                            }
                        }
                        return target;
                    }

                    const mergedConfig = mergeConfigs(userConfig, templateConfig);

                    function stringifyConfig(obj, indent = 0) {
                        if (obj === undefined) return 'undefined';
                        if (obj === null) return 'null';
                        if (typeof obj === 'string') return JSON.stringify(obj);
                        if (typeof obj === 'number' || typeof obj === 'boolean') return String(obj);
                        if (Array.isArray(obj)) {
                            if (obj.length === 0) return '[]';
                            const items = obj.map(item => ' '.repeat(indent + 4) + stringifyConfig(item, indent + 4));
                            return `[\n${items.join(',\n')}\n${' '.repeat(indent)}]`;
                        }
                        if (typeof obj === 'object') {
                            const entries = Object.entries(obj);
                            if (entries.length === 0) return '{}';
                            const lines = entries.map(([key, value]) => {
                                const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : JSON.stringify(key);
                                return `${' '.repeat(indent + 4)}${safeKey}: ${stringifyConfig(value, indent + 4)}`;
                            });
                            return `{\n${lines.join(',\n')}\n${' '.repeat(indent)}}`;
                        }
                        return String(obj);
                    }

                    const outputStr = userPrefix + stringifyConfig(mergedConfig, 0) + ';\n';
                    fs.writeFileSync(userConfigPath, outputStr);
                    console.log(chalk.green('✔ src/site.config.ts merged'));
                }
            }
        } catch (e) {
            console.warn(chalk.yellow('Failed to merge src/site.config.ts: ' + e.message));
        }

        // 3. Merge package.json
        console.log(chalk.gray('Merging package.json...'));
        const localPkg = JSON.parse(fs.readFileSync(localPkgPath, 'utf8'));
        const templatePkg = JSON.parse(fs.readFileSync(path.join(templateDir, 'package.json'), 'utf8'));

        // Update scripts
        localPkg.scripts = { ...localPkg.scripts, ...templatePkg.scripts };

        // Update dependencies (add new ones, update versions)
        localPkg.dependencies = { ...localPkg.dependencies, ...templatePkg.dependencies };
        localPkg.devDependencies = { ...localPkg.devDependencies, ...templatePkg.devDependencies };

        // Ensure we remove CLI deps if they somehow crept in or strictly enforce clean deps
        if (localPkg.dependencies) {
            delete localPkg.dependencies['figlet'];
            delete localPkg.dependencies['inquirer'];
            delete localPkg.dependencies['chalk'];
            delete localPkg.dependencies['commander'];
        }

        fs.writeFileSync(localPkgPath, JSON.stringify(localPkg, null, 2));
        console.log(chalk.green('✔ package.json merged'));

        console.log(chalk.green('\nUpgrade complete!'));
        console.log(chalk.cyan('You may need to run `npm install` to update dependencies.'));

    } catch (error) {
        console.error(chalk.red('Failed to upgrade project:', error));
        process.exit(1);
    }
}

const program = new Command();

program
    .name('vending-mocha')
    .description('A personal blogging framework for developers')
    .version(pkg.version)
    .addHelpText('before', getAsciiArt());

program.command('new')
    .description('Create a new Vending Mocha project')
    .argument('[project-name]', 'Name of the project directory')
    .action(handleNew);

program.command('upgrade')
    .description('Upgrade an existing Vending Mocha project')
    .action(handleUpgrade);

program.parse(process.argv);

if (!process.argv.slice(2).length) {
    program.outputHelp();
}
