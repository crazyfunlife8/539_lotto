> 文件用途：記錄開獎來源（今彩539／加州天天樂）、TRON 手續費、預言機現況的查證結果，供幣種與開獎架構決策引用
> 退場條件：開獎預言機與幣種架構正式寫入「系統架構」開發文件後失效
> 歸檔位置：`_archive/研究/`

# 開獎來源與 TRON 費用查證

查核時間：2026-10-01 17:44（WebSearch / WebFetch / TRON 主網 `wallet/getchainparameters` 實測）
標籤：已驗證＝Tier1 或鏈上實測；衝突＝來源不一；待驗證＝無官方來源。

## A. 台灣今彩539

| 項目 | 結論 | 狀態 | 來源 |
|---|---|---|---|
| 號碼 | 01–39 開 5 個 | 已驗證 | 官方 API、https://taiwanlotteryevent.com.tw/events/game-rules-2/ |
| 開獎日 | 週一至週六；春節會加開週日（例：民國114年 1/26、2/2、2/9）→ 以期號為準、不可寫死星期 | 已驗證 | API 實測 2026-09；https://lotto.ctbcbank.com/news1131126.htm |
| 開獎時間 | 20:30（UTC+8） | 已驗證 | https://www.taiwanlottery.com/lotto/lotto_lastest_result/ |
| 官方銷售截止 | 20:00 | 待驗證 | 僅二手站 |
| 程式讀取 | `https://api.taiwanlottery.com/TLCAPIWeB/Lottery/Daily539Result?period&month=YYYY-MM&pageNum=1&pageSize=50` 回 JSON（`period`、`lotteryDate`、`drawNumberSize`…）；無公開文件、可能改版 | 可用／條款待驗證 | 實測 115000237 期 [2,7,9,14,33] 與 https://udn.com/news/story/7266/9786714 相符 |
| 異常應變 | 天災或不可抗力會改期另行公告 | 已驗證 | https://www.taiwanlottery.com/run_lottery/info/ |

## B. 加州 Fantasy 5（天天樂）

| 項目 | 結論 | 狀態 | 來源 |
|---|---|---|---|
| 號碼 | 1–39 開 5 個 | 已驗證 | https://www.calottery.com/en/draw-games/fantasy-5 |
| 開獎日 | 每天 | 已驗證 | 同上 |
| 銷售截止 | 18:30 PT；18:30–18:35 為 draw break | 已驗證 | 同上 |
| 開獎時間 | 18:30 PT（官方／lottery.net）vs 18:35（Wikipedia） | 衝突 | https://en.wikipedia.org/wiki/California_State_Lottery |
| 程式讀取 | 內部端點 `calottery.com/api/DrawGameApi/DrawGamePastDrawResults/{gameId}/{page}/{size}`；實測回 403 擋爬蟲 | 待驗證 | https://gist.github.com/bramp/6ae5a9977f805e18cbee0b0b362d9fef |

換算台灣時間：夏令（PDT）18:30 PT＝隔日 09:30；冬令（PST）＝隔日 10:30。

## C. TRON 手續費（主網鏈上參數）

| 項目 | 數值 | 狀態 |
|---|---|---|
| Energy 單價 | 100 sun（2025-08-29 第104號提案由 210 降至 100） | 已驗證 |
| Bandwidth | 1000 sun/byte；每日免費 600 | 已驗證 |
| TRX 轉帳 | 約 275 bandwidth；免費額度約 2 筆/天，用完約 0.275 TRX/筆；轉新帳戶另收 1 TRX | 已驗證 |
| USDT 轉帳 | 收款方有 USDT：64,285 energy ≈ 6.43 TRX＋0.345 TRX；收款方 0 USDT：130,285 energy ≈ 13.03 TRX | 已驗證 |
| USDT approve（新 spender） | 99,764 energy ≈ 10 TRX | 已驗證 |
| 質押換 energy | 每質押 1 TRX/天約 9.73 energy | 已驗證 |
| 租 energy | 約 24–74 sun/energy，USDT 轉帳約 1.6–2.6 TRX | 待驗證（市價浮動） |
| 合約動態倍率 | 熱門合約超門檻乘倍率，上限 3.4；新合約初始 0 | 已驗證 |

來源：https://developers.tron.network/docs/resource-model 、https://developers.tron.network/docs/paying-for-resources

## D. 合約代付與免手續費

- `consume_user_resource_percent=0` → 部署方代付 100% energy，每次上限 `origin_energy_limit`；部署方 energy 不足時差額轉由呼叫者燒 TRX。（已驗證）
- **Bandwidth 一律由呼叫者付**，部署方只能代付 energy → 玩家錢包仍需少量 TRX 或靠每日免費 600。（已驗證）
- GasFree（TIP-712 元交易）只支援 TRC20 轉帳、不支援任意合約呼叫；費率 1 vs 1.5 USDT 說法衝突。https://gasfree.io/docs/GasFree_specification.html
- TRON 原生帳戶抽象：查無官方資料（待驗證）。

## E. TRON 預言機

- Chainlink 在 TRON 只有價格資料；**VRF 與 Functions 皆不支援 TRON**（已驗證）。https://docs.chain.link/vrf/v2-5/supported-networks
- WINkLink VRF 主網 Coordinator `TZCz1BcnYviUNDiLvG6ZeuC477YupDgDA7`，最後一次回填為 2025-06-12，之後無活動 → 是否可用待驗證。
- WINkLink AnyAPI 需自建 Operator 節點，無公開主網節點（已驗證）。
- **結論：開獎結果上鏈須自建 m-of-n 多簽預言機**，搭配爭議窗口與逾時退款。

## F. 已知陷阱

1. 開獎日不規則（春節加開）→ 以期號為準。
2. 改期／取消 → 合約需有延期與退款路徑。
3. 加州 draw break 與夏令時間 → 截止時間依時區換算。
4. 兩邊資料來源皆無公開文件、加州擋爬蟲 → 多資料源＋逾時退款。
