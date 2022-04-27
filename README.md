# CLI for Microsoft 365 Login

GitHub action to login to a tenant using CLI for Microsoft 365.

![CLI for Microsoft 365](./images/pnp-cli-microsoft365-blue.svg)

This GitHub Action (created using typescript) uses [CLI for Microsoft 365](https://pnp.github.io/cli-microsoft365/), specifically the [login command](https://pnp.github.io/cli-microsoft365/cmd/login), to allow you log in to Microsoft 365.

## Usage
### Pre-requisites

Create a workflow `.yml` file in your `.github/workflows` directory. An [example workflow](#example-workflow---cli-for-microsoft-365-login) is available below. For more information, reference the GitHub Help Documentation for [Creating a workflow file](https://help.github.com/en/articles/configuring-a-workflow#creating-a-workflow-file).

### Inputs

- `ADMIN_USERNAME` : Username (email address of the admin)
- `ADMIN_PASSWORD` : Password of the admin
- `CERTIFICATE_ENCODED` : Base64-encoded string with certificate private key
- `CERTIFICATE_PASSWORD` : Password for the certificate
- `AAD_APP_ID` : App ID of the Azure AD application to use for certificate authentication
- `TENANT_ID` : ID or domain (for example "contoso.onmicrosoft.com") of the tenant from which accounts should be able to authenticate

All inputs are optional. But depending of the authentication type chosen, following pair of inputs will be necessary:

- `authType` is `password`: `ADMIN_USERNAME` and `ADMIN_PASSWORD` are required
- `authType` is `certificate`: at least `CERTIFICATE_ENCODED` and `AAD_APP_ID` are required
  - `TENANT_ID` will be required. It can be the ID of the tenant from which accounts should be able to authenticate. Use `common` or `organization` if the app is multitenant
  - Depending on the certificate provided, if encoded with password, `CERTIFICATE_PASSWORD` will be required

#### Optional requirement

Since this action requires sensitive information such as user name, password and encoded certificate for example, it would be ideal to store them securely. We can achieve this in a GitHub repo by using [secrets](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/creating-and-using-encrypted-secrets). So, click on `settings` tab in your repo and add:

- 2 new secrets if `authType` is `password`:
  - `adminUsername` - store the admin user name in this (e.g. user@contoso.onmicrosoft.com)
  - `adminPassword` - store the password of that user in this.

- 3 new secrets if `authType` is `certificate`:
  - `appID` - store the Azure AD application ID used for authentication
  - `appEncodedCertificate` - store the Base64-encoded string of the certificate stored in the Azure AD application
  - `appPasswordCertificate` - store the certificate password
  
These secrets are encrypted and can only be used by GitHub actions. 

### Example workflow - CLI for Microsoft 365 Login (user name / password authentication)

On every `push` build the code and then login to Office 365 before deploying, using user login / password authentication.

```yaml
name: SPFx CICD with Cli for Microsoft 365

on: [push]

jobs:
  build:
    ##
    ## Build code omitted
    ##
        
  deploy:
    needs: build
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [10.x]
    
    steps:
    
    ##
    ## Code to get the package omitted
    ##

    # CLI for Microsoft 365 login action
    - name: Login to tenant
      uses: pnp/action-cli-login@v2.1.0
      with:
        ADMIN_USERNAME:  ${{ secrets.adminUsername }}
        ADMIN_PASSWORD:  ${{ secrets.adminPassword }}
    
    ##
    ## Code to deploy the package to tenant omitted
    ##
```

### Example workflow - CLI for Microsoft 365 Login (certificate authentification)

On every `push` build the code and then login to Office 365 before deploying, using certificate authentication.

```yaml
name: SPFx CICD with Cli for Microsoft 365

on: [push]

jobs:
  build:
    ##
    ## Build code omitted
    ##
        
  deploy:
    needs: build
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [10.x]
    
    steps:
    
    ##
    ## Code to get the package omitted
    ##

    # CLI for Microsoft 365 login action
    - name: Login to tenant
      uses: pnp/action-cli-login@v2.1.0
      with:
        AAD_APP_ID:  ${{ secrets.appID }}
        CERTIFICATE_ENCODED: ${{ secrets.appEncodedCertificate }}
        CERTIFICATE_PASSWORD:  ${{ secrets.appPasswordCertificate }}
    
    ##
    ## Code to deploy the package to tenant omitted
    ##
```

#### Self-hosted runners

If self-hosted runners are used for running the workflow, then please make sure that they have `PowerShell` or `bash` installed on them. 

## Release notes

### v2.1.0

- Adds the certificate login options

### v2.0.0

- Renames action to 'CLI for Microsoft 365'

### v1.0.0

- Added inital 'Office 365 CLI login' GitHub action solving #2