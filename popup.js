document.addEventListener('DOMContentLoaded', function() {
  chrome.storage.sync.get(['githubToken', 'gistId'], function(items) {
    document.getElementById('githubToken').value = items.githubToken || '';
    document.getElementById('gistId').value = items.gistId || '';
  });

  // 显示上次同步时间
  chrome.storage.local.get('lastSyncTime', function(data) {
    if (data.lastSyncTime) {
      document.getElementById('status').textContent = '上次同步时间: ' + new Date(data.lastSyncTime).toLocaleString();
    }
  });
});

document.getElementById('saveButton').addEventListener('click', function() {
  var githubToken = document.getElementById('githubToken').value;
  var gistId = document.getElementById('gistId').value;

  chrome.storage.sync.set({
    githubToken: githubToken,
    gistId: gistId
  }, function() {
    document.getElementById('status').textContent = '设置已保存';
  });
});

document.getElementById('uploadButton').addEventListener('click', function() {
  chrome.runtime.sendMessage({action: "uploadHistory"}, function(response) {
    document.getElementById('status').textContent = response.message;
  });
});

document.getElementById('downloadButton').addEventListener('click', function() {
  chrome.runtime.sendMessage({action: "downloadHistory"}, function(response) {
    document.getElementById('status').textContent = response.message;
  });
});