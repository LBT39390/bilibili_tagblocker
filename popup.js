// 加载当前配置并渲染列表
function loadConfig() {
  chrome.storage.local.get(["blockWords", "blockUps"], res => {
    renderList("wordList", res.blockWords || [], "word");
    renderList("upList", res.blockUps || [], "up");
  });
}

// 渲染屏蔽词/UP主列表
function renderList(domId, data, type) {
  const dom = document.getElementById(domId);
  dom.innerHTML = "";
  data.forEach(item => {
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.innerHTML = `${item} <span class="del" data-type="${type}" data-val="${item}">×</span>`;
    dom.appendChild(tag);
  });

  // 绑定删除事件
  document.querySelectorAll(".del").forEach(el => {
    el.onclick = () => {
      const type = el.dataset.type;
      const val = el.dataset.val;
      chrome.storage.local.get(type === "word" ? "blockWords" : "blockUps", res => {
        const list = (res[type === "word" ? "blockWords" : "blockUps"] || []).filter(i => i !== val);
        chrome.storage.local.set({[type === "word" ? "blockWords" : "blockUps"]: list}, loadConfig);
      });
    };
  });
}

// 添加标题屏蔽词
document.getElementById("addWord").onclick = () => {
  const val = document.getElementById("wordInput").value.trim();
  if(!val) return;
  chrome.storage.local.get("blockWords", res => {
    const list = [...new Set([...(res.blockWords || []), val])];
    chrome.storage.local.set({blockWords: list}, () => {
      document.getElementById("wordInput").value = "";
      loadConfig();
    });
  });
};

// 添加UP主屏蔽
document.getElementById("addUp").onclick = () => {
  const val = document.getElementById("upInput").value.trim();
  if(!val) return;
  chrome.storage.local.get("blockUps", res => {
    const list = [...new Set([...(res.blockUps || []), val])];
    chrome.storage.local.set({blockUps: list}, () => {
      document.getElementById("upInput").value = "";
      loadConfig();
    });
  });
};

// 导出配置到文件
document.getElementById("exportBtn").onclick = () => {
  chrome.runtime.sendMessage({ type: "exportConfig" }, (res) => {
    res.success ? alert("✅ 配置已导出到下载文件夹") : alert("❌ 导出失败");
  });
};

// 导入配置文件
document.getElementById("importBtn").onclick = () => {
  document.getElementById("importInput").click();
};

document.getElementById("importInput").onchange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const config = JSON.parse(event.target.result);
      chrome.storage.local.set({
        blockWords: config.blockWords || [],
        blockUps: config.blockUps || []
      }, () => {
        loadConfig();
        alert("✅ 配置导入成功");
      });
    } catch (error) {
      alert("❌ 配置文件格式错误，请选择正确的JSON文件");
    }
  };
  reader.readAsText(file);
};

// 初始化加载
loadConfig();