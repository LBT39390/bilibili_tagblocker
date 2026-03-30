// 扩展安装/启动时，读取初始config.json并同步到本地存储
chrome.runtime.onInstalled.addListener(async () => {
  try {
    const response = await fetch(chrome.runtime.getURL('config.json'));
    const config = await response.json();
    await chrome.storage.local.set(config);
    console.log("✅ 已从config.json加载初始屏蔽配置");
  } catch (error) {
    console.error("❌ 读取初始配置文件失败:", error);
  }
});

// 处理来自popup的"导出配置"请求
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "exportConfig") {
    chrome.storage.local.get(["blockWords", "blockUps"], async (res) => {
      const config = {
        blockWords: res.blockWords || [],
        blockUps: res.blockUps || []
      };
      // Blob
      const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      // 下载
      chrome.downloads.download({
        url: url,
        filename: "bilibili-block-config.json",
        saveAs: true
      }, (downloadId) => {
        sendResponse({ success: true, downloadId });
      });
    });
    return true; 
  }
});