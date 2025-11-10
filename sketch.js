/*
By Okazz - 基礎側邊欄功能
並結合 P5.js 視覺詩歌效果背景 (文字已更新)
已新增：在背景右下角放置圖片的功能。
*/

// --- 側邊選單動畫變數 (保留) ---
let sidebar; // DOM 元素容器
let sidebarWidth = 300; // 側邊欄寬度（px）
let sidebarX = -sidebarWidth; // 目前 X 位置（用於動畫）
let sidebarTargetX = -sidebarWidth; // 目標 X
let sidebarOpen = false;

// --- Iframe 變數 (保留) ---
let iframeContainer; 
let contentIframe; 
let closeButton; 
let sidebarOverlay; 
let isIframeVisible = false; 

// --- 視覺詩歌背景變數 (保留) ---
let page;
let strips = [];
let num = 1; 
let offset = 0;
let toff = 0;
let tilt = 0;
let ttilt = 0;
let shadows = true;
let colors = ['#ff88be', '#FE8074', '#ffeea8', '#a1f3ed', '#3083DC', '#9fa3e3']; 

// --- 圖片變數 (新增) ---
let userImage; // 儲存載入的圖片
const IMAGE_FILENAME = 'background_image.png'; // *** 請確保您的圖片檔案名稱是這個，或修改此處 ***
const IMAGE_SIZE = 150; // 圖片顯示寬度 (px)

// ----------------------------------------------------------------------
// PRELOAD 函數 (載入圖片)
// ----------------------------------------------------------------------
function preload() {
    // 嘗試載入圖片，如果檔案不存在，可能會報錯，但程式碼會繼續執行
    try {
        userImage = loadImage(IMAGE_FILENAME);
    } catch (e) {
        console.warn(`圖片載入失敗：找不到檔案 ${IMAGE_FILENAME} 或格式錯誤。`);
        userImage = null; // 確保在載入失敗時，變數是 null
    }
}

// ----------------------------------------------------------------------
// SETUP 函數
// ----------------------------------------------------------------------
function setup() {
    createCanvas(windowWidth, windowHeight); 
    page = createGraphics(floor(height * 0.95), floor(height * 0.95));
    makeStrips();
    rectMode(CENTER);
    colorMode(HSB, 360, 100, 100, 100);
    
    createIframe(); 
    createSidebarMenu();
    updateIframeSizeAndPosition(); 
}

// ----------------------------------------------------------------------
// Iframe 相關功能 (保持不變)
// ----------------------------------------------------------------------

function createIframe() {
    // 1. 建立 Iframe 容器 (負責 Iframe 本體和邊框)
    iframeContainer = createDiv();
    iframeContainer.id('iframe-container');
    iframeContainer.parent(document.body);
    iframeContainer.style('position', 'fixed');
    iframeContainer.style('top', '50%');
    iframeContainer.style('left', '50%');
    iframeContainer.style('transform', 'translate(-50%, -50%)'); // 居中對齊
    iframeContainer.style('border', '4px solid #3083DC'); 
    iframeContainer.style('border-radius', '12px');
    iframeContainer.style('box-shadow', '0 8px 30px rgba(0,0,0,0.4)');
    iframeContainer.style('z-index', '10002'); // Iframe 容器設為最高 Z-Index
    iframeContainer.style('display', 'none'); 
    iframeContainer.style('overflow', 'hidden'); 

    // 2. 建立 Iframe 元素本身
    contentIframe = createElement('iframe');
    contentIframe.id('content-iframe');
    contentIframe.parent(iframeContainer); // 放在容器內
    contentIframe.style('width', '100%'); // 佔滿容器
    contentIframe.style('height', '100%'); // 佔滿容器
    contentIframe.style('border', 'none');
    contentIframe.attribute('allowfullscreen', ''); 

    // 3. 建立關閉按鈕 (獨立於 Iframe 容器)
    closeButton = createButton('✕'); 
    closeButton.parent(document.body); 
    closeButton.style('position', 'fixed');
    closeButton.style('background', '#3083DC');
    closeButton.style('color', 'white');
    closeButton.style('border', 'none');
    closeButton.style('border-radius', '50%');
    closeButton.style('width', '30px');
    closeButton.style('height', '30px');
    closeButton.style('font-size', '18px');
    closeButton.style('line-height', '1');
    closeButton.style('text-align', 'center');
    closeButton.style('cursor', 'pointer');
    closeButton.style('z-index', '10003'); // 確保按鈕在 Iframe 容器之上
    closeButton.style('display', 'none');

    // 綁定關閉事件
    closeButton.mousePressed(hideIframe);
}

function updateIframeSizeAndPosition() {
    if (iframeContainer) {
        let iframeW = windowWidth * 0.7; 
        let iframeH = windowHeight * 0.8; 
        
        iframeContainer.style('width', iframeW + 'px');
        iframeContainer.style('height', iframeH + 'px');

        // 調整關閉按鈕的位置
        if (closeButton) {
            let containerX = windowWidth * 0.5;
            let containerY = windowHeight * 0.5;
            
            let offset = 8;
            closeButton.style('left', (containerX + iframeW / 2 - 15 + offset) + 'px'); 
            closeButton.style('top', (containerY - iframeH / 2 - 15 - offset) + 'px'); 
        }
    }
}

function showIframe(url) {
    if (iframeContainer && contentIframe && closeButton) {
        contentIframe.attribute('src', url);
        iframeContainer.style('display', 'block');
        closeButton.style('display', 'block'); 
        isIframeVisible = true;
        sidebarTargetX = -sidebarWidth; 
        sidebarOpen = false;
    }
}

function hideIframe() {
    if (iframeContainer && contentIframe && closeButton) {
        iframeContainer.style('display', 'none');
        closeButton.style('display', 'none'); 
        contentIframe.attribute('src', 'about:blank'); 
        isIframeVisible = false;
    }
}

// ----------------------------------------------------------------------
// DRAW 函數 (新增圖片繪製邏輯)
// ----------------------------------------------------------------------
function draw() {
    // I. 視覺詩歌背景繪製
    offset = lerp(offset, toff, 0.1);
    tilt = lerp(tilt, ttilt, 0.2);
    background('ivory');
    imageMode(CENTER);
    
    // ... [背景動畫繪製邏輯] ...
    for (let s of strips) {
        s.a = tilt * (0.5 - noise(frameCount / 60 + s.y / 300));
    }
    
    if (shadows) {
        for (let s of strips) {
            push();
            translate(s.x + offset * (0.5 - noise(frameCount / 180 + s.y / 50)), s.y);
            rotate(s.a);
            fill(0, 180); 
            rect(4, 4, s.img.width, s.img.height); 
            pop();
        }
        filter(BLUR, 2);
    }
    
    for (let s of strips) {
        push();
        translate(s.x + offset * (0.5 - noise(frameCount / 180 + s.y / 50)), s.y);
        rotate(s.a);
        image(s.img, 0, 0);
        pop();
    }
    
    // *** III. 繪製右下角圖片 (新增) ***
    if (userImage) {
        // 保持圖片的寬高比
        let ratio = userImage.height / userImage.width;
        let imgW = IMAGE_SIZE;
        let imgH = imgW * ratio;
        let padding = 30; // 距離邊緣的距離
        
        // 計算圖片左上角坐標，使其位於右下角
        let imgX = width - imgW - padding;
        let imgY = height - imgH - padding;
        
        // 繪製圖片 (使用 CORNER 模式繪製，坐標是左上角)
        imageMode(CORNER); 
        image(userImage, imgX, imgY, imgW, imgH);
    }


    // II. 側邊選單緩動動畫

    let pointerX = (typeof touches !== 'undefined' && touches.length > 0) ? touches[0].x : mouseX;
    if (pointerX === undefined) pointerX = windowWidth + 1; 

    // 如果 Iframe 顯示中，強制收起側邊欄，且不允許滑鼠開啟
    if (isIframeVisible) {
         sidebarTargetX = -sidebarWidth; 
         sidebarOpen = false;
    } else {
        // Iframe 沒有顯示，正常處理滑鼠靠近邊緣的邏輯
        if (pointerX <= 100) {
            sidebarTargetX = 0; // 顯示
            sidebarOpen = true;
        } else {
            sidebarTargetX = -sidebarWidth; // 隱藏
            sidebarOpen = false;
        }
    }
    
    // 緩動動畫
    sidebarX = lerp(sidebarX, sidebarTargetX, 0.18);
    if (sidebar) {
        sidebar.style('transform', 'translateX(' + sidebarX + 'px)');
    }
}


// ----------------------------------------------------------------------
// 視覺詩歌功能函數 (保留)
// ----------------------------------------------------------------------
function makeStrips() {
  page.background('ivory');
  page.fill(0);
  
  // 調整字體大小：從 height / 4 縮小到 page.height / 8
  page.textSize(page.height / 8); 
  
  page.textAlign(CENTER, CENTER);
  // 由於有四行文字，我們將 y 座標平均分配
  page.text('412730243', page.width / 2, page.height * 1 / 8);
  page.text('林子綺', page.width / 2, page.height * 3 / 8);
  page.text('412730243', page.width / 2, page.height * 5 / 8);
  page.text('林子綺', page.width / 2, page.height * 7 / 8);
  
  rectMode(CENTER);
  strips = [];
  for (let i = 0; i < num; i++) {
    let y = i * page.height / num;
    let strip = page.get(0, y, page.width, floor(page.height / num));
    strips.push({
      x: width / 2,
      y: y + page.height / (2 * num) + (height / 2 - page.height / 2),
      img: strip,
      a: 0 
    });
  }
}

function mouseMoved() {
  if(num==1) {
    num=40;
    makeStrips();
  }
  toff = map(mouseX, width / 8, 7 * width / 8, -height, height, true);
  if (abs(toff) < height / 8) {
    toff = 0;
  }
  ttilt = map(mouseY, height / 8, 7 * height / 8, 0, PI / 4, true);
}

function mousePressed() {
  num = floor(random(20, 120));
  makeStrips();
}

function keyPressed(){
    if(isIframeVisible) return; 
  shadows = !shadows;
}

// ----------------------------------------------------------------------
// 視窗大小調整函數 (保留)
// ----------------------------------------------------------------------
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    
    page = createGraphics(floor(height * 0.95), floor(height * 0.95));
    makeStrips();
    
    // 調整 Iframe 大小和按鈕位置
    updateIframeSizeAndPosition();

    sidebarWidth = min(360, floor(windowWidth * 0.75));
    if (sidebar) {
        sidebarX = sidebarOpen ? 0 : -sidebarWidth;
        sidebarTargetX = sidebarX;
        sidebar.style('width', sidebarWidth + 'px');
        sidebar.style('transform', 'translateX(' + sidebarX + 'px)');
    }
}


// ----------------------------------------------------------------------
// 側邊選單 DOM 建立函數 (保留)
// ----------------------------------------------------------------------
function createSidebarMenu() {
    // ... [側邊欄容器建立邏輯 - 保持不變] ...
    sidebar = createDiv();
    sidebar.id('hidden-sidebar');
    sidebar.parent(document.body);
    sidebar.style('position', 'fixed');
    sidebar.style('left', '0');
    sidebar.style('top', '0');
    sidebar.style('height', '100%');
    sidebar.style('width', sidebarWidth + 'px');
    sidebar.style('background', 'rgba(255,255,255,0.98)');
    sidebar.style('box-shadow', '4px 0 18px rgba(0,0,0,0.12)');
    sidebar.style('z-index', '10000'); 
    sidebar.style('padding', '36px 20px');
    sidebar.style('box-sizing', 'border-box');
    sidebar.style('transform', 'translateX(' + (-sidebarWidth) + 'px)'); 
    sidebar.style('transition', 'none'); 
    sidebar.style('display', 'flex');
    sidebar.style('flex-direction', 'column');
    sidebar.style('align-items', 'flex-start');

    let title = createDiv('選單');
    title.parent(sidebar);
    title.style('font-size', '20px');
    title.style('margin-bottom', '18px');
    title.style('font-weight', '700');

    // 選單項目（四個）
    const items = [
        { label: '第一單元作品', href: 'https://lzc0902283883-code.github.io/20251020/', isAction: true }, 
        { label: '第一單元筆記', href: 'https://hackmd.io/@uvgqibw8Rai7A3fzLILiPQ/BJix5VCoxx', isAction: true },
        { label: '測驗系統', href: 'https://lzc0902283883-code.github.io/20251103/', isAction: true },
        { label: '回到首頁', href: '#' }
    ];

    items.forEach(it => {
        let a = createA(it.href, it.label);
        a.parent(sidebar);
        a.style('text-decoration', 'none');
        a.style('color', '#222');
        a.style('font-size', '32px');
        a.style('padding', '12px 6px');
        a.style('display', 'block');
        a.style('width', '100%');
        a.style('box-sizing', 'border-box');
        a.style('border-radius', '6px');
        a.mouseOver(() => a.style('background', 'rgba(0,0,0,0.04)'));
        a.mouseOut(() => a.style('background', 'transparent'));
        
        // 如果是 Action 項目，則綁定 showIframe
        if (it.isAction) {
            a.attribute('href', '#'); 
            a.mousePressed((event) => {
                event.preventDefault(); 
                showIframe(it.href);
            });
        }
    });

    // 遮罩層 (現在只用於側邊欄打開時)
    sidebarOverlay = createDiv(); // 使用全域變數
    sidebarOverlay.parent(document.body);
    sidebarOverlay.id('sidebar-overlay');
    sidebarOverlay.style('position', 'fixed');
    sidebarOverlay.style('left', '0');
    sidebarOverlay.style('top', '0');
    sidebarOverlay.style('width', '100%');
    sidebarOverlay.style('height', '100%');
    sidebarOverlay.style('z-index', '9999'); // 低於 Iframe (10002) 和按鈕 (10003)
    sidebarOverlay.style('background', 'transparent');
    sidebarOverlay.style('pointer-events', 'none'); 

    // 點擊遮罩時，只處理側邊欄關閉
    sidebarOverlay.mousePressed(() => {
        if (sidebarOpen) {
            sidebarTargetX = -sidebarWidth;
            sidebarOpen = false;
        } 
    });

    // 每一幀同步遮罩是否可點擊
    setInterval(() => {
        if (!sidebarOverlay.elt) return;
        
        if (sidebarX > -sidebarWidth + 2) {
            // 側邊欄打開時，啟用遮罩
            sidebarOverlay.style('pointer-events', 'auto');
            sidebarOverlay.style('background', 'rgba(0,0,0,0.18)'); 
        } else {
            // Iframe 顯示時和正常狀態，遮罩必須完全透明且不攔截事件
            sidebarOverlay.style('pointer-events', 'none');
            sidebarOverlay.style('background', 'transparent');
        }
    }, 120);
}