const CARD_SELECTOR = ".bili-video-card, .feed-card";
const BLOCK_BTN_SELECTOR = "button[data-v-8b105adf].primary-btn.roll-btn";

//本地同步
let blockWords = [];
let blockUps = [];

function syncConfig() {
  chrome.storage.local.get(["blockWords", "blockUps"], res => {
    blockWords = res.blockWords || [];
    blockUps = res.blockUps || [];
    console.log("[屏蔽助手] 已加载配置:", { blockWords, blockUps });
  });
}

// 正则检测
function isBlocked(text) {
  if (!text) return false;
  return blockWords.some(word => text.includes(word)) || blockUps.some(up => text.includes(up));
}

// 模拟点击
function simulateMouseClick(element) {
  if (!element) return;
  const rect = element.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;

  const mouseDown = new MouseEvent("mousedown", { bubbles: true, cancelable: true, view: window, clientX: x, clientY: y });
  const mouseUp = new MouseEvent("mouseup", { bubbles: true, cancelable: true, view: window, clientX: x, clientY: y });
  const click = new MouseEvent("click", { bubbles: true, cancelable: true, view: window, clientX: x, clientY: y });

  element.dispatchEvent(mouseDown);
  element.dispatchEvent(mouseUp);
  element.dispatchEvent(click);
  console.log("[屏蔽助手] 已点击'换一换'");
}

// 执行屏蔽逻辑
function blockVideos() {
  syncConfig();
  const cards = document.querySelectorAll(CARD_SELECTOR);
  
  cards.forEach(card => {
    const text = card.innerText || "";
    if (isBlocked(text)) {
      console.log("[屏蔽助手] 发现目标:", text.slice(0, 30));
      // 先在卡片内精确定位按钮容器
      const btnContainer = card.querySelector(".feed-roll-btn, .feed-roll-btn_xs");
      let targetBtn = null;
      
      if (btnContainer) {
        targetBtn = btnContainer.querySelector(BLOCK_BTN_SELECTOR);
      } else {
        // 备用：全局查找按钮
        targetBtn = document.querySelector(BLOCK_BTN_SELECTOR);
      }
      
      if (targetBtn && !targetBtn.disabled) {
        simulateMouseClick(targetBtn);
      } else {
        console.log("[屏蔽助手] 未找到'换一换'");
      }
    }
  });
}
//启动检测
setTimeout(() => {
  syncConfig();
  blockVideos();
  // 监听页面动态加载
  const observer = new MutationObserver(blockVideos);
  observer.observe(document.body, { childList: true, subtree: true });
  console.log("[屏蔽助手] 已启动");
}, 2500); 