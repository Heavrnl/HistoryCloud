chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "uploadHistory") {
    uploadHistory(sendResponse);
  } else if (request.action === "downloadHistory") {
    downloadHistory(sendResponse);
  }
  return true; // 保持消息通道开放以进行异步响应
});

function uploadHistory(sendResponse) {
  chrome.storage.sync.get(['githubToken', 'gistId'], function(items) {
    if (!items.githubToken || !items.gistId) {
      sendResponse({message: 'GitHub Token或Gist ID未设置'});
      return;
    }

    chrome.history.search({text: '', maxResults: 0}, function(historyItems) {
      let historyData = historyItems.map(item => ({
        lastVisitTime: item.lastVisitTime,
        title: item.title,
        url: item.url
      }));

      fetch(`https://api.github.com/gists/${items.gistId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `token ${items.githubToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          files: {
            'browser_history.json': {
              content: JSON.stringify(historyData)
            }
          }
        })
      })
      .then(response => response.json())
      .then(data => {
        chrome.storage.local.set({lastSyncTime: Date.now()});
        sendResponse({message: '历史记录已上传到Gist'});
      })
      .catch(error => sendResponse({message: '上传失败: ' + error.message}));
    });
  });
}

function downloadHistory(sendResponse) {
  chrome.storage.sync.get(['githubToken', 'gistId'], function(items) {
    if (!items.githubToken || !items.gistId) {
      sendResponse({message: 'GitHub Token或Gist ID未设置'});
      return;
    }

    fetch(`https://api.github.com/gists/${items.gistId}`, {
      headers: {
        'Authorization': `token ${items.githubToken}`
      }
    })
    .then(response => response.json())
    .then(data => {
      if (!data.files['browser_history.json']) {
        sendResponse({message: 'Gist中没有历史记录文件'});
        return;
      }
      let historyData = JSON.parse(data.files['browser_history.json'].content);
      historyData.forEach(item => {
        chrome.history.addUrl({
          url: item.url,
          visitTime: item.lastVisitTime
        });
      });
      chrome.storage.local.set({lastSyncTime: Date.now()});
      sendResponse({message: '历史记录已从Gist下载并更新'});
    })
    .catch(error => sendResponse({message: '下载失败: ' + error.message}));
  });
}