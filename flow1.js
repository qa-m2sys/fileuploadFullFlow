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
// START
// =====================================================

console.log("🚀 SCRIPT STARTED");
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
// GET TOKEN
// =====================================================

async function getToken() {
  console.log("\n🔐 Getting access token...");

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

  const response = await axios.post(
    CONFIG.tokenUrl,
    params,
    {
      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded"
      }
    }
  );

  console.log("✅ TOKEN RECEIVED");

  return response.data.access_token;
}

// =====================================================
// BUILD FILE INFO
// =====================================================

function buildFileInfo(filePath, recordId) {
  const stats = fs.statSync(filePath);

  const fileName = path.basename(filePath);

  const extension = path
    .extname(fileName)
    .replace(".", "");

  const mimeType =
    mime.lookup(fileName) ||
    "application/octet-stream";

  const fileInfo = {
    id: uuidv4(),

    OriginalFileName: fileName,

    FileExtension: extension,

    FileSizeInBytes: stats.size,

    FileSizeInKB:
      Math.round(stats.size / 1024),

    FileType: mimeType,

    CloudFileType: 1,

    RecordId: recordId,

    TypeId: CONFIG.typeId,

    FieldName: CONFIG.fieldName
  };

  console.log("\n📊 FILE METADATA");

  console.log(
    JSON.stringify(
      fileInfo,
      null,
      2
    )
  );

  return fileInfo;
}

// =====================================================
// FILE UPLOAD API
// =====================================================

async function uploadFile(token) {
  console.log(
    "\n📤 ==============================="
  );

  console.log("📤 FILE UPLOAD API");

  console.log(
    "📤 ==============================="
  );

  const recordId = uuidv4();

  const fileInfo =
    buildFileInfo(
      filePath,
      recordId
    );

  const form = new FormData();

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
      filename: "info.json",

      contentType:
        "application/json"
    }
  );

  const response = await axios.post(
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

      maxBodyLength: Infinity
    }
  );

  console.log(
    "\n✅ FILE UPLOAD SUCCESS"
  );

  console.log(
    JSON.stringify(
      response.data,
      null,
      2
    )
  );

  return {
    recordId: recordId,

    fileInfo: fileInfo,

    apiResponse:
      response.data
  };
}

// =====================================================
// EXTRACT FILE DATA
// =====================================================

function extractFileData(uploadResult) {
  const result =
    uploadResult.apiResponse?.Result || {};

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
    "\n📦 ==============================="
  );

  console.log("📦 EXTRACTED FILE DATA");

  console.log(
    "📦 ==============================="
  );

  console.log(
    JSON.stringify(
      fileData,
      null,
      2
    )
  );

  return fileData;
}

// =====================================================
// SAVE RECORD API
// =====================================================

async function saveRecord(
  token,
  fileData
) {
  console.log(
    "\n💾 ==============================="
  );

  console.log("💾 SAVE RECORD API");

  console.log(
    "💾 ==============================="
  );

  if (!fileData.originalURL) {
    throw new Error(
      "OriginalURL was not returned by File API."
    );
  }

  // ===================================================
  // GENERATE RANDOM STRING
  // ===================================================

  const randomString =
    generateRandomString();

  console.log(
    "\n🎲 RANDOM STRING:"
  );

  console.log(
    randomString
  );

  // ===================================================
  // BUILD RECORD
  // ===================================================

  const body = {
    Items: [
      {
        id: uuidv4(),

        TypeId:
          CONFIG.typeId,

        Status: 2,

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

        // Random string field
        [CONFIG.stringFieldName]:
          randomString,

        // File field
        [CONFIG.fieldName]: [
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
    await axios.post(
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
    );

  console.log(
    "\n✅ RECORD SAVE SUCCESS"
  );

  console.log(
    JSON.stringify(
      response.data,
      null,
      2
    )
  );

  return {
    apiResponse:
      response.data,

    randomString:
      randomString
  };
}

// =====================================================
// MAIN FLOW
// =====================================================

async function main() {
  try {

    // STEP 1 - GET TOKEN
    const token =
      await getToken();

    // STEP 2 - UPLOAD FILE
    const uploadResult =
      await uploadFile(
        token
      );

    // STEP 3 - EXTRACT FILE DATA
    const fileData =
      extractFileData(
        uploadResult
      );

    // STEP 4 - SAVE RECORD
    const saveResult =
      await saveRecord(
        token,
        fileData
      );

    // STEP 5 - FINAL RESULT
    const finalResult = {
      success: true,

      randomString:
        saveResult.randomString,

      file:
        fileData,

      savedRecord:
        saveResult.apiResponse
    };

    console.log(
      "\n🎉 ==============================="
    );

    console.log(
      "🎉 FLOW COMPLETED SUCCESSFULLY"
    );

    console.log(
      "🎉 ==============================="
    );

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

  } catch (error) {

    console.log(
      "\n❌ ==============================="
    );

    console.log("❌ FLOW FAILED");

    console.log(
      "❌ ==============================="
    );

    if (error.response) {

      console.log(
        "HTTP STATUS:",
        error.response.status
      );

      console.log("API ERROR:");

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

    process.exit(1);
  }
}

// =====================================================
// START
// =====================================================

main();
