# 前台 API 需求文件

> 版本：v0.1 草稿
> 最後更新：2026-10-07
> 規格來源：`05_前後台功能規格.md`、`02_系統架構.md`、各頁 `實作對照/P*.md`

---

## 1. 總覽

前台（玩家端網站）的所有資料來源，從前端角度統一視為「後端 API」。  
後端內部再決定要直讀合約、查索引服務 DB、還是讀自己的 CMS 資料庫，前端不需要關心。

### 1.1 API 類型分類

| 類型 | 說明 | 前端角色 |
|---|---|---|
| **後端 REST API — 讀取** | GET，取得顯示用資料 | 被動讀取 |
| **後端 REST API — 寫入** | POST/PUT，送出非鏈上資料 | 主動送出 |
| **後端 REST API — 合約寫入代理** | POST，後端組 tx 後前端簽名送出，或後端代送 | 需錢包簽名 |
| **入帳服務 API** | POST，② 轉帳下注用，通報交易編號 | 主動送出 |

> **合約直讀**：理論上可直接從前端讀鏈，但為了統一介面、降低前端複雜度，建議由後端包成 REST API 提供。確認直讀或走 API 由後端架構決定，本文件以 API 的形式描述需求。

### 1.2 全站通用約定

- 所有 API 回應包含統一錯誤格式：`{ "code": "...", "message": "..." }`
- 需要錢包身份識別的請求，帶入 header：`X-Wallet-Address: <TRC20 地址>`
- 金額單位：USDT，字串形式（避免浮點誤差），例如 `"128450.00"`
- 地址對他人顯示時遮蔽格式：`T前5碼…後4碼`（§1.5），API 可回傳原始地址，由前端遮蔽；或後端直接回傳已遮蔽版本（待後端決定）
- 分頁：列表型 API 使用 `page` + `page_size` 參數（或 cursor，待後端決定）
- 多語系：FAQ、公告等內容型 API 回傳所有語言欄位，前端根據 `lang` 選擇顯示

---

## 2. 後端 REST API — 讀取（GET）

### 2.1 全站共通

#### `GET /api/config`
- **用途**：取得全站靜態設定（Telegram 連結、合約地址、審計報告連結、官方開獎頁連結模板）
- **使用頁面**：全站（P1、P2、P7、P8）
- **不需身份驗證**
- **Response 欄位**

| 欄位 | 說明 |
|---|---|
| `telegramUrl` | Telegram 客服連結 |
| `contractFund` | 資金合約地址 |
| `contract539` | 539 彩金桶合約地址 |
| `contractOracle` | 預言機合約地址 |
| `auditReportUrl` | 審計報告連結（上線後補） |
| `officialDrawUrlTemplate` | 官方開獎頁連結模板（帶入期號） |
| `explorerTxUrlTemplate` | 區塊鏈瀏覽器交易連結模板 |

---

#### `GET /api/status`
- **用途**：全站狀態橫幅（§1.4）：全域停收、錯誤網路等
- **使用頁面**：全站
- **不需身份驗證**
- **Response 欄位**

| 欄位 | 說明 |
|---|---|
| `bettingPaused` | `boolean`，是否全域停收新注 |
| `maintenanceMessage` | 停收原因說明（三語，可為 null） |

---

### 2.2 P1 首頁

#### `GET /api/pools/current`
- **用途**：取得各彩金桶本期資料（第一版只有 539）
- **使用頁面**：P1（已連接狀態彩金桶卡片）、P2（頁面頂部資訊列）
- **不需身份驗證**
- **Response 欄位**

| 欄位 | 說明 |
|---|---|
| `gameId` | 彩金桶識別（例如 `"539"`） |
| `periodNo` | 本期官方期號 |
| `deadlineAt` | 截止時間（ISO 8601，台灣時間） |
| `drawAt` | 預計開獎時間 |
| `projectedJackpot` | 目前彩池金額（USDT 字串） |
| `status` | 期別狀態：`open` / `closed` / `drawing` / `settled` |

---

#### `GET /api/ticker`
- **用途**：跑馬燈內容（上期中獎名單，遮蔽地址＋金額）
- **使用頁面**：P1（已連接狀態）
- **不需身份驗證**
- **Response 欄位**

| 欄位 | 說明 |
|---|---|
| `items[]` | 陣列 |
| `items[].address` | 遮蔽地址（`TXyzA…b12c`） |
| `items[].matchCount` | 中幾碼 |
| `items[].prize` | 獲得金額（USDT 字串） |
| `items[].periodNo` | 所屬期號 |

---

#### `GET /api/announcements`
- **用途**：系統公告列表
- **使用頁面**：P1（已連接狀態）
- **不需身份驗證**
- **Response 欄位**

| 欄位 | 說明 |
|---|---|
| `items[]` | 陣列（依排序欄位排序） |
| `items[].id` | 公告 ID |
| `items[].title.en` | 英文標題 |
| `items[].title.zhTw` | 繁中標題 |
| `items[].title.zhCn` | 簡中標題 |
| `items[].body.en` | 英文內文 |
| `items[].body.zhTw` | 繁中內文 |
| `items[].body.zhCn` | 簡中內文 |
| `items[].publishedAt` | 發布時間 |

---

#### `GET /api/draws/latest`
- **用途**：上一期開獎號碼
- **使用頁面**：P1（訪客＋已連接）
- **不需身份驗證**
- **Query 參數**：`gameId=539`
- **Response 欄位**

| 欄位 | 說明 |
|---|---|
| `periodNo` | 期號 |
| `numbers` | 開獎號碼陣列（5 個整數） |
| `officialDrawUrl` | 官方開獎頁連結 |
| `chainRecordUrl` | 鏈上紀錄連結（區塊瀏覽器） |
| `drawnAt` | 開獎時間 |

---

### 2.3 P2 選號下注

#### `GET /api/player/last-period-numbers`
- **用途**：取得玩家上一期的全部號碼組（「重下上期號碼」功能）
- **使用頁面**：P2
- **需要身份驗證**
- **Query 參數**：`gameId=539`
- **Response 欄位**

| 欄位 | 說明 |
|---|---|
| `periodNo` | 上一期期號 |
| `tickets[]` | 每組 5 個號碼的陣列 |

---

#### `GET /api/player/saved-numbers`
- **用途**：取得玩家收藏的號碼組合
- **使用頁面**：P2
- **需要身份驗證**
- **Response 欄位**

| 欄位 | 說明 |
|---|---|
| `items[]` | 陣列 |
| `items[].id` | 收藏 ID |
| `items[].numbers` | 5 個號碼的陣列 |
| `items[].savedAt` | 收藏時間 |

---

#### `GET /api/player/balance`
- **用途**：取得玩家遊戲餘額（用於 ③ 餘額下注可選判斷）
- **使用頁面**：P2、P4
- **需要身份驗證**
- **Response 欄位**

| 欄位 | 說明 |
|---|---|
| `balance` | 遊戲餘額（USDT 字串） |

---

#### `GET /api/player/allowance`
- **用途**：取得玩家對資金合約的 USDT 授權額度
- **使用頁面**：P2（① 授權下注判斷）、P4（授權管理顯示）
- **需要身份驗證**
- **Response 欄位**

| 欄位 | 說明 |
|---|---|
| `allowance` | 剩餘授權額度（USDT 字串） |

---

### 2.4 P3 我的注單

#### `GET /api/player/tickets`
- **用途**：取得玩家注單列表
- **使用頁面**：P3
- **需要身份驗證**
- **Query 參數**：`gameId=539`、`status=active|closed|settled`（可複選）、`page`、`page_size`
- **Response 欄位**

| 欄位 | 說明 |
|---|---|
| `items[]` | 注單陣列 |
| `items[].ticketId` | 注單 ID |
| `items[].periodNo` | 所屬期號 |
| `items[].numbers` | 5 個號碼 |
| `items[].method` | 下注方式：`auth` / `transfer` / `balance` |
| `items[].amount` | 金額（USDT 字串） |
| `items[].status` | 注單狀態（詳見下方） |
| `items[].periodStatus` | 所屬期別狀態 |
| `items[].drawAt` | 開獎時間（`drawTime`） |
| `items[].drawnNumbers` | 開獎號碼（開獎後才有） |
| `items[].matchCount` | 中幾碼（開獎後才有） |
| `items[].prize` | 獲得金額（開獎後才有） |
| `items[].prizeStatus` | 入帳狀態：`pending` / `credited` / `transferred` / `transfer_failed` |
| `pagination` | 分頁資訊 |

**`status` 可能值**

| 值 | 說明 |
|---|---|
| `pending` | ② 轉帳下注待確認 |
| `active` | 已成立 |
| `cancelled` | 已取消 |
| `settled` | 已結算 |

**`periodStatus` 可能值**

| 值 | 說明 |
|---|---|
| `open` | 本期接受中 |
| `closed` | 已截止、等待開獎 |
| `disputed` | 爭議中 |
| `refunding` | 退款中 |
| `refunded` | 已退款完成 |
| `cancelled` | 已取消（平台取消） |
| `settled` | 已結算 |

---

### 2.5 P4 會員中心

#### `GET /api/player/bet-history`
- **用途**：下注紀錄
- **使用頁面**：P4
- **需要身份驗證**
- **Query 參數**：`gameId=539`、`page`、`page_size`
- **Response 欄位**

| 欄位 | 說明 |
|---|---|
| `items[]` | 陣列 |
| `items[].periodNo` | 期號 |
| `items[].drawAt` | 開獎時間 |
| `items[].drawnNumbers` | 開獎號碼（5 個） |
| `items[].numbers` | 玩家選號（5 個） |
| `items[].method` | 下注方式 |
| `items[].poolTotal` | 彩池總額 |
| `items[].matchCount` | 中幾碼 |
| `items[].prize` | 獲得金額 |
| `items[].modifiedAt` | 改單時間（有改單時才有） |
| `items[].cancelledAt` | 取消時間（有取消時才有） |

---

#### `GET /api/player/fund-history`
- **用途**：資金紀錄（儲值、提領、獎金入帳等）
- **使用頁面**：P4
- **需要身份驗證**
- **Query 參數**：`page`、`page_size`
- **Response 欄位**

| 欄位 | 說明 |
|---|---|
| `items[]` | 陣列 |
| `items[].type` | 類型：`deposit` / `withdraw` / `prize` / `auto_transfer` / `cancel_refund` / `period_refund` / `abnormal_transfer` |
| `items[].amount` | 金額（USDT 字串，正數＝入帳，負數＝扣款） |
| `items[].txHash` | 鏈上交易 Hash |
| `items[].chainTxUrl` | 區塊瀏覽器連結 |
| `items[].createdAt` | 時間 |

---

### 2.6 P5 歷史紀錄

#### `GET /api/draws`
- **用途**：歷史開獎列表
- **使用頁面**：P5
- **不需身份驗證**
- **Query 參數**：`gameId=539`、`periodNo`（查指定期）、`page`、`page_size`
- **Response 欄位**

| 欄位 | 說明 |
|---|---|
| `items[]` | 陣列 |
| `items[].periodNo` | 期號 |
| `items[].drawnNumbers` | 開獎號碼（5 個） |
| `items[].officialDrawUrl` | 官方開獎頁連結 |
| `items[].chainRecordUrl` | 鏈上結果連結 |
| `items[].poolTotal` | 彩池總額 |
| `items[].winners[]` | 中獎明細陣列 |
| `items[].winners[].address` | 已遮蔽地址 |
| `items[].winners[].matchCount` | 中幾碼 |
| `items[].winners[].prize` | 獲得金額 |
| `items[].betDetails[]` | 其他下注明細（待確認：是否顯示全部或僅中獎者） |
| `items[].betDetails[].address` | 已遮蔽地址 |
| `items[].betDetails[].numbers` | 所選號碼 |
| `pagination` | 分頁資訊 |

---

### 2.7 P6 推廣夥伴

#### `GET /api/affiliate/stats`
- **用途**：推廣統計（下線數、下注總額）
- **使用頁面**：P6
- **需要身份驗證**
- **Response 欄位**

| 欄位 | 說明 |
|---|---|
| `promoCode` | 玩家專屬推廣碼（用於組出 `?ref=<promoCode>` 連結） |
| `level1Count` | 第一層下線人數 |
| `level2Count` | 第二層下線人數 |
| `level1Volume` | 第一層下線下注總額（USDT 字串） |
| `level2Volume` | 第二層下線下注總額（USDT 字串） |
| `claimableEarnings` | 可領分潤金額（USDT 字串） |

---

#### `GET /api/affiliate/claim-history`
- **用途**：分潤領取紀錄
- **使用頁面**：P6
- **需要身份驗證**
- **Query 參數**：`page`、`page_size`
- **Response 欄位**

| 欄位 | 說明 |
|---|---|
| `items[]` | 陣列 |
| `items[].amount` | 領取金額 |
| `items[].txHash` | 鏈上交易 Hash |
| `items[].chainTxUrl` | 區塊瀏覽器連結 |
| `items[].claimedAt` | 領取時間 |

---

### 2.8 P7 遊戲規則

#### `GET /api/rules/prize-table`
- **用途**：獎項表（金額來自當期合約參數）
- **使用頁面**：P7
- **不需身份驗證**
- **Response 欄位**

| 欄位 | 說明 |
|---|---|
| `ticketPrice` | 每注金額（USDT 字串） |
| `prizes[]` | 陣列（中 1–5 碼） |
| `prizes[].matchCount` | 中幾碼（1–5） |
| `prizes[].type` | `fixed`（固定獎）或 `jackpot`（頭獎彩池） |
| `prizes[].amount` | 固定獎金額（頭獎為 null） |
| `prizes[].poolPct` | 頭獎派出比例（固定獎為 null），例如 `0.8` |
| `jackpotRolloverPct` | 無人中頭獎保留比例（例如 `0.2`）【待定】 |

---

### 2.9 P8 客服

#### `GET /api/faq`
- **用途**：FAQ 列表（內容由後台 A2 管理）
- **使用頁面**：P8
- **不需身份驗證**
- **Query 參數**：`lang=en|zh-tw|zh-cn`（可選，不帶則回傳所有語言）
- **Response 欄位**

| 欄位 | 說明 |
|---|---|
| `categories[]` | 分類陣列 |
| `categories[].id` | 分類 ID |
| `categories[].label.en` | 英文分類名稱 |
| `categories[].label.zhTw` | 繁中分類名稱 |
| `categories[].label.zhCn` | 簡中分類名稱 |
| `categories[].items[]` | 該分類的問答 |
| `categories[].items[].id` | FAQ ID |
| `categories[].items[].question.en` | 英文問題 |
| `categories[].items[].question.zhTw` | 繁中問題 |
| `categories[].items[].question.zhCn` | 簡中問題 |
| `categories[].items[].answer.en` | 英文答案 |
| `categories[].items[].answer.zhTw` | 繁中答案 |
| `categories[].items[].answer.zhCn` | 簡中答案 |

---

## 3. 後端 REST API — 寫入（POST / PUT / DELETE）

### 3.1 收藏號碼

#### `POST /api/player/saved-numbers`
- **用途**：新增收藏號碼
- **使用頁面**：P2
- **需要身份驗證**
- **Request Body**

| 欄位 | 說明 |
|---|---|
| `numbers` | 5 個號碼的陣列 |

- **Response**：`{ "id": "..." }`

---

#### `DELETE /api/player/saved-numbers/:id`
- **用途**：刪除收藏號碼
- **使用頁面**：P2
- **需要身份驗證**

---

## 4. 入帳服務 API（② 轉帳下注專用）

#### `POST /api/transfer-bet/report`
- **用途**：② 轉帳下注完成後，前端立即回報交易編號給入帳服務
- **使用頁面**：P2
- **需要身份驗證**
- **Request Body**

| 欄位 | 說明 |
|---|---|
| `txHash` | 玩家 USDT 轉帳的鏈上 Hash |
| `periodNo` | 下注期號 |
| `signedMessage` | 前一步驟錢包簽署的訊息（含號碼）|
| `signature` | 簽名內容 |

- **Response**

| 欄位 | 說明 |
|---|---|
| `status` | `pending_confirm` / `registered` / `error` |
| `message` | 狀態說明 |

---

#### `GET /api/transfer-bet/status/:txHash`
- **用途**：輪詢 ② 轉帳下注登記狀態
- **使用頁面**：P2
- **需要身份驗證**
- **Response**

| 欄位 | 說明 |
|---|---|
| `status` | `pending_confirm` / `registered` / `abnormal_late` / `abnormal_short` / `abnormal_overpaid` / `abnormal_tiny` |
| `ticketIds` | 成立的柱單 ID 陣列（登記成功時） |

---

## 5. 合約寫入（需錢包簽名，前端直接呼叫合約或後端代組 tx）

> 以下操作均需玩家錢包簽名。實際呼叫方式（前端直接 TronWeb / 後端代組 unsigned tx 再由前端簽）由後端架構決定。

| 操作 | 使用頁面 | 合約 | 說明 |
|---|---|---|---|
| USDT `approve` | P2、P4 | USDT 合約 | ① 授權下注、授權儲值前置步驟 |
| ① 授權下注 | P2 | 彩金桶合約 | 帶入期號、號碼陣列、推廣碼（首次下注時） |
| ② USDT `transfer` | P2 | USDT 合約 | 目標地址＝彩金桶合約，金額＝總注金 |
| ③ 餘額下注 | P2 | 彩金桶合約 | 帶入期號、號碼陣列、推廣碼（首次下注時） |
| 改號碼 | P3 | 彩金桶合約 | 帶入柱單 ID、新號碼陣列 |
| 取消柱單 | P3 | 彩金桶合約 | 帶入柱單 ID |
| 提領 | P4 | 資金合約 | 帶入金額（或全部） |
| 授權儲值 | P4 | 資金合約 | approve 後呼叫存入函式 |
| 領取分潤 | P6 | 資金合約 | — |

> **推廣碼綁定**：首次下注時，若 localStorage 中存有推廣碼，將推廣碼附帶在下注交易中一次完成鏈上永久綁定（不需獨立交易）。

---

## 6. 錢包簽署訊息（② 轉帳下注）

#### `wallet.signMessage`
- **用途**：② 轉帳下注流程第一步，讓玩家對號碼與期號簽名，確認下注意圖
- **使用頁面**：P2
- **訊息內容格式**（待後端確認）

```
下注確認
期號：{periodNo}
號碼：{n1}-{n2}-{n3}-{n4}-{n5}
地址：{walletAddress}
時間：{timestamp}
```

---

## 7. 待確認事項彙整

| # | 問題 | 影響頁面 | 來源 |
|---|---|---|---|
| 1 | 每注金額確切數值 | P2、P4、P7 | 等經濟模型 |
| 2 | 每期購物車組數上限 | P2 | §P2 標記【待定】 |
| 3 | 各合約函式名稱與 ABI | P2、P3、P4、P6 | `04_智能合約規格.md` |
| 4 | 中 1–3 碼固定獎金額 | P2、P7 | 等經濟模型 |
| 5 | 無人中頭獎的處理方式 | P1、P7 | 業主決定 |
| 6 | 提領是否收 USDT 手續費 | P4 | §P4 標記【待定】 |
| 7 | 推廣分潤比例（兩層各幾 %） | P6、P7 | 等賠率表 |
| 8 | 推廣碼生成規則（格式、長度） | P2、P6 | 規格未說明 |
| 9 | 管理多簽門檻（3/5 取幾） | 合約相關 | §02 標記【待定】 |
| 10 | 受限地區清單 | P7 | 合規團隊提供 |
| 11 | P5 下注明細是否顯示全部玩家或僅中獎者 | P5 | §P5 未明確 |
| 12 | FAQ 分類清單是否固定或由 API 動態取得 | P8 | §A2 |
| 13 | 地址遮蔽由前端或後端處理 | 全站 | §1.5 |
| 14 | 合約直讀改由後端 API 包裝，或前端直接呼叫 TronWeb | 全站 | 後端架構決定 |
| 15 | ② 簽署訊息的確切格式與內容 | P2 | 入帳服務設計 |
