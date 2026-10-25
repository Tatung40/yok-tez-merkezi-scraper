# Akademik Veri Toplama ve Araştırma Kontrol Listesi

Bu kontrol listesi YÖK Tez Merkezi'nden derlenen tez üst verileri ve özetlerle yapılan bilimsel çalışmalarda kullanılmak üzere hazırlanmıştır.

## Veri toplamadan önce
- [ ] Araştırma sorusu, evren ve örnekleme yaklaşımını tanımladım.
- [ ] Kullanacağım tüm arama ifadelerini, dillerini ve arama tarihini kaydettim.
- [ ] `ALAN`, `MAKS_ISTEK`, `MAKS_TEZ`, `EN_AZ_SOZCUK`, `BEKLE` gibi ayarları not ettim.
- [ ] Kaynak sitenin kullanım koşulları, erişim hakları, telif ve kişisel veri kurallarını kontrol ettim.
- [ ] İstek sıklığının makul olduğundan emin oldum; erişim kontrollerini aşmıyorum.
- [ ] Kodun tarayıcı konsolunda çalışacağını ve etkilerini inceledim.

## Veri toplarken
- [ ] Konsolda her sorgunun `toplam`, `listelenen` ve `yeni_aday` sayılarını kaydettim.
- [ ] `MAKS_ISTEK` ve `MAKS_TEZ` sınırları nedeniyle dışarıda kalan kayıtların olabileceğini belirttim.
- [ ] HTTP veya ayrıştırma hataları varsa günlüklerini sakladım.
- [ ] Dil alanı boş kayıtları Türkçe olduğu doğrulanmış gibi göstermedim.
- [ ] Site engellemesi/limit uyarısı varsa işlemi durdurup site koşullarını kontrol ettim.

## CSV indirdikten sonra
- [ ] CSV'yi Excel'de UTF-8 ve `;` ayraçla açtım.
- [ ] Farklı yıllardan rastgele tez kayıtlarını resmî kaynağa karşı kontrol ettim.
- [ ] Tez numarası, yazar, yıl, başlık, özet ve danışman bilgilerini çapraz kontrol ettim.
- [ ] Kayıt kimliği üzerinden tekrarları denetledim; farklı teknik kimlikli olası tekrarları ayrıca inceledim.
- [ ] Boş, çok kısa veya hatalı ayrıştırılmış özetleri işaretledim.
- [ ] Araştırma konusuna göre alan yanlış eşleşmelerini elle denetledim.
- [ ] Dışlanan kayıt sayısını ve dışlama gerekçelerini raporladım.
- [ ] Özet uygunluk etiketinin yalnızca sözcük sayısı eşiği olduğunu açıkladım.
- [ ] Verinin tam sayım olmadığını ve web arama indeksine bağlı sınırlılıklarını belirttim.

## Makale veya tez yöntem bölümünde raporlama
- Veri kaynağı ve erişim tarihi
- Arama ifadelerinin tam listesi
- Dil ve alan kısıtları; varsayılan kod ayarları
- İlk aday sayısı, yinelenen kayıtların çıkarılması, ayrıntısı incelenen ve son veri setindeki kayıt sayısı
- Başarısız sorgular, eksik veriler ve olası seçim yanlılığı
- Manuel doğrulama prosedürü ve sayısı
- Analize giren metinlerin ön işleme kuralları
- Kaynak çalışmaların doğru atıfları ve kullanım haklarına ilişkin değerlendirme

> **Etik not:** Bir tez sayfasının görüntülenebilmesi, tez metninin yeniden dağıtımına veya tüm metinlerin sınırsız kullanımına otomatik izin vermez. Telif, kullanım koşulları ve ilgili mevzuat ayrı değerlendirilmelidir.

Ana kullanım kılavuzu: [README](../README.md).
