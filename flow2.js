const fs = require("fs");
const path = require("path");
const axios = require("axios");
const FormData = require("form-data");
const { v4: uuidv4 } = require("uuid");
const mime = require("mime-types");

// =====================================================
// CONFIG
// =====================================================

const configPath = path.join(__dirname, "config1.json");

if (!fs.existsSync(configPath)) {
  console.log("❌ config1.json not found!");
  console.log("Expected:", configPath);
  process.exit(1);
}

let CONFIG;

try {
  CONFIG = JSON.parse(
    fs.readFileSync(configPath, "utf8")
  );
} catch (error) {
  console.log("❌ Could not read config1.json");
  console.log(error.message);
  process.exit(1);
}

// =====================================================
// INPUT
// =====================================================

const filePath = process.argv[2];
const userName = process.argv[3] || "Auto User";

if (!filePath) {
  console.log("❌ Usage:");
  console.log('node flow1.js <file> ["username"]');
  process.exit(1);
}

if (!fs.existsSync(filePath)) {
  console.log("❌ File not found:", filePath);
  process.exit(1);
}

// =====================================================
// USER ID
// =====================================================

const userId = CONFIG.userId;

if (!userId) {
  console.log("❌ userId is missing in config1.json!");
  process.exit(1);
}

// =====================================================
// TEST COUNTERS
// =====================================================

let passed = 0;
let failed = 0;

// =====================================================
// PASS / FAIL ASSERTION
// =====================================================

function test(name, condition, actual) {
  if (condition) {
    console.log(`  ✅ PASS: ${name}`);
    passed++;
  } else {
    console.log(
      `  ❌ FAIL: ${name} — Got: ${JSON.stringify(actual)}`
    );
    failed++;
  }
}

// =====================================================
// API CALL WRAPPER
// =====================================================

async function apiCall(stepName, requestFn) {
  try {
    const response = await requestFn();

    console.log(
      `\n🌐 [${stepName}] HTTP ${response.status} ${response.statusText}`
    );

    if (response.data?.Success === false) {
      console.log(
        `⚠️ [${stepName}] API returned Success:false`
      );

      console.log(
        "Message:",
        response.data?.Message
      );

      console.log(
        "ResponseCode:",
        response.data?.ResponseCode
      );

      console.log(
        "Full response:",
        JSON.stringify(
          response.data,
          null,
          2
        )
      );
    }

    return response;

  } catch (error) {

    console.error(
      `\n❌ [${stepName}] REQUEST FAILED`
    );

    console.error(
      "HTTP Status:",
      error.response?.status || "N/A"
    );

    console.error(
      "Status Text:",
      error.response?.statusText || "N/A"
    );

    console.error(
      "URL:",
      error.config?.url || "N/A"
    );

    console.error(
      "Method:",
      error.config?.method?.toUpperCase() || "N/A"
    );

    console.error(
      "Response:",
      JSON.stringify(
        error.response?.data || error.message,
        null,
        2
      )
    );

    throw error;
  }
}

// =====================================================
// START
// =====================================================

console.log("\n========================================");
console.log("🚀 FILE UPLOAD AUTOMATION STARTED");
console.log("========================================");

console.log("📂 FILE:", filePath);
console.log("👤 USER:", userName);
console.log("🆔 USER ID: loaded from config1.json");

// =====================================================
// RANDOM STRING
// =====================================================

function generateRandomString() {
  const randomNumber = Math.floor(
    1000 + Math.random() * 9000
  );

  return `Sharmin ${randomNumber}`;
}

// =====================================================
// STEP 1 - GET TOKEN
// =====================================================

async function getToken() {

  console.log("\n========================================");
  console.log("🔐 STEP 1 - GET ACCESS TOKEN");
  console.log("========================================");

  const params = new URLSearchParams();

  params.append(
    "grant_type",
    "client_credentials"
  );

  params.append(
    "client_id",
    CONFIG.clientId
  );

  params.append(
    "client_secret",
    CONFIG.clientSecret
  );

  const response = await apiCall(
    "Step 1: Get Token",
    () =>
      axios.post(
        CONFIG.tokenUrl,
        params,
        {
          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded"
          }
        }
      )
  );

  const token =
    response.data?.access_token;

  test(
    "Token API returned HTTP 200",
    response.status === 200,
    response.status
  );

  test(
    "Access token exists",
    typeof token === "string" &&
      token.length > 0,
    token ? "Token received" : token
  );

  if (!token) {
    throw new Error(
      "Access token was not returned."
    );
  }

  console.log("✅ TOKEN RECEIVED");

  return token;
}

// =====================================================
// STEP 2 - BUILD FILE INFO
// =====================================================

function buildFileInfo(filePath, recordId) {

  console.log("\n========================================");
  console.log("📊 STEP 2 - BUILD FILE METADATA");
  console.log("========================================");

  const stats =
    fs.statSync(filePath);

  const fileName =
    path.basename(filePath);

  const extension =
    path
      .extname(fileName)
      .replace(".", "");

  const mimeType =
    mime.lookup(fileName) ||
    "application/octet-stream";

  const fileInfo = {

    id: uuidv4(),

    OriginalFileName:
      fileName,

    FileExtension:
      extension,

    FileSizeInBytes:
      stats.size,

    FileSizeInKB:
      Math.round(stats.size / 1024),

    FileType:
      mimeType,

    CloudFileType:
      1,

    RecordId:
      recordId,

    TypeId:
      CONFIG.typeId,

    FieldName:
      CONFIG.fieldName
  };

  console.log(
    JSON.stringify(
      fileInfo,
      null,
      2
    )
  );

  // Metadata validations

  test(
    "File exists",
    fs.existsSync(filePath),
    filePath
  );

  test(
    "File has a valid name",
    fileName.length > 0,
    fileName
  );

  test(
    "File size is greater than 0",
    stats.size > 0,
    stats.size
  );

  test(
    "File MIME type detected",
    mimeType !== "application/octet-stream",
    mimeType
  );

  test(
    "File extension exists",
    extension.length > 0,
    extension
  );

  return fileInfo;
}

// =====================================================
// STEP 3 - FILE UPLOAD API
// =====================================================

async function uploadFile(token) {

  console.log("\n========================================");
  console.log("📤 STEP 3 - FILE UPLOAD");
  console.log("========================================");

  const recordId =
    uuidv4();

  const fileInfo =
    buildFileInfo(
      filePath,
      recordId
    );

  const form =
    new FormData();

  form.append(
    "UploadedFile",
    fs.createReadStream(filePath),
    {
      filename:
        path.basename(filePath),

      contentType:
        fileInfo.FileType
    }
  );

  form.append(
    "FileInfo",
    JSON.stringify(fileInfo),
    {
      filename:
        "info.json",

      contentType:
        "application/json"
    }
  );

  const response =
    await apiCall(
      "Step 3: File Upload",
      () =>
        axios.post(
          CONFIG.fileApi,
          form,
          {
            headers: {

              ...form.getHeaders(),

              Authorization:
                "Bearer " + token,

              "x-ca-app-id":
                CONFIG.appId,

              "x-ca-user-id":
                userId,

              "x-ca-client-id":
                CONFIG.clientAppId,

              "x-ca-client-platform":
                "3",

              "x-ca-client-version":
                "8.0.2.66"
            },

            maxBodyLength:
              Infinity
          }
        )
    );

  console.log(
    "\n📦 FILE UPLOAD RESPONSE:"
  );

  console.log(
    JSON.stringify(
      response.data,
      null,
      2
    )
  );

  // ===================================================
  // UPLOAD ASSERTIONS
  // ===================================================

  test(
    "File Upload HTTP status is 200",
    response.status === 200,
    response.status
  );

  test(
    "File Upload response exists",
    response.data !== undefined &&
      response.data !== null,
    response.data
  );

  if (
    response.data?.Success !== undefined
  ) {
    test(
      "File Upload API Success is true",
      response.data.Success === true,
      response.data.Success
    );
  }

  test(
    "File Upload Result exists",
    response.data?.Result !== undefined &&
      response.data?.Result !== null,
    response.data?.Result
  );

  return {
    recordId:
      recordId,

    fileInfo:
      fileInfo,

    apiResponse:
      response.data
  };
}

// =====================================================
// STEP 4 - EXTRACT FILE DATA
// =====================================================

function extractFileData(
  uploadResult
) {

  console.log("\n========================================");
  console.log("📦 STEP 4 - EXTRACT FILE DATA");
  console.log("========================================");

  const result =
    uploadResult
      .apiResponse
      ?.Result || {};

  const fileInfo =
    uploadResult.fileInfo;

  const fileData = {

    recordId:
      uploadResult.recordId,

    fileId:
      result.id ||
      result.Id ||
      fileInfo.id,

    originalFileName:
      result.OriginalFileName ||
      fileInfo.OriginalFileName,

    fileExtension:
      result.FileExtension ||
      fileInfo.FileExtension,

    fileType:
      result.FileType ||
      fileInfo.FileType,

    fileSizeInBytes:
      result.FileSizeInBytes ||
      fileInfo.FileSizeInBytes,

    fileSizeInKB:
      result.FileSizeInKB ||
      fileInfo.FileSizeInKB,

    originalURL:
      result.OriginalURL ||
      result.originalURL,

    thumbnailURL:
      result.ThumbnailURL ||
      result.thumbnailURL,

    cloudFileType:
      result.CloudApperFileType ??
      result.CloudFileType ??
      fileInfo.CloudFileType,

    typeId:
      fileInfo.TypeId,

    fieldName:
      fileInfo.FieldName
  };

  console.log(
    JSON.stringify(
      fileData,
      null,
      2
    )
  );

  // ===================================================
  // FILE RESPONSE ASSERTIONS
  // ===================================================

  test(
    "File ID exists",
    typeof fileData.fileId === "string" &&
      fileData.fileId.length > 0,
    fileData.fileId
  );

  test(
    "Original filename is returned",
    typeof fileData.originalFileName === "string" &&
      fileData.originalFileName.length > 0,
    fileData.originalFileName
  );

  test(
    "Filename matches uploaded file",
    fileData.originalFileName ===
      path.basename(filePath),
    fileData.originalFileName
  );

  test(
    "File extension is returned",
    typeof fileData.fileExtension === "string" &&
      fileData.fileExtension.length > 0,
    fileData.fileExtension
  );

  test(
    "File type is returned",
    typeof fileData.fileType === "string" &&
      fileData.fileType.length > 0,
    fileData.fileType
  );

  test(
    "File size is returned",
    typeof fileData.fileSizeInBytes === "number" &&
      fileData.fileSizeInBytes > 0,
    fileData.fileSizeInBytes
  );

  test(
    "Original URL is returned",
    typeof fileData.originalURL === "string" &&
      fileData.originalURL.length > 0,
    fileData.originalURL
  );

  test(
    "File field name is correct",
    fileData.fieldName ===
      CONFIG.fieldName,
    fileData.fieldName
  );

  test(
    "Type ID is correct",
    fileData.typeId ===
      CONFIG.typeId,
    fileData.typeId
  );

  return fileData;
}

// =====================================================
// STEP 5 - SAVE RECORD API
// =====================================================

async function saveRecord(
  token,
  fileData
) {

  console.log("\n========================================");
  console.log("💾 STEP 5 - SAVE RECORD");
  console.log("========================================");

  if (!fileData.originalURL) {
    throw new Error(
      "OriginalURL was not returned by File API."
    );
  }

  const randomString =
    generateRandomString();

  console.log(
    "🎲 RANDOM STRING:",
    randomString
  );

  const recordId =
    uuidv4();

  const body = {

    Items: [

      {

        id:
          recordId,

        TypeId:
          CONFIG.typeId,

        Status:
          2,

        CreateDate:
          new Date().toISOString(),

        LastModifyDate:
          new Date().toISOString(),

        CreatedBy:
          userName,

        CreatedById:
          userId,

        DisplayName:
          userName,

        [CONFIG.stringFieldName]:
          randomString,

        [CONFIG.fieldName]:
          [
            fileData.originalURL
          ]
      }
    ]
  };

  console.log(
    "\n📋 SAVE REQUEST:"
  );

  console.log(
    JSON.stringify(
      body,
      null,
      2
    )
  );

  const response =
    await apiCall(
      "Step 5: Save Record",
      () =>
        axios.post(
          CONFIG.recordApi,
          body,
          {
            headers: {

              Authorization:
                "Bearer " + token,

              "x-ca-app-id":
                CONFIG.appId,

              "x-ca-user-id":
                userId,

              "x-ca-user-name":
                userName,

              "x-ca-client-id":
                CONFIG.clientAppId,

              "x-ca-client-platform":
                "3",

              "x-ca-client-version":
                "8.0.2.66",

              "Content-Type":
                "application/json"
            }
          }
        )
    );

  console.log(
    "\n💾 RECORD RESPONSE:"
  );

  console.log(
    JSON.stringify(
      response.data,
      null,
      2
    )
  );

  // ===================================================
  // RECORD ASSERTIONS
  // ===================================================

  test(
    "Record API HTTP status is 200",
    response.status === 200,
    response.status
  );

  test(
    "Record response exists",
    response.data !== undefined &&
      response.data !== null,
    response.data
  );

  if (
    response.data?.Success !== undefined
  ) {
    test(
      "Record API Success is true",
      response.data.Success === true,
      response.data.Success
    );
  }

  test(
    "Random string was generated",
    typeof randomString === "string" &&
      randomString.length > 0,
    randomString
  );

  test(
    "File URL was included in record",
    body.Items[0][CONFIG.fieldName]?.includes(
      fileData.originalURL
    ),
    body.Items[0][CONFIG.fieldName]
  );

  test(
    "User ID was included in record",
    body.Items[0].CreatedById ===
      userId,
    body.Items[0].CreatedById
  );

  test(
    "Type ID was included in record",
    body.Items[0].TypeId ===
      CONFIG.typeId,
    body.Items[0].TypeId
  );

  return {

    apiResponse:
      response.data,

    randomString:
      randomString,

    recordId:
      recordId
  };
}

// =====================================================
// STEP 6 - FINAL RESULT
// =====================================================

function printFinalSummary() {

  console.log("\n========================================");
  console.log("🧪 FINAL TEST SUMMARY");
  console.log("========================================");

  console.log(
    `✅ PASSED: ${passed}`
  );

  console.log(
    `❌ FAILED: ${failed}`
  );

  console.log(
    `📊 TOTAL:  ${passed + failed}`
  );

  console.log("========================================");

  if (failed === 0) {

    console.log(
      "🎉 ALL TESTS PASSED!"
    );

    console.log(
      "🎉 FILE UPLOAD FLOW PASSED!"
    );

  } else {

    console.log(
      "❌ SOME TESTS FAILED!"
    );

  }

  console.log("========================================");
}

// =====================================================
// MAIN FLOW
// =====================================================

async function main() {

  try {

    // ================================================
    // STEP 1 - TOKEN
    // ================================================

    const token =
      await getToken();

    // ================================================
    // STEP 2 + 3 - FILE METADATA + UPLOAD
    // ================================================

    const uploadResult =
      await uploadFile(
        token
      );

    // ================================================
    // STEP 4 - EXTRACT FILE DATA
    // ================================================

    const fileData =
      extractFileData(
        uploadResult
      );

    // ================================================
    // STEP 5 - SAVE RECORD
    // ================================================

    const saveResult =
      await saveRecord(
        token,
        fileData
      );

    // ================================================
    // FINAL RESULT
    // ================================================

    const finalResult = {

      success:
        failed === 0,

      randomString:
        saveResult.randomString,

      recordId:
        saveResult.recordId,

      file:
        fileData,

      savedRecord:
        saveResult.apiResponse
    };

    console.log(
      "\n📄 FINAL RESULT:"
    );

    console.log(
      JSON.stringify(
        finalResult,
        null,
        2
      )
    );

    // ================================================
    // SUMMARY
    // ================================================

    printFinalSummary();

    // ================================================
    // CI/CD EXIT CODE
    // ================================================

    if (failed > 0) {

      process.exit(1);

    } else {

      process.exit(0);

    }

  } catch (error) {

    console.log(
      "\n========================================"
    );

    console.log(
      "❌ FLOW FAILED"
    );

    console.log(
      "========================================"
    );

    if (error.response) {

      console.log(
        "HTTP STATUS:",
        error.response.status
      );

      console.log(
        "API ERROR:"
      );

      console.log(
        JSON.stringify(
          error.response.data,
          null,
          2
        )
      );

    } else {

      console.log(
        "ERROR:",
        error.message
      );

    }

    failed++;

    printFinalSummary();

    // Important for CI/CD
    process.exit(1);
  }
}

// =====================================================
// START
// =====================================================

main();