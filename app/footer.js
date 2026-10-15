/* ══ footer.js — 共用頁腳 §G1 ══════════════════════
   修改頁腳只需改此一檔案                               */
(function () {
  var el = document.getElementById('site-footer');
  if (!el) return;
  el.innerHTML = `
<footer style="background:#0e0b07;border-top:1px solid rgba(196,154,42,0.15);" class="px-4 py-12">
  <div class="max-w-5xl mx-auto">
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-10">
      <div class="text-center sm:text-left">
        <h4 class="font-bold text-xs uppercase tracking-widest mb-4" style="color:#e8b84b;" data-i18n="footer.docs">說明</h4>
        <ul class="space-y-2 text-sm">
          <li><a href="rules.html" class="flex items-center gap-2 justify-center sm:justify-start" style="color:#6a5a45;transition:color 0.15s ease;" onmouseover="this.style.color='#f0e6d2'" onmouseout="this.style.color='#6a5a45'"><i class="fa-solid fa-book-open text-xs w-4 text-center"></i> <span data-i18n="footer.rules">遊戲規則</span></a></li>
          <li><a href="rules.html#bet-method" class="flex items-center gap-2 justify-center sm:justify-start" style="color:#6a5a45;transition:color 0.15s ease;" onmouseover="this.style.color='#f0e6d2'" onmouseout="this.style.color='#6a5a45'"><i class="fa-solid fa-shield-halved text-xs w-4 text-center"></i> <span data-i18n="footer.risk">風險揭露</span></a></li>
        </ul>
      </div>
      <div class="text-center sm:text-left">
        <h4 class="font-bold text-xs uppercase tracking-widest mb-4" style="color:#e8b84b;" data-i18n="footer.contracts">合約地址</h4>
        <ul class="space-y-3 text-xs">
          <li><div class="mb-0.5" style="color:#4a3c2a;" data-i18n="footer.fund">資金合約</div><a href="#" target="_blank" rel="noopener" class="font-mono flex items-center gap-1 justify-center sm:justify-start" style="color:#5ba3c9;"><i class="fa-solid fa-arrow-up-right-from-square text-xs"></i> TBD</a></li>
          <li><div class="mb-0.5" style="color:#4a3c2a;" data-i18n="footer.539">539 彩金桶合約</div><a href="#" target="_blank" rel="noopener" class="font-mono flex items-center gap-1 justify-center sm:justify-start" style="color:#5ba3c9;"><i class="fa-solid fa-arrow-up-right-from-square text-xs"></i> TBD</a></li>
          <li><div class="mb-0.5" style="color:#4a3c2a;" data-i18n="footer.oracle">預言機合約</div><a href="#" target="_blank" rel="noopener" class="font-mono flex items-center gap-1 justify-center sm:justify-start" style="color:#5ba3c9;"><i class="fa-solid fa-arrow-up-right-from-square text-xs"></i> TBD</a></li>
        </ul>
      </div>
      <div class="text-center sm:text-left">
        <h4 class="font-bold text-xs uppercase tracking-widest mb-4" style="color:#e8b84b;" data-i18n="footer.resources">資源</h4>
        <ul class="space-y-2 text-sm">
          <li><a href="#" target="_blank" rel="noopener" class="flex items-center gap-2 justify-center sm:justify-start" style="color:#6a5a45;transition:color 0.15s ease;" onmouseover="this.style.color='#f0e6d2'" onmouseout="this.style.color='#6a5a45'"><i class="fa-solid fa-file-contract text-xs w-4 text-center"></i> <span data-i18n="footer.audit">審計報告</span></a></li>
          <li><a href="https://t.me/placeholder" target="_blank" rel="noopener" class="flex items-center gap-2 justify-center sm:justify-start" style="color:#6a5a45;transition:color 0.15s ease;" onmouseover="this.style.color='#f0e6d2'" onmouseout="this.style.color='#6a5a45'"><i class="fa-brands fa-telegram text-sm w-4 text-center"></i> <span data-i18n="footer.telegram">Telegram 客服</span></a></li>
        </ul>
      </div>
    </div>
    <div class="pt-6 text-center text-xs leading-relaxed"
         style="border-top:1px solid rgba(196,154,42,0.1);color:#3a2e22;"
         data-i18n-html="footer.copyright">
      © 2026 〔品牌名〕&ensp;·&ensp;固定獎金由平台保證支付&ensp;·&ensp;請遵守所在地區法規，受限地區用戶不得使用本服務
    </div>
  </div>
</footer>`;
})();
