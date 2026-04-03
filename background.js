//同步本地存储
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
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.type === "exportConfig") {
        try {
            const res = await chrome.storage.local.get(["blockWords", "blockUps"]);
            
            const config = {
                blockWords: res.blockWords || [],
                blockUps: res.blockUps || []
            };

            //生成下载链接
            const jsonStr = JSON.stringify(config, null, 2);
            const url = "data:application/json;charset=utf-8," + encodeURIComponent(jsonStr);

            //下载
            chrome.downloads.download({
                url: url,
                filename: "bilibili-block-config.json",
                saveAs: true 
            }, (downloadId) => {
                sendResponse({ success: true, downloadId: downloadId });
                console.log("✅ 配置导出成功，下载ID:", downloadId);
            });
            return true; 
        } catch (error) {
            sendResponse({ success: false, error: error.message });
            return true;
        }
    }
});