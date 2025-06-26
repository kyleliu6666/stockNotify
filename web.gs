/**
 * 主程式：顯示庫存網頁
 */
function doGet() {
  return HtmlService.createHtmlOutputFromFile('stock_page')
    .setTitle('庫存狀態查詢')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * 取得庫存資料（給前端AJAX呼叫）
 */
function getStockData() {
  var SHEET_NAME = 'stock';
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) return [];

  var data = sheet.getDataRange().getValues();
  var result = [];
  var today = new Date();
  today.setHours(0,0,0,0);

  for (var i = 1; i < data.length; i++) { // 跳過標題
    var item = data[i];
    var expiry = item[5];
    var expiryStr = '';
    var countdown = '';
    if (expiry instanceof Date && !isNaN(expiry)) {
      expiry.setHours(0,0,0,0);
      expiryStr = Utilities.formatDate(expiry, "GMT+8", "yyyy/MM/dd");
      countdown = Math.ceil((expiry - today) / (1000 * 3600 * 24));
    }
    result.push({
      name: item[0],
      quantity: item[1] + (item[2] ? item[2] : ""),
      location: item[3],
      entryDate: (item[4] instanceof Date && !isNaN(item[4])) ?
        Utilities.formatDate(item[4], "GMT+8", "yyyy/MM/dd") : item[4],
      expiry: expiryStr,
      countdown: countdown,
      note: item[7] || ''
    });
  }
  return result;
}
