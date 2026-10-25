# YÖK Ulusal Tez Merkezi Veri Çekici

**Tarayıcı konsolunda çalışan, kurulum gerektirmeyen JavaScript aracı.** YÖK Ulusal Tez Merkezi arama sonuçlarını tarayarak tezlerin üst verilerini, Türkçe/İngilizce özetlerini ve kaynak bilgilerini Excel ile açılabilen CSV dosyasına aktarır.

> **Durum:** Araştırma amaçlı örnek araç. JavaScript sözdizimi kontrol edilmiştir; YÖK sistemi üzerinde canlı uçtan uca test bu sürüm için doğrulanmamıştır. Sayfa/servis yapısı değişirse çalışmayabilir. Resmî YÖK ürünü değildir.

## 🧭 İlk defa kullanacaklar için 10 adım

1. Bilgisayarda **Chrome** veya **Edge** tarayıcısını açın. Python, R, Node.js veya eklenti kurmanız gerekmez.
2. **https://tez.yok.gov.tr/UlusalTezMerkezi/** adresine gidin. Gerekliyse sitenin istediği doğrulama/oturum adımlarını normal yoldan tamamlayın.
3. Bu GitHub deposunun ana sayfasında **[yok_tez_scraper.js](yok_tez_scraper.js)** dosyasını açın.
4. Dosyanın üst kısmındaki **Raw (Ham)** düğmesine basın; açılan sayfadaki **kodun tamamını** kopyalayın. Kodun yalnızca bir bölümünü kopyalamayın.
5. YÖK sayfasına geri dönün ve **Ctrl + Shift + J** tuşlarına basın (Windows Chrome/Edge). Alternatif: **F12 → Console / Konsol**.
6. Kod yapıştırma işlemi güvenlik uyarısıyla engellenirse **önce kaynak kodu okuyup güvenilirliğini değerlendirin**. Tarayıcının geliştirici konsolundaki güvenlik uyarılarını dikkate alın; anlamadığınız kodu çalıştırmayın.
7. Konsolun giriş satırına kodu yapıştırıp **Enter** tuşuna basın. **Başka bir internet sitesinin konsolunda çalıştırmayın.**
8. Konsolda her arama ifadesine ilişkin sonuçlar ve ayrıntı tarama ilerlemesi görünür. Tarayıcı sekmesini kapatmayın. İşlem süresi, kayıt sayısına ve sunucu yanıtına bağlıdır.
9. İşlem tamamlanırsa tarayıcı bilgisayarınıza **egitim_programlari_tezler.csv** dosyasını indirir. İndirme engellenirse tarayıcının indirme izinlerini kontrol edin.
10. CSV dosyasını Excel'de açın. Sütunlar ayrışmıyorsa **Veri → Metinden/CSV'den**, kodlama **UTF-8**, ayraç **noktalı virgül (;)** seçin. Önce birkaç kaydı YÖK sayfasından elle karşılaştırın.

**Kısa yol:** `YÖK web sayfası → Ctrl+Shift+J → .js dosyasının tamamını yapıştır → Enter → CSV`.

## 📁 Dosyalar

| Dosya | Ne işe yarar? |
|---|---|
| [yok_tez_scraper.js](yok_tez_scraper.js) | Tarayıcı konsoluna yapıştırılacak açıklamalı kaynak kod |
| [README.md](README.md) | Baştan sona kullanım ve ayar kılavuzu |
| [docs/KOD_REHBERI.md](docs/KOD_REHBERI.md) | Veri toplama mantığı, fonksiyonlar, sınırlılıklar |
| [docs/ARASTIRMA_KONTROL_LISTESI.md](docs/ARASTIRMA_KONTROL_LISTESI.md) | Araştırma etiği, örneklem ve doğrulama kontrol listesi |
| [.gitignore](.gitignore) | Yanlışlıkla üretilen verileri Git'e eklemeyi önlemeye yardımcı olur |

## ⚙️ Çalıştırmadan önce ayarları değiştirme

`yok_tez_scraper.js` dosyasını kopyalayıp bir metin editörüne yapıştırın. Dosyanın başlangıcında şu değerleri düzenleyin ve **değiştirdiğiniz kodun tamamını** konsola yapıştırın:

| Ayar | Varsayılan | Açıklama |
|---|---|---|
| `IFADELER` | 8 eğitim alanı ifadesi | Tek tek aranacak sözcük/ifadeler. Örn: `["öğretmen eğitimi", "hizmet içi eğitim"]` |
| `ALAN` | `eğitim programları ve öğretim` | Tezin kurum/bilim dalı alanında aranacak metin; eşleşmeyen kayıtlar çıkarılır |
| `SADECE_TURKCE` | `true` | Dil alanı Türkçe **veya boş** olanları aday seçer; boş değerleri doğrulanmış Türkçe sanmayın |
| `MAKS_TEZ` | `300` | Çıktıdaki en fazla tez sayısı; hedef sayı garanti edilmez |
| `MAKS_ISTEK` | `1200` | Ayrıntısı sorgulanabilecek en fazla aday |
| `EN_AZ_SOZCUK` | `50` | Kısa özetleri **işaretler**, kayıtları elemez |
| `BEKLE` | `700` | İstekler arasındaki milisaniye cinsinden gecikme; erişim garantisi vermez |
| `DOSYA` | `egitim_programlari_tezler.csv` | İndirilecek dosyanın adı |

**Önemli:** `ALAN` yalnızca tez kaydının yer/bilim dalı metninde aynı ifadenin geçmesine dayalı bir filtredir. Eşdeğer bölüm adları ve yazım varyasyonları kaçırılabilir. Uygunluk puanı bilimsel bir sınıflandırma modeli değildir; sadece tarama sırasını etkiler.

### Başka bir alan için örnek

```javascript
const IFADELER = ["fen eğitimi", "bilim eğitimi"];
const ALAN = "fen bilgisi eğitimi";
const SADECE_TURKCE = true;
const MAKS_TEZ = 100;
```

Bu yalnızca **ayar örneğidir**, tek başına çalışan betik değildir. Tam dosyanın ayar bölümünde değişiklik yapın.

## 📊 CSV'deki sütunlar

`Tez No`, `Başlık`, `Yazar`, `Yıl`, `Tür`, `Dil`, `Yer`, `Yer (ayrıntı)`, `Danışman`, `Konu`, `Anahtar kelimeler`, `Özet`, `Özet sözcük sayısı`, `Özet yeterli (≥ 50 sözcük)`, `İngilizce özet`, `APA künyesi`, `Tez sayfası`, `Kaynak kimliği (kayitNo|tezNo)`, `Bulunan arama ifadesi`.

- Tekrarlayan arama sonuçları **kayitNo|tezNo** birleşimine göre tekilleştirilir.
- Kayıtların kaynağı ve tekrar doğrulaması için tez sayfası ile kaynak kimliği tutulur.
- Özet sözcük sayısı, boşlukla ayrılmış parçaları sayar; dilbilimsel token/sözcük çözümlemesi değildir.
- CSV **UTF-8 BOM**, `;` ayraç ve çift tırnaklı alanlar kullanır; Excel'de formül olarak yorumlanabilecek bazı hücre başları metne dönüştürülür.
- Veriler kaynağın sunduğu alanlarla sınırlıdır; eksik alan ve hatalı biçimlendirme görülebilir.

## 🔧 Sorun giderme

| Sorun | Ne kontrol edilmeli? |
|---|---|
| Konsolda `fetch`, HTTP 403/429 veya erişim hatası | YÖK sitesine erişim/oturum, site kuralları ve ağ yanıtı. Engeli aşmayı denemeyin; istekleri durdurun |
| `0 aday`, beklenmedik boş sonuç | Arama ifadesi, alan filtresi, sonuç sayfası HTML düzeni ve güncel site yapısı |
| CSV boş veya beklenenden az | `MAKS_TEZ` üst sınırdır, alan/dil filtresi kayıtları azaltır; ayrıntı istekleri başarısız olabilir |
| Excel Türkçe karakterleri bozuyor | Excel'de **Veri → Metinden/CSV'den → UTF-8** kullanın |
| Tüm veri bir sütunda | Ayraç olarak `;` belirleyin |
| Kod konsola yapışmıyor | Geliştirici konsolunun güvenlik yönergelerini inceleyin; kodu anlamadan yapıştırmayın |
| Başka araştırmada farklı sonuç | Arama anını, ifadeleri ve filtreleri not edin; site içeriği ve indeks değişmiş olabilir |

## 🔬 Araştırmada kullanırken

Bu araç **örneklem geçerliliğini, eksiksiz taramayı veya metinlerin kullanım iznini garanti etmez**. Arama indeksinin sunduğu sonuçlar sınırlı olabilir; `MAKS_ISTEK` sebebiyle bütün tezlerin ayrıntısı incelenmeyebilir. Araştırmanızda veri çekme tarihini, sorguları, alan/dil ölçütlerini, tekrar çıkarma ve dışlama sayılarını, örnek doğrulama kayıtlarını ve eksikleri raporlayın. Metin madenciliği, konu modelleme ve diğer analizlerde yazarların eserlerine atıf yapın.

## ⚖️ Kullanım koşulları ve sorumluluk

Resmî site ve ilgili mevzuat, erişim hakları, kullanım koşulları, telif hakları ve kişisel veri yükümlülükleri önceliklidir. **Bu yazılım YÖK tarafından geliştirilmiş veya onaylanmış değildir.** Yalnızca erişim izniniz bulunan kamuya açık verilerle, makul sıklıkta kullanın. Erişim kontrollerini, CAPTCHA'yı veya hız limitlerini aşmaya çalışmayın. İndirilen tez metinlerini ve kişisel verileri paylaşmadan önce kullanım hakkını ayrıca değerlendirin. Varsayılan `700` ms bekleme, sunucu politikalarına uygunluk veya IP engellenmemesi garantisi değildir.

## 📖 Teknik ayrıntılar

Bkz. [Kod Rehberi](docs/KOD_REHBERI.md) ve [Araştırma Kontrol Listesi](docs/ARASTIRMA_KONTROL_LISTESI.md).

**Proje deposu:** https://github.com/Tatung40/yok-tez-merkezi-scraper
