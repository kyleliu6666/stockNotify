/**
 * 發送 LINE Messaging API Flex Message
 */
function sendLineFlexMessage(userId, item, webUrl) {
  var CHANNEL_ACCESS_TOKEN = line_channel_access_token;
  var url = 'https://api.line.me/v2/bot/message/push';
  var payload = {
    to: userId,
    messages: [
      {
        "type": "flex",
        "altText": "庫存到期提醒",
        "contents": {
          "type": "bubble",
          "body": {
            "type": "box",
            "layout": "vertical",
            "contents": [
              { "type": "text", "text": "庫存到期提醒", "weight": "bold", "size": "lg", "color": "#D32F2F" },
              { "type": "separator", "margin": "md" },
              { "type": "text", "text": "物品：" + item.name, "margin": "md" },
              { "type": "text", "text": "數量：" + item.quantity, "margin": "sm" },
              { "type": "text", "text": "儲存地點：" + item.location, "margin": "sm" },
              { "type": "text", "text": "入庫日期：" + item.entryDate, "margin": "sm" },
              { "type": "text", "text": "到期日：" + item.expiry, "margin": "sm" },
              item.note ? { "type": "text", "text": "備註：" + item.note, "margin": "sm" } : null
            ].filter(Boolean)
          },
          "footer": {
            "type": "box",
            "layout": "vertical",
            "spacing": "sm",
            "contents": [
              {
                "type": "button",
                "style": "primary",
                "color": "#00796B",
                "action": {
                  "type": "uri",
                  "label": "即時庫存查詢",
                  "uri": webUrl
                }
              }
            ]
          }
        }
      }
    ]
  };
  var options = {
    "method" : "post",
    "contentType": "application/json",
    "headers": {
      "Authorization": "Bearer " + CHANNEL_ACCESS_TOKEN
    },
    "payload" : JSON.stringify(payload)
  };
  UrlFetchApp.fetch(url, options);
}


