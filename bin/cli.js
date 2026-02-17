#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import inquirer from 'inquirer';
import chalk from 'chalk';
import figlet from 'figlet';
import { Command } from 'commander';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IGNORE_FILES = [
    'node_modules',
    '.git',
    '.github',
    'dist',
    'docs',
    'bin',
    'package-lock.json',
    '.DS_Store'
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

    const art = [
        chalk.yellow(cup),
        chalk.cyan(figlet.textSync('Vending', { horizontalLayout: 'full' })),
        chalk.cyan(figlet.textSync('Mocha', { horizontalLayout: 'full' })),
        '\n'
    ].join('\n');

    return art;
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

function updateSiteConfig(projectDir, config) {
    const configPath = path.join(projectDir, 'src', 'site.config.ts');
    if (fs.existsSync(configPath)) {
        let content = fs.readFileSync(configPath, 'utf8');

        // Update title
        if (config.title) {
            content = content.replace(/title:\s*".*?"/, `title: "${config.title}"`);
        }

        // Update URL
        if (config.url) {
            content = content.replace(/url:\s*".*?"/, `url: "${config.url}"`);
        }

        fs.writeFileSync(configPath, content, 'utf8');
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

    questions.push({
        type: 'input',
        name: 'title',
        message: 'What is the title of your blog?',
        default: (answers) => answers.projectName || projectName
    });

    questions.push({
        type: 'input',
        name: 'url',
        message: 'What is the production URL of your blog?',
        default: (answers) => `https://example.com/${answers.projectName || projectName}`
    });

    questions.push({
        type: 'input',
        name: 'description',
        message: 'Write a short description for your blog:',
        default: 'A personal blogging framework for developers.'
    });

    const answers = await inquirer.prompt(questions);

    // Merge args and answers
    const config = {
        projectName: projectName || answers.projectName,
        title: answers.title,
        url: answers.url,
        description: answers.description
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
        updateSiteConfig(projectDir, config);
        console.log(chalk.green('✔ Configuration updated'));

        // 3. Update package.json
        console.log(chalk.gray('Updating package.json...'));
        updatePackageJson(projectDir, config);
        console.log(chalk.green('✔ package.json updated'));

        // 4. Initialize Git
        console.log(chalk.gray('Initializing git repository...'));
        try {
            execSync('git init', { cwd: projectDir, stdio: 'ignore' });
            execSync('git add .', { cwd: projectDir, stdio: 'ignore' });
            execSync('git commit -m "Initial commit from vending-mocha"', { cwd: projectDir, stdio: 'ignore' });
            console.log(chalk.green('✔ Git initialized'));
        } catch (e) {
            console.warn(chalk.yellow('⚠ Failed to initialize git repository (git might not be installed).'));
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
    console.log(chalk.yellow('Your content (posts/, projects/) and configuration (src/site.config.ts) will be preserved.'));
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
    .version('0.0.0')
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
