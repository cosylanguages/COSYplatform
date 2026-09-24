import os
import json

LANGUAGES = ["en", "fr", "it", "ru", "el"]
MANUAL_URL = "https://cosylanguages.github.io/COSYmanuals/manuals/en/grammar/a1/topics/to-be.html"

LANG_DIR_MAP = {
    "en": "general-english-a1",
    "fr": "general-french-a1",
    "it": "general-italian-a1",
    "ru": "general-russian-a1",
    "el": "general-greek-a1"
}

MODULE_TEMPLATES = [
    # Module 6
    {
        "modNum": 6, "code": "M06", "unit": 6,
        "label": {"en": "SHOPPING & MONEY", "fr": "ACHATS & ARGENT", "it": "ACQUISTI E DENARO", "ru": "ПОКУПКИ И ДЕНЬГИ", "el": "ΑΓΟΡΕΣ ΚΑΙ ΧΡΗΜΑΤΑ"},
        "title": {"en": "MODULE 6. SHOPPING & MONEY", "fr": "MODULE 6. ACHATS & ARGENT", "it": "MODULE 6. ACQUISTI E DENARO", "ru": "MODULE 6. ПОКУПКИ И ДЕНЬГИ", "el": "MODULE 6. ΑΓΟΡΕΣ ΚΑΙ ΧΡΗΜΑΤΑ"},
        "arc": {"en": "Navigating shops, asking prices, paying and understanding discounts", "fr": "Naviguer dans les magasins, demander les prix, payer et comprendre les réductions", "it": "Navigare nei negozi, chiedere i prezzi, pagare e capire gli sconti", "ru": "Ориентация в магазинах, вопросы о ценах, оплата и скидки", "el": "Πλοήγηση στα καταστήματα, τιμές, πληρωμή και εκπτώσεις"},
        "lessons": [
            ("m06-l01-shop-types-and-places", 1,
             {"en": "6.1 Shop Types & Places to Buy", "fr": "6.1 Types de magasins & Lieux d'achat", "it": "6.1 Tipi di negozi e Luoghi di acquisto", "ru": "6.1 Типы магазинов и места покупок", "el": "6.1 Τύποι καταστημάτων και μέρη αγορών"},
             {"en": "I can name different shop types and say where to buy everyday products.", "fr": "Je peux nommer différents types de magasins et dire où acheter des produits.", "it": "Posso nominare diversi tipi di negozi e dire dove comprare prodotti.", "ru": "Я могу назвать разные типы магазинов и сказать, где купить товары.", "el": "Μπορώ να ονομάσω διαφορετικούς τύπους καταστημάτων και να πω πού αγοράζουμε προϊόντα."},
             ["supermarket", "bakery", "pharmacy", "shop", "store", "market", "buy", "sell"],
             ["Where can I buy...?", "At the bakery", "In the supermarket", "I need to buy..."],
             "how-much-does-this-cost"),
            ("m06-l02-product-categories-and-availability", 2,
             {"en": "6.2 Product Categories & Availability", "fr": "6.2 Catégories de produits & Disponibilité", "it": "6.2 Categorie di prodotti e Disponibilità", "ru": "6.2 Категории товаров и наличие", "el": "6.2 Κατηγορίες προϊόντων και διαθεσιμότητα"},
             {"en": "I can ask for product categories and inquire if items are in stock.", "fr": "Je peux demander des catégories de produits et vérifier leur disponibilité.", "it": "Posso chiedere categorie di prodotti e verificare la disponibilità.", "ru": "Я могу спрашивать о категориях товаров и уточнять их наличие.", "el": "Μπορώ να ζητήσω κατηγορίες προϊόντων και να ρωτήσω αν υπάρχουν σε αποθεμα."},
             ["product", "food", "clothes", "medicine", "book", "have", "need", "store"],
             ["Do you have...?", "I am looking for...", "I need...", "Is this available?"],
             "i-would-like-to-buy-this"),
            ("m06-l03-money-currency-and-prices", 3,
             {"en": "6.3 Money, Currency & Prices", "fr": "6.3 Argent, Monnaie & Prix", "it": "6.3 Denaro, Valuta e Prezzi", "ru": "6.3 Деньги, валюта и цены", "el": "6.3 Χρήματα, νόμισμα και τιμές"},
             {"en": "I can ask how much items cost and understand price statements in local currency.", "fr": "Je peux demander le prix d'articles et comprendre le coût en monnaie locale.", "it": "Posso chiedere quanto costano gli articoli e capire i prezzi in valuta locale.", "ru": "Я могу спрашивать стоимость товаров и понимать цены в местной валюте.", "el": "Μπορώ να ρωτήσω πόσο κοστίζουν τα προϊόντα και να καταλάβω τις τιμές."},
             ["money", "price", "cost", "euro", "dollar", "pound", "cheap", "expensive"],
             ["How much is it?", "How much are these?", "It costs 10 euros", "That's cheap"],
             "how-much-does-this-cost"),
            ("m06-l04-paying-and-payment-methods", 4,
             {"en": "6.4 Paying & Payment Methods", "fr": "6.4 Paiement & Modes de paiement", "it": "6.4 Pagamento e Metodi di pagamento", "ru": "6.4 Оплата и способы оплаты", "el": "6.4 Πληρωμή και τρόποι πληρωμής"},
             {"en": "I can pay for items using cash or card and request receipts and change.", "fr": "Je peux payer en espèces ou par carte et demander un ticket et de la monnaie.", "it": "Posso pagare in contanti o con carta e chiedere scontrino e resto.", "ru": "Я могу оплачивать товары картой или наличными, просить чек и сдачу.", "el": "Μπορώ να πληρώσω με μετρητά ή κάρτα και να ζητήσω απόδειξη και ρέστα."},
             ["pay", "cash", "card", "receipt", "change", "cashier", "bill", "total"],
             ["Can I pay by card?", "I will pay in cash", "Here is your change", "Can I have a receipt?"],
             "can-i-pay-by-card"),
            ("m06-l05-discounts-and-quantities", 5,
             {"en": "6.5 Discounts & Quantities", "fr": "6.5 Réductions & Quantités", "it": "6.5 Sconti e Quantità", "ru": "6.5 Скидки и количество", "el": "6.5 Εκπτώσεις και ποσότητες"},
             {"en": "I can understand sale prices, discounts, and ask for specific quantities in shops.", "fr": "Je peux comprendre les prix en solde, les réductions et demander des quantités précises.", "it": "Posso capire i prezzi scontati, gli sconti e chiedere quantità specifiche nei negozi.", "ru": "Я могу понимать цены со скидкой, распродажи и просить точное количество товара.", "el": "Μπορώ να καταλάβω τις τιμές με έκπτωση και να ζητήσω συγκεκριμένες ποσότητες."},
             ["discount", "sale", "offer", "kilo", "gram", "bottle", "packet", "box"],
             ["Is there a discount?", "50% off", "A kilo of apples", "Two bottles of water"],
             "can-i-have-a-receipt-please"),
            ("m06-l06-shopping-transactions-capstone", 6,
             {"en": "6.6 Shopping Transactions Capstone", "fr": "6.6 Bilan des achats & Transactions", "it": "6.6 Sintesi degli acquisti e Transazioni", "ru": "6.6 Итоговый урок: Покупки и транзакции", "el": "6.6 Ανακεφαλαίωση αγορών και συναλλαγές"},
             {"en": "I can handle a complete shopping transaction from entering a store to paying and leaving.", "fr": "Je peux effectuer une transaction d'achat complète du début à la fin.", "it": "Posso gestire una transazione d'acquisto completa dall'ingresso al pagamento.", "ru": "Я могу провести полный цикл покупки в магазине от выбора до оплаты.", "el": "Μπορώ να πραγματοποιήσω μια πλήρη συναλλαγή αγοράς από την είσοδο ως την πληρωμή."},
             ["customer", "cashier", "bag", "total", "receipt", "change", "welcome", "goodbye"],
             ["Can I help you?", "I'll take this, please", "Anything else?", "Have a nice day!"],
             "i-would-like-to-buy-this")
        ]
    },
    # Module 7
    {
        "modNum": 7, "code": "M07", "unit": 7,
        "label": {"en": "CLOTHES & APPEARANCE", "fr": "VÊTEMENTS & APPARENCE", "it": "ABBIGLIAMENTO E ASPETTO", "ru": "ОДЕЖДА И ВНЕШНОСТЬ", "el": "ΡΟΥΧΑ ΚΑΙ ΕΜΦΑΝΙΣΗ"},
        "title": {"en": "MODULE 7. CLOTHES & APPEARANCE", "fr": "MODULE 7. VÊTEMENTS & APPARENCE", "it": "MODULE 7. ABBIGLIAMENTO E ASPETTO", "ru": "MODULE 7. ОДЕЖДА И ВНЕШНОСТЬ", "el": "MODULE 7. ΡΟΥΧΑ ΚΑΙ ΕΜΦΑΝΙΣΗ"},
        "arc": {"en": "Describing clothing, accessories, fitting, sizes and personal style", "fr": "Décrire les vêtements, les accessoires, les essayages, les tailles et le style", "it": "Descrivere abbigliamento, accessori, prova, taglie e stile personale", "ru": "Описание одежды, аксессуаров, примерка, размеры и личный стиль", "el": "Περιγραφή ρούχων, αξεσουάρ, δοκιμές, μεγέθη και προσωπικό στυλ"},
        "lessons": [
            ("m07-l01-essential-clothing-items", 1,
             {"en": "7.1 Essential Clothing Items", "fr": "7.1 Vêtements essentiels", "it": "7.1 Capi di abbigliamento essenziali", "ru": "7.1 Основная одежда", "el": "7.1 Βασικά είδη ένδυσης"},
             {"en": "I can name everyday clothing items and describe what I am wearing today.", "fr": "Je peux nommer les vêtements du quotidien et décrire ce que je porte aujourd'hui.", "it": "Posso nominare i capi di abbigliamento di tutti i giorni e descrivere cosa indosso.", "ru": "Я могу называть повседневную одежду и описывать, во что я одет сегодня.", "el": "Μπορώ να ονομάσω καθημερινά ρούχα και να περιγράψω τι φοράω σήμερα."},
             ["shirt", "trousers", "jeans", "dress", "skirt", "jacket", "shoes", "wear"],
             ["What are you wearing?", "I am wearing a coat", "He wears blue jeans", "Everyday clothes"],
             "i-would-like-to-buy-this"),
            ("m07-l02-accessories-and-footwear", 2,
             {"en": "7.2 Accessories & Footwear", "fr": "7.2 Accessoires & Chaussures", "it": "7.2 Accessori e Calzature", "ru": "7.2 Аксессуары и обувь", "el": "7.2 Αξεσουάρ και υποδήματα"},
             {"en": "I can identify accessories and footwear and describe personal style.", "fr": "Je peux identifier les accessoires et les chaussures et décrire un style personnel.", "it": "Posso identificare accessori e calzature e descrivere lo stile personale.", "ru": "Я могу называть аксессуары и обувь и описывать личный стиль.", "el": "Μπορώ να αναγνωρίσω αξεσουάρ και υποδήματα και να περιγράψω το προσωπικό στυλ."},
             ["hat", "cap", "glasses", "watch", "bag", "belt", "boots", "scarf"],
             ["Where are my glasses?", "He wears boots", "A leather bag", "Warm scarf in winter"],
             "i-would-like-to-buy-this"),
            ("m07-l03-describing-clothes-colour-size-and-style", 3,
             {"en": "7.3 Describing Clothes: Colour, Size & Style", "fr": "7.3 Décrire les vêtements : Couleur, Taille & Style", "it": "7.3 Descrivere i vestiti: Colore, Taglia e Stile", "ru": "7.3 Описание одежды: цвет, размер и стиль", "el": "7.3 Περιγραφή ρούχων: χρώμα, μέγεθος και στυλ"},
             {"en": "I can describe clothes using colour, size, and style adjectives.", "fr": "Je peux décrire des vêtements en utilisant des adjectifs de couleur, taille et style.", "it": "Posso descrivere i vestiti usando aggettivi di colore, taglia e stile.", "ru": "Я могу описывать одежду, используя прилагательные цвета, размера и стиля.", "el": "Μπορώ να περιγράψω ρούχα χρησιμοποιώντας επίθετα χρώματος, μεγέθους και στυλ."},
             ["size", "small", "medium", "large", "red", "blue", "black", "comfortable"],
             ["Size medium, please", "A black jacket", "Comfortable shoes", "It looks nice"],
             "i-would-like-to-buy-this"),
            ("m07-l04-clothes-shopping-trying-on-and-fitting", 4,
             {"en": "7.4 Clothes Shopping: Trying On & Fitting", "fr": "7.4 Achats de vêtements : Essayages & Tailles", "it": "7.4 Acquisto vestiti: Prova e Taglie", "ru": "7.4 Покупка одежды: примерка и размеры", "el": "7.4 Αγορά ρούχων: δοκιμή και μεγέθη"},
             {"en": "I can ask to try on clothes and express fitting preferences.", "fr": "Je peux demander à essayer des vêtements et exprimer mon avis sur la taille.", "it": "Posso chiedere di provare i vestiti ed esprimere preferenze di vestibilità.", "ru": "Я могу просить примерить одежду и говорить, подходит ли размер.", "el": "Μπορώ να ζητήσω να δοκιμάσω ρούχα και να πω αν μου κάνουν."},
             ["buy", "room", "size", "fit", "big", "small", "mirror", "clothes"],
             ["Can I try this on?", "Where is the fitting room?", "It's too small", "It fits perfectly"],
             "can-i-try-this-on"),
            ("m07-l05-clothes-shopping-comparisons-and-buying", 5,
             {"en": "7.5 Clothes Shopping: Comparisons & Buying", "fr": "7.5 Achats de vêtements : Comparaisons & Achat", "it": "7.5 Acquisto vestiti: Confronti e Acquisto", "ru": "7.5 Покупка одежды: сравнение и выбор", "el": "7.5 Αγορά ρούχων: σύγκριση και αγορά"},
             {"en": "I can compare clothing choices, discuss prices, and buy clothes in a shop.", "fr": "Je peux comparer des vêtements, discuter des prix et acheter des vêtements.", "it": "Posso confrontare capi d'abbigliamento, discutere i prezzi e comprare vestiti.", "ru": "Я могу сравнивать одежду, обсуждать цены и делать покупки в магазине.", "el": "Μπορώ να συγκρίνω επιλογές ρούχων, να συζητήσω τιμές και να αγοράσω ρούχα."},
             ["better", "cheap", "nice", "prefer", "buy", "price", "clothes", "choose"],
             ["This one is cheaper", "I prefer the blue shirt", "Which one do you like?", "I will buy this one"],
             "how-much-does-this-cost"),
            ("m07-l06-wardrobe-and-fashion-capstone", 6,
             {"en": "7.6 Wardrobe & Fashion Capstone", "fr": "7.6 Bilan : Garde-robe & Mode", "it": "7.6 Sintesi: Guardaroba e Moda", "ru": "7.6 Итоговый урок: Гардероб и стиль", "el": "7.6 Ανακεφαλαίωση: Ντουλάπα και μόδα"},
             {"en": "I can describe my wardrobe, favourite outfits, and handle clothes shopping dialogues.", "fr": "Je peux décrire ma garde-robe, mes tenues préférées et gérer un dialogue d'achat.", "it": "Posso descrivere il mio guardaroba, i miei outfit preferiti e gestire i dialoghi di acquisto.", "ru": "Я могу описывать свой гардероб, любимые наряды и вести диалоги покупки одежды.", "el": "Μπορώ να περιγράψω τη ντουλάπα μου, τα αγαπημένα μου ρούχα και να κάνω αγορές."},
             ["clothes", "wear", "favourite", "season", "look", "dress", "shirt", "shoes"],
             ["My favourite outfit", "In my wardrobe", "Clothes for summer", "Smart look"],
             "i-would-like-to-buy-this")
        ]
    },
    # Module 8
    {
        "modNum": 8, "code": "M08", "unit": 8,
        "label": {"en": "HEALTH & BODY", "fr": "SANTÉ & CORPS", "it": "SALUTE E CORPO", "ru": "ЗДОРОВЬЕ И ТЕЛО", "el": "ΥΓΕΙΑ ΚΑΙ ΣΩΜΑ"},
        "title": {"en": "MODULE 8. HEALTH & BODY", "fr": "MODULE 8. SANTÉ & CORPS", "it": "MODULE 8. SALUTE E CORPO", "ru": "MODULE 8. ЗДОРОВЬЕ И ТЕЛО", "el": "MODULE 8. ΥΓΕΙΑ ΚΑΙ ΣΩΜΑ"},
        "arc": {"en": "Body parts, symptoms, doctor visits, pharmacy and healthy habits", "fr": "Parties du corps, symptômes, visites chez le médecin, pharmacie et habitudes saines", "it": "Parti del corpo, sintomi, visite mediche, farmacia e abitudini sane", "ru": "Части тела, симптомы, визит к врачу, аптека и здоровые привычки", "el": "Μέρη του σώματος, συμπτώματα, γιατρός, φαρμακείο και υγιεινές συνήθειες"},
        "lessons": [
            ("m08-l01-body-parts-and-physical-self", 1,
             {"en": "8.1 Body Parts & Physical Self", "fr": "8.1 Parties du corps & Physique", "it": "8.1 Parti del corpo e Fisico", "ru": "8.1 Части тела и организмы", "el": "8.1 Μέρη του σώματος"},
             {"en": "I can name human body parts and point out physical pain locations.", "fr": "Je peux nommer les parties du corps et indiquer où j'ai mal.", "it": "Posso nominare le parti del corpo e indicare dove sento dolore.", "ru": "Я могу называть части тела человека и указывать, где болит.", "el": "Μπορώ να ονομάσω μέρη του ανθρώπινου σώματος και να δείξω πού πονάω."},
             ["head", "face", "eye", "ear", "nose", "mouth", "hand", "arm", "leg", "foot"],
             ["My head hurts", "Open your mouth", "Touch your nose", "Left leg"],
             "good-morning-how-are-you"),
            ("m08-l02-basic-health-states-and-feeling-unwell", 2,
             {"en": "8.2 Basic Health States & Feeling Unwell", "fr": "8.2 État de santé & Malaise", "it": "8.2 Stato di salute e Sensazione di malessere", "ru": "8.2 Состояние здоровья и самочувствие", "el": "8.2 Κατάσταση υγείας και αδιαθεσία"},
             {"en": "I can express physical feelings and basic health states.", "fr": "Je peux exprimer des sensations physiques et des états de santé de base.", "it": "Posso esprimere sensazioni fisiche e stati di salute di base.", "ru": "Я могу выражать физические ощущения и базовое состояние здоровья.", "el": "Μπορώ να εκφράσω σωματικά συναισθήματα και βασική κατάσταση υγείας."},
             ["feel", "sick", "tired", "well", "healthy", "weak", "better", "health"],
             ["I feel sick", "Are you okay?", "I am very tired", "I feel better today"],
             "good-morning-how-are-you"),
            ("m08-l03-common-ailments-and-symptoms", 3,
             {"en": "8.3 Common Ailments & Symptoms", "fr": "8.3 Maux courants & Symptômes", "it": "8.3 Disturbi comuni e Sintomi", "ru": "8.3 Частые недомогания и симптомы", "el": "8.3 Κοινές ασθένειες και συμπτώματα"},
             {"en": "I can describe common ailments like headaches, colds, and fevers.", "fr": "Je peux décrire des maux courants comme le mal de tête, le rhum et la fièvre.", "it": "Posso descrivere disturbi comuni come mal di testa, raffreddore e febbre.", "ru": "Я могу описывать частые недомогания: головную боль, простуду и температуру.", "el": "Μπορώ να περιγράψω κοινές ασθένειες όπως πονοκέφαλο, κρυολόγημα και πυρετό."},
             ["headache", "fever", "cold", "cough", "pain", "flu", "sick", "head"],
             ["I have a headache", "I have a cold", "High fever", "Bad cough"],
             "i-have-a-question"),
            ("m08-l04-at-the-doctors-office", 4,
             {"en": "8.4 At the Doctor's Office", "fr": "8.4 Chez le médecin", "it": "8.4 Dal medico", "ru": "8.4 В кабинете врача", "el": "8.4 Στο ιατρείο"},
             {"en": "I can explain health problems to a doctor and understand basic medical advice.", "fr": "Je peux expliquer mes problèmes de santé au médecin et comprendre ses conseils.", "it": "Posso spiegare i problemi di salute al medico e capire i consigli di base.", "ru": "Я могу объяснить свои симптомы врачу и понять базовые рекомендации.", "el": "Μπορώ να εξηγήσω τα προβλήματα υγείας στον γιατρό και να καταλάβω τις συμβουλές."},
             ["doctor", "nurse", "clinic", "problem", "symptom", "rest", "advice", "medicine"],
             ["What is the problem?", "I need to see a doctor", "Take this medicine", "Get some rest"],
             "good-morning-how-are-you"),
            ("m08-l05-at-the-pharmacy-and-buying-medicine", 5,
             {"en": "8.5 At the Pharmacy & Buying Medicine", "fr": "8.5 À la pharmacie & Achat de médicaments", "it": "8.5 In farmacia e Acquisto medicinali", "ru": "8.5 В аптеке и покупка лекарств", "el": "8.5 Στο φαρμακείο και αγορά φαρμάκων"},
             {"en": "I can request medicine at a pharmacy and understand dosage instructions.", "fr": "Je peux demander des médicaments en pharmacie et comprendre les instructions de dose.", "it": "Posso chiedere medicinali in farmacia e capire le istruzioni sul dosaggio.", "ru": "Я могу просить лекарства в аптеке и понимать инструкции по приему.", "el": "Μπορώ να ζητήσω φάρμακα στο φαρμακείο και να καταλάβω τις οδηγίες χρήσης."},
             ["pharmacy", "medicine", "prescription", "take", "doctor", "water", "day", "help"],
             ["I need painkillers", "Take two pills a day", "Do I need a prescription?", "After meals"],
             "can-i-have-a-glass-of-water"),
            ("m08-l06-healthy-lifestyle-and-wellness-capstone", 6,
             {"en": "8.6 Healthy Lifestyle & Wellness Capstone", "fr": "8.6 Bilan : Mode de vie sain & Bien-être", "it": "8.6 Sintesi: Stile di vita sano e Benessere", "ru": "8.6 Итоговый урок: Здоровый образ жизни", "el": "8.6 Ανακεφαλαίωση: Υγιεινός τρόπος ζωής"},
             {"en": "I can describe healthy daily routines and discuss simple wellness habits.", "fr": "Je peux décrire une routine quotidienne saine et discuter d'habitudes de bien-être.", "it": "Posso descrivere routine quotidiane sane e discutere semplici abitudini di benessere.", "ru": "Я могу описывать здоровый распорядок дня и обсуждать полезные привычки.", "el": "Μπορώ να περιγράψω υγιεινές καθημερινές συνήθειες και ευεξία."},
             ["health", "diet", "exercise", "sleep", "water", "fresh", "well", "body"],
             ["Drink plenty of water", "Eat fresh vegetables", "Do daily exercise", "Sleep 8 hours"],
             "good-morning-how-are-you")
        ]
    },
    # Module 9
    {
        "modNum": 9, "code": "M09", "unit": 9,
        "label": {"en": "WORK & EDUCATION", "fr": "TRAVAIL & ÉDUCATION", "it": "LAVORO E ISTRUZIONE", "ru": "РАБОТА И ОБРАЗОВАНИЕ", "el": "ΕΡΓΑΣΙΑ ΚΑΙ ΕΚΠΑΙΔΕΥΣΗ"},
        "title": {"en": "MODULE 9. WORK & EDUCATION", "fr": "MODULE 9. TRAVAIL & ÉDUCATION", "it": "MODULE 9. LAVORO E ISTRUZIONE", "ru": "MODULE 9. РАБОТА И ОБРАЗОВАНИЕ", "el": "MODULE 9. ΕΡΓΑΣΙΑ ΚΑΙ ΕΚΠΑΙΔΕΥΣΗ"},
        "arc": {"en": "Occupations, workplaces, working hours, studies, exams and career profiles", "fr": "Professions, lieux de travail, horaires, études, examens et profil de carrière", "it": "Mestieri, luoghi di lavoro, orari, studi, esami e profilo professionale", "ru": "Профессии, места работы, рабочее время, учеба, экзамены и резюме", "el": "Επαγγέλματα, χώροι εργασίας, ωράριο, σπουδές, εξετάσεις και επαγγελματικό προφίλ"},
        "lessons": [
            ("m09-l01-jobs-and-professions", 1,
             {"en": "9.1 Jobs & Professions", "fr": "9.1 Métiers & Professions", "it": "9.1 Mestieri e Professioni", "ru": "9.1 Профессии и специальности", "el": "9.1 Επαγγέλματα"},
             {"en": "I can name common occupations and ask someone about their job.", "fr": "Je peux nommer des professions courantes et interroger quelqu'un sur son travail.", "it": "Posso nominare professioni comuni e chiedere a qualcuno del suo lavoro.", "ru": "Я могу называть распространенные профессии и спрашивать о работе.", "el": "Μπορώ να ονομάσω κοινά επαγγέλματα και να ρωτήσω κάποιον για τη δουλειά του."},
             ["teacher", "doctor", "engineer", "manager", "driver", "student", "worker", "job"],
             ["What do you do?", "I am an engineer", "Where do you work?", "I work in a company"],
             "what-do-you-do"),
            ("m09-l02-workplaces-and-work-locations", 2,
             {"en": "9.2 Workplaces & Work Locations", "fr": "9.2 Lieux de travail & Emplacements", "it": "9.2 Luoghi di lavoro e Sedi", "ru": "9.2 Места работы и локации", "el": "9.2 Χώροι εργασίας"},
             {"en": "I can describe workplaces and state where people work.", "fr": "Je peux décrire des lieux de travail et indiquer où travaillent les gens.", "it": "Posso descrivere luoghi di lavoro e indicare dove lavorano le persone.", "ru": "Я могу описывать рабочие места и указывать, где работают люди.", "el": "Μπορώ να περιγράψω χώρους εργασίας και να πω πού εργάζονται οι άνθρωποι."},
             ["office", "hospital", "school", "company", "factory", "bank", "shop", "work"],
             ["I work in an office", "She works at a hospital", "Big company", "In the city centre"],
             "where-do-you-live"),
            ("m09-l03-working-hours-and-work-communication", 3,
             {"en": "9.3 Working Hours & Work Communication", "fr": "9.3 Horaires de travail & Communication", "it": "9.3 Orari di lavoro e Comunicazione", "ru": "9.3 Рабочие часы и коммуникация", "el": "9.3 Ώρες εργασίας και επικοινωνία"},
             {"en": "I can talk about working hours, schedules, and basic workplace tasks.", "fr": "Je peux parler des horaires de travail, des emplois du temps et des tâches.", "it": "Posso parlare di orari di lavoro, programmi e mansioni di base.", "ru": "Я могу говорить о рабочих часах, расписании и базовых задачах.", "el": "Μπορώ να μιλήσω για ώρες εργασίας, πρόγραμμα και καθήκοντα."},
             ["time", "schedule", "meeting", "email", "project", "task", "break", "boss"],
             ["I start work at 9", "Important meeting", "Send an email", "Lunch break"],
             "i-finish-work-at-five"),
            ("m09-l04-education-places-and-school-subjects", 4,
             {"en": "9.4 Education Places & School Subjects", "fr": "9.4 Établissements & Matières scolaires", "it": "9.4 Luoghi di istruzione e Materie", "ru": "9.4 Учебные заведения и предметы", "el": "9.4 Εκπαιδευτικά ιδρύματα και μαθήματα"},
             {"en": "I can talk about schools, universities, and favourite academic subjects.", "fr": "Je peux parler des écoles, des universités et de mes matières préférées.", "it": "Posso parlare di scuole, università e materie preferite.", "ru": "Я могу говорить о школах, университетах и любимых предметах.", "el": "Μπορώ να μιλήσω για σχολεία, πανεπιστήμια και αγαπημένα μαθήματα."},
             ["school", "university", "college", "lesson", "subject", "history", "student", "class"],
             ["I study at university", "My favourite subject is math", "English lesson", "Classroom"],
             "i-am-a-student"),
            ("m09-l05-study-habits-homework-and-exams", 5,
             {"en": "9.5 Study Habits, Homework & Exams", "fr": "9.5 Habitudes d'étude, Devoirs & Examens", "it": "9.5 Abitudini di studio, Compiti ed Esami", "ru": "9.5 Учеба, домашние задания и экзамены", "el": "9.5 Μελέτη, εργασίες και εξετάσεις"},
             {"en": "I can describe study routines, homework tasks, and exam preparation.", "fr": "Je peux décrire mes routines d'étude, mes devoirs et la préparation des examens.", "it": "Posso descrivere le routine di studio, i compiti e la preparazione agli esami.", "ru": "Я могу описывать свои занятия, домашнюю работу и подготовку к экзаменам.", "el": "Μπορώ να περιγράψω συνήθειες μελέτης, εργασίες και προετοιμασία εξετάσεων."},
             ["study", "read", "write", "homework", "exam", "test", "library", "prepare"],
             ["Do homework in evening", "Prepare for exam", "Study in library", "Pass the test"],
             "i-have-a-question"),
            ("m09-l06-work-and-education-profile-capstone", 6,
             {"en": "9.6 Work & Education Profile Capstone", "fr": "9.6 Bilan : Profil professionnel & Éducatif", "it": "9.6 Sintesi: Profilo lavorativo e Formazione", "ru": "9.6 Итоговый урок: Профессиональный профиль", "el": "9.6 Ανακεφαλαίωση: Επαγγελματικό προφίλ"},
             {"en": "I can present a complete overview of my professional and educational background.", "fr": "Je peux présenter un aperçu complet de mon parcours professionnel et éducatif.", "it": "Posso presentare una panoramica completa del mio percorso di lavoro e studio.", "ru": "Я могу представить полный обзор своей работы и образования.", "el": "Μπορώ να παρουσιάσω μια πλήρη επισκόπηση της εργασίας και της εκπαίδευσής μου."},
             ["education", "experience", "skill", "profile", "work", "study", "job", "school"],
             ["My career path", "University degree", "Work experience", "Professional profile"],
             "what-do-you-do")
        ]
    },
    # Module 10
    {
        "modNum": 10, "code": "M10", "unit": 10,
        "label": {"en": "LANGUAGES & COMMUNICATION", "fr": "LANGUES & COMMUNICATION", "it": "LINGUE E COMUNICAZIONE", "ru": "ЯЗЫКИ И ОБЩЕНИЕ", "el": "ΓΛΩΣΣΕΣ ΚΑΙ ΕΠΙΚΟΙΝΩΝΙΑ"},
        "title": {"en": "MODULE 10. LANGUAGES & COMMUNICATION", "fr": "MODULE 10. LANGUES & COMMUNICATION", "it": "MODULE 10. LINGUE E COMUNICAZIONE", "ru": "MODULE 10. ЯЗЫКИ И ОБЩЕНИЕ", "el": "MODULE 10. ΓΛΩΣΣΕΣ ΚΑΙ ΕΠΙΚΟΙΝΩΝΙΑ"},
        "arc": {"en": "Language skills, learning levels, classroom phrases, translation, messaging and portfolio", "fr": "Compétences linguistiques, niveaux d'apprentissage, expressions de classe, traduction et portfolio", "it": "Abilità linguistiche, livelli, frasi per la classe, traduzione, messaggi e portfolio", "ru": "Языковые навыки, уровни, фразы в классе, перевод, сообщения и портфолио", "el": "Γλωσσικές δεξιότητες, επίπεδα, φράσεις τάξης, μετάφραση, μηνύματα και προφίλ"},
        "lessons": [
            ("m10-l01-languages-and-communication-verbs", 1,
             {"en": "10.1 Languages & Communication Verbs", "fr": "10.1 Langues & Verbes de communication", "it": "10.1 Lingue e Verbi di comunicazione", "ru": "10.1 Языки и глаголы общения", "el": "10.1 Γλώσσες και ρήματα επικοινωνίας"},
             {"en": "I can state which languages I speak, read, write, and understand.", "fr": "Je peux indiquer quelles langues je parle, lis, écris et comprends.", "it": "Posso indicare quali lingue parlo, leggo, scrivo e capisco.", "ru": "Я могу называть языки, на которых говорю, читаю, пишу и понимаю.", "el": "Μπορώ να αναφέρω ποιες γλώσσες μιλώ, διαβάζω, γράφω και καταλαβαίνω."},
             ["speak", "read", "write", "listen", "understand", "language", "English", "French"],
             ["I speak English", "I read books in French", "I understand a little", "Foreign languages"],
             "where-are-you-from"),
            ("m10-l02-language-ability-and-learning-progress", 2,
             {"en": "10.2 Language Ability & Learning Progress", "fr": "10.2 Niveau de langue & Progrès", "it": "10.2 Livello linguistico e Progressi", "ru": "10.2 Уровень языка и прогресс", "el": "10.2 Επίπεδο γλώσσας και πρόοδος"},
             {"en": "I can describe my language proficiency level and learning progress.", "fr": "Je peux décrire mon niveau de compétence linguistique et mes progrès.", "it": "Posso descrivere il mio livello di competenza e i miei progressi nello studio.", "ru": "Я могу описывать свой уровень владения языком и прогресс.", "el": "Μπορώ να περιγράψω το επίπεδο γλωσσομάθειας και την πρόοδό μου."},
             ["can", "speak", "little", "student", "class", "learn", "improve", "understand"],
             ["I speak a little", "I am a beginner", "I want to improve", "Practice every day"],
             "i-have-a-question"),
            ("m10-l03-classroom-interaction-and-requests", 3,
             {"en": "10.3 Classroom Interaction & Requests", "fr": "10.3 Interactions en classe & Demandes", "it": "10.3 Interazione in classe e Richieste", "ru": "10.3 Общение в классе и просьбы", "el": "10.3 Επικοινωνία στην τάξη"},
             {"en": "I can use classroom communication phrases and request clarification.", "fr": "Je peux utiliser des phrases de classe et demander des éclaircissements.", "it": "Posso usare frasi utili in classe e chiedere chiarimenti.", "ru": "Я могу использовать фразы общения в классе и просить разъяснений.", "el": "Μπορώ να χρησιμοποιώ εκφράσεις τάξης και να ζητώ διευκρινίσεις."},
             ["repeat", "explain", "understand", "ask", "question", "slow", "clear", "meaning"],
             ["Can you repeat, please?", "Please speak slowly", "I don't understand", "What does this mean?"],
             "can-you-repeat-that-please"),
            ("m10-l04-translation-spelling-and-pronunciation", 4,
             {"en": "10.4 Translation, Spelling & Pronunciation", "fr": "10.4 Traduction, Épellation & Prononciation", "it": "10.4 Traduzione, Ortografia e Pronuncia", "ru": "10.4 Перевод, орфография и произношение", "el": "10.4 Μετάφραση, ορθογραφία και προφορά"},
             {"en": "I can ask for translations, correct spelling, and pronunciation help.", "fr": "Je peux demander des traductions, l'orthographe exacte et de l'aide en prononciation.", "it": "Posso chiedere traduzioni, l'ortografia corretta e aiuto per la pronuncia.", "ru": "Я могу просить перевод, правильное написание и помощь с произношением.", "el": "Μπορώ να ζητήσω μεταφράσεις, ορθογραφία και βοήθεια στην προφορά."},
             ["translate", "spell", "pronounce", "word", "meaning", "dictionary", "letter", "sound"],
             ["How do you spell that?", "How do you pronounce this word?", "How do you translate...?", "Dictionary"],
             "how-do-you-spell-that"),
            ("m10-l05-communication-channels-and-messages", 5,
             {"en": "10.5 Communication Channels & Messages", "fr": "10.5 Canaux de communication & Messages", "it": "10.5 Canali di comunicazione e Messaggi", "ru": "10.5 Каналы связи и сообщения", "el": "10.5 Κανάλια επικοινωνίας και μηνύματα"},
             {"en": "I can talk about methods of communication and send short digital messages.", "fr": "Je peux parler des moyens de communication et envoyer de courts messages.", "it": "Posso parlare dei metodi di comunicazione e inviare brevi messaggi.", "ru": "Я могу говорить о способах связи и отправлять короткие сообщения.", "el": "Μπορώ να μιλήσω για τρόπους επικοινωνίας και να στείλω σύντομα μηνύματα."},
             ["message", "email", "phone", "text", "send", "receive", "write", "contact"],
             ["Send a text message", "Write an email", "Call me on phone", "I will reply soon"],
             "what-does-this-word-mean"),
            ("m10-l06-multilingual-learner-profile-capstone", 6,
             {"en": "10.6 Multilingual Learner Profile Capstone", "fr": "10.6 Bilan : Profil d'apprenant multilingue", "it": "10.6 Sintesi: Profilo dello studente multilingue", "ru": "10.6 Итоговый урок: Профиль полиглота", "el": "10.6 Ανακεφαλαίωση: Πολύγλωσσο προφίλ"},
             {"en": "I can present my language learning portfolio and communicate effectively in class.", "fr": "Je peux présenter mon portefeuille d'apprentissage des langues et communiquer en classe.", "it": "Posso presentare il mio portfolio linguistico e comunicare efficacemente.", "ru": "Я могу представить портфолио изучения языков и эффективно общаться в классе.", "el": "Μπορώ να παρουσιάσω το γλωσσικό μου προφίλ και να επικοινωνώ στην τάξη."},
             ["language", "communication", "practice", "goal", "profile", "speak", "understand", "class"],
             ["My language portfolio", "I speak three languages", "My learning goal", "Daily communication"],
             "can-you-repeat-that-please")
        ]
    },
    # Module 11
    {
        "modNum": 11, "code": "M11", "unit": 11,
        "label": {"en": "TRANSPORT & TRAVEL", "fr": "TRANSPORTS & VOYAGES", "it": "TRASPORTI E VIAGGI", "ru": "ТРАНСПОРТ И ПУТЕШЕСТВИЯ", "el": "ΜΕΤΑΦΟΡΕΣ ΚΑΙ ΤΑΞΙΔΙΑ"},
        "title": {"en": "MODULE 11. TRANSPORT & TRAVEL", "fr": "MODULE 11. TRANSPORTS & VOYAGES", "it": "MODULE 11. TRASPORTI E VIAGGI", "ru": "MODULE 11. ТРАНСПОРТ И ПУТЕШЕСТВИЯ", "el": "MODULE 11. ΜΕΤΑΦΟΡΕΣ ΚΑΙ ΤΑΞΙΔΙΑ"},
        "arc": {"en": "Transport modes, travel places, directions, tickets, schedules and airport check-in", "fr": "Modes de transport, lieux de voyage, directions, billets, horaires et enregistrement", "it": "Mezzi di trasporto, luoghi di viaggio, indicazioni, biglietti, orari e check-in", "ru": "Виды транспорта, места поездок, маршруты, билеты, расписание и регистрация", "el": "Μέσα μεταφοράς, ταξιδιωτικά μέρη, οδηγίες, εισιτήρια, δρομολόγια και check-in"},
        "lessons": [
            ("m11-l01-modes-of-transport-and-commuting", 1,
             {"en": "11.1 Modes of Transport & Commuting", "fr": "11.1 Modes de transport & Trajets", "it": "11.1 Mezzi di trasporto e Spostamenti", "ru": "11.1 Виды транспорта и поездки", "el": "11.1 Μέσα μεταφοράς"},
             {"en": "I can name common modes of transport and say how I travel to work or school.", "fr": "Je peux nommer les modes de transport courants et dire comment je me déplace.", "it": "Posso nominare i mezzi di trasporto comuni e dire come viaggio.", "ru": "Я могу называть транспортные средства и говорить, как добираюсь до работы.", "el": "Μπορώ να ονομάσω κοινά μέσα μεταφοράς και να πω πώς μετακινούμαι."},
             ["bus", "train", "car", "bicycle", "taxi", "plane", "travel", "go"],
             ["I go by bus", "Travel by train", "Drive a car", "Ride a bicycle"],
             "i-go-to-work-by-bus"),
            ("m11-l02-travel-places-and-stations", 2,
             {"en": "11.2 Travel Places & Stations", "fr": "11.2 Lieux de voyage & Gares", "it": "11.2 Luoghi di viaggio e Stazioni", "ru": "11.2 Вокзалы, аэропорты и остановки", "el": "11.2 Ταξιδιωτικοί σταθμοί"},
             {"en": "I can name travel locations like airports and train stations and locate them.", "fr": "Je peux nommer des lieux de voyage comme les aéroports et les gares.", "it": "Posso nominare luoghi di viaggio come aeroporti e stazioni e individuarli.", "ru": "Я могу называть вокзалы, аэропорты и остановки транспорта.", "el": "Μπορώ να ονομάσω αεροδρόμια, σταθμούς και στάσεις."},
             ["station", "airport", "stop", "ticket", "bus", "train", "passport", "travel"],
             ["At the train station", "Bus stop near here", "Airport terminal", "Departure gate"],
             "how-do-i-get-to-the-train-station"),
            ("m11-l03-asking-and-giving-directions", 3,
             {"en": "11.3 Asking & Giving Directions", "fr": "11.3 Demander & Donner des directions", "it": "11.3 Chiedere e Dare indicazioni", "ru": "11.3 Как спросить и объяснить дорогу", "el": "11.3 Οδηγίες κατεύθυνσης"},
             {"en": "I can ask where places are and understand basic directions.", "fr": "Je peux demander où se trouvent des lieux et comprendre des directions simples.", "it": "Posso chiedere dove si trovano i luoghi e capire le indicazioni di base.", "ru": "Я могу спрашивать дорогу и понимать простые указания направления.", "el": "Μπορώ να ρωτήσω πού είναι ένα μέρος και να καταλάβω οδηγίες."},
             ["street", "near", "far", "city", "town", "station", "bank", "go"],
             ["Turn left", "Go straight on", "Turn right at corner", "It is near here"],
             "how-do-i-get-to-the-train-station"),
            ("m11-l04-buying-tickets-and-travel-schedules", 4,
             {"en": "11.4 Buying Tickets & Travel Schedules", "fr": "11.4 Achat de billets & Horaires", "it": "11.4 Acquisto biglietti e Orari", "ru": "11.4 Покупка билетов и расписание", "el": "11.4 Αγορά εισιτηρίων και δρομολόγια"},
             {"en": "I can buy transport tickets and ask about departure and arrival times.", "fr": "Je peux acheter des billets de transport et demander les heures de départ.", "it": "Posso comprare biglietti di trasporto e chiedere orari di partenza e arrivo.", "ru": "Я могу покупать билеты на транспорт и спрашивать время отправления.", "el": "Μπορώ να αγοράσω εισιτήρια και να ρωτήσω για ώρες αναχώρησης."},
             ["ticket", "price", "time", "leave", "arrive", "station", "schedule", "pay"],
             ["One ticket to London", "When does the train leave?", "Return ticket", "Platform 3"],
             "how-much-does-this-cost"),
            ("m11-l05-travel-situations-checking-in-and-luggage", 5,
             {"en": "11.5 Travel Situations: Checking In & Luggage", "fr": "11.5 Situations de voyage : Enregistrement & Bagages", "it": "11.5 Situazioni di viaggio: Check-in e Bagagli", "ru": "11.5 Поездки: регистрация и багаж", "el": "11.5 Check-in και αποσκευές"},
             {"en": "I can handle basic airport/hotel check-in situations and talk about luggage.", "fr": "Je peux gérer l'enregistrement à l'aéroport ou à l'hôtel et parler des bagages.", "it": "Posso gestire il check-in in aeroporto o hotel e parlare dei bagagli.", "ru": "Я могу проходить регистрацию в аэропорту/отеле и говорить о багаже.", "el": "Μπορώ να κάνω check-in και να μιλήσω για τις αποσκευές."},
             ["passport", "bag", "hotel", "airport", "ticket", "room", "key", "travel"],
             ["Here is my passport", "Check-in desk", "Heavy luggage", "Room key"],
             "where-do-you-live"),
            ("m11-l06-transport-and-travel-capstone", 6,
             {"en": "11.6 Transport & Travel Capstone", "fr": "11.6 Bilan : Transports & Voyages", "it": "11.6 Sintesi: Trasporti e Viaggi", "ru": "11.6 Итоговый урок: Полное путешествие", "el": "11.6 Ανακεφαλαίωση: Μεταφορές και ταξίδια"},
             {"en": "I can navigate a full travel itinerary from asking directions to buying tickets and arriving.", "fr": "Je peux gérer un itinéraire de voyage complet de A à Z.", "it": "Posso gestire un itinerario di viaggio completo dalla richiesta di indicazioni all'arrivo.", "ru": "Я могу провести полный маршрут поездки от покупки билета до прибытия.", "el": "Μπορώ να οργανώσω ένα πλήρες ταξιδιωτικό δρομολόγιο."},
             ["travel", "station", "airport", "ticket", "bus", "train", "arrive", "leave"],
             ["Full travel plan", "Arrive on time", "Have a safe trip", "Enjoy your journey"],
             "how-do-i-get-to-the-train-station")
        ]
    },
    # Module 12
    {
        "modNum": 12, "code": "M12", "unit": 12,
        "label": {"en": "CITY & PLACES", "fr": "VILLE & LIEUX", "it": "CITTÀ E LUOGHI", "ru": "ГОРОД И МЕСТА", "el": "ΠΟΛΗ ΚΑΙ ΤΟΠΟΘΕΣΙΕΣ"},
        "title": {"en": "MODULE 12. CITY & PLACES", "fr": "MODULE 12. VILLE & LIEUX", "it": "MODULE 12. CITTÀ E LUOGHI", "ru": "MODULE 12. ГОРОД И МЕСТА", "el": "MODULE 12. ΠΟΛΗ ΚΑΙ ΤΟΠΟΘΕΣΙΕΣ"},
        "arc": {"en": "Places in town, public buildings, landmarks, city orientation and neighborhood guide", "fr": "Lieux en ville, bâtiments publics, monuments, orientation et guide du quartier", "it": "Luoghi in città, edifici pubblici, monumenti, orientamento e guida del quartiere", "ru": "Места в городе, здания, достопримечательности, ориентирование и гид по району", "el": "Μέρη στην πόλη, δημόσια κτίρια, αξιοθέατα, προσανατολισμός και γειτονιά"},
        "lessons": [
            ("m12-l01-places-in-town-and-public-buildings", 1,
             {"en": "12.1 Places in Town & Public Buildings", "fr": "12.1 Lieux en ville & Bâtiments publics", "it": "12.1 Luoghi in città ed Edifici pubblici", "ru": "12.1 Места в городе и здания", "el": "12.1 Μέρη στην πόλη και κτίρια"},
             {"en": "I can name town locations like banks, parks, museums, cinemas, and libraries.", "fr": "Je peux nommer des lieux de la ville comme la banque, le parc, le musée et le cinéma.", "it": "Posso nominare i luoghi della città come banche, parchi, musei e cinema.", "ru": "Я могу называть городские места: банк, парк, музей, кинотеатр и библиотеку.", "el": "Μπορώ να ονομάσω μέρη της πόλης όπως τράπεζες, πάρκα, μουσεία και σινεμά."},
             ["bank", "park", "museum", "cinema", "restaurant", "library", "hotel", "city"],
             ["Where is the bank?", "Beautiful park", "Visit a museum", "Watch a film at cinema"],
             "where-do-you-live"),
            ("m12-l02-city-landmarks-and-services", 2,
             {"en": "12.2 City Landmarks & Services", "fr": "12.2 Monuments & Services de la ville", "it": "12.2 Monumenti e Servizi cittadini", "ru": "12.2 Достопримечательности и службы", "el": "12.2 Αξιοθέατα και υπηρεσίες"},
             {"en": "I can describe public city landmarks and municipal services.", "fr": "Je peux décrire les monuments publics et les services municipaux.", "it": "Posso descrivere i monumenti pubblici e i servizi comunali.", "ru": "Я могу описывать городские достопримечательности и социальные службы.", "el": "Μπορώ να περιγράψω δημόσια αξιοθέατα και υπηρεσίες της πόλης."},
             ["building", "street", "town", "place", "hospital", "school", "bank", "park"],
             ["Post office", "Police station", "Old building", "Main square"],
             "where-do-you-live"),
            ("m12-l03-asking-directions-in-town", 3,
             {"en": "12.3 Asking Directions in Town", "fr": "12.3 Demander son chemin en ville", "it": "12.3 Chiedere indicazioni in città", "ru": "12.3 Поиск мест и ориентирование в городе", "el": "12.3 Αναζήτηση κατεύθυνσης στην πόλη"},
             {"en": "I can ask how to reach city landmarks and understand town orientation.", "fr": "Je peux demander comment rejoindre des monuments et comprendre l'orientation.", "it": "Posso chiedere come raggiungere i monumenti e capire l'orientamento.", "ru": "Я могу спрашивать, как дойти до городских мест, и ориентироваться.", "el": "Μπορώ να ρωτήσω πώς να πάω σε αξιοθέατα και να προσανατολιστώ."},
             ["street", "near", "far", "building", "place", "city", "town", "go"],
             ["Is it far from here?", "How can I get to the museum?", "Next to the bank", "Opposite the park"],
             "how-do-i-get-to-the-train-station"),
            ("m12-l04-describing-neighborhoods-and-city-life", 4,
             {"en": "12.4 Describing Neighborhoods & City Life", "fr": "12.4 Décrire les quartiers & La vie urbaine", "it": "12.4 Descrivere i quartieri e La vita in città", "ru": "12.4 Описание района и городская жизнь", "el": "12.4 Περιγραφή γειτονιάς και ζωή στην πόλη"},
             {"en": "I can describe my neighborhood and express what I like about my city.", "fr": "Je peux décrire mon quartier et exprimer ce que j'aime dans ma ville.", "it": "Posso descrivere il mio quartiere ed esprimere cosa mi piace della città.", "ru": "Я могу описывать свой район и говорить, что мне нравится в городе.", "el": "Μπορώ να περιγράψω τη γειτονιά μου και να πω τι μου αρέσει στην πόλη."},
             ["city", "town", "street", "building", "park", "place", "hotel", "bank"],
             ["In my neighborhood", "Quiet street", "I love my city", "Shops and cafes"],
             "where-do-you-live"),
            ("m12-l05-city-transport-and-urban-navigation", 5,
             {"en": "12.5 City Transport & Urban Navigation", "fr": "12.5 Transports urbains & Navigation", "it": "12.5 Trasporti urbani e Navigazione", "ru": "12.5 Городской транспорт и навигация", "el": "12.5 Αστική μετακίνηση και πλοήγηση"},
             {"en": "I can navigate city transport systems like metro, bus lines, and taxi stands.", "fr": "Je peux naviguer dans les transports urbains (métro, bus, taxis).", "it": "Posso orientarmi nei trasporti urbani (metropolitana, autobus, taxi).", "ru": "Я могу пользоваться городским транспортом (метро, автобусы, такси).", "el": "Μπορώ να μετακινηθώ με τα αστικά μέσα (μετρό, λεωφορεία, ταξί)."},
             ["bus", "train", "stop", "station", "ticket", "street", "city", "go"],
             ["Take the metro", "Bus line 5", "Taxi rank", "City transport card"],
             "i-go-to-work-by-bus"),
            ("m12-l06-city-guide-and-navigation-capstone", 6,
             {"en": "12.6 City Guide & Navigation Capstone", "fr": "12.6 Bilan : Guide de la ville & Navigation", "it": "12.6 Sintesi: Guida della città e Navigazione", "ru": "12.6 Итоговый урок: Гид по городу", "el": "12.6 Ανακεφαλαίωση: Οδηγός πόλης"},
             {"en": "I can present a city tour guide and give directions to multiple places in town.", "fr": "Je peux présenter un guide de la ville et donner des directions à un visiteur.", "it": "Posso presentare una guida della città e dare indicazioni sui vari luoghi.", "ru": "Я могу провести экскурсию по городу и дать указания маршрута.", "el": "Μπορώ να παρουσιάσω έναν οδηγό πόλης και να δώσω οδηγίες."},
             ["city", "town", "museum", "park", "street", "building", "hotel", "place"],
             ["Welcome to my city", "City tour guide", "Best places to visit", "Enjoy your stay"],
             "where-do-you-live")
        ]
    },
    # Module 13
    {
        "modNum": 13, "code": "M13", "unit": 13,
        "label": {"en": "WEATHER & NATURE", "fr": "MÉTÉO & NATURE", "it": "METEO E NATURA", "ru": "ПОГОДА И ПРИРОДА", "el": "ΚΑΙΡΟΣ ΚΑΙ ΦΥΣΗ"},
        "title": {"en": "MODULE 13. WEATHER & NATURE", "fr": "MODULE 13. MÉTÉO & NATURE", "it": "MODULE 13. METEO E NATURA", "ru": "MODULE 13. ПОГОДА И ПРИРОДА", "el": "MODULE 13. ΚΑΙΡΟΣ ΚΑΙ ΦΥΣΗ"},
        "arc": {"en": "Weather conditions, seasons, natural landscapes, weather forecast and eco-habits", "fr": "Météo, saisons, paysages naturels, prévisions météorologiques et habitudes écolos", "it": "Condizioni meteo, stagioni, paesaggi naturali, previsioni e abitudini ecologiche", "ru": "Погодные условия, времена года, природа, прогноз погоды и экологичные привычки", "el": "Καιρικές συνθήκες, εποχές, φυσικά τοπία, πρόγνωση και οικολογικές συνήθειες"},
        "lessons": [
            ("m13-l01-weather-conditions-and-temperature", 1,
             {"en": "13.1 Weather Conditions & Temperature", "fr": "13.1 Conditions météo & Température", "it": "13.1 Condizioni meteo e Temperatura", "ru": "13.1 Погодные условия и температура", "el": "13.1 Καιρικές συνθήκες και θερμοκρασία"},
             {"en": "I can describe daily weather conditions and temperature.", "fr": "Je peux décrire les conditions météorologiques quotidiennes et la température.", "it": "Posso descrivere le condizioni meteo giornaliere e la temperatura.", "ru": "Я могу описывать ежедневную погоду и температуру воздуха.", "el": "Μπορώ να περιγράψω τις καθημερινές καιρικές συνθήκες και τη θερμοκρασία."},
             ["weather", "sunny", "rainy", "windy", "cold", "hot", "warm", "rain"],
             ["It is sunny today", "It is very cold", "It is raining", "Hot summer weather"],
             "good-morning-how-are-you"),
            ("m13-l02-the-four-seasons-and-seasonal-activities", 2,
             {"en": "13.2 The Four Seasons & Seasonal Activities", "fr": "13.2 Les quatre saisons & Activités", "it": "13.2 Le quattro stagioni e Attività", "ru": "13.2 Четыре сезона и занятия по сезонам", "el": "13.2 Οι τέσσερις εποχές και δραστηριότητες"},
             {"en": "I can name the four seasons and talk about favourite seasonal activities.", "fr": "Je peux nommer les quatre saisons et parler de mes activités préférées.", "it": "Posso nominare le quattro stagioni e parlare delle attività preferite.", "ru": "Я могу называть 4 сезона года и говорить о любимых занятиях по сезонам.", "el": "Μπορώ να ονομάσω τις τέσσερις εποχές και να μιλήσω για εποχιακές δραστηριότητες."},
             ["spring", "summer", "autumn", "winter", "weather", "cold", "hot", "snow"],
             ["In summer I swim", "In winter it snows", "My favourite season is spring", "Beautiful autumn"],
             "good-morning-how-are-you"),
            ("m13-l03-nature-landscapes-and-natural-places", 3,
             {"en": "13.3 Nature Landscapes & Natural Places", "fr": "13.3 Paysages naturels & Nature", "it": "13.3 Paesaggi naturali e Luoghi", "ru": "13.3 Природные ландшафты и места", "el": "13.3 Φυσικά τοπία"},
             {"en": "I can name natural places and landscapes like seas, mountains, and forests.", "fr": "Je peux nommer des lieux naturels comme la mer, la montagne et la forêt.", "it": "Posso nominare luoghi naturali come mare, montagna e foresta.", "ru": "Я могу называть природные места: море, горы, лес, река.", "el": "Μπορώ να ονομάσω φυσικά μέρη όπως θάλασσα, βουνό και δάσος."},
             ["sea", "mountain", "tree", "flower", "animal", "water", "park", "cold"],
             ["High mountain", "Blue sea", "Green trees", "Beautiful flowers"],
             "where-do-you-live"),
            ("m13-l04-weather-forecasts-and-planning-activities", 4,
             {"en": "13.4 Weather Forecasts & Planning Activities", "fr": "13.4 Prévisions météo & Projets", "it": "13.4 Previsioni meteo e Programmazione", "ru": "13.4 Прогноз погоды и планы", "el": "13.4 Πρόγνωση καιρού και σχέδια"},
             {"en": "I can understand simple weather forecasts and plan outdoor activities.", "fr": "Je peux comprendre des prévisions météo simples et planifier des activités.", "it": "Posso capire semplici previsioni meteo e pianificare attività all'aperto.", "ru": "Я могу понимать простой прогноз погоды и планировать отдых.", "el": "Μπορώ να καταλάβω απλή πρόγνωση καιρού και να σχεδιάσω δραστηριότητες."},
             ["weather", "sunny", "rain", "snow", "cold", "warm", "go", "park"],
             ["Tomorrow will be sunny", "Take an umbrella", "Weather forecast", "Go for a walk"],
             "good-morning-how-are-you"),
            ("m13-l05-environmental-habits-and-caring-for-nature", 5,
             {"en": "13.5 Environmental Habits & Caring for Nature", "fr": "13.5 Habitudes écologiques & Nature", "it": "13.5 Abitudini ecologiche e Natura", "ru": "13.5 Экологичные привычки и забота о природе", "el": "13.5 Οικολογικές συνήθειες"},
             {"en": "I can discuss simple eco-friendly habits like recycling and keeping places clean.", "fr": "Je peux discuter d'habitudes écologiques simples comme le recyclage.", "it": "Posso discutere di semplici abitudini ecologiche come il riciclaggio.", "ru": "Я могу обсуждать простые экологичные привычки и чистоту природы.", "el": "Μπορώ να συζητήσω για απλές οικολογικές συνήθειες και ανακύκλωση."},
             ["tree", "flower", "water", "clean", "park", "animal", "sea", "weather"],
             ["Keep the park clean", "Recycle plastic", "Save water", "Protect nature"],
             "good-morning-how-are-you"),
            ("m13-l06-nature-and-weather-capstone", 6,
             {"en": "13.6 Nature & Weather Capstone", "fr": "13.6 Bilan : Nature & Météo", "it": "13.6 Sintesi: Natura e Meteo", "ru": "13.6 Итоговый урок: Природа и климат", "el": "13.6 Ανακεφαλαίωση: Φύση και καιρός"},
             {"en": "I can describe natural environments, climate in my country, and discuss weather.", "fr": "Je peux décrire l'environnement naturel et le climat de mon pays.", "it": "Posso descrivere gli ambienti naturali e il clima del mio paese.", "ru": "Я могу описывать природу и климат в своей стране.", "el": "Μπορώ να περιγράψω το φυσικό περιβάλλον και το κλίμα της χώρας μου."},
             ["weather", "spring", "summer", "sea", "mountain", "sunny", "rain", "tree"],
             ["Climate in my country", "Four distinct seasons", "Beautiful nature", "Enjoy outdoor life"],
             "good-morning-how-are-you")
        ]
    },
    # Module 14
    {
        "modNum": 14, "code": "M14", "unit": 14,
        "label": {"en": "FREE TIME & HOBBIES", "fr": "LOISIRS & HOBBIES", "it": "TEMPO LIBERO E HOBBY", "ru": "ДОСУГ И ХОББИ", "el": "ΕΛΕΥΘΕΡΟΣ ΧΡΟΝΟΣ ΚΑΙ ΧΟΜΠΙ"},
        "title": {"en": "MODULE 14. FREE TIME & HOBBIES", "fr": "MODULE 14. LOISIRS & HOBBIES", "it": "MODULE 14. TEMPO LIBERO E HOBBY", "ru": "MODULE 14. ДОСУГ И ХОББИ", "el": "MODULE 14. ΕΛΕΥΘΕΡΟΣ ΧΡΟΝΟΣ ΚΑΙ ΧΟΜΠΙ"},
        "arc": {"en": "Leisure activities, sports, entertainment, weekend plans, hobbies survey and portfolio", "fr": "Activités de loisirs, sports, divertissements, week-end, sondage et portfolio", "it": "Attività per il tempo libero, sport, intrattenimento, weekend, sondaggio e portfolio", "ru": "Досуг, спорт, развлечения, планы на выходные, опрос о хобби и портфолио", "el": "Δραστηριότητες, αθλήματα, ψυχαγωγία, σχέδια Σαββατοκύριακου και χόμπι"},
        "lessons": [
            ("m14-l01-leisure-activities-and-everyday-hobbies", 1,
             {"en": "14.1 Leisure Activities & Everyday Hobbies", "fr": "14.1 Activités de loisirs & Hobbies", "it": "14.1 Tempo libero e Hobby quotidiani", "ru": "14.1 Досуг и повседневные хобби", "el": "14.1 Δραστηριότητες ελεύθερου χρόνου"},
             {"en": "I can talk about leisure activities like watching TV, listening to music, and reading.", "fr": "Je peux parler de mes loisirs (regarder la télé, écouter de la musique, lire).", "it": "Posso parlare delle attività del tempo libero (guardare la TV, ascoltare musica, leggere).", "ru": "Я могу говорить о досуге: смотреть ТВ, слушать музыку, читать книги.", "el": "Μπορώ να μιλήσω για δραστηριότητες όπως τηλεόραση, μουσική και διάβασμα."},
             ["watch", "listen", "read", "music", "film", "book", "cooking", "hobby"],
             ["Watch TV in evening", "Listen to music", "Read interesting books", "Cook for friends"],
             "what-do-you-do-in-your-free-time"),
            ("m14-l02-sports-and-physical-activities", 2,
             {"en": "14.2 Sports & Physical Activities", "fr": "14.2 Sports & Activités physiques", "it": "14.2 Sport e Attività fisiche", "ru": "14.2 Спорт и физическая активность", "el": "14.2 Αθλήματα και γυμναστική"},
             {"en": "I can name sports and describe my physical activities and abilities.", "fr": "Je peux nommer des sports et décrire mes activités physiques et capacités.", "it": "Posso nominare gli sport e descrivere le mie attività fisiche e abilità.", "ru": "Я могу называть виды спорта и описывать свои спортивные умения.", "el": "Μπορώ να ονομάσω αθλήματα και να περιγράψω τις αθλητικές μου ικανότητες."},
             ["sport", "play", "football", "tennis", "swim", "run", "game", "can"],
             ["Play football with friends", "I can swim well", "Run in the park", "Play tennis"],
             "i-like-playing-football"),
            ("m14-l03-cinema-music-and-entertainment", 3,
             {"en": "14.3 Cinema, Music & Entertainment", "fr": "14.3 Cinéma, Musique & Divertissement", "it": "14.3 Cinema, Musica e Intrattenimento", "ru": "14.3 Кино, музыка и развлечения", "el": "14.3 Σινεμά, μουσική και ψυχαγωγία"},
             {"en": "I can express preferences for movies, music, books, and cultural events.", "fr": "Je peux exprimer mes préférences pour les films, la musique et les livres.", "it": "Posso esprimere preferenze per film, musica, libri ed eventi culturali.", "ru": "Я могу выражать предпочтения в кино, музыке, книгах и мероприятиях.", "el": "Μπορώ να εκφράσω προτιμήσεις για ταινίες, μουσική και βιβλία."},
             ["cinema", "film", "music", "book", "game", "watch", "listen", "play"],
             ["Go to the cinema", "Pop music", "Action movie", "Concert tickets"],
             "would-you-like-to-go-to-the-cinema"),
            ("m14-l04-weekend-plans-and-free-time-activities", 4,
             {"en": "14.4 Weekend Plans & Free Time Activities", "fr": "14.4 Projets de week-end & Temps libre", "it": "14.4 Programmi per il weekend e Tempo libero", "ru": "14.4 Планы на выходные и досуг", "el": "14.4 Σχέδια Σαββατοκύριακου"},
             {"en": "I can talk about weekend plans and invite friends to leisure events.", "fr": "Je peux parler de mes projets de week-end et inviter des amis.", "it": "Posso parlare dei programmi per il weekend e invitare amici.", "ru": "Я могу говорить о планах на выходные и приглашать друзей.", "el": "Μπορώ να μιλήσω για σχέδια Σαββατοκύριακου και να προσκαλέσω φίλους."},
             ["weekend", "hobby", "sport", "game", "friend", "go", "watch", "play"],
             ["What are you doing this weekend?", "Let us go to the park", "Visit friends", "Relax at home"],
             "would-you-like-to-go-to-the-cinema"),
            ("m14-l05-hobbies-and-personal-interests-survey", 5,
             {"en": "14.5 Hobbies & Personal Interests Survey", "fr": "14.5 Sondage sur les hobbies & Intérêts", "it": "14.5 Sondaggio su hobby e Interessi personali", "ru": "14.5 Опрос об увлечениях и интересах", "el": "14.5 Έρευνα για χόμπι και ενδιαφέροντα"},
             {"en": "I can interview peers about hobbies and compare leisure interests.", "fr": "Je peux interroger mes camarades sur leurs hobbies et comparer.", "it": "Posso intervistare i compagni sugli hobby e confrontare gli interessi.", "ru": "Я могу проводить опрос среди знакомых об их хобби и сравнивать их.", "el": "Μπορώ να κάνω ερωτήσεις για χόμπι και να συγκρίνω ενδιαφέροντα."},
             ["hobby", "sport", "game", "music", "read", "watch", "prefer", "like"],
             ["What is your favourite hobby?", "Do you play video games?", "I prefer outdoor sports", "Interesting activities"],
             "what-do-you-do-in-your-free-time"),
            ("m14-l06-free-time-and-hobbies-portfolio-capstone", 6,
             {"en": "14.6 Free Time & Hobbies Portfolio Capstone", "fr": "14.6 Bilan : Loisirs & Portfolio d'intérêts", "it": "14.6 Sintesi: Tempo libero e Portfolio hobby", "ru": "14.6 Итоговый урок: Мой досуг и хобби", "el": "14.6 Ανακεφαλαίωση: Ελεύθερος χρόνος"},
             {"en": "I can give a presentation about my hobbies, favourite sports, and leisure routine.", "fr": "Je peux faire une présentation de mes hobbies, de mes sports et loisirs.", "it": "Posso fare una presentazione dei miei hobby, sport e tempo libero.", "ru": "Я могу сделать презентацию о своих хобби, спорте и досуге.", "el": "Μπορώ να παρουσιάσω τα χόμπι και τα αθλήματα που μου αρέσουν."},
             ["hobby", "sport", "music", "game", "weekend", "play", "read", "favourite"],
             ["My free time presentation", "Favourite hobbies and sports", "Active lifestyle", "Enjoy leisure time"],
             "what-do-you-do-in-your-free-time")
        ]
    },
    # Module 15
    {
        "modNum": 15, "code": "M15", "unit": 15,
        "label": {"en": "TECHNOLOGY", "fr": "TECHNOLOGIE", "it": "TECNOLOGIA", "ru": "ТЕХНОЛОГИИ", "el": "ΤΕΧΝΟΛΟΓΙΑ"},
        "title": {"en": "MODULE 15. TECHNOLOGY", "fr": "MODULE 15. TECHNOLOGIE", "it": "MODULE 15. TECNOLOGIA", "ru": "MODULE 15. ТЕХНОЛОГИИ", "el": "MODULE 15. ΤΕΧΝΟΛΟΓΙΑ"},
        "arc": {"en": "Devices, tech operations, internet activities, messaging, safety and digital life", "fr": "Appareils, opérations tech, internet, messagerie, sécurité et vie numérique", "it": "Dispositivi, operazioni tech, internet, messaggistica, sicurezza e vita digitale", "ru": "Устройства, работа с техникой, интернет, сообщения, безопасность и цифровая жизнь", "el": "Συσκευές, τεχνολογία, διαδίκτυο, μηνύματα, ασφάλεια και ψηφιακή ζωή"},
        "lessons": [
            ("m15-l01-digital-devices-and-hardware", 1,
             {"en": "15.1 Digital Devices & Hardware", "fr": "15.1 Appareils numériques & Équipements", "it": "15.1 Dispositivi digitali e Hardware", "ru": "15.1 Цифровые устройства и техника", "el": "15.1 Ψηφιακές συσκευές"},
             {"en": "I can name common tech devices like smartphones, laptops, and headphones.", "fr": "Je peux nommer des appareils tech comme les smartphones, laptops et casques.", "it": "Posso nominare dispositivi tech come smartphone, laptop e cuffie.", "ru": "Я могу называть технику: смартфон, ноутбук, планшет, наушники.", "el": "Μπορώ να ονομάσω συσκευές όπως έξυπνα τηλέφωνα, φορητούς υπολογιστές και ακουστικά."},
             ["phone", "computer", "laptop", "tablet", "camera", "charger", "screen", "app"],
             ["My new smartphone", "Work on laptop", "Charge the battery", "Big computer screen"],
             "what-does-this-word-mean"),
            ("m15-l02-tech-action-verbs-and-operations", 2,
             {"en": "15.2 Tech Action Verbs & Operations", "fr": "15.2 Verbes d'action tech & Opérations", "it": "15.2 Verbi d'azione tech e Operazioni", "ru": "15.2 Действия с техникой и операции", "el": "15.2 Ενέργειες τεχνολογίας"},
             {"en": "I can describe basic tech actions like turning on, charging, opening, and downloading.", "fr": "Je peux décrire des actions tech de base (allumer, charger, télécharger).", "it": "Posso descrivere azioni tech di base (accendere, caricare, scaricare).", "ru": "Я могу описывать действия с техникой: включать, заряжать, открывать, скачивать.", "el": "Μπορώ να περιγράψω ενέργειες όπως ενεργοποίηση, φόρτιση, κατέβασμα."},
             ["open", "close", "send", "call", "write", "search", "online", "phone"],
             ["Turn on the computer", "Download the app", "Charge your phone", "Open the website"],
             "what-does-this-word-mean"),
            ("m15-l03-internet-vocabulary-and-online-activities", 3,
             {"en": "15.3 Internet Vocabulary & Online Activities", "fr": "15.3 Vocabulaire Internet & Activités en ligne", "it": "15.3 Vocabolario Internet e Attività online", "ru": "15.3 Интернет и онлайн-деятельность", "el": "15.3 Διαδίκτυο και online δραστηριότητες"},
             {"en": "I can talk about online activities like searching, checking email, and browsing websites.", "fr": "Je peux parler des activités en ligne (recherche, e-mails, navigation).", "it": "Posso parlare di attività online (ricerche, email, navigazione siti).", "ru": "Я могу говорить об онлайн-занятиях: поиске информации, просмотре сайтов, почте.", "el": "Μπορώ να μιλήσω για online δραστηριότητες όπως αναζήτηση και email."},
             ["internet", "online", "website", "email", "search", "send", "message", "write"],
             ["Browse the internet", "Search for information", "Check email", "Online shopping"],
             "what-does-this-word-mean"),
            ("m15-l04-social-media-and-digital-messages", 4,
             {"en": "15.4 Social Media & Digital Messages", "fr": "15.4 Réseaux sociaux & Messages numériques", "it": "15.4 Social media e Messaggi digitali", "ru": "15.4 Социальные сети и сообщения", "el": "15.4 Μέσα κοινωνικής δικτύωσης"},
             {"en": "I can write short digital messages and use basic social media terms.", "fr": "Je peux écrire de courts messages numériques et utiliser les termes des réseaux sociaux.", "it": "Posso scrivere brevi messaggi digitali e usare i termini dei social media.", "ru": "Я могу писать короткие цифровые сообщения и использовать термины соцсетей.", "el": "Μπορώ να γράψω σύντομα ψηφιακά μηνύματα και να χρησιμοποιήσω όρους social media."},
             ["message", "text", "email", "send", "receive", "online", "phone", "app"],
             ["Send a text message", "Post a photo", "Write a short comment", "Share video"],
             "what-does-this-word-mean"),
            ("m15-l05-digital-safety-and-troubleshooting", 5,
             {"en": "15.5 Digital Safety & Troubleshooting", "fr": "15.5 Sécurité numérique & Dépannage", "it": "15.5 Sicurezza digitale e Risoluzione problemi", "ru": "15.5 Цифровая безопасность и проблемы", "el": "15.5 Ψηφιακή ασφάλεια"},
             {"en": "I can understand basic digital safety rules and describe simple tech problems.", "fr": "Je peux comprendre des règles de sécurité numérique et décrire un problème simple.", "it": "Posso capire le regole base di sicurezza digitale e descrivere problemi tecnici.", "ru": "Я могу понимать базовые правила безопасности в сети и называть проблемы с техникой.", "el": "Μπορώ να καταλάβω βασικούς κανόνες ψηφιακής ασφάλειας και προβλήματα."},
             ["phone", "computer", "problem", "close", "open", "online", "screen", "search"],
             ["Strong password", "Keep personal data safe", "Screen is broken", "No internet connection"],
             "i-have-a-question"),
            ("m15-l06-digital-life-and-technology-profile-capstone", 6,
             {"en": "15.6 Digital Life & Technology Profile Capstone", "fr": "15.6 Bilan : Vie numérique & Profil tech", "it": "15.6 Sintesi: Vita digitale e Profilo tech", "ru": "15.6 Итоговый урок: Цифровая жизнь", "el": "15.6 Ανακεφαλαίωση: Ψηφιακή ζωή"},
             {"en": "I can present an overview of my daily tech habits and digital communication.", "fr": "Je peux présenter un aperçu de mes habitudes tech et de ma communication numérique.", "it": "Posso presentare una panoramica delle mie abitudini tech e comunicazione digitale.", "ru": "Я могу рассказать о своих ежедневных цифровых привычках и общении.", "el": "Μπορώ να παρουσιάσω μια επισκόπηση των ψηφιακών μου συνηθειών."},
             ["phone", "computer", "internet", "online", "message", "email", "app", "screen"],
             ["My daily tech habits", "Smartphone and laptop use", "Digital communication", "Useful apps"],
             "what-does-this-word-mean")
        ]
    },
    # Module 16
    {
        "modNum": 16, "code": "M16", "unit": 16,
        "label": {"en": "CELEBRATIONS, CULTURE & EVENTS", "fr": "CÉLÉBRATIONS, CULTURE & ÉVÉNEMENTS", "it": "FESTEGGIAMENTI, CULTURA ED EVENTI", "ru": "ПРАЗДНИКИ, КУЛЬТУРА И СОБЫТИЯ", "el": "ΓΙΟΡΤΕΣ, CULTURA ΚΑΙ ΕΚΔΗΛΩΣΕΙΣ"},
        "title": {"en": "MODULE 16. CELEBRATIONS, CULTURE & EVENTS", "fr": "MODULE 16. CÉLÉBRATIONS, CULTURE & ÉVÉNEMENTS", "it": "MODULE 16. FESTEGGIAMENTI, CULTURA ED EVENTI", "ru": "MODULE 16. ПРАЗДНИКИ, КУЛЬТУРА И СОБЫТИЯ", "el": "MODULE 16. ΓΙΟΡΤΕΣ, CULTURA ΚΑΙ ΕΚΔΗΛΩΣΕΙΣ"},
        "arc": {"en": "Personal celebrations, party invitations, national holidays, cultural outings, social events and capstone project", "fr": "Fêtes personnelles, invitations, fêtes nationales, sorties culturelles, événements sociaux et projet final", "it": "Feste personali, inviti, feste nazionali, uscite culturali, eventi sociali e progetto finale", "ru": "Личные праздники, приглашения, национальные традиции, культурный досуг, встречи и итоговый проект", "el": "Προσωπικές γιορτές, προσκλήσεις, εθνικές παραδόσεις, πολιτιστικές έξοδοι, κοινωνικές εκδηλώσεις και τελικό έργο"},
        "lessons": [
            ("m16-l01-birthdays-and-personal-celebrations", 1,
             {"en": "16.1 Birthdays & Personal Celebrations", "fr": "16.1 Anniversaires & Fêtes personnelles", "it": "16.1 Compleanni e Feste personali", "ru": "16.1 Дни рождения и личные праздники", "el": "16.1 Γενέθλια και προσωπικές γιορτές"},
             {"en": "I can talk about birthdays, gifts, and personal celebrations.", "fr": "Je peux parler des anniversaires, des cadeaux et des fêtes personnelles.", "it": "Posso parlare di compleanni, regali e feste personali.", "ru": "Я могу говорить о днях рождения, подарках и личных праздниках.", "el": "Μπορώ να μιλήσω για γενέθλια, δώρα και προσωπικές γιορτές."},
             ["birthday", "party", "gift", "cake", "card", "celebrate", "invite", "guest"],
             ["Happy birthday!", "When is your birthday?", "Here is a gift for you", "Celebrate with friends"],
             "i-have-a-question"),
            ("m16-l02-invitations-and-party-planning", 2,
             {"en": "16.2 Invitations & Party Planning", "fr": "16.2 Invitations & Organisation de fêtes", "it": "16.2 Inviti e Organizzazione di feste", "ru": "16.2 Приглашения и организация праздников", "el": "16.2 Προσκλήσεις και οργάνωση πάρτι"},
             {"en": "I can invite people to a party and respond to invitations.", "fr": "Je peux inviter des personnes à une fête et répondre aux invitations.", "it": "Posso invitare persone a una festa e rispondere agli inviti.", "ru": "Я могу приглашать на праздник и отвечать на приглашения.", "el": "Μπορώ να προσκαλέσω άτομα σε πάρτι και να απαντήσω σε προσκλήσεις."},
             ["invitation", "accept", "decline", "bring", "food", "drink", "music", "time"],
             ["Would you like to come?", "I would love to!", "Sorry, I cannot come", "What time does it start?"],
             "how-much-does-this-cost"),
            ("m16-l03-holidays-and-national-traditions", 3,
             {"en": "16.3 Holidays & National Traditions", "fr": "16.3 Fêtes & Traditions nationales", "it": "16.3 Feste e Tradizioni nazionali", "ru": "16.3 Праздники и национальные традиции", "el": "16.3 Γιορτές και εθνικές παραδόσεις"},
             {"en": "I can describe national holidays, family customs, and seasonal celebrations.", "fr": "Je peux décrire des fêtes nationales, des coutumes familiales et des célébrations.", "it": "Posso descrivere feste nazionali, usanze familiari e celebrazioni.", "ru": "Я могу описывать национальные праздники, семейные обычаи и традиции.", "el": "Μπορώ να περιγράψω εθνικές γιορτές, οικογενειακά έθιμα και παραδόσεις."},
             ["holiday", "festival", "tradition", "family", "food", "winter", "summer", "year"],
             ["How do you celebrate...?", "We usually eat...", "It is a tradition", "Happy New Year!"],
             "what-time-is-it"),
            ("m16-l04-cultural-outings-and-venues", 4,
             {"en": "16.4 Cultural Outings & Venues", "fr": "16.4 Sorties culturelles & Lieux", "it": "16.4 Uscite culturali e Luoghi", "ru": "16.4 Культурный досуг и места", "el": "16.4 Πολιτιστικές έξοδοι και χώροι"},
             {"en": "I can talk about visiting museums, cinemas, theatres, and concerts.", "fr": "Je peux parler de visites aux musées, cinémas, théâtres et concerts.", "it": "Posso parlare di visite a musei, cinema, teatri e concerti.", "ru": "Я могу говорить о посещении музеев, кино, театров и концертов.", "el": "Μπορώ να μιλήσω για επισκέψεις σε μουσεία, σινεμά, θέατρα και συναυλίες."},
             ["museum", "cinema", "theatre", "concert", "ticket", "artist", "show", "place"],
             ["There is a concert on Friday", "Let us go to the cinema", "I want to visit the museum", "How much are the tickets?"],
             "what-does-this-word-mean"),
            ("m16-l05-social-events-and-going-out", 5,
             {"en": "16.5 Social Events & Going Out", "fr": "16.5 Événements sociaux & Sorties", "it": "16.5 Eventi sociali e Uscite", "ru": "16.5 Социальные события и встречи", "el": "16.5 Κοινωνικές εκδηλώσεις και έξοδοι"},
             {"en": "I can arrange to meet friends for social events and outings.", "fr": "Je peux m'organiser pour rencontrer des amis lors d'événements et sorties.", "it": "Posso organizzare incontri con amici per eventi sociali ed uscite.", "ru": "Я могу договариваться о встрече с друзьями на мероприятиях и прогулках.", "el": "Μπορώ να κανονίσω να συναντήσω φίλους για εκδηλώσεις και εξόδους."},
             ["meet", "friend", "weekend", "restaurant", "park", "event", "plan", "time"],
             ["Let us meet at 7 PM", "Shall we go out tonight?", "Where do you want to meet?", "Sounds like a great plan!"],
             "what-time-is-it"),
            ("m16-l06-celebrations-and-cultural-events-capstone", 6,
             {"en": "16.6 Celebrations & Cultural Events Capstone", "fr": "16.6 Bilan : Célébrations & Événements culturels", "it": "16.6 Sintesi: Festeggiamenti ed Eventi culturali", "ru": "16.6 Итоговый урок: Праздники и культура", "el": "16.6 Ανακεφαλαίωση: Γιορτές και εκδηλώσεις"},
             {"en": "I can present a plan for a holiday celebration or cultural outing.", "fr": "Je peux présenter un projet de fête ou de sortie culturelle.", "it": "Posso presentare un piano per una festa o un'uscita culturale.", "ru": "Я могу представить план праздника или культурного мероприятия.", "el": "Μπορώ να παρουσιάσω ένα σχέδιο για μια γιορτή ή πολιτιστική έξοδο."},
             ["party", "event", "celebrate", "music", "food", "guest", "time", "place"],
             ["I am planning a celebration", "We will meet at...", "The event includes...", "Everyone is welcome!"],
             "i-have-a-question")
        ]
    },
    # Module 17
    {
        "modNum": 17, "code": "M17", "unit": 17,
        "label": {"en": "PAST EXPERIENCES", "fr": "EXPÉRIENCES PASSÉES", "it": "ESPERIENZE PASSATE", "ru": "ПРОШЛЫЙ ОПЫТ", "el": "ΠΑΡΕΛΘΟΝΤΙΚΕΣ ΕΜΠΕΙΡΙΕΣ"},
        "title": {"en": "MODULE 17. PAST EXPERIENCES (MOVING TOWARDS A2)", "fr": "MODULE 17. EXPÉRIENCES PASSÉES (VERS A2)", "it": "MODULE 17. ESPERIENZE PASSATE (VERSO A2)", "ru": "MODULE 17. ПРОШЛЫЙ ОПЫТ (ПЕРЕХОД К A2)", "el": "MODULE 17. ΠΑΡΕΛΘΟΝΤΙΚΕΣ ΕΜΠΕΙΡΙΕΣ (ΠΡΟΣ A2)"},
        "arc": {"en": "Talking about past events, yesterday, weekends, childhood memories, travel, and personal milestones", "fr": "Parler d'événements passés, d'hier, des week-ends, de l'enfance, des voyages et étapes personnelles", "it": "Parlare di eventi passati, ieri, fine settimana, ricordi d'infanzia, viaggi e tappe personali", "ru": "Рассказы о прошлом, вчерашнем дне, выходных, детстве, путешествиях и важных событиях", "el": "Συζήτηση για παρελθοντικά γεγονότα, χθες, Σαββατοκύριακα, παιδικές αναμνήσεις, ταξίδια και σταθμούς της ζωής"},
        "lessons": [
            ("m17-l01-yesterday-and-recent-past", 1,
             {"en": "17.1 Yesterday & Recent Past", "fr": "17.1 Hier & Passé récent", "it": "17.1 Ieri e Passato recente", "ru": "17.1 Вчера и недавнее прошлое", "el": "17.1 Χθες και πρόσφατο παρελθόν"},
             {"en": "I can talk about actions I completed yesterday or last week.", "fr": "Je peux parler d'actions accomplies hier ou la semaine dernière.", "it": "Posso parlare di azioni completate ieri o la settimana scorsa.", "ru": "Я могу говорить о действиях, совершенных вчера или на прошлой неделе.", "el": "Μπορώ να μιλήσω για ενέργειες που ολοκλήρωσα χθες ή την προηγούμενη εβδομάδα."},
             ["yesterday", "last", "week", "work", "visit", "watch", "cook", "stay"],
             ["What did you do yesterday?", "Yesterday I worked", "Last week I visited...", "I stayed at home"],
             "i-have-a-question"),
            ("m17-l02-weekend-activities-and-past-events", 2,
             {"en": "17.2 Weekend Activities & Past Events", "fr": "17.2 Activités du week-end & Événements passés", "it": "17.2 Attività del fine settimana ed Eventi passati", "ru": "17.2 Выходные и прошлые события", "el": "17.2 Δραστηριότητες Σαββατοκύριακου"},
             {"en": "I can describe what I did over the weekend and during past events.", "fr": "Je peux décrire ce que j'ai fait le week-end et lors d'événements passés.", "it": "Posso descrivere cosa ho fatto nel fine settimana e durante eventi passati.", "ru": "Я могу описывать, что делал на выходных и на прошедших мероприятиях.", "el": "Μπορώ να περιγράψω τι έκανα το Σαββατοκύριακο και σε παρελθοντικές εκδηλώσεις."},
             ["weekend", "friend", "go", "see", "buy", "eat", "meet", "enjoy"],
             ["How was your weekend?", "It was great!", "I went to the park", "I met my friends"],
             "i-have-a-question"),
            ("m17-l03-childhood-and-early-memories", 3,
             {"en": "17.3 Childhood & Early Memories", "fr": "17.3 Enfance & Souvenirs d'enfance", "it": "17.3 Infanzia e Primi ricordi", "ru": "17.3 Детство и первые воспоминания", "el": "17.3 Παιδική ηλικία και αναμνήσεις"},
             {"en": "I can share simple facts and memories from my childhood.", "fr": "Je peux partager de simples souvenirs de mon enfance.", "it": "Posso condividere semplici ricordi della mia infanzia.", "ru": "Я могу делиться простыми фактами и воспоминаниями из детства.", "el": "Μπορώ να μοιραστώ απλές αναμνήσεις από την παιδική μου ηλικία."},
             ["childhood", "school", "memory", "live", "like", "friend", "play", "young"],
             ["When I was young...", "I lived in a small town", "My favorite memory was...", "I loved playing outside"],
             "i-have-a-question"),
            ("m17-l04-past-travel-and-holidays", 4,
             {"en": "17.4 Past Travel & Holidays", "fr": "17.4 Voyages passés & Vacances", "it": "17.4 Viaggi passati e Vacanze", "ru": "17.4 Прошлые путешествия и отпуск", "el": "17.4 Παρελθοντικά ταξίδια και διακοπές"},
             {"en": "I can describe a holiday trip I took in the past.", "fr": "Je peux décrire un voyage ou des vacances passées.", "it": "Posso descrivere un viaggio o una vacanza passata.", "ru": "Я могу рассказывать о поездке или отпуске в прошлом.", "el": "Μπορώ να περιγράψω ένα ταξίδι ή διακοπές στο παρελθόν."},
             ["travel", "holiday", "hotel", "beach", "city", "country", "flight", "visit"],
             ["Where did you go on holiday?", "I traveled to France", "We stayed in a hotel", "It was a fantastic trip"],
             "what-does-this-word-mean"),
            ("m17-l05-life-events-and-personal-milestones", 5,
             {"en": "17.5 Life Events & Personal Milestones", "fr": "17.5 Événements de la vie & Étapes clés", "it": "17.5 Eventi della vita e Tappe personali", "ru": "17.5 Жизненные события и важные этапы", "el": "17.5 Γεγονότα ζωής και σημαντικοί σταθμοί"},
             {"en": "I can speak about major life milestones like moving, finishing school, or starting a job.", "fr": "Je peux parler des grandes étapes de la vie (déménagement, fin d'études, début d'emploi).", "it": "Posso parlare di tappe importanti (trasferimento, fine studi, nuovo lavoro).", "ru": "Я могу говорить о главных этапах жизни (переезд, учеба, новая работа).", "el": "Μπορώ να μιλήσω για σημαντικούς σταθμούς της ζωής (μετακόμιση, σπουδές, εργασία)."},
             ["born", "move", "start", "finish", "study", "job", "change", "year"],
             ["I was born in...", "In 2020 I moved to...", "I started a new job", "When did you finish school?"],
             "i-have-a-question"),
            ("m17-l06-past-experiences-capstone", 6,
             {"en": "17.6 Past Experiences Portfolio Capstone", "fr": "17.6 Bilan : Expériences passées", "it": "17.6 Sintesi: Esperienze passate", "ru": "17.6 Итоговый урок: Прошлый опыт", "el": "17.6 Ανακεφαλαίωση: Παρελθοντικές εμπειρίες"},
             {"en": "I can give a short talk summarizing an important past experience.", "fr": "Je peux faire un court exposé résumant une expérience passée importante.", "it": "Posso fare una breve presentazione su un'importante esperienza passata.", "ru": "Я могу сделать короткий рассказ о важном событии из прошлого.", "el": "Μπορώ να παρουσιάσω μια σύντομη ανακεφαλαίωση μιας σημαντικής εμπειρίας."},
             ["past", "experience", "memory", "trip", "event", "story", "life", "year"],
             ["I want to share a story", "Last year I visited...", "It was a great experience", "In the end everything was fine"],
             "i-have-a-question")
        ]
    },
    # Module 18
    {
        "modNum": 18, "code": "M18", "unit": 18,
        "label": {"en": "FUTURE PLANS & DREAMS", "fr": "PROJETS FUTURS & RÊVES", "it": "PROGETTI FUTURI E SOGNI", "ru": "ПЛАНЫ НА БУДУЩЕЕ И МЕЧТЫ", "el": "ΜΕΛΛΟΝΤΙΚΑ ΣΧΕΔΙΑ ΚΑΙ ΟΝΕΙΡΑ"},
        "title": {"en": "MODULE 18. FUTURE PLANS & DREAMS", "fr": "MODULE 18. PROJETS FUTURS & RÊVES", "it": "MODULE 18. PROGETTI FUTURI E SOGNI", "ru": "MODULE 18. ПЛАНЫ НА БУДУЩЕЕ И МЕЧТЫ", "el": "MODULE 18. ΜΕΛΛΟΝΤΙΚΑ ΣΧΕΔΙΑ ΚΑΙ ΟΝΕΙΡΑ"},
        "arc": {"en": "Immediate future intentions, personal goals, career ambitions, future travel, simple predictions and capstone roadmap", "fr": "Intentions immédiates, objectifs personnels, ambitions, voyages futurs, prédictions simples et feuille de route", "it": "Intenzioni immediate, obiettivi personali, ambizioni lavorative, viaggi futuri, previsioni semplici e mappa del futuro", "ru": "Планы на ближайшее будущее, личные цели, карьера, будущие поездки, простые прогнозы и карта будущего", "el": "Άμεσες προθέσεις, προσωπικοί στόχοι, επαγγελματικές φιλοδοξίες, μελλοντικά ταξίδια, προβλέψεις και χάρτης μέλλοντος"},
        "lessons": [
            ("m18-l01-immediate-future-and-personal-plans", 1,
             {"en": "18.1 Immediate Future & Personal Plans", "fr": "18.1 Futur immédiat & Projets personnels", "it": "18.1 Futuro immediato e Progetti personali", "ru": "18.1 Ближайшее будущее и личные планы", "el": "18.1 Άμεσο μέλλον και προσωπικά σχέδια"},
             {"en": "I can state what I am going to do tomorrow or next week.", "fr": "Je peux dire ce que je vais faire demain ou la semaine prochaine.", "it": "Posso dire cosa farò domani o la prossima settimana.", "ru": "Я могу говорить о том, что собираюсь делать завтра или на следующей неделе.", "el": "Μπορώ να πω τι πρόκειται να κάνω αύριο ή την επόμενη εβδομάδα."},
             ["tomorrow", "next", "week", "plan", "visit", "study", "travel", "meet"],
             ["What are you going to do tomorrow?", "I am going to visit my family", "Next week I plan to...", "I am going to rest"],
             "i-have-a-question"),
            ("m18-l02-dreams-and-personal-goals", 2,
             {"en": "18.2 Dreams & Personal Goals", "fr": "18.2 Rêves & Objectifs personnels", "it": "18.2 Sogni e Obiettivi personali", "ru": "18.2 Мечты и личные цели", "el": "18.2 Όνειρα και προσωπικοί στόχοι"},
             {"en": "I can talk about my dreams, hopes, and self-improvement goals.", "fr": "Je peux parler de mes rêves, espoirs et objectifs personnels.", "it": "Posso parlare dei miei sogni, speranze e obiettivi personali.", "ru": "Я могу говорить о своих мечтах, надеждах и личных целях.", "el": "Μπορώ να μιλήσω για τα όνειρά μου, τις ελπίδες και τους προσωπικούς μου στόχους."},
             ["dream", "goal", "hope", "want", "learn", "improve", "future", "language"],
             ["My goal is to learn...", "I want to improve my English", "I hope to travel more", "In the future I want to..."],
             "i-have-a-question"),
            ("m18-l03-career-and-education-plans", 3,
             {"en": "18.3 Career & Education Plans", "fr": "18.3 Projets professionnels & Études", "it": "18.3 Progetti di carriera ed Istruzione", "ru": "18.3 Картера и планы на учебу", "el": "18.3 Καριέρα και εκπαιδευτικά σχέδια"},
             {"en": "I can express future intentions regarding work and studies.", "fr": "Je peux exprimer des intentions futures concernant le travail et les études.", "it": "Posso esprimere intenzioni future sul lavoro e gli studi.", "ru": "Я могу выражать намерения относительно будущей работы и учебы.", "el": "Μπορώ να εκφράσω μελλοντικές προθέσεις σχετικά με την εργασία και τις σπουδές."},
             ["career", "job", "study", "course", "work", "skill", "future", "learn"],
             ["I want to work as...", "I am going to take a language course", "My career goal is...", "In two years I will..."],
             "i-have-a-question"),
            ("m18-l04-future-travel-and-holiday-plans", 4,
             {"en": "18.4 Future Travel & Holiday Plans", "fr": "18.4 Voyages futurs & Projets de vacances", "it": "18.4 Viaggi futuri e Progetti di vacanza", "ru": "18.4 Будущие путешествия и отпуск", "el": "18.4 Μελλοντικά ταξίδια και διακοπές"},
             {"en": "I can discuss future travel destinations and holiday intentions.", "fr": "Je peux discuter de destinations de voyage et projets de vacances.", "it": "Posso parlare di destinazioni di viaggio e progetti di vacanza.", "ru": "Я могу обсуждать будущие направления для поездок и планы на отпуск.", "el": "Μπορώ να συζητήσω για μελλοντικούς προορισμούς και διακοπές."},
             ["travel", "holiday", "country", "city", "visit", "summer", "ticket", "hotel"],
             ["Where are you going for holiday?", "I plan to visit Italy", "We are going to book tickets", "I would love to go to..."],
             "what-does-this-word-mean"),
            ("m18-l05-simple-predictions-and-opinions", 5,
             {"en": "18.5 Simple Predictions & Opinions About Future", "fr": "18.5 Prédictions simples & Opinions sur l'avenir", "it": "18.5 Semplici previsioni ed Opinioni sul futuro", "ru": "18.5 Простые прогнозы и мнение о будущем", "el": "18.5 Απλές προβλέψεις και γνώμες για το μέλλον"},
             {"en": "I can make simple predictions about cities, technology, or weather in the future.", "fr": "Je peux faire de simples prédictions sur les villes, la technologie ou le climat.", "it": "Posso fare semplici previsioni su città, tecnologia o clima nel futuro.", "ru": "Я могу делать простые прогнозы о городах, технологиях или погоде в будущем.", "el": "Μπορώ να κάνω απλές προβλέψεις για πόλεις, τεχνολογία ή καιρό στο μέλλον."},
             ["future", "think", "world", "city", "technology", "change", "environment", "life"],
             ["I think cities will be green", "Technology will change our lives", "I believe that...", "In ten years..."],
             "i-have-a-question"),
            ("m18-l06-future-plans-and-dreams-capstone", 6,
             {"en": "18.6 Future Plans & Dreams Capstone", "fr": "18.6 Bilan : Projets futurs & Feuille de route", "it": "18.6 Sintesi: Progetti futuri e Mappa del futuro", "ru": "18.6 Итоговый урок: Карта будущего", "el": "18.6 Ανακεφαλαίωση: Μελλοντικά σχέδια"},
             {"en": "I can present a personal roadmap detailing my short-term and long-term future goals.", "fr": "Je peux présenter une feuille de route personnelle détaillant mes objectifs à court et long terme.", "it": "Posso presentare una mappa personale con i miei obiettivi a breve e lungo termine.", "ru": "Я могу представить личную карту целей на ближайшее и отдаленное будущее.", "el": "Μπορώ να παρουσιάσω έναν προσωπικό χάρτη με τους μελλοντικούς μου στόχους."},
             ["future", "plan", "goal", "dream", "walk", "hope", "project", "work"],
             ["My roadmap for the future", "First I am going to...", "Then I want to...", "My ultimate goal is..."],
             "i-have-a-question")
        ]
    },
    # Module 19
    {
        "modNum": 19, "code": "M19", "unit": 19,
        "label": {"en": "COMPARING MY WORLD", "fr": "COMPARER MON MONDE", "it": "CONFRONTARE IL MIO MONDO", "ru": "СРАВНЕНИЕ ОКРУЖАЮЩЕГО МИРА", "el": "ΣΥΓΚΡΙΣΗ ΤΟΥ ΚΟΣΜΟΥ ΜΟΥ"},
        "title": {"en": "MODULE 19. COMPARING MY WORLD", "fr": "MODULE 19. COMPARER MON MONDE", "it": "MODULE 19. CONFRONTARE IL MIO MONDO", "ru": "MODULE 19. СРАВНЕНИЕ ОКРУЖАЮЩЕГО МИРА", "el": "MODULE 19. ΣΥΓΚΡΙΣΗ ΤΟΥ ΚΟΣΜΟΥ ΜΟΥ"},
        "arc": {"en": "Comparing objects, people, places, lifestyles, preferences, recommendations and comparative capstone", "fr": "Comparer les objets, personnes, lieux, modes de vie, préférences, recommandations et bilan", "it": "Confrontare oggetti, persone, luoghi, stili di vita, preferenze, raccomandazioni e sintesi", "ru": "Сравнение предметов, людей, мест, образа жизни, предпочтения, рекомендации и итоговый проект", "el": "Σύγκριση αντικειμένων, ανθρώπων, μερών, τρόπων ζωής, προτιμήσεων, συστάσεων και ανακεφαλαίωση"},
        "lessons": [
            ("m19-l01-comparing-people-and-physical-objects", 1,
             {"en": "19.1 Comparing People & Physical Objects", "fr": "19.1 Comparer personnes & Objets physiques", "it": "19.1 Confrontare persone ed Oggetti fisici", "ru": "19.1 Сравнение людей и предметов", "el": "19.1 Σύγκριση ανθρώπων και αντικειμένων"},
             {"en": "I can compare two people or objects using simple comparative words.", "fr": "Je peux comparer deux personnes ou objets avec des comparatifs simples.", "it": "Posso confrontare due persone o oggetti usando semplici comparativi.", "ru": "Я могу сравнивать двух людей или предметы, используя слова сравнения.", "el": "Μπορώ να συγκρίνω δύο ανθρώπους ή αντικείμενα χρησιμοποιώντας απλές συγκρίσεις."},
             ["big", "small", "fast", "slow", "cheap", "expensive", "tall", "short"],
             ["This phone is bigger than that one", "A car is faster than a bike", "Which one is cheaper?", "He is taller than me"],
             "how-much-does-this-cost"),
            ("m19-l02-comparing-places-and-cities", 2,
             {"en": "19.2 Comparing Places & Cities", "fr": "19.2 Comparer villes & Lieux", "it": "19.2 Confrontare città e Luoghi", "ru": "19.2 Сравнение городов и мест", "el": "19.2 Σύγκριση πόλεων και μερών"},
             {"en": "I can compare life in different cities, towns, or countries.", "fr": "Je peux comparer la vie dans différentes villes, villages ou pays.", "it": "Posso confrontare la vita in diverse città, paesi o nazioni.", "ru": "Я могу сравнивать жизнь в разных городах, поселках или странах.", "el": "Μπορώ να συγκρίνω τη ζωή σε διαφορετικές πόλεις ή χώρες."},
             ["city", "village", "quiet", "noisy", "modern", "old", "clean", "large"],
             ["My city is larger than...", "Life in a village is quieter", "Which city is more modern?", "It is cleaner here"],
             "what-does-this-word-mean"),
            ("m19-l03-comparing-lifestyles-and-habits", 3,
             {"en": "19.3 Comparing Lifestyles & Habits", "fr": "19.3 Comparer modes de vie & Habitudes", "it": "19.3 Confrontare stili di vita ed Abitudini", "ru": "19.3 Сравнение образа жизни и привычек", "el": "19.3 Σύγκριση τρόπου ζωής και συνηθειών"},
             {"en": "I can compare modern vs traditional lifestyles and daily habits.", "fr": "Je peux comparer les modes de vie modernes et traditionnels.", "it": "Posso confrontare stili di vita moderni e tradizionali.", "ru": "Я могу сравнивать современный и традиционный образ жизни и привычки.", "el": "Μπορώ να συγκρίνω τον σύγχρονο και τον παραδοσιακό τρόπο ζωής."},
             ["lifestyle", "routine", "busy", "relaxed", "healthy", "active", "habit", "work"],
             ["A healthy lifestyle is better", "My routine is busier now", "Working online is more comfortable", "Life was simpler"],
             "i-have-a-question"),
            ("m19-l04-likes-dislikes-and-preferences", 4,
             {"en": "19.4 Likes, Dislikes & Preferences", "fr": "19.4 Goûts, Dégoûts & Préférences", "it": "19.4 Gusti, Disgusti e Preferenze", "ru": "19.4 Предпочтения и выбор", "el": "19.4 Προτιμήσεις και επιλογές"},
             {"en": "I can express preferences and choose between different options.", "fr": "Je peux exprimer des préférences et choisir entre différentes options.", "it": "Posso esprimere preferenze e scegliere tra diverse opzioni.", "ru": "Я могу выражать предпочтения и делать выбор между вариантами.", "el": "Μπορώ να εκφράσω προτιμήσεις και να επιλέξω ανάμεσα σε επιλογές."},
             ["prefer", "like", "better", "favorite", "choice", "option", "enjoy", "rather"],
             ["I prefer tea to coffee", "Which option do you like better?", "This place is better for me", "I would rather choose..."],
             "i-have-a-question"),
            ("m19-l05-making-choices-and-recommendations", 5,
             {"en": "19.5 Making Choices & Recommendations", "fr": "19.5 Faire des choix & Recommandations", "it": "19.5 Fare scelte e Raccomandazioni", "ru": "19.5 Выбор и рекомендации", "el": "19.5 Επιλογές και συστάσεις"},
             {"en": "I can recommend an option to someone based on a comparison.", "fr": "Je peux recommander une option à quelqu'un sur la base d'une comparaison.", "it": "Posso raccomandare un'opzione a qualcuno in base a un confronto.", "ru": "Я могу рекомендовать вариант на основе сравнения.", "el": "Μπορώ να συστήσω μια επιλογή σε κάποιον με βάση τη σύγκριση."},
             ["choose", "recommend", "best", "reason", "advantage", "suitable", "opinion", "decide"],
             ["I recommend this product because...", "The main advantage is...", "Which is the best choice?", "You should choose this one"],
             "i-have-a-question"),
            ("m19-l06-comparing-my-world-capstone", 6,
             {"en": "19.6 Comparing My World Capstone", "fr": "19.6 Bilan : Comparer mon monde", "it": "19.6 Sintesi: Confrontare il mio mondo", "ru": "19.6 Итоговый урок: Сравнение моего мира", "el": "19.6 Ανακεφαλαίωση: Σύγκριση του κόσμου μου"},
             {"en": "I can give a comparative presentation comparing two products, places, or ways of living.", "fr": "Je peux faire une présentation comparative de deux produits, lieux ou modes de vie.", "it": "Posso fare una presentazione comparativa di due prodotti, luoghi o stili di vita.", "ru": "Я могу выступить с презентацией-сравнением двух товаров, мест или способов жизни.", "el": "Μπορώ να παρουσιάσω μια σύγκριση δύο προϊόντων, μερών ή τρόπων ζωής."},
             ["comparison", "opinion", "preference", "better", "worse", "advantage", "summary", "choice"],
             ["Today I am comparing two places", "X is better than Y because...", "In summary I prefer...", "The best option is..."],
             "i-have-a-question")
        ]
    },
    # Module 20
    {
        "modNum": 20, "code": "M20", "unit": 20,
        "label": {"en": "BASIC OPINIONS & SOCIAL INTERACTION", "fr": "OPINIONS DE BASE & INTERACTIONS", "it": "OPINIONI DI BASE ED INTERAZIONE SOCIALE", "ru": "МНЕНИЯ И СОЦИАЛЬНОЕ ВЗАИМОДЕЙСТВИЕ", "el": "ΒΑΣΙΚΕΣ ΓΝΩΜΕΣ ΚΑΙ ΚΟΙΝΩΝΙΚΗ ΑΛΛΗΛΕΠΙΔΡΑΣΗ"},
        "title": {"en": "MODULE 20. BASIC OPINIONS & SOCIAL INTERACTION", "fr": "MODULE 20. OPINIONS DE BASE & INTERACTIONS", "it": "MODULE 20. OPINIONS DI BASE ED INTERAZIONE SOCIALE", "ru": "MODULE 20. МНЕНИЯ И СОЦИАЛЬНОЕ ВЗАИМОДЕЙСТВИЕ", "el": "MODULE 20. ΒΑΣΙΚΕΣ ΓΝΩΜΕΣ ΚΑΙ ΚΟΙΝΩΝΙΚΗ ΑΛΛΗΛΕΠΙΔΡΑΣΗ"},
        "arc": {"en": "Giving opinions, polite agreement/disagreement, handling everyday problems, giving advice, polite requests and capstone survey", "fr": "Donner son avis, accord/désaccord poli, gérer les problèmes quotidiens, conseils, requêtes polies et bilan", "it": "Esprimere opinioni, accordo/disaccordo cortese, gestire problemi quotidiani, consigli, richieste cortesi e sintesi", "ru": "Выражение мнения, вежливое согласие/несогласие, решение бытовых проблем, советы, просьбы и итоговый опрос", "el": "Έκφραση γνώμης, ευγενική συμφωνία/διαφωνία, αντιμετώπιση καθημερινών προβλημάτων, συμβουλές, ευγενικά αιτήματα και ανακεφαλαίωση"},
        "lessons": [
            ("m20-l01-expressing-simple-opinions", 1,
             {"en": "20.1 Expressing Simple Opinions", "fr": "20.1 Exprimer des opinions simples", "it": "20.1 Esprimere semplici opinioni", "ru": "20.1 Выражение простого мнения", "el": "20.1 Έκφραση απλών γνωμών"},
             {"en": "I can state my opinion clearly on everyday topics and ask others for theirs.", "fr": "Je peux exprimer clairement mon avis sur des sujets quotidiens.", "it": "Posso esprimere chiaramente la mia opinione su argomenti quotidiani.", "ru": "Я могу четко выражать свое мнение по повседневным темам.", "el": "Μπορώ να εκφράσω τη γνώμη μου για καθημερινά θέματα."},
             ["think", "believe", "opinion", "good", "bad", "interesting", "boring", "important"],
             ["In my opinion...", "I think that...", "What do you think about...?", "I believe it is important"],
             "i-have-a-question"),
            ("m20-l02-agreeing-and-disagreeing-politely", 2,
             {"en": "20.2 Agreeing & Disagreeing Politely", "fr": "20.2 Exprimer l'accord & le désaccord poli", "it": "20.2 Esprimere accordo e disaccordo con cortesia", "ru": "20.2 Вежливое согласие и несогласие", "el": "20.2 Ευγενική συμφωνία και διαφωνία"},
             {"en": "I can show agreement or polite disagreement during a simple discussion.", "fr": "Je peux exprimer un accord ou un désaccord poli pendant une discussion.", "it": "Posso mostrare accordo o disaccordo cortese durante una discussione.", "ru": "Я могу выражать согласие или вежливое несогласие в беседе.", "el": "Μπορώ να δείξω συμφωνία ή ευγενική διαφωνία σε μια συζήτηση."},
             ["agree", "disagree", "right", "wrong", "true", "point", "sure", "respect"],
             ["I agree with you", "I see your point, but...", "I am not sure about that", "You are right!"],
             "i-have-a-question"),
            ("m20-l03-expressing-problems-and-seeking-help", 3,
             {"en": "20.3 Expressing Problems & Seeking Help", "fr": "20.3 Expliquer un problème & Demander de l'aide", "it": "20.3 Spiegare un problema e Chiedere aiuto", "ru": "20.3 Выражение проблемы и просьба о помощи", "el": "20.3 Έκφραση προβλημάτων και ζήτηση βοήθειας"},
             {"en": "I can describe everyday problems (lost, broken, late) and ask for assistance.", "fr": "Je peux décrire des problèmes quotidiens (perdu, cassé, en retard) et demander de l'aide.", "it": "Posso descrivere problemi quotidiani (perso, rotto, in ritardo) e chiedere aiuto.", "ru": "Я могу описывать бытовые проблемы (потерял, сломал, опоздал) и просить о помощи.", "el": "Μπορώ να περιγράψω καθημερινά προβλήματα και να ζητήσω βοήθεια."},
             ["problem", "broken", "lost", "late", "wrong", "help", "fix", "issue"],
             ["I have a problem", "My phone is broken", "I am lost", "Could you help me, please?"],
             "i-have-a-question"),
            ("m20-l04-giving-advice-and-simple-solutions", 4,
             {"en": "20.4 Giving Advice & Simple Solutions", "fr": "20.4 Donner des conseils & Solutions simples", "it": "20.4 Dare consigli e Soluzioni semplici", "ru": "20.4 Советы и простые решения", "el": "20.4 Παροχή συμβουλών και απλές λύσεις"},
             {"en": "I can offer simple advice or practical suggestions for common issues.", "fr": "Je peux offrir de simples conseils ou suggestions pratiques pour des problèmes courants.", "it": "Posso offrire semplici consigli o suggerimenti pratici per problemi comuni.", "ru": "Я могу давать простые советы и предложения по решению проблем.", "el": "Μπορώ να προσφέρω απλές συμβουλές για κοινά θέματα."},
             ["should", "advice", "try", "solution", "change", "check", "fix", "idea"],
             ["You should call the technician", "Why do you not try...?", "The best solution is...", "You can check online"],
             "i-have-a-question"),
            ("m20-l05-polite-requests-and-permission", 5,
             {"en": "20.5 Polite Requests & Permission", "fr": "20.5 Requêtes polies & Demandes de permission", "it": "20.5 Richieste cortesi e Permessi", "ru": "20.5 Вежливые просьбы и разрешение", "el": "20.5 Ευγενικά αιτήματα και άδεια"},
             {"en": "I can make polite requests and ask for permission in public contexts.", "fr": "Je peux faire des demandes polies et demander la permission dans des lieux publics.", "it": "Posso fare richieste cortesi e chiedere il permesso in contesti pubblici.", "ru": "Я могу формулировать вежливые просьбы и спрашивать разрешение в общественных местах.", "el": "Μπορώ να κάνω ευγενικά αιτήματα και να ζητήσω άδεια."},
             ["could", "please", "polite", "mind", "borrow", "use", "help", "permission"],
             ["Could you please help me?", "Would you mind if I open the window?", "May I ask a question?", "Can I borrow a pen?"],
             "i-have-a-question"),
            ("m20-l06-social-interaction-capstone", 6,
             {"en": "20.6 Social Interaction & Opinion Survey Capstone", "fr": "20.6 Bilan : Interactions sociales & Enquête d'opinion", "it": "20.6 Sintesi: Interazione sociale e Sondaggio d'opinione", "ru": "20.6 Итоговый урок: Опрос и социальное взаимодействие", "el": "20.6 Ανακεφαλαίωση: Κοινωνική αλληλεπίδραση"},
             {"en": "I can conduct a simple opinion survey and resolve a practical problem scenario in a roleplay.", "fr": "Je peux mener une simple enquête d'opinion et résoudre un problème pratique.", "it": "Posso condurre un semplice sondaggio d'opinione e risolvere un problema pratico.", "ru": "Я могу провести простой опрос мнений и решить бытовую ситуацию в игре.", "el": "Μπορώ να διεξάγω μια απλή έρευνα γνώμης και να λύσω ένα πρόβλημα."},
             ["survey", "opinion", "problem", "solution", "agreement", "discussion", "request", "summary"],
             ["We conducted a survey on...", "Most people agreed that...", "When faced with a problem...", "Our recommendation is..."],
             "i-have-a-question")
        ]
    },
    # Module 21
    {
        "modNum": 21, "code": "M21", "unit": 21,
        "label": {"en": "FINAL A1 SURVIVAL SKILLS", "fr": "COMPÉTENCES D'URGENCE A1", "it": "COMPETENZE DI SOPRAVVIVENZA A1", "ru": "НАВЫКИ ВЫЖИВАНИЯ A1", "el": "ΒΑΣΙΚΕΣ ΔΕΞΙΟΤΗΤΕΣ ΕΠΙΒΙΩΣΗΣ A1"},
        "title": {"en": "MODULE 21. FINAL A1 SURVIVAL SKILLS", "fr": "MODULE 21. COMPÉTENCES D'URGENCE A1", "it": "MODULE 21. COMPETENZE DI SOPRAVVIVENZA A1", "ru": "MODULE 21. НАВЫКИ ВЫЖИВАНИЯ A1", "el": "MODULE 21. ΒΑΣΙΚΕΣ ΔΕΞΙΟΤΗΤΕΣ ΕΠΙΒΙΩΣΗΣ A1"},
        "arc": {"en": "Airport navigation, hotel check-in, medical emergencies, lost property, survival strategies and real-world roleplay capstone", "fr": "Aéroport, hôtel, urgences médicales, objets perdus, stratégies de survie et mise en situation réelle", "it": "Aeroporto, hotel, emergenze mediche, oggetti smarriti, strategie di sopravvivenza e simulazione reale", "ru": "Аэропорт, отель, медицинская помощь, потерянные вещи, стратегии общения и итоговая ролевая игра", "el": "Αεροδρόμιο, ξενοδοχείο, ιατρική φροντίδα, χαμένα αντικείμενα, στρατηγικές επιβίωσης και προσομοίωση"},
        "lessons": [
            ("m21-l01-at-the-airport-and-train-station", 1,
             {"en": "21.1 At the Airport & Train Station", "fr": "21.1 À l'aéroport & à la gare", "it": "21.1 All'aeroporto e alla stazione", "ru": "21.1 В аэропорту и на вокзале", "el": "21.1 Στο αεροδρόμιο και το σταθμό"},
             {"en": "I can navigate transit hubs, understand gate announcements, and check in baggage.", "fr": "Je peux me repérer dans un aéroport/une gare, comprendre les annonces et enregistrer mes bagages.", "it": "Posso orientarmi in aeroporto/stazione, capire gli annunci ed effettuare il check-in.", "ru": "Я могу ориентироваться в аэропорту и на вокзале, понимать объявления и сдавать багаж.", "el": "Μπορώ να προσανατολιστώ στο αεροδρόμιο, να καταλάβω ανακοινώσεις και να κάνω check-in."},
             ["airport", "flight", "gate", "passport", "ticket", "luggage", "departure", "arrival"],
             ["Where is gate 5?", "Here is my passport", "When does the train leave?", "Is this the line for check-in?"],
             "what-does-this-word-mean"),
            ("m21-l02-at-the-hotel-and-accommodation", 2,
             {"en": "21.2 At the Hotel & Accommodation", "fr": "21.2 À l'hôtel & Hébergement", "it": "21.2 In hotel e Alloggio", "ru": "21.2 В отеле и жилье", "el": "21.2 Στο ξενοδοχείο και κατάλυμα"},
             {"en": "I can check in at a hotel, ask about amenities, and report room issues.", "fr": "Je peux faire le check-in à l'hôtel, me renseigner sur les services et signaler un problème.", "it": "Posso fare il check-in in hotel, chiedere informazioni sui servizi e segnalare problemi.", "ru": "Я могу заселяться в отель, спрашивать об услугах и сообщать о неполадках в номере.", "el": "Μπορώ να κάνω check-in στο ξενοδοχείο, να ρωτήσω για παροχές και να αναφέρω προβλήματα."},
             ["hotel", "room", "key", "reservation", "breakfast", "wifi", "towel", "reception"],
             ["I have a reservation", "What is the WiFi password?", "What time is breakfast?", "The room key is not working"],
             "what-does-this-word-mean"),
            ("m21-l03-medical-emergencies-and-pharmacy", 3,
             {"en": "21.3 Medical Emergencies & Pharmacy", "fr": "21.3 Urgences médicales & Pharmacie", "it": "21.3 Emergenze mediche e Farmacia", "ru": "21.3 Медицинская помощь и аптека", "el": "21.3 Ιατρικά περιστατικά και φαρμακείο"},
             {"en": "I can communicate urgent health needs, buy medicine, and ask for a doctor.", "fr": "Je peux communiquer un besoin de santé urgent, acheter des médicaments et demander un médecin.", "it": "Posso comunicare un'emergenza medica, comprare farmaci e chiedere di un medico.", "ru": "Я могу сообщать о срочных проблемах со здоровьем, покупать лекарства и вызывать врача.", "el": "Μπορώ να αναφέρω επείγοντα θέματα υγείας, να αγοράσω φάρμακα και να ζητήσω γιατρό."},
             ["doctor", "hospital", "emergency", "medicine", "pain", "fever", "pharmacy", "help"],
             ["I need a doctor!", "I feel sick", "Where is the nearest pharmacy?", "Please call an ambulance"],
             "what-does-this-word-mean"),
            ("m21-l04-lost-property-and-police-services", 4,
             {"en": "21.4 Lost Property & Police Services", "fr": "21.4 Objets perdus & Services de police", "it": "21.4 Oggetti smarriti e Servizi di polizia", "ru": "21.4 Потерянные вещи и полиция", "el": "21.4 Απώλεια αντικειμένων και αστυνομία"},
             {"en": "I can report lost or stolen belongings to police or information desks.", "fr": "Je peux signaler des objets perdus ou volés à la police ou au bureau d'information.", "it": "Posso segnalare oggetti smarriti o rubati alla polizia o all'ufficio informazioni.", "ru": "Я могу сообщать об утерянных или украденных вещах в полицию или стойку информации.", "el": "Μπορώ να αναφέρω χαμένα ή κλεμμένα αντικείμενα στην αστυνομία."},
             ["lost", "stolen", "wallet", "phone", "bag", "police", "report", "passport"],
             ["I lost my passport", "My bag was stolen", "Where is the police station?", "I want to report a lost wallet"],
             "what-does-this-word-mean"),
            ("m21-l05-communication-breakdown-and-coping", 5,
             {"en": "21.5 Communication Breakdown & Survival Strategies", "fr": "21.5 Difficultés de communication & Stratégies de survie", "it": "21.5 Difficoltà di comunicazione e Strategie", "ru": "21.5 Понимание в сложных ситуациях и стратегии", "el": "21.5 Δυσκολίες επικοινωνίας και στρατηγικές"},
             {"en": "I can use clarification strategies when I do not understand or need repetition.", "fr": "Je peux utiliser des stratégies de clarification quand je ne comprends pas.", "it": "Posso usare strategie di chiarimento quando non capisco.", "ru": "Я могу использовать фразы уточнения, когда что-то не понял.", "el": "Μπορώ να χρησιμοποιήσω στρατηγικές διευκρίνισης όταν δεν καταλαβαίνω."},
             ["repeat", "slow", "understand", "mean", "speak", "write", "spell", "clear"],
             ["Could you speak more slowly?", "I do not understand", "Could you write it down?", "What does this word mean?"],
             "what-does-this-word-mean"),
            ("m21-l06-survival-skills-capstone", 6,
             {"en": "21.6 Survival Skills Real-World Roleplay Capstone", "fr": "21.6 Bilan : Mise en situation de survie en voyage", "it": "21.6 Sintesi: Simulazione reale di sopravvivenza", "ru": "21.6 Итоговый урок: Ситуация реального общения в поездке", "el": "21.6 Ανακεφαλαίωση: Προσομοίωση επιβίωσης"},
             {"en": "I can navigate a multi-stage real-world travel survival simulation.", "fr": "Je peux réussir une simulation complète de voyage (aéroport, hôtel, imprévus).", "it": "Posso gestire una simulazione completa di viaggio (aeroporto, hotel, imprevisti).", "ru": "Я могу успешно проходить комплексные ситуации в поездке (аэропорт, отель, форс-мажор).", "el": "Μπορώ να αντεπεξέλθω σε μια ολοκληρωμένη προσομοίωση ταξιδιού."},
             ["travel", "situation", "help", "direction", "emergency", "scenario", "solution", "plan"],
             ["I am ready for travel", "Excuse me, I need help", "Everything is clear now", "Thank you for your assistance"],
             "what-does-this-word-mean")
        ]
    },
    # Module 22
    {
        "modNum": 22, "code": "M22", "unit": 22,
        "label": {"en": "A1 INTEGRATED PROJECTS", "fr": "PROJETS INTÉGRÉS A1", "it": "PROGETTI INTEGRATI A1", "ru": "ИТОГОВЫЕ ПРОЕКТЫ A1", "el": "ΟΛΟΚΛΗΡΩΜΕΝΑ ΕΡΓΑ A1"},
        "title": {"en": "MODULE 22. A1 INTEGRATED PROJECTS", "fr": "MODULE 22. PROJETS INTÉGRÉS A1", "it": "MODULE 22. PROGETTI INTEGRATI A1", "ru": "MODULE 22. ИТОГОВЫЕ ПРОЕКТЫ A1", "el": "MODULE 22. ΟΛΟΚΛΗΡΩΜΕΝΑ ΕΡΓΑ A1"},
        "arc": {"en": "Comprehensive portfolio projects integrating profile, daily routine, home guide, past/future timeline, opinions and final A1 showcase", "fr": "Projets de portfolio intégrant profil, routine, logement, parcours passé/futur, opinions et présentation finale A1", "it": "Progetti di portfolio che integrano profilo, routine, guida della casa, percorso passato/futuro, opinioni e presentazione finale A1", "ru": "Комплексные проекты портфолио: профиль, день, дом, жизненный путь, мнения и итоговая презентация A1", "el": "Ολοκληρωμένα έργα χαρτοφυλακίου: προφίλ, καθημερινότητα, οδηγός σπιτιού, παρελθόν/μέλλον, γνώμες και τελική παρουσίαση A1"},
        "lessons": [
            ("m22-l01-project-1-my-profile", 1,
             {"en": "22.1 Project 1. My Personal & Professional Profile", "fr": "22.1 Projet 1. Mon profil personnel & professionnel", "it": "22.1 Progetto 1. Il mio profilo personale e professionale", "ru": "22.1 Проект 1. Мой личный и профессиональный профиль", "el": "22.1 Έργο 1. Το προσωπικό και επαγγελματικό μου προφίλ"},
             {"en": "I can create a complete personal and professional profile sheet.", "fr": "Je peux créer une fiche de profil personnel et professionnel complète.", "it": "Posso creare una scheda completa del mio profilo personale e professionale.", "ru": "Я могу составлять полный личный и профессиональный профиль.", "el": "Μπορώ να δημιουργήσω ένα πλήρες προσωπικό και επαγγελματικό προφίλ."},
             ["profile", "identity", "profession", "language", "nationality", "summary", "person", "contact"],
             ["My name is...", "I work as...", "I speak two languages", "In my free time I..."],
             "i-have-a-question"),
            ("m22-l02-project-2-my-perfect-day", 2,
             {"en": "22.2 Project 2. My Daily Routine & Perfect Day", "fr": "22.2 Projet 2. Ma routine & Ma journée idéale", "it": "22.2 Progetto 2. La mia routine e la mia giornata ideale", "ru": "22.2 Проект 2. Мой распорядок и идеальный день", "el": "22.2 Έργο 2. Η καθημερινότητα και η ιδανική μου μέρα"},
             {"en": "I can present a narrative comparing my normal daily routine with my ideal day.", "fr": "Je peux présenter un récit comparant ma routine quotidienne et ma journée idéale.", "it": "Posso presentare un racconto che confronta la mia routine e la mia giornata ideale.", "ru": "Я могу рассказать историю, сравнивая свой обычный распорядок дня с идеальным днем.", "el": "Μπορώ να παρουσιάσω μια σύγκριση της καθημερινότητάς μου με την ιδανική μέρα."},
             ["routine", "morning", "evening", "schedule", "day", "hobby", "relax", "work"],
             ["On a normal day I start at...", "In my perfect day I would...", "First I wake up early", "Finally I relax with a book"],
             "what-time-is-it"),
            ("m22-l03-project-3-my-home-and-neighborhood-guide", 3,
             {"en": "22.3 Project 3. My Home & Neighborhood Guide", "fr": "22.3 Projet 3. Guide de mon logement & de mon quartier", "it": "22.3 Progetto 3. Guida della mia casa e del mio quartiere", "ru": "22.3 Проект 3. Путеводитель по моему дому и району", "el": "22.3 Έργο 3. Οδηγός για το σπίτι και τη γειτονιά μου"},
             {"en": "I can create a descriptive guide about my home, neighborhood, and local services.", "fr": "Je peux créer un guide descriptif de mon logement, quartier et services locaux.", "it": "Posso creare una guida descrittiva della mia casa, quartiere e servizi locali.", "ru": "Я могу создавать путеводитель с описанием дома, района и услуг поблизости.", "el": "Μπορώ να δημιουργήσω έναν οδηγό για το σπίτι, τη γειτονιά και τις υπηρεσίες της."},
             ["home", "neighborhood", "shop", "park", "transport", "guide", "quiet", "friendly"],
             ["Welcome to my neighborhood", "Near my house there is a park", "The best place to visit is...", "To get there turn right"],
             "what-does-this-word-mean"),
            ("m22-l04-project-4-my-past-and-future", 4,
             {"en": "22.4 Project 4. My Life Journey: Past & Future", "fr": "22.4 Projet 4. Mon parcours : Passé & Avenir", "it": "22.4 Progetto 4. Il mio percorso: Passato e Futuro", "ru": "22.4 Проект 4. Мой жизненный путь: прошлое и будущее", "el": "22.4 Έργο 4. Η πορεία μου: Παρελθόν και Μέλλον"},
             {"en": "I can create a personal timeline combining past life experiences with future goals.", "fr": "Je peux créer une frise chronologique combinant mes expériences passées et futurs objectifs.", "it": "Posso creare una linea del tempo personale che unisce esperienze passate e obiettivi futuri.", "ru": "Я могу составлять хронологическую ленту жизни, объединяя прошлый опыт и будущие цели.", "el": "Μπορώ να δημιουργήσω μια προσωπική χρονογραμμή με παρελθοντικές εμπειρίες και μελλοντικούς στόχους."},
             ["plan", "past", "future", "milestone", "memory", "goal", "year", "time"],
             ["In the past I lived in...", "A key moment was...", "In the future I plan to...", "My goal for next year is..."],
             "i-have-a-question"),
            ("m22-l05-project-5-my-world-and-perspectives", 5,
             {"en": "22.5 Project 5. My Opinions & Cultural Perspectives", "fr": "22.5 Projet 5. Mes opinions & Perspectives culturelles", "it": "22.5 Progetto 5. Le mie opinioni e Prospettive culturali", "ru": "22.5 Проект 5. Мои мнения и культурные взгляды", "el": "22.5 Έργο 5. Οι γνώμες και οι πολιτιστικές μου απόψεις"},
             {"en": "I can present a portfolio section expressing my opinions and cultural preferences.", "fr": "Je peux présenter une section de portfolio exprimant mes opinions et préférences culturelles.", "it": "Posso presentare una sezione del portfolio con le mie opinioni e preferenze culturali.", "ru": "Я могу презентовать раздел портфолио со своими мнениями и культурными предпочтениями.", "el": "Μπορώ να παρουσιάσω μια ενότητα χαρτοφυλακίου με τις γνώμες και πολιτιστικές προτιμήσεις μου."},
             ["opinion", "preference", "culture", "choice", "favorite", "recommendation", "world", "summary"],
             ["In my view...", "I prefer this because...", "My favorite cultural event is...", "I recommend exploring..."],
             "i-have-a-question"),
            ("m22-l06-final-a1-capstone-showcase", 6,
             {"en": "22.6 Final A1 Capstone Showcase & Self-Assessment", "fr": "22.6 Bilan final : Présentation du portfolio A1 & Auto-évaluation", "it": "22.6 Sintesi finale: Presentazione del portfolio A1 ed Valutazione", "ru": "22.6 Итоговый выпускной урок: Презентация портфолио A1 и самооценка", "el": "22.6 Τελική ανακεφαλαίωση: Παρουσίαση A1 και αυτοαξιολόγηση"},
             {"en": "I can showcase my complete A1 portfolio and perform a self-assessment against A1 can-do goals.", "fr": "Je peux présenter mon portfolio A1 complet et réaliser une auto-évaluation des objectifs A1.", "it": "Posso presentare il mio portfolio A1 completo e fare un'autovalutazione degli obiettivi A1.", "ru": "Я могу презентовать свое полное портфолио уровня A1 и провести самооценку своих навыков.", "el": "Μπορώ να παρουσιάσω το πλήρες χαρτοφυλάκιό μου A1 και να αξιολογήσω την πρόοδό μου."},
             ["course", "present", "progress", "skill", "summary", "test", "achievement", "success"],
             ["I can now communicate in basic situations", "My main achievement is...", "I am confident in my A1 skills", "Ready for Level A2!"],
             "i-have-a-question")
        ]
    }
]

GRAMMAR_MAP = {
    6: {
        "en": ["How much is / How much are...?", "Payment prepositions (by card, in cash)"],
        "fr": ["Combien coûte / coûtent...?", "Prépositions de paiement (par carte, en espèces)"],
        "it": ["Quanto costa / costano...?", "Preposizioni di pagamento (con carta, in contanti)"],
        "ru": ["Сколько стоит / стоят...?", "Предлоги и падежи при оплате (картой, наличными)"],
        "el": ["Πόσο κάνει / κάνουν...;", "Προθέσεις πληρωμής (με κάρτα, με μετρητά)"]
    },
    7: {
        "en": ["Demonstratives (this/that/these/those)", "Adjective order & color agreement"],
        "fr": ["Démonstratifs (ce/cette/ces)", "Accord des adjectifs de couleur et taille"],
        "it": ["Dimostrativi (questo/quella/questi)", "Accordo degli aggettivi di colore e taglia"],
        "ru": ["Указательные местоимения (этот/эта/эти)", "Согласование прилагательных в роде и числе"],
        "el": ["Δεικτικές αντωνυμίες (αυτός/αυτή/αυτό)", "Συμφωνία επιθέτων σε γένος και αριθμό"]
    },
    8: {
        "en": ["Expressing pain with 'have got' / 'feel'", "Imperatives for health advice"],
        "fr": ["Avoir mal à + article contracté", "Impératif pour conseils de santé"],
        "it": ["Avere male a + articolo", "Imperativo per consigli di salute"],
        "ru": ["Конструкции со словом 'болит / болят'", "Повелительное наклонение и советы"],
        "el": ["Εκφράσεις 'πονάει / πονάνε'", "Προστακτική για συμβουλές υγείας"]
    },
    9: {
        "en": ["Present Simple for work routines", "Prepositions of place for workplaces (at/in)"],
        "fr": ["Présent pour la routine professionnelle", "Prépositions de lieu (chez, dans, à)"],
        "it": ["Presente per routine lavorative", "Preposizioni di luogo (in, a, da)"],
        "ru": ["Настоящее время для работы и учебы", "Предложный падеж места работы (в/на)"],
        "el": ["Ενεστώτας για εργασιακή routine", "Προθέσεις τόπου εργασίας (σε, στο, στη)"]
    },
    10: {
        "en": ["Can / Can't for language ability", "Adverbs of manner (well, fluently)"],
        "fr": ["Savoir / Pouvoir pour compétences linguistiques", "Adverbes (bien, couramment)"],
        "it": ["Sapere / Potere per abilità linguistiche", "Avverbi (bene, correntemente)"],
        "ru": ["Модальные глаголы умения (уметь, говорить по-...)", "Наречия стиля речи (хорошо, свободно)"],
        "el": ["Μπορώ / Ξέρω για γλωσσικές ικανότητες", "Επιρρήματα (καλά, πταίστα)"]
    },
    11: {
        "en": ["Prepositions of transport (by bus, on foot)", "Imperatives for directions"],
        "fr": ["Prépositions de transport (en bus, à pied)", "Impératif pour directions"],
        "it": ["Preposizioni di trasporto (in autobus, a piedi)", "Imperativo per indicazioni"],
        "ru": ["Творительный падеж транспорта (на автобусе, пешком)", "Повелительное наклонение для маршрута"],
        "el": ["Προθέσεις μεταφοράς (με λεωφορείο, με τα πόδια)", "Προστακτική για κατευθύνσεις"]
    },
    12: {
        "en": ["There is / There are for places in town", "Prepositions of place (next to, opposite)"],
        "fr": ["Il y a pour les lieux en ville", "Prépositions de lieu (à côté de, en face de)"],
        "it": ["C'è / Ci sono per luoghi in città", "Preposizioni di luogo (vicino a, di fronte a)"],
        "ru": ["Конструкция 'Здесь есть / Находятся'", "Предложный падеж расположения в городе"],
        "el": ["Υπάρχει / Υπάρχουν για μέρη στην πόλη", "Προθέσεις τόπου (δίπλα σε, απέναντι από)"]
    },
    13: {
        "en": ["It is + weather adjective", "Present Continuous for weather right now"],
        "fr": ["Il fait + adjectif météo / Il pleut", "Présent pour la météo actuelle"],
        "it": ["Fa + adjectivo meteo / Piove", "Presente per tempo atmosferico"],
        "ru": ["Безличные предложения (сегодня тепло / идет дождь)", "Настоящее время для погоды"],
        "el": ["Κάνει + επίθετο καιρού / Βρέχει", "Ενεστώτας για τον καιρό"]
    },
    14: {
        "en": ["Like / Love / Hate + -ing", "Frequency adverbs (always, sometimes, never)"],
        "fr": ["Aimer / Adorer / Détester + infinitif", "Adverbes de fréquence (toujours, parfois)"],
        "it": ["Piacere + infinito / nome", "Avverbi di frequenza (sempre, a volte)"],
        "ru": ["Глаголы предпочтений (любить / нравиться + инфинитив)", "Наречия частоты (всегда, иногда)"],
        "el": ["Μου αρέσει / Αγαπώ + απαρέμφατο/ουσιαστικό", "Επιρρήματα συχνότητας (πάντα, καμιά φορά)"]
    },
    15: {
        "en": ["Imperatives for tech instructions", "Present Simple for daily tech habits"],
        "fr": ["Impératif pour instructions techniques", "Présent pour habitudes numériques"],
        "it": ["Imperativo per istruzioni tecnologiche", "Presente per abitudini digitali"],
        "ru": ["Повелительное наклонение для инструкций", "Настоящее время для цифровых привычек"],
        "el": ["Προστακτική για οδηγίες τεχνολογίας", "Ενεστώτας για ψηφιακές συνήθειες"]
    },
    16: {
        "en": ["Would like to + verb for invitations", "Let's + verb for social plans"],
        "fr": ["Vouloir / Pouvoir pour inviter", "Formules d'invitation et de fête"],
        "it": ["Vorrei / Vorresti per invitare", "Formule di invito e festeggiamenti"],
        "ru": ["Глаголы приглашения и поздравления", "Винительный падеж существительных (подарок, праздник)"],
        "el": ["Ρήματα πρόσκλησης & Ευχές", "Αιτιατική πτώση ουσιαστικών (δώρο, πάρτι)"]
    },
    17: {
        "en": ["Past Simple (regular & irregular verbs)", "Time expressions (yesterday, last, ago)"],
        "fr": ["Passé composé avec avoir et être", "Marqueurs temporels (hier, la semaine dernière)"],
        "it": ["Passato prossimo con essere e avere", "Espressioni di tempo (ieri, la settimana scorsa)"],
        "ru": ["Прошедшее время глаголов (совершенный/несовершенный вид)", "Предложный падеж времени и места"],
        "el": ["Αόριστος χρόνος (παρελθόν)", "Χρονικές εκφράσεις (χθες, την προηγούμενη εβδομάδα)"]
    },
    18: {
        "en": ["Be going to for future plans", "Want to + verb / Will for predictions"],
        "fr": ["Futur proche (aller + infinitif)", "Espérer / Vouloir + infinitif"],
        "it": ["Futuro semplice ed espressioni di intenzione", "Volere + infinito / Stare per"],
        "ru": ["Будущее время глаголов (буду делать / сделаю)", "Конструкции намерений (я хочу, я планирую)"],
        "el": ["Εξακολουθητικός & Συνοπτικός Μέλλοντας (θα κάνω)", "Εκφράσεις πρόθεσης (θέλω να, σκοπεύω να)"]
    },
    19: {
        "en": ["Comparative adjectives (-er than, more ... than)", "Connectors (and, but, because)"],
        "fr": ["Comparatifs (plus ... que, moins ... que, aussi ... que)", "Accord des adjectifs"],
        "it": ["Comparativi (più di/che, meno di/che)", "Accordo degli aggettivi"],
        "ru": ["Сравнительная степень прилагательных (-ее, более ... чем)", "Согласование прилагательных"],
        "el": ["Συγκριτικός βαθμός επιθέτων (-ότερος, πιο ... από)", "Συμφωνία γένους και πτώσης επιθέτων"]
    },
    20: {
        "en": ["Opinion structures (I think, I believe)", "Modal verbs Can / Could / Should for polite requests & advice"],
        "fr": ["Je pense que / À mon avis", "Conditionnel de politesse (Pourriez-vous, Je voudrais)"],
        "it": ["Secondo me / Penso che", "Verbi modali (Potrebbe, Dovresti) per cortesia e consigli"],
        "ru": ["Конструкции мнения (я думаю, по-моему)", "Модальные слова (нужно, следует, можно) и вежливые просьбы"],
        "el": ["Εκφράσεις γνώμης (νομίζω ότι, κατά τη γνώμη μου)", "Ευγενικά ρήματα & συμβουλές (μπορείτε να, πρέπει να)"]
    },
    21: {
        "en": ["Imperatives & Polite requests", "Question words (Where, When, How much)"],
        "fr": ["Impératif & Formules de politesse", "Interrogation avec Où, Quand, Combien"],
        "it": ["Imperativo e forme di cortesia", "Domande con Dove, Quando, Quanto"],
        "ru": ["Повелительное наклонение и вежливые формулы", "Вопросительные слова (где, когда, сколько)"],
        "el": ["Προστακτική & Ευγενικοί τύποι", "Ερωτηματικές λέξεις (πού, πότε, πόσο)"]
    },
    22: {
        "en": ["Present Simple & Past Simple review", "Future plans with Be going to", "Comparatives & Opinion structures"],
        "fr": ["Synthèse du présent, passé composé et futur proche", "Connecteurs logiques (parce que, mais, donc)"],
        "it": ["Revisione del presente, passato prossimo e futuro", "Connettivi (perché, ma, quindi)"],
        "ru": ["Сводное повторение прошедшего, настоящего и будущего времени", "Падежные формы в связном тексте"],
        "el": ["Επανάλυψη Ενεστώτα, Αορίστου και Μέλλοντα", "Σύνδεσμοι (επειδή, αλλά, γι' αυτό)"]
    }
}

def build_slides(slug, title, cando, vocab, chunks, lang, mod_num, les_num):
    return [
        {
            "id": f"{slug}-slide-1",
            "title": "1. Communication Goal & Overview",
            "stage": "warm-up",
            "duration": 50,
            "mode": "all",
            "teacherNotes": [
                {"type": "instruction", "title": "Lesson Metadata", "content": f"Level: A1 | Language: {lang.upper()} | Duration: 60 / 90 / 120 min"},
                {"type": "instruction", "title": "Communication Goal", "content": cando},
                {"type": "speech", "content": f"Welcome to Lesson {mod_num}.{les_num}! Today's goal: {cando}"}
            ],
            "elements": [
                {"type": "instruction", "content": f"Communication Goal: {cando}"},
                {"type": "blockquote", "content": f"Lesson Overview:\n- Level: A1 General\n- Topic: {title}\n- Goal: {cando}"}
            ]
        },
        {
            "id": f"{slug}-slide-2",
            "title": "2. Recycling & Continuity",
            "stage": "recycling",
            "duration": 50,
            "mode": "all",
            "teacherNotes": [
                {"type": "instruction", "title": "Recycling from Prior Lesson", "content": f"Reuses key vocabulary and grammar structures from Module {mod_num} prior lesson."},
                {"type": "instruction", "title": "Preparation for Next Lesson", "content": f"Sets up communicative structures for Lesson {mod_num}.{les_num + 1}."}
            ],
            "elements": [
                {"type": "instruction", "content": "Recycling & Continuity:"},
                {"type": "blockquote", "content": f"Prior Lesson Recycling: Reuses core elements from prior lesson.\n\nNext Lesson Preparation: Prepares key phrases for upcoming lesson."}
            ]
        },
        {
            "id": f"{slug}-slide-3",
            "title": "3. Vocabulary & Essential Chunks",
            "stage": "input",
            "duration": 50,
            "mode": "all",
            "teacherNotes": [
                {"type": "instruction", "title": "Vocab Progression", "content": "1. Recognition -> 2. Pronunciation -> 3. Classification -> 4. Controlled Production -> 5. Personalised Use"},
                {"type": "instruction", "title": "Core Words", "content": ", ".join(vocab)}
            ],
            "elements": [
                {"type": "instruction", "content": "Core Active Vocabulary (10-20 items):"},
                {"type": "blockquote", "content": ", ".join(vocab)},
                {"type": "instruction", "content": "Essential Chunks & Functional Collocations:"},
                {"type": "blockquote", "content": "\n".join([f"• {c}" for c in chunks])}
            ]
        },
        {
            "id": f"{slug}-slide-4",
            "title": "4. Pronunciation Focus",
            "stage": "pronunciation",
            "duration": 50,
            "mode": "all",
            "teacherNotes": [
                {"type": "instruction", "title": "Phonetic Aim", "content": f"Focus on target pronunciation, stress and intonation in {title}."}
            ],
            "elements": [
                {"type": "instruction", "content": "Pronunciation & Intonation Focus:"},
                {"type": "blockquote", "content": f"Focus on accurate stress and sentence rhythm for: {', '.join(vocab[:5])}."}
            ]
        },
        {
            "id": f"{slug}-slide-5",
            "title": "5. Grammar Focus & Controlled Practice",
            "stage": "grammar",
            "duration": 50,
            "mode": "all",
            "teacherNotes": [
                {"type": "instruction", "title": "Function-First Grammar Rule", "content": f"Grammar Focus for {title}: Functional target language structures."}
            ],
            "elements": [
                {"type": "instruction", "content": "Grammar System & Functional Framing:"},
                {"type": "blockquote", "content": f"Functional grammar rule applying target chunks in {lang.upper()}."},
                {"type": "instruction", "content": "Controlled Practice Exercise:"},
                {"type": "test", "content": f"Choose the correct response for: {chunks[0]}", "options": [chunks[0], chunks[1], "Incorrect distractor"], "answers": [chunks[0]]}
            ]
        },
        {
            "id": f"{slug}-slide-6",
            "title": "6. Four Skills Distribution (Listening & Reading)",
            "stage": "reading-listening",
            "duration": 50,
            "mode": "all",
            "teacherNotes": [
                {"type": "instruction", "title": "Skills Focus", "content": "Listening (~10%) + Reading (~10%)"}
            ],
            "elements": [
                {"type": "instruction", "content": "Short Reading Script & Dialogue:"},
                {"type": "blockquote", "content": f"Contextual dialogue:\nPerson A: {chunks[0]}\nPerson B: {chunks[1]}"},
                {"type": "instruction", "content": "Listening Comprehension Task: Listen to prompt and confirm key details."}
            ]
        },
        {
            "id": f"{slug}-slide-7",
            "title": "7. Speaking & Writing Production",
            "stage": "freer-practice",
            "duration": 50,
            "mode": "all",
            "teacherNotes": [
                {"type": "instruction", "title": "Speaking Aim (~70%)", "content": "Pair work, roleplay, and personalised production."}
            ],
            "elements": [
                {"type": "instruction", "content": "Communicative Speaking Task:"},
                {"type": "blockquote", "content": f"Pair Roleplay & Real Communication. Can-do outcome: {cando}"},
                {"type": "instruction", "content": "Guided Writing Task (~10%): Write 4-5 sentences applying today's grammar and vocabulary."}
            ]
        },
        {
            "id": f"{slug}-slide-8",
            "title": "8. Multi-Duration Lesson Flows",
            "stage": "adaptation",
            "duration": 50,
            "mode": "all",
            "teacherNotes": [
                {"type": "instruction", "title": "Multi-Duration Strategy", "content": "Select 60m, 90m, or 120m flow based on lesson duration."}
            ],
            "elements": [
                {"type": "instruction", "content": "Timestamped Multi-Duration Flows:"},
                {"type": "blockquote", "content": "• 60 min Flow (Essential): 0-10m Warm-up; 10-25m Vocab; 25-40m Grammar; 40-55m Speaking; 55-60m HW.\n• 90 min Flow (Expanded): 0-10m Warm-up; 10-30m Vocab Drills; 30-50m Grammar; 50-70m Roleplays; 70-85m Writing/Reading; 85-90m Summary.\n• 120 min Flow (Full Workshop): 0-15m Warm-up; 15-40m Vocab Lab; 40-70m Grammar Clinic; 70-100m Simulation; 100-115m Writing; 115-120m Wrap-up."}
            ]
        },
        {
            "id": f"{slug}-slide-9",
            "title": "9. Delivery Adaptations",
            "stage": "adaptation",
            "duration": 50,
            "mode": "all",
            "teacherNotes": [
                {"type": "instruction", "title": "Individual Adaptation", "content": "1-on-1 repetition, tailored feedback, instructor roleplay."},
                {"type": "instruction", "title": "Group Adaptation", "content": "Pair speed drills, group surveys, mingle activity."}
            ],
            "elements": [
                {"type": "instruction", "content": "Individual Lesson Adaptation:"},
                {"type": "blockquote", "content": "Direct 1-on-1 interaction, customized pacing, targeted pronunciation correction."},
                {"type": "instruction", "content": "Group Lesson Adaptation:"},
                {"type": "blockquote", "content": "Pair dialogues, peer feedback, group survey activity, active class mingle."}
            ]
        },
        {
            "id": f"{slug}-slide-10",
            "title": "10. Homework & Recycling Notes",
            "stage": "cool-down",
            "duration": 50,
            "mode": "all",
            "teacherNotes": [
                {"type": "instruction", "title": "Homework Assignment", "content": f"Write 5 sentences applying today's phrases: {'; '.join(chunks[:3])}."},
                {"type": "instruction", "title": "Recycling into Next Lesson", "content": f"Prepares key phrases for Lesson {mod_num}.{les_num + 1}."}
            ],
            "elements": [
                {"type": "instruction", "content": "Homework Assignment:"},
                {"type": "blockquote", "content": f"Write 5 sentences in your notebook using today's target vocabulary: {'; '.join(chunks[:3])}."},
                {"type": "instruction", "content": "Recycling into Next Lesson:"},
                {"type": "blockquote", "content": f"Prepares key phrases for Lesson {mod_num}.{les_num + 1}."}
            ]
        }
    ]

# Main execution loop
created_count = 0
for lang in LANGUAGES:
    dir_name = LANG_DIR_MAP[lang]
    target_dir = os.path.join("lessons", dir_name)
    os.makedirs(target_dir, exist_ok=True)

    curr_json_path = os.path.join("curriculums", lang, "general", "A1.json")
    curr_data = {"language": lang, "course_type": "general", "level": "A1", "units": []}
    if os.path.exists(curr_json_path):
        with open(curr_json_path, "r", encoding="utf-8") as f:
            curr_data = json.load(f)

    units_map = {u.get("unit"): u for u in curr_data.get("units", [])}

    for mod in MODULE_TEMPLATES:
        mod_num = mod["modNum"]
        mod_title = mod["title"][lang]
        mod_label = mod["label"][lang]
        mod_arc = mod["arc"][lang]
        unit_num = mod["unit"]

        unit_lessons = []

        for slug, les_num, titles, cando_dict, vocab_list, chunks_list, comm_key in mod["lessons"]:
            title = titles[lang]
            cando = cando_dict[lang]
            code = f"{mod['code']}-L0{les_num}"

            lesson_obj = {
                "id": slug,
                "title": title,
                "level": "A1",
                "language": lang,
                "defaultDuration": 50,
                "defaultMode": "all",
                "objectives": [
                    cando,
                    f"communicate effectively using Module {mod_num} target language"
                ],
                "links": {
                    "vocabulary": vocab_list,
                    "grammar": [
                        {
                            "topic_id": "to-be",
                            "manual_url": MANUAL_URL
                        }
                    ],
                    "communication": [
                        comm_key
                    ],
                    "phonetics": f"{lang}-pron-a1-01"
                },
                "slides": build_slides(slug, title, cando, vocab_list, chunks_list, lang, mod_num, les_num)
            }

            lesson_file_path = os.path.join(target_dir, f"{slug}.json")
            with open(lesson_file_path, "w", encoding="utf-8") as f:
                json.dump(lesson_obj, f, ensure_ascii=False, indent=2)
            created_count += 1

            unit_lessons.append({
                "code": code,
                "lesson": les_num,
                "num": les_num,
                "title": title,
                "grammar": GRAMMAR_MAP.get(mod_num, {}).get(lang, ["Grammar focus & practice"]),
                "speaking": cando,
                "listening": f"Audio dialogue for {title}",
                "reading": f"Short text for {title}",
                "writing": f"Write 5 sentences for {title}",
                "task": f"Roleplay practice for {title}",
                "vocab": vocab_list[:5],
                "hw": f"Homework practice for {title}",
                "cando": cando,
                "teacher_notes": f"code: \"{code}\"\ncando: \"{cando}\"",
                "recycled": f"Module {mod_num} progression"
            })

        units_map[unit_num] = {
            "unit": unit_num,
            "num": unit_num,
            "id": f"u{unit_num}",
            "label": mod_label,
            "title": mod_title,
            "color": f"#{unit_num*10:02x}{unit_num*20:02x}F6",
            "arc": mod_arc,
            "lessons_count": len(unit_lessons),
            "lessons": unit_lessons
        }

    # Ensure all units (including 1-5) have complete metadata and lesson codes
    for u_k in sorted(units_map.keys()):
        u = units_map[u_k]
        u_num = u.get("unit", u.get("num", u_k))
        u["unit"] = u_num
        u["num"] = u_num
        u["id"] = f"u{u_num}"
        if not u.get("label"):
            u["label"] = u.get("title", f"MODULE {u_num}").replace(f"MODULE {u_num}. ", "")
        if not u.get("color"):
            u["color"] = f"#{u_num*10:02x}{u_num*20:02x}F6"
        for idx, l in enumerate(u.get("lessons", [])):
            l_num = l.get("lesson", l.get("num", idx + 1))
            l["lesson"] = l_num
            l["num"] = l_num
            if not l.get("code"):
                l["code"] = f"M{u_num:02d}-L{l_num:02d}"

    sorted_units = [units_map[k] for k in sorted(units_map.keys())]
    curr_data["units"] = sorted_units

    with open(curr_json_path, "w", encoding="utf-8") as f:
        json.dump(curr_data, f, ensure_ascii=False, indent=2)

    curr_js_path = os.path.join("curriculums", lang, "general", "A1.js")
    js_content = f"window.COSY_CURRICULUM_A1 = {json.dumps(curr_data, ensure_ascii=False, indent=2)};\n"
    with open(curr_js_path, "w", encoding="utf-8") as f:
        f.write(js_content)

print(f"Successfully generated {created_count} lesson files and updated curriculum JSON/JS files across all 5 languages.")
