/**
 * YÖK Ulusal Tez Merkezi Veri Çekme Aracı
 * Geliştirici araçları > Console üzerinde, yalnızca https://tez.yok.gov.tr adresinde çalıştırın.
 * Python veya eklenti kurulumu gerekmez. Site yapısı değişirse betik güncelleme gerektirebilir.
 */
(async () => {
  // 1) ARAŞTIRMA AYARLARI — yalnızca burayı düzenleyebilirsiniz.
  const IFADELER = ["program geliştirme", "program değerlendirme", "öğretim programı", "eğitim programı",
                    "öğretim tasarımı", "öğretim stratejisi", "öğretim yöntemi", "öğrenme-öğretme süreci"];
  const ALAN = "eğitim programları ve öğretim"; // Yer / bilim dalı alanında aranır
  const SADECE_TURKCE = true; // Dil bilgisi boş kayıtlar da aday olur
  const MAKS_TEZ = 300;       // CSV'ye yazılacak en fazla tez
  const EN_AZ_SOZCUK = 50;    // Kısa özetleri yalnızca işaretler; dışlamaz
  const BEKLE = 700;         // İstekler arası ms; blokajı önleme garantisi yoktur
  const MAKS_ISTEK = 1200;   // Ayrıntısı incelenecek en fazla aday kayıt
  const DOSYA = "egitim_programlari_tezler.csv";
  const BASE = location.origin + "/UlusalTezMerkezi";

  // 2) TÜRKÇE / HTML YARDIMCILARI
  const kucuk = s => String(s || "").normalize("NFC").toLocaleLowerCase("tr");
  const uyku = ms => new Promise(r => setTimeout(r, ms));
  const metin = h => (new DOMParser().parseFromString(String(h || ""), "text/html").body.textContent || "")
    .replace(/\s+/g, " ").trim();
  const etiketsiz = v => metin(String(v || "").split("</strong>").slice(-1)[0]);

  // 3) İSTEK — ağ hatasında bir kez daha dener
  async function istek(url, secenek) {
    for (let d = 1; d <= 2; d++) {
      try {
        const r = await fetch(url, { credentials: "include", ...secenek });
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r;
      } catch (e) {
        if (d === 2) throw e;
        await uyku(5000);
      }
    }
  }

  // 4) ARAMA SONUÇLARINDAN ADAY KAYITLARIN ÇIKARILMASI
  async function ara(ifade) {
    const body = new URLSearchParams({ nevi: "6", izin: "0", tur: "0", neden: ifade, islem: "1" });
    const html = await (await istek(BASE + "/SearchTez", { method: "POST", body })).text();
    const m = html.match(/const\s+referenceData\s*=\s*(\{[\s\S]*?\})\s*;/);
    const ref = m ? JSON.parse(m[1].replace(/,(\s*})/g, "$1")) : {};
    const t = html.match(/Arama\s+sonucunda\s+([\d.]+)\s+kayıt\s+bulundu/);
    const doc = new DOMParser().parseFromString(html, "text/html");
    const tezler = [...doc.querySelectorAll("div.result-card[data-index]")].map(k => {
      const meta = (ref[k.dataset.index] || {}).meta || {};
      const g = [...k.querySelectorAll("strong")].find(s => /^\s*Tez\s*No\s*:/i.test(s.textContent));
      return {
        kayitNo: k.dataset.kayitno || "", tezNo: k.dataset.tezno || "",
        "Tez No": g && g.parentElement ? g.parentElement.textContent.replace(/^\s*Tez\s*No\s*:\s*/i, "").trim() : "",
        "Başlık": (k.querySelector(".card-title") || {}).textContent?.trim() || "",
        "Yazar": meta.author || "", "Yıl": meta.year || "", "Tür": meta.type || "", "Dil": meta.lang || "",
        "Konu": meta.subject || "", "Yer": meta.yer || ""
      };
    });
    return { toplam: t ? +t[1].replace(/\./g, "") : 0, tezler };
  }

  // 5) ANAHTAR SÖZCÜK TARAMASI, DİL FİLTRESİ VE TEKRAR KONTROLÜ
  const adaylar = [], gorulen = new Set(), hatalar = [], rapor = [];
  let ornekGosterildi = false;
  for (const ifade of IFADELER) {
    try {
      const { toplam, tezler } = await ara(ifade);
      if (!ornekGosterildi && tezler.length) {
        console.log("ℹ️ Örnek kayıtlar (Yer / Konu / Dil):", tezler.slice(0, 3).map(t => [t.Yer, t.Konu, t.Dil]));
        ornekGosterildi = true;
      }
      const uygun = tezler.filter(t => !SADECE_TURKCE || ["türkçe", ""].includes(kucuk(t.Dil)));
      let yeni = 0;
      for (const t of uygun) {
        const a = t.kayitNo + "|" + t.tezNo, yer = kucuk(t.Yer), konu = kucuk(t.Konu);
        // Alan bilgisi eşleşmesine daha yüksek öncelik; nihai filtre yine ayrıntıda.
        t.puan = (yer.includes(ALAN) ? 4 : 0) + (yer.includes("eğitim bilimleri") ? 2 : 0) +
                 (yer.includes("eğitim") ? 1 : 0) + (konu.includes("eğitim") ? 1 : 0);
        if (t.tezNo && !gorulen.has(a)) {
          gorulen.add(a); t["Bulunan arama ifadesi"] = ifade; adaylar.push(t); yeni++;
        }
      }
      rapor.push({ ifade, toplam, listelenen: tezler.length, yeni_aday: yeni });
      console.log("🔍 '" + ifade + "': toplam " + toplam + ", listelenen " + tezler.length + ", yeni aday " + yeni);
    } catch (e) {
      hatalar.push({ asama: "arama", ne: ifade, hata: String(e) });
      console.warn("⚠️ '" + ifade + "' aranamadı:", e);
    }
    await uyku(BEKLE);
  }

  // 6) AYRINTI SAYFASI, ALAN FİLTRESİ VE ÖZET KALİTESİ GÖSTERGELERİ
  adaylar.sort((x, y) => y.puan - x.puan);
  const secilen = adaylar.slice(0, MAKS_ISTEK), satirlar = [];
  let alanDisi = 0;
  console.log("📥 " + adaylar.length + " tekil aday; en fazla " + secilen.length + " ayrıntı incelenecek.");
  for (const [i, t] of secilen.entries()) {
    if (satirlar.length >= MAKS_TEZ) break;
    const s = { ...t };
    delete s.puan;
    try {
      const url = BASE + "/tezBilgiDetay.jsp?kayitNo=" + encodeURIComponent(t.kayitNo) +
                  "&tezNo=" + encodeURIComponent(t.tezNo);
      const d = JSON.parse((await (await istek(url)).text()).trim() || "{}");
      Object.assign(s, {
        "Özet": metin(d.trOzet), "İngilizce özet": metin(d.enOzet),
        "Anahtar kelimeler": etiketsiz(d.anahtarKelimeTr),
        "Danışman": etiketsiz(d.danisman), "Yer (ayrıntı)": metin(d.yer),
        "APA künyesi": metin(d.apa_ref)
      });
    } catch (e) {
      hatalar.push({ asama: "ayrıntı", ne: t["Tez No"] || t.tezNo, hata: String(e) });
      s["Özet"] = "";
    }
    if (!kucuk((s["Yer (ayrıntı)"] || "") + " " + t.Yer).includes(ALAN)) {
      alanDisi++;
      if ((i + 1) % 50 === 0) console.log("   " + (i + 1) + " ayrıntı incelendi; alan tezi: " + satirlar.length);
      await uyku(BEKLE);
      continue;
    }
    s["Özet sözcük sayısı"] = (s["Özet"] || "").split(/\s+/).filter(Boolean).length;
    s["Özet yeterli (≥ " + EN_AZ_SOZCUK + " sözcük)"] =
      s["Özet sözcük sayısı"] >= EN_AZ_SOZCUK ? "Evet" : "Hayır";
    s["Tez sayfası"] = BASE + "/tezDetay.jsp?id=" + t.kayitNo + "&no=" + t.tezNo;
    s["Kaynak kimliği (kayitNo|tezNo)"] = t.kayitNo + "|" + t.tezNo;
    satirlar.push(s);
    if (satirlar.length % 25 === 0) console.log("   alan tezi: " + satirlar.length + " (incelenen " + (i + 1) + ")");
    await uyku(BEKLE);
  }

  // 7) UTF-8 BOM + NOKTALI VİRGÜL AYRAÇLI, EXCEL UYUMLU CSV
  const sutunlar = ["Tez No", "Başlık", "Yazar", "Yıl", "Tür", "Dil", "Yer", "Yer (ayrıntı)", "Danışman", "Konu",
    "Anahtar kelimeler", "Özet", "Özet sözcük sayısı", "Özet yeterli (≥ " + EN_AZ_SOZCUK + " sözcük)",
    "İngilizce özet", "APA künyesi", "Tez sayfası", "Kaynak kimliği (kayitNo|tezNo)",
    "Bulunan arama ifadesi"];
  const hucre = v => {
    let x = String(v ?? "").replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, " ");
    if (/^[=+\-@]/.test(x)) x = "'" + x; // Elektronik tablo formül enjeksiyonunu azaltır
    return '"' + x.replace(/"/g, '""') + '"';
  };
  const csv = "\uFEFF" + [sutunlar.map(hucre).join(";"),
    ...satirlar.map(s => sutunlar.map(c => hucre(s[c])).join(";"))].join("\r\n");
  const blobURL = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = blobURL; a.download = DOSYA;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(blobURL), 60000);

  // 8) ARAŞTIRMACIYA ÇALIŞMA RAPORU
  console.table(rapor);
  if (hatalar.length) console.table(hatalar);
  console.log("✅ " + satirlar.length + " alan tezi '" + DOSYA + "' dosyasına yazıldı. Alan dışı: " +
              alanDisi + ". Hata: " + hatalar.length);
})();
