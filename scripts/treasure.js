document.addEventListener('DOMContentLoaded', function () {
  const statusElement = document.getElementById("status");
  const libraryImage = document.getElementById("library-img");
  const lockImage = document.getElementById("lock-img");
  const templeImage = document.getElementById("temple-img");
  const guardImage = document.getElementById("guard-img");
  const treasureImage = document.getElementById("treasure-img");
  const infoBox = document.getElementById("info-box");
  const infoTitle = document.getElementById("info-title");
  const infoContent = document.getElementById("info-content");
  const userAvatar = document.querySelector('.user-avatar');
  const userName = document.querySelector('.user-name');

  // 默认的游戏状态
  let clueObtained = false;  // 是否获得线索
  let decodingCompleted = false;  // 是否完成解码
  let taskFailed = false;  // 是否任务失败（遇到守卫）
  let treasureFound = false;  // 是否找到宝藏

  // 检查 localStorage 中是否有玩家信息
  let player = JSON.parse(localStorage.getItem('player'));

  if (player) {
    // 恢复玩家信息
    document.body.style.overflow = 'auto';  // 允许滚动
    document.getElementById('login-modal').style.display = 'none';  // 隐藏登录框
    updateStatus(`欢迎回来，${player.username}！`);

    // 恢复游戏历史
    clueObtained = player.clueObtained;
    decodingCompleted = player.decodingCompleted;
    taskFailed = player.taskFailed;
    treasureFound = player.treasureFound;

    // 更新用户信息展示部分
    if (player.avatar) {
      userAvatar.src = player.avatar;  // 更新用户头像
    }
    userName.textContent = player.username;  // 更新用户名

    if (clueObtained) {
      loadInfo("./data/1.txt", "图书馆");
    }
    if (decodingCompleted) {
      lockImage.style.display = "block";
      templeImage.style.display = "block";
    }
    if (taskFailed) {
      guardImage.style.display = "block";
      treasureImage.style.display = "none";  // 游戏失败时宝藏不显示
      updateStatus("任务失败，您被守卫抓住了...");
    }
    if (treasureFound) {
      treasureImage.style.display = "block";  // 如果已经找到宝藏，显示宝藏图片
      updateStatus("恭喜你，成功找到了宝藏!");
    }
  }

  // 更新状态的异步函数
  async function updateStatus(message) {
    statusElement.textContent = message;
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // 加载txt文件数据并显示在信息框内
  async function loadInfo(filePath, title) {
    try {
      const response = await fetch(filePath);
      if (response.ok) {
        const text = await response.text();
        infoTitle.textContent = title;
        infoContent.textContent = text;
      } else {
        infoTitle.textContent = "无法加载信息";
        infoContent.textContent = "无法加载详细信息...";
      }
    } catch (error) {
      infoTitle.textContent = "加载失败";
      infoContent.textContent = "加载失败: " + error.message;
    }
  }

  // 登录表单提交事件
  document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();  // 阻止默认表单提交
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // 简单的登录验证（这里只是一个示范，实际应该更复杂）
    if (username && password) {
      // 创建玩家对象并保存到 localStorage
      player = {
        username: username,
        playerId: Date.now(),  // 用当前时间戳作为玩家ID
        clueObtained: false,  // 初始时没有获得线索
        decodingCompleted: false,  // 初始时没有完成解码
        taskFailed: false,  // 初始时没有任务失败
        treasureFound: false,  // 初始时没有找到宝藏
        avatar: './images/default-avatar.png'  // 默认头像路径
      };
      
      // 保存玩家信息到 localStorage
      localStorage.setItem('player', JSON.stringify(player));

      document.getElementById('login-modal').style.display = 'none';  // 隐藏登录框
      document.body.style.overflow = 'auto';  // 允许滚动，避免登录框遮挡内容
      updateStatus(`欢迎，${username}！游戏即将开始。`);

      // 更新用户信息展示部分
      userAvatar.src = player.avatar;  // 更新用户头像
      userName.textContent = player.username;  // 更新用户名
    } else {
      alert('请输入用户名和密码！');
    }
  });

  // 点击图书馆获取线索并显示详细信息
  libraryImage.addEventListener("click", async () => {
    if (!clueObtained) {
      clueObtained = true;
      player.clueObtained = true;  // 更新玩家的线索状态
      localStorage.setItem('player', JSON.stringify(player));  // 保存到 localStorage
      await updateStatus("在古老的图书馆里找到了第一个线索...");
      loadInfo("./data/1.txt", "图书馆");
    }
  });

  // 点击密码锁进行解码
  lockImage.addEventListener("click", async () => {
    if (!clueObtained) {
      await updateStatus("没有线索可以解码!");
      loadInfo("./data/4.txt", "密码锁");
    } else {
      decodingCompleted = true;
      player.decodingCompleted = true;  // 更新解码状态
      localStorage.setItem('player', JSON.stringify(player));  // 保存到 localStorage
      await updateStatus("解码成功!宝藏在一座古老的神庙中...");
      templeImage.style.display = "block";  // 显示神庙图片
      loadInfo("./data/2.txt", "神庙");
    }
  });

  // 点击神庙图片，根据随机结果触发事件
  templeImage.addEventListener("click", async () => {
    if (!decodingCompleted) {
      await updateStatus("没有解码成功，无法进入神庙!");
      return;
    }

    const randomOutcome = Math.random(); // 0到1之间的随机数

    if (randomOutcome < 0.4) {
      taskFailed = true;
      player.taskFailed = true;  // 更新任务失败状态
      localStorage.setItem('player', JSON.stringify(player));  // 保存到 localStorage
      await updateStatus("糟糕!遇到了神庙守卫!");
      guardImage.style.display = "block"; // 显示守卫图片
      loadInfo("./data/3.txt", "守卫");
      await updateStatus("任务失败。");
    } else {
      // 如果没有失败，找到宝藏
      treasureFound = true;
      player.treasureFound = true;  // 更新宝藏状态
      localStorage.setItem('player', JSON.stringify(player));  // 保存到 localStorage
      await updateStatus("找到了一个神秘的箱子...");
      treasureImage.style.display = "block"; // 显示宝藏图片
      await updateStatus("恭喜你，成功找到了宝藏!");
    }
  });
});
