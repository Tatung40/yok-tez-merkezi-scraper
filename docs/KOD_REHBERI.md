# Kod Rehberi — YÖK Ulusal Tez Merkezi Veri Çekici

Bu kılavuz, [ana JavaScript dosyasındaki](../yok_tez_scraper.js) her aşamanın **ne yaptığını, nerede çalıştığını ve hangi riskleri taşıdığını** açıklar. Kod Python'da değil, **YÖK Ulusal Tez Merkezi sayfasının geliştirici konsolunda** çalıştırılır.

## 1. Çalışma akışı

1. Araştırmacı `IFADELER`, `ALAN` ve diğer sabitleri belirler.
2. `ara(ifade)`, her arama ifadesini **SearchTez** uç noktasına POST isteği olarak gönderir.
3. HTML arama sonuçları `DOMParser` ile ayrıştırılır; sonuç kartları ve `referenceData` alanından üst veriler alınır.
4. Dil filtresi ve yinelenen kayıt denetimi uygulanır.
5. Alanla ilişkili olduğu tahmin edilen kayıtların ayrıntılarına öncelik tanınır.
6. `tezBilgiDetay.jsp` üzerinden özet, anahtar kelime, danışman, kurum ve APA künyesi istenir.
7. Tezin Yer / Yer (ayrıntı) bilgisi `ALAN` ifadesini içeriyorsa CSV'ye eklenir.
8. Her kaydın Türkçe özet sözcük sayısı hesaplanır; kısa özet etiketi eklenir.
9. Bellekteki tablo UTF-8 CSV olarak kullanıcı bilgisayarına indirilir.
10. Konsolda sorgu özeti ile karşılaşılan hatalar gösterilir.

**Not:** Site HTML'sinin, uç noktalarının veya alan adlarının değişmesi ayrıştırmayı bozabilir; kodun canlı sistemde her çalışacağı garanti edilmez.

## 2. Ayar bloğu

| Değişken | Görevi | Önemli sınır |
|---|---|---|
| `IFADELER` | Arama sorgularının listesi | Sorgular eşanlamlı tüm varyasyonları kapsamayabilir |
| `ALAN` | Bölüm/alan metin eşleşmesi | Tam anlamsal sınıflandırma değildir |
| `SADECE_TURKCE` | Türkçe veya dil bilgisi boş olan adayları seçer | Boş dil kaydı Türkçe olarak doğrulanmış değildir |
| `MAKS_TEZ` | Kaydedilen kayıt üst sınırı | Bu sayıya erişileceği garanti değildir |
| `MAKS_ISTEK` | Detayı okunacak aday üst sınırı | Bütün arama evrenini temsil etmeyebilir |
| `EN_AZ_SOZCUK` | Özet uzunluğu uyarı eşiği | Kayıtları filtrelemez |
| `BEKLE` | Tekil istekler arasında gecikme (ms) | Erişim engelini önleme garantisi değildir |
| `DOSYA` | Oluşturulan CSV'nin adı | Dosya yalnızca kullanıcı cihazına indirilir |

## 3. Fonksiyonlar

**`kucuk(s)`**: Unicode NFC normalizasyonundan sonra Türkçe küçük harfe dönüştürür. Alan adları ve dil filtresinde kullanılır.

**`uyku(ms)`**: JavaScript Promise yardımıyla belirtilen milisaniye kadar gecikme üretir.

**`metin(html)`**: HTML parçasını DOMParser ile düz metne çevirir ve fazla boşlukları temizler. Karmaşık HTML'nin bütün anlamsal biçimlendirmesini korumaz.

**`etiketsiz(v)`**: Kaynaktan gelen bir HTML alanında son kapanış `</strong>` etiketinden sonraki kısmı alır. Kaynak şablonu değişirse bilgi kaybedebilir.

**`istek(url, secenek)`**: Aynı origin'e tarayıcı oturum bilgileriyle ağ isteği gönderir; başarısız olursa 5 saniye bekleyip ikinci kez dener. Erişim yetkisi oluşturmaz ve kısıtlamaları aşmaz.

**`ara(ifade)`**: `SearchTez` sonuç metnini çözümler. `div.result-card[data-index]`, `.card-title`, meta alanları ve kayıt numaralarını derler. Arama sonucu sayfa içi HTML'yi esas alır; bütün sayfaların gezildiği anlamına gelmez.

**`hucre(v)`**: Kontrol karakterlerini temizler; başında `=`, `+`, `-`, `@` bulunan değerlerin elektronik tabloda formül olarak çalışmasını azaltmak için başına tek tırnak koyar; iç çift tırnakları kaçırır.

## 4. Uygunluk puanı neden var?

Sıralama puanı `Yer` alanının hedefi içermesine 4, `eğitim bilimleri` içermesine 2, `eğitim` içermesine 1, `Konu` alanının `eğitim` içermesine 1 puan verir. **Bu yalnızca varsayılan eğitim alanı için hazırlanmış pratik bir önceliklendirmedir.** Başka disiplinlere uygulanırken de kod bu eğitim terimlerini aramaya devam eder. Puan nicel bir bilimsel kalite değerlendirmesi ya da olasılık değildir.

## 5. Tekilleştirme ve dışlama

Aynı `kayitNo|tezNo` birleşimine sahip arama sonuçları yalnızca bir kez aday olarak alınır. Aynı tezin birden fazla teknik kaydı varsa otomatik birleşmeyebilir. Nihai alan filtresi `Yer (ayrıntı)` ve `Yer` bilgisini birleştirip `ALAN` alt dizgesini arar. Bu nedenle alan adları arasındaki yazım farkları **yanlış negatif** üretebilir. Dil alanı boşsa aday filtresini geçebilir.

## 6. Hatalar ve raporlama

Konsolda `console.table(rapor)` her arama ifadesine ait toplam/listelenen/yeni aday sayısını gösterir. `console.table(hatalar)` başarısız arama/ayrıntı çağrılarını listeler. Hata alınsa bile bazı kayıtlar CSV'ye girebilir; **başarılı dosya indirilmesi eksiksiz veri toplandığı anlamına gelmez**.

## 7. Çıktı ve güvenlik

CSV, `\uFEFF` (UTF-8 BOM), `;` ayırıcı ve CRLF satır sonlarıyla oluşturulur. `Blob` URL'sinden indirilir. JavaScript sitenin açık bulunduğu tarayıcı oturumunda çalışır; kodun kaynağını denetlemeden geliştirici konsoluna hiçbir komut yapıştırmayın.

## 8. Yeniden üretilebilirlik

Çalışma tarihi, tarayıcı sürümü, kaynak betiğin commit kimliği, kullanılan ayarlar, arama raporu, hatalar, kayıt sayısı ve manuel kontrol edilen tez numaralarını araştırma günlüğünüzde saklayın. Başka tarihlerde sonuçlar değişebilir.

Daha ayrıntılı araştırma kalite aşamaları için [Araştırma Kontrol Listesi](ARASTIRMA_KONTROL_LISTESI.md) sayfasına bakın.
