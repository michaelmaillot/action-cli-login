import * as core from '@actions/core';
import { exec } from '@actions/exec';
import { which } from '@actions/io';

let cliMicrosoft365Path: string;

async function main() {
    try {
        const username: string = core.getInput("ADMIN_USERNAME", { required: false });
        const password: string = core.getInput("PASSWORD", { required: false });
        const certificateEncoded: string = core.getInput("CERTIFICATE_ENCODED", { required: false });
        const aadAppId: string = core.getInput("AAD_APP_ID", { required: false });
        const tenantId: string = core.getInput("TENANT_ID", { required: false });

        core.info("ℹ️ Installing CLI for Microsoft 365...");

        const cliMicrosoft365InstallCommand: string = "npm install -g @pnp/cli-microsoft365";
        const options: any = {};
        options.silent = true;
        if (process.env.RUNNER_OS == "Windows") {
            await exec(cliMicrosoft365InstallCommand, [], options);
        } else {
            await exec(`sudo ${cliMicrosoft365InstallCommand}`, [], options);
        }
        cliMicrosoft365Path = await which("m365", true);

        core.info("✅ Completed installing CLI for Microsoft 365.");

        core.info("ℹ️ Logging in to the tenant...");

        if (username && password) {
            await executeCLIMicrosoft365Command(`login --authType password --userName ${username} --password ${password}`);
        }
        else if (certificateEncoded && aadAppId) {
            let authCommand: string = `login --authType certificate --certificateBase64Encoded ${certificateEncoded} --appId ${aadAppId}`;
            
            if (password) {
                authCommand += ` --password ${password}`;
            }

            if (tenantId) {
                authCommand += ` --tenant ${tenantId}`;
            }

            await executeCLIMicrosoft365Command(authCommand);
        }
        else {
            core.error("⛔ You must provide either ADMIN_USERNAME and PASSWORD parameters (if authenticating with user name / password), or at least following ones: CERTIFICATE_ENCODED and AAD_APP_ID (if authenticating with a certificate). More information here: https://pnp.github.io/cli-microsoft365/cmd/login/")
        }
        await executeCLIMicrosoft365Command("status");

        core.info("✅ Login successful.");

    } catch (err) {
        core.error("🚨 Login to the tenant failed. Please check the credentials. For more information refer https://aka.ms/create-secrets-for-GitHub-workflows");
        core.setFailed(err);
    }
}

async function executeCLIMicrosoft365Command(command: string) {
    try {
        await exec(`"${cliMicrosoft365Path}" ${command}`, [], {});
    }
    catch (err) {
        throw new Error(err);
    }
}

main();