import { MenuData, Category, MenuItem, AnnouncementBanner } from "@/lib/types";

export const initialData: MenuData = {
  announcements: [
    { id: "ann-1", text: "🎉 Bu hafta sonu canlı müzik! Cuma & Cumartesi 21:00'de buluşalım.", isActive: true, type: "promo" },
    { id: "ann-2", text: "⚠️ Mutfak siparişleri saat 23:00'e kadar alınmaktadır.", isActive: false, type: "info" },
  ],
  categories: [
    { id: "c11", name: "PICCHIO SPECIAL'S & APERITIFS", order: 1, isActive: true },
    { id: "c12", name: "CLASSIC KOKTEYL", order: 2, isActive: true },
    { id: "c1", name: "FIÇI BİRALAR", order: 3, isActive: true },
    { id: "c2", name: "ŞİŞE BİRALAR", order: 4, isActive: true },
    { id: "c3", name: "WHISKEY'S", order: 5, isActive: true },
    { id: "c4", name: "VOTKA'S", order: 6, isActive: true },
    { id: "c5", name: "GIN'S", order: 7, isActive: true },
    { id: "c6", name: "ROM'S & COGNAC", order: 8, isActive: true },
    { id: "c7", name: "LİKÖR & VERMUT", order: 9, isActive: true },
    { id: "c8", name: "SHOT'S", order: 10, isActive: true },
    { id: "c9", name: "ALKOLLÜ SICAK KAHVELER", order: 11, isActive: true },
    { id: "c10", name: "ŞARAPLAR", order: 12, isActive: true },
    { id: "c13", name: "KAHVELER & SICAK İÇECEKLER", order: 13, isActive: true },
    { id: "c14", name: "MOKTEYLLER & SOFT DRINKS", order: 14, isActive: true },
    { id: "c15", name: "YEMEK & ÇEREZ", order: 15, isActive: true },
  ],
  items: [
    // --- PICCHIO SPECIAL'S & APERITIFS ---
    // Tüm alkollü kokteyller → "Sülfitler" (kural: her alkol sülfitler içerir)
    { id: "i-spec-1", categoryId: "c11", name: "PICCHIO STAR", price: 399, isAvailable: true, isSignature: true, isRecommended: true, tags: ["Tatlı", "Ferah"], image: "/cocktail-star.png", description: "Absolut Vanilya bazlı, Passion Fruit ile taçlandırılmış imza kokteyl", ingredients: "Absolut Vanilya · Passoa · Passion Fruit · Lime Suyu · Vegan Foamer", allergens: "Sülfitler" },
    { id: "i-spec-2", categoryId: "c11", name: "GRINCH", price: 399, isAvailable: true, isSignature: true, isRecommended: true, tags: ["Ekşi", "Ferah"], image: "/cocktail-grinch.png", description: "London Dry Gin ve Kuzu Kulağı ile hazırlanan özgün kokteyl", ingredients: "London Dry Gin · Kuzu Kulağı · Lime Suyu · Vegan Foamer", allergens: "Sülfitler" },
    { id: "i-spec-3", categoryId: "c11", name: "HELLIOS", price: 399, isAvailable: true, isSignature: true, tags: ["Ekşi", "Meyveli"], description: "Absolut Raspberry ve orman meyvelerinin büyülü karışımı", ingredients: "Absolut Raspberry · Ahududu Likörü · Orman Meyvesi · Lime Suyu · Vegan Foamer", allergens: "Sülfitler" },
    { id: "i-spec-4", categoryId: "c11", name: "CASPER", price: 399, isAvailable: true, isSignature: true, tags: ["Tatlı", "Meyveli", "Ferah"], description: "Tekila bazlı, bergamot ve şeftali aromalı hafif kokteyl", ingredients: "Olmeca Silver · Limon Suyu · Bergamot · Vanilya · Şeftali · Vegan Foamer", allergens: "Sülfitler" },
    { id: "i-spec-5", categoryId: "c11", name: "FUEGO", price: 399, isAvailable: true, isSignature: true, tags: ["Ferah", "Tatlı"], description: "Pink gin ve beyaz şeftali ile zarif bir keskinlik", ingredients: "Pink Gin · White Peach · Lime Suyu · Vegan Foamer", allergens: "Sülfitler" },
    { id: "i-spec-6", categoryId: "c11", name: "PICCHIO SURPRISE", price: 399, isAvailable: true, isSignature: true, tags: ["Tatlı", "Meyveli"], description: "Gizli tarif — her seferinde farklı bir deneyim", ingredients: "…Secret…", allergens: "Sülfitler" },
    // COFFEINA: alkol (Havana) + Disaronno/badem → Sert Kabuklu Meyveler + Baileys/Krema → Süt Ürünleri
    { id: "i-spec-7", categoryId: "c11", name: "COFFEINA", price: 449, isAvailable: true, isSignature: true, isRecommended: true, tags: ["Sert", "Kahveli"], image: "/cocktail-coffeina.png", description: "Havana rom ve likör karışımıyla hazırlanan yoğun kahveli kokteyl", ingredients: "Havana · Disaronno · Baileys · Kahlua · Krema · Muz", allergens: "Sülfitler, Süt Ürünleri, Sert Kabuklu Meyveler" },
    // Spritz'ler: alkol + prosecco → Sülfitler
    { id: "i-spec-8", categoryId: "c11", name: "SPRITZ (Aperol)", price: 399, isAvailable: true, tags: ["Ferah", "Tatlı"], ingredients: "Aperol, Prosecco, Soda, Portakal Dilimi", allergens: "Sülfitler" },
    { id: "i-spec-9", categoryId: "c11", name: "SPRITZ (Campari)", price: 399, isAvailable: true, tags: ["Bitter", "Ferah"], ingredients: "Campari, Prosecco, Soda, Portakal Dilimi", allergens: "Sülfitler" },
    { id: "i-spec-10", categoryId: "c11", name: "SPRITZ (Lemoncello)", price: 399, isAvailable: true, tags: ["Ekşi", "Ferah"], ingredients: "Limoncello, Prosecco, Soda, Limon Dilimi", allergens: "Sülfitler" },
    { id: "i-spec-11", categoryId: "c11", name: "SPRITZ (Hugo)", price: 399, isAvailable: true, tags: ["Tatlı", "Ferah"], ingredients: "Elderflower Şurubu, Prosecco, Soda, Nane", allergens: "Sülfitler" },

    // --- CLASSIC KOKTEYL --- (tümü alkollü → Sülfitler; süt/krema içerenler ek Süt Ürünleri)
    { id: "i-clas-1", categoryId: "c12", name: "Mojito", price: 399, isAvailable: true, tags: ["Ferah", "Ekşi"], ingredients: "Beyaz Rom, Lime, Nane, Şeker, Soda", allergens: "Sülfitler" },
    { id: "i-clas-2", categoryId: "c12", name: "Pina Colada", price: 399, isAvailable: true, tags: ["Tatlı", "Meyveli"], ingredients: "Beyaz Rom, Hindistan Cevizi Kreması, Ananas Suyu", allergens: "Sülfitler, Süt Ürünleri" },
    { id: "i-clas-3", categoryId: "c12", name: "Margarita", price: 399, isAvailable: true, tags: ["Ekşi", "Sert"], ingredients: "Tekila, Triple Sec, Lime Suyu, Tuz", allergens: "Sülfitler" },
    { id: "i-clas-4", categoryId: "c12", name: "NEGRONI", price: 449, isAvailable: true, tags: ["Bitter", "Sert"], ingredients: "Gin, Campari, Sweet Vermouth", allergens: "Sülfitler" },
    { id: "i-clas-5", categoryId: "c12", name: "OLD FASHIONED", price: 449, isAvailable: true, tags: ["Sert", "Tatlı"], ingredients: "Bourbon, Angostura Bitters, Şeker, Portakal Kabuğu", allergens: "Sülfitler" },
    { id: "i-clas-6", categoryId: "c12", name: "BOULEVARDIER", price: 449, isAvailable: true, tags: ["Sert", "Bitter"], ingredients: "Bourbon, Campari, Sweet Vermouth", allergens: "Sülfitler" },
    { id: "i-clas-7", categoryId: "c12", name: "LONG ISLAND ICE TEA", price: 449, isAvailable: true, tags: ["Sert", "Ferah"], ingredients: "Votka, Gin, Rom, Tekila, Triple Sec, Limon, Cola", allergens: "Sülfitler" },

    // --- FIÇI BİRALAR --- (Bira: Glüten + Sülfitler)
    { id: "i-fici-1", categoryId: "c1", name: "GUINNESS", volume: "25cl / 50cl", isAvailable: true, ingredients: "Su, Arpa Maltı, Arpa, Şerbetçiotu", allergens: "Glüten, Sülfitler", tags: ["Sert"] },
    { id: "i-fici-2", categoryId: "c1", name: "TUBORG 100 MALT", volume: "33cl / 50cl / 100cl", isAvailable: true, ingredients: "Su, Arpa Maltı, Şerbetçiotu", allergens: "Glüten, Sülfitler" },
    { id: "i-fici-3", categoryId: "c1", name: "TUBORG GOLD MALT", volume: "2.5l Biraver", isAvailable: true, ingredients: "Su, Arpa Maltı, Şerbetçiotu", allergens: "Glüten, Sülfitler" },
    { id: "i-fici-4", categoryId: "c1", name: "Carlsberg", volume: "33cl / 50cl / 100cl / 2.5l", isAvailable: true, ingredients: "Su, Arpa Maltı, Şerbetçiotu", allergens: "Glüten, Sülfitler" },
    { id: "i-fici-5", categoryId: "c1", name: "Carlsberg LUNA", volume: "33cl / 50cl", isAvailable: true, ingredients: "Su, Arpa Maltı, Şerbetçiotu, Doğal Aroma", allergens: "Glüten, Sülfitler" },
    { id: "i-fici-6", categoryId: "c1", name: "1664 BLANC", volume: "33cl / 50cl", isAvailable: true, ingredients: "Su, Buğday Maltı, Arpa Maltı, Şerbetçiotu, Kişniş, Portakal Kabuğu", allergens: "Glüten, Sülfitler" },
    { id: "i-fici-7", categoryId: "c1", name: "FREDERIK YAKIMA IPA", volume: "33cl", isAvailable: true, ingredients: "Su, Arpa Maltı, Yakima Şerbetçiotu", allergens: "Glüten, Sülfitler" },
    { id: "i-fici-8", categoryId: "c1", name: "Weihenstephan HEFEWEISSBIER", volume: "33cl / 50cl", isAvailable: true, ingredients: "Su, Buğday Maltı, Arpa Maltı, Şerbetçiotu, Maya", allergens: "Glüten, Sülfitler" },
    { id: "i-fici-9", categoryId: "c1", name: "KILKENNY", volume: "25cl / 50cl", isAvailable: true, ingredients: "Su, Arpa Maltı, Şerbetçiotu, Maya", allergens: "Glüten, Sülfitler" },

    // --- ŞİŞE BİRALAR --- (Bira: Glüten + Sülfitler)
    { id: "i-sise-1", categoryId: "c2", name: "GUINNESS (44cl Kutu)", price: 279, isAvailable: true, allergens: "Glüten, Sülfitler" },
    { id: "i-sise-2", categoryId: "c2", name: "TUBORG 100 MALT (50cl)", price: 159, isAvailable: true, allergens: "Glüten, Sülfitler" },
    { id: "i-sise-3", categoryId: "c2", name: "TUBORG ICE (33cl)", price: 199, isAvailable: true, allergens: "Glüten, Sülfitler" },
    { id: "i-sise-4", categoryId: "c2", name: "TUBORG 100 Filtresiz MALT (50cl)", price: 199, isAvailable: true, allergens: "Glüten, Sülfitler" },
    { id: "i-sise-5", categoryId: "c2", name: "TUBORG 100 MALT Amber (50cl)", price: 199, isAvailable: true, allergens: "Glüten, Sülfitler" },
    { id: "i-sise-6", categoryId: "c2", name: "Carlsberg (50cl)", price: 169, isAvailable: true, allergens: "Glüten, Sülfitler" },
    { id: "i-sise-7", categoryId: "c2", name: "Carlsberg LUNA (50cl)", price: 199, isAvailable: true, allergens: "Glüten, Sülfitler" },
    { id: "i-sise-8", categoryId: "c2", name: "1664 BLANC (33cl)", price: 229, isAvailable: true, allergens: "Glüten, Sülfitler" },
    { id: "i-sise-9", categoryId: "c2", name: "FREDERIK Serisi (35cl)", price: 229, isAvailable: true, allergens: "Glüten, Sülfitler", description: "India Pale Ale, Yakima IPA, Wheat IPA, Marzen Lager, Brown Ale, Local, Meipa" },
    { id: "i-sise-10", categoryId: "c2", name: "SOL CERVEZA (33cl)", price: 239, isAvailable: true, allergens: "Glüten, Sülfitler" },
    { id: "i-sise-11", categoryId: "c2", name: "DESPERADOS (33cl)", price: 239, isAvailable: true, allergens: "Glüten, Sülfitler", ingredients: "Bira, Tekila Aroması" },
    { id: "i-sise-12", categoryId: "c2", name: "Weihenstephan (33cl)", price: 239, isAvailable: true, allergens: "Glüten, Sülfitler", description: "HEFEWEISSBIER / VITUS" },
    { id: "i-sise-13", categoryId: "c2", name: "GRIMBERGEN (33cl)", price: 225, isAvailable: true, allergens: "Glüten, Sülfitler", description: "BLONDE / DOUBLE AMBREE" },

    // --- WHISKEY'S --- (alkol → Sülfitler)
    { id: "i-whi-1", categoryId: "c3", name: "JACK DANIEL'S", variants: [{label:"Tek", price: 350}, {label:"Duble", price: 550}], isAvailable: true, ingredients: "Tennessee Whiskey, %40 ABV", description: "Klasik / Honey / Fire", allergens: "Sülfitler" },
    { id: "i-whi-2", categoryId: "c3", name: "JAMESON", variants: [{label:"Tek", price: 320}, {label:"Duble", price: 510}], isAvailable: true, ingredients: "İrlanda Whiskey, %40 ABV", allergens: "Sülfitler" },
    { id: "i-whi-3", categoryId: "c3", name: "CHIVAS REGAL", variants: [{label:"Tek", price: 350}, {label:"Duble", price: 550}], isAvailable: true, ingredients: "Blended Scotch Whisky, %40 ABV", allergens: "Sülfitler" },
    { id: "i-whi-4", categoryId: "c3", name: "CHIVAS 18", variants: [{label:"Tek", price: 500}, {label:"Duble", price: 750}], isAvailable: true, ingredients: "Premium Blended Scotch, %40 ABV", allergens: "Sülfitler" },
    { id: "i-whi-5", categoryId: "c3", name: "J. WALKER BLACK LABEL", variants: [{label:"Tek", price: 350}, {label:"Duble", price: 550}], isAvailable: true, ingredients: "Blended Scotch Whisky, %40 ABV", allergens: "Sülfitler" },
    { id: "i-whi-6", categoryId: "c3", name: "GENTLEMAN JACK", variants: [{label:"Tek", price: 375}, {label:"Duble", price: 575}], isAvailable: true, ingredients: "Tennessee Whiskey, Çift damıtma, %40 ABV", allergens: "Sülfitler" },
    { id: "i-whi-7", categoryId: "c3", name: "MACALLAN 12", variants: [{label:"Tek", price: 450}, {label:"Duble", price: 700}], isAvailable: true, ingredients: "Single Malt Scotch, Sherry Oak, %40 ABV", allergens: "Sülfitler" },
    { id: "i-whi-8", categoryId: "c3", name: "JIM BEAM", variants: [{label:"Tek", price: 350}, {label:"Duble", price: 550}], isAvailable: true, ingredients: "Kentucky Bourbon, %40 ABV", allergens: "Sülfitler" },

    // --- VOTKA'S --- (alkol → Sülfitler)
    { id: "i-vot-1", categoryId: "c4", name: "ABSOLUT", price: 300, isAvailable: true, ingredients: "İsveç Votkası, %40 ABV", description: "Klasik, Vanilia, Citron, Raspberry", allergens: "Sülfitler" },
    { id: "i-vot-2", categoryId: "c4", name: "SMIRNOFF", price: 300, isAvailable: true, ingredients: "Triple Distilled Votka, %40 ABV", allergens: "Sülfitler" },
    { id: "i-vot-3", categoryId: "c4", name: "BELVEDERE", price: 450, isAvailable: true, ingredients: "Polonya Premium Votka, %40 ABV", allergens: "Sülfitler" },

    // --- GIN'S --- (alkol → Sülfitler)
    { id: "i-gin-1", categoryId: "c5", name: "BEEFEATER / PINK", price: 300, isAvailable: true, ingredients: "London Dry Gin, Ardıç, %40 ABV", allergens: "Sülfitler" },
    { id: "i-gin-2", categoryId: "c5", name: "GORDON'S", price: 300, isAvailable: true, ingredients: "London Dry Gin, Ardıç, %37.5 ABV", allergens: "Sülfitler" },
    { id: "i-gin-3", categoryId: "c5", name: "BOMBAY SAPPHIRE", price: 400, isAvailable: true, ingredients: "Vapour Infused Gin, 10 Botanik, %40 ABV", allergens: "Sülfitler" },

    // --- ROM'S & COGNAC --- (alkol → Sülfitler)
    { id: "i-rom-1", categoryId: "c6", name: "HAVANA / BACARDI / CAPTAIN MORGAN", price: 350, isAvailable: true, ingredients: "Karayip Romu, %40 ABV", allergens: "Sülfitler" },
    { id: "i-rom-2", categoryId: "c6", name: "HENNESSY", variants: [{label:"Tek", price: 400}, {label:"Duble", price: 600}], isAvailable: true, ingredients: "V.S Cognac, Fransa, %40 ABV", allergens: "Sülfitler" },

    // --- LİKÖR & VERMUT ---
    // Kahlua/Malibu vb: alkol likörü → Sülfitler
    // Baileys: alkol + krema → Sülfitler, Süt Ürünleri
    // Disaronno: alkol + amaretto/badem → Sülfitler, Sert Kabuklu Meyveler
    // Garrone Vermut: alkol → Sülfitler
    { id: "i-lik-1", categoryId: "c7", name: "KAHLUA / MALIBU / LEMONCELLO / ŞEFTALİ / NANE", price: 250, isAvailable: true, ingredients: "Çeşitli meyve ve bitki bazlı likörler", allergens: "Sülfitler" },
    { id: "i-lik-2", categoryId: "c7", name: "BAILEYS", price: 275, isAvailable: true, ingredients: "İrlanda Kremalı Likör, Kakao, Vanilya, %17 ABV", allergens: "Sülfitler, Süt Ürünleri" },
    { id: "i-lik-3", categoryId: "c7", name: "DISARONNO", price: 300, isAvailable: true, ingredients: "Amaretto Likörü, Badem Aroması, %28 ABV", allergens: "Sülfitler, Sert Kabuklu Meyveler" },
    { id: "i-lik-4", categoryId: "c7", name: "GARRONE Serisi", price: 250, isAvailable: true, description: "Triple Sec / Rosso / Extra Dry / Bianco", ingredients: "İtalyan Vermut, Botanikler", allergens: "Sülfitler" },

    // --- SHOT'S --- (alkol → Sülfitler)
    { id: "i-sho-1", categoryId: "c8", name: "OLMECA SILVER / JAGERMEISTER / F-16 / PICCHIO / SAMBUCA", price: 175, isAvailable: true, allergens: "Sülfitler" },
    { id: "i-sho-2", categoryId: "c8", name: "DON JULIO BLANCO / REPOSADO", price: 250, isAvailable: true, ingredients: "Premium Meksika Tekilası, %38 ABV", allergens: "Sülfitler" },
    { id: "i-sho-3", categoryId: "c8", name: "JAGERMEISTER MANIFEST", price: 225, isAvailable: true, ingredients: "56 Botanik, Meşe Fıçı Dinlendirme, %38 ABV", allergens: "Sülfitler" },
    { id: "i-sho-4", categoryId: "c8", name: "JACK DANIELS FIRE / HONEY", price: 200, isAvailable: true, ingredients: "Tennessee Whiskey, Tarçın / Bal Aroması", allergens: "Sülfitler" },

    // --- ALKOLLÜ SICAK KAHVELER --- (alkol → Sülfitler + krema → Süt Ürünleri + espresso → Kafein)
    { id: "i-asc-1", categoryId: "c9", name: "IRISH COFFEE", price: 399, isAvailable: true, ingredients: "İrlanda Whiskey, Espresso, Şeker, Krema", allergens: "Sülfitler, Süt Ürünleri, Kafein" },
    { id: "i-asc-2", categoryId: "c9", name: "BAILEYS COFFEE", price: 399, isAvailable: true, ingredients: "Baileys, Espresso, Krema", allergens: "Sülfitler, Süt Ürünleri, Kafein" },
    { id: "i-asc-3", categoryId: "c9", name: "PICCHIO COFFEE", price: 399, isAvailable: true, ingredients: "Özel likör karışımı, Espresso, Krema", allergens: "Sülfitler, Süt Ürünleri, Kafein" },

    // --- ŞARAPLAR --- (alkol + şarap → Sülfitler)
    { id: "i-sar-1", categoryId: "c10", name: "Standart (Kırmızı, Beyaz, Rose)", variants: [{label:"Kadeh", price: 200}, {label:"Şişe", price: 899}], isAvailable: true, allergens: "Sülfitler" },
    { id: "i-sar-2", categoryId: "c10", name: "Premium Rose", variants: [{label:"Kadeh", price: 250}, {label:"Şişe", price: 1099}], isAvailable: true, allergens: "Sülfitler" },
    { id: "i-sar-3", categoryId: "c10", name: "SANGRIA (Kırmızı, Beyaz, Rose)", variants: [{label:"Kadeh", price: 250}, {label:"Şişe", price: 1099}], isAvailable: true, ingredients: "Şarap, Mevsim Meyveleri, Portakal, Şeker", allergens: "Sülfitler" },

    // --- KAHVELER & MOKTEYLLER ---
    // Espresso bazlı içecekler → Kafein; süt eklenenlere + Süt Ürünleri
    { id: "i-kah-1", categoryId: "c13", name: "ESPRESSO", variants: [{label:"Single", price: 169}, {label:"Double", price: 179}], isAvailable: true, ingredients: "100% Arabica Çekirdeği", allergens: "Kafein" },
    { id: "i-kah-2", categoryId: "c13", name: "AMERICANO", price: 189, isAvailable: true, ingredients: "Espresso, Sıcak Su", allergens: "Kafein" },
    { id: "i-kah-3", categoryId: "c13", name: "LATTE", price: 199, isAvailable: true, ingredients: "Espresso, Buharda Süt", allergens: "Kafein, Süt Ürünleri" },
    { id: "i-kah-4", categoryId: "c13", name: "CAPPUCCINO", price: 199, isAvailable: true, ingredients: "Espresso, Buharda Süt, Süt Köpüğü", allergens: "Kafein, Süt Ürünleri" },
    { id: "i-kah-5", categoryId: "c13", name: "MOCHA (Klasik / White / Caramel)", price: 229, isAvailable: true, ingredients: "Espresso, Süt, Çikolata Sosu, Krema", allergens: "Kafein, Süt Ürünleri" },
    { id: "i-kah-6", categoryId: "c14", name: "ALKOLSÜZ MOKTEYL (Cool Lime, Berry Hibiscus vb.)", price: 249, isAvailable: true, tags: ["Alkolsüz", "Ferah"], ingredients: "Taze Meyveler, Şeker Şurubu, Soda", allergens: null },

    // --- SICAK İÇECEKLER & SOFT DRINK'S ---
    // Sıcak içecekler → Kafein; süt içerenler + Süt Ürünleri; soft drinkler → Şeker / Tatlandırıcı
    { id: "i-sic-1", categoryId: "c13", name: "Çay", variants: [{label:"Bardak", price: 70}, {label:"Fincan", price: 100}], isAvailable: true, allergens: null },
    { id: "i-sic-2", categoryId: "c13", name: "Türk Kahvesi", price: 149, isAvailable: true, ingredients: "Türk Kahve Çekirdeği", allergens: "Kafein" },
    { id: "i-sic-3", categoryId: "c13", name: "Salep", price: 149, isAvailable: true, ingredients: "Salep, Süt, Tarçın", allergens: "Süt Ürünleri" },
    { id: "i-sic-4", categoryId: "c13", name: "Sıcak Çikolata", price: 149, isAvailable: true, ingredients: "Çikolata, Süt, Krema", allergens: "Süt Ürünleri" },
    { id: "item-hot-chocolate", categoryId: "c13", name: "Sıcak Çikolata", price: 149, isAvailable: true, ingredients: "Çikolata, Süt, Krema", allergens: "Süt Ürünleri" },
    { id: "i-sic-5", categoryId: "c13", name: "Bitki Çayları", price: 149, isAvailable: true, allergens: null },
    { id: "i-sic-6", categoryId: "c14", name: "Cola / Fanta / Sprite / Fuse Tea", price: 129, isAvailable: true, allergens: null },
    { id: "i-sic-7", categoryId: "c14", name: "REDBULL", price: 169, isAvailable: true, allergens: "Kafein" },
    { id: "i-sic-8", categoryId: "c14", name: "Su", price: 49, isAvailable: true, allergens: null },
    { id: "i-sic-9", categoryId: "c14", name: "Soda", price: 89, isAvailable: true, allergens: null },
    { id: "i-sic-10", categoryId: "c14", name: "Meyveli Soda", price: 99, isAvailable: true, allergens: null },
    { id: "i-sic-11", categoryId: "c14", name: "Churchill", price: 159, isAvailable: true, allergens: null },

    // --- YEMEK & ÇEREZ --- (mevcut kapsamlı alerjen verileri korundu; "Kabuklu Yemişler" → "Sert Kabuklu Meyveler" güncellendi)
    { id: "i-yem-1", categoryId: "c15", name: "PICCHIO Bira Tabağı", price: 400, isAvailable: true, description: "Çeşitli atıştırmalıklar ve dip soslar", allergens: "Glüten, Süt Ürünleri" },
    { id: "i-yem-2", categoryId: "c15", name: "Patates Tabağı", price: 200, isAvailable: true, allergens: "Glüten" },
    { id: "i-yem-3", categoryId: "c15", name: "Çıtır Tavuk", price: 350, isAvailable: true, allergens: "Glüten, Yumurta" },
    { id: "i-yem-4", categoryId: "c15", name: "Hamburger", price: 300, isAvailable: true, allergens: "Glüten, Süt Ürünleri, Yumurta, Susam" },
    { id: "i-yem-5", categoryId: "c15", name: "Chicken Burger", price: 300, isAvailable: true, allergens: "Glüten, Süt Ürünleri, Yumurta, Susam" },
    { id: "i-yem-6", categoryId: "c15", name: "Cheese Burger", price: 325, isAvailable: true, allergens: "Glüten, Süt Ürünleri, Yumurta, Susam" },
    { id: "i-yem-7", categoryId: "c15", name: "Penne Alfredo", price: 350, isAvailable: true, ingredients: "Penne, Krema, Parmesan, Sarımsak", allergens: "Glüten, Süt Ürünleri" },
    { id: "i-yem-8", categoryId: "c15", name: "Penne Bolonez", price: 350, isAvailable: true, ingredients: "Penne, Kıyma, Domates Sosu, Parmesan", allergens: "Glüten, Süt Ürünleri" },
    { id: "i-yem-9", categoryId: "c15", name: "Peynir Tabağı", price: 300, isAvailable: true, allergens: "Süt Ürünleri" },
    { id: "i-yem-10", categoryId: "c15", name: "Antep Fıstığı / Badem / Karışık", price: 200, isAvailable: true, allergens: "Kabuklu Yemişler" },
    { id: "i-yem-11", categoryId: "c15", name: "Çikolata / Jelibon", price: 200, isAvailable: true, allergens: "Süt Ürünleri" },
    { id: "i-yem-12", categoryId: "c15", name: "Tuzlu Fıstık", price: 100, isAvailable: true, allergens: "Kabuklu Yemişler" },
    { id: "i-yem-13", categoryId: "c15", name: "Turşu", price: 100, isAvailable: true, allergens: null },
    { id: "item-snack-pickles", categoryId: "c15", name: "Turşu", price: 100, isAvailable: true, allergens: null },
  ]
};

class MockDB {
  data: MenuData = JSON.parse(JSON.stringify(initialData));

  getCategories() {
    return this.data.categories.filter((c: Category) => c.isActive).sort((a: Category, b: Category) => a.order - b.order);
  }

  getItems() {
    return this.data.items;
  }

  getRecommended() {
    return this.data.items.filter((i: MenuItem) => i.isRecommended && i.isAvailable);
  }

  getSignatures() {
    return this.data.items.filter((i: MenuItem) => i.isSignature && i.isAvailable);
  }

  getActiveAnnouncements() {
    return this.data.announcements.filter((a: AnnouncementBanner) => a.isActive);
  }

  addItem(item: MenuItem) {
    this.data.items.push(item);
  }

  updateItem(id: string, updates: Partial<MenuItem>) {
    this.data.items = this.data.items.map((i: MenuItem) => i.id === id ? { ...i, ...updates } : i);
  }

  deleteItem(id: string) {
    this.data.items = this.data.items.filter((i: MenuItem) => i.id !== id);
  }

  toggleAnnouncement(id: string) {
    this.data.announcements = this.data.announcements.map((a: AnnouncementBanner) => a.id === id ? { ...a, isActive: !a.isActive } : a);
  }

  addAnnouncement(ann: AnnouncementBanner) {
    this.data.announcements.push(ann);
  }

  deleteAnnouncement(id: string) {
    this.data.announcements = this.data.announcements.filter((a: AnnouncementBanner) => a.id !== id);
  }
}

export const db = new MockDB();
