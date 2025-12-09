const apiBase = '';
let currentUserId = null; // Get from localStorage or null
let currentUser = null; // Current logged-in user info
let state = { lang: 'zh', cart: [], currentDish: null };
let cache = { dishes: {} };

// Restore user info from localStorage
function loadUserFromStorage() {
  const saved = localStorage.getItem('currentUser');
  if (saved) {
    try {
      currentUser = JSON.parse(saved);
      currentUserId = currentUser.id;
      updateUserDisplay();
    } catch (e) {
      console.error('Error loading user from storage:', e);
      localStorage.removeItem('currentUser');
    }
  }
}

// Save user info to localStorage
function saveUserToStorage(user) {
  currentUser = user;
  currentUserId = user.id;
  localStorage.setItem('currentUser', JSON.stringify(user));
  updateUserDisplay();
}

// Clear user info
function clearUser() {
  currentUser = null;
  currentUserId = null;
  localStorage.removeItem('currentUser');
  updateUserDisplay();
  state.cart = [];
  renderCart();
}

// Update user display
function updateUserDisplay() {
  const usernameDisplay = document.getElementById('username-display');
  const loginBtn = document.getElementById('login-btn');
  const logoutBtn = document.getElementById('logout-btn');
  
  if (currentUser) {
    if (usernameDisplay) usernameDisplay.textContent = currentUser.username;
    if (loginBtn) loginBtn.classList.add('hidden');
    if (logoutBtn) logoutBtn.classList.remove('hidden');
  } else {
    if (usernameDisplay) usernameDisplay.textContent = t('not_logged_in');
    if (loginBtn) loginBtn.classList.remove('hidden');
    if (logoutBtn) logoutBtn.classList.add('hidden');
  }
}

// Dish name translation mapping
const dishTranslations = {
  "Fried Rice": { zh: "炒饭", en: "Fried Rice" },
  "Egg Fried Rice": { zh: "蛋炒饭", en: "Egg Fried Rice" },
  "Beef Noodles": { zh: "牛肉面", en: "Beef Noodles" },
  "Spicy Chicken": { zh: "辣子鸡", en: "Spicy Chicken" },
  "Sweet and Sour Pork": { zh: "糖醋里脊", en: "Sweet and Sour Pork" },
  "Mapo Tofu": { zh: "麻婆豆腐", en: "Mapo Tofu" },
  "Tomato Egg Stir-fry": { zh: "西红柿鸡蛋", en: "Tomato Egg Stir-fry" },
  "Dumplings": { zh: "饺子", en: "Dumplings" },
  "Beef Rice Bowl": { zh: "牛肉盖饭", en: "Beef Rice Bowl" },
  "Pork Rice Bowl": { zh: "猪肉盖饭", en: "Pork Rice Bowl" },
  "Chicken Rice Bowl": { zh: "鸡肉盖饭", en: "Chicken Rice Bowl" },
  "Cold Noodles": { zh: "凉面", en: "Cold Noodles" },
  "Hot Dry Noodles": { zh: "热干面", en: "Hot Dry Noodles" },
  "Fried Noodles": { zh: "炒面", en: "Fried Noodles" },
  "Fish Fillet Rice": { zh: "鱼片盖饭", en: "Fish Fillet Rice" },
  "Spicy Hot Pot": { zh: "麻辣烫", en: "Spicy Hot Pot" },
  "Curry Chicken Rice": { zh: "咖喱鸡饭", en: "Curry Chicken Rice" },
  "Curry Beef Rice": { zh: "咖喱牛肉饭", en: "Curry Beef Rice" },
  "Milk Tea": { zh: "奶茶", en: "Milk Tea" },
  "Fruit Tea": { zh: "水果茶", en: "Fruit Tea" },
  "Soy Milk": { zh: "豆浆", en: "Soy Milk" },
  "Youtiao": { zh: "油条", en: "Youtiao" },
  "Steamed Bun": { zh: "包子", en: "Steamed Bun" },
  "Pancake Roll": { zh: "煎饼", en: "Pancake Roll" },
  "BBQ Skewers": { zh: "烧烤串", en: "BBQ Skewers" },
  "Grilled Fish": { zh: "烤鱼", en: "Grilled Fish" },
  "Vegetable Salad": { zh: "蔬菜沙拉", en: "Vegetable Salad" },
  "Fruit Platter": { zh: "水果拼盘", en: "Fruit Platter" },
  "Cake Slice": { zh: "蛋糕", en: "Cake Slice" },
  "Ice Cream": { zh: "冰淇淋", en: "Ice Cream" },
  // New dishes for South Canteen translations
  "Braised Pork Belly": { zh: "红烧肉", en: "Braised Pork Belly" },
  "Kung Pao Chicken": { zh: "宫保鸡丁", en: "Kung Pao Chicken" },
  "Szechuan Fish": { zh: "水煮鱼", en: "Szechuan Fish" },
  "Steamed Egg Custard": { zh: "蒸蛋羹", en: "Steamed Egg Custard" },
  "Wonton Soup": { zh: "馄饨汤", en: "Wonton Soup" },
  "Pork Ribs Soup": { zh: "排骨汤", en: "Pork Ribs Soup" },
  "Stir-fried Green Beans": { zh: "炒豆角", en: "Stir-fried Green Beans" },
  "Eggplant with Garlic": { zh: "蒜蓉茄子", en: "Eggplant with Garlic" },
  "Braised Tofu": { zh: "红烧豆腐", en: "Braised Tofu" },
  "Fried Shrimp": { zh: "炸虾", en: "Fried Shrimp" },
  "Steamed Buns (Pork)": { zh: "猪肉包子", en: "Steamed Buns (Pork)" },
  "Steamed Buns (Vegetable)": { zh: "素菜包子", en: "Steamed Buns (Vegetable)" },
  "Scallion Pancake": { zh: "葱油饼", en: "Scallion Pancake" },
  "Congee with Pork": { zh: "猪肉粥", en: "Congee with Pork" },
  "Congee with Century Egg": { zh: "皮蛋粥", en: "Congee with Century Egg" },
  "BBQ Pork": { zh: "叉烧", en: "BBQ Pork" },
  "Grilled Lamb Skewers": { zh: "羊肉串", en: "Grilled Lamb Skewers" },
  "Grilled Squid": { zh: "烤鱿鱼", en: "Grilled Squid" },
  "Mango Pudding": { zh: "芒果布丁", en: "Mango Pudding" },
  "Red Bean Soup": { zh: "红豆汤", en: "Red Bean Soup" },
  "Sesame Balls": { zh: "芝麻球", en: "Sesame Balls" },
  "Taro Balls": { zh: "芋圆", en: "Taro Balls" },
  "Fresh Orange Juice": { zh: "鲜榨橙汁", en: "Fresh Orange Juice" },
  "Lemon Honey Tea": { zh: "柠檬蜂蜜茶", en: "Lemon Honey Tea" },
  "Iced Coffee": { zh: "冰咖啡", en: "Iced Coffee" },
  "Smoothie (Mixed Fruits)": { zh: "水果冰沙", en: "Smoothie (Mixed Fruits)" },
  "Bubble Tea (Taro)": { zh: "芋头奶茶", en: "Bubble Tea (Taro)" },
  "Green Tea": { zh: "绿茶", en: "Green Tea" },
  "Jasmine Tea": { zh: "茉莉花茶", en: "Jasmine Tea" },
  "Herbal Tea": { zh: "花草茶", en: "Herbal Tea" },
};

// Canteen name translation mapping
const canteenTranslations = {
  "Main Canteen": { zh: "主食堂", en: "Main Canteen" },
  "North Canteen": { zh: "北区食堂", en: "North Canteen" },
  "South Canteen": { zh: "南区食堂", en: "South Canteen" },
};

// Stall/category translation mapping
const categoryTranslations = {
  "Rice Stall 1": { zh: "米饭档口1", en: "Rice Stall 1" },
  "Rice Stall 2": { zh: "米饭档口2", en: "Rice Stall 2" },
  "Noodle Stall 1": { zh: "面条档口1", en: "Noodle Stall 1" },
  "Noodle Stall 2": { zh: "面条档口2", en: "Noodle Stall 2" },
  "Spicy Stall 1": { zh: "辣味档口1", en: "Spicy Stall 1" },
  "Spicy Stall 2": { zh: "辣味档口2", en: "Spicy Stall 2" },
  "Vegetarian Stall": { zh: "素食档口", en: "Vegetarian Stall" },
  "Dessert Stall 1": { zh: "甜品档口1", en: "Dessert Stall 1" },
  "Dessert Stall 2": { zh: "甜品档口2", en: "Dessert Stall 2" },
  "Drink Stall": { zh: "饮品档口", en: "Drink Stall" },
  "BBQ Stall 1": { zh: "烧烤档口1", en: "BBQ Stall 1" },
  "BBQ Stall 2": { zh: "烧烤档口2", en: "BBQ Stall 2" },
  "Soup Stall": { zh: "汤品档口", en: "Soup Stall" },
  "Western Stall": { zh: "西式档口", en: "Western Stall" },
  "Breakfast Stall 1": { zh: "早餐档口1", en: "Breakfast Stall 1" },
  "Breakfast Stall 2": { zh: "早餐档口2", en: "Breakfast Stall 2" },
  "Breakfast Stall 3": { zh: "早餐档口3", en: "Breakfast Stall 3" },
  "Snack Stall 1": { zh: "小食档口1", en: "Snack Stall 1" },
  "Snack Stall 2": { zh: "小食档口2", en: "Snack Stall 2" },
  "Fruit Stall": { zh: "水果档口", en: "Fruit Stall" },
  "Specialty Stall": { zh: "特色档口", en: "Specialty Stall" },
  "Rice Stall 3": { zh: "米饭档口3", en: "Rice Stall 3" },
  "Spicy Stall 3": { zh: "辣味档口3", en: "Spicy Stall 3" },
  "BBQ Stall 3": { zh: "烧烤档口3", en: "BBQ Stall 3" },
  "Dessert Stall 3": { zh: "甜品档口3", en: "Dessert Stall 3" },
};

// Translate dish name
function translateDishName(name) {
  if (!name) return name;
  const translation = dishTranslations[name];
  if (translation) {
    return translation[state.lang] || name;
  }
  return name;
}

// Translate category name
function translateCategory(category) {
  if (!category) return category;
  const translation = categoryTranslations[category];
  if (translation) {
    return translation[state.lang] || category;
  }
  return category;
}

// Translate canteen name
function translateCanteenName(name) {
  if (!name) return name;
  const translation = canteenTranslations[name];
  if (translation) {
    return translation[state.lang] || name;
  }
  return name;
}

const translations = {
  zh: {
    nav_menu: "浏览菜单", 
    nav_rec: "每日推荐", 
    nav_order: "我的订单",
    header_menu: "所有食堂", 
    header_canteen: "食堂列表", 
    header_cart: "购物车",
    select_hint: "请在左侧选择菜品查看详情", 
    ratings_title: "用户评价",
    btn_add: "加入订单", 
    btn_checkout: "去结算", 
    total: "合计",
    rec_title: "为您推荐", 
    no_orders: "暂无历史订单", 
    cart_empty: "购物车空空如也",
    loading: "加载中...", 
    submit_success: "订单提交成功！", 
    submit_fail: "提交失败：",
    chat_title: "点餐助手", 
    chat_placeholder: "想吃点什么...", 
    lang_btn: "English",
    user: "用户",
    no_canteens: "暂无食堂",
    no_stalls: "未找到档口",
    no_ratings: "暂无评分",
    no_recommendations: "暂无推荐",
    error_loading: "加载错误",
    category: "类别",
    price: "价格",
    score: "评分",
    thinking: "思考中…",
    error: "错误",
    submitting: "提交中...",
    general_stall: "综合档口",
    api_error: "API错误",
    no_response: "无响应",
    tab_today: "今日推荐",
    tab_week: "本周推荐",
    today: "今天",
    monday: "周一",
    tuesday: "周二",
    wednesday: "周三",
    thursday: "周四",
    friday: "周五",
    saturday: "周六",
    sunday: "周日",
    week_recommendations: "本周推荐菜单",
    customize_options: "定制选项",
    pay_now: "立即支付"
  },
  en: {
    nav_menu: "Menu", 
    nav_rec: "Recommendations", 
    nav_order: "Orders",
    header_menu: "All Canteens", 
    header_canteen: "Canteens", 
    header_cart: "Cart",
    select_hint: "Select a dish to view details", 
    ratings_title: "Reviews",
    btn_add: "Add to Order", 
    btn_checkout: "Checkout", 
    total: "Total",
    rec_title: "Recommended", 
    no_orders: "No past orders", 
    cart_empty: "Cart is empty",
    loading: "Loading...", 
    submit_success: "Order Placed!", 
    submit_fail: "Failed: ",
    chat_title: "Assistant", 
    chat_placeholder: "Ask me anything...", 
    lang_btn: "中文",
    user: "User",
    no_canteens: "No canteens found",
    no_stalls: "No stalls found",
    no_ratings: "No ratings yet",
    no_recommendations: "No recommendations",
    error_loading: "Error loading",
    category: "Category",
    price: "Price",
    score: "Score",
    thinking: "Thinking...",
    error: "Error",
    submitting: "Submitting...",
    general_stall: "General Stall",
    api_error: "API Error",
    no_response: "No response",
    tab_today: "Today",
    tab_week: "This Week",
    today: "Today",
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday",
    week_recommendations: "Weekly Recommendations",
    calories: "Calories",
    ingredients: "Ingredients",
    customize_options: "Customize Options",
    login: "Login",
    register: "Register",
    logout: "Logout",
    username: "Username",
    password: "Password",
    email: "Email",
    not_logged_in: "Not logged in",
    password_hint: "At least 6 characters",
    add_rating: "Add Rating",
    rating_score: "Rating",
    rating_comment: "Comment",
    submit_rating: "Submit Rating",
    login_success: "Login successful",
    register_success: "Registration successful",
    login_failed: "Login failed",
    register_failed: "Registration failed",
    please_login: "Please login first",
    rating_success: "Rating submitted successfully",
    rating_failed: "Failed to submit rating",
    pay_now: "Pay Now"
  }
};

// Get weekday name in Chinese/English
function getDayName(dayIndex, lang) {
  const days = {
    zh: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    en: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  };
  return days[lang][dayIndex];
}

// Get current weekday (0=Monday, 6=Sunday)
function getCurrentWeekday() {
  return new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
}

function t(key) { return translations[state.lang][key] || key; }

async function fetchJSON(url, options) {
  try {
    const res = await fetch(url, options);
  if (!res.ok) {
      let errorText = `HTTP ${res.status}`;
      try {
        const errorData = await res.json();
        if (errorData.detail) {
          errorText = errorData.detail;
        } else if (errorData.message) {
          errorText = errorData.message;
        }
      } catch {
        try {
          errorText = await res.text();
        } catch {
          errorText = `HTTP ${res.status} ${res.statusText}`;
        }
      }
      const error = new Error(errorText);
      error.status = res.status;
      throw error;
    }
    return await res.json();
  } catch (e) { 
    console.error('fetchJSON error:', e);
    throw e; 
  }
}

function updateUI() {
  // Update all elements with data-i18n attribute, including hidden ones
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (key && translations[state.lang] && translations[state.lang][key]) {
      // If it's a title element, special handling (may contain required mark)
      if (el.tagName === 'H5' && el.querySelector('span[style*="color:red"]')) {
        // Preserve required mark
        const requiredMark = el.querySelector('span[style*="color:red"]');
        const markHTML = requiredMark ? requiredMark.outerHTML : '';
        el.innerHTML = t(key) + markHTML;
    } else {
        // Directly update text content
        el.textContent = t(key);
      }
    }
  });
  const langLabel = document.getElementById('lang-label');
  if (langLabel) langLabel.textContent = t('lang_btn');
  const chatInput = document.getElementById('chat-input');
  if (chatInput) chatInput.placeholder = t('chat_placeholder');
  updateUserDisplay();
  renderCart();
  if (!state.currentDish) {
    const emptyStateP = document.querySelector('#dish-empty-state p');
    if (emptyStateP) {
      emptyStateP.innerHTML = t('select_hint').replace('查看详情', '<br>查看详情').replace('view details', '<br>view details');
    }
  }
  // Update HTML lang attribute
  document.documentElement.lang = state.lang === 'zh' ? 'zh-CN' : 'en';
}

function toggleLang() {
  state.lang = state.lang === 'zh' ? 'en' : 'zh';
  localStorage.setItem('lang', state.lang);
  
  // Force update customize options title (before updateUI)
  const customizeTitle = document.querySelector('h5[data-i18n="customize_options"]');
  if (customizeTitle) {
    customizeTitle.textContent = t('customize_options');
  }
  
  updateUI();
  
  // Ensure title is updated again (after updateUI)
  const customizeTitle2 = document.querySelector('h5[data-i18n="customize_options"]');
  if (customizeTitle2) {
    customizeTitle2.textContent = t('customize_options');
  }
  
  // Reload data to update language-related display
  if (document.getElementById('view-menu').classList.contains('active')) {
    loadCanteens();
  }
  if (state.currentDish) {
    // Redisplay current dish with translated name
    const dish = state.currentDish;
    const nameEl = document.getElementById('d-name');
    if (nameEl) nameEl.textContent = translateDishName(dish.name) || 'Unknown';
    const catEl = document.getElementById('d-cat');
    if (catEl) catEl.textContent = translateCategory(dish.category) || t('general_stall');
    
    // Update ingredients display
    const ingredientsEl = document.getElementById('d-ingredients');
    if (ingredientsEl) {
      if (state.lang === 'zh' && dish.ingredients_zh) {
        ingredientsEl.textContent = dish.ingredients_zh;
      } else if (dish.ingredients) {
        ingredientsEl.textContent = dish.ingredients;
    } else {
        ingredientsEl.textContent = state.lang === 'zh' ? '暂无配料信息' : 'No ingredients info';
      }
    }
    
    // Update calories unit
    const caloriesEl = document.getElementById('d-calories');
    if (caloriesEl && dish.calories) {
      caloriesEl.textContent = `${dish.calories} ${state.lang === 'zh' ? '大卡' : 'kcal'}`;
    }
    
    // Reload options to update language (will preserve currently selected values)
    loadDishOptions(dish.id);
  }
  // Update dish names and options in cart
  renderCart();
  // Update recommendations page
  if (document.getElementById('view-rec').classList.contains('active')) {
    const activeTab = document.querySelector('.rec-tab.active');
    if (activeTab && activeTab.id === 'tab-today') {
      loadRecommendations();
    } else if (activeTab && activeTab.id === 'tab-week') {
      loadWeeklyRecommendations();
    }
  }
}

async function loadCanteens() {
  const container = document.getElementById('menu-tree');
  if (!container) {
    console.error('找不到 menu-tree 容器元素');
    return;
  }
  console.log('加载食堂列表，API:', `${apiBase}/canteens`);
  container.innerHTML = `<div class="loading-text">${t('loading')}</div>`;
  try {
    const canteens = await fetchJSON(`${apiBase}/canteens`);
    console.log('获取到食堂数据:', canteens);
    container.innerHTML = '';
    if (!canteens.length) {
      container.innerHTML = `<div style="padding:1rem;color:#94a3b8">${t('no_canteens')}</div>`; 
      return;
    }
    canteens.forEach(c => {
      const cDiv = document.createElement('div');
      cDiv.className = 'tree-node';
  const label = document.createElement('div');
  label.className = 'tree-label';
      const location = c.location ? ` (${c.location})` : '';
      const canteenName = translateCanteenName(c.name);
      label.innerHTML = `<span><i class="fas fa-building" style="margin-right:8px;color:#4361ee"></i> ${canteenName}${location}</span> <i class="fas fa-chevron-right"></i>`;
      const children = document.createElement('div');
  children.className = 'tree-children';
      
      label.onclick = async () => {
    const isOpen = children.style.display === 'block';
        document.querySelectorAll('.tree-children').forEach(el => el.style.display = 'none');
        if (!isOpen) {
      children.style.display = 'block';
          await loadStalls(c.id, children);
        }
      };
      cDiv.appendChild(label);
      cDiv.appendChild(children);
      container.appendChild(cDiv);
    });
    console.log('食堂列表渲染完成');
  } catch (e) {
    console.error('Error loading canteens:', e);
    container.innerHTML = `<div style="padding:1rem;color:red">${t('api_error')}: ${e.message}</div>`; 
  }
}

async function loadStalls(canteenId, container) {
  container.innerHTML = `<div style="padding:0.5rem;color:#999">${t('loading')}</div>`;
  try {
    let dishes = cache.dishes[canteenId];
    if (!dishes) {
      dishes = await fetchJSON(`${apiBase}/canteens/${canteenId}/dishes`);
      cache.dishes[canteenId] = dishes;
    }
    container.innerHTML = '';
    if (!dishes || dishes.length === 0) {
      container.innerHTML = `<div style="padding:0.5rem;color:#94a3b8">${t('no_stalls')}</div>`;
      return;
    }
    const grouped = {};
    dishes.forEach(d => {
      const cat = d.category || t('general_stall');
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(d);
    });
    Object.keys(grouped).forEach(cat => {
      const catHeader = document.createElement('div');
      catHeader.style.padding = '8px 12px'; 
      catHeader.style.fontSize = '0.85rem'; 
      catHeader.style.color = '#94a3b8'; 
      catHeader.style.fontWeight = '500';
      catHeader.textContent = translateCategory(cat);
      container.appendChild(catHeader);
      grouped[cat].forEach(d => {
        const dDiv = document.createElement('div');
        dDiv.className = 'tree-label';
        dDiv.style.paddingLeft = '24px'; 
        dDiv.style.fontSize = '0.9rem';
        dDiv.style.cursor = 'pointer';
        dDiv.innerHTML = `<span>${translateDishName(d.name)}</span> <span style="color:#4361ee;font-weight:600">¥${d.price?.toFixed(2) || '0.00'}</span>`;
        dDiv.onclick = (e) => { e.stopPropagation(); loadDishDetail(d); };
        container.appendChild(dDiv);
      });
    });
  } catch (e) {
    console.error('Error loading stalls:', e);
    container.innerHTML = `<div style="padding:0.5rem;color:red">${t('error_loading')}</div>`; 
  }
}

async function loadDishDetail(dish) {
  // If dish only has id, need to get full info first
  if (dish && dish.id && !dish.name) {
    try {
      dish = await fetchJSON(`${apiBase}/dishes/${dish.id}`);
  } catch (e) {
      console.error('Error loading dish detail:', e);
      return;
    }
  }
  
  if (!dish || !dish.id) {
    console.error('Invalid dish object:', dish);
    return;
  }
  
  state.currentDish = dish;
  const emptyState = document.getElementById('dish-empty-state');
  const detailContent = document.getElementById('dish-detail-content');
  if (emptyState) emptyState.classList.add('hidden');
  if (detailContent) detailContent.classList.remove('hidden');
  
  const nameEl = document.getElementById('d-name');
  const priceEl = document.getElementById('d-price');
  const catEl = document.getElementById('d-cat');
  const qtyEl = document.getElementById('d-qty');
  
  if (nameEl) nameEl.textContent = translateDishName(dish.name) || 'Unknown';
  if (priceEl) priceEl.textContent = `¥${(dish.price || 0).toFixed(2)}`;
  if (catEl) catEl.textContent = translateCategory(dish.category) || t('general_stall');
  if (qtyEl) qtyEl.value = 1;
  
  // Display ingredients and calories
  const caloriesEl = document.getElementById('d-calories');
  const ingredientsEl = document.getElementById('d-ingredients');
  if (caloriesEl) {
    if (dish.calories) {
      caloriesEl.textContent = `${dish.calories} ${state.lang === 'zh' ? '大卡' : 'kcal'}`;
    } else {
      caloriesEl.textContent = '--';
    }
  }
  if (ingredientsEl) {
    // Display corresponding ingredients based on language
    if (state.lang === 'zh' && dish.ingredients_zh) {
      ingredientsEl.textContent = dish.ingredients_zh;
    } else if (dish.ingredients) {
      ingredientsEl.textContent = dish.ingredients;
    } else {
      ingredientsEl.textContent = state.lang === 'zh' ? '暂无配料信息' : 'No ingredients info';
    }
  }
  
  // Load dish options
  await loadDishOptions(dish.id);
  
  const list = document.getElementById('ratings-list');
  if (!list) return;
  list.innerHTML = `<li style="color:#94a3b8;padding:0.5rem">${t('loading')}</li>`;
  try {
    const ratings = await fetchJSON(`${apiBase}/ratings/dish/${dish.id}`);
    list.innerHTML = '';
    if (!ratings.length) {
      list.innerHTML = `<li style="color:#94a3b8;padding:0.5rem;font-style:italic">${t('no_ratings')}</li>`;
    } else {
      ratings.forEach(r => {
      const li = document.createElement('li');
        li.style.padding = '0.75rem 0';
        li.style.borderBottom = '1px solid #e2e8f0';
        const date = new Date(r.created_at).toLocaleDateString(state.lang === 'zh' ? 'zh-CN' : 'en-US');
        li.innerHTML = `
          <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:4px">
            <div>
              <span style="color:#fbbf24;font-weight:600;font-size:1.1rem">★ ${r.score}</span>
              <span style="margin-left:8px;color:#1e293b;font-weight:500">${r.username || '用户'}</span>
            </div>
            <span style="color:#94a3b8;font-size:0.85rem">${date}</span>
          </div>
          ${r.comment ? `<div style="color:#64748b;margin-top:4px;font-size:0.9rem">${r.comment}</div>` : ''}
        `;
        list.appendChild(li);
      });
    }
  } catch (e) {
    console.error('Error loading ratings:', e);
    list.innerHTML = `<li style="color:red;padding:0.5rem">${t('error_loading')}</li>`; 
  }
}

// Load dish options
async function loadDishOptions(dishId) {
  const optionsSection = document.getElementById('dish-options-section');
  const optionsList = document.getElementById('dish-options-list');
  if (!optionsSection || !optionsList) return;
  
  try {
    const options = await fetchJSON(`${apiBase}/options/dish/${dishId}`);
    if (!options || options.length === 0) {
      optionsSection.classList.add('hidden');
      return;
    }

    // Save currently selected option values (if they exist)
    const currentSelections = {};
    const existingGroups = document.querySelectorAll('.dish-option-group');
    existingGroups.forEach(group => {
      const optionType = group.dataset.optionType;
      const selected = group.querySelector('input[type="radio"]:checked');
      if (selected) {
        currentSelections[optionType] = selected.value;
      }
    });
    
    optionsSection.classList.remove('hidden');
    optionsList.innerHTML = '';
    
    // Ensure title is also updated (if title is within options area)
    const titleEl = optionsSection.querySelector('h5[data-i18n="customize_options"]');
    if (titleEl) {
      titleEl.textContent = t('customize_options');
    } else {
      // If not found, try searching in entire document
      const titleElGlobal = document.querySelector('h5[data-i18n="customize_options"]');
      if (titleElGlobal) {
        titleElGlobal.textContent = t('customize_options');
      }
    }
    
    // Create UI for each option
    options.forEach(option => {
      const optionDiv = document.createElement('div');
      optionDiv.className = 'dish-option-group';
      optionDiv.dataset.optionType = option.option_type;
      
      const label = document.createElement('label');
      label.className = 'option-label';
      label.textContent = state.lang === 'zh' ? option.option_name_zh : option.option_name_en;
      if (option.is_required) {
        label.innerHTML += ' <span style="color:red">*</span>';
      }
      optionDiv.appendChild(label);
      
      const valuesDiv = document.createElement('div');
      valuesDiv.className = 'option-values';
      
      // Determine which value should be selected
      const selectedValue = currentSelections[option.option_type] || 
                            (option.is_required ? option.option_values[0].value : 
                            (option.option_values.find(v => v.value === 'no')?.value || option.option_values[0].value));
      
      option.option_values.forEach((value, idx) => {
        const valueDiv = document.createElement('div');
        valueDiv.className = 'option-value';
        
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = `option_${option.option_type}`;
        radio.id = `option_${option.option_type}_${idx}`;
        radio.value = value.value;
        radio.checked = (value.value === selectedValue);
        
        const radioLabel = document.createElement('label');
        radioLabel.htmlFor = `option_${option.option_type}_${idx}`;
        radioLabel.textContent = state.lang === 'zh' ? value.label_zh : value.label_en;
        radioLabel.setAttribute('data-price', parseOptionPrice(state.lang === 'zh' ? value.label_zh : value.label_en) || 0);
        
        valueDiv.appendChild(radio);
        valueDiv.appendChild(radioLabel);
        valuesDiv.appendChild(valueDiv);
      });
      
      optionDiv.appendChild(valuesDiv);
      optionsList.appendChild(optionDiv);
    });
  } catch (e) {
    console.error('Error loading dish options:', e);
    optionsSection.classList.add('hidden');
  }
}

// Parse extra price from option label
function parseOptionPrice(label) {
  // Match "+2元" or "+¥2" or "(+2元)" or "(+¥2)"
  const match = label.match(/[+（(](\d+(?:\.\d+)?)[元¥]/);
  if (match) {
    return parseFloat(match[1]);
  }
  return 0;
}

// Get currently selected options and their prices
function getSelectedOptions() {
  const options = {};
  let extraPrice = 0;
  const optionGroups = document.querySelectorAll('.dish-option-group');
  optionGroups.forEach(group => {
    const optionType = group.dataset.optionType;
    const selected = group.querySelector('input[type="radio"]:checked');
    if (selected && selected.value !== 'no') {
      options[optionType] = selected.value;
      // Get selected option's label and parse price
      const label = selected.nextElementSibling;
      if (label && label.tagName === 'LABEL') {
        // Prefer data-price attribute, if not available then parse text
        const priceAttr = label.getAttribute('data-price');
        if (priceAttr !== null) {
          extraPrice += parseFloat(priceAttr) || 0;
        } else {
          const labelText = label.textContent.trim();
          extraPrice += parseOptionPrice(labelText);
        }
      }
    }
  });
  return { options, extraPrice };
}

function addToCart() {
  if (!state.currentDish) return;
  const qty = parseInt(document.getElementById('d-qty').value);
  const { options, extraPrice } = getSelectedOptions();
  
  // Calculate total price including options
  const basePrice = state.currentDish.price || 0;
  const totalPrice = basePrice + extraPrice;
  
  // Check if cart already has same dish with same options
  const existing = state.cart.find(c => {
    if (c.dishId !== state.currentDish.id) return false;
    const cOptions = c.options || {};
    const optionsStr = JSON.stringify(options);
    const cOptionsStr = JSON.stringify(cOptions);
    return optionsStr === cOptionsStr;
  });
  
  if (existing) {
    // If exists, update quantity and price (in case options changed)
    existing.quantity += qty;
    existing.price = totalPrice;
    existing.basePrice = basePrice;
    existing.extraPrice = extraPrice;
    existing.options = options;
    } else {
    state.cart.push({ 
      dishId: state.currentDish.id, 
      name: state.currentDish.name, 
      price: totalPrice, // Use total price including options
      basePrice: basePrice, // Save base price
      extraPrice: extraPrice, // Save extra price
      quantity: qty,
      options: options
    });
    }
    renderCart();
  const btn = document.getElementById('btn-add-cart');
  const original = btn.innerHTML;
  btn.innerHTML = `<i class="fas fa-check"></i>`;
  setTimeout(() => btn.innerHTML = original, 800);
}

function renderCart() {
  const list = document.getElementById('cart-list');
  const totalEl = document.getElementById('cart-total');
  const btn = document.getElementById('btn-checkout');
  const countEl = document.getElementById('cart-count');
  
  if (!list || !totalEl || !btn || !countEl) return;
  
  const totalQty = state.cart.reduce((s, i) => s + (i.quantity || 0), 0);
  countEl.textContent = totalQty;
  
  if (state.cart.length === 0) {
    list.innerHTML = `<div style="text-align:center;color:#94a3b8;margin-top:20px;padding:2rem;">${t('cart_empty')}</div>`;
    totalEl.textContent = '¥0.00';
    btn.disabled = true;
    return;
  }
  list.innerHTML = '';
  let total = 0;
  state.cart.forEach((item, index) => {
    const itemTotal = (item.price || 0) * (item.quantity || 0);
    total += itemTotal;
    const div = document.createElement('div');
    div.className = 'cart-item';
    // Format options display
    let optionsText = '';
    if (item.options && Object.keys(item.options).length > 0) {
      const optionLabels = [];
      const optionLabelMap = {
        'add_egg': { zh: '加蛋', en: 'Add Egg' },
        'add_sausage': { zh: '加火腿肠', en: 'Add Sausage' },
        'add_meat': { zh: '加肉', en: 'Add Meat' },
        'spicy_level': { zh: '辣度', en: 'Spicy Level' },
        'temperature': { zh: '温度', en: 'Temperature' },
        'sugar_level': { zh: '糖度', en: 'Sugar Level' }
      };
      const valueLabelMap = {
        'yes': { zh: '是', en: 'Yes' },
        'no': { zh: '否', en: 'No' },
        'mild': { zh: '微辣', en: 'Mild' },
        'medium': { zh: '中辣', en: 'Medium' },
        'hot': { zh: '重辣', en: 'Hot' },
        'ice': { zh: '冰的', en: 'Iced' },
        'less_ice': { zh: '少冰', en: 'Less Ice' },
        'no_ice': { zh: '去冰', en: 'No Ice' },
        'hot': { zh: '热的', en: 'Hot' },
        'no_sugar': { zh: '不额外加糖', en: 'No Extra Sugar' },
        'half': { zh: '五分糖', en: '50% Sugar' },
        'seven': { zh: '七分糖', en: '70% Sugar' },
        'full': { zh: '满糖', en: 'Full Sugar' }
      };
      
      Object.entries(item.options).forEach(([key, value]) => {
        if (value && value !== 'no') {
          const optionName = optionLabelMap[key] ? (state.lang === 'zh' ? optionLabelMap[key].zh : optionLabelMap[key].en) : key;
          const valueLabel = valueLabelMap[value] ? (state.lang === 'zh' ? valueLabelMap[value].zh : valueLabelMap[value].en) : value;
          optionLabels.push(`${optionName}: ${valueLabel}`);
        }
      });
      if (optionLabels.length > 0) {
        optionsText = `<div style="font-size:0.75rem;color:#64748b;margin-top:2px">${optionLabels.join(', ')}</div>`;
      }
    }
    
    div.innerHTML = `
      <div style="flex:1">
        <div style="font-weight:500;margin-bottom:4px">${translateDishName(item.name) || 'Unknown'}</div>
        ${optionsText}
        <div style="font-size:0.85rem;color:#94a3b8">x ${item.quantity || 0}</div>
      </div>
      <div style="display:flex;align-items:center;gap:12px">
        <div style="font-weight:bold;color:#4361ee">¥${itemTotal.toFixed(2)}</div>
        <button onclick="removeFromCart(${index})" style="background:none;border:none;color:#ef4444;cursor:pointer;padding:4px 8px;font-size:1.2rem;" title="${state.lang === 'zh' ? '删除' : 'Remove'}">×</button>
      </div>
    `;
    list.appendChild(div);
  });
  totalEl.textContent = `¥${total.toFixed(2)}`;
  btn.disabled = false;
}

// Global function for HTML onclick calls
window.removeFromCart = function(index) {
  if (index >= 0 && index < state.cart.length) {
    state.cart.splice(index, 1);
    renderCart();
  }
};

// Open checkout confirmation interface
function openCheckoutModal() {
  if (!currentUserId) {
    alert(t('please_login'));
    openAuthModal('login');
    return;
  }
  if (!state.cart.length) return;
  
  // Directly confirm order, no waiting interface
  if (!confirm(state.lang === 'zh' ? '确认提交订单？' : 'Confirm to submit order?')) {
    return;
  }
  
  submitOrder();
}

// Close checkout interface (keep function in case called elsewhere)
function closeCheckoutModal() {
  const modal = document.getElementById('checkout-modal');
  if (modal) modal.classList.add('hidden');
}

async function submitOrder() {
  if (!currentUserId) {
    alert(t('please_login'));
    openAuthModal('login');
    return;
  }
  if (!state.cart.length) return;
  
  try {
    // Recalculate total to ensure correctness
    const total = state.cart.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);
    
    await fetchJSON(`${apiBase}/orders/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: currentUserId,
        items: state.cart.map(c => ({ 
          dish_id: c.dishId, 
          quantity: c.quantity,
          price: c.price || 0, // Use total price including options
          options: c.options || {}
        })),
        total_price: total
      })
    });
    
    state.cart = []; 
    renderCart();
    alert(t('submit_success'));
    
    // If currently on orders page, refresh order list
    if (document.getElementById('view-order') && document.getElementById('view-order').classList.contains('active')) {
      loadOrders();
    } else {
      // Switch to orders page
      const orderNav = document.getElementById('nav-order');
      if (orderNav) orderNav.click();
    }
  } catch (e) {
    alert(t('submit_fail') + (e.message || e.detail || '未知错误'));
  }
}

// Pay for order
async function payOrder(orderId) {
  if (!currentUserId) {
    alert(t('please_login'));
    openAuthModal('login');
    return;
  }
  
  if (!confirm(state.lang === 'zh' ? '确认支付此订单？' : 'Confirm payment for this order?')) {
    return;
  }
  
  try {
    await fetchJSON(`${apiBase}/orders/${orderId}/pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    alert(state.lang === 'zh' ? '支付成功！' : 'Payment successful!');
    loadOrders(); // Refresh order list
  } catch (e) {
    alert(state.lang === 'zh' ? '支付失败：' : 'Payment failed: ' + (e.message || e.detail || '未知错误'));
  }
}

// Global function for HTML onclick calls
window.payOrder = payOrder;

function renderDishCard(d) {
  const card = document.createElement('div');
  card.className = 'rec-card';
  const avgScore = d.avg_score ? Number(d.avg_score).toFixed(1) : 'N/A';
  card.innerHTML = `
    <div style="font-weight:bold;margin-bottom:8px;font-size:1.1rem;">${translateDishName(d.name) || 'Unknown'}</div>
    <div style="font-size:0.85rem;color:#64748b;margin-bottom:8px;">${translateCategory(d.category) || t('general_stall')}</div>
    ${d.canteen_name ? `<div style="font-size:0.75rem;color:#94a3b8;margin-bottom:4px;"><i class="fas fa-building"></i> ${translateCanteenName(d.canteen_name)}</div>` : ''}
    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px">
      <div style="color:#4361ee;font-weight:600">★ ${avgScore}</div>
      <div style="font-size:1rem;font-weight:bold;color:#4361ee">¥${(d.price || 0).toFixed(2)}</div>
    </div>
  `;
  card.style.cursor = 'pointer';
  card.onclick = () => { 
    const navMenu = document.getElementById('nav-menu');
    if (navMenu) {
      navMenu.click(); 
      setTimeout(() => {
        loadDishDetail({ id: d.id, name: d.name, price: d.price, category: d.category });
      }, 200);
    }
  };
  return card;
}

async function loadRecommendations() {
  const grid = document.getElementById('rec-grid');
  const todayBadge = document.getElementById('today-badge');
  const todayDayName = document.getElementById('today-day-name');
  const dateInfo = document.getElementById('current-date');
  
  if (!grid) return;
  
  // Update date information
  const now = new Date();
  const weekday = getCurrentWeekday();
  const dayName = getDayName(weekday, state.lang);
  const dateStr = now.toLocaleDateString(state.lang === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });
  
  if (dateInfo) dateInfo.textContent = dateStr;
  if (todayDayName) todayDayName.textContent = dayName;
  
  grid.innerHTML = `<div style="text-align:center;padding:2rem;color:#94a3b8">${t('loading')}</div>`;
  
  try {
    // Use daily recommendations API
    const recs = await fetchJSON(`${apiBase}/stats/daily-recommendations?weekday=${weekday}&limit=6`);
    grid.innerHTML = '';
    if (!recs || recs.length === 0) {
      grid.innerHTML = `<div style="text-align:center;padding:2rem;color:#94a3b8">${t('no_recommendations')}</div>`;
      return;
    }
    recs.forEach(d => {
      grid.appendChild(renderDishCard(d));
    });
  } catch (e) {
    console.error('Error loading recommendations:', e);
    grid.innerHTML = `<div style="text-align:center;padding:2rem;color:red">${t('error_loading')}: ${e.message}</div>`; 
  }
}

async function loadWeeklyRecommendations() {
  const weekGrid = document.getElementById('week-grid');
  if (!weekGrid) return;
  
  weekGrid.innerHTML = `<div style="text-align:center;padding:2rem;color:#94a3b8">${t('loading')}</div>`;
  
  try {
    const weekData = await fetchJSON(`${apiBase}/stats/weekly-recommendations?limit_per_day=4`);
    weekGrid.innerHTML = '';
    
    const currentWeekday = getCurrentWeekday();
    
    for (let day = 0; day < 7; day++) {
      const dayData = weekData[day];
      const dayName = state.lang === 'zh' ? dayData.day_name_zh : dayData.day_name_en;
      const isToday = day === currentWeekday;
      
      const daySection = document.createElement('div');
      daySection.className = 'week-day-section';
      if (isToday) daySection.classList.add('today');
      
      const dayHeader = document.createElement('div');
      dayHeader.className = 'week-day-header';
      dayHeader.innerHTML = `
        <div class="week-day-title">
          <i class="fas fa-calendar-day"></i>
          <span>${dayName}</span>
          ${isToday ? `<span class="today-label">${t('today')}</span>` : ''}
        </div>
        <div class="week-day-count">${dayData.dishes.length} ${state.lang === 'zh' ? '道推荐' : 'dishes'}</div>
      `;
      
      const dishesGrid = document.createElement('div');
      dishesGrid.className = 'week-dishes-grid';
      
      if (dayData.dishes.length === 0) {
        dishesGrid.innerHTML = `<div style="text-align:center;padding:1rem;color:#94a3b8;font-style:italic">${t('no_recommendations')}</div>`;
      } else {
        dayData.dishes.forEach(d => {
          dishesGrid.appendChild(renderDishCard(d));
        });
      }
      
      daySection.appendChild(dayHeader);
      daySection.appendChild(dishesGrid);
      weekGrid.appendChild(daySection);
    }
  } catch (e) {
    console.error('Error loading weekly recommendations:', e);
    weekGrid.innerHTML = `<div style="text-align:center;padding:2rem;color:red">${t('error_loading')}: ${e.message}</div>`;
  }
}

async function loadOrders() {
  const orderView = document.getElementById('view-order');
  if (!orderView) return;
  
  if (!currentUserId) {
    orderView.innerHTML = `
      <div class="card empty-order-card">
        <i class="fas fa-clipboard-list"></i>
        <h3 data-i18n="please_login">请先登录</h3>
        <button class="btn-primary" onclick="openAuthModal('login')" data-i18n="login">登录</button>
      </div>
    `;
    updateUI();
    return;
  }
  
  orderView.innerHTML = `<div style="text-align:center;padding:2rem;color:#94a3b8">${t('loading')}</div>`;
  
  try {
    const orders = await fetchJSON(`${apiBase}/orders?user_id=${currentUserId}`);
    if (!orders || orders.length === 0) {
      orderView.innerHTML = `
        <div class="card empty-order-card">
          <i class="fas fa-clipboard-list"></i>
          <h3 data-i18n="no_orders">暂无历史订单</h3>
        </div>
      `;
      updateUI();
      return;
    }
    
    orderView.innerHTML = '<div style="display:flex;flex-direction:column;gap:1rem;">';
    orders.forEach(order => {
      const orderCard = document.createElement('div');
      orderCard.className = 'card';
      orderCard.style.padding = '1.5rem';
      const date = new Date(order.created_at).toLocaleString(state.lang === 'zh' ? 'zh-CN' : 'en-US');
      
      // Format order items display
      let itemsHtml = '';
      if (order.items && order.items.length > 0) {
        itemsHtml = '<div style="margin-top:1rem;padding-top:1rem;border-top:1px solid #e2e8f0;">';
        order.items.forEach(item => {
          const dishName = translateDishName(item.dish_name || `Dish ${item.dish_id}`);
          let optionsText = '';
          
          // Format options display
          if (item.options && Object.keys(item.options).length > 0) {
            const optionLabels = [];
            const optionLabelMap = {
              'add_egg': { zh: '加蛋', en: 'Add Egg' },
              'add_sausage': { zh: '加火腿肠', en: 'Add Sausage' },
              'add_meat': { zh: '加肉', en: 'Add Meat' },
              'spicy_level': { zh: '辣度', en: 'Spicy Level' },
              'temperature': { zh: '温度', en: 'Temperature' },
              'sugar_level': { zh: '糖度', en: 'Sugar Level' }
            };
            const valueLabelMap = {
              'yes': { zh: '是', en: 'Yes' },
              'mild': { zh: '微辣', en: 'Mild' },
              'medium': { zh: '中辣', en: 'Medium' },
              'hot': { zh: '重辣', en: 'Hot' },
              'ice': { zh: '冰的', en: 'Iced' },
              'less_ice': { zh: '少冰', en: 'Less Ice' },
              'no_ice': { zh: '去冰', en: 'No Ice' },
              'no_sugar': { zh: '不额外加糖', en: 'No Extra Sugar' },
              'half': { zh: '五分糖', en: '50% Sugar' },
              'seven': { zh: '七分糖', en: '70% Sugar' },
              'full': { zh: '满糖', en: 'Full Sugar' }
            };
            
            Object.entries(item.options).forEach(([key, value]) => {
              if (value && value !== 'no') {
                const optionName = optionLabelMap[key] ? (state.lang === 'zh' ? optionLabelMap[key].zh : optionLabelMap[key].en) : key;
                const valueLabel = valueLabelMap[value] ? (state.lang === 'zh' ? valueLabelMap[value].zh : valueLabelMap[value].en) : value;
                optionLabels.push(`${optionName}: ${valueLabel}`);
              }
            });
            if (optionLabels.length > 0) {
              optionsText = `<div style="font-size:0.75rem;color:#64748b;margin-top:2px">${optionLabels.join(', ')}</div>`;
            }
          }
          
          itemsHtml += `
            <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:0.75rem;">
              <div style="flex:1">
                <div style="font-weight:500;margin-bottom:2px">${dishName}</div>
                ${optionsText}
                <div style="font-size:0.85rem;color:#94a3b8">x ${item.quantity || 1}</div>
              </div>
              <div style="font-weight:bold;color:#4361ee;margin-left:1rem">¥${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</div>
            </div>
          `;
        });
        itemsHtml += '</div>';
      }
      
      orderCard.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
          <div>
            <div style="font-weight:bold;font-size:1.1rem;">${state.lang === 'zh' ? '订单' : 'Order'} #${order.id}</div>
            <div style="font-size:0.85rem;color:#94a3b8;margin-top:4px">${date}</div>
          </div>
          <div>
            <span style="padding:4px 12px;background:#e0e7ff;color:#4361ee;border-radius:12px;font-size:0.85rem;font-weight:500">${order.status || 'pending'}</span>
          </div>
        </div>
        ${itemsHtml}
        <div style="margin-top:1rem;padding-top:1rem;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center">
          <div style="font-weight:600;color:#1e293b">${state.lang === 'zh' ? '合计' : 'Total'}</div>
          <div style="font-size:1.2rem;font-weight:bold;color:#4361ee">¥${(order.total_price || 0).toFixed(2)}</div>
        </div>
        ${order.status === 'pending' ? `
          <div style="margin-top:1rem;padding-top:1rem;border-top:1px solid #e2e8f0;">
            <button onclick="payOrder(${order.id})" class="btn-primary" style="width:100%">
              <i class="fas fa-credit-card"></i> <span data-i18n="pay_now">立即支付</span>
            </button>
          </div>
        ` : ''}
      `;
      orderView.appendChild(orderCard);
    });
    orderView.innerHTML += '</div>';
  } catch (e) {
    console.error('Error loading orders:', e);
    orderView.innerHTML = `<div style="text-align:center;padding:2rem;color:red">${t('error_loading')}: ${e.message}</div>`;
  }
}

// Login and registration related functions
async function handleLogin(username, password) {
  try {
    const response = await fetchJSON(`${apiBase}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    saveUserToStorage(response.user);
    closeAuthModal();
    alert(t('login_success'));
    return true;
  } catch (e) {
    const errorEl = document.getElementById('login-error');
    if (errorEl) {
      errorEl.textContent = t('login_failed') + ': ' + (e.message || e.detail || '未知错误');
    }
    return false;
  }
}

async function handleRegister(username, email, password) {
  try {
    const response = await fetchJSON(`${apiBase}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email: email || null, password, role: 'student' })
    });
    saveUserToStorage(response);
    closeAuthModal();
    alert(t('register_success'));
    return true;
  } catch (e) {
    const errorEl = document.getElementById('register-error');
    if (errorEl) {
      errorEl.textContent = t('register_failed') + ': ' + (e.message || e.detail || '未知错误');
    }
    return false;
  }
}

function openAuthModal(tab = 'login') {
  const modal = document.getElementById('auth-modal');
  if (!modal) return;
  modal.classList.remove('hidden');
  switchAuthTab(tab);
}

function closeAuthModal() {
  const modal = document.getElementById('auth-modal');
  if (modal) modal.classList.add('hidden');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  if (loginForm) loginForm.reset();
  if (registerForm) registerForm.reset();
  document.getElementById('login-error').textContent = '';
  document.getElementById('register-error').textContent = '';
}

function switchAuthTab(tab) {
  const loginTab = document.getElementById('tab-login');
  const registerTab = document.getElementById('tab-register');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const title = document.getElementById('auth-modal-title');
  
  if (tab === 'login') {
    if (loginTab) loginTab.classList.add('active');
    if (registerTab) registerTab.classList.remove('active');
    if (loginForm) loginForm.classList.remove('hidden');
    if (registerForm) registerForm.classList.add('hidden');
    if (title) title.setAttribute('data-i18n', 'login');
      } else {
    if (loginTab) loginTab.classList.remove('active');
    if (registerTab) registerTab.classList.add('active');
    if (loginForm) loginForm.classList.add('hidden');
    if (registerForm) registerForm.classList.remove('hidden');
    if (title) title.setAttribute('data-i18n', 'register');
  }
  updateUI();
}

// Submit rating
async function submitRating(dishId, score, comment) {
  if (!currentUserId) {
    alert(t('please_login'));
    openAuthModal('login');
    return false;
  }
  
  try {
    await fetchJSON(`${apiBase}/ratings/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: currentUserId,
        dish_id: dishId,
        score: parseInt(score),
        comment: comment || null
      })
    });
    
    const msgEl = document.getElementById('rating-message');
    if (msgEl) {
      msgEl.textContent = t('rating_success');
      msgEl.style.color = 'green';
      setTimeout(() => { msgEl.textContent = ''; }, 3000);
    }
    
    // Reload ratings list
    if (state.currentDish) {
      await loadDishDetail(state.currentDish.id);
    }
    return true;
  } catch (e) {
    const msgEl = document.getElementById('rating-message');
    if (msgEl) {
      msgEl.textContent = t('rating_failed') + ': ' + (e.message || e.detail || '未知错误');
      msgEl.style.color = 'red';
    }
    return false;
  }
}

window.addEventListener('DOMContentLoaded', () => {
  console.log('页面加载完成，开始初始化...');
  
  // Restore user info from localStorage
  loadUserFromStorage();
  
  // Restore language setting from localStorage
  const savedLang = localStorage.getItem('lang');
  if (savedLang && (savedLang === 'zh' || savedLang === 'en')) {
    state.lang = savedLang;
  }
  
  console.log('当前语言:', state.lang);
  console.log('API Base:', apiBase);
  
  // Initialize UI
  updateUI(); 
  
  // Load canteens list
  console.log('开始加载食堂列表...');
  loadCanteens();
  const tabs = { 'nav-menu': 'view-menu', 'nav-rec': 'view-rec', 'nav-order': 'view-order' };
  Object.keys(tabs).forEach(navId => {
    const navEl = document.getElementById(navId);
    if (!navEl) return;
    navEl.onclick = function() {
      document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
      this.classList.add('active');
      document.querySelectorAll('.view-container').forEach(el => el.classList.remove('active'));
      const viewId = tabs[navId];
      const viewEl = document.getElementById(viewId);
      if (viewEl) viewEl.classList.add('active');
      
      if (navId === 'nav-rec') {
        // Default to show today's recommendations
        showTodayRec();
      } else if (navId === 'nav-order') {
        loadOrders();
      }
      
      const titleKeys = {'nav-menu':'header_menu', 'nav-rec':'rec_title', 'nav-order':'nav_order'};
      const pageTitle = document.getElementById('page-title');
      if (pageTitle) pageTitle.setAttribute('data-i18n', titleKeys[navId]);
      updateUI();
    };
  });
  const langSwitch = document.getElementById('lang-switch');
  if (langSwitch) langSwitch.onclick = toggleLang;
  
  const qtyMinus = document.getElementById('btn-qty-minus');
  if (qtyMinus) qtyMinus.onclick = () => { 
    const inp = document.getElementById('d-qty'); 
    if (inp && parseInt(inp.value) > 1) inp.value = parseInt(inp.value) - 1; 
  };
  
  const qtyPlus = document.getElementById('btn-qty-plus');
  if (qtyPlus) qtyPlus.onclick = () => { 
    const inp = document.getElementById('d-qty'); 
    if (inp) inp.value = parseInt(inp.value || 1) + 1; 
  };
  
  const addCartBtn = document.getElementById('btn-add-cart');
  if (addCartBtn) addCartBtn.onclick = addToCart;
  
  const checkoutBtn = document.getElementById('btn-checkout');
  if (checkoutBtn) checkoutBtn.onclick = openCheckoutModal;
  
  // Checkout payment related events (removed, now directly confirm order)
  
  // Login and registration related events
  const loginBtn = document.getElementById('login-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const authClose = document.getElementById('auth-close');
  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  
  if (loginBtn) loginBtn.onclick = () => openAuthModal('login');
  if (logoutBtn) logoutBtn.onclick = () => {
    if (confirm(state.lang === 'zh' ? '确定要登出吗？' : 'Are you sure you want to logout?')) {
      clearUser();
      alert(state.lang === 'zh' ? '已登出' : 'Logged out');
    }
  };
  if (authClose) authClose.onclick = closeAuthModal;
  if (tabLogin) tabLogin.onclick = () => switchAuthTab('login');
  if (tabRegister) tabRegister.onclick = () => switchAuthTab('register');
  
  if (loginForm) {
    loginForm.onsubmit = async (e) => {
      e.preventDefault();
      const username = document.getElementById('login-username').value.trim();
      const password = document.getElementById('login-password').value;
      if (!username || !password) return;
      await handleLogin(username, password);
    };
  }
  
  if (registerForm) {
    registerForm.onsubmit = async (e) => {
      e.preventDefault();
      const username = document.getElementById('register-username').value.trim();
      const email = document.getElementById('register-email').value.trim();
      const password = document.getElementById('register-password').value;
      if (!username || !password) return;
      if (password.length < 6) {
        alert(state.lang === 'zh' ? '密码长度至少6位' : 'Password must be at least 6 characters');
        return;
      }
      await handleRegister(username, email, password);
    };
  }
  
  // Rating form
  const ratingForm = document.getElementById('rating-form');
  if (ratingForm) {
    ratingForm.onsubmit = async (e) => {
      e.preventDefault();
      if (!state.currentDish) return;
      const score = document.querySelector('input[name="rating-score"]:checked');
      if (!score) {
        alert(state.lang === 'zh' ? '请选择评分' : 'Please select a rating');
        return;
      }
      const comment = document.getElementById('rating-comment').value.trim();
      await submitRating(state.currentDish.id, score.value, comment);
      ratingForm.reset();
    };
  }
  
  const chatPanel = document.getElementById('chat-panel');
  const chatTrigger = document.getElementById('chat-trigger');
  const chatClose = document.getElementById('chat-close');
  const chatForm = document.getElementById('chat-form');
  
  if (chatTrigger && chatPanel) {
    chatTrigger.onclick = () => {
        chatPanel.classList.remove('hidden');
      const chatInput = document.getElementById('chat-input');
      if (chatInput) chatInput.focus();
    };
  }

  if (chatClose && chatPanel) {
    chatClose.onclick = () => chatPanel.classList.add('hidden');
  }
  
  if (chatForm) {
    chatForm.onsubmit = async (e) => {
      e.preventDefault(); const input = document.getElementById('chat-input'); const text = input.value.trim(); if(!text) return;
      const msgs = document.getElementById('chat-messages');
      if (!msgs) return;
      const userDiv = document.createElement('div'); 
      userDiv.className = 'chat-msg user'; 
      userDiv.textContent = text; 
      msgs.appendChild(userDiv); 
      input.value = '';
      msgs.scrollTop = msgs.scrollHeight;
      
      const thinkingDiv = document.createElement('div'); 
      thinkingDiv.className = 'chat-msg bot'; 
      thinkingDiv.textContent = t('thinking'); 
      msgs.appendChild(thinkingDiv);
      msgs.scrollTop = msgs.scrollHeight;
      
      try {
        console.log('发送聊天消息:', text);
        const res = await fetchJSON(`${apiBase}/chat`, { 
          method: 'POST',
          headers: {'Content-Type':'application/json'}, 
          body: JSON.stringify({ user_id: currentUserId, message: text }) 
        });
        console.log('收到回复:', res);
        thinkingDiv.textContent = res.answer || t('no_response');
        thinkingDiv.style.color = '';
      } catch(e) { 
        console.error('Chat error:', e);
        let errorMsg = e.message || 'Unknown error';
        // If HTTP error, try to parse error details
        if (e.message && e.message.includes('HTTP')) {
          try {
            const errorMatch = e.message.match(/HTTP (\d+)/);
            if (errorMatch) {
              errorMsg = `${state.lang === 'zh' ? '服务器错误' : 'Server error'} (${errorMatch[1]})`;
            }
          } catch(parseErr) {
            console.error('Error parsing error message:', parseErr);
          }
        }
        thinkingDiv.textContent = `${t('error')}: ${errorMsg}`;
        thinkingDiv.style.color = 'red';
      }
      msgs.scrollTop = msgs.scrollHeight;
    };
  }
  
  // Initialize cart display
  renderCart();
  
  // Recommendations page tab switching
  const tabToday = document.getElementById('tab-today');
  const tabWeek = document.getElementById('tab-week');
  const todayRec = document.getElementById('today-rec');
  const weekRec = document.getElementById('week-rec');
  
  if (tabToday && tabWeek) {
    tabToday.onclick = () => showTodayRec();
    tabWeek.onclick = () => showWeekRec();
  }
  
  function showTodayRec() {
    if (tabToday) tabToday.classList.add('active');
    if (tabWeek) tabWeek.classList.remove('active');
    if (todayRec) todayRec.classList.add('active');
    if (weekRec) weekRec.classList.remove('active');
    loadRecommendations();
  }
  
  function showWeekRec() {
    if (tabToday) tabToday.classList.remove('active');
    if (tabWeek) tabWeek.classList.add('active');
    if (todayRec) todayRec.classList.remove('active');
    if (weekRec) weekRec.classList.add('active');
    loadWeeklyRecommendations();
  }
  
  console.log('所有初始化完成！');
  console.log('可用功能：');
  console.log('- 点击左侧导航切换视图');
  console.log('- 点击食堂展开菜单');
  console.log('- 点击菜品查看详情');
  console.log('- 使用购物车添加/删除商品');
  console.log('- 点击语言切换按钮切换中英文');
  console.log('- 点击右下角聊天图标使用AI助手');
});
