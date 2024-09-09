document.addEventListener('DOMContentLoaded', function() {
  chrome.storage.sync.get(['githubToken', 'gistId', 'syncInterval'], function(items) {
    document.getElementById('githubToken').value = items.githubToken || '';
    document.getElementById('gistId').value = items.gistId || '';
    document.getElementById('syncInterval').value = items.syncInterval || 60;
  });
});

document.getElementById('saveButton').addEventListener('click', function() {
  var githubToken = document.getElementById('githubToken').value;
  var gistId = document.getElementById('gistId').value;
  var syncInterval = parseInt(document.getElementById('syncInterval').value);

  chrome.storage.sync.set({
    githubToken: githubToken,
    gistId: gistId,
    syncInterval: syncInterval
  }, function() {
    document.getElementById('status').textContent = '设置已保存';
    chrome.runtime.sendMessage({action: "updateAlarm"});
  });
});