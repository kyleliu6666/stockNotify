function checkExpiryAndNotifyTelegram() {
  var SHEET_NAME = 'stock';
  var NOTIFY_DAYS = 10;
  var DATE_FORMAT = "yyyy/MM/dd";
  var TIMEZONE = "GMT+8";
  var botToken = notifybotToken;
  var chatId = testchatId;
  var webUrl = stock_live_url;
  var lineUserId = line_userid; // 填入你的 userId

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) return;

  var data = sheet.getDataRange().getValues();
  var today = new Date();
  today.setHours(0,0,0,0);

  for (var i = 1; i < data.length; i++) {
    var item = data[i];
    var name = item[0];
    var quantity = item[1] + (item[2] ? item[2] : "");
    var location = item[3];
    var entryDate = item[4];
    var expiry = item[5];
    var note = item[7];

    if (expiry instanceof Date && !isNaN(expiry)) {
      expiry.setHours(0,0,0,0);
      var diff = Math.ceil((expiry - today) / (1000 * 3600 * 24));
      if (diff <= NOTIFY_DAYS && diff >= 0) {
        // Telegram 訊息
        var msg = '【庫存到期提醒】\n物品：' + name +
                  '\n數量：' + quantity +
                  '\n儲存地點：' + location +
                  '\n入庫日期：' + (entryDate instanceof Date && !isNaN(entryDate) ? Utilities.formatDate(entryDate, TIMEZONE, DATE_FORMAT) : entryDate) +
                  '\n到期日：' + Utilities.formatDate(expiry, TIMEZONE, DATE_FORMAT) +
                  (note ? '\n備註：' + note : '') +
                  "\n\n👉 [點我查看即時庫存狀態](" + webUrl + ")";
        try {
          sendToTelegramMarkdown(botToken, chatId, msg);
        } catch (e) {
          Logger.log("發送 Telegram 失敗：" + e);
        }

        // LINE Flex Message 資料組裝
        var lineItem = {
          name: name,
          quantity: quantity,
          location: location,
          entryDate: (entryDate instanceof Date && !isNaN(entryDate)) ? Utilities.formatDate(entryDate, TIMEZONE, DATE_FORMAT) : entryDate,
          expiry: Utilities.formatDate(expiry, TIMEZONE, DATE_FORMAT),
          note: note
        };
        try {
          sendLineFlexMessage(lineUserId, lineItem, webUrl);
        } catch (e) {
          Logger.log("發送 LINE Messaging API 失敗：" + e);
        }
      }
    }
  }
}


/**
 * 支援 Markdown 的 Telegram 發送
 */
function sendToTelegramMarkdown(botToken, chatId, message) {
  var url = "https://api.telegram.org/bot" + botToken + "/sendMessage";
  var payload = {
    chat_id: chatId,
    text: message,
    parse_mode: "Markdown"
  };
  var options = {
    "method": "post",
    "contentType": "application/json",
    "payload": JSON.stringify(payload)
  };
  UrlFetchApp.fetch(url, options);
}

/**
 * 自動更新到期倒數日（G欄，第7欄）
 */
function updateExpiryCountdown() {
  var SHEET_NAME = 'stock';
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) {
    Logger.log("找不到名稱為『" + SHEET_NAME + "』的工作表，請確認分頁名稱！");
    return;
  }
  var data = sheet.getDataRange().getValues();
  var today = new Date();
  today.setHours(0,0,0,0);

  for (var i = 1; i < data.length; i++) { // 跳過標題
    var expiry = data[i][5];
    if (expiry instanceof Date && !isNaN(expiry)) {
      expiry.setHours(0,0,0,0);
      var diff = Math.ceil((expiry - today) / (1000 * 3600 * 24));
      sheet.getRange(i + 1, 7).setValue(diff); // G欄，到期倒數日
    } else {
      sheet.getRange(i + 1, 7).setValue(""); // 若無到期日則清空
    }
  }
  Logger.log("到期倒數日已自動更新。");
}

/**
 * 當到期日欄位被編輯時自動更新倒數日
 */
function onEdit(e) {
  var SHEET_NAME = 'stock';
  var sheet = e.range.getSheet();
  if (sheet.getName() !== SHEET_NAME) return; // 只針對 stock 分頁

  var col = e.range.getColumn();
  var row = e.range.getRow();

  // 假設到期日在第6欄（F欄）
  if (col === 6 && row > 1) { // 排除標題列
    var expiry = sheet.getRange(row, 6).getValue();
    var today = new Date();
    today.setHours(0,0,0,0);
    var diff = "";

    if (expiry instanceof Date && !isNaN(expiry)) {
      expiry.setHours(0,0,0,0);
      diff = Math.ceil((expiry - today) / (1000 * 3600 * 24));
    }
    sheet.getRange(row, 7).setValue(diff); // G欄
  }
}
