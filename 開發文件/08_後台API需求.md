# 後台 API 需求文件

> 版本：v0.1 草稿
> 最後更新：2026-10-12
> 規格來源：`05_前後台功能規格.md`、`dashboard/admin.html`、`dashboard/admin.js`

---

## 1. 總覽

後台（admin 端）API 供管理員前台（`dashboard/admin.html`）呼叫。所有端點皆需管理員 session 驗證。

### 1.1 全站約定

- Base path：`/admin/api/`
- 身份驗證：Session cookie（或後端決定的 JWT/API key）
- 金額單位：USDT 字串（同前台）
- 「產生待簽交易」操作的 response 統一回傳 `{ "pendingTxId": "..." }`，並寫入 A13 操作紀錄
- 「待定」欄位（如各獎金金額）以 `null` 回傳，前台顯示「⏳ 待定」

### 1.2 操作類型

| 類型 | 說明 |
|---|---|
| **純讀取（GET）** | 查詢資料，無副作用 |
| **CMS 寫入** | POST/PUT/DELETE，修改 CMS 資料庫（公告、FAQ 等） |
| **鏈上操作（待簽交易）** | POST，後端記錄待簽交易、寫入 A13 紀錄，response 含 `pendingTxId` |
| **純後端寫入** | PUT，修改後端自有設定（如 energy 告警門檻） |

---

## 2. A1 總覽

#### `GET /admin/api/dashboard`

- **用途**：一次取得儀表板全部資料
- **Response 欄位**

| 欄位 | 說明 |
|---|---|
| `pools[]` | 各彩金桶本期狀態（第一版只有 539） |
| `pools[].gameId` | `"539"` |
| `pools[].periodNo` | 本期期號 |
| `pools[].status` | `open` / `closed` / `drawing` / `settled` |
| `pools[].deadlineAt` | 截止時間（ISO 8601） |
| `pools[].betCount` | 本期下注筆數 |
| `pools[].betVolume` | 本期下注總額（USDT 字串） |
| `pools[].jackpot` | 頭獎彩池金額（USDT 字串） |
| `pools[].projectedContrib` | 本期提撥預估（USDT 字串） |
| `finance.platformBalance` | 平台戶餘額（USDT 字串） |
| `finance.pendingFixedPrize` | 待付固定獎金（USDT 字串） |
| `finance.safetyMultiple` | 安全緩衝倍數（數字） |
| `energy.balance` | Energy 存量 |
| `energy.dailyUsage` | 每日平均消耗 |
| `energy.estimatedDays` | 預估可用天數 |
| `energy.threshold` | 告警門檻 |
| `services[]` | 服務狀態陣列 |
| `services[].name` | 服務名稱（`deposit_service` / `oracle_1` / `oracle_2` / `oracle_3`） |
| `services[].status` | `ok` / `delayed` / `down` |
| `services[].lastHeartbeatAt` | 上次心跳時間 |
| `unresolved AlertCount` | 未處理告警數 |
| `unresolvedAlerts[]` | 最近未處理告警（最多 5 筆，詳見 A12） |

---

## 3. A2 內容管理

### 3.1 跑馬燈

#### `GET /admin/api/cms/marquees`
- **用途**：跑馬燈列表

| 欄位 | 說明 |
|---|---|
| `items[].id` | ID |
| `items[].textZhTw` | 繁中文案 |
| `items[].textZhCn` | 簡中文案 |
| `items[].textEn` | 英文文案 |
| `items[].enabled` | boolean |
| `items[].scheduleStart` | 排程開始時間（null = 常態上架） |
| `items[].scheduleEnd` | 排程結束時間 |
| `items[].sortOrder` | 排序值 |

#### `POST /admin/api/cms/marquees`
- **用途**：新增跑馬燈
- **Request Body**：同上欄位（不含 id）

#### `PUT /admin/api/cms/marquees/:id`
- **用途**：更新跑馬燈（含切換上下架）
- **Request Body**：同 POST

#### `DELETE /admin/api/cms/marquees/:id`
- **用途**：刪除跑馬燈

---

### 3.2 系統公告

#### `GET /admin/api/cms/announcements`
- **用途**：公告列表

| 欄位 | 說明 |
|---|---|
| `items[].id` | ID |
| `items[].titleZhTw` | 繁中標題 |
| `items[].titleZhCn` | 簡中標題 |
| `items[].titleEn` | 英文標題 |
| `items[].bodyZhTw` | 繁中內文 |
| `items[].bodyZhCn` | 簡中內文 |
| `items[].bodyEn` | 英文內文 |
| `items[].enabled` | boolean |
| `items[].scheduleStart` | 排程開始時間 |
| `items[].scheduleEnd` | 排程結束時間 |
| `items[].sortOrder` | 排序值 |

#### `POST /admin/api/cms/announcements`
- **Request Body**：同上欄位（不含 id）

#### `PUT /admin/api/cms/announcements/:id`

#### `DELETE /admin/api/cms/announcements/:id`

---

### 3.3 常見問題（FAQ）

#### `GET /admin/api/cms/faqs`
- **用途**：FAQ 列表（含全語言欄位，供後台編輯）

| 欄位 | 說明 |
|---|---|
| `items[].id` | ID |
| `items[].category` | 分類代碼：`play` / `method` / `auth` / `funds` / `draw` / `aff` |
| `items[].enabled` | boolean |
| `items[].sortOrder` | 排序值 |
| `items[].questionZhTw` | 繁中問題 |
| `items[].questionZhCn` | 簡中問題 |
| `items[].questionEn` | 英文問題 |
| `items[].answerZhTw` | 繁中答案 |
| `items[].answerZhCn` | 簡中答案 |
| `items[].answerEn` | 英文答案 |

#### `POST /admin/api/cms/faqs`
- **Request Body**：同上欄位（不含 id）

#### `PUT /admin/api/cms/faqs/:id`

#### `DELETE /admin/api/cms/faqs/:id`

#### `PUT /admin/api/cms/faqs/order`
- **用途**：批次更新排序（拖曳後送出）
- **Request Body**

| 欄位 | 說明 |
|---|---|
| `order[]` | FAQ ID 陣列，按新順序排列 |

---

## 4. A3 期別管理

#### `GET /admin/api/periods`
- **Query 參數**：`gameId`、`page`、`page_size`
- **Response 欄位**

| 欄位 | 說明 |
|---|---|
| `items[].periodNo` | 官方期號 |
| `items[].gameId` | `"539"` |
| `items[].status` | `open` / `closed` / `drawing` / `settled` / `disputed` / `refunding` / `refunded` / `cancelled` |
| `items[].deadlineAt` | 截止時間 |
| `items[].betCount` | 下注筆數 |
| `items[].betVolume` | 下注總額 |
| `pagination` | 分頁資訊 |

#### `POST /admin/api/periods`（待簽交易）
- **用途**：手動建立期別（官方期號異動時補建），合約自動套用現行設定
- **Request Body**

| 欄位 | 說明 |
|---|---|
| `periodNo` | 官方期號 |
| `gameId` | `"539"` |

#### `POST /admin/api/periods/:periodNo/cancel`（待簽交易）
- **用途**：取消期別（截止前才可呼叫；後端應驗證時間）

#### `POST /admin/api/periods/:periodNo/postpone`（待簽交易）
- **Request Body**

| 欄位 | 說明 |
|---|---|
| `newDeadlineAt` | 新截止時間（ISO 8601） |

#### `GET /admin/api/periods/:periodNo/oracle-report`
- **用途**：取得 3 台預言機對該期的回報對照

| 欄位 | 說明 |
|---|---|
| `periodNo` | 期號 |
| `officialNumbers` | 官方開獎號碼（5 個整數，已確認後才有） |
| `oracles[]` | 3 台預言機回報 |
| `oracles[].id` | `"oracle_1"` / `"oracle_2"` / `"oracle_3"` |
| `oracles[].reportedAt` | 回報時間 |
| `oracles[].numbers` | 回報號碼（5 個整數） |
| `oracles[].match` | 與官方結果是否一致 |
| `disputeReason` | 爭議原因說明（爭議中時才有） |

#### `POST /admin/api/periods/:periodNo/dispute`（待簽交易）
- **用途**：爭議裁定（接受或推翻其中一台預言機的結果）
- **Request Body**

| 欄位 | 說明 |
|---|---|
| `action` | `accept`（接受主預言機結果）或 `override`（手動指定） |
| `numbers` | 裁定採用的開獎號碼（`override` 時必填） |

---

## 5. A4 收單報表

#### `GET /admin/api/tickets/report`
- **用途**：查詢指定期別的柱單列表（供預覽或分頁顯示）
- **Query 參數**：`periodNo`、`gameId`、`page`、`page_size`
- **Response 欄位**

| 欄位 | 說明 |
|---|---|
| `periodNo` | 期號 |
| `items[].ticketId` | 柱單編號 |
| `items[].address` | 玩家地址 |
| `items[].numbers` | 5 個號碼 |
| `items[].amount` | 金額（USDT 字串） |
| `items[].method` | 下注方式：`auth` / `transfer` / `balance` |
| `pagination` | 分頁資訊 |

#### `GET /admin/api/tickets/export`
- **用途**：匯出全部柱單（截止後才可呼叫；後端應驗證）
- **Query 參數**：`periodNo`、`gameId`、`format=csv|xlsx`
- **Response**：檔案下載（`Content-Disposition: attachment`）

---

## 6. A5 入帳監控

#### `GET /admin/api/deposit-monitor/summary`
- **用途**：取得 A5 頁面頂部的摘要（各分頁計數、入帳上限使用量）

| 欄位 | 說明 |
|---|---|
| `pendingCount` | 待付單數 |
| `anomalyCount` | 異常轉帳數 |
| `capUsed` | 本期已登記筆數 |
| `capLimit` | 每期上限筆數 |

#### `GET /admin/api/deposit-monitor/pending`
- **用途**：待付單列表

| 欄位 | 說明 |
|---|---|
| `items[].txHash` | 轉帳 txHash |
| `items[].address` | 玩家地址 |
| `items[].amount` | 金額 |
| `items[].transferredAt` | 轉帳時間 |
| `items[].periodNo` | 所屬期號 |
| `items[].status` | `pending_register`（待登記） |

#### `GET /admin/api/deposit-monitor/registered`
- **用途**：已登記列表（含鏈上比對結果）

| 欄位 | 說明 |
|---|---|
| `items[].txHash` | 轉帳 txHash |
| `items[].address` | 玩家地址 |
| `items[].amount` | 金額 |
| `items[].ticketId` | 對應柱單 ID |
| `items[].chainMatch` | 鏈上比對：`ok` / `mismatch` |
| `items[].registeredAt` | 登記時間 |

#### `GET /admin/api/deposit-monitor/anomalies`
- **用途**：異常轉帳（已轉入餘額）列表

| 欄位 | 說明 |
|---|---|
| `items[].txHash` | 轉帳 txHash |
| `items[].address` | 玩家地址 |
| `items[].amount` | 金額 |
| `items[].reason` | 異常原因說明 |
| `items[].alertCreated` | 是否已建告警 |
| `items[].occurredAt` | 發生時間 |

#### `GET /admin/api/deposit-monitor/micro`
- **用途**：小額累積列表

| 欄位 | 說明 |
|---|---|
| `items[].address` | 玩家地址 |
| `items[].totalAmount` | 累積金額 |
| `items[].txCount` | 累積筆數 |
| `items[].lastTxAt` | 最後一筆時間 |

#### `GET /admin/api/deposit-monitor/unclaimed`
- **用途**：無主款清單（A5 預覽用；詳細認領作業在 A6）

| 欄位 | 說明 |
|---|---|
| `items[].txHash` | txHash |
| `items[].amount` | 金額 |
| `items[].transferredAt` | 轉帳時間 |
| `items[].expiresAt` | 30 天認領期限 |

#### `POST /admin/api/deposit-service/pause`（待簽交易）
- **用途**：暫停入帳服務

#### `POST /admin/api/deposit-service/replace-wallet`（待簽交易）
- **Request Body**

| 欄位 | 說明 |
|---|---|
| `newAddress` | 新入帳服務錢包地址 |

#### `POST /admin/api/deposit-service/manual-register`（待簽交易）
- **用途**：代為入帳（入帳服務停擺超過 6 小時）
- **Request Body**

| 欄位 | 說明 |
|---|---|
| `txHash` | 待處理的轉帳 txHash |
| `periodNo` | 所屬期號 |

---

## 7. A6 無主款認領

#### `GET /admin/api/unclaimed`
- **用途**：完整無主款列表（含狀態）

| 欄位 | 說明 |
|---|---|
| `items[].txHash` | txHash |
| `items[].amount` | 金額 |
| `items[].transferredAt` | 轉帳時間 |
| `items[].expiresAt` | 認領期限 |
| `items[].status` | `pending`（待認領）/ `claiming`（申請中）/ `claimed`（已認領）/ `expired`（逾期未認領） |
| `items[].claimedAddress` | 認領地址（已認領時才有） |

#### `POST /admin/api/unclaimed/verify-sig`
- **用途**：驗證玩家用原轉帳錢包對指定訊息的簽名
- **Request Body**

| 欄位 | 說明 |
|---|---|
| `txHash` | 無主款的 txHash |
| `claimerAddress` | 申請人地址（原轉帳地址） |
| `signature` | 玩家提供的簽名字串 |

- **Response**

| 欄位 | 說明 |
|---|---|
| `valid` | boolean |
| `message` | 說明 |

#### `POST /admin/api/unclaimed/:txHash/claim`（待簽交易）
- **用途**：驗簽通過後，發起認領（將款項轉給玩家）
- **Request Body**

| 欄位 | 說明 |
|---|---|
| `claimerAddress` | 認領地址 |

#### `POST /admin/api/unclaimed/:txHash/cleanup`（待簽交易，等待 48 小時）
- **用途**：逾期未認領，發起清理

---

## 8. A7 玩家查詢

#### `GET /admin/api/player`
- **用途**：依地址查詢玩家基本資料
- **Query 參數**：`address`
- **Response 欄位**

| 欄位 | 說明 |
|---|---|
| `address` | 玩家地址 |
| `balance` | 遊戲餘額（USDT 字串） |
| `isBlacklisted` | boolean |
| `referrer` | 上線地址（有則顯示，無則 null） |
| `downlineCount` | 直接下線數 |

#### `GET /admin/api/player/tickets`
- **用途**：查詢玩家柱單（可跨期）
- **Query 參數**：`address`、`drawNo`（可選，不帶則查本期）、`page`、`page_size`
- **Response 欄位**

| 欄位 | 說明 |
|---|---|
| `items[].ticketId` | 柱單編號 |
| `items[].periodNo` | 所屬期號 |
| `items[].numbers` | 5 個號碼 |
| `items[].amount` | 金額 |
| `items[].method` | 下注方式 |

#### `GET /admin/api/player/fund-history`
- **用途**：查詢玩家資金紀錄
- **Query 參數**：`address`、`page`、`page_size`
- **Response**：同前台 `GET /api/player/fund-history`，但不限本人

#### `POST /admin/api/player/blacklist`（待簽交易）
- **用途**：將地址加入黑名單（僅禁止下新注，不凍結餘額）
- **Request Body**

| 欄位 | 說明 |
|---|---|
| `address` | 目標地址 |

#### `DELETE /admin/api/player/blacklist/:address`（待簽交易）
- **用途**：解除黑名單

---

## 9. A8 推廣夥伴

#### `GET /admin/api/affiliates`
- **用途**：夥伴列表
- **Query 參數**：`page`、`page_size`、`search`（地址搜尋）
- **Response 欄位**

| 欄位 | 說明 |
|---|---|
| `items[].address` | 夥伴地址 |
| `items[].level1Count` | 直接下線數 |
| `items[].totalDownlineCount` | 含二層總下線數 |
| `items[].level1Volume` | 第一層下注總額 |
| `items[].level2Volume` | 第二層下注總額 |
| `items[].claimedEarnings` | 已領分潤總額 |
| `pagination` | 分頁 |

---

## 10. A9 財務

#### `GET /admin/api/finance/overview`
- **用途**：平台財務概覽

| 欄位 | 說明 |
|---|---|
| `platformBalance` | 平台戶餘額（USDT 字串） |
| `pendingFixedPrize` | 待付固定獎金（USDT 字串） |
| `safetyMultiple` | 安全緩衝倍數 |

#### `GET /admin/api/finance/pnl`
- **用途**：每期損益報表
- **Query 參數**：`gameId`、`page`、`page_size`
- **Response 欄位**

| 欄位 | 說明 |
|---|---|
| `items[].periodNo` | 期號 |
| `items[].betVolume` | 下注總額（USDT 字串） |
| `items[].fixedPrizePayout` | 固定獎派彩 |
| `items[].jackpotContrib` | 頭獎提撥 |
| `items[].affiliatePayout` | 分潤支出 |
| `items[].platformShare` | 平台份額 |
| `pagination` | 分頁 |

#### `GET /admin/api/finance/pnl/export`
- **Query 參數**：`gameId`、`format=csv|xlsx`
- **Response**：檔案下載

#### `POST /admin/api/finance/deposit`（待簽交易）
- **用途**：平台注資

| 欄位 | 說明 |
|---|---|
| `amount` | 注資金額（USDT 字串） |

#### `POST /admin/api/finance/withdraw`（待簽交易）
- **用途**：平台提款

| 欄位 | 說明 |
|---|---|
| `amount` | 提款金額（USDT 字串） |

---

## 11. A10 合約參數

#### `GET /admin/api/contract/params`
- **用途**：取得所有現行合約參數

| 欄位 | 說明 |
|---|---|
| `params[].key` | 參數識別碼 |
| `params[].name` | 參數顯示名稱 |
| `params[].unit` | 單位說明 |
| `params[].currentValue` | 現行值（null = 待定） |
| `params[].status` | `confirmed`（已確認）/ `pending`（待定） |
| `globalBettingEnabled` | boolean，全局收單狀態 |
| `pools[].gameId` | 彩金桶識別 |
| `pools[].enabled` | boolean，彩金桶是否啟用 |
| `depositLimit` | 每期入帳上限筆數 |

#### `POST /admin/api/contract/params/propose`（待簽交易）
- **用途**：修改合約參數（只影響之後新建的期別）
- **Request Body**

| 欄位 | 說明 |
|---|---|
| `key` | 參數識別碼 |
| `newValue` | 新值 |

#### `POST /admin/api/contract/global-betting/toggle`（待簽交易）
- **用途**：切換全局停收 / 恢復收單

| 欄位 | 說明 |
|---|---|
| `enabled` | boolean |

#### `POST /admin/api/contract/pools/:gameId/toggle`（待簽交易）
- **用途**：停用或啟用指定彩金桶

| 欄位 | 說明 |
|---|---|
| `enabled` | boolean |

#### `POST /admin/api/contract/deposit-limit`（待簽交易）
- **用途**：設定每期入帳上限筆數

| 欄位 | 說明 |
|---|---|
| `limit` | 新上限值（正整數） |

#### `POST /admin/api/contract/scheduler-wallet`（待簽交易）
- **用途**：更換排程服務錢包

| 欄位 | 說明 |
|---|---|
| `newAddress` | 新錢包地址 |

#### `POST /admin/api/contract/oracle-signer`（待簽交易，等待 48 小時）
- **用途**：更換指定預言機簽名者

| 欄位 | 說明 |
|---|---|
| `oracleIndex` | 預言機編號（0–2） |
| `newAddress` | 新簽名者地址 |

---

## 12. A11 Energy 監控

#### `GET /admin/api/energy/status`
- **用途**：Energy 存量與使用狀況

| 欄位 | 說明 |
|---|---|
| `balance` | 目前 Energy 存量 |
| `dailyUsage` | 每日平均消耗 |
| `estimatedDays` | 預估可用天數 |
| `threshold` | 目前告警門檻 |
| `status` | `ok` / `warning` / `critical` |

#### `GET /admin/api/energy/chart`
- **用途**：歷史 Energy 消耗圖表數據（最近 4 週）
- **Response 欄位**

| 欄位 | 說明 |
|---|---|
| `points[].date` | 日期（`YYYY-MM-DD`） |
| `points[].usage` | 當日消耗量 |

#### `PUT /admin/api/energy/threshold`
- **用途**：更新 Energy 告警門檻（純後端設定，不需待簽交易）
- **Request Body**

| 欄位 | 說明 |
|---|---|
| `threshold` | 新門檻值（正整數） |

---

## 13. A12 告警中心

#### `GET /admin/api/alerts`
- **Query 參數**：`status=all|open|closed`、`page`、`page_size`
- **Response 欄位**

| 欄位 | 說明 |
|---|---|
| `items[].id` | 告警 ID |
| `items[].level` | `critical`（緊急）/ `warning`（警告） |
| `items[].type` | 告警類型（見下表） |
| `items[].message` | 告警說明 |
| `items[].occurredAt` | 發生時間 |
| `items[].status` | `open`（未處理）/ `closed`（已處理） |
| `items[].resolvedAt` | 處理時間（已處理時才有） |
| `pagination` | 分頁 |

**`type` 可能值**（共 8 種，對應 §3.3）

| 值 | 說明 |
|---|---|
| `oracle_divergence` | 預言機分歧：3 台結果不一致 |
| `draw_delay` | 開獎結果延遲：官方開獎後 30 分鐘仍未上鏈 |
| `deposit_service_down` | 入帳服務停擺：超過 10 分鐘無心跳 |
| `deposit_anomaly` | 入帳比對異常：登記的 txHash 與鏈上不符 |
| `platform_balance_low` | 平台戶不足：低於待付固定獎金或預警水位 |
| `energy_low` | Energy 不足：低於告警門檻 |
| `auto_transfer_fail` | 自動轉回失敗 |
| `unclaimed_new` | 新無主款出現 |

#### `PUT /admin/api/alerts/:id/resolve`
- **用途**：標記告警為已處理

---

## 14. A13 操作紀錄

#### `GET /admin/api/audit-log`
- **用途**：所有後台操作與待簽交易紀錄（不可刪除）
- **Query 參數**：`type=all|cms|pending_tx`、`operator`（管理員地址）、`page`、`page_size`
- **Response 欄位**

| 欄位 | 說明 |
|---|---|
| `items[].id` | 紀錄 ID |
| `items[].operator` | 操作者（管理員地址） |
| `items[].type` | `cms`（CMS 修改）/ `pending_tx`（待簽交易）/ `system`（系統自動） |
| `items[].action` | 操作描述（例如「修改合約參數…」） |
| `items[].pendingTxId` | 關聯的待簽交易 ID（type = pending_tx 時才有） |
| `items[].txHash` | 已送出的鏈上 txHash（多簽完成後才有） |
| `items[].status` | `pending_sign`（等待簽名）/ `submitted`（已送出）/ `confirmed`（已上鏈）/ `failed` |
| `items[].createdAt` | 紀錄時間 |
| `pagination` | 分頁 |

---

## 15. 待確認事項

| # | 問題 | 影響頁面 | 說明 |
|---|---|---|---|
| 1 | 管理員身份驗證機制 | 全站 | Session cookie / JWT / 多簽錢包登入？ |
| 2 | 待簽交易的多簽流程 | A3、A6、A7、A9、A10 | 幾個簽名者？前台如何呈現待簽清單？ |
| 3 | CMS 排序的儲存時機 | A2 | 拖曳即時送 API，或離開頁面時統一送？ |
| 4 | A13 操作紀錄的查詢範圍 | A13 | 是否支援時間範圍篩選、操作者篩選？ |
| 5 | Energy 告警門檻修改是否也需多簽 | A11 | 目前設計為純後端設定，確認無需待簽交易 |
| 6 | A8 夥伴列表是否顯示二層下線明細 | A8 | 目前 UI 僅摘要，是否需要下鑽頁面？ |
| 7 | A5 無主款與 A6 無主款認領的資料來源是否同一個 API | A5、A6 | 目前分開定義；後端可合併為一個端點 |
