Absolutely. I’ll combine the **full setup, installation, configuration, sample-file usage, metadata extraction, execution commands, Git structure, and the `config1.json` security section** into one complete document.

# CloudApper File Upload and Record Creation Automation

## 1. Overview

This automation script uploads a file to the CloudApper File API and then creates a record through the CloudApper Records API.

The flow performs the following operations:

1. Reads configuration from `config1.json`
2. Validates the input file
3. Gets an access token
4. Generates file metadata
5. Uploads the file through the File API
6. Extracts the file information returned by the API
7. Extracts the original file URL and thumbnail URL
8. Generates a random value for the configured string field
9. Creates a record through the Records API
10. Saves the uploaded file URL into the configured multi-file field
11. Displays the complete result

### Overall Flow

```text
Input File
    ↓
config1.json
    ↓
Get Access Token
    ↓
File Metadata Generation
    ↓
File Upload API
    ↓
Extract File Metadata
    ↓
Generate Random String
    ↓
Records API
    ↓
Record Created Successfully
```

---

# 2. Project Structure

The recommended project structure is:

```text
CloudApper-File-Automation/
│
├── flow1.js
├── config1.json
├── config1.example.json
├── package.json
├── package-lock.json
├── .gitignore
│
└── tests/
    └── data/
        └── sample.png
```

### File descriptions

| File                    | Purpose                                             |
| ----------------------- | --------------------------------------------------- |
| `flow1.js`              | Main automation script                              |
| `config1.json`          | Local configuration containing credentials and IDs  |
| `config1.example.json`  | Safe configuration template for Git                 |
| `package.json`          | Node.js dependency information                      |
| `package-lock.json`     | Locked dependency versions                          |
| `.gitignore`            | Prevents sensitive/local files from being committed |
| `tests/data/sample.png` | Example file used for testing                       |

---

# 3. Prerequisites

The following software is required:

### Node.js

Install Node.js on the machine.

Verify the installation:

```cmd
node --version
```

Example:

```text
v22.x.x
```

Also verify npm:

```cmd
npm --version
```

---

# 4. Required Node.js Packages

The automation uses the following packages:

```text
axios
form-data
uuid
mime-types
```

Install them from the project directory:

```cmd
npm install axios form-data uuid mime-types
```

After installation, the project will contain:

```text
node_modules/
package.json
package-lock.json
```

Do not commit `node_modules` to Git.

---

# 5. Configuration

The script reads configuration from:

```text
config1.json
```

The file must be located in the same directory as `flow1.js`.

Example:

```text
CloudApper-File-Automation/
│
├── flow1.js
└── config1.json
```

---

# 6. `config1.json`

The actual local configuration contains the values required to communicate with the CloudApper APIs.

Example structure:

```json
{
  "tokenUrl": "https://dev-account.cloudapper.com/connect/token",
  "recordApi": "https://dev-api.cloudapper.com/api/v3/Records?records-required=true",
  "fileApi": "https://dev-api.cloudapper.com/api/v3/Files",

  "clientId": "crm_client_create_service",
  "clientSecret": "YOUR_CLIENT_SECRET",

  "appId": "YOUR_APP_ID",
  "userId": "YOUR_USER_ID",
  "clientAppId": "YOUR_CLIENT_APP_ID",

  "typeId": "YOUR_TYPE_ID",

  "fieldName": "multiFileField6",
  "stringFieldName": "stringField10"
}
```

### Configuration fields

| Field             | Description                                             |
| ----------------- | ------------------------------------------------------- |
| `tokenUrl`        | CloudApper token endpoint                               |
| `recordApi`       | CloudApper Records API                                  |
| `fileApi`         | CloudApper File API                                     |
| `clientId`        | OAuth client ID                                         |
| `clientSecret`    | OAuth client secret                                     |
| `appId`           | CloudApper application ID                               |
| `userId`          | User ID used by the API                                 |
| `clientAppId`     | Client application ID                                   |
| `typeId`          | Record/entity type ID                                   |
| `fieldName`       | Multi-file field used to store the uploaded file URL    |
| `stringFieldName` | String field where the generated random value is stored |

---

# 7. String Field Configuration

The string field is configurable.

For example, if the required field is:

```text
stringField10
```

use:

```json
"stringFieldName": "stringField10"
```

If the required field is:

```text
stringField4
```

use:

```json
"stringFieldName": "stringField4"
```

The JavaScript file does not need to be modified because it dynamically reads the field name:

```javascript
[CONFIG.stringFieldName]: randomString
```

For example:

```json
"stringFieldName": "stringField10"
```

will produce a record similar to:

```json
"stringField10": "Sharmin 8685"
```

The value is generated automatically.

---

# 8. Random String Generation

The script generates a random four-digit value.

Example:

```text
Sharmin 5339
Sharmin 9275
Sharmin 8685
```

The logic is:

```javascript
function generateRandomString() {
  const randomNumber = Math.floor(
    1000 + Math.random() * 9000
  );

  return `Sharmin ${randomNumber}`;
}
```

The generated value is stored in the configured string field.

For example:

```json
"stringField10": "Sharmin 8685"
```

---

# 9. Sample Configuration File for Git

The real `config1.json` must **not** be committed to Git.

Create:

```text
config1.example.json
```

Use only placeholder values:

```json
{
  "tokenUrl": "https://dev-account.cloudapper.com/connect/token",
  "recordApi": "https://dev-api.cloudapper.com/api/v3/Records?records-required=true",
  "fileApi": "https://dev-api.cloudapper.com/api/v3/Files",

  "clientId": "crm_client_create_service",
  "clientSecret": "YOUR_CLIENT_SECRET",

  "appId": "YOUR_APP_ID",
  "userId": "YOUR_USER_ID",
  "clientAppId": "YOUR_CLIENT_APP_ID",

  "typeId": "YOUR_TYPE_ID",

  "fieldName": "multiFileField6",
  "stringFieldName": "stringField10"
}
```

This file can safely be committed to Git because it does not contain real credentials.

---

# 10. Security

Do **NOT** commit the real `config1.json` to Git.

The actual configuration can contain sensitive values such as:

```text
clientSecret
userId
appId
clientAppId
```

These values should remain local and must not be exposed in the repository.

## 10.1 Add `config1.json` to `.gitignore`

Create a `.gitignore` file:

```gitignore
config1.json
node_modules/
```

This prevents Git from tracking the real configuration file and the Node.js dependency folder.

## 10.2 Safe Configuration Template

Commit:

```text
config1.example.json
```

Do not commit:

```text
config1.json
```

## 10.3 Setup After Cloning

After another user clones the repository, they can create their local configuration from the example:

```cmd
copy config1.example.json config1.json
```

Then edit:

```text
config1.json
```

and enter their own valid configuration values.

## 10.4 Verify Git Ignore

Run:

```cmd
git status
```

`config1.json` should not appear as a file to commit.

You can also verify:

```cmd
git check-ignore config1.json
```

Expected output:

```text
config1.json
```

---

# 11. Sample File

The automation requires an input file.

For example:

```text
sample.png
```

You can keep the sample file directly beside `flow1.js`:

```text
CloudApper-File-Automation/
│
├── flow1.js
├── config1.json
└── sample.png
```

In this case, run:

```cmd
node flow1.js sample.png "Auto User"
```

---

# 12. Using a Test Data Folder

Alternatively, keep the sample file inside:

```text
tests\data\sample.png
```

Project structure:

```text
CloudApper-File-Automation/
│
├── flow1.js
├── config1.json
├── config1.example.json
│
└── tests/
    └── data/
        └── sample.png
```

From the project root, run:

```cmd
node flow1.js tests\data\sample.png "Auto User"
```

### Important

The command must be executed from the directory where the relative path exists.

For example, if the terminal is:

```text
C:\Users\sharmin\Music>
```

and there is no:

```text
C:\Users\sharmin\Music\tests\data\sample.png
```

then:

```cmd
node flow1.js tests\data\sample.png "Auto User"
```

will produce:

```text
❌ File not found: tests\data\sample.png
```

If `sample.png` is directly in:

```text
C:\Users\sharmin\Music
```

then use:

```cmd
node flow1.js sample.png "Auto User"
```

---

# 13. Checking the Configuration

Before running the flow, you can check whether the configuration file is being read.

Run:

```cmd
node -e "const c=require('./config1.json'); console.log(c)"
```

You can also check important IDs:

```cmd
node -e "const c=require('./config1.json'); console.log({appId:c.appId,userId:c.userId,clientAppId:c.clientAppId,typeId:c.typeId})"
```

This is useful for confirming that the expected configuration is loaded.

---

# 14. Check JavaScript Syntax

Before executing the complete flow, check the JavaScript syntax:

```cmd
node --check flow1.js
```

If there is no output, the syntax check passed.

---

# 15. Running the Flow

## 15.1 File in the Same Folder

If:

```text
flow1.js
sample.png
config1.json
```

are in the same directory, run:

```cmd
node flow1.js sample.png
```

or:

```cmd
node flow1.js sample.png "Auto User"
```

---

## 15.2 File in `tests\data`

If the project contains:

```text
tests\data\sample.png
```

run from the project root:

```cmd
node flow1.js tests\data\sample.png "Auto User"
```

---

# 16. What the Command Means

For:

```cmd
node flow1.js tests\data\sample.png "Auto User"
```

the arguments mean:

```text
node
    ↓
Run Node.js

flow1.js
    ↓
Main automation script

tests\data\sample.png
    ↓
Input file

"Auto User"
    ↓
CreatedBy / user name
```

The username is optional.

Therefore this is also valid:

```cmd
node flow1.js sample.png
```

The script will use:

```text
Auto User
```

as the default username.

---

# 17. Automation Flow

## Step 1 — Read Configuration

`flow1.js` loads:

```text
config1.json
```

and reads:

```text
tokenUrl
recordApi
fileApi
clientId
clientSecret
appId
userId
clientAppId
typeId
fieldName
stringFieldName
```

---

## Step 2 — Validate Input File

The script checks whether the supplied file exists.

For example:

```cmd
node flow1.js sample.png
```

If the file does not exist:

```text
❌ File not found: sample.png
```

---

## Step 3 — Get Access Token

The script sends the configured client credentials to:

```text
/connect/token
```

The response provides an access token.

Expected output:

```text
🔐 Getting access token...
✅ TOKEN RECEIVED
```

---

# 18. File Metadata Extraction

Before uploading, the script reads metadata from the local file.

For example:

```json
{
  "id": "generated-file-id",
  "OriginalFileName": "sample.png",
  "FileExtension": "png",
  "FileSizeInBytes": 532612,
  "FileSizeInKB": 520,
  "FileType": "image/png",
  "CloudFileType": 1,
  "RecordId": "generated-record-id",
  "TypeId": "YOUR_TYPE_ID",
  "FieldName": "multiFileField6"
}
```

The metadata includes:

* File ID
* Original file name
* File extension
* File size in bytes
* File size in KB
* MIME type
* Cloud file type
* Record ID
* Type ID
* Field name

---

# 19. File Upload

The file is sent to:

```text
CloudApper File API
```

The request contains:

```text
UploadedFile
FileInfo
```

The API returns information about the uploaded file.

For example:

```json
{
  "OriginalFileName": "sample.png",
  "FileType": "image/png",
  "FileExtension": "png",
  "FileSizeInKB": 520,
  "OriginalURL": "https://...",
  "ThumbnailURL": "https://..."
}
```

---

# 20. Extract Returned File Data

The script extracts:

```text
fileId
originalFileName
fileExtension
fileType
fileSizeInBytes
fileSizeInKB
originalURL
thumbnailURL
cloudFileType
typeId
fieldName
```

The most important value for the record is:

```text
originalURL
```

This URL is stored in the multi-file field.

---

# 21. Record Creation

The script then creates a record through:

```text
Records API
```

The record contains:

```json
{
  "id": "generated-record-id",
  "TypeId": "YOUR_TYPE_ID",
  "Status": 2,
  "CreatedBy": "Auto User",
  "CreatedById": "YOUR_USER_ID",
  "DisplayName": "Auto User",
  "stringField10": "Sharmin 8685",
  "multiFileField6": [
    "uploaded-file-url"
  ]
}
```

The actual string field is determined by:

```text
stringFieldName
```

and the actual file field is determined by:

```text
fieldName
```

---

# 22. Successful Result

A successful execution ends with:

```text
🎉 ===============================
🎉 FLOW COMPLETED SUCCESSFULLY
🎉 ===============================
```

The final result contains:

```text
success
randomString
file
savedRecord
```

For example:

```json
{
  "success": true,
  "randomString": "Sharmin 8685",
  "file": {
    "recordId": "...",
    "fileId": "...",
    "originalFileName": "sample.png",
    "fileExtension": "png",
    "fileType": "image/png",
    "fileSizeInBytes": 532612,
    "fileSizeInKB": 520,
    "originalURL": "https://...",
    "thumbnailURL": "https://...",
    "cloudFileType": 0,
    "typeId": "YOUR_TYPE_ID",
    "fieldName": "multiFileField6"
  },
  "savedRecord": {
    "Success": true,
    "ResponseCode": 200
  }
}
```

---

# 23. Complete Installation Steps

From the project directory:

### Step 1 — Check Node.js

```cmd
node --version
```

### Step 2 — Install dependencies

```cmd
npm install axios form-data uuid mime-types
```

### Step 3 — Create configuration

```cmd
copy config1.example.json config1.json
```

### Step 4 — Update `config1.json`

Enter the required:

```text
clientSecret
appId
userId
clientAppId
typeId
fieldName
stringFieldName
```

### Step 5 — Add sample file

For example:

```text
tests\data\sample.png
```

### Step 6 — Check syntax

```cmd
node --check flow1.js
```

### Step 7 — Run

```cmd
node flow1.js tests\data\sample.png "Auto User"
```

---

# 24. Git Setup

Initialize Git from the project root:

```cmd
git init
```

Check the files:

```cmd
git status
```

Add the files:

```cmd
git add flow1.js config1.example.json package.json package-lock.json .gitignore tests
```

Commit:

```cmd
git commit -m "Add CloudApper file upload automation"
```

Then connect the remote repository:

```cmd
git remote add origin <YOUR_GIT_REPOSITORY_URL>
```

Push:

```cmd
git branch -M main
git push -u origin main
```

---

# 25. Files That Should Be Committed

Commit:

```text
flow1.js
config1.example.json
package.json
package-lock.json
.gitignore
tests/data/sample.png
```

Do NOT commit:

```text
config1.json
node_modules/
```

---

# 26. Recommended `.gitignore`

Use:

```gitignore
config1.json
node_modules/
```

If test output or logs are generated later, they can also be added to `.gitignore`.

---

# 27. Recommended Repository Structure

The final Git repository should look like:

```text
CloudApper-File-Automation/
│
├── flow1.js
├── config1.example.json
├── package.json
├── package-lock.json
├── .gitignore
│
└── tests/
    └── data/
        └── sample.png
```

The developer/user creates their own local:

```text
config1.json
```

after cloning.

---

# 28. Quick Run Guide

Once everything is installed and configured:

### If the file is beside `flow1.js`

```cmd
node flow1.js sample.png "Auto User"
```

### If the file is under `tests\data`

```cmd
node flow1.js tests\data\sample.png "Auto User"
```

### Syntax check

```cmd
node --check flow1.js
```

### Check configuration

```cmd
node -e "const c=require('./config1.json'); console.log(c)"
```

### Check Git status

```cmd
git status
```

### Verify `config1.json` is ignored

```cmd
git check-ignore config1.json
```

---

# 29. Troubleshooting

## File Not Found

Error:

```text
❌ File not found: tests\data\sample.png
```

Check that the file actually exists relative to the current terminal directory.

For example:

```cmd
dir tests\data
```

If `sample.png` is displayed, the path is correct.

---

## Configuration Not Found

Error:

```text
❌ config1.json not found!
```

Make sure `config1.json` is beside `flow1.js`.

---

## User/App Authorization Error

Example:

```text
HTTP STATUS: 403
Message: "No app found for the user"
```

Check that the `userId`, `appId`, and `clientAppId` in `config1.json` are valid and correspond to the required application/user configuration.

---

## Token Error

If token generation fails, check:

```text
clientId
clientSecret
tokenUrl
```

Make sure the credentials are valid.

---

# 30. Summary

The automation works in the following sequence:

```text
1. User runs flow1.js
          ↓
2. flow1.js reads config1.json
          ↓
3. Input file is validated
          ↓
4. Access token is requested
          ↓
5. File metadata is generated
          ↓
6. File is uploaded
          ↓
7. Returned file metadata is extracted
          ↓
8. Original file URL is extracted
          ↓
9. Random string is generated
          ↓
10. Record is created
          ↓
11. Random string is stored in configured string field
          ↓
12. Uploaded file URL is stored in configured file field
          ↓
13. Final API response is displayed
```

The string field and file field are configurable through `config1.json`, so the same `flow1.js` can be reused for different fields without changing the JavaScript code.

For example:

```json
"fieldName": "multiFileField6",
"stringFieldName": "stringField10"
```

The generated record will contain the uploaded file in `multiFileField6` and a generated value such as `Sharmin 8685` in `stringField10`.

You can use this as the **README/documentation for the Git repository**. The important security point is that **`config1.json` stays local and `config1.example.json` is the version committed to Git**.
